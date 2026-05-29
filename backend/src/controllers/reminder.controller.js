const Habit = require("../models/habit.model");
const Reminder = require("../models/reminder.model");
const {
  getReminderStats,
  getSmartReminderSuggestions,
  serializeReminder,
} = require("../services/reminder.service");
const AppError = require("../utils/appError");

const allowedFrequencies = new Set(["daily", "weekly", "custom_weekdays"]);

function validateReminderPayload({ frequency, habitId, time }) {
  if (!habitId) {
    throw new AppError(400, "Habit is required.");
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) {
    throw new AppError(400, "Reminder time must be HH:mm.");
  }

  if (frequency && !allowedFrequencies.has(frequency)) {
    throw new AppError(400, "Reminder frequency is invalid.");
  }
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

async function getUserHabit(userId, habitId) {
  const habit = await Habit.findOne({ _id: habitId, userId });

  if (!habit) {
    throw new AppError(404, "Habit was not found.");
  }

  return habit;
}

async function getUserReminder(userId, reminderId) {
  const reminder = await Reminder.findOne({ _id: reminderId, userId });

  if (!reminder) {
    throw new AppError(404, "Reminder was not found.");
  }

  return reminder;
}

async function getReminders(req, res) {
  const reminders = await Reminder.find({ userId: req.user.id })
    .populate("habitId")
    .sort({ createdAt: -1 });
  const habits = await Habit.find({ userId: req.user.id });

  res.json({
    reminders: reminders.map(serializeReminder),
    stats: getReminderStats(reminders),
    suggestions: getSmartReminderSuggestions(habits),
  });
}

async function createReminder(req, res) {
  const {
    frequency = "daily",
    habitId,
    isActive = true,
    message = "",
    time,
  } = req.body;

  validateReminderPayload({ frequency, habitId, time });
  await getUserHabit(req.user.id, habitId);

  const reminder = await Reminder.create({
    frequency,
    habitId,
    isActive,
    message: typeof message === "string" ? message.trim() : "",
    scheduledDays: parseScheduledDays(req.body.scheduledDays) || [],
    time,
    userId: req.user.id,
  });

  await reminder.populate("habitId");

  res.status(201).json({
    reminder: serializeReminder(reminder),
  });
}

async function updateReminder(req, res) {
  const reminder = await getUserReminder(req.user.id, req.params.reminderId);

  if (req.body.habitId !== undefined) {
    await getUserHabit(req.user.id, req.body.habitId);
    reminder.habitId = req.body.habitId;
  }

  if (req.body.time !== undefined) {
    validateReminderPayload({
      frequency: req.body.frequency || reminder.frequency,
      habitId: reminder.habitId,
      time: req.body.time,
    });
    reminder.time = req.body.time;
  }

  if (req.body.frequency !== undefined) {
    validateReminderPayload({
      frequency: req.body.frequency,
      habitId: reminder.habitId,
      time: reminder.time,
    });
    reminder.frequency = req.body.frequency;
  }

  if (req.body.message !== undefined) {
    reminder.message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";
  }

  if (req.body.isActive !== undefined) {
    reminder.isActive = Boolean(req.body.isActive);
  }

  const scheduledDays = parseScheduledDays(req.body.scheduledDays);

  if (scheduledDays !== undefined) {
    reminder.scheduledDays = scheduledDays;
  }

  await reminder.save();
  await reminder.populate("habitId");

  res.json({
    reminder: serializeReminder(reminder),
  });
}

async function deleteReminder(req, res) {
  const reminder = await getUserReminder(req.user.id, req.params.reminderId);

  await reminder.deleteOne();

  res.status(204).send();
}

module.exports = {
  createReminder,
  deleteReminder,
  getReminders,
  updateReminder,
};
