import { api } from "./api";

export interface CertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  courseId: string;
  userId: string;
  certificateId: string;
  userEmail: string;
}

export interface CertificateResponse {
  success: boolean;
  certificateId?: string;
  emailSent?: boolean;
  message?: string;
}

export const certificateService = {
  generateCertificate: async (
    data: CertificateData
  ): Promise<CertificateResponse> => {
    try {
      const response = await api.post("/api/certificates/generate", {
        courseId: data.courseId,
        userId: data.userId,
        studentName: data.studentName,
        instructorName: data.instructorName,
        userEmail: data.userEmail,
        courseName: data.courseName,
      });

      return {
        success: response.data.success,
        certificateId: response.data.data?.certificateId,
        emailSent: response.data.data?.emailSent,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Certificate generation error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to generate certificate",
      };
    }
  },

  generateCertificateId: (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${randomStr}`.toUpperCase();
  },
};

export default certificateService;
