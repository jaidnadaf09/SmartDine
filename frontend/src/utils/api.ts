import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("smartdine_user");
      window.location.href = "/login";
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
