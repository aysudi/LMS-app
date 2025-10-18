import type {
  AdminDashboardStats,
  AdminUsersQuery,
  AdminUsersResponse,
  AdminUserUpdateData,
} from "../types/admin.type";
import { api } from "./api";

// Admin Dashboard Statistics
export const getAdminDashboardStats =
  async (): Promise<AdminDashboardStats> => {
    const response = await api.get("/api/admin/dashboard/stats");
    return response.data.data;
  };

// Admin Recent Activity
export const getRecentActivity = async (limit: number = 10) => {
  const response = await api.get(
    `/api/admin/dashboard/activity?limit=${limit}`
  );
  return response.data.data;
};

// Admin User Management
export const getAdminUsers = async (
  params: AdminUsersQuery = {}
): Promise<AdminUsersResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.role) queryParams.append("role", params.role);
  if (params.status) queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const response = await api.get(`/api/admin/users?${queryParams.toString()}`);
  return response.data;
};

export const updateUserStatus = async (
  userId: string,
  status: "active" | "suspended" | "pending"
): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch(`/api/admin/users/${userId}/status`, {
    status,
  });
  return response.data;
};

export const updateUserRole = async (
  userId: string,
  role: "student" | "instructor" | "admin"
): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch(`/api/admin/users/${userId}/role`, {
    role,
  });
  return response.data;
};

export const bulkUpdateUsers = async (
  userIds: string[],
  updates: Partial<AdminUserUpdateData>
): Promise<{ success: boolean; message: string; updated: number }> => {
  const response = await api.patch("/api/admin/users/bulk", {
    userIds,
    updates,
  });
  return response.data;
};

export const deleteUser = async (
  userId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const banUser = async (
  userId: string,
  banDuration: number,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/api/auth/${userId}/ban`, {
    banDuration,
    reason,
  });
  return response.data;
};

export const unbanUser = async (
  userId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/api/auth/${userId}/unban`);
  return response.data;
};

// Admin Course Management
export const getAdminCourses = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) => {
  const response = await api.get("/api/admin/courses", { params });
  return response.data;
};

export const approveCourse = async (courseId: string) => {
  const response = await api.patch(`/api/admin/courses/${courseId}/approve`);
  return response.data;
};

export const rejectCourse = async (courseId: string, reason: string) => {
  const response = await api.patch(`/api/admin/courses/${courseId}/reject`, {
    reason,
  });
  return response.data;
};

// Admin Analytics
export const getAdminAnalytics = async (
  params: {
    period?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  const response = await api.get("/api/admin/analytics", { params });
  return response.data.data; // Return the actual analytics data
};

export const getAdminCertificates = async (
  params: {
    page?: number;
    limit?: number;
  } = {}
) => {
  const response = await api.get("/api/admin/certificates", { params });
  return response.data;
};

export default {
  getAdminDashboardStats,
  getRecentActivity,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  bulkUpdateUsers,
  deleteUser,
  banUser,
  unbanUser,
  getAdminCourses,
  approveCourse,
  rejectCourse,
  getAdminAnalytics,
  getAdminCertificates,
};
