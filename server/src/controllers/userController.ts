import { Request, Response, NextFunction } from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  getUserByUsername,
  refreshAccessToken,
  updateUserProfile,
  changeUserPassword,
  updateUserAvatar,
} from "../services/userService";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../middlewares/upload.middleware";
import formatMongoData from "../utils/formatMongoData";
import cloudinary from "../configs/cloudinary.config";

export const getCurrentUserController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data: formatMongoData(user),
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    const statusCode = error.message === "User not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve current user",
    });
  }
};

export const getAllUsersController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = req.validatedQuery || req.query;

    const page = parseInt(queryParams.page as string) || 1;
    const limit = parseInt(queryParams.limit as string) || 10;
    const role = queryParams.role as string;
    const search = queryParams.search as string;

    const result = await getAllUsers(page, limit, role, search);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: formatMongoData(result.users),
    });
  } catch (error: any) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve users",
    });
  }
};

export const getUserByIdController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = req.validatedParams || req.params;
    const { userId } = params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: formatMongoData(user),
    });
  } catch (error: any) {
    console.error("Get user by ID error:", error);
    const statusCode = error.message === "User not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve user",
    });
  }
};

export const getUserByUsernameController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = req.validatedParams || req.params;
    const { username } = params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await getUserByUsername(username);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: formatMongoData(user),
    });
  } catch (error: any) {
    console.error("Get user by username error:", error);
    const statusCode = error.message === "User not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve user",
    });
  }
};

export const registerUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, username, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role,
    };

    let avatarUrl: string | undefined;

    if (req.file) {
      try {
        const filename = `${Date.now()}_${req.file.originalname}`;
        avatarUrl = await uploadToCloudinary(req.file.buffer, filename);
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        res.status(400).json({
          success: false,
          message: "Avatar upload failed",
        });
        return;
      }
    }

    const result = await register(userData, avatarUrl);

    res.status(201).json({
      success: true,
      message: result.message,
      data: { user: result.user },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const result = await login({ email, password });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const result = await verifyEmail(token);

    res.status(200).json({
      success: true,
      message:
        result.message ||
        "Email verified successfully! You can now log in to your account.",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Email verification failed",
    });
  }
};

export const resendVerificationEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Resend verification email error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to resend verification email",
    });
  }
};

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send password reset email",
    });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const result = await resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Password reset failed",
    });
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if cookies exist
    if (!req.cookies) {
      return res.status(401).json({
        success: false,
        message: "No cookies found",
      });
    }

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Token refresh failed",
    });
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// Update user profile
export const updateProfileController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user.userId;
    const updateData = req.body;

    const updatedUser = await updateUserProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// Change password
export const changePasswordController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    await changeUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

// Update user avatar
export const updateAvatarController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload to Cloudinary with new function that returns full result
    const uploadResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "skillify/avatars",
            transformation: [
              { width: 200, height: 200, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(req.file.buffer);
    })) as any;

    const updatedUser = await updateUserAvatar(userId, {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Update avatar error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update avatar",
    });
  }
};
