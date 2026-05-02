import axios from "axios";
import { reconnectSocket } from "../socket/socketClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("token", data.accessToken); // Backward compatibility

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        reconnectSocket();

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
        localStorage.removeItem("smartdine_user");
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Wraps an API call with a single automatic retry.
 * Prevents transient network errors from immediately surfacing as UI errors.
 */
export async function safeFetch<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (firstError) {
    // Wait briefly before retrying to let transient issues resolve
    await new Promise((r) => setTimeout(r, 800));
    try {
      return await apiCall();
    } catch (finalError) {
      throw finalError;
    }
  }
}

export default api;
