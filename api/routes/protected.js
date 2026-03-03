import express from "express";
const router = express.Router();
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { protect, user, admin } from "../middleware/auth.js";

router.get("/dashboard", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/user-dashboard.html"));
});

router.get("/my-bookings", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/my-bookings.html"));
});

router.get("/book-flight/:id", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/book-flight.html"));
});

router.get("/profile", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/profile.html"));
});

router.get("/admin", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/admin-dashboard.html"));
});

router.get("/admin/flights", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-flights.html"));
});

router.get("/admin/users", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-users.html"));
});

router.get("/admin/bookings", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-bookings.html"));
});

router.get("/admin/add-flight", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/add-flight.html"));
});

router.get("/admin/reports", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/reports.html"));
});

router.get("/admin/settings", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/settings.html"));
});

router.get("/admin/umrah", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-umrah.html"));
});

router.get("/admin/offers", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-offers.html"));
});

export default router;
