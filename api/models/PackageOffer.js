import mongoose from "mongoose";

const packageOfferSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "World Tour",
        "Umrah",
        "Hajj",
        "Umrah & Hajj",
        "Adventure Tour",
        "Membership & Student Discounts",
      ],
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
    priceUnit: {
      type: String,
      default: "per person",
      enum: ["per person", "per group", "annual fee", "percentage"],
    },
    badge: {
      type: String,
      default: "",
      // e.g., "Premium", "Popular", "Best Value", "Budget Friendly"
    },
    badgeColor: {
      type: String,
      default: "blue",
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    features: [
      {
        icon: {
          type: String,
          default: "fas fa-check",
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
    fullDetails: {
      type: String,
      default: "",
    },
    inclusions: [
      {
        type: String,
      },
    ],
    isVisible: {
      type: Boolean,
      default: true,
    },
    isBookable: {
      type: Boolean,
      default: true,
    },
    maxBookings: {
      type: Number,
      default: null, // null means unlimited
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: [0, "Current bookings cannot be negative"],
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validTo: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Check if offer is still valid
packageOfferSchema.methods.isValid = function () {
  const now = new Date();
  if (this.validTo && now > this.validTo) {
    return false;
  }
  if (now < this.validFrom) {
    return false;
  }
  if (this.maxBookings !== null && this.currentBookings >= this.maxBookings) {
    return false;
  }
  return this.isVisible && this.isBookable;
};

// Check if bookings are available
packageOfferSchema.methods.hasAvailableSlots = function () {
  if (this.maxBookings === null) {
    return true;
  }
  return this.currentBookings < this.maxBookings;
};

const PackageOffer = mongoose.model("PackageOffer", packageOfferSchema);

export default PackageOffer;
