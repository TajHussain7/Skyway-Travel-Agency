import express from "express";
import {
  getAllPackageOffers,
  getAllPackageOffersAdmin,
  getPackageOfferById,
  createPackageOffer,
  updatePackageOffer,
  togglePackageOfferVisibility,
  deletePackageOffer,
  getPackageOffersByCategory,
} from "../controllers/packageOfferController.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.get("/", getAllPackageOffers);
router.get("/category/:category", getPackageOffersByCategory);
router.get("/:id", getPackageOfferById);

// Protected admin routes
router.get("/admin/all", protect, adminOnly, getAllPackageOffersAdmin);
router.post("/", protect, adminOnly, createPackageOffer);
router.put("/:id", protect, adminOnly, updatePackageOffer);
router.patch(
  "/:id/toggle-visibility",
  protect,
  adminOnly,
  togglePackageOfferVisibility
);
router.delete("/:id", protect, adminOnly, deletePackageOffer);

export default router;
