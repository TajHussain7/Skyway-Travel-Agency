import express from "express";
const router = express.Router();
import {
  getProfile,
  updateProfile,
  getUserBookings,
  changePassword,
  deleteAccount,
  submitFeedback,
  submitContactQuery,
} from "../controllers/userController.js";
import { protect, user } from "../middleware/auth.js";

// Public/Protected feedback route (works for both authenticated and non-authenticated)
// @route   POST /api/user/feedback
// @desc    Submit feedback
// @access  Public/Protected
router.post("/feedback", (req, res, next) => {
  // Try to authenticate but don't fail if token is missing
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    protect(req, res, (err) => {
      if (!err) {
        return submitFeedback(req, res);
      }
      // If authentication fails, continue as unauthenticated
      return submitFeedback(req, res);
    });
  } else if (req.cookies && req.cookies.token) {
    protect(req, res, (err) => {
      if (!err) {
        return submitFeedback(req, res);
      }
      // If authentication fails, continue as unauthenticated
      return submitFeedback(req, res);
    });
  } else {
    // No authentication attempt, proceed as unauthenticated
    return submitFeedback(req, res);
  }
});

// Apply authentication middleware to protected routes
router.use(protect);
router.use(user);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", updateProfile);

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", changePassword);

// @route   GET /api/user/bookings
// @desc    Get user bookings
// @access  Private
router.get("/bookings", getUserBookings);

// @route   DELETE /api/user/account
// @desc    Delete user account (soft delete)
// @access  Private
router.delete("/account", deleteAccount);

export default router;
