import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // General Settings
    general: {
      companyName: { type: String, default: "SkyWay Travel Agency" },
      email: { type: String, default: "info@skyway.com" },
      phone: { type: String, default: "+92-234-5672540" },
      address: { type: String, default: "Johar Town, Lahore" },
      website: { type: String, default: "https://skyway.com" },
      description: { type: String, default: "Your trusted travel partner" },
    },

    // Booking Settings
    booking: {
      maxSeatsPerBooking: { type: Number, default: 10 },
      bookingTimeLimit: { type: Number, default: 30 },
      cancellationPolicy: {
        type: String,
        default: "24 hours before departure",
      },
      refundPercentage: { type: Number, default: 80 },
      requirePassportInfo: { type: Boolean, default: true },
      autoConfirmBooking: { type: Boolean, default: true },
    },

    // Archive Settings
    archive: {
      autoArchiveEnabled: { type: Boolean, default: true },
      archiveCompletedFlights: { type: Boolean, default: true },
      archiveCancelledBookings: { type: Boolean, default: true },
      archiveAfterDays: { type: Number, default: 90 },
      deleteArchivedAfterDays: { type: Number, default: 365 },
      archiveInactiveUsers: { type: Boolean, default: false },
      inactivityDays: { type: Number, default: 180 },
    },

    // Notification Settings
    notification: {
      emailNotifications: { type: Boolean, default: true },
      bookingConfirmation: { type: Boolean, default: true },
      cancellationNotice: { type: Boolean, default: true },
      flightReminders: { type: Boolean, default: true },
      promotionalEmails: { type: Boolean, default: false },
      reminderBeforeHours: { type: Number, default: 24 },
    },

    // Security Settings
    security: {
      requireStrongPassword: { type: Boolean, default: true },
      minPasswordLength: { type: Number, default: 8 },
      sessionTimeout: { type: Number, default: 60 },
      maxLoginAttempts: { type: Number, default: 5 },
      twoFactorAuth: { type: Boolean, default: false },
      allowGuestBooking: { type: Boolean, default: true },
    },

    // Maintenance Settings
    maintenance: {
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: {
        type: String,
        default: "System under maintenance. Please check back later.",
      },
      allowAdminAccess: { type: Boolean, default: true },
    },

    // Feedback Settings
    feedback: {
      feedbackMode: { type: Boolean, default: false },
      feedbackTitle: {
        type: String,
        default: "We Value Your Feedback",
      },
      feedbackMessage: {
        type: String,
        default:
          "Please share your experience with SkyWay Travel Agency. Your feedback helps us improve our services.",
      },
      mandatoryForUsers: { type: Boolean, default: true },
    },

    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function (
  category,
  data,
  userId,
) {
  let settings = await this.getSettings();

  if (category === "all") {
    Object.assign(settings, data);
  } else {
    settings[category] = { ...settings[category], ...data };
  }

  settings.lastUpdated = Date.now();
  settings.updatedBy = userId;

  await settings.save();
  return settings;
};

export default mongoose.model("Settings", settingsSchema);
