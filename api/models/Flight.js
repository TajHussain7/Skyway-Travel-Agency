import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, "Flight number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    origin: {
      type: String,
      required: [true, "Origin is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    departureTime: {
      type: Date,
      required: [true, "Departure time is required"],
    },
    arrivalTime: {
      type: Date,
      required: [true, "Arrival time is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Total seats must be at least 1"],
    },
    availableSeats: {
      type: Number,
      min: [0, "Available seats cannot be negative"],
    },
    airline: {
      type: String,
      required: [true, "Airline is required"],
      trim: true,
    },
    aircraft: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    distance: {
      type: String,
      trim: true,
    },
    gate: {
      type: String,
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    businessPrice: {
      type: Number,
      min: [0, "Business price must be positive"],
    },
    firstClassPrice: {
      type: Number,
      min: [0, "First class price must be positive"],
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "cancelled", "completed", "delayed"],
      default: "scheduled",
    },
    // Archive fields for lifecycle management
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
    },
    archivedReason: {
      type: String,
      enum: ["completed", "cancelled", "expired", "manual"],
    },
    // Revenue and booking statistics
    bookedSeats: {
      type: Number,
      default: 0,
    },
    revenueGenerated: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Set availableSeats to totalSeats if not provided
flightSchema.pre("save", function (next) {
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

// Validate arrival time is after departure time
flightSchema.pre("save", function (next) {
  if (this.arrivalTime <= this.departureTime) {
    next(new Error("Arrival time must be after departure time"));
  }
  next();
});

// Static method to search flights
flightSchema.statics.search = async function (origin, destination, date) {
  const query = {
    status: { $in: ["scheduled", "active"] },
    isArchived: { $ne: true },
  };

  if (origin) {
    query.origin = { $regex: origin, $options: "i" };
  }

  if (destination) {
    query.destination = { $regex: destination, $options: "i" };
  }

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    query.departureTime = {
      $gte: searchDate,
      $lt: nextDay,
    };
  }

  return await this.find(query).sort({ departureTime: 1 });
};

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;
