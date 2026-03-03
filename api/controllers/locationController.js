import Location from "../models/Location.js";

const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
};

// Get all locations (admin - including inactive)
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching all locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
};

// Create new location (admin only)
const createLocation = async (req, res) => {
  try {
    const { name, type, country, code } = req.body;

    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: "Location already exists",
      });
    }

    const location = new Location({
      name,
      type: type || "city",
      country,
      code,
      isActive: true,
    });

    await location.save();

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create location",
    });
  }
};

// Update location (admin only)
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, country, code, isActive } = req.body;

    const location = await Location.findByIdAndUpdate(
      id,
      { name, type, country, code, isActive },
      { new: true, runValidators: true },
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    res.json({
      success: true,
      message: "Location updated successfully",
      data: location,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update location",
    });
  }
};

// Delete location (admin only)
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete location",
    });
  }
};

export {
  getLocations,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};
