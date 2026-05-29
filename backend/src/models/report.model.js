const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["advanced"],
      default: "advanced",
    },
    title: {
      type: String,
      default: "HabitFlow Advanced Report",
    },
    summary: {
      type: Object,
      default: {},
    },
    charts: {
      type: Object,
      default: {},
    },
    rankings: {
      type: [Object],
      default: [],
    },
    insights: {
      type: [String],
      default: [],
    },
    achievementSummary: {
      type: Object,
      default: {},
    },
    performanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      set(value) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
      },
    },
    habitHistory: {
      type: [Object],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
