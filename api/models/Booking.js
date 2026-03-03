import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    bookingType: {
      type: String,
      required: [true, "Booking type is required"],
      enum: ["flight", "package"],
      default: "flight",
    },
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: function () {
        return this.bookingType === "flight";
      },
    },
    packageOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackageOffer",
      required: function () {
        return this.bookingType === "package";
      },
    },
    seatCount: {
      type: Number,
      required: function () {
        return this.bookingType === "flight";
      },
      min: [1, "Seat count must be at least 1"],
      max: [10, "Cannot book more than 10 seats at once"],
    },
    seatNumbers: {
      type: [String],
      default: [],
      validate: {
        validator: function (seats) {
          if (this.bookingType === "flight" && this.seatCount) {
            return seats.length === this.seatCount;
          }
          return true;
        },
        message: "Number of seat numbers must match seat count",
      },
    },
    personCount: {
      type: Number,
      required: function () {
        return this.bookingType === "package";
      },
      min: [1, "Person count must be at least 1"],
      max: [20, "Cannot book for more than 20 persons at once"],
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price must be positive"],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    passengerDetails: [
      {
        name: {
          type: String,
          required: [true, "Passenger name is required"],
        },
        age: {
          type: Number,
          required: [true, "Passenger age is required"],
          min: [0, "Age must be positive"],
          max: [120, "Age seems invalid"],
        },
        gender: {
          type: String,
          required: [true, "Passenger gender is required"],
          enum: ["male", "female", "other"],
        },
        email: {
          type: String,
        },
        phone: {
          type: String,
        },
        passportNumber: {
          type: String,
        },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    bookingReference: {
      type: String,
      unique: true,
      sparse: true,
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
  },
  {
    timestamps: true,
  }
);

// Generate booking reference and ticket number before saving
bookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.bookingReference = `SW${new Date().getFullYear()}${timestamp}${random}`;
  }

  // Generate ticket number only when confirmed
  if (this.status === "confirmed" && !this.ticketNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.ticketNumber = `TKT${new Date().getFullYear()}${timestamp}${random}`;
  }

  next();
});

// Validate passenger details match seat count or person count
bookingSchema.pre("save", function (next) {
  if (this.bookingType === "flight") {
    if (this.passengerDetails.length !== this.seatCount) {
      next(new Error("Number of passengers must match seat count"));
    }
  } else if (this.bookingType === "package") {
    if (this.passengerDetails.length !== this.personCount) {
      next(new Error("Number of passengers must match person count"));
    }
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
