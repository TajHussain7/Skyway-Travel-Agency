import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";

const ARCHIVE_CONFIG = {
  DAYS_AFTER_COMPLETION: 30,
  DAYS_AFTER_CANCELLATION: 7,
  DAYS_PENDING_EXPIRY: 3,
};

export const updateFlightStatuses = async () => {
  const now = new Date();

  try {
    // Mark past flights as completed (if not already cancelled)
    const result = await Flight.updateMany(
      {
        departureTime: { $lt: now },
        status: { $in: ["scheduled", "active", "delayed"] },
        isArchived: { $ne: true },
      },
      {
        $set: { status: "completed" },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("[Archive] Error updating flight statuses:", error);
    throw error;
  }
};

/**
 * Archive old completed flights
 * Archives flights that have been completed for more than X days
 */
export const archiveCompletedFlights = async (
  daysOld = ARCHIVE_CONFIG.DAYS_AFTER_COMPLETION
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    const result = await Flight.updateMany(
      {
        status: "completed",
        departureTime: { $lt: cutoffDate },
        isArchived: { $ne: true },
      },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "completed",
        },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("[Archive] Error archiving completed flights:", error);
    throw error;
  }
};

/**
 * Archive cancelled flights after X days
 */
export const archiveCancelledFlights = async (
  daysOld = ARCHIVE_CONFIG.DAYS_AFTER_CANCELLATION
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    const result = await Flight.updateMany(
      {
        status: "cancelled",
        updatedAt: { $lt: cutoffDate },
        isArchived: { $ne: true },
      },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "cancelled",
        },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("[Archive] Error archiving cancelled flights:", error);
    throw error;
  }
};

/**
 * Archive bookings for completed flights
 */
export const archiveCompletedBookings = async (
  daysOld = ARCHIVE_CONFIG.DAYS_AFTER_COMPLETION
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    // Find completed flights older than cutoff
    const completedFlights = await Flight.find({
      status: "completed",
      departureTime: { $lt: cutoffDate },
    }).select("_id");

    const flightIds = completedFlights.map((f) => f._id);

    if (flightIds.length === 0) {
      return 0;
    }

    const result = await Booking.updateMany(
      {
        flightId: { $in: flightIds },
        status: "confirmed",
        isArchived: { $ne: true },
      },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "completed",
        },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("[Archive] Error archiving completed bookings:", error);
    throw error;
  }
};

/**
 * Archive cancelled bookings after X days
 */
export const archiveCancelledBookings = async (
  daysOld = ARCHIVE_CONFIG.DAYS_AFTER_CANCELLATION
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    const result = await Booking.updateMany(
      {
        status: "cancelled",
        updatedAt: { $lt: cutoffDate },
        isArchived: { $ne: true },
      },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "cancelled",
        },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("[Archive] Error archiving cancelled bookings:", error);
    throw error;
  }
};

/**
 * Archive expired pending bookings (not confirmed within X days)
 */
export const archiveExpiredPendingBookings = async (
  daysOld = ARCHIVE_CONFIG.DAYS_PENDING_EXPIRY
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    const result = await Booking.updateMany(
      {
        status: "pending",
        createdAt: { $lt: cutoffDate },
        isArchived: { $ne: true },
      },
      {
        $set: {
          status: "cancelled",
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "expired",
        },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("[Archive] Error archiving expired pending bookings:", error);
    throw error;
  }
};

/**
 * Manual archive functions for admin
 */
export const archiveFlightManually = async (flightId) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      flightId,
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "manual",
        },
      },
      { new: true }
    );

    if (!flight) {
      throw new Error("Flight not found");
    }

    // Also archive all bookings for this flight
    await Booking.updateMany(
      { flightId: flightId },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "manual",
        },
      }
    );

    return flight;
  } catch (error) {
    console.error("[Archive] Error manually archiving flight:", error);
    throw error;
  }
};

export const archiveBookingManually = async (bookingId) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          archivedReason: "manual",
        },
      },
      { new: true }
    );

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  } catch (error) {
    console.error("[Archive] Error manually archiving booking:", error);
    throw error;
  }
};

/**
 * Unarchive functions for admin
 */
export const unarchiveFlight = async (flightId) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      flightId,
      {
        $set: { isArchived: false },
        $unset: { archivedAt: 1, archivedReason: 1 },
      },
      { new: true }
    );

    if (!flight) {
      throw new Error("Flight not found");
    }

    return flight;
  } catch (error) {
    console.error("[Archive] Error unarchiving flight:", error);
    throw error;
  }
};

export const unarchiveBooking = async (bookingId) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: { isArchived: false },
        $unset: { archivedAt: 1, archivedReason: 1 },
      },
      { new: true }
    );

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  } catch (error) {
    console.error("[Archive] Error unarchiving booking:", error);
    throw error;
  }
};

/**
 * Run all automatic archiving tasks
 * This should be called periodically (e.g., daily via cron job or on server start)
 */
export const runAutoArchive = async () => {
  const startTime = Date.now();

  try {
    const results = {
      flightStatusUpdates: await updateFlightStatuses(),
      archivedCompletedFlights: await archiveCompletedFlights(),
      archivedCancelledFlights: await archiveCancelledFlights(),
      archivedCompletedBookings: await archiveCompletedBookings(),
      archivedCancelledBookings: await archiveCancelledBookings(),
      archivedExpiredBookings: await archiveExpiredPendingBookings(),
    };

    const duration = Date.now() - startTime;

    return results;
  } catch (error) {
    console.error("[Archive] Error during automatic archive:", error);
    throw error;
  }
};

/**
 * Get archive statistics
 */
export const getArchiveStats = async () => {
  try {
    const [
      totalFlights,
      archivedFlights,
      activeFlights,
      completedFlights,
      totalBookings,
      archivedBookings,
      activeBookings,
    ] = await Promise.all([
      Flight.countDocuments(),
      Flight.countDocuments({ isArchived: true }),
      Flight.countDocuments({
        isArchived: { $ne: true },
        status: { $in: ["scheduled", "active"] },
      }),
      Flight.countDocuments({ status: "completed", isArchived: { $ne: true } }),
      Booking.countDocuments(),
      Booking.countDocuments({ isArchived: true }),
      Booking.countDocuments({ isArchived: { $ne: true } }),
    ]);

    return {
      flights: {
        total: totalFlights,
        archived: archivedFlights,
        active: activeFlights,
        completed: completedFlights,
      },
      bookings: {
        total: totalBookings,
        archived: archivedBookings,
        active: activeBookings,
      },
    };
  } catch (error) {
    console.error("[Archive] Error getting archive stats:", error);
    throw error;
  }
};

export default {
  updateFlightStatuses,
  archiveCompletedFlights,
  archiveCancelledFlights,
  archiveCompletedBookings,
  archiveCancelledBookings,
  archiveExpiredPendingBookings,
  archiveFlightManually,
  archiveBookingManually,
  unarchiveFlight,
  unarchiveBooking,
  runAutoArchive,
  getArchiveStats,
  ARCHIVE_CONFIG,
};
