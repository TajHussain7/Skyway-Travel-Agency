import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import MandatoryFeedbackModal from "./MandatoryFeedbackModal";
import axios from "axios";

const UserLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSettings, setFeedbackSettings] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkFeedbackRequirement();
  }, []);

  const checkFeedbackRequirement = async () => {
    try {
      console.log("🔍 Checking feedback requirement...");

      // Get feedback settings (public endpoint)
      const settingsResponse = await axios.get("/api/settings/feedback", {
        withCredentials: true,
      });
      const feedbackSettings = settingsResponse.data.data;
      console.log("⚙️ Feedback settings received:", feedbackSettings);

      // Get user data to check feedback status
      const userResponse = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const user = userResponse.data.user || userResponse.data.data?.user;
      console.log("👤 User data:", {
        role: user?.role,
        feedbackSubmitted: user?.feedbackSubmitted,
        email: user?.email,
      });

      setUserData(user);
      setFeedbackSettings(feedbackSettings);

      // Check if feedback mode is enabled and user hasn't submitted feedback
      const shouldShowModal =
        feedbackSettings?.feedbackMode &&
        feedbackSettings?.mandatoryForUsers &&
        user?.role === "user" &&
        !user?.feedbackSubmitted;

      console.log("📋 Feedback check:", {
        feedbackMode: feedbackSettings?.feedbackMode,
        mandatoryForUsers: feedbackSettings?.mandatoryForUsers,
        userRole: user?.role,
        feedbackSubmitted: user?.feedbackSubmitted,
        shouldShowModal,
      });

      if (shouldShowModal) {
        console.log("✅ Showing feedback modal");
        setShowFeedbackModal(true);
      } else {
        console.log("❌ Not showing feedback modal");
      }

      setLoading(false);
    } catch (error) {
      console.error("❗ Error checking feedback requirement:", error);
      setLoading(false);
    }
  };

  const handleFeedbackClose = async () => {
    // Refresh user data to update feedback status
    try {
      const userResponse = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const user = userResponse.data.user || userResponse.data.data?.user;
      setUserData(user);

      // Close modal
      setShowFeedbackModal(false);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setShowFeedbackModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div
        className={`flex-1 ${
          isExpanded ? "ml-64" : "ml-20"
        } transition-all duration-300 overflow-x-hidden`}
        style={{ width: `calc(100% - ${isExpanded ? "256px" : "80px"})` }}
      >
        {children}
      </div>

      {/* Mandatory Feedback Modal */}
      {showFeedbackModal && (
        <MandatoryFeedbackModal
          settings={feedbackSettings}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
};

export default UserLayout;
