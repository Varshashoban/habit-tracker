const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Reminder time must be HH:mm."],
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom_weekdays"],
      default: "daily",
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
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: [240, "Reminder message must be 240 characters or fewer."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

reminderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Reminder", reminderSchema);
