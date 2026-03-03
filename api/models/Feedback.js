import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Can be from deleted/archived users
    },
    userEmail: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    userName: {
      type: String,
      required: false,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "account_deletion",
        "general",
        "suggestion",
        "complaint",
        "mandatory",
        "evaluation",
      ],
      default: "general",
    },
    category: {
      type: String,
      enum: [
        "general",
        "booking",
        "customer_service",
        "website",
        "flights",
        "pricing",
        "other",
      ],
      default: "general",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["new", "read", "resolved"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
