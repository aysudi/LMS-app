import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4040";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check if we have a token before attempting refresh
        const currentToken = localStorage.getItem("accessToken");

        if (!currentToken) {
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data.data;
        if (token) {
          localStorage.setItem("accessToken", token);
          window.dispatchEvent(new CustomEvent("auth-token-changed"));

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          throw new Error("No token received from refresh");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        window.dispatchEvent(new CustomEvent("auth-token-changed"));

        // Only redirect to login if this isn't an initial user fetch
        const isUserFetch = originalRequest.url?.includes("/api/auth/me");
        if (!isUserFetch) {
          // window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
