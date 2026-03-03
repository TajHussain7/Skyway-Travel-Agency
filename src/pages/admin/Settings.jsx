import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [notification, setNotification] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "SkyWay Travel Agency",
    email: "info@skyway.com",
    phone: "+92-234-5672540",
    address: "Johar Town, Lahore",
    website: "https://skyway.com",
    description: "Your trusted travel partner",
  });

  const [bookingSettings, setBookingSettings] = useState({
    maxSeatsPerBooking: 10,
    bookingTimeLimit: 30,
    cancellationPolicy: "24 hours before departure",
    refundPercentage: 80,
    requirePassportInfo: true,
    autoConfirmBooking: true,
  });

  const [archiveSettings, setArchiveSettings] = useState({
    autoArchiveEnabled: true,
    archiveCompletedFlights: true,
    archiveCancelledBookings: true,
    archiveAfterDays: 90,
    deleteArchivedAfterDays: 365,
    archiveInactiveUsers: false,
    inactivityDays: 180,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bookingConfirmation: true,
    cancellationNotice: true,
    flightReminders: true,
    promotionalEmails: false,
    reminderBeforeHours: 24,
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPassword: true,
    minPasswordLength: 8,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    allowGuestBooking: true,
  });

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "System under maintenance. Please check back later.",
    allowAdminAccess: true,
  });

  const [feedbackSettings, setFeedbackSettings] = useState({
    feedbackMode: false,
    feedbackTitle: "We Value Your Feedback",
    feedbackMessage:
      "Please share your experience with SkyWay Travel Agency. Your feedback helps us improve our services.",
    mandatoryForUsers: true,
  });

  useEffect(() => {
    checkAdminAuth();
    loadSettings();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData || userData.role !== "admin") {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/settings", {
        withCredentials: true,
      });

      const settings = response.data.data;

      // Update all state with fetched settings
      if (settings.general) setGeneralSettings(settings.general);
      if (settings.booking) setBookingSettings(settings.booking);
      if (settings.archive) setArchiveSettings(settings.archive);
      if (settings.notification) setNotificationSettings(settings.notification);
      if (settings.security) setSecuritySettings(settings.security);
      if (settings.maintenance) setMaintenanceSettings(settings.maintenance);
      if (settings.feedback) setFeedbackSettings(settings.feedback);

      setLoading(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      showNotification("error", "Failed to load settings");
      setLoading(false);
    }
  };

  const saveSettings = async (settingsType) => {
    try {
      setSaving(true);

      // Get the appropriate settings data based on type
      const settingsMap = {
        general: generalSettings,
        booking: bookingSettings,
        archive: archiveSettings,
        notifications: notificationSettings,
        security: securitySettings,
        maintenance: maintenanceSettings,
        feedback: feedbackSettings,
      };

      // Map frontend tab names to backend category names
      const categoryMap = {
        notifications: "notification",
      };

      const category = categoryMap[settingsType] || settingsType;
      const data = settingsMap[settingsType];

      console.log(
        "Saving settings - Type:",
        settingsType,
        "Category:",
        category,
        "Data:",
        data,
      );

      // Save to API
      await axios.put(
        "/api/settings",
        {
          category,
          data,
        },
        {
          withCredentials: true,
        },
      );

      showNotification("success", "Settings saved successfully!");

      // Reload settings to ensure sync
      await loadSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: "fa-building" },
    { id: "booking", label: "Booking", icon: "fa-ticket-alt" },
    { id: "archive", label: "Archive", icon: "fa-archive" },
    { id: "notifications", label: "Notifications", icon: "fa-bell" },
    { id: "security", label: "Security", icon: "fa-shield-alt" },
    { id: "maintenance", label: "Maintenance", icon: "fa-tools" },
    { id: "feedback", label: "Feedback Mode", icon: "fa-comment-dots" },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <i className="fas fa-cog"></i>
                System Settings
              </h1>
              <p className="mt-2 text-white/90">
                Manage system configuration and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <i
              className={`fas ${
                notification.type === "success"
                  ? "fa-check-circle"
                  : "fa-exclamation-circle"
              } mr-2`}
            ></i>
            {notification.message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <i className={`fas ${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  General Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.companyName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.phone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={generalSettings.website}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          website: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={generalSettings.address}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={generalSettings.description}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    ></textarea>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings("general")}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Booking Settings */}
            {activeTab === "booking" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Booking Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Seats Per Booking
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.maxSeatsPerBooking}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          maxSeatsPerBooking: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.bookingTimeLimit}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          bookingTimeLimit: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.refundPercentage}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          refundPercentage: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Policy
                    </label>
                    <textarea
                      value={bookingSettings.cancellationPolicy}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          cancellationPolicy: e.target.value,
                        })
                      }
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-900">Preferences</h3>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingSettings.requirePassportInfo}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          requirePassportInfo: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Require Passport Information
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingSettings.autoConfirmBooking}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          autoConfirmBooking: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Auto-Confirm Bookings
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => saveSettings("booking")}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Archive Settings */}
            {activeTab === "archive" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Archive Configuration
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={archiveSettings.autoArchiveEnabled}
                      onChange={(e) =>
                        setArchiveSettings({
                          ...archiveSettings,
                          autoArchiveEnabled: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      Enable Auto-Archive
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={archiveSettings.archiveCompletedFlights}
                      onChange={(e) =>
                        setArchiveSettings({
                          ...archiveSettings,
                          archiveCompletedFlights: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Archive Completed Flights
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={archiveSettings.archiveCancelledBookings}
                      onChange={(e) =>
                        setArchiveSettings({
                          ...archiveSettings,
                          archiveCancelledBookings: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Archive Cancelled Bookings
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={archiveSettings.archiveInactiveUsers}
                      onChange={(e) =>
                        setArchiveSettings({
                          ...archiveSettings,
                          archiveInactiveUsers: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Archive Inactive Users
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archive After (days)
                    </label>
                    <input
                      type="number"
                      value={archiveSettings.archiveAfterDays}
                      onChange={(e) =>
                        setArchiveSettings({
                          ...archiveSettings,
                          archiveAfterDays: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Completed items will be archived after this many days
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delete Archived After (days)
                    </label>
                    <input
                      type="number"
                      value={archiveSettings.deleteArchivedAfterDays}
                      onChange={(e) =>
                        setArchiveSettings({
                          ...archiveSettings,
                          deleteArchivedAfterDays: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Permanently delete archived items after this many days
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inactivity Period (days)
                    </label>
                    <input
                      type="number"
                      value={archiveSettings.inactivityDays}
                      onChange={(e) =>
                        setArchiveSettings({
                          ...archiveSettings,
                          inactivityDays: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Archive users inactive for this many days
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings("archive")}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Enable/Disable Notifications
                  </h3>

                  <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-gray-900 font-medium">
                        Enable Email Notifications
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Master switch for all email notifications. Disable to
                        stop all emails.
                      </p>
                    </div>
                  </label>

                  <div className="border-t pt-4 mt-4">
                    <p className="text-xs text-gray-600 mb-3 font-medium">
                      NOTIFICATION TYPES
                    </p>

                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.bookingConfirmation}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            bookingConfirmation: e.target.checked,
                          })
                        }
                        disabled={!notificationSettings.emailNotifications}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-gray-900">
                          Booking Confirmation Emails
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Sent when booking is confirmed by admin or
                          automatically
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        Confirmation
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.cancellationNotice}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            cancellationNotice: e.target.checked,
                          })
                        }
                        disabled={!notificationSettings.emailNotifications}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-gray-900">
                          Cancellation Notices
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Sent when booking is cancelled by admin or user
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        Cancellation
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.flightReminders}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            flightReminders: e.target.checked,
                          })
                        }
                        disabled={!notificationSettings.emailNotifications}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-gray-900">Flight Reminders</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Automatic reminders sent before flight departure (see
                          timing below)
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                        Reminder
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationSettings.promotionalEmails}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            promotionalEmails: e.target.checked,
                          })
                        }
                        disabled={!notificationSettings.emailNotifications}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-gray-900">
                          Promotional Emails
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Marketing emails about special offers and promotions
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        Marketing
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-yellow-500 text-white rounded-full p-2">
                      <i className="fas fa-clock text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Flight Reminder Timing
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Configure when automatic reminder emails are sent to
                        passengers before their flight
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Send Reminders Before Flight Departure
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={notificationSettings.reminderBeforeHours}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            reminderBeforeHours: parseInt(e.target.value) || 24,
                          })
                        }
                        className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-center text-lg font-semibold"
                      />
                      <span className="text-gray-700 font-medium">
                        hours before departure
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[6, 12, 24, 48].map((hours) => (
                        <button
                          key={hours}
                          onClick={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              reminderBeforeHours: hours,
                            })
                          }
                          className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                            notificationSettings.reminderBeforeHours === hours
                              ? "border-yellow-500 bg-yellow-100 text-yellow-900"
                              : "border-gray-200 hover:border-yellow-300 text-gray-700"
                          }`}
                        >
                          {hours} hours
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <i className="fas fa-info-circle mr-1"></i>
                        <strong>Example:</strong> If set to{" "}
                        {notificationSettings.reminderBeforeHours} hours, a
                        passenger with a flight departing on{" "}
                        <strong>Feb 5 at 2:00 PM</strong> will receive their
                        reminder on{" "}
                        <strong>
                          Feb{" "}
                          {5 -
                            Math.floor(
                              notificationSettings.reminderBeforeHours / 24,
                            )}{" "}
                          at{" "}
                          {(14 -
                            (notificationSettings.reminderBeforeHours % 24) +
                            24) %
                            24 || 12}
                          :00{" "}
                          {(14 -
                            (notificationSettings.reminderBeforeHours % 24) +
                            24) %
                            24 <
                          12
                            ? "AM"
                            : "PM"}
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings("notifications")}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Security Configuration
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireStrongPassword}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          requireStrongPassword: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      Require Strong Passwords
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuth: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Enable Two-Factor Authentication
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.allowGuestBooking}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          allowGuestBooking: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Allow Guest Bookings
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={securitySettings.minPasswordLength}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          minPasswordLength: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxLoginAttempts: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={() => saveSettings("security")}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Feedback Settings */}
            {activeTab === "feedback" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Feedback Mode Settings
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                    <div>
                      <p className="font-medium text-blue-800">
                        About Feedback Mode
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        When enabled, registered users must complete a feedback
                        form before accessing their dashboard. This helps
                        collect valuable user feedback.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feedbackSettings.feedbackMode}
                      onChange={(e) =>
                        setFeedbackSettings({
                          ...feedbackSettings,
                          feedbackMode: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      Enable Feedback Mode
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feedbackSettings.mandatoryForUsers}
                      onChange={(e) =>
                        setFeedbackSettings({
                          ...feedbackSettings,
                          mandatoryForUsers: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Make Feedback Mandatory (Block dashboard access until
                      submitted)
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Modal Title
                  </label>
                  <input
                    type="text"
                    value={feedbackSettings.feedbackTitle}
                    onChange={(e) =>
                      setFeedbackSettings({
                        ...feedbackSettings,
                        feedbackTitle: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Message
                  </label>
                  <textarea
                    value={feedbackSettings.feedbackMessage}
                    onChange={(e) =>
                      setFeedbackSettings({
                        ...feedbackSettings,
                        feedbackMessage: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    This message will be displayed to users in the feedback
                    modal
                  </p>
                </div>

                <button
                  onClick={() => saveSettings("feedback")}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Maintenance Settings */}
            {activeTab === "maintenance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Maintenance Mode
                </h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                    <div>
                      <p className="font-medium text-yellow-800">
                        Warning: Maintenance Mode
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Enabling maintenance mode will make the website
                        unavailable to users. Only admins will have access.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceSettings.maintenanceMode}
                      onChange={(e) =>
                        setMaintenanceSettings({
                          ...maintenanceSettings,
                          maintenanceMode: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      Enable Maintenance Mode
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceSettings.allowAdminAccess}
                      onChange={(e) =>
                        setMaintenanceSettings({
                          ...maintenanceSettings,
                          allowAdminAccess: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">
                      Allow Admin Access During Maintenance
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={maintenanceSettings.maintenanceMessage}
                    onChange={(e) =>
                      setMaintenanceSettings({
                        ...maintenanceSettings,
                        maintenanceMessage: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    This message will be displayed to users during maintenance
                  </p>
                </div>

                <button
                  onClick={() => saveSettings("maintenance")}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
