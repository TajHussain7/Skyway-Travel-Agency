import Settings from "../models/Settings.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {}
  }

  next();
};

export const checkMaintenance = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    if (!settings.maintenance.maintenanceMode) {
      return next();
    }

    if (settings.maintenance.allowAdminAccess && req.user?.role === "admin") {
      return next();
    }

    // accessible routes
    const publicRoutes = [
      "/api/settings/maintenance",
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/me",
      "/api/auth/logout",
    ];

    if (publicRoutes.some((route) => req.path.startsWith(route))) {
      return next();
    }

    // Return maintenance mode response
    return res.status(503).json({
      success: false,
      maintenance: true,
      message:
        settings.maintenance.maintenanceMessage ||
        "System under maintenance. Please check back later.",
      isAuthenticated: !!req.user,
    });
  } catch (error) {
    console.error("Error checking maintenance status:", error);

    next();
  }
};

export const maintenanceMiddleware = [optionalAuth, checkMaintenance];

export default maintenanceMiddleware;
