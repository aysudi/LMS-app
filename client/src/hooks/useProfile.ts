import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import * as userService from "../services/user.service";
import { userQueryKeys } from "./useUserQueries";

// Hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (profileData: any) => userService.updateProfile(profileData),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });

      enqueueSnackbar("Profile updated successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      return data;
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update profile";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    },
  });
};

// Hook for changing password
export const useChangePassword = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (passwordData: {
      currentPassword: string;
      newPassword: string;
    }) => userService.changePassword(passwordData),

    onSuccess: () => {
      enqueueSnackbar("Password changed successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to change password";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    },
  });
};

// Hook for updating avatar
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (avatarFile: File) => userService.updateAvatar(avatarFile),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });

      enqueueSnackbar("Avatar updated successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      return data;
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update avatar";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 4000,
      });
    },
  });
};
