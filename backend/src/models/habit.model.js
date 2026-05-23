const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer."],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description must be 500 characters or fewer."],
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
    completedDates: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

habitSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Habit", habitSchema);
