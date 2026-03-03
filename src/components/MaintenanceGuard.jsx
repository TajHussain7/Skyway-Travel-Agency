import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const MaintenanceGuard = ({ children }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkMaintenanceStatus();
  }, [location.pathname]);

  const checkMaintenanceStatus = async () => {
    try {
      // Check maintenance status
      const maintenanceResponse = await axios.get("/api/settings/maintenance");
      const maintenanceData = maintenanceResponse.data.data;

      setMaintenanceMode(maintenanceData.maintenanceMode);
      setAllowAdminAccess(maintenanceData.allowAdminAccess);

      // Check if user is authenticated and get role
      try {
        const authResponse = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        const userData = authResponse.data.user || authResponse.data.data?.user;
        setUserRole(userData?.role);
      } catch (error) {
        // User not authenticated
        setUserRole(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking maintenance status:", error);
      setLoading(false);
    }
  };

  // Public routes that are always accessible
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/about-us",
    "/contact-us",
    "/maintenance",
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Determine if current route should be blocked
  useEffect(() => {
    if (!loading && maintenanceMode && !isPublicRoute) {
      // If admin and admin access is allowed, let them through
      if (userRole === "admin" && allowAdminAccess) {
        return;
      }

      // Otherwise, redirect to maintenance page
      if (location.pathname !== "/maintenance") {
        navigate("/maintenance");
      }
    }
  }, [
    loading,
    maintenanceMode,
    userRole,
    allowAdminAccess,
    location.pathname,
    isPublicRoute,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-dark/10">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default MaintenanceGuard;
