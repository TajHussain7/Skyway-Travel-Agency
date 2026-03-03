import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";

export const archivePastFlights = async () => {
  try {
    const now = new Date();

    const flightsToArchive = await Flight.find({
      isArchived: { $ne: true },
      departureTime: { $lt: now },
    });

    let archivedCount = 0;

    for (const flight of flightsToArchive) {
      const bookedSeats =
        flight.totalSeats - (flight.availableSeats || flight.totalSeats);
      const revenueGenerated = bookedSeats * flight.price;

      let reason = "completed";
      if (flight.status === "cancelled") {
        reason = "cancelled";
      } else if (flight.status === "delayed") {
        reason = "completed";
      }

      // Archive the flight
      flight.isArchived = true;
      flight.archivedAt = now;
      flight.archivedReason = reason;
      flight.bookedSeats = bookedSeats;
      flight.revenueGenerated = revenueGenerated;

      await flight.save({ validateBeforeSave: false });
      archivedCount++;
    }

    console.log(`Archived ${archivedCount} flights`);
    return { archivedCount };
  } catch (error) {
    console.error("Error auto-archiving past flights:", error);
    throw error;
  }
};

export const archivePastBookings = async (userId = null) => {
  try {
    const now = new Date();
    const query = { isArchived: { $ne: true } };

    if (userId) {
      query.userId = userId;
    }

    // Find bookings that should be archived
    const bookingsToArchive = await Booking.find(query)
      .populate("flightId")
      .populate("packageOfferId");

    let archivedCount = 0;

    for (const booking of bookingsToArchive) {
      let shouldArchive = false;
      let reason = "manual";

      if (booking.bookingType === "flight" && booking.flightId) {
        const departureTime = new Date(booking.flightId.departureTime);
        if (departureTime < now) {
          shouldArchive = true;
          // Reason based on booking status
          if (booking.status === "confirmed") {
            reason = "completed";
          } else if (booking.status === "cancelled") {
            reason = "cancelled";
          } else {
            reason = "expired";
          }
        }
      } else if (booking.bookingType === "package" && booking.packageOfferId) {
        if (booking.status === "cancelled") {
          shouldArchive = true;
          reason = "cancelled";
        } else {
          // Archive other bookings after 90 days
          const bookingDate = new Date(booking.createdAt);
          const daysDiff = Math.floor(
            (now - bookingDate) / (1000 * 60 * 60 * 24),
          );

          if (daysDiff > 90) {
            shouldArchive = true;
            reason = booking.status === "confirmed" ? "completed" : "expired";
          }
        }
      }

      // Archive the booking if conditions are met
      if (shouldArchive) {
        booking.isArchived = true;
        booking.archivedAt = now;
        booking.archivedReason = reason;
        // Save without running validation to avoid issues with old bookings
        await booking.save({ validateBeforeSave: false });
        archivedCount++;
      }
    }
    return { archivedCount };
  } catch (error) {
    console.error("Error auto-archiving past bookings:", error);
    throw error;
  }
};

/**
 * Get non-archived bookings for a user
 */
export const getActiveBookings = async (userId) => {
  return await Booking.find({
    userId,
    isArchived: { $ne: true },
  })
    .populate("flightId")
    .populate("packageOfferId")
    .sort({ createdAt: -1 });
};

/**
 * Get archived bookings for a user with pagination
 */
export const getArchivedBookings = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const bookings = await Booking.find({
    userId,
    isArchived: true,
  })
    .populate("flightId")
    .populate("packageOfferId")
    .sort({ archivedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments({
    userId,
    isArchived: true,
  });

  return {
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
