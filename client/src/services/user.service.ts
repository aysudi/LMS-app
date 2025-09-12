import { api } from "./api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "student" | "instructor" | "admin";
  isEmailVerified: boolean;
  avatar?: string;
  avatarOrInitials: string;
  initials: string;
  fullName: string;
  skills: string[];
  socialLinks: {
    _id: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: string;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface GetUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: "student" | "instructor" | "admin";
  search?: string;
}

// Get current user (me)
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get("/api/auth/me");
  return response.data.data.user;
};

// Get all users with pagination and filtering
export const getUsers = async (
  params: GetUsersParams = {}
): Promise<GetUsersResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.role) queryParams.append("role", params.role);
  if (params.search) queryParams.append("search", params.search);

  const response = await api.get(`/api/auth/?${queryParams.toString()}`);
  return response.data;
};

// Get user by ID
export const getUserById = async (userId: string): Promise<GetUserResponse> => {
  const response = await api.get(`/api/auth/id/${userId}`);
  return response.data;
};

// Get user by username
export const getUserByUsername = async (
  username: string
): Promise<GetUserResponse> => {
  const response = await api.get(`/api/auth/username/${username}`);
  return response.data;
};
