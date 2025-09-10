import jwt from "jsonwebtoken";
export class JWTUtils {
    static ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "your-access-secret-key";
    static REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
    static ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
    static REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    static generateAccessToken(user) {
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };
        const options = {
            expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
            issuer: "skillify",
            audience: "skillify-users",
        };
        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, options);
    }
    static generateRefreshToken(user) {
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };
        const options = {
            expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
            issuer: "skillify",
            audience: "skillify-users",
        };
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
    }
    static verifyAccessToken(token) {
        return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
            issuer: "skillify",
            audience: "skillify-users",
        });
    }
    static verifyRefreshToken(token) {
        return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
            issuer: "skillify",
            audience: "skillify-users",
        });
    }
    static generateTokens(user) {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
        };
    }
}
