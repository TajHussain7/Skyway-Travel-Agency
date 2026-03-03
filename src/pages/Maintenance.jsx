import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Maintenance = () => {
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "System under maintenance. Please check back later.",
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkMaintenanceStatus();
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await axios.get("/api/settings/maintenance");

      if (!response.data.data.maintenanceMode) {
        // Maintenance mode is disabled, redirect to home
        navigate("/");
        return;
      }

      setMaintenanceMessage(response.data.data.maintenanceMessage);
      setLoading(false);
    } catch (error) {
      console.error("Error checking maintenance status:", error);
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-dark/10 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-8 text-center">
            <div className="mb-4">
              <i className="fas fa-tools text-6xl opacity-90"></i>
            </div>
            <h1 className="text-4xl font-bold mb-2">Under Maintenance</h1>
            <p className="text-xl opacity-90">We'll be back soon!</p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
                <i className="fas fa-wrench text-4xl text-yellow-600"></i>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                System Maintenance in Progress
              </h2>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {maintenanceMessage}
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <p className="text-gray-600">
                    We're performing scheduled maintenance to improve our
                    services
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <p className="text-gray-600">
                    Your data is safe and will be available once we're back
                    online
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <p className="text-gray-600">
                    We apologize for any inconvenience this may cause
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={checkMaintenanceStatus}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <i className="fas fa-sync-alt"></i>
                <span>Check Status</span>
              </button>

              <a
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-home"></i>
                <span>Return Home</span>
              </a>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600 mb-4">
                Need urgent assistance?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a
                  href="mailto:info@skyway.com"
                  className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
                >
                  <i className="fas fa-envelope"></i>
                  <span>info@skyway.com</span>
                </a>
                <a
                  href="tel:+922345672540"
                  className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
                >
                  <i className="fas fa-phone"></i>
                  <span>+92-234-5672540</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center">
            <p className="text-sm text-gray-500">
              <i className="fas fa-clock mr-2"></i>
              Last checked: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-dark/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
