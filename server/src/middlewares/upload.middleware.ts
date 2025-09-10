import { Request, Response, NextFunction } from "express";
import multer from "multer";
import cloudinary from "../configs/cloudinary.config";

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Function to upload buffer to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "skillify/avatars",
          public_id: filename,
          transformation: [
            { width: 300, height: 300, crop: "thumb", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || "");
          }
        }
      )
      .end(buffer);
  });
};

// Upload middleware for single file
export const uploadMiddleware = upload.single("avatar");

// Upload error handler middleware
export const uploadErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

export default { uploadMiddleware, uploadErrorHandler };
