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
import { useAuthContext } from "../context/AuthContext";

export const useRegister = () => {
  const { setUser } = useAuthContext();

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
        if (data.data.user) {
          setUser(data.data.user);
        }
      }
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("accessToken", data.data.token);
        if (data.data.user) {
          setUser(data.data.user);
        }
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
};

export const useVerifyEmail = () => {
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    retry: false,
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("accessToken", data.data.token);
        if (data.data.user) {
          setUser(data.data.user);
        }
      }
    },
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
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      setUser(null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};
