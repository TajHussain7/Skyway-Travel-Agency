import express from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { protect } from "../middleware/auth.js";
import archiveUtils from "../utils/archiveUtils.js";
import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import ContactQuery from "../models/ContactQuery.js";
import { sendQueryResponseEmail } from "../utils/emailService.js";

const router = express.Router();

// Apply admin authentication to all routes
router.use(protect);
router.use(requireAdmin);

router.get("/stats", async (req, res) => {
  try {
    const stats = await archiveUtils.getArchiveStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting archive stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get archive statistics",
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/archive/run
 * Manually trigger the automatic archive process
 */
router.post("/run", async (req, res) => {
  try {
    const results = await archiveUtils.runAutoArchive();
    res.json({
      success: true,
      message: "Archive process completed successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error running archive:", error);
    res.status(500).json({
      success: false,
      message: "Failed to run archive process",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/archive/flights
 * Get archived flights
 */
router.get("/flights", async (req, res) => {
  try {
    const { page = 1, limit = 10, reason } = req.query;

    const query = { isArchived: true };
    if (reason) {
      query.archivedReason = reason;
    }

    const flights = await Flight.find(query)
      .sort({ archivedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("origin destination");

    const total = await Flight.countDocuments(query);

    res.json({
      success: true,
      data: flights,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting archived flights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get archived flights",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/archive/bookings
 * Get archived bookings
 */
router.get("/bookings", async (req, res) => {
  try {
    const { page = 1, limit = 10, reason } = req.query;

    const query = { isArchived: true };
    if (reason) {
      query.archivedReason = reason;
    }

    const bookings = await Booking.find(query)
      .sort({ archivedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("userId", "name email phone")
      .populate("flightId")
      .populate("packageOfferId");

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting archived bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get archived bookings",
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/archive/flight/:id
 * Manually archive a flight
 */
router.post("/flight/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await archiveUtils.archiveFlightManually(id);

    res.json({
      success: true,
      message: "Flight archived successfully",
      data: flight,
    });
  } catch (error) {
    console.error("Error archiving flight:", error);
    res.status(error.message === "Flight not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to archive flight",
    });
  }
});

/**
 * POST /api/admin/archive/booking/:id
 * Manually archive a booking
 */
router.post("/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await archiveUtils.archiveBookingManually(id);

    res.json({
      success: true,
      message: "Booking archived successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error archiving booking:", error);
    res.status(error.message === "Booking not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to archive booking",
    });
  }
});

/**
 * DELETE /api/admin/archive/flight/:id
 * Unarchive (restore) a flight
 */
router.delete("/flight/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await archiveUtils.unarchiveFlight(id);

    res.json({
      success: true,
      message: "Flight restored successfully",
      data: flight,
    });
  } catch (error) {
    console.error("Error unarchiving flight:", error);
    res.status(error.message === "Flight not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to restore flight",
    });
  }
});

/**
 * DELETE /api/admin/archive/booking/:id
 * Unarchive (restore) a booking
 */
router.delete("/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await archiveUtils.unarchiveBooking(id);

    res.json({
      success: true,
      message: "Booking restored successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error unarchiving booking:", error);
    res.status(error.message === "Booking not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to restore booking",
    });
  }
});

/**
 * POST /api/admin/archive/bulk/flights
 * Bulk archive flights
 */
router.post("/bulk/flights", async (req, res) => {
  try {
    const { flightIds } = req.body;

    if (!flightIds || !Array.isArray(flightIds) || flightIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of flight IDs",
      });
    }

    const result = await Flight.updateMany(
      { _id: { $in: flightIds } },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "manual",
        },
      },
    );

    // Also archive related bookings
    await Booking.updateMany(
      { flightId: { $in: flightIds } },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "manual",
        },
      },
    );

    res.json({
      success: true,
      message: `Successfully archived ${result.modifiedCount} flights`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error bulk archiving flights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive flights",
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/archive/bulk/bookings
 * Bulk archive bookings
 */
router.post("/bulk/bookings", async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of booking IDs",
      });
    }

    const result = await Booking.updateMany(
      { _id: { $in: bookingIds } },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "manual",
        },
      },
    );

    res.json({
      success: true,
      message: `Successfully archived ${result.modifiedCount} bookings`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error bulk archiving bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive bookings",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/archive/users
 * Get archived users (deleted accounts)
 */
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, reason } = req.query;

    const query = { isArchived: true };
    if (reason) {
      query.archiveReason = reason;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ archivedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting archived users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get archived users",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/archive/user/:id
 * Restore (unarchive) a user account
 */
router.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isArchived) {
      return res.status(400).json({
        success: false,
        message: "User is not archived",
      });
    }

    // Restore user
    user.isArchived = false;
    user.archivedAt = null;
    user.archiveExpiresAt = null;
    user.archiveReason = null;
    await user.save();

    res.json({
      success: true,
      message: "User account restored successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error restoring user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore user",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/archive/user/:id/permanent
 * Permanently delete a user account and all related data
 */
router.delete("/user/:id/permanent", async (req, res) => {
  try {
    const { id } = req.params;

    // Find user first to get email and user data
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete all related data
    // 1. Delete all bookings for this user
    await Booking.deleteMany({ userId: id });

    // 2. Delete all flights created by this user (if any)
    await Flight.deleteMany({ createdBy: id });

    // 3. Delete all contact queries from this user
    await ContactQuery.deleteMany({ userId: id });

    // Note: Feedback is preserved even after account deletion for analytics

    // 4. Finally delete the user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User and all related data permanently deleted",
    });
  } catch (error) {
    console.error("Error permanently deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete user",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/archive/feedback
 * Get all user feedback (including deletion feedback)
 */
router.get("/feedback", async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get feedback",
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/archive/feedback/:id
 * Update feedback status
 */
router.put("/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      message: "Feedback status updated",
      data: feedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/archive/contact-queries
 * Get all contact/support queries
 */
router.get("/contact-queries", async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, priority } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const queries = await ContactQuery.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ContactQuery.countDocuments(query);

    res.json({
      success: true,
      data: queries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting contact queries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get contact queries",
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/archive/contact-queries/:id
 * Update contact query status
 */
router.put("/contact-queries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, priority } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === "resolved") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = req.user.id;
      }
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;

    const query = await ContactQuery.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Contact query not found",
      });
    }

    res.json({
      success: true,
      message: "Contact query updated",
      data: query,
    });
  } catch (error) {
    console.error("Error updating contact query:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact query",
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/archive/contact-queries/:id/respond
 * Send email response to contact query
 */
router.post("/contact-queries/:id/respond", async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Response message is required",
      });
    }

    // Get the contact query
    const query = await ContactQuery.findById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Contact query not found",
      });
    }

    // Send email response
    await sendQueryResponseEmail(query, response);

    // Update query status to resolved
    query.status = "resolved";
    query.resolvedAt = new Date();
    query.resolvedBy = req.user.id;
    query.adminNotes = response;
    await query.save();

    res.json({
      success: true,
      message: "Response sent successfully",
      data: query,
    });
  } catch (error) {
    console.error("Error sending response:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send response",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/archive/clear/bookings
 * Permanently delete all archived bookings
 */
router.delete("/clear/bookings", async (req, res) => {
  try {
    const result = await Booking.deleteMany({ isArchived: true });
    res.json({
      success: true,
      message: "All archived bookings deleted permanently",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing archived bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear archived bookings",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/archive/clear/flights
 * Permanently delete all archived flights
 */
router.delete("/clear/flights", async (req, res) => {
  try {
    const result = await Flight.deleteMany({ isArchived: true });
    res.json({
      success: true,
      message: "All archived flights deleted permanently",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing archived flights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear archived flights",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/archive/clear/users
 * Permanently delete all archived users
 */
router.delete("/clear/users", async (req, res) => {
  try {
    const result = await User.deleteMany({ isArchived: true });
    res.json({
      success: true,
      message: "All archived users deleted permanently",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing archived users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear archived users",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/archive/clear/feedback
 */
router.delete("/clear/feedback", async (req, res) => {
  try {
    const result = await Feedback.deleteMany({ status: "resolved" });
    res.json({
      success: true,
      message: "All resolved feedback deleted permanently",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing archived feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear archived feedback",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/archive/clear/contact-queries
 * Permanently delete all resolved and closed contact queries
 */
router.delete("/clear/contact-queries", async (req, res) => {
  try {
    const result = await ContactQuery.deleteMany({
      status: { $in: ["resolved", "closed"] },
    });
    res.json({
      success: true,
      message: "All resolved/closed contact queries deleted permanently",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing archived contact queries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear archived contact queries",
      error: error.message,
    });
  }
});

export default router;
