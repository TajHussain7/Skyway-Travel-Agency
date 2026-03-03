import User from "../models/User.js";

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin verification",
    });
  }
};

const requireAdminOrSelf = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    const targetUserId = req.params.userId || req.params.id;

    if (req.user.role === "admin" || req.user.id === targetUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own data.",
      });
    }
  } catch (error) {
    console.error("Admin or self check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authorization check",
    });
  }
};

//super admin
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    if (req.user.email !== "admin@skyway.com" || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Super admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during super admin verification",
    });
  }
};

export { requireAdmin, requireAdminOrSelf, requireSuperAdmin };

//aliasing
export const adminOnly = requireAdmin;
