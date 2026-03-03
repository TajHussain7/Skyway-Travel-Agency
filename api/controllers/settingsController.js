import Settings from "../models/Settings.js";
import User from "../models/User.js";

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

// Update settings by category
export const updateSettings = async (req, res) => {
  try {
    const { category, data } = req.body;

    console.log("Updating settings - Category:", category, "Data:", data);

    if (!category || !data) {
      return res.status(400).json({
        success: false,
        message: "Category and data are required",
      });
    }

    const validCategories = [
      "general",
      "booking",
      "archive",
      "notification",
      "security",
      "maintenance",
      "feedback",
    ];

    if (!validCategories.includes(category)) {
      console.log("Invalid category received:", category);
      return res.status(400).json({
        success: false,
        message: `Invalid category: ${category}. Valid categories are: ${validCategories.join(", ")}`,
      });
    }

    const settings = await Settings.updateSettings(
      category,
      data,
      req.user._id,
    );

    // If feedback mode is being disabled, reset all users' feedback status
    if (category === "feedback" && data.feedbackMode === false) {
      await User.updateMany(
        { role: "user" },
        {
          $set: {
            feedbackSubmitted: false,
            lastFeedbackDate: null,
          },
        },
      );
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

// Get maintenance status (public endpoint)
export const getMaintenanceStatus = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: settings.maintenance.maintenanceMode,
        maintenanceMessage: settings.maintenance.maintenanceMessage,
        allowAdminAccess: settings.maintenance.allowAdminAccess,
      },
    });
  } catch (error) {
    console.error("Error fetching maintenance status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance status",
      error: error.message,
    });
  }
};

// Get feedback settings (public endpoint for users)
export const getFeedbackSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        feedbackMode: settings.feedback?.feedbackMode || false,
        feedbackTitle:
          settings.feedback?.feedbackTitle || "We Value Your Feedback",
        feedbackMessage:
          settings.feedback?.feedbackMessage ||
          "Please share your experience with SkyWay Travel Agency",
        mandatoryForUsers: settings.feedback?.mandatoryForUsers || false,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback settings",
      error: error.message,
    });
  }
};
