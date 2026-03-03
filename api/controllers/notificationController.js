import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import { sendBookingNotification } from "../utils/emailService.js";

// Send notification to specific user about their booking
export const sendUserNotification = async (req, res) => {
  try {
    const { bookingId, notificationType, cancellationReason } = req.body;

    if (!bookingId || !notificationType) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and notification type are required",
      });
    }

    // Check if email notifications are enabled
    const settings = await Settings.getSettings();
    if (!settings.notification.emailNotifications) {
      return res.status(400).json({
        success: false,
        message: "Email notifications are disabled in system settings",
      });
    }

    // Check notification type specific settings
    const notificationSettings = {
      confirmation: settings.notification.bookingConfirmation,
      cancellation: settings.notification.cancellationNotice,
      reminder: settings.notification.flightReminders,
      seatChange: true, // Always allow seat change notifications
    };

    if (!notificationSettings[notificationType]) {
      return res.status(400).json({
        success: false,
        message: `${notificationType} notifications are disabled in system settings`,
      });
    }

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate("userId")
      .populate("flightId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.userId || !booking.userId.email) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    // If cancellation, update booking status and free seats
    if (notificationType === "cancellation") {
      // Only cancel if not already cancelled
      if (booking.status !== "cancelled") {
        const previousStatus = booking.status;
        booking.status = "cancelled";
        await booking.save();
        console.log(
          `Booking ${booking._id} status updated from ${previousStatus} to cancelled`,
        );

        // Free up seats in the flight
        if (booking.flightId && booking.seatCount) {
          const Flight = (await import("../models/Flight.js")).default;
          const flightUpdate = await Flight.findByIdAndUpdate(
            booking.flightId._id,
            {
              $inc: { availableSeats: booking.seatCount },
            },
            { new: true },
          );
          console.log(
            `Flight ${booking.flightId.number}: Freed ${booking.seatCount} seat(s). New available seats: ${flightUpdate?.availableSeats}`,
          );
        }
      } else {
        console.log(
          `Booking ${booking._id} is already cancelled. Skipping DB update.`,
        );
      }
    }

    // If confirmation, update booking status to confirmed
    if (notificationType === "confirmation") {
      if (booking.status !== "confirmed") {
        const previousStatus = booking.status;
        booking.status = "confirmed";
        await booking.save();
        console.log(
          `Booking ${booking._id} status updated from ${previousStatus} to confirmed`,
        );
      } else {
        console.log(
          `Booking ${booking._id} is already confirmed. Skipping DB update.`,
        );
      }
    }

    // Prepare booking details for email
    const bookingDetails = {
      ticketNumber: booking.ticketNumber,
      bookingReference: booking.bookingReference || booking._id.toString(),
      flightNumber: booking.flightId?.number || "N/A",
      origin: booking.flightId?.origin || "N/A",
      destination: booking.flightId?.destination || "N/A",
      departureTime: booking.flightId?.departureTime,
      seats: booking.seatNumbers || [],
      passengerCount: booking.seatCount || booking.personCount || 1,
      totalPrice: booking.totalPrice,
      cancellationReason: cancellationReason || null,
    };

    // Send email notification
    await sendBookingNotification(
      booking.userId.email,
      booking.userId.name,
      bookingDetails,
      notificationType,
      cancellationReason,
    );

    res.status(200).json({
      success: true,
      message: `${notificationType} notification sent successfully to ${booking.userId.email}`,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

// Send bulk notifications to multiple users
export const sendBulkNotifications = async (req, res) => {
  try {
    const { bookingIds, notificationType, cancellationReason } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Booking IDs array is required",
      });
    }

    if (!notificationType) {
      return res.status(400).json({
        success: false,
        message: "Notification type is required",
      });
    }

    // Check if email notifications are enabled
    const settings = await Settings.getSettings();
    if (!settings.notification.emailNotifications) {
      return res.status(400).json({
        success: false,
        message: "Email notifications are disabled in system settings",
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    // Process each booking
    for (const bookingId of bookingIds) {
      try {
        const booking = await Booking.findById(bookingId)
          .populate("userId")
          .populate("flightId");

        if (!booking || !booking.userId || !booking.userId.email) {
          results.failed.push({
            bookingId,
            reason: "Booking or user email not found",
          });
          continue;
        }

        // If cancellation, update booking status and free seats
        if (
          notificationType === "cancellation" &&
          booking.status !== "cancelled"
        ) {
          const previousStatus = booking.status;
          booking.status = "cancelled";
          await booking.save();
          console.log(
            `Bulk: Booking ${booking._id} status updated from ${previousStatus} to cancelled`,
          );

          // Free up seats in the flight
          if (booking.flightId && booking.seatCount) {
            const Flight = (await import("../models/Flight.js")).default;
            const flightUpdate = await Flight.findByIdAndUpdate(
              booking.flightId._id,
              {
                $inc: { availableSeats: booking.seatCount },
              },
              { new: true },
            );
            console.log(
              `Bulk: Flight ${booking.flightId.number}: Freed ${booking.seatCount} seat(s). New available seats: ${flightUpdate?.availableSeats}`,
            );
          }
        }

        // If confirmation, update booking status to confirmed
        if (
          notificationType === "confirmation" &&
          booking.status !== "confirmed"
        ) {
          const previousStatus = booking.status;
          booking.status = "confirmed";
          await booking.save();
          console.log(
            `Bulk: Booking ${booking._id} status updated from ${previousStatus} to confirmed`,
          );
        }

        const bookingDetails = {
          ticketNumber: booking.ticketNumber,
          bookingReference: booking.bookingReference || booking._id.toString(),
          flightNumber: booking.flightId?.number || "N/A",
          origin: booking.flightId?.origin || "N/A",
          destination: booking.flightId?.destination || "N/A",
          departureTime: booking.flightId?.departureTime,
          seats: booking.seatNumbers || [],
          passengerCount: booking.seatCount || booking.personCount || 1,
          totalPrice: booking.totalPrice,
          cancellationReason: cancellationReason || null,
        };

        await sendBookingNotification(
          booking.userId.email,
          booking.userId.name,
          bookingDetails,
          notificationType,
          cancellationReason,
        );

        results.success.push({
          bookingId,
          email: booking.userId.email,
          userName: booking.userId.name,
        });
      } catch (error) {
        results.failed.push({
          bookingId,
          reason: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Sent ${results.success.length} notifications, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk notifications",
      error: error.message,
    });
  }
};

// Send notification to all passengers on a specific flight
export const sendFlightNotifications = async (req, res) => {
  try {
    const { flightId, notificationType, message, cancellationReason } =
      req.body;

    if (!flightId || !notificationType) {
      return res.status(400).json({
        success: false,
        message: "Flight ID and notification type are required",
      });
    }

    // Check if email notifications are enabled
    const settings = await Settings.getSettings();
    if (!settings.notification.emailNotifications) {
      return res.status(400).json({
        success: false,
        message: "Email notifications are disabled in system settings",
      });
    }

    // Get all active bookings for this flight
    const bookings = await Booking.find({
      flightId,
      status: { $in: ["confirmed", "pending"] },
    })
      .populate("userId")
      .populate("flightId");

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active bookings found for this flight",
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    // Send notification to each passenger
    for (const booking of bookings) {
      try {
        if (!booking.userId || !booking.userId.email) {
          results.failed.push({
            bookingId: booking._id,
            reason: "User email not found",
          });
          continue;
        }

        // If cancellation, update booking status and free seats
        if (
          notificationType === "cancellation" &&
          booking.status !== "cancelled"
        ) {
          const previousStatus = booking.status;
          booking.status = "cancelled";
          await booking.save();
          console.log(
            `Flight-wide: Booking ${booking._id} status updated from ${previousStatus} to cancelled`,
          );

          // Free up seats in the flight
          if (booking.flightId && booking.seatCount) {
            const Flight = (await import("../models/Flight.js")).default;
            const flightUpdate = await Flight.findByIdAndUpdate(
              booking.flightId._id,
              {
                $inc: { availableSeats: booking.seatCount },
              },
              { new: true },
            );
            console.log(
              `Flight-wide: Flight ${booking.flightId.number}: Freed ${booking.seatCount} seat(s). New available seats: ${flightUpdate?.availableSeats}`,
            );
          }
        }

        // If confirmation, update booking status to confirmed
        if (
          notificationType === "confirmation" &&
          booking.status !== "confirmed"
        ) {
          const previousStatus = booking.status;
          booking.status = "confirmed";
          await booking.save();
          console.log(
            `Flight-wide: Booking ${booking._id} status updated from ${previousStatus} to confirmed`,
          );
        }

        const bookingDetails = {
          ticketNumber: booking.ticketNumber,
          bookingReference: booking.bookingReference || booking._id.toString(),
          flightNumber: booking.flightId?.number || "N/A",
          origin: booking.flightId?.origin || "N/A",
          destination: booking.flightId?.destination || "N/A",
          departureTime: booking.flightId?.departureTime,
          seats: booking.seatNumbers || [],
          passengerCount: booking.seatCount || booking.personCount || 1,
          totalPrice: booking.totalPrice,
          cancellationReason: cancellationReason || null,
        };

        await sendBookingNotification(
          booking.userId.email,
          booking.userId.name,
          bookingDetails,
          notificationType,
          cancellationReason,
        );

        results.success.push({
          bookingId: booking._id,
          email: booking.userId.email,
          userName: booking.userId.name,
        });
      } catch (error) {
        results.failed.push({
          bookingId: booking._id,
          reason: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Sent ${results.success.length} notifications to flight passengers, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Error sending flight notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send flight notifications",
      error: error.message,
    });
  }
};

// Get notification settings
export const getNotificationSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: settings.notification,
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification settings",
      error: error.message,
    });
  }
};

// Check email configuration
export const checkEmailConfiguration = async (req, res) => {
  try {
    const { testEmailConfig } = await import("../utils/emailService.js");
    const isConfigured = await testEmailConfig();

    res.status(200).json({
      success: true,
      configured: isConfigured,
      message: isConfigured
        ? "Email service is properly configured"
        : "Email service is not configured. Please check environment variables.",
    });
  } catch (error) {
    console.error("Error checking email configuration:", error);
    res.status(200).json({
      success: true,
      configured: false,
      message: "Email service is not configured",
    });
  }
};

// Send test email
export const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }

    const { testEmailConfig } = await import("../utils/emailService.js");
    const isConfigured = await testEmailConfig();

    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        message:
          "Email service is not configured. Please set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD environment variables.",
      });
    }

    const { sendBookingNotification } =
      await import("../utils/emailService.js");

    // Send a test confirmation email
    const testBookingDetails = {
      ticketNumber: "TEST-" + Date.now(),
      bookingReference:
        "TEST-REF-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      flightNumber: "TEST123",
      origin: "Test Origin",
      destination: "Test Destination",
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      seats: ["1A", "1B"],
      passengerCount: 2,
      totalPrice: 50000,
    };

    await sendBookingNotification(
      email,
      "Test User",
      testBookingDetails,
      "confirmation",
      null,
    );

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email: " + error.message,
      error: error.message,
    });
  }
};

export default {
  sendUserNotification,
  sendBulkNotifications,
  sendFlightNotifications,
  getNotificationSettings,
  checkEmailConfiguration,
  sendTestEmail,
};
