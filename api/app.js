import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

const app = express();

connectDB();

// Initialize scheduled tasks for archiving (optional - won't crash if node-cron not installed)
try {
  const { initializeScheduledTasks } =
    await import("./utils/scheduledTasks.js");
  initializeScheduledTasks();
} catch (error) {
  console.warn(
    "Scheduled tasks not initialized (node-cron may not be installed):",
    error.message,
  );
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "dist")));
}

app.use((req, res, next) => {
  const allowed = [
    process.env.CLIENT_ORIGIN || "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5173", // Ensure dev is always allowed
  ].filter(Boolean); // Remove any undefined entries

  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
});

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import adminUmrahRoutes from "./routes/adminUmrah.js";
import adminOffersRoutes from "./routes/adminOffers.js";
import bookingRoutes from "./routes/booking.js";
import packageOffersRoutes from "./routes/packageOffers.js";
import locationsRoutes from "./routes/locations.js";
import adminLocationsRoutes from "./routes/adminLocations.js";
import adminArchiveRoutes from "./routes/adminArchive.js";
import contactRoutes from "./routes/contact.js";
import settingsRoutes from "./routes/settings.js";
import notificationRoutes from "./routes/notifications.js";
import maintenanceMiddleware from "./middleware/maintenance.js";
import errorHandler, { notFoundHandler } from "./middleware/error.js";

// Maintenance mode check (applies to all routes except public ones)
app.use(maintenanceMiddleware);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/umrah", adminUmrahRoutes); // Public umrah routes
app.use("/api/admin/umrah", adminUmrahRoutes);
app.use("/api/admin/offers", adminOffersRoutes);
app.use("/api/admin/locations", adminLocationsRoutes);
app.use("/api/admin/archive", adminArchiveRoutes);
app.use("/api/admin/notifications", notificationRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/package-offers", packageOffersRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/settings", settingsRoutes);

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

// 404 Not Found handler (before error handler)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
