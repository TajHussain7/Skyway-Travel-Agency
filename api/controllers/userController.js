import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import Feedback from "../models/Feedback.js";
import ContactQuery from "../models/ContactQuery.js";

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's NON-ARCHIVED bookings with populated flight details
    const userBookings = await Booking.find({
      userId,
      isArchived: { $ne: true },
    })
      .populate("flightId")
      .populate("packageOfferId")
      .sort({ createdAt: -1 })
      .lean();

    // Auto-archive past bookings (based on departure date or creation date)
    await archivePastBookings(userId);

    const recentBookings = userBookings.slice(0, 5);

    // Get booking statistics (only non-archived)
    const totalBookings = userBookings.length;
    const confirmedBookings = userBookings.filter(
      (b) => b.status === "confirmed",
    ).length;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
        bookingStats: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: totalBookings - confirmedBookings,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching dashboard data",
    });
  }
};

// Helper function to auto-archive past bookings
const archivePastBookings = async (userId) => {
  try {
    const now = new Date();

    // Find bookings that should be archived
    const bookingsToArchive = await Booking.find({
      userId,
      isArchived: { $ne: true },
    })
      .populate("flightId")
      .populate("packageOfferId");

    for (const booking of bookingsToArchive) {
      let shouldArchive = false;
      let reason = "manual";

      if (booking.bookingType === "flight" && booking.flightId) {
        // Archive if flight departure time has passed
        const departureTime = new Date(booking.flightId.departureTime);
        if (departureTime < now) {
          shouldArchive = true;
          reason =
            booking.status === "confirmed"
              ? "completed"
              : booking.status === "cancelled"
                ? "cancelled"
                : "expired";
        }
      } else if (booking.bookingType === "package" && booking.packageOfferId) {
        // Archive if booking date is more than 90 days old
        const bookingDate = new Date(booking.createdAt);
        const daysDiff = Math.floor(
          (now - bookingDate) / (1000 * 60 * 60 * 24),
        );

        // Archive cancelled bookings immediately, others after 90 days
        if (booking.status === "cancelled") {
          shouldArchive = true;
          reason = "cancelled";
        } else if (daysDiff > 90) {
          shouldArchive = true;
          reason = booking.status === "confirmed" ? "completed" : "expired";
        }
      }

      // Archive the booking if conditions are met
      if (shouldArchive) {
        booking.isArchived = true;
        booking.archivedAt = now;
        booking.archivedReason = reason;
        await booking.save();
      }
    }
  } catch (error) {
    console.error("Error auto-archiving past bookings:", error);
  }
};

const bookFlight = async (req, res) => {
  try {
    const { flightId, seatCount, passengerDetails } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!flightId || !seatCount || !passengerDetails) {
      return res.status(400).json({
        success: false,
        message: "Flight ID, seat count, and passenger details are required",
      });
    }

    // Check if flight exists and has available seats
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    if (flight.availableSeats < seatCount) {
      return res.status(400).json({
        success: false,
        message: "Not enough available seats",
      });
    }

    // Calculate total price
    const totalPrice = flight.price * seatCount;

    // Create booking
    const booking = await Booking.create({
      userId,
      flightId,
      seatCount,
      totalPrice,
      passengerDetails,
    });

    // Update flight available seats
    flight.availableSeats -= seatCount;
    await flight.save();

    res.status(201).json({
      success: true,
      message: "Flight booked successfully",
      data: {
        booking: booking.toJSON(),
        flight: flight.toJSON(),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      userId,
      isArchived: { $ne: true },
    };

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("flightId")
      .populate("packageOfferId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching bookings",
    });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("flightId")
      .lean();

    if (!booking || booking.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching booking",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update booking status
    booking.status = "cancelled";

    // Archive cancelled bookings immediately
    booking.isArchived = true;
    booking.archivedAt = new Date();
    booking.archivedReason = "cancelled";

    // Save without validation to avoid issues with old bookings
    await booking.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking: booking.toJSON(),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, address, passport, profileImage } =
      req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;
    if (passport !== undefined) user.passport = passport;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          passport: user.passport,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password, feedback } = req.body;
    const userId = req.user.id;

    // Validate password is provided
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Calculate archive expiry (1 day from now)
    const archiveExpiresAt = new Date();
    archiveExpiresAt.setDate(archiveExpiresAt.getDate() + 1);

    // Archive the user account
    user.isArchived = true;
    user.archivedAt = new Date();
    user.archiveExpiresAt = archiveExpiresAt;
    user.archiveReason = "self_deleted";
    user.deletionFeedback = feedback || "";

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Account deleted successfully. You can recover it within 24 hours by contacting support.",
      data: {
        archivedAt: user.archivedAt,
        archiveExpiresAt: user.archiveExpiresAt,
      },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting account",
    });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { email, name, rating, message, type, category, feedbackType } =
      req.body;

    // Check if this is from an authenticated user
    const userId = req.user?._id;
    let userEmail = email;
    let userName = name;

    // If authenticated user, use their info
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userEmail = user.email;
        userName = user.name;

        // Update user's feedback status if this is mandatory feedback
        if (feedbackType === "mandatory") {
          user.feedbackSubmitted = true;
          user.lastFeedbackDate = new Date();
          await user.save();
        }
      }
    }

    // Validate required fields
    if (!userEmail || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required",
      });
    }

    // Create feedback entry
    const feedback = await Feedback.create({
      userEmail,
      userName: userName || "",
      rating: rating || 3,
      message,
      type: type || feedbackType || "general",
      category: category || "general",
      status: "new",
      userId: userId || null,
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      data: { feedback },
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting feedback",
    });
  }
};

const submitContactQuery = async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required",
      });
    }

    // Determine priority based on type
    let priority = "medium";
    if (type === "account_recovery") {
      priority = "high";
    } else if (type === "complaint") {
      priority = "high";
    }

    // Create contact query
    const contactQuery = await ContactQuery.create({
      name,
      email,
      phone: phone || "",
      subject,
      message,
      type: type || "general",
      priority,
      status: "new",
    });

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully. We will get back to you soon!",
      data: { contactQuery },
    });
  } catch (error) {
    console.error("Submit contact query error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting contact query",
    });
  }
};

export {
  getDashboard,
  getDashboard as getProfile,
  bookFlight,
  getBookings,
  getBookings as getUserBookings,
  getBooking,
  cancelBooking,
  updateProfile,
  changePassword,
  deleteAccount,
  submitFeedback,
  submitContactQuery,
};
