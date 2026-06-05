const Habit = require("../models/habit.model");
const { serializeHabit } = require("../services/habit.service");
const { calculateForecast } = require("../services/forecast.service");

async function getForecast(req, res) {
  const habits = await Habit.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  const serializedHabits = habits.map(serializeHabit);
  const forecast = calculateForecast(habits, serializedHabits);

  res.json(forecast);
}

module.exports = {
  getForecast,
};
