import { validationResult } from "express-validator";
// Express-validator middleware (for course messages and other express-validator routes)
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
    }
    next();
};
// Joi validation middleware (for backward compatibility with existing routes)
export const validateJoiRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errorMessage,
            });
        }
        req.body = value;
        next();
    };
};
