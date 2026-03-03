import express from "express";
const router = express.Router();
import Offer from "../models/Offer.js";
import { protect, admin } from "../middleware/auth.js";

router.get("/", protect, admin, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (type && type !== "all") query.type = type;
    if (status && status !== "all") {
      if (status === "expired") {
        query.validTo = { $lt: new Date() };
      } else {
        query.status = status;
      }
    }

    const offers = await Offer.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Offer.countDocuments(query);

    res.json({
      success: true,
      data: offers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: offers.length,
        totalCount: total,
      },
    });
  } catch (error) {
    console.error("Get offers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching offers",
    });
  }
});

router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalOffers = await Offer.countDocuments();

    const activeOffers = await Offer.countDocuments({
      status: "active",
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
    });

    const redemptionsResult = await Offer.aggregate([
      {
        $group: {
          _id: null,
          totalRedemptions: { $sum: "$currentRedemptions" },
        },
      },
    ]);

    const totalRedemptions =
      redemptionsResult.length > 0 ? redemptionsResult[0].totalRedemptions : 0;

    const averageDiscountResult = await Offer.aggregate([
      { $match: { type: "percentage" } },
      {
        $group: {
          _id: null,
          averageDiscount: { $avg: "$discountPercentage" },
        },
      },
    ]);

    const averageDiscount =
      averageDiscountResult.length > 0
        ? Math.round(averageDiscountResult[0].averageDiscount)
        : 0;

    res.json({
      success: true,
      data: {
        totalOffers,
        activeOffers,
        totalRedemptions,
        averageDiscount,
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

router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      discountPercentage,
      discountAmount,
      validFrom,
      validTo,
      maxRedemptions,
      minPurchaseAmount,
      applicableServices,
      termsConditions,
      status,
      promoCode,
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate discount values based on type
    if (
      type === "percentage" &&
      (!discountPercentage || discountPercentage <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage is required for percentage offers",
      });
    }

    if (type === "fixed" && (!discountAmount || discountAmount <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Discount amount is required for fixed amount offers",
      });
    }

    const offer = new Offer({
      title,
      description,
      type,
      discountPercentage:
        type === "percentage" ? parseFloat(discountPercentage) : undefined,
      discountAmount: type === "fixed" ? parseFloat(discountAmount) : undefined,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : 0,
      applicableServices: applicableServices || ["all"],
      termsConditions,
      status: status || "active",
      promoCode: promoCode?.toUpperCase(),
      createdBy: req.user._id,
    });

    await offer.save();

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Create offer error:", error);

    if (error.code === 11000 && error.keyPattern?.promoCode) {
      return res.status(400).json({
        success: false,
        message: "Promo code already exists",
      });
    }

    if (
      error.message.includes("Valid from date must be before valid to date")
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid from date must be before valid to date",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating offer",
    });
  }
});

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    const {
      title,
      description,
      type,
      discountPercentage,
      discountAmount,
      validFrom,
      validTo,
      maxRedemptions,
      minPurchaseAmount,
      applicableServices,
      termsConditions,
      status,
      promoCode,
    } = req.body;

    // Update fields
    if (title) offer.title = title;
    if (description) offer.description = description;
    if (type) offer.type = type;
    if (discountPercentage !== undefined)
      offer.discountPercentage = parseFloat(discountPercentage);
    if (discountAmount !== undefined)
      offer.discountAmount = parseFloat(discountAmount);
    if (validFrom) offer.validFrom = new Date(validFrom);
    if (validTo) offer.validTo = new Date(validTo);
    if (maxRedemptions !== undefined)
      offer.maxRedemptions = maxRedemptions ? parseInt(maxRedemptions) : null;
    if (minPurchaseAmount !== undefined)
      offer.minPurchaseAmount = parseFloat(minPurchaseAmount);
    if (applicableServices) offer.applicableServices = applicableServices;
    if (termsConditions !== undefined) offer.termsConditions = termsConditions;
    if (status) offer.status = status;
    if (promoCode !== undefined) offer.promoCode = promoCode?.toUpperCase();

    await offer.save();

    res.json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Update offer error:", error);

    if (error.code === 11000 && error.keyPattern?.promoCode) {
      return res.status(400).json({
        success: false,
        message: "Promo code already exists",
      });
    }

    if (
      error.message.includes("Valid from date must be before valid to date")
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid from date must be before valid to date",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating offer",
    });
  }
});

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Check if offer has been used
    if (offer.currentRedemptions > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete offer that has been used",
      });
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting offer",
    });
  }
});

// @route   GET /api/admin/offers/:id
// @desc    Get single offer (Admin only)
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("usedBy.userId", "name email");
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Get offer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching offer",
    });
  }
});

// @route   POST /api/admin/offers/:id/duplicate
// @desc    Duplicate offer (Admin only)
// @access  Private/Admin
router.post("/:id/duplicate", protect, admin, async (req, res) => {
  try {
    const originalOffer = await Offer.findById(req.params.id);

    if (!originalOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Create new offer with duplicated data
    const duplicatedOffer = new Offer({
      title: `${originalOffer.title} (Copy)`,
      description: originalOffer.description,
      type: originalOffer.type,
      discountPercentage: originalOffer.discountPercentage,
      discountAmount: originalOffer.discountAmount,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxRedemptions: originalOffer.maxRedemptions,
      minPurchaseAmount: originalOffer.minPurchaseAmount,
      applicableServices: originalOffer.applicableServices,
      termsConditions: originalOffer.termsConditions,
      status: "inactive", // Start as inactive
      createdBy: req.user._id,
    });

    await duplicatedOffer.save();

    res.status(201).json({
      success: true,
      message: "Offer duplicated successfully",
      data: duplicatedOffer,
    });
  } catch (error) {
    console.error("Duplicate offer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while duplicating offer",
    });
  }
});

export default router;
