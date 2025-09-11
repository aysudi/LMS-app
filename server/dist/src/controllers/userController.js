import { register, login, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, } from "../services/userService";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../middlewares/upload.middleware";
export const registerUser = async (req, res, next) => {
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
        let avatarUrl;
        if (req.file) {
            try {
                const filename = `${Date.now()}_${req.file.originalname}`;
                avatarUrl = await uploadToCloudinary(req.file.buffer, filename);
            }
            catch (uploadError) {
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
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Registration failed",
        });
    }
};
export const loginUser = async (req, res, next) => {
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
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(401).json({
            success: false,
            message: error.message || "Login failed",
        });
    }
};
export const verifyEmailController = async (req, res, next) => {
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
    }
    catch (error) {
        console.error("Email verification error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Email verification failed",
        });
    }
};
export const resendVerificationEmailController = async (req, res, next) => {
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
    }
    catch (error) {
        console.error("Resend verification email error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to resend verification email",
        });
    }
};
export const forgotPasswordController = async (req, res, next) => {
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
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to send password reset email",
        });
    }
};
export const resetPasswordController = async (req, res, next) => {
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
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Password reset failed",
        });
    }
};
