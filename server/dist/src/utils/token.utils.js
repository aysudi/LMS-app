import crypto from "crypto";
// Generate verification token
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString("hex");
};
// Generate password reset token
export const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString("hex");
};
// Generate random string for various purposes
export const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString("hex");
};
// Hash token for storage (one-way hash)
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
export default {
    generateVerificationToken,
    generatePasswordResetToken,
    generateRandomString,
    hashToken,
};
