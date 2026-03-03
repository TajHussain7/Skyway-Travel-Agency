import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalSpent: 0,
    pendingBookings: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    passport: "",
    profileImage: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [alerts, setAlerts] = useState({ success: "", error: "" });
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 3,
    message: "",
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [deletedUserData, setDeletedUserData] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadProfile();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData) {
        navigate("/login");
      } else {
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          dateOfBirth: userData.dateOfBirth || "",
          address: userData.address || "",
          passport: userData.passport || "",
          profileImage: userData.profileImage || "",
        });
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Load user stats
      const bookingsResponse = await axios.get("/api/user/bookings", {
        withCredentials: true,
      });
      const bookings = bookingsResponse.data.data?.bookings || [];

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const totalSpent = bookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );
      const pendingBookings = bookings.filter(
        (b) => b.status === "pending"
      ).length;

      setStats({
        totalBookings,
        confirmedBookings,
        totalSpent,
        pendingBookings,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/api/user/profile", formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        setAlerts({ success: "Profile updated successfully!", error: "" });
        setUser({ ...user, ...formData });
        setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      }
    } catch (error) {
      setAlerts({
        success: "",
        error: error.response?.data?.message || "Failed to update profile",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setAlerts({
        success: "",
        error: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlerts({
        success: "",
        error: "Image size should be less than 5MB",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Update profile with new image
        const response = await axios.put(
          "/api/user/profile",
          { ...formData, profileImage: base64Image },
          { withCredentials: true }
        );

        if (response.data.success) {
          setFormData({ ...formData, profileImage: base64Image });
          setUser({ ...user, profileImage: base64Image });
          setAlerts({
            success: "Profile photo updated successfully!",
            error: "",
          });
          setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
        }
        setUploadingImage(false);
      };
      reader.onerror = () => {
        setAlerts({ success: "", error: "Failed to read image file" });
        setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setAlerts({
        success: "",
        error: error.response?.data?.message || "Failed to upload image",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await axios.put(
        "/api/user/profile",
        { ...formData, profileImage: "" },
        { withCredentials: true }
      );

      if (response.data.success) {
        setFormData({ ...formData, profileImage: "" });
        setUser({ ...user, profileImage: "" });
        setAlerts({
          success: "Profile photo removed successfully!",
          error: "",
        });
        setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      }
    } catch (error) {
      setAlerts({
        success: "",
        error: error.response?.data?.message || "Failed to remove image",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate current password is provided
    if (!passwordData.currentPassword) {
      setAlerts({ success: "", error: "Please enter your current password" });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    // Validate new password is provided
    if (!passwordData.newPassword) {
      setAlerts({ success: "", error: "Please enter a new password" });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      setAlerts({
        success: "",
        error: "New password must be at least 8 characters long",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    // Validate @ symbol
    if (!passwordData.newPassword.includes("@")) {
      setAlerts({
        success: "",
        error: "New password must contain @ symbol",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    // Validate number
    if (!/\d/.test(passwordData.newPassword)) {
      setAlerts({
        success: "",
        error: "New password must contain at least one number",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlerts({
        success: "",
        error: "New password and confirm password do not match",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setAlerts({ success: "Password changed successfully!", error: "" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      }
    } catch (error) {
      // Enhanced error messages
      const errorMessage = error.response?.data?.message;

      if (
        errorMessage &&
        errorMessage.toLowerCase().includes("current password")
      ) {
        setAlerts({
          success: "",
          error: "Current password is incorrect. Please try again.",
        });
      } else if (
        errorMessage &&
        errorMessage.toLowerCase().includes("incorrect")
      ) {
        setAlerts({
          success: "",
          error: "Current password is incorrect. Please check and try again.",
        });
      } else {
        setAlerts({
          success: "",
          error: errorMessage || "Failed to change password. Please try again.",
        });
      }

      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete Account Functions
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm deletion");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const response = await axios.delete("/api/user/account", {
        data: { password: deletePassword },
        withCredentials: true,
      });

      if (response.data.success) {
        // Store user data for feedback
        setDeletedUserData({
          email: user.email,
          name: user.name,
        });
        setShowDeleteModal(false);
        setShowFeedbackModal(true);
      }
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "Failed to delete account"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setFeedbackLoading(true);

    try {
      const response = await axios.post(`${API_URL}/user/feedback`, {
        email: deletedUserData?.email,
        name: deletedUserData?.name,
        rating: feedbackData.rating,
        message: feedbackData.message,
        type: "account_deletion",
      });

      setShowFeedbackModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Error submitting feedback:", error.message);
      setShowFeedbackModal(false);
      navigate("/login");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSkipFeedback = () => {
    setShowFeedbackModal(false);
    navigate("/login");
  };

  const handleContactSupport = () => {
    // Store that user came from account deletion
    sessionStorage.setItem("contactReason", "account_recovery");
    sessionStorage.setItem("contactEmail", deletedUserData?.email || "");
    setShowFeedbackModal(false);
    navigate("/contact-us");
  };

  const togglePassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  if (loading || !user) {
    return (
      <UserLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <i className="fas fa-user-circle me-3"></i>
                Profile Settings
              </h1>
              <p className="text-gray-100 text-lg">
                Manage your account information and preferences
              </p>
            </div>
            <button
              className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
              onClick={loadProfile}
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8">
              <div className="flex flex-col items-center">
                {/* Profile Image */}
                <div className="relative group">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center text-4xl font-bold text-primary shadow-xl">
                      {getInitials()}
                    </div>
                  )}
                  {/* Upload Overlay */}
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingImage ? (
                      <i className="fas fa-spinner fa-spin text-white text-xl"></i>
                    ) : (
                      <i className="fas fa-camera text-white text-xl"></i>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                </div>
                {/* Image Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="text-sm text-white hover:text-gray-200 flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full transition-colors"
                  >
                    <i className="fas fa-upload"></i>
                    {uploadingImage ? "Uploading..." : "Upload Photo"}
                  </button>
                  {formData.profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-white hover:text-red-200 flex items-center gap-1 bg-red-500 bg-opacity-50 px-3 py-1 rounded-full transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                      Remove
                    </button>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 mt-4">
                  {user.name || "User"}
                </h2>
                <p className="text-gray-100 text-lg">
                  {user.email || "No email"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.totalBookings}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Bookings
                </div>
              </div>
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.confirmedBookings}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Confirmed
                </div>
              </div>
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${stats.totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Spent
                </div>
              </div>
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {stats.pendingBookings}
                </div>
                <div className="text-sm text-gray-600 font-medium">Pending</div>
              </div>
            </div>
          </div>
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-user"></i>
                Personal Information
              </h3>
            </div>

            {alerts.success && (
              <div className="m-6 bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center gap-3 animate-fade-in">
                <i className="fas fa-check-circle text-green-500 text-xl"></i>
                <span className="text-green-800 font-semibold">
                  {alerts.success}
                </span>
              </div>
            )}
            {alerts.error && (
              <div className="m-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center gap-3 animate-fade-in">
                <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
                <span className="text-red-800 font-semibold">
                  {alerts.error}
                </span>
              </div>
            )}

            <form
              id="profileForm"
              onSubmit={handleProfileUpdate}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-signature text-gray-400 me-2"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-envelope text-gray-400 me-2"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-phone text-gray-400 me-2"></i>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+92 343 8002500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-calendar text-gray-400 me-2"></i>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-map-marker-alt text-gray-400 me-2"></i>
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Main Street, City, Country"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-passport text-gray-400 me-2"></i>
                    Passport Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.passport}
                    onChange={(e) =>
                      setFormData({ ...formData, passport: e.target.value })
                    }
                    placeholder="A12345678"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={() => {
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                      dateOfBirth: user.dateOfBirth || "",
                      address: user.address || "",
                      passport: user.passport || "",
                      profileImage: user.profileImage || "",
                    });
                  }}
                >
                  <i className="fas fa-undo"></i>
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-lock"></i>
                Change Password
              </h3>
            </div>
            <form
              id="passwordForm"
              onSubmit={handlePasswordChange}
              className="p-6"
            >
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-key text-gray-400 me-2"></i>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.currentPassword ? "text" : "password"}
                      className="form-control pr-12"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePassword("currentPassword")}
                    >
                      <i
                        className={`fas fa-${
                          showPassword.currentPassword ? "eye-slash" : "eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-lock text-gray-400 me-2"></i>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                      className="form-control pr-12"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePassword("newPassword")}
                    >
                      <i
                        className={`fas fa-${
                          showPassword.newPassword ? "eye-slash" : "eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <i className="fas fa-info-circle me-1"></i>
                    Password must be 8+ characters, contain @ symbol and at
                    least one number
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-lock text-gray-400 me-2"></i>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      className="form-control pr-12"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePassword("confirmPassword")}
                    >
                      <i
                        className={`fas fa-${
                          showPassword.confirmPassword ? "eye-slash" : "eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Changing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-red-200">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                Danger Zone
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                <p className="text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain. Your account will be archived for 24 hours before
                  permanent deletion, during which you can contact support to
                  recover it.
                </p>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={handleOpenDeleteModal}
                >
                  <i className="fas fa-trash"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <i className="fas fa-exclamation-triangle text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Delete Account</h3>
                    <p className="text-red-100 text-sm">
                      This action cannot be easily undone
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-info-circle text-yellow-500 mt-0.5"></i>
                    <div className="text-sm text-yellow-700">
                      <p className="font-semibold mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your account will be archived for 24 hours</li>
                        <li>
                          Contact support within 24 hours to recover your
                          account
                        </li>
                        <li>
                          After 24 hours, your data will be permanently deleted
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  Please enter your password to confirm account deletion:
                </p>

                {deleteError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                    <span className="text-red-700 text-sm">{deleteError}</span>
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                  >
                    <i
                      className={`fas fa-${
                        showDeletePassword ? "eye-slash" : "eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  onClick={handleCloseDeleteModal}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || !deletePassword}
                >
                  {deleteLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i>
                      Delete My Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal (shown after successful deletion) */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <i className="fas fa-comment-dots text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      We're Sorry to See You Go
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Your feedback helps us improve
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <span className="text-green-700 font-medium">
                      Your account has been deleted successfully
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-3">
                    How was your experience with SkyWay Travel?
                  </label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`text-3xl transition-colors ${
                          feedbackData.rating >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        } hover:text-yellow-400`}
                        onClick={() =>
                          setFeedbackData({ ...feedbackData, rating: star })
                        }
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {feedbackData.rating === 1 && "Poor"}
                    {feedbackData.rating === 2 && "Fair"}
                    {feedbackData.rating === 3 && "Good"}
                    {feedbackData.rating === 4 && "Very Good"}
                    {feedbackData.rating === 5 && "Excellent"}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Tell us why you're leaving (optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Share your thoughts with us..."
                    value={feedbackData.message}
                    onChange={(e) =>
                      setFeedbackData({
                        ...feedbackData,
                        message: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Deleted your account by mistake? You have 24 hours to
                    recover it.
                  </p>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 transition-colors"
                    onClick={handleContactSupport}
                  >
                    <i className="fas fa-headset"></i>
                    Contact Support Team
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between gap-3 flex-shrink-0">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  onClick={handleSkipFeedback}
                  disabled={feedbackLoading}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmitFeedback}
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Profile;
