import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.type";
import { api } from "./api";

export const register = async (
  userData: RegisterRequest,
  avatar?: File
): Promise<AuthResponse> => {
  const formData = new FormData();

  Object.entries(userData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  if (avatar) {
    formData.append("avatar", avatar);
  }

  const response = await api.post("/api/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
};

export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  const response = await api.get(`/api/auth/verify-email?token=${token}`);
  return response.data;
};

export const resendVerificationEmail = async (
  email: string
): Promise<ApiResponse> => {
  const response = await api.post("/api/auth/resend-verification", { email });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ApiResponse> => {
  const response = await api.post("/api/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/api/auth/logout");
  } finally {
    localStorage.removeItem("accessToken");
  }
};
