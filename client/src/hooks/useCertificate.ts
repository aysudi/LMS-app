import { useMutation } from "@tanstack/react-query";
import { useToast } from "../components/UI/ToastProvider";
import certificateService, {
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
      const { course, userId, studentName, instructorName } = data;

      try {
        if (!course.certificateProvided) {
          return {
            success: true,
            certificateId: undefined,
            emailSent: false,
          };
        }

        const certificateId = certificateService.generateCertificateId();

        const certificateData: CertificateData = {
          studentName,
          courseName: course.title,
          instructorName,
          completionDate: new Date(),
          courseId: course.id,
          userId,
          certificateId,
          userEmail: data.userEmail,
        };

        // Generate and send certificate
        const result = await certificateService.generateCertificate(
          certificateData
        );

        return {
          success: result.success,
          certificateId: result.certificateId || certificateId,
          emailSent: result.emailSent || false,
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

// Simplified download function - certificates are sent via email
export const useCertificateDownload = () => {
  const { showToast } = useToast();

  const downloadCertificate = () => {
    showToast({
      type: "info",
      title: "Certificate Delivery",
      message:
        "Your certificate has been sent to your email address. Please check your inbox.",
      duration: 5000,
    });
  };

  return {
    downloadCertificate,
    isDownloading: false,
  };
};

export default { useCertificateGeneration, useCertificateDownload };
