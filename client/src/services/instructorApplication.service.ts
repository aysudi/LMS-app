import { api } from "./api";
import type {
  InstructorApplication,
  InstructorApplicationsResponse,
  InstructorApplicationForm,
} from "../types/instructorApplication.type";

// Submit instructor application
export const submitInstructorApplication = async (
  applicationData: InstructorApplicationForm
): Promise<{
  success: boolean;
  message: string;
  data: InstructorApplication;
}> => {
  const response = await api.post(
    "/api/instructor-applications",
    applicationData
  );
  return response.data;
};

// Get user's instructor application
export const getMyInstructorApplication =
  async (): Promise<InstructorApplication | null> => {
    const response = await api.get(
      "/api/instructor-applications/my-application"
    );
    return response.data.data;
  };

// Get all instructor applications (admin only)
export const getAllInstructorApplications = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
): Promise<InstructorApplicationsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.status && params.status !== "all")
    queryParams.append("status", params.status);

  const response = await api.get(
    `/api/instructor-applications/admin/all?${queryParams.toString()}`
  );
  return response.data;
};

// Approve instructor application (admin only)
export const approveInstructorApplication = async (
  applicationId: string,
  adminFeedback?: string
): Promise<{
  success: boolean;
  message: string;
  data: InstructorApplication;
}> => {
  const response = await api.patch(
    `/api/instructor-applications/admin/${applicationId}/approve`,
    {
      adminFeedback,
    }
  );
  return response.data;
};

// Reject instructor application (admin only)
export const rejectInstructorApplication = async (
  applicationId: string,
  rejectionReason: string,
  adminFeedback?: string
): Promise<{
  success: boolean;
  message: string;
  data: InstructorApplication;
}> => {
  const response = await api.patch(
    `/api/instructor-applications/admin/${applicationId}/reject`,
    {
      rejectionReason,
      adminFeedback,
    }
  );
  return response.data;
};

export default {
  submitInstructorApplication,
  getMyInstructorApplication,
  getAllInstructorApplications,
  approveInstructorApplication,
  rejectInstructorApplication,
};
