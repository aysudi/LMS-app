import axios from "axios";
import { trackRequestEnd, trackRequestStart } from "../utils/serverStatus";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040";

const READ_TIMEOUT_MS = 15000;
const WRITE_TIMEOUT_MS = 60000;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: READ_TIMEOUT_MS,
});

api.interceptors.request.use(
  (config) => {
    const method = (config.method || "get").toLowerCase();
    if (config.timeout === READ_TIMEOUT_MS && method !== "get") {
      config.timeout = config.data instanceof FormData ? 0 : WRITE_TIMEOUT_MS;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    trackRequestStart();
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios
    .post(
      `${API_BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true, timeout: READ_TIMEOUT_MS },
    )
    .then((response) => {
      const token = response.data.data.token as string | undefined;
      if (!token) throw new Error("No token received from refresh");
      localStorage.setItem("accessToken", token);
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => {
    trackRequestEnd();
    return response;
  },
  async (error) => {
    trackRequestEnd(error);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentToken = localStorage.getItem("accessToken");

        if (!currentToken) {
          return Promise.reject(error);
        }

        const token = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        window.dispatchEvent(new CustomEvent("auth-token-changed"));

        const isUserFetch = originalRequest.url?.includes("/api/auth/me");
        if (!isUserFetch) {
          // window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
