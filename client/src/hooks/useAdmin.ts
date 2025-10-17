import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/UI/ToastProvider";
import * as adminService from "../services/admin.service";
import type {
  AdminDashboardStats,
  AdminUsersQuery,
  AdminUsersResponse,
  AdminUserUpdateData,
  AdminCoursesResponse,
  AdminAnalytics,
  AdminCertificatesResponse,
} from "../types/admin.type";

// Admin Dashboard Hooks
export const useAdminDashboardStats = () => {
  return useQuery<AdminDashboardStats>({
    queryKey: ["adminDashboardStats"],
    queryFn: adminService.getAdminDashboardStats,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ["recentActivity", limit],
    queryFn: () => adminService.getRecentActivity(limit),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Admin User Management Hooks
export const useAdminUsers = (params: AdminUsersQuery = {}) => {
  return useQuery<AdminUsersResponse>({
    queryKey: ["adminUsers", params],
    queryFn: () => adminService.getAdminUsers(params),
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "active" | "suspended" | "pending";
    }) => adminService.updateUserStatus(userId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "User Updated",
        message: `User status updated to ${variables.status}`,
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Update Failed",
        message:
          error.response?.data?.message || "Failed to update user status",
        duration: 5000,
      });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "student" | "instructor" | "admin";
    }) => adminService.updateUserRole(userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "Role Updated",
        message: `User role updated to ${variables.role}`,
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Update Failed",
        message: error.response?.data?.message || "Failed to update user role",
        duration: 5000,
      });
    },
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      userIds,
      updates,
    }: {
      userIds: string[];
      updates: Partial<AdminUserUpdateData>;
    }) => adminService.bulkUpdateUsers(userIds, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "Bulk Update Successful",
        message: `Successfully updated ${data.updated} users`,
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Bulk Update Failed",
        message: error.response?.data?.message || "Failed to update users",
        duration: 5000,
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "User Deleted",
        message: "User has been successfully deleted",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: error.response?.data?.message || "Failed to delete user",
        duration: 5000,
      });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      banDuration,
      reason,
    }: {
      userId: string;
      banDuration: number;
      reason: string;
    }) => adminService.banUser(userId, banDuration, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "User Banned",
        message: "User has been successfully banned",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Ban Failed",
        message: error.response?.data?.message || "Failed to ban user",
        duration: 5000,
      });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (userId: string) => adminService.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "User Unbanned",
        message: "User has been successfully unbanned",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Unban Failed",
        message: error.response?.data?.message || "Failed to unban user",
        duration: 5000,
      });
    },
  });
};

// Admin Course Management Hooks
export const useAdminCourses = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) => {
  return useQuery<AdminCoursesResponse>({
    queryKey: ["adminCourses", params],
    queryFn: () => adminService.getAdminCourses(params),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useApproveCourse = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (courseId: string) => adminService.approveCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "Course Approved",
        message: "Course has been approved successfully",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Approval Failed",
        message: error.response?.data?.message || "Failed to approve course",
        duration: 5000,
      });
    },
  });
};

export const useRejectCourse = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ courseId, reason }: { courseId: string; reason: string }) =>
      adminService.rejectCourse(courseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      showToast({
        type: "success",
        title: "Course Rejected",
        message: "Course has been rejected",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Rejection Failed",
        message: error.response?.data?.message || "Failed to reject course",
        duration: 5000,
      });
    },
  });
};

// Admin Analytics Hooks
export const useAdminAnalytics = (
  params: {
    period?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  return useQuery<AdminAnalytics>({
    queryKey: ["adminAnalytics", params],
    queryFn: () => adminService.getAdminAnalytics(params),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Admin Certificates Hooks
export const useAdminCertificates = (
  params: {
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery<AdminCertificatesResponse>({
    queryKey: ["adminCertificates", params],
    queryFn: () => adminService.getAdminCertificates(params),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export default {
  useAdminDashboardStats,
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
  useBulkUpdateUsers,
  useDeleteUser,
  useAdminCourses,
  useApproveCourse,
  useRejectCourse,
  useAdminAnalytics,
  useAdminCertificates,
};
