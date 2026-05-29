const Habit = require("../models/habit.model");
const {
  generateAndStoreProductivityInsight,
} = require("../services/productivity.service");

async function getProductivityInsight(req, res) {
  const habits = await Habit.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  const insight = await generateAndStoreProductivityInsight(req.user.id, habits);

  res.json({
    insight,
  });
}

module.exports = {
  getProductivityInsight,
};
