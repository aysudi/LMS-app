/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
    console.error("Error:", error);
    // Mongoose validation error
    if (error.name === "ValidationError") {
        const validationErrors = {};
        Object.keys(error.errors).forEach((key) => {
            validationErrors[key] = error.errors[key].message;
        });
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationErrors,
        });
        return;
    }
    // Mongoose duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        res.status(409).json({
            success: false,
            message: `${field} already exists`,
            error: "DUPLICATE_ENTRY",
        });
        return;
    }
    // Mongoose cast error (invalid ObjectId)
    if (error.name === "CastError") {
        res.status(400).json({
            success: false,
            message: "Invalid ID format",
            error: "INVALID_ID",
        });
        return;
    }
    // JWT errors
    if (error.name === "JsonWebTokenError") {
        res.status(401).json({
            success: false,
            message: "Invalid token",
            error: "INVALID_TOKEN",
        });
        return;
    }
    if (error.name === "TokenExpiredError") {
        res.status(401).json({
            success: false,
            message: "Token expired",
            error: "TOKEN_EXPIRED",
        });
        return;
    }
    // Default server error
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_SERVER_ERROR",
    });
};
/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: "NOT_FOUND",
    });
};
