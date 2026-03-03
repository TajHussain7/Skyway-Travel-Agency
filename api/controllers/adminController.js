import User from "../models/User.js";
import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";
import Settings from "../models/Settings.js";
import { archivePastFlights } from "../utils/archiveBookings.js";
import { sendBookingNotification } from "../utils/emailService.js";

const getDashboard = async (req, res) => {
  try {
    const users = await User.find({});
    const flights = await Flight.find({});
    const bookings = await Booking.find({});

    const totalUsers = users.filter((u) => u.role === "user").length;
    const totalFlights = flights.filter((f) => f.status === "active").length;
    const totalBookings = bookings.length;

    let totalRevenue = 0;
    bookings.forEach((b) => {
      if (b.status === "confirmed") {
        totalRevenue += b.totalPrice || 0;
      }
    });

    // Get recent bookings with populated user and flight data
    const recentBookings = await Booking.find({})
      .populate("userId", "name email phone profileImage")
      .populate("flightId")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    // Get recent users
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email profileImage createdAt")
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalFlights,
          totalBookings,
          totalRevenue,
        },
        recentBookings,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ role: "user" });

    const users = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password")
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin user",
      });
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getFlights = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    await archivePastFlights();

    const query = { isArchived: { $ne: true } };
    const total = await Flight.countDocuments(query);

    const flights = await Flight.find(query) //pagination
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: { flights },
      flights,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);

    res.status(201).json({
      success: true,
      message: "Flight created successfully",
      data: {
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

const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    // Update flight properties
    Object.assign(flight, req.body);
    await flight.save();

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      data: {
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

const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    const bookings = await Booking.find({ flightId: req.params.id });
    const activeBookings = bookings.filter((b) =>
      ["confirmed", "pending"].includes(b.status),
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete flight with active bookings",
      });
    }

    await Flight.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const query = { isArchived: { $ne: true } };
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate("userId", "name email phone profileImage")
      .populate("flightId")
      .populate("packageOfferId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { status } = req.body;
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

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Auto-send email if status changed to confirmed
    if (status === "confirmed" && oldStatus !== "confirmed") {
      try {
        const settings = await Settings.findOne();
        if (
          settings?.notification?.emailNotifications &&
          settings?.notification?.bookingConfirmation
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
          await sendBookingNotification(
            booking.userId.email,
            booking.userId.name,
            bookingDetails,
            "confirmation",
            null,
          );
          console.log(`✅ Confirmation email sent to ${booking.userId.email}`);
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
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

const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking is already confirmed",
      });
    }

    booking.status = "confirmed";
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email phone")
      .populate(
        "flightId",
        "number origin destination departureTime arrivalTime airline",
      );

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Confirm booking error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
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

    res.status(200).json({
      success: true,
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

const exportUsers = async (req, res) => {
  try {
    // Fetch all users except admins
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // For each user, calculate their booking statistics
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get all bookings for this user
        const bookings = await Booking.find({ userId: user._id }).lean().exec();

        // Calculate total bookings and expenses
        const bookingCount = bookings.length;
        const totalExpenses = bookings.reduce((sum, booking) => {
          return sum + (booking.totalPrice || 0);
        }, 0);

        return {
          ...user,
          bookingCount,
          totalExpenses,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    console.error("Export users error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getDashboard,
  getUsers as getAllUsers,
  updateUser,
  deleteUser,
  getFlights,
  createFlight as addFlight,
  updateFlight,
  deleteFlight,
  getBookings as getAllBookings,
  getBooking,
  updateBooking,
  confirmBooking,
  exportUsers,
};
