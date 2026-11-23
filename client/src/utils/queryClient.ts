import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { isServerUnavailableError } from "./serverStatus";

const MAX_UNAVAILABLE_RETRIES = 3;

export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (isServerUnavailableError(error)) {
    return failureCount < MAX_UNAVAILABLE_RETRIES;
  }
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    if (status >= 400 && status < 500) return false;
  }
  return failureCount < 1;
};

export const queryRetryDelay = (attemptIndex: number) =>
  Math.min(2000 * 2 ** attemptIndex, 10000);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      retryDelay: queryRetryDelay,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
