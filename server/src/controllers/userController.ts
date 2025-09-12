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
} from "../services/userService";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../middlewares/upload.middleware";

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
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh",
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

    // Set refresh token cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      },
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
      data: result,
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
      data: { user },
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
      data: { user },
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
