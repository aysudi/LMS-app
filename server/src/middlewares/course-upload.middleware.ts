import { Request, Response, NextFunction } from "express";
import multer from "multer";
import cloudinary from "../configs/cloudinary.config.js";

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Create multer instance for course uploads
const courseUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos, 10MB for images
  },
  fileFilter: (req, file, cb) => {
    // Check file type based on field name
    if (file.fieldname === "image") {
      if (file.mimetype.startsWith("image/")) {
        // Additional size check for images
        if (file.size > 10 * 1024 * 1024) {
          // 10MB for images
          cb(new Error("Image file too large. Maximum size is 10MB."));
          return;
        }
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for course image!"));
      }
    } else if (file.fieldname === "videoPromo") {
      if (file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only video files are allowed for promo video!"));
      }
    } else {
      cb(new Error("Invalid field name!"));
    }
  },
});

// Function to upload image to Cloudinary
export const uploadImageToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "skillify/courses/images",
          public_id: filename,
          transformation: [
            { width: 1280, height: 720, crop: "fill", quality: "auto:good" },
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

// Function to upload video to Cloudinary
export const uploadVideoToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "skillify/courses/videos",
          public_id: filename,
          resource_type: "video",
          transformation: [
            {
              width: 1280,
              height: 720,
              crop: "limit",
              quality: "auto:good",
              format: "mp4",
            },
          ],
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

// Function to delete file from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    // Cloudinary URL pattern: https://res.cloudinary.com/cloud_name/resource_type/upload/version/public_id.format
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) return null;

    // Get everything after 'upload' (skip version if present)
    let publicIdWithFormat = urlParts.slice(uploadIndex + 1).join("/");

    // Remove version number if present (starts with 'v' followed by digits)
    if (/^v\d+\//.test(publicIdWithFormat)) {
      publicIdWithFormat = publicIdWithFormat.replace(/^v\d+\//, "");
    }

    // Remove file extension
    const publicId = publicIdWithFormat.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

// Upload middleware for course files (image and/or videoPromo)
export const courseUploadMiddleware = courseUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "videoPromo", maxCount: 1 },
]);

// Upload error handler middleware
export const courseUploadErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "File too large. Maximum size is 100MB for videos and 10MB for images.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected field. Only 'image' and 'videoPromo' fields are allowed.",
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

// Middleware to process uploaded course files
export const processCourseUploads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const uploadedFiles: {
      image?: { url: string; publicId: string };
      videoPromo?: { url: string; publicId: string };
    } = {};

    if (files?.image?.[0]) {
      const imageFile = files.image[0];
      const timestamp = Date.now();
      const filename = `course-image-${timestamp}`;

      const result = await uploadImageToCloudinary(imageFile.buffer, filename);
      uploadedFiles.image = result;
    }

    if (files?.videoPromo?.[0]) {
      const videoFile = files.videoPromo[0];
      const timestamp = Date.now();
      const filename = `course-video-${timestamp}`;

      const result = await uploadVideoToCloudinary(videoFile.buffer, filename);
      uploadedFiles.videoPromo = result;
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
  courseUploadMiddleware,
  courseUploadErrorHandler,
  processCourseUploads,
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
};
