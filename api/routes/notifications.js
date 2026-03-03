import express from "express";
import {
  sendUserNotification,
  sendBulkNotifications,
  sendFlightNotifications,
  getNotificationSettings,
  checkEmailConfiguration,
  sendTestEmail,
} from "../controllers/notificationController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

// Send notification to specific user
router.post("/send", sendUserNotification);

// Send bulk notifications
router.post("/send-bulk", sendBulkNotifications);

// Send notifications to all passengers on a flight
router.post("/send-flight", sendFlightNotifications);

// Get notification settings
router.get("/settings", getNotificationSettings);

// Check email configuration status
router.get("/check-config", checkEmailConfiguration);

// Send test email
router.post("/test-email", sendTestEmail);

export default router;
