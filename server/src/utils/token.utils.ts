import crypto from "crypto";

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export default {
  generateVerificationToken,
  generatePasswordResetToken,
  generateRandomString,
  hashToken,
};
