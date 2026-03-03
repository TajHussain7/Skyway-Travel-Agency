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
  // Request interceptor to add token to headers
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

  // Response interceptor for error handling
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

      // Handle 401 Unauthorized - redirect to login
      if (error.response?.status === 401) {
        const currentPath = window.location.pathname;
        const publicPaths = [
          "/login",
          "/register",
          "/",
          "/flights",
          "/offers",
          "/umrah",
          "/about",
          "/contact",
        ];

        // Only redirect to login if not already on a public page
        if (
          !publicPaths.includes(currentPath) &&
          !currentPath.startsWith("/maintenance")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (currentPath !== "/login") {
            window.location.href = "/login";
          }
        }
      }

      return Promise.reject(error);
    },
  );
};

export default setupAxiosInterceptors;
