// Middleware to process lesson data from FormData
export const processLessonData = (req, res, next) => {
    try {
        // If there's a data field (from FormData), parse it and merge with req.body
        if (req.body.data) {
            try {
                const parsedData = JSON.parse(req.body.data);
                // Merge parsed data with existing body (keeping uploadedFiles)
                req.body = { ...parsedData, uploadedFiles: req.body.uploadedFiles };
            }
            catch (error) {
                console.error("Error parsing lesson data:", error);
                return res.status(400).json({
                    success: false,
                    message: "Invalid lesson data format",
                    error: error.message,
                });
            }
        }
        // Parse quiz data if it's a JSON string
        if (req.body.quiz && typeof req.body.quiz === "string") {
            try {
                req.body.quiz = JSON.parse(req.body.quiz);
            }
            catch (error) {
                console.error("Error parsing quiz data:", error);
                req.body.quiz = [];
            }
        }
        // Convert boolean strings to actual booleans
        const booleanFields = ["isPreview"];
        booleanFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                req.body[field] =
                    req.body[field] === "true" || req.body[field] === true;
            }
        });
        // Convert numeric strings to numbers
        const numericFields = ["duration", "order"];
        numericFields.forEach((field) => {
            if (req.body[field] !== undefined && req.body[field] !== "") {
                req.body[field] = parseFloat(req.body[field]) || 0;
            }
        });
        next();
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error processing lesson data",
            error: error.message,
        });
    }
};
export default { processLessonData };
