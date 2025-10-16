import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/UI/ToastProvider";
import * as instructorApplicationService from "../services/instructorApplication.service";
import type { InstructorApplicationForm } from "../types/instructorApplication.type";

// Get user's instructor application
export const useMyInstructorApplication = () => {
  return useQuery({
    queryKey: ["myInstructorApplication"],
    queryFn: instructorApplicationService.getMyInstructorApplication,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Submit instructor application
export const useSubmitInstructorApplication = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (applicationData: InstructorApplicationForm) =>
      instructorApplicationService.submitInstructorApplication(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInstructorApplication"] });
      showToast({
        type: "success",
        title: "Application Submitted! 🎉",
        message:
          "Your instructor application has been submitted successfully. We'll review it within 3-5 business days.",
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Submission Failed",
        message:
          error.response?.data?.message ||
          "Failed to submit application. Please try again.",
      });
    },
  });
};

// Get all instructor applications (admin only)
export const useInstructorApplications = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ["instructorApplications", params],
    queryFn: () =>
      instructorApplicationService.getAllInstructorApplications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Approve instructor application (admin only)
export const useApproveInstructorApplication = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      applicationId,
      adminFeedback,
    }: {
      applicationId: string;
      adminFeedback?: string;
    }) =>
      instructorApplicationService.approveInstructorApplication(
        applicationId,
        adminFeedback
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorApplications"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
      showToast({
        type: "success",
        title: "Application Approved! ✅",
        message:
          "The instructor application has been approved successfully. An email notification has been sent.",
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Approval Failed",
        message:
          error.response?.data?.message ||
          "Failed to approve application. Please try again.",
      });
    },
  });
};

// Reject instructor application (admin only)
export const useRejectInstructorApplication = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      applicationId,
      rejectionReason,
      adminFeedback,
    }: {
      applicationId: string;
      rejectionReason: string;
      adminFeedback?: string;
    }) =>
      instructorApplicationService.rejectInstructorApplication(
        applicationId,
        rejectionReason,
        adminFeedback
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorApplications"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
      showToast({
        type: "info",
        title: "Application Rejected",
        message:
          "The instructor application has been rejected. An email notification has been sent.",
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Rejection Failed",
        message:
          error.response?.data?.message ||
          "Failed to reject application. Please try again.",
      });
    },
  });
};

export default {
  useMyInstructorApplication,
  useSubmitInstructorApplication,
  useInstructorApplications,
  useApproveInstructorApplication,
  useRejectInstructorApplication,
};
