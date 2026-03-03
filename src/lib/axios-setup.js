import axios from "axios";

// Configure axios base URL for production
// In development, Vite proxy handles /api requests
// In production, use the environment variable or default to relative path
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

// Enable credentials for all requests (cookies, auth headers)
axios.defaults.withCredentials = true;

export const setupAxiosInterceptors = () => {
  // Request interceptor - Add Authorization header from localStorage
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor - Handle errors and maintenance mode
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Check if response indicates maintenance mode
      if (error.response?.status === 503 && error.response?.data?.maintenance) {
        const currentPath = window.location.pathname;
        const isMaintenanceCheck = error.config?.url?.includes("/maintenance");

        if (currentPath !== "/maintenance" && !isMaintenanceCheck) {
          window.location.href = "/maintenance";
        }
      }

      // Handle 401 Unauthorized - clear invalid token
      if (error.response?.status === 401) {
        const token = localStorage.getItem("token");
        if (token) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Only redirect to login if not already on auth pages
          const currentPath = window.location.pathname;
          if (
            !currentPath.includes("/login") &&
            !currentPath.includes("/register")
          ) {
            window.location.href = "/login";
          }
        }
      }

      return Promise.reject(error);
    },
  );
};

export default setupAxiosInterceptors;
