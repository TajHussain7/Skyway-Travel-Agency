import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["percentage", "fixed", "special"],
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage must be positive"],
      max: [100, "Discount percentage cannot exceed 100"],
    },
    discountAmount: {
      type: Number,
      min: [0, "Discount amount must be positive"],
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validTo: {
      type: Date,
      required: [true, "Valid to date is required"],
    },
    maxRedemptions: {
      type: Number,
      min: [1, "Max redemptions must be at least 1"],
    },
    currentRedemptions: {
      type: Number,
      default: 0,
      min: [0, "Current redemptions cannot be negative"],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase amount must be positive"],
    },
    applicableServices: [
      {
        type: String,
        enum: ["flights", "umrah", "hajj", "all"],
      },
    ],
    termsConditions: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    promoCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate promo code before saving
offerSchema.pre("save", function (next) {
  if (!this.promoCode) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "SKYWAY";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.promoCode = result;
  }
  next();
});

// Validate dates
offerSchema.pre("save", function (next) {
  if (this.validFrom >= this.validTo) {
    next(new Error("Valid from date must be before valid to date"));
  }
  next();
});

// Validate discount type requirements
offerSchema.pre("save", function (next) {
  if (this.type === "percentage" && !this.discountPercentage) {
    next(new Error("Discount percentage is required for percentage offers"));
  }
  if (this.type === "fixed" && !this.discountAmount) {
    next(new Error("Discount amount is required for fixed amount offers"));
  }
  next();
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
