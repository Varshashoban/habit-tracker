const AppError = require("../utils/appError");

function toDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function normalizeDate(date = new Date()) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(400, "Completion date is invalid.");
  }

  const dateKey = toDateKey(parsedDate);
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addUniqueCompletionDate(completedDates, date = new Date()) {
  const nextDate = normalizeDate(date);
  const nextDateKey = toDateKey(nextDate);
  const existingKeys = new Set(completedDates.map(toDateKey));

  if (existingKeys.has(nextDateKey)) {
    return completedDates;
  }

  return [...completedDates, nextDate].sort((left, right) => left - right);
}

function toWeekStart(date) {
  const weekStart = normalizeDate(date);
  const day = weekStart.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);
  return weekStart;
}

function getPeriodKey(date, frequency) {
  if (frequency === "weekly") {
    return toDateKey(toWeekStart(date));
  }

  return toDateKey(date);
}

function moveBackOnePeriod(date, frequency) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() - (frequency === "weekly" ? 7 : 1));
  return nextDate;
}

function getStreak(completedDates, frequency) {
  if (!completedDates.length) {
    return 0;
  }

  const completedKeys = new Set(
    completedDates.map((date) => getPeriodKey(date, frequency)),
  );
  let cursor = frequency === "weekly" ? toWeekStart(new Date()) : normalizeDate();

  if (!completedKeys.has(getPeriodKey(cursor, frequency))) {
    cursor = moveBackOnePeriod(cursor, frequency);
  }

  let streak = 0;

  while (completedKeys.has(getPeriodKey(cursor, frequency))) {
    streak += 1;
    cursor = moveBackOnePeriod(cursor, frequency);
  }

  return streak;
}

function isCompletedToday(completedDates) {
  return completedDates.some((date) => toDateKey(date) === toDateKey(new Date()));
}

function getCompletionRate(completedDates, frequency) {
  const windowDays = frequency === "weekly" ? 28 : 7;
  const cutoff = normalizeDate();
  cutoff.setUTCDate(cutoff.getUTCDate() - (windowDays - 1));

  const count = completedDates.filter((date) => normalizeDate(date) >= cutoff).length;
  const target = frequency === "weekly" ? 4 : 7;

  return Math.min(100, Math.round((count / target) * 100));
}

function serializeHabit(habit) {
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description,
    frequency: habit.frequency,
    startDate: habit.startDate ? toDateKey(habit.startDate) : null,
    endDate: habit.endDate ? toDateKey(habit.endDate) : null,
    scheduledDays: habit.scheduledDays || [],
    specificDates: (habit.specificDates || []).map(toDateKey),
    targetCompletionsPerWeek: habit.targetCompletionsPerWeek || 7,
    completedDates: habit.completedDates.map(toDateKey),
    completedToday: isCompletedToday(habit.completedDates),
    completionRate: getCompletionRate(habit.completedDates, habit.frequency),
    streak: getStreak(habit.completedDates, habit.frequency),
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
  };
}

module.exports = {
  addUniqueCompletionDate,
  getCompletionRate,
  getStreak,
  isCompletedToday,
  normalizeDate,
  serializeHabit,
  toDateKey,
};
