import * as Yup from "yup";

// Forgot password validation schema
export const forgotPasswordValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

// Reset password validation schema
export const resetPasswordValidationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password cannot exceed 128 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

// Change password validation schema
export const changePasswordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .min(6, "Current password must be at least 6 characters")
    .required("Current password is required"),

  newPassword: Yup.string()
    .min(6, "New password must be at least 6 characters")
    .max(128, "New password cannot exceed 128 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .notOneOf(
      [Yup.ref("currentPassword")],
      "New password must be different from current password"
    )
    .required("New password is required"),

  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

// Email verification resend validation schema
export const resendVerificationValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

// Common password validation for reuse
export const passwordValidation = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password cannot exceed 128 characters")
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// Common email validation for reuse
export const emailValidation = Yup.string()
  .email("Please enter a valid email address")
  .required("Email is required");

// Two-factor authentication validation schema
export const twoFactorValidationSchema = Yup.object({
  code: Yup.string()
    .matches(/^\d{6}$/, "Please enter a valid 6-digit code")
    .required("Verification code is required"),
});

// Account recovery validation schema
export const accountRecoveryValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  backupCode: Yup.string()
    .min(8, "Backup code must be at least 8 characters")
    .required("Backup code is required"),
});
