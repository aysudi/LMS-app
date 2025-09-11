import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  field?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    const status = error.response?.status;

    return {
      message,
      status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unexpected error occurred",
  };
};

export const getErrorMessage = (error: unknown): string => {
  return handleApiError(error).message;
};
