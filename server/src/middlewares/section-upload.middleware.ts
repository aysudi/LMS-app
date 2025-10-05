import { Request, Response, NextFunction } from "express";
import multer from "multer";
import cloudinary from "../configs/cloudinary.config.js";
import { Buffer } from "buffer";

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Create multer instance for section uploads
const sectionUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for section thumbnail images
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for section thumbnail!"));
      }
    } else {
      cb(new Error("Invalid field name!"));
    }
  },
});

// Function to upload thumbnail to Cloudinary
export const uploadThumbnailToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "skillify/sections/thumbnails",
          public_id: filename,
          transformation: [
            { width: 720, height: 480, crop: "fill", quality: "auto:good" },
          ],
          format: "webp", // Convert to WebP for better compression
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result?.secure_url || "",
              publicId: result?.public_id || "",
            });
          }
        }
      )
      .end(buffer);
  });
};

// Upload middleware for section files
export const sectionUploadMiddleware = sectionUpload.single("thumbnail");

// Upload error handler middleware
export const sectionUploadErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB for thumbnail images.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field. Only 'thumbnail' field is allowed.",
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

// Process uploaded section files
export const processSectionUploads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    const uploadedFiles: {
      thumbnail?: { url: string; publicId: string };
    } = {};

    if (file) {
      const timestamp = Date.now();
      const filename = `section-thumbnail-${timestamp}`;

      const result = await uploadThumbnailToCloudinary(file.buffer, filename);
      uploadedFiles.thumbnail = result;
    }

    // Add uploaded file info to request body
    req.body.uploadedFiles = uploadedFiles;

    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error uploading files to Cloudinary",
      error: error.message,
    });
  }
};

export default {
  sectionUploadMiddleware,
  sectionUploadErrorHandler,
  processSectionUploads,
  uploadThumbnailToCloudinary,
};
