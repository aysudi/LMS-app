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
import { useInvalidateUsers, userQueryKeys } from "./useUserQueries";
import { setAuthToken, removeAuthToken } from "../utils/auth-storage";

export const useRegister = () => {
  return useMutation({
    mutationFn: ({
      userData,
      avatar,
    }: {
      userData: RegisterRequest;
      avatar?: File;
    }) => register(userData, avatar),
    // Remove automatic login on registration
    // Users should verify email first
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { invalidateCurrentUser } = useInvalidateUsers();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      if (data.data?.token) {
        setAuthToken(data.data.token);
        invalidateCurrentUser();
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
        window.location.href = "/";
      }
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    retry: false,
    // Remove automatic login on verification
    // Users should manually log in after verification
  });
};

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationEmail(email),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
};

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

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      removeAuthToken();
      localStorage.removeItem("userData");
      queryClient.clear();
      window.location.href = "/";
    },
  });
};
