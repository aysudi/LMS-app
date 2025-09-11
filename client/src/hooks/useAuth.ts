import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  logout,
} from "../services/auth.service";
import type { RegisterRequest, LoginRequest } from "../services/auth.service";

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: ({
      userData,
      avatar,
    }: {
      userData: RegisterRequest;
      avatar?: File;
    }) => register(userData, avatar),
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("accessToken", data.data.token);
      }
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("accessToken", data.data.token);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
};

// Email verification mutation
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("accessToken", data.data.token);
      }
    },
  });
};

// Resend verification email mutation
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationEmail(email),
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => resetPassword(token, newPassword),
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};
