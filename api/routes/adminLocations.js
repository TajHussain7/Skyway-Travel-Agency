import express from "express";
import { protect } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locationController.js";

const router = express.Router();

// Admin routes - require authentication and admin role
router.get("/", protect, requireAdmin, getAllLocations);
router.post("/", protect, requireAdmin, createLocation);
router.put("/:id", protect, requireAdmin, updateLocation);
router.delete("/:id", protect, requireAdmin, deleteLocation);

export default router;
