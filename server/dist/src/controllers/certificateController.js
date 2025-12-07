import { validateCertificateGeneration } from "../validations/certificateValidation";
import { generateCertificate, sendCertificateEmail, } from "../services/certificateService";
import Certificate from "../models/Certificate";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
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
        // Check if course provides certificates
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        if (!course.certificateProvided) {
            return res.status(400).json({
                success: false,
                message: "This course does not provide certificates",
            });
        }
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
        const certificate = new Certificate({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: new mongoose.Types.ObjectId(courseId),
            studentName,
            courseName,
            instructorName,
            certificateId: certificateData.certificateId,
            issuedAt: new Date(),
            emailSent: false,
        });
        await certificate.save();
        const enrollment = await Enrollment.findOneAndUpdate({
            user: new mongoose.Types.ObjectId(userId),
            course: new mongoose.Types.ObjectId(courseId),
            status: "completed",
        }, {
            certificateIssued: true,
            certificateIssuedAt: new Date(),
            certificateId: certificateData.certificateId,
        });
        let emailSuccess = false;
        let emailError = null;
        try {
            await sendCertificateEmail(userEmail, studentName, courseName, certificateBuffer, certificateData.certificateId);
            emailSuccess = true;
            await Certificate.findByIdAndUpdate(certificate._id, {
                emailSent: true,
            });
        }
        catch (error) {
            console.error("Email sending failed:", error);
            emailError =
                error instanceof Error ? error.message : "Email sending failed";
        }
        res.status(200).json({
            success: true,
            message: emailSuccess
                ? "Certificate generated and sent successfully"
                : `Certificate generated successfully${emailError
                    ? `. Email delivery failed: ${emailError}`
                    : ", but email sending failed"}`,
            data: {
                certificateId: certificateData.certificateId,
                issuedAt: certificate.issuedAt,
                emailSent: emailSuccess,
                emailError: emailError,
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
        // Check if course provides certificates
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        if (!course.certificateProvided) {
            return res.status(200).json({
                success: true,
                data: {
                    hasCertificate: false,
                    certificateId: null,
                    issuedAt: null,
                    emailSent: false,
                    certificateProvided: false,
                },
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
                certificateProvided: course.certificateProvided,
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
