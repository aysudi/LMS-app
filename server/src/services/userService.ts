import User from "../models/userModel";
import {
  RegisterUserDto,
  LoginUserDto,
  IUser,
  AuthResponse,
  UserProfileDto,
} from "../types/user.types";
import formatMongoData from "../utils/formatMongoData";
import { JWTUtils } from "../utils/jwt.utils";
import {
  createUserProfile,
  comparePassword,
  hashPassword,
} from "../utils/user.utils";
import {
  generateVerificationToken,
  generatePasswordResetToken,
  hashToken,
} from "../utils/token.utils";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
} from "../utils/sendMail";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const checkAndUnlockAccount = async (user: any): Promise<void> => {
  if (user.lockUntil && user.lockUntil <= new Date()) {
    await User.findByIdAndUpdate(user._id, {
      $unset: { lockUntil: 1 },
      loginAttempts: 0,
    });
  }
};

const getRemainingLockTime = (lockUntil: Date): number => {
  return Math.ceil((lockUntil.getTime() - Date.now()) / (1000 * 60));
};

export const register = async (
  userData: RegisterUserDto,
  avatarUrl?: string
): Promise<{ message: string; user: UserProfileDto }> => {
  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { username: userData.username }],
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  const verificationToken = generateVerificationToken();
  const hashedVerificationToken = hashToken(verificationToken);
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const userDataWithAvatar = {
    ...userData,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: verificationExpires,
    ...(avatarUrl && { avatar: avatarUrl }),
  };

  const user = await User.create(userDataWithAvatar);

  try {
    await sendVerificationEmail(user.email, user.firstName, verificationToken);
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }

  const userProfile = createUserProfile(user);

  return {
    message:
      "Registration successful! Please check your email to verify your account.",
    user: formatMongoData(userProfile),
  };
};

// Email verification function
export const verifyEmail = async (
  token: string
): Promise<{
  message: string;
  user: UserProfileDto;
  token: string;
  refreshToken: string;
}> => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token");
  }

  await User.findByIdAndUpdate(user._id, {
    isEmailVerified: true,
    $unset: {
      emailVerificationToken: 1,
      emailVerificationExpires: 1,
    },
  });

  const updatedUser = await User.findById(user._id);
  const userProfile = createUserProfile(updatedUser);

  const { accessToken, refreshToken } = JWTUtils.generateTokens(
    updatedUser as any
  );

  return {
    message: "Email verified successfully! You are now logged in.",
    user: formatMongoData(userProfile),
    token: accessToken,
    refreshToken,
  };
};

// Resend verification email
export const resendVerificationEmail = async (
  email: string
): Promise<{ message: string }> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified");
  }

  const verificationToken = generateVerificationToken();
  const hashedVerificationToken = hashToken(verificationToken);
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(user._id, {
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: verificationExpires,
  });

  try {
    await sendVerificationEmail(user.email, user.firstName, verificationToken);
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    throw new Error(
      "Failed to send verification email. Please try again later."
    );
  }

  return {
    message: "Verification email sent successfully. Please check your email.",
  };
};

export const login = async (loginData: LoginUserDto): Promise<AuthResponse> => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select("+password +loginAttempts");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new Error("Please verify your email address before logging in");
  }

  if (!user.isActive) {
    throw new Error("Account has been deactivated. Please contact support.");
  }

  await checkAndUnlockAccount(user);

  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingTime = getRemainingLockTime(user.lockUntil);
    throw new Error(
      `Account is temporarily locked due to too many failed login attempts. Try again in ${remainingTime} minutes.`
    );
  }

  if (user.authProvider === "google") {
    throw new Error(
      "This account was created with Google. Please sign in with Google."
    );
  } else if (user.authProvider === "github") {
    throw new Error(
      "This account was created with GitHub. Please sign in with GitHub."
    );
  }

  if (!user.password) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    const currentAttempts = (user.loginAttempts || 0) + 1;
    const updateData: any = { loginAttempts: currentAttempts };

    if (currentAttempts >= MAX_ATTEMPTS) {
      updateData.lockUntil = new Date(Date.now() + LOCK_TIME);
      updateData.loginAttempts = 0;

      await User.findByIdAndUpdate(user._id, updateData);

      const lockTimeMinutes = Math.ceil(LOCK_TIME / (1000 * 60));
      throw new Error(
        `Too many failed login attempts. Account locked for ${lockTimeMinutes} minutes.`
      );
    } else {
      await User.findByIdAndUpdate(user._id, updateData);

      const remainingAttempts = MAX_ATTEMPTS - currentAttempts;
      throw new Error(
        `Invalid email or password. ${remainingAttempts} attempt${
          remainingAttempts === 1 ? "" : "s"
        } remaining before account lockout.`
      );
    }
  }

  const updateData: any = {
    lastLoginAt: new Date(),
    loginAttempts: 0,
    $unset: { lockUntil: 1 },
  };

  await User.findByIdAndUpdate(user._id, updateData);

  const userProfile = createUserProfile(user);

  const { accessToken, refreshToken } = JWTUtils.generateTokens(user as any);

  return {
    user: formatMongoData(userProfile),
    token: accessToken,
    refreshToken,
  };
};

export const unlockUserAccount = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.lockUntil) {
    return {
      success: true,
      message: "Account is not locked",
    };
  }

  await User.findByIdAndUpdate(user._id, {
    $unset: { lockUntil: 1 },
    loginAttempts: 0,
  });

  return {
    success: true,
    message: "Account unlocked successfully",
  };
};

export const getUserAccountStatus = async (email: string) => {
  const user = await User.findOne({ email }).select("+loginAttempts");

  if (!user) {
    throw new Error("User not found");
  }

  const isLocked = user.lockUntil && user.lockUntil > new Date();
  const remainingTime = isLocked ? getRemainingLockTime(user.lockUntil!) : 0;

  return {
    email: user.email,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    isLocked,
    lockUntil: user.lockUntil,
    remainingLockTimeMinutes: remainingTime,
    loginAttempts: user.loginAttempts || 0,
    maxAttempts: MAX_ATTEMPTS,
    lastLoginAt: user.lastLoginAt,
  };
};

// Forgot password function
export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      message:
        "If an account with that email exists, we've sent a password reset link.",
    };
  }

  if (!user.isEmailVerified) {
    throw new Error(
      "Please verify your email address first before resetting password."
    );
  }

  if (user.authProvider !== "local") {
    throw new Error(
      `This account was created with ${user.authProvider}. Please sign in with ${user.authProvider}.`
    );
  }

  const resetToken = generatePasswordResetToken();
  const hashedResetToken = hashToken(resetToken);
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: hashedResetToken,
    passwordResetExpires: resetExpires,
  });

  try {
    await sendForgotPasswordEmail(user.email, user.firstName, resetToken);
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
    throw new Error(
      "Failed to send password reset email. Please try again later."
    );
  }

  return {
    message:
      "If an account with that email exists, we've sent a password reset link.",
  };
};

// Reset password function
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired password reset token");
  }

  const hashedPassword = await hashPassword(newPassword);

  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    loginAttempts: 0,
    $unset: {
      passwordResetToken: 1,
      passwordResetExpires: 1,
      lockUntil: 1,
    },
  });

  return {
    message:
      "Password reset successful! You can now login with your new password.",
  };
};
