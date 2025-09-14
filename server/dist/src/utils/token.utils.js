import crypto from "crypto";
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString("hex");
};
export const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString("hex");
};
export const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString("hex");
};
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
export default {
    generateVerificationToken,
    generatePasswordResetToken,
    generateRandomString,
    hashToken,
};
