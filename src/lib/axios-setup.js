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

      return Promise.reject(error);
    },
  );
};

export default setupAxiosInterceptors;
