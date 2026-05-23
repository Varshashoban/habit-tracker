const Habit = require("../models/habit.model");
const {
  addUniqueCompletionDate,
  serializeHabit,
} = require("../services/habit.service");
const AppError = require("../utils/appError");

const allowedFrequencies = new Set(["daily", "weekly"]);

function validateHabitInput({ title, frequency }) {
  if (typeof title !== "string" || !title.trim()) {
    throw new AppError(400, "Habit title is required.");
  }

  if (frequency && !allowedFrequencies.has(frequency)) {
    throw new AppError(400, "Frequency must be daily or weekly.");
  }
}

async function getUserHabit(userId, habitId) {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new AppError(404, "Habit was not found.");
  }

  return habit;
}

async function createHabit(req, res) {
  const { description = "", frequency = "daily", title } = req.body;

  validateHabitInput({ frequency, title });

  const habit = await Habit.create({
    description: typeof description === "string" ? description.trim() : "",
    frequency,
    title: title.trim(),
    userId: req.user.id,
  });

  res.status(201).json({
    habit: serializeHabit(habit),
  });
}

async function getHabits(req, res) {
  const habits = await Habit.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json({
    habits: habits.map(serializeHabit),
  });
}

async function updateHabit(req, res) {
  const habit = await getUserHabit(req.user.id, req.params.habitId);
  const { completedDate, description, frequency, title } = req.body;

  if (title !== undefined || frequency !== undefined) {
    validateHabitInput({
      frequency: frequency || habit.frequency,
      title: title === undefined ? habit.title : title,
    });
  }

  if (title !== undefined) {
    habit.title = title.trim();
  }

  if (description !== undefined) {
    habit.description = typeof description === "string" ? description.trim() : "";
  }

  if (frequency !== undefined) {
    habit.frequency = frequency;
  }

  if (completedDate !== undefined) {
    habit.completedDates = addUniqueCompletionDate(
      habit.completedDates,
      completedDate || new Date(),
    );
  }

  await habit.save();

  res.json({
    habit: serializeHabit(habit),
  });
}

async function completeHabit(req, res) {
  const habit = await getUserHabit(req.user.id, req.params.habitId);

  habit.completedDates = addUniqueCompletionDate(
    habit.completedDates,
    req.body.completedDate || new Date(),
  );

  await habit.save();

  res.json({
    habit: serializeHabit(habit),
  });
}

async function deleteHabit(req, res) {
  const habit = await getUserHabit(req.user.id, req.params.habitId);

  await habit.deleteOne();

  res.status(204).send();
}

module.exports = {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabits,
  updateHabit,
};
