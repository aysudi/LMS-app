import multer from "multer";
import cloudinary from "../configs/cloudinary.config.js";
const storage = multer.memoryStorage();
const lessonUpload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit for lesson videos
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "video") {
            if (file.mimetype.startsWith("video/")) {
                cb(null, true);
            }
            else {
                cb(new Error("Only video files are allowed for lesson content!"));
            }
        }
        else if (file.fieldname === "resources") {
            const allowedMimeTypes = [
                "application/pdf",
                "application/msword",
                "application/docx",
                "application/xlsx",
                "application/pptx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "text/plain",
                "text/csv",
                "text/docx",
                "text/xlsv",
                "text/pptx",
                // Archives
                "application/zip",
                "application/x-zip-compressed",
                "application/x-rar-compressed",
                "application/x-7z-compressed",
                // Images
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/svg+xml",
                // Audio
                "audio/mpeg",
                "audio/mp3",
                "audio/wav",
                "audio/ogg",
                "audio/aac",
                // Video (for resource files, different from lesson video)
                "video/mp4",
                "video/avi",
                "video/mov",
                "video/wmv",
                "video/mkv",
            ];
            if (allowedMimeTypes.includes(file.mimetype)) {
                if (file.size > 50 * 1024 * 1024) {
                    cb(new Error("Resource file too large. Maximum size is 50MB."));
                    return;
                }
                cb(null, true);
            }
            else {
                cb(new Error("Invalid file type for resources!"));
            }
        }
        else {
            cb(new Error("Invalid field name!"));
        }
    },
});
export const uploadLessonVideoToCloudinary = async (buffer, filename) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({
            folder: "skillify/lessons/videos",
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
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve({
                    url: result?.secure_url || "",
                    publicId: result?.public_id || "",
                });
            }
        })
            .end(buffer);
    });
};
export const uploadResourceToCloudinary = async (buffer, filename, mimeType) => {
    return new Promise((resolve, reject) => {
        let resourceType = "raw";
        let transformation = {};
        if (mimeType.startsWith("image/")) {
            resourceType = "image";
            transformation = {
                quality: "auto:good",
                format: "auto",
            };
        }
        else if (mimeType.startsWith("video/")) {
            resourceType = "video";
            transformation = {
                quality: "auto:good",
                format: "auto",
            };
        }
        else {
            resourceType = "raw";
        }
        const uploadOptions = {
            folder: "skillify/lessons/resources",
            public_id: filename,
            resource_type: resourceType,
        };
        if (Object.keys(transformation).length > 0) {
            uploadOptions.transformation = transformation;
        }
        cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
            if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
            }
            else {
                resolve({
                    url: result?.secure_url || "",
                    publicId: result?.public_id || "",
                });
            }
        })
            .end(buffer);
    });
};
export const lessonUploadMiddleware = lessonUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "resources", maxCount: 5 }, // Allow up to 5 resource files
]);
export const lessonUploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 500MB for videos and 50MB for resources.",
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected field. Only 'video' and 'resources' fields are allowed.",
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
export const processLessonUploads = async (req, res, next) => {
    try {
        const files = req.files;
        const uploadedFiles = {};
        if (files?.video?.[0]) {
            const videoFile = files.video[0];
            const timestamp = Date.now();
            const filename = `lesson-video-${timestamp}`;
            const result = await uploadLessonVideoToCloudinary(videoFile.buffer, filename);
            uploadedFiles.video = result;
        }
        if (files?.resources) {
            uploadedFiles.resources = await Promise.all(files.resources.map(async (file, index) => {
                const timestamp = Date.now();
                const filename = `lesson-resource-${timestamp}-${file.originalname}`;
                const result = await uploadResourceToCloudinary(file.buffer, filename, file.mimetype);
                return {
                    ...result,
                    name: file.originalname,
                };
            }));
        }
        req.body.uploadedFiles = uploadedFiles;
        next();
    }
    catch (error) {
        console.error("Error in processLessonUploads:", error);
        return res.status(500).json({
            success: false,
            message: "Error uploading files to Cloudinary",
            error: error.message,
        });
    }
};
export default {
    lessonUploadMiddleware,
    lessonUploadErrorHandler,
    processLessonUploads,
    uploadLessonVideoToCloudinary,
    uploadResourceToCloudinary,
};
