export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errorMessage
            });
        }
        req.body = value;
        next();
    };
};
