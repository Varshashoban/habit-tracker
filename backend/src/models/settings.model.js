const mongoose = require("mongoose");

const productivityHoursSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      default: "09:00",
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be HH:mm."],
    },
    end: {
      type: String,
      default: "17:00",
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be HH:mm."],
    },
  },
  { _id: false },
);

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    notifications: {
      browser: {
        type: Boolean,
        default: true,
      },
      reminders: {
        type: Boolean,
        default: true,
      },
      achievements: {
        type: Boolean,
        default: true,
      },
    },
    productivity: {
      dailyHabitGoal: {
        type: Number,
        default: 3,
        min: [1, "Daily habit goal must be at least 1."],
        max: [50, "Daily habit goal must be 50 or fewer."],
      },
      weeklyCompletionGoal: {
        type: Number,
        default: 80,
        min: [1, "Weekly completion goal must be at least 1%."],
        max: [100, "Weekly completion goal must be 100% or lower."],
      },
      preferredHours: {
        type: productivityHoursSchema,
        default: () => ({}),
      },
    },
    account: {
      darkMode: {
        type: Boolean,
        default: true,
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
        trim: true,
        maxlength: [80, "Timezone must be 80 characters or fewer."],
      },
      firstDayOfWeek: {
        type: String,
        enum: ["sunday", "monday"],
        default: "monday",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Settings", settingsSchema);
