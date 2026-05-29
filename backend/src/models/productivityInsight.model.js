const mongoose = require("mongoose");

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
    },
    coachMessages: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [
        {
          habitId: String,
          message: String,
          title: String,
          type: String,
        },
      ],
      default: [],
    },
    riskHabits: {
      type: [
        {
          habitId: String,
          message: String,
          riskLevel: String,
          streak: Number,
          title: String,
        },
      ],
      default: [],
    },
    focusHabit: {
      type: {
        completionRate: Number,
        completedDates: Number,
        habitId: String,
        streak: Number,
        title: String,
      },
      default: null,
    },
    timeline: {
      type: [
        {
          completed: Number,
          date: String,
          missed: Number,
          percentage: Number,
          scheduled: Number,
        },
      ],
      default: [],
    },
    metrics: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

productivityInsightSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ProductivityInsight", productivityInsightSchema);
