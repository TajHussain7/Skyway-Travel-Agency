import mongoose from "mongoose";

const umrahPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["hajj", "umrah"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    departureDate: {
      type: Date,
      required: [true, "Departure date is required"],
    },
    plane: {
      type: String,
      required: [true, "Flight class is required"],
      enum: ["Economy", "Business", "First Class"],
    },
    hotel: {
      type: String,
      required: [true, "Hotel is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      enum: ["Makkah", "Madinah"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    availability: {
      type: Number,
      required: [true, "Available seats is required"],
      min: [0, "Available seats cannot be negative"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Total seats must be at least 1"],
    },
    amenities: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validate departure date is in the future
umrahPackageSchema.pre("save", function (next) {
  if (this.isNew && this.departureDate <= new Date()) {
    next(new Error("Departure date must be in the future"));
  }
  next();
});

// Validate availability doesn't exceed total seats
umrahPackageSchema.pre("save", function (next) {
  if (this.availability > this.totalSeats) {
    next(new Error("Available seats cannot exceed total seats"));
  }
  next();
});

const UmrahPackage = mongoose.model("UmrahPackage", umrahPackageSchema);

export default UmrahPackage;
