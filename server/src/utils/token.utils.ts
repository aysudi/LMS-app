import crypto from "crypto";

// Generate verification token
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate password reset token
export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate random string for various purposes
export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

// Hash token for storage (one-way hash)
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export default {
  generateVerificationToken,
  generatePasswordResetToken,
  generateRandomString,
  hashToken,
};
