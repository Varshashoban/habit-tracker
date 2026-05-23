const Habit = require("../models/habit.model");
const {
  isCompletedToday,
  serializeHabit,
} = require("../services/habit.service");

async function getDashboard(req, res) {
  const habits = await Habit.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  const serializedHabits = habits.map(serializeHabit);
  const activeStreak = serializedHabits.reduce(
    (longestStreak, habit) => Math.max(longestStreak, habit.streak),
    0,
  );
  const completedToday = habits.filter((habit) =>
    isCompletedToday(habit.completedDates),
  ).length;
  const weeklyCompletionRate = serializedHabits.length
    ? Math.round(
        serializedHabits.reduce(
          (total, habit) => total + habit.completionRate,
          0,
        ) / serializedHabits.length,
      )
    : 0;

  res.json({
    message: `Welcome back, ${req.user.name}.`,
    summary: {
      activeStreak,
      completedToday,
      habitsDueToday: Math.max(habits.length - completedToday, 0),
      totalHabits: habits.length,
      weeklyCompletionRate,
    },
    user: req.user.toAuthJSON(),
  });
}

module.exports = {
  getDashboard,
};
