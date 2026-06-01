import { Request, Response } from "express";
import { validateCertificateGeneration } from "../validations/certificateValidation.js";
import {
  generateCertificate,
  sendCertificateEmail,
} from "../services/certificateService.js";
import Certificate from "../models/Certificate.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

// Generate and send certificate
export const generateAndSendCertificate = async (
  req: Request,
  res: Response,
) => {
  try {
    const { error, value } = validateCertificateGeneration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      courseId,
      userId,
      studentName,
      instructorName,
      userEmail,
      courseName,
    } = value;

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

    let emailSuccess = false;
    let emailError = null;

    try {
      await sendCertificateEmail(
        userEmail,
        studentName,
        courseName,
        certificateBuffer,
        certificateData.certificateId,
      );
      emailSuccess = true;

      await Certificate.findByIdAndUpdate(certificate._id, {
        emailSent: true,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      emailError =
        error instanceof Error ? error.message : "Email sending failed";
    }

    res.status(200).json({
      success: true,
      message: emailSuccess
        ? "Certificate generated and sent successfully"
        : `Certificate generated successfully${
            emailError
              ? `. Email delivery failed: ${emailError}`
              : ", but email sending failed"
          }`,
      data: {
        certificateId: certificateData.certificateId,
        issuedAt: certificate.issuedAt,
        emailSent: emailSuccess,
        emailError: emailError,
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);

    if (error instanceof Error && error.message.includes("E11000")) {
      return res.status(400).json({
        success: false,
        message: "Certificate already exists for this course",
      });
    }

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate certificate",
    });
  }
};

// Get certificate status
export const getCertificateStatus = async (req: Request, res: Response) => {
  try {
    const { courseId, userId }: any = req.params;

    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and User ID are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID or user ID format",
      });
    }

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
  } catch (error) {
    console.error("Certificate status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get certificate status",
    });
  }
};

// Download certificate
export const downloadCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required",
      });
    }

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${certificateId}.pdf"`,
    );

    res.send(certificateBuffer);
  } catch (error) {
    console.error("Certificate download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download certificate",
    });
  }
};
