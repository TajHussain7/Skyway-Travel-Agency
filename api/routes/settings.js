import express from "express";
import * as settingsController from "../controllers/settingsController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Get all settings (admin only)
router.get("/", requireAdmin, settingsController.getSettings);

// Update settings (admin only)
router.put("/", requireAdmin, settingsController.updateSettings);

// Get maintenance status (public)
router.get("/maintenance", settingsController.getMaintenanceStatus);

// Get feedback settings (public)
router.get("/feedback", settingsController.getFeedbackSettings);

export default router;
