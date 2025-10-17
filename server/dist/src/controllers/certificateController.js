import { validateCertificateGeneration } from "../validations/certificateValidation";
import { sendCertificateEmail } from "../utils/sendMail";
import { generateCertificate } from "../services/certificateService";
import Certificate from "../models/Certificate";
import mongoose from "mongoose";
// Generate and send certificate
export const generateAndSendCertificate = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = validateCertificateGeneration(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const { courseId, userId, studentName, instructorName, userEmail, courseName, } = value;
        // Check if certificate already exists for this user and course
        const existingCertificate = await Certificate.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: new mongoose.Types.ObjectId(courseId),
        });
        if (existingCertificate) {
            return res.status(400).json({
                success: false,
                message: "Certificate already exists for this course",
                data: {
                    certificateId: existingCertificate.certificateId,
                    issuedAt: existingCertificate.issuedAt,
                    emailSent: existingCertificate.emailSent,
                },
            });
        }
        // Generate certificate
        const certificateData = {
            studentName,
            courseName,
            instructorName,
            completionDate: new Date(),
            courseId,
            userId,
            certificateId: `CERT-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()}`,
        };
        const certificateBuffer = await generateCertificate(certificateData);
        // Send certificate via email
        const emailSent = await sendCertificateEmail(userEmail, studentName, courseName, certificateBuffer, certificateData.certificateId);
        const emailSuccess = Boolean(emailSent);
        // Save certificate to database
        const certificate = new Certificate({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: new mongoose.Types.ObjectId(courseId),
            studentName,
            courseName,
            instructorName,
            certificateId: certificateData.certificateId,
            issuedAt: new Date(),
            emailSent: emailSuccess,
        });
        await certificate.save();
        res.status(200).json({
            success: true,
            message: emailSuccess
                ? "Certificate generated and sent successfully"
                : "Certificate generated but email sending failed",
            data: {
                certificateId: certificateData.certificateId,
                issuedAt: certificate.issuedAt,
                emailSent: emailSuccess,
            },
        });
    }
    catch (error) {
        console.error("Certificate generation error:", error);
        // Handle duplicate key error (in case of race condition)
        if (error instanceof Error && error.message.includes("E11000")) {
            return res.status(400).json({
                success: false,
                message: "Certificate already exists for this course",
            });
        }
        res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to generate certificate",
        });
    }
};
// Get certificate status
export const getCertificateStatus = async (req, res) => {
    try {
        const { courseId, userId } = req.params;
        if (!courseId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and User ID are required",
            });
        }
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID or user ID format",
            });
        }
        // Check if certificate exists for this user and course
        const certificate = await Certificate.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: new mongoose.Types.ObjectId(courseId),
        });
        res.status(200).json({
            success: true,
            data: {
                hasCertificate: !!certificate,
                certificateId: certificate?.certificateId || null,
                issuedAt: certificate?.issuedAt || null,
                emailSent: certificate?.emailSent || false,
            },
        });
    }
    catch (error) {
        console.error("Certificate status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get certificate status",
        });
    }
};
// Download certificate
export const downloadCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        if (!certificateId) {
            return res.status(400).json({
                success: false,
                message: "Certificate ID is required",
            });
        }
        // Find certificate in database
        const certificate = await Certificate.findOne({ certificateId });
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        }
        // Generate certificate PDF from stored data
        const certificateData = {
            studentName: certificate.studentName,
            courseName: certificate.courseName,
            instructorName: certificate.instructorName,
            completionDate: certificate.issuedAt,
            courseId: certificate.courseId.toString(),
            userId: certificate.userId.toString(),
            certificateId: certificate.certificateId,
        };
        const certificateBuffer = await generateCertificate(certificateData);
        // Set headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="certificate-${certificateId}.pdf"`);
        res.send(certificateBuffer);
    }
    catch (error) {
        console.error("Certificate download error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to download certificate",
        });
    }
};
