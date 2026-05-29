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
      enum: ["daily", "weekly", "specific_dates", "custom_weekdays"],
      default: "daily",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    scheduledDays: {
      type: [Number],
      default: [],
      validate: {
        validator(days) {
          return days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
        },
        message: "Scheduled days must be valid weekday numbers.",
      },
    },
    specificDates: {
      type: [Date],
      default: [],
    },
    targetCompletionsPerWeek: {
      type: Number,
      default: 7,
      min: [1, "Target completions per week must be at least 1."],
      max: [7, "Target completions per week must be 7 or fewer."],
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
