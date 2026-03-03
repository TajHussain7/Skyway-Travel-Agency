import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const MaintenanceBanner = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const location = useLocation();

  // Public routes where banner should not be shown
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/flights",
    "/umrah",
    "/offers",
    "/about-us",
    "/contact-us",
    "/maintenance",
  ];

  useEffect(() => {
    checkMaintenanceStatus();
    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await axios.get("/api/settings/maintenance");
      setMaintenanceMode(response.data.data.maintenanceMode);
    } catch (error) {
      console.error("Error checking maintenance status:", error);
    }
  };

  // Check if current route is a public route
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Don't show banner if maintenance is off, user closed it, or on public routes
  if (!maintenanceMode || !showBanner || isPublicRoute) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <i className="fas fa-tools text-xl"></i>
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">
                Maintenance Mode Active
              </p>
              <p className="text-xs sm:text-sm opacity-90">
                System is under maintenance. You have admin access.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Close banner"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
