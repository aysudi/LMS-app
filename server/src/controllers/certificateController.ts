import { Request, Response } from "express";
import { validateCertificateGeneration } from "../validations/certificateValidation";
import { sendCertificateEmail } from "../utils/sendMail";
import { generateCertificate } from "../services/certificateService";

// Generate and send certificate
export const generateAndSendCertificate = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate request body
    const { error, value } = validateCertificateGeneration(req.body);
    console.log("error", error);
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
    const emailSent = await sendCertificateEmail(
      userEmail,
      studentName,
      courseName,
      certificateBuffer,
      certificateData.certificateId
    );

    res.status(200).json({
      success: true,
      message: emailSent
        ? "Certificate generated and sent successfully"
        : "Certificate generated but email sending failed",
      data: {
        certificateId: certificateData.certificateId,
        emailSent,
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
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
    const { courseId, userId } = req.params;

    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and User ID are required",
      });
    }

    // For now, we'll simulate certificate status checking
    // In a real implementation, you would check a database
    // This is a placeholder that always returns no certificate
    // You should implement actual certificate storage and retrieval

    res.status(200).json({
      success: true,
      data: {
        hasCertificate: false,
        certificateId: null,
        issuedAt: null,
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

    // In a real implementation, you would:
    // 1. Validate the certificate ID exists in database
    // 2. Check if user has permission to download this certificate
    // 3. Retrieve certificate data from database
    // 4. Generate the certificate again or serve from storage

    // For now, we'll return an error asking for complete certificate data
    res.status(400).json({
      success: false,
      message:
        "Certificate download requires complete certificate data. Use the generation endpoint instead.",
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download certificate",
    });
  }
};
