import { JWTUtils } from "../utils/jwt.utils.js";
export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Access token is required",
                error: "UNAUTHORIZED",
            });
            return;
        }
        const decoded = JWTUtils.verifyAccessToken(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            id: decoded.userId, // alias for userId
        };
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "TokenExpiredError") {
                res.status(401).json({
                    success: false,
                    message: "Access token has expired",
                    error: "TOKEN_EXPIRED",
                });
                return;
            }
            if (error.name === "JsonWebTokenError") {
                res.status(401).json({
                    success: false,
                    message: "Invalid access token",
                    error: "INVALID_TOKEN",
                });
                return;
            }
        }
        res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: "UNAUTHORIZED",
        });
    }
};
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
                error: "UNAUTHORIZED",
            });
            return;
        }
        const userRole = req.user?.role;
        if (!roles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: "Insufficient permissions",
                error: "FORBIDDEN",
            });
            return;
        }
        next();
    };
};
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (token) {
            try {
                const decoded = JWTUtils.verifyAccessToken(token);
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    role: decoded.role,
                    id: decoded.userId, // alias for userId
                };
            }
            catch (error) {
                // Token is invalid but we don't throw error for optional auth
                // User will be undefined
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
