import type {
  GetUserResponse,
  GetUsersParams,
  GetUsersResponse,
  User,
} from "../types/user.type";
import { api } from "./api";

// Get current user (me)
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get("/api/auth/me");
  return response.data.data;
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
