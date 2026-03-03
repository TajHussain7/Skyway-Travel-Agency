import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";
import PackageOffer from "../models/PackageOffer.js";
import Settings from "../models/Settings.js";
import {
  archivePastBookings,
  archivePastFlights,
} from "../utils/archiveBookings.js";
import { sendBookingNotification } from "../utils/emailService.js";

const getFlights = async (req, res) => {
  try {
    // Auto-archive past flights before fetching
    await archivePastFlights();

    const flights = await Flight.find({
      status: { $in: ["scheduled", "active"] },
      isArchived: { $ne: true },
    })
      .sort({ departureTime: 1 })
      .exec();

    const availableFlights = flights.filter((f) => f.availableSeats > 0);

    res.status(200).json({
      success: true,
      count: availableFlights.length,
      data: availableFlights,
    });
  } catch (error) {
    console.error("Get flights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching flights",
    });
  }
};

const searchFlights = async (req, res) => {
  try {
    const { origin, destination, date, airline } = req.query;

    let flights = await Flight.search(
      origin,
      destination,
      date ? new Date(date) : null,
    );

    flights = flights.filter((f) => f.availableSeats > 0);

    if (airline && airline.trim() !== "") {
      flights = flights.filter(
        (f) => f.airline.toLowerCase() === airline.toLowerCase(),
      );
    }

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights.map((f) => f.toJSON()),
    });
  } catch (error) {
    console.error("Search flights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching flights",
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const { flightId, passengers, seatCount, seatNumbers } = req.body;

    if (!flightId || !passengers || !seatCount) {
      return res.status(400).json({
        success: false,
        message: "Flight ID, passengers, and seat count are required",
      });
    }

    if (
      !seatNumbers ||
      !Array.isArray(seatNumbers) ||
      seatNumbers.length !== seatCount
    ) {
      return res.status(400).json({
        success: false,
        message: "Seat numbers are required and must match seat count",
      });
    }

    if (Array.isArray(passengers) && passengers.length !== seatCount) {
      return res.status(400).json({
        success: false,
        message: `Seat count (${seatCount}) must match number of passengers (${passengers.length})`,
      });
    }

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

    const existingBookings = await Booking.find({
      flightId,
      status: { $in: ["pending", "confirmed"] },
      seatNumbers: { $in: seatNumbers },
    });

    if (existingBookings.length > 0) {
      const bookedSeats = existingBookings.flatMap((b) => b.seatNumbers);
      const conflictingSeats = seatNumbers.filter((s) =>
        bookedSeats.includes(s),
      );
      return res.status(400).json({
        success: false,
        message: `The following seats are already booked: ${conflictingSeats.join(
          ", ",
        )}`,
      });
    }

    const totalPrice = flight.price * seatCount;

    const booking = await Booking.create({
      userId: req.user.id,
      bookingType: "flight",
      flightId,
      passengerDetails: passengers,
      seatCount,
      seatNumbers,
      totalPrice,
      status: "pending",
    });

    //  (temporarily reserve)
    flight.availableSeats -= seatCount;
    await flight.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate(
        "flightId",
        "number origin destination departureTime arrivalTime airline",
      )
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Booking created successfully. Awaiting admin confirmation.",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating booking",
    });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking.toJSON(),
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching booking",
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    // Update certain Details
    if (req.body.passengerDetails) {
      booking.passengerDetails = req.body.passengerDetails;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking.toJSON(),
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating booking",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "name email")
      .populate(
        "flightId",
        "number origin destination departureTime arrivalTime airline price",
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking (unless admin)
    if (
      booking.userId._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Update flight available seats and booked count
    const flight = await Flight.findById(booking.flightId._id);
    if (flight) {
      flight.availableSeats += booking.seatCount;
      // Update booked seats count
      flight.bookedSeats = Math.max(
        0,
        (flight.bookedSeats || 0) - booking.seatCount,
      );
      await flight.save();
    }

    // Update booking status to cancelled and archive it
    booking.status = "cancelled";
    booking.isArchived = true;
    booking.archivedAt = new Date();
    booking.archivedReason = "cancelled";
    // Save without validation to avoid issues with old bookings
    await booking.save({ validateBeforeSave: false });

    // Auto-send cancellation email
    try {
      const settings = await Settings.findOne();
      if (
        settings?.notification?.emailNotifications &&
        settings?.notification?.cancellationNotice
      ) {
        const bookingDetails = {
          ticketNumber: booking.ticketNumber,
          flightNumber: booking.flightId.number,
          origin: booking.flightId.origin,
          destination: booking.flightId.destination,
          departureTime: booking.flightId.departureTime,
          arrivalTime: booking.flightId.arrivalTime,
          airline: booking.flightId.airline,
          seatCount: booking.seatCount,
          seatNumbers: booking.seatNumbers,
          totalPrice: booking.totalPrice,
          passengers: booking.passengerDetails,
        };
        const cancellationReason =
          req.body.cancellationReason || "Booking cancelled as requested";
        await sendBookingNotification(
          booking.userId.email,
          booking.userId.name,
          bookingDetails,
          "cancellation",
          cancellationReason,
        );
        console.log(`✅ Cancellation email sent to ${booking.userId.email}`);
      }
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling booking",
    });
  }
};

const createPackageBooking = async (req, res) => {
  try {
    const { packageOfferId, passengers, personCount } = req.body;

    // Validate required fields
    if (!packageOfferId || !passengers || !personCount) {
      return res.status(400).json({
        success: false,
        message: "Package offer ID, passengers, and person count are required",
      });
    }

    // Validate that person count matches number of passengers
    if (Array.isArray(passengers) && passengers.length !== personCount) {
      return res.status(400).json({
        success: false,
        message: `Person count (${personCount}) must match number of passengers (${passengers.length})`,
      });
    }

    // Check if package offer exists and is available
    const packageOffer = await PackageOffer.findById(packageOfferId);
    if (!packageOffer) {
      return res.status(404).json({
        success: false,
        message: "Package offer not found",
      });
    }

    // Check if offer is visible and bookable
    if (!packageOffer.isVisible || !packageOffer.isBookable) {
      return res.status(400).json({
        success: false,
        message: "This package is not available for booking",
      });
    }

    // Check if offer is still valid
    if (!packageOffer.isValid()) {
      return res.status(400).json({
        success: false,
        message: "This package offer has expired or is not yet available",
      });
    }

    // Check if there are available slots
    if (!packageOffer.hasAvailableSlots()) {
      return res.status(400).json({
        success: false,
        message: "No available slots for this package",
      });
    }

    // Calculate total price
    let totalPrice = packageOffer.price;
    if (packageOffer.priceUnit === "per person") {
      totalPrice = packageOffer.price * personCount;
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      bookingType: "package",
      packageOfferId,
      passengerDetails: passengers,
      personCount,
      totalPrice,
      status: "pending",
    });

    // Update package offer booking count
    packageOffer.currentBookings += 1;
    await packageOffer.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("packageOfferId", "name category price image")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Package booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Create package booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating package booking",
      error: error.message,
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    // Auto-archive past bookings before fetching active ones
    await archivePastBookings(req.user.id);

    const bookings = await Booking.find({
      userId: req.user.id,
      isArchived: { $ne: true },
    })
      .populate(
        "flightId",
        "number origin destination departureTime arrivalTime",
      )
      .populate("packageOfferId", "name category price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
      error: error.message,
    });
  }
};

const getUserPastBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Auto-archive before fetching past bookings
    await archivePastBookings(req.user.id);

    const bookings = await Booking.find({
      userId: req.user.id,
      isArchived: true,
    })
      .populate(
        "flightId",
        "number origin destination departureTime arrivalTime airline",
      )
      .populate("packageOfferId", "name category price image")
      .sort({ archivedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({
      userId: req.user.id,
      isArchived: true,
    });

    res.status(200).json({
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
    console.error("Get user past bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching past bookings",
      error: error.message,
    });
  }
};

// Get booked seats for a specific flight
const getFlightBookedSeats = async (req, res) => {
  try {
    const { flightId } = req.params;

    // Get all confirmed and pending bookings for this flight
    const bookings = await Booking.find({
      flightId,
      status: { $in: ["pending", "confirmed"] },
      isArchived: { $ne: true },
    }).select("seatNumbers");

    // Flatten all seat numbers into a single array
    const bookedSeats = bookings.flatMap(
      (booking) => booking.seatNumbers || [],
    );

    res.status(200).json({
      success: true,
      bookedSeats: [...new Set(bookedSeats)], // Remove duplicates
    });
  } catch (error) {
    console.error("Get flight booked seats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching booked seats",
    });
  }
};

export {
  getFlights,
  searchFlights,
  createBooking,
  createPackageBooking,
  getUserBookings,
  getUserPastBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getFlightBookedSeats,
};
