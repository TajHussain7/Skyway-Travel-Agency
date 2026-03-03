import express from "express";
const router = express.Router();
import UmrahPackage from "../models/UmrahPackage.js";
import { protect, admin } from "../middleware/auth.js";

// GET /api/umrah/packages
// Get all active Umrah packages (Public)
// Public
router.get("/packages", async (req, res) => {
  try {
    const packages = await UmrahPackage.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Get public packages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching packages",
    });
  }
});

// @route   GET /api/admin/umrah
// @desc    Get all Umrah packages (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    // Simple query - fetch all packages
    const packages = await UmrahPackage.find({}).sort({ createdAt: -1 });
    const total = packages.length;

    res.json({
      success: true,
      data: packages,
      pagination: {
        current: 1,
        total: 1,
        count: total,
        totalCount: total,
      },
    });
  } catch (error) {
    console.error("Get packages error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching packages",
    });
  }
});

// @route   GET /api/admin/umrah/stats
// @desc    Get Umrah package statistics (Admin only)
// @access  Private/Admin
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalPackages = await UmrahPackage.countDocuments();
    const activePackages = await UmrahPackage.countDocuments({
      status: "active",
    });

    // Get upcoming departures
    const allPackages = await UmrahPackage.find({}, 1000, 0);
    const upcomingDepartures = allPackages.filter((pkg) => {
      const depDate = new Date(pkg.departure_date);
      return depDate > new Date() && pkg.status === "active";
    }).length;

    // Calculate total revenue and bookings
    const totalRevenue = allPackages.reduce((sum, pkg) => {
      return sum + pkg.price * pkg.booked_seats;
    }, 0);

    const totalBookings = allPackages.reduce((sum, pkg) => {
      return sum + pkg.booked_seats;
    }, 0);

    res.json({
      success: true,
      data: {
        totalPackages,
        activeBookings: totalBookings,
        upcomingDepartures,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statistics",
    });
  }
});

// @route   POST /api/admin/umrah
// @desc    Create new Umrah package (Admin only)
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price,
      duration,
      departureDate,
      plane,
      hotel,
      city,
      rating,
      availability,
      totalSeats,
      amenities,
      status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !type ||
      !description ||
      !price ||
      !duration ||
      !departureDate ||
      !plane ||
      !hotel ||
      !city ||
      !totalSeats
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Process amenities (split by newlines if string)
    let processedAmenities = amenities;
    if (typeof amenities === "string") {
      processedAmenities = amenities.split("\n").filter((item) => item.trim());
    }

    const umrahPackage = await UmrahPackage.create({
      name,
      type,
      description,
      price: parseFloat(price),
      duration,
      departureDate: new Date(departureDate),
      plane,
      hotel,
      city,
      rating: rating ? parseFloat(rating) : 0,
      availability:
        availability !== undefined
          ? parseInt(availability)
          : parseInt(totalSeats),
      totalSeats: parseInt(totalSeats),
      amenities: processedAmenities || [],
      status: status || "active",
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: umrahPackage,
    });
  } catch (error) {
    console.error("Create package error:", error);

    if (error.message.includes("Departure date must be in the future")) {
      return res.status(400).json({
        success: false,
        message: "Departure date must be in the future",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating package",
    });
  }
});

// @route   PUT /api/admin/umrah/:id
// @desc    Update Umrah package (Admin only)
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const umrahPackage = await UmrahPackage.findById(req.params.id);

    if (!umrahPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const {
      name,
      type,
      description,
      price,
      duration,
      departureDate,
      plane,
      hotel,
      city,
      rating,
      availability,
      totalSeats,
      amenities,
      status,
    } = req.body;

    // Process amenities
    let processedAmenities = amenities;
    if (typeof amenities === "string") {
      processedAmenities = amenities.split("\n").filter((item) => item.trim());
    }

    // Update fields
    if (name) umrahPackage.name = name;
    if (type) umrahPackage.type = type;
    if (description) umrahPackage.description = description;
    if (price) umrahPackage.price = parseFloat(price);
    if (duration) umrahPackage.duration = duration;
    if (departureDate) umrahPackage.departureDate = new Date(departureDate);
    if (plane) umrahPackage.plane = plane;
    if (hotel) umrahPackage.hotel = hotel;
    if (city) umrahPackage.city = city;
    if (rating !== undefined) umrahPackage.rating = parseFloat(rating);
    if (availability !== undefined)
      umrahPackage.availability = parseInt(availability);
    if (totalSeats) umrahPackage.totalSeats = parseInt(totalSeats);
    if (processedAmenities) umrahPackage.amenities = processedAmenities;
    if (status) umrahPackage.status = status;

    const updated = await umrahPackage.save();

    res.json({
      success: true,
      message: "Package updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update package error:", error);

    if (error.message.includes("Departure date must be in the future")) {
      return res.status(400).json({
        success: false,
        message: "Departure date must be in the future",
      });
    }

    if (error.message.includes("Available seats cannot exceed total seats")) {
      return res.status(400).json({
        success: false,
        message: "Available seats cannot exceed total seats",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating package",
    });
  }
});

// @route   DELETE /api/admin/umrah/:id
// @desc    Delete Umrah package (Admin only)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const umrahPackage = await UmrahPackage.findById(req.params.id);

    if (!umrahPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Check if package has bookings
    if (umrahPackage.booked_seats > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete package with existing bookings",
      });
    }

    await UmrahPackage.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Delete package error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting package",
    });
  }
});

// @route   GET /api/admin/umrah/:id
// @desc    Get single Umrah package (Admin only)
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const umrahPackage = await UmrahPackage.findById(req.params.id);

    if (!umrahPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.json({
      success: true,
      data: umrahPackage.toJSON(),
    });
  } catch (error) {
    console.error("Get package error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching package",
    });
  }
});

export default router;
