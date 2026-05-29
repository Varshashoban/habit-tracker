const mongoose = require("mongoose");

function clampNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return Math.min(max, Math.max(min, 0));
  }

  return Math.min(max, Math.max(min, number));
}

const recommendationSchema = new mongoose.Schema(
  {
    habitId: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "general",
    },
  },
  { _id: false },
);

const riskHabitSchema = new mongoose.Schema(
  {
    habitId: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    riskLevel: {
      type: String,
      default: "low",
    },
    streak: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value),
    },
    title: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const timelineSchema = new mongoose.Schema(
  {
    completed: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value),
    },
    date: {
      type: String,
      default: "",
    },
    missed: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value),
    },
    percentage: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value, 0, 100),
    },
    scheduled: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value),
    },
  },
  { _id: false },
);

const focusHabitSchema = new mongoose.Schema(
  {
    completionRate: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value, 0, 100),
    },
    completedDates: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value),
    },
    habitId: {
      type: String,
      default: "",
    },
    streak: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value),
    },
    title: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const metricsSchema = new mongoose.Schema(
  {
    missedHabits: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value),
    },
    streakConsistency: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value, 0, 100),
    },
    todayCompletion: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value, 0, 100),
    },
    trend: {
      type: Number,
      default: 0,
      set: (value) => clampNumber(value, -100, 100),
    },
  },
  { _id: false },
);

const productivityInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      set: (value) => clampNumber(value, 0, 100),
    },
    coachMessages: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [recommendationSchema],
      default: [],
    },
    riskHabits: {
      type: [riskHabitSchema],
      default: [],
    },
    focusHabit: {
      type: focusHabitSchema,
      default: null,
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
    metrics: {
      type: metricsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

productivityInsightSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ProductivityInsight", productivityInsightSchema);
