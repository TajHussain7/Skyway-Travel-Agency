import PackageOffer from "../models/PackageOffer.js";

// Get all package offers (public - with visibility filter)
export const getAllPackageOffers = async (req, res) => {
  try {
    const { category, isVisible } = req.query;

    const filter = {};

    if (isVisible !== undefined) {
      filter.isVisible = isVisible === "true";
    } else {
      filter.isVisible = true;
    }

    if (category) {
      filter.category = category;
    }

    const offers = await PackageOffer.find(filter)
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching package offers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching package offers",
      error: error.message,
    });
  }
};

// Get all package offers for admin (no visibility filter)
export const getAllPackageOffersAdmin = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }

    const offers = await PackageOffer.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .select("-__v");

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching package offers for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching package offers",
      error: error.message,
    });
  }
};

// Get single package offer by ID
export const getPackageOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await PackageOffer.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .select("-__v");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Package offer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Error fetching package offer:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching package offer",
      error: error.message,
    });
  }
};

// Create new package offer (Admin only)
export const createPackageOffer = async (req, res) => {
  try {
    const offerData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const offer = await PackageOffer.create(offerData);

    res.status(201).json({
      success: true,
      message: "Package offer created successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Error creating package offer:", error);
    res.status(400).json({
      success: false,
      message: "Error creating package offer",
      error: error.message,
    });
  }
};

// Update package offer (Admin only)
export const updatePackageOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await PackageOffer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Package offer not found",
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    const updatedOffer = await PackageOffer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Package offer updated successfully",
      data: updatedOffer,
    });
  } catch (error) {
    console.error("Error updating package offer:", error);
    res.status(400).json({
      success: false,
      message: "Error updating package offer",
      error: error.message,
    });
  }
};

// Toggle visibility (Admin only)
export const togglePackageOfferVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await PackageOffer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Package offer not found",
      });
    }

    offer.isVisible = !offer.isVisible;
    offer.updatedBy = req.user._id;
    await offer.save();

    res.status(200).json({
      success: true,
      message: `Package offer ${
        offer.isVisible ? "shown" : "hidden"
      } successfully`,
      data: offer,
    });
  } catch (error) {
    console.error("Error toggling package offer visibility:", error);
    res.status(400).json({
      success: false,
      message: "Error toggling visibility",
      error: error.message,
    });
  }
};

// Delete package offer (Admin only)
export const deletePackageOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await PackageOffer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Package offer not found",
      });
    }

    await PackageOffer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Package offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting package offer:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting package offer",
      error: error.message,
    });
  }
};

// Get offers by category
export const getPackageOffersByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const offers = await PackageOffer.find({
      category,
      isVisible: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching package offers by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching package offers by category",
      error: error.message,
    });
  }
};
