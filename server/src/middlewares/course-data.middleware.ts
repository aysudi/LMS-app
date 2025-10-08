import { Request, Response, NextFunction } from "express";

// Middleware to process course data from FormData
export const processCourseData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse array fields that come as JSON strings from FormData
    const arrayFields = [
      "tags",
      "learningObjectives",
      "requirements",
      "targetAudience",
      "sections",
    ];

    arrayFields.forEach((field) => {
      if (req.body[field]) {
        try {
          // Parse the JSON string to array
          const parsed = JSON.parse(req.body[field]);
          req.body[field] = Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          console.error(`Error parsing ${field}:`, error);
          // If parsing fails, keep as is or set to empty array
          req.body[field] = [];
        }
      }
    });

    // Convert boolean strings to actual booleans
    const booleanFields = ["isFree", "certificateProvided", "isPublished"];

    booleanFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] = req.body[field] === "true";
      }
    });

    // Convert numeric strings to numbers
    const numericFields = ["originalPrice", "discountPrice"];

    numericFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        req.body[field] = parseFloat(req.body[field]) || 0;
      }
    });

    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Error processing course data",
      error: error.message,
    });
  }
};

export default { processCourseData };
