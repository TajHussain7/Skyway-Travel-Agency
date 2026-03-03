import express from "express";
const router = express.Router();
import {
  createBooking,
  createPackageBooking,
  getUserBookings,
  getUserPastBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getFlights,
  searchFlights,
  getFlightBookedSeats,
} from "../controllers/bookingController.js";
import { protect, user } from "../middleware/auth.js";

// @route   GET /api/booking/flights
// @desc    Get all available flights
// @access  Public
router.get("/flights", getFlights);

// @route   GET /api/booking/flights/search
// @desc    Search flights
// @access  Public
router.get("/flights/search", searchFlights);

// @route   GET /api/booking/flight/:flightId/seats
// @desc    Get booked seats for a flight
// @access  Public
router.get("/flight/:flightId/seats", getFlightBookedSeats);

// Apply authentication middleware to protected routes
router.use(protect);
router.use(user);

// @route   POST /api/booking/create
// @desc    Create new booking
// @access  Private
router.post("/create", createBooking);

// @route   POST /api/booking/package/create
// @desc    Create package booking
// @access  Private
router.post("/package/create", createPackageBooking);

// @route   GET /api/booking/user/my-bookings
// @desc    Get user's active bookings
// @access  Private
router.get("/user/my-bookings", getUserBookings);

// @route   GET /api/booking/user/past-bookings
// @desc    Get user's archived/past bookings
// @access  Private
router.get("/user/past-bookings", getUserPastBookings);

// @route   GET /api/booking/:id
// @desc    Get booking by ID
// @access  Private
router.get("/:id", getBooking);

// @route   PUT /api/booking/:id
// @desc    Update booking
// @access  Private
router.put("/:id", updateBooking);

// @route   DELETE /api/booking/:id
// @desc    Cancel booking
// @access  Private
router.delete("/:id", cancelBooking);

export default router;
