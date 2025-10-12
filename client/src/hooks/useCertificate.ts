import { useMutation } from "@tanstack/react-query";
import { useToast } from "../components/UI/ToastProvider";
import {
  CertificateService,
  EmailService,
  type CertificateData,
} from "../services/certificate.service";
import type { Course } from "../types/course.type";

interface CompleteCourseData {
  course: Course;
  userId: string;
  userEmail: string;
  studentName: string;
  instructorName: string;
}

interface CertificateGenerationResult {
  success: boolean;
  certificateId?: string;
  emailSent?: boolean;
  error?: string;
}

export const useCertificateGeneration = () => {
  const { showToast } = useToast();

  const completeCourseWithCertificate = useMutation<
    CertificateGenerationResult,
    Error,
    CompleteCourseData
  >({
    mutationFn: async (data) => {
      const { course, userId, userEmail, studentName, instructorName } = data;

      try {
        // Check if course provides certificates
        if (!course.certificateProvided) {
          return {
            success: true,
            certificateId: undefined,
            emailSent: false,
          };
        }

        // Generate certificate ID
        const certificateId = CertificateService.generateCertificateId();

        // Prepare certificate data
        const certificateData: CertificateData = {
          studentName,
          courseName: course.title,
          instructorName,
          completionDate: new Date(),
          courseId: course.id,
          userId,
          certificateId,
        };

        // Generate certificate
        const certificateBuffer = await CertificateService.generateCertificate(
          certificateData
        );

        // Send certificate via email
        const emailSent = await EmailService.sendCertificateEmail(
          userEmail,
          studentName,
          course.title,
          certificateBuffer
        );

        return {
          success: true,
          certificateId,
          emailSent,
        };
      } catch (error) {
        console.error("Certificate generation failed:", error);
        throw new Error("Failed to generate certificate");
      }
    },
    onSuccess: (result, data) => {
      if (result.success && data.course.certificateProvided) {
        if (result.emailSent) {
          showToast({
            type: "success",
            title: "Course Completed!",
            message: `Congratulations! Your certificate for "${data.course.title}" has been sent to your email.`,
            duration: 8000,
          });
        } else {
          showToast({
            type: "warning",
            title: "Course Completed!",
            message: `Certificate generated but email delivery failed. Please contact support.`,
            duration: 6000,
          });
        }
      } else {
        showToast({
          type: "success",
          title: "Course Completed!",
          message: `Congratulations on completing "${data.course.title}"!`,
          duration: 5000,
        });
      }
    },
    onError: (_error, data) => {
      showToast({
        type: "error",
        title: "Certificate Generation Failed",
        message: `Failed to generate certificate for "${data.course.title}". Please try again.`,
        duration: 6000,
      });
    },
  });

  return {
    completeCourseWithCertificate: completeCourseWithCertificate.mutate,
    isGeneratingCertificate: completeCourseWithCertificate.isPending,
    certificateError: completeCourseWithCertificate.error,
  };
};

// Hook for downloading certificates
export const useCertificateDownload = () => {
  const { showToast } = useToast();

  const downloadCertificate = useMutation<void, Error, CertificateData>({
    mutationFn: async (certificateData) => {
      try {
        // Generate certificate
        const certificateBuffer = await CertificateService.generateCertificate(
          certificateData
        );

        // Convert buffer to blob and trigger download
        const blob = new Blob([new Uint8Array(certificateBuffer)], {
          type: "text/html",
        });
        const url = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate-${certificateData.courseName.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )}.html`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Certificate download failed:", error);
        throw new Error("Failed to download certificate");
      }
    },
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Certificate Downloaded",
        message: "Your certificate has been downloaded successfully.",
        duration: 4000,
      });
    },
    onError: () => {
      showToast({
        type: "error",
        title: "Download Failed",
        message: "Failed to download certificate. Please try again.",
        duration: 4000,
      });
    },
  });

  return {
    downloadCertificate: downloadCertificate.mutate,
    isDownloading: downloadCertificate.isPending,
  };
};

export default { useCertificateGeneration, useCertificateDownload };
