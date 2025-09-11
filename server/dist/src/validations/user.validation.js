import Joi from "joi";
import { UserRole } from "../types/user.types";
export const registerValidationSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
        "string.min": "First name must be at least 2 characters",
        "string.max": "First name cannot exceed 50 characters",
        "any.required": "First name is required",
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
        "string.min": "Last name must be at least 2 characters",
        "string.max": "Last name cannot exceed 50 characters",
        "any.required": "Last name is required",
    }),
    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username cannot exceed 30 characters",
        "string.pattern.base": "Username can only contain letters, numbers, and underscores",
        "any.required": "Username is required",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password cannot exceed 128 characters",
        "any.required": "Password is required",
    }),
    role: Joi.string()
        .valid(...Object.values(UserRole))
        .optional()
        .default(UserRole.STUDENT)
        .messages({
        "any.only": "Role must be either student, instructor, or admin",
    }),
});
export const loginValidationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
        "any.required": "Password is required",
    }),
});
export const resendVerificationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
});
export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
    }),
});
export const resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
        "any.required": "Reset token is required",
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password cannot exceed 128 characters",
        "any.required": "New password is required",
    }),
});
