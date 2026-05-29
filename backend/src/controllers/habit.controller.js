const Habit = require("../models/habit.model");
const User = require("../models/user.model");
const {
  addUniqueCompletionDate,
  serializeHabit,
  toDateKey,
} = require("../services/habit.service");
const AppError = require("../utils/appError");

const allowedFrequencies = new Set([
  "custom_weekdays",
  "daily",
  "specific_dates",
  "weekly",
]);

function parseOptionalDate(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === "" || value === null) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, `${fieldName} is invalid.`);
  }

  return date;
}

function parseDateArray(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new AppError(400, `${fieldName} must be an array.`);
  }

  return value
    .filter(Boolean)
    .map((dateValue) => {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        throw new AppError(400, `${fieldName} contains an invalid date.`);
      }

      return date;
    });
}

function parseScheduledDays(value) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new AppError(400, "Scheduled days must be an array.");
  }

  const days = [...new Set(value.map(Number))].sort((left, right) => left - right);
  const validDays = days.every(
    (day) => Number.isInteger(day) && day >= 0 && day <= 6,
  );

  if (!validDays) {
    throw new AppError(400, "Scheduled days must be valid weekday numbers.");
  }

  return days;
}

function parseWeeklyTarget(value) {
  if (value === undefined || value === "") {
    return undefined;
  }

  const target = Number(value);

  if (!Number.isInteger(target) || target < 1 || target > 7) {
    throw new AppError(400, "Target completions per week must be 1 to 7.");
  }

  return target;
}

function validateHabitInput({ title, frequency }) {
  if (typeof title !== "string" || !title.trim()) {
    throw new AppError(400, "Habit title is required.");
  }

  if (frequency && !allowedFrequencies.has(frequency)) {
    throw new AppError(400, "Frequency is invalid.");
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

function getCompletionXp(frequency) {
  return frequency === "weekly" ? 20 : 10;
}

function hasCompletionDate(completedDates, date) {
  const nextDateKey = toDateKey(date || new Date());
  return completedDates.some((completedDate) => toDateKey(completedDate) === nextDateKey);
}

async function grantCompletionXp(userId, habit) {
  return User.findByIdAndUpdate(
    userId,
    { $inc: { xp: getCompletionXp(habit.frequency) } },
    { new: true },
  );
}

async function createHabit(req, res) {
  const {
    description = "",
    frequency = "daily",
    title,
  } = req.body;

  validateHabitInput({ frequency, title });

  const habit = await Habit.create({
    description: typeof description === "string" ? description.trim() : "",
    endDate: parseOptionalDate(req.body.endDate, "End date") || null,
    frequency,
    scheduledDays: parseScheduledDays(req.body.scheduledDays) || [],
    specificDates: parseDateArray(req.body.specificDates, "Specific dates") || [],
    startDate: parseOptionalDate(req.body.startDate, "Start date") || new Date(),
    targetCompletionsPerWeek:
      parseWeeklyTarget(req.body.targetCompletionsPerWeek) ||
      (frequency === "weekly" ? 1 : 7),
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

  const startDate = parseOptionalDate(req.body.startDate, "Start date");
  const endDate = parseOptionalDate(req.body.endDate, "End date");
  const scheduledDays = parseScheduledDays(req.body.scheduledDays);
  const specificDates = parseDateArray(req.body.specificDates, "Specific dates");
  const targetCompletionsPerWeek = parseWeeklyTarget(
    req.body.targetCompletionsPerWeek,
  );

  if (startDate !== undefined) {
    habit.startDate = startDate || new Date();
  }

  if (endDate !== undefined) {
    habit.endDate = endDate;
  }

  if (scheduledDays !== undefined) {
    habit.scheduledDays = scheduledDays;
  }

  if (specificDates !== undefined) {
    habit.specificDates = specificDates;
  }

  if (targetCompletionsPerWeek !== undefined) {
    habit.targetCompletionsPerWeek = targetCompletionsPerWeek;
  }

  if (completedDate !== undefined) {
    const alreadyCompleted = hasCompletionDate(
      habit.completedDates,
      completedDate || new Date(),
    );

    habit.completedDates = addUniqueCompletionDate(
      habit.completedDates,
      completedDate || new Date(),
    );

    if (!alreadyCompleted) {
      req.user = await grantCompletionXp(req.user.id, habit);
    }
  }

  await habit.save();

  res.json({
    habit: serializeHabit(habit),
    user: req.user.toAuthJSON(),
  });
}

async function completeHabit(req, res) {
  const habit = await getUserHabit(req.user.id, req.params.habitId);
  const completedDate = req.body.completedDate || new Date();
  const alreadyCompleted = hasCompletionDate(habit.completedDates, completedDate);

  habit.completedDates = addUniqueCompletionDate(habit.completedDates, completedDate);

  if (!alreadyCompleted) {
    req.user = await grantCompletionXp(req.user.id, habit);
  }

  await habit.save();

  res.json({
    habit: serializeHabit(habit),
    user: req.user.toAuthJSON(),
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
