import express from "express";
const router = express.Router();
import {
  getDashboard,
  getAllUsers,
  updateUser,
  getAllBookings,
  getBooking,
  updateBooking,
  confirmBooking,
  deleteUser,
  getFlights,
  addFlight,
  updateFlight,
  deleteFlight,
  exportUsers,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/auth.js";

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(admin);

router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.get("/users/export", exportUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/bookings/:id", getBooking);
router.put("/bookings/:id", updateBooking);
router.post("/bookings/:id/confirm", confirmBooking);
router.get("/bookings", getAllBookings);
router.get("/flights", getFlights);
router.post("/flights", addFlight);
router.put("/flights/:id", updateFlight);
router.delete("/flights/:id", deleteFlight);

export default router;
