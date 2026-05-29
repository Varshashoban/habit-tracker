const ProductivityInsight = require("../models/productivityInsight.model");
const { toDateKey } = require("./habit.service");

const weekdayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
});

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return Math.min(max, Math.max(min, toFiniteNumber(value, 0)));
}

function clampPercentage(value) {
  return Math.round(clampNumber(value, 0, 100));
}

function safeDivide(numerator, denominator, fallback = 0) {
  const safeDenominator = toFiniteNumber(denominator);

  if (!safeDenominator) {
    return fallback;
  }

  return toFiniteNumber(numerator) / safeDenominator;
}

function getCompletedDates(habit) {
  return Array.isArray(habit?.completedDates) ? habit.completedDates : [];
}

function getHabitStreak(habit) {
  return clampNumber(habit?.streak);
}

function startOfDay(date = new Date()) {
  return new Date(`${toDateKey(date)}T00:00:00.000Z`);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getWeekday(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 0;
  }

  return parsedDate.getUTCDay();
}

function isWithinScheduleBounds(habit, date) {
  const dateKey = toDateKey(date);
  const startDate = habit?.startDate || habit?.createdAt || new Date();
  const startDateKey = toDateKey(startDate);
  const endDateKey = habit?.endDate ? toDateKey(habit.endDate) : null;

  return dateKey >= startDateKey && (!endDateKey || dateKey <= endDateKey);
}

function isHabitScheduledOnDate(habit, date) {
  if (!habit || !isWithinScheduleBounds(habit, date)) {
    return false;
  }

  const dateKey = toDateKey(date);
  const weekday = getWeekday(date);
  const scheduledDays = Array.isArray(habit.scheduledDays)
    ? habit.scheduledDays
    : [];

  if (habit.frequency === "specific_dates") {
    return (Array.isArray(habit.specificDates) ? habit.specificDates : [])
      .map(toDateKey)
      .includes(dateKey);
  }

  if (habit.frequency === "custom_weekdays") {
    return scheduledDays.includes(weekday);
  }

  if (habit.frequency === "weekly") {
    return scheduledDays.length
      ? scheduledDays.includes(weekday)
      : weekday === getWeekday(habit.startDate || habit.createdAt);
  }

  return true;
}

function isHabitCompletedOnDate(habit, date) {
  const dateKey = toDateKey(date);
  return getCompletedDates(habit).some(
    (completedDate) => toDateKey(completedDate) === dateKey,
  );
}

function getTimeline(habits) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const today = startOfDay();

  return Array.from({ length: 30 }, (_, index) => {
    const date = addDays(today, index - 29);
    const scheduledHabits = safeHabits.filter((habit) =>
      isHabitScheduledOnDate(habit, date),
    );
    const completed = scheduledHabits.filter((habit) =>
      isHabitCompletedOnDate(habit, date),
    ).length;
    const isPast = date < today;
    const missed = isPast ? Math.max(0, scheduledHabits.length - completed) : 0;

    return {
      completed: clampNumber(completed),
      date: toDateKey(date),
      missed: clampNumber(missed),
      percentage: scheduledHabits.length
        ? clampPercentage(safeDivide(completed, scheduledHabits.length) * 100)
        : 0,
      scheduled: clampNumber(scheduledHabits.length),
    };
  });
}

function getHabitCompletionRate(habit, timeline) {
  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const scheduledDates = safeTimeline.filter((day) =>
    isHabitScheduledOnDate(habit, new Date(`${day.date}T00:00:00.000Z`)),
  );
  const completed = scheduledDates.filter((day) =>
    isHabitCompletedOnDate(habit, new Date(`${day.date}T00:00:00.000Z`)),
  ).length;

  if (scheduledDates.length) {
    return clampPercentage(safeDivide(completed, scheduledDates.length) * 100);
  }

  return getCompletedDates(habit).length ? 100 : 0;
}

function getWeeklyTrend(timeline) {
  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const recent = safeTimeline.slice(-7);
  const previous = safeTimeline.slice(-14, -7);
  const average = (days) =>
    days.length
      ? safeDivide(
          days.reduce(
            (total, day) => total + clampPercentage(day.percentage),
            0,
          ),
          days.length,
        )
      : 0;

  return Math.round(toFiniteNumber(average(recent) - average(previous)));
}

function getStrongestWeekday(timeline) {
  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const byWeekday = new Map();

  safeTimeline.forEach((day) => {
    const weekday = weekdayFormatter.format(new Date(`${day.date}T00:00:00.000Z`));
    const current = byWeekday.get(weekday) || { completed: 0, scheduled: 0 };
    byWeekday.set(weekday, {
      completed: current.completed + clampNumber(day.completed),
      scheduled: current.scheduled + clampNumber(day.scheduled),
    });
  });

  return [...byWeekday.entries()]
    .map(([weekday, stats]) => ({
      percentage: stats.scheduled
        ? clampPercentage(safeDivide(stats.completed, stats.scheduled) * 100)
        : 0,
      weekday,
    }))
    .sort((left, right) => right.percentage - left.percentage)[0];
}

function calculateScore({ missedHabits, streakConsistency, todayCompletion, trend }) {
  const missedPenalty = Math.min(25, clampNumber(missedHabits) * 3);
  const trendScore = clampPercentage(50 + toFiniteNumber(trend));
  const score =
    clampPercentage(todayCompletion) * 0.45 +
    clampPercentage(streakConsistency) * 0.25 +
    trendScore * 0.2 +
    (100 - missedPenalty) * 0.1;

  return clampPercentage(score);
}

function getHabitTitle(habit) {
  return habit?.title || "Untitled habit";
}

function buildProductivityInsight(userId, habits) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const timeline = getTimeline(safeHabits);
  const today = timeline[timeline.length - 1] || {
    missed: 0,
    percentage: 0,
    scheduled: 0,
  };
  const trend = getWeeklyTrend(timeline);
  const totalStreak = safeHabits.reduce(
    (total, habit) => total + getHabitStreak(habit),
    0,
  );
  const streakConsistency = safeHabits.length
    ? clampPercentage(safeDivide(totalStreak, safeHabits.length * 7) * 100)
    : 0;
  const missedHabits = timeline
    .slice(-7)
    .reduce((total, day) => total + clampNumber(day.missed), 0);
  const score = safeHabits.length
    ? calculateScore({
        missedHabits,
        streakConsistency,
        todayCompletion: today.percentage,
        trend,
      })
    : 0;

  const enrichedHabits = safeHabits.map((habit) => ({
    completionRate: getHabitCompletionRate(habit, timeline),
    completedDates: getCompletedDates(habit).length,
    habit,
  }));
  const focusHabit = [...enrichedHabits].sort((left, right) => {
    if (right.completionRate !== left.completionRate) {
      return right.completionRate - left.completionRate;
    }

    return getHabitStreak(right.habit) - getHabitStreak(left.habit);
  })[0];
  const lowestHabit = [...enrichedHabits]
    .filter((entry) => entry.completedDates || entry.completionRate < 70)
    .sort((left, right) => left.completionRate - right.completionRate)[0];
  const strongestWeekday = getStrongestWeekday(timeline);
  const coachMessages = [];

  if (!safeHabits.length) {
    coachMessages.push(
      "Create your first habit to start generating productivity intelligence.",
    );
  }

  if (strongestWeekday && strongestWeekday.percentage > 0) {
    coachMessages.push(
      `You are strongest on ${strongestWeekday.weekday}s with ${strongestWeekday.percentage}% completion.`,
    );
  }

  if (focusHabit) {
    coachMessages.push(
      `${getHabitTitle(focusHabit.habit)} is your highest performing habit at ${focusHabit.completionRate}%.`,
    );
  }

  if (safeHabits.length) {
    if (trend >= 0) {
      coachMessages.push(`Your weekly completion trend is up ${trend}%.`);
    } else {
      coachMessages.push(`Your weekly completion trend is down ${Math.abs(trend)}%.`);
    }
  }

  const atRisk = enrichedHabits.filter((entry) => {
    const scheduledTomorrow = isHabitScheduledOnDate(
      entry.habit,
      addDays(startOfDay(), 1),
    );
    const incompleteToday =
      isHabitScheduledOnDate(entry.habit, startOfDay()) &&
      !isHabitCompletedOnDate(entry.habit, startOfDay());

    return scheduledTomorrow && incompleteToday && getHabitStreak(entry.habit) > 0;
  });

  if (atRisk.length) {
    coachMessages.push(`${getHabitTitle(atRisk[0].habit)} has a streak at risk tomorrow.`);
  }

  const recommendations = [];

  if (lowestHabit && lowestHabit.completionRate < 50) {
    recommendations.push({
      habitId: String(lowestHabit.habit.id || ""),
      message: `${getHabitTitle(lowestHabit.habit)} is below 50%. Reduce frequency or shrink the task until it becomes automatic.`,
      title: getHabitTitle(lowestHabit.habit),
      type: "reduce_frequency",
    });
  }

  if (focusHabit && focusHabit.completionRate >= 85) {
    recommendations.push({
      habitId: String(focusHabit.habit.id || ""),
      message: `${getHabitTitle(focusHabit.habit)} is consistently strong. Consider increasing the goal slightly this week.`,
      title: getHabitTitle(focusHabit.habit),
      type: "increase_goal",
    });
  }

  enrichedHabits
    .filter((entry) => entry.completionRate < 70)
    .slice(0, 3)
    .forEach((entry) => {
      recommendations.push({
        habitId: String(entry.habit.id || ""),
        message: `${getHabitTitle(entry.habit)} needs attention at ${entry.completionRate}% completion.`,
        title: getHabitTitle(entry.habit),
        type: "needs_attention",
      });
    });

  const riskHabits = atRisk.map((entry) => ({
    habitId: String(entry.habit.id || ""),
    message: `${getHabitTitle(entry.habit)} is scheduled tomorrow and today's check-in is still open.`,
    riskLevel: entry.completionRate < 50 ? "high" : "medium",
    streak: getHabitStreak(entry.habit),
    title: getHabitTitle(entry.habit),
  }));

  return {
    coachMessages,
    focusHabit: focusHabit
      ? {
          completionRate: clampPercentage(focusHabit.completionRate),
          completedDates: clampNumber(focusHabit.completedDates),
          habitId: String(focusHabit.habit.id || ""),
          streak: getHabitStreak(focusHabit.habit),
          title: getHabitTitle(focusHabit.habit),
        }
      : null,
    metrics: {
      missedHabits: clampNumber(missedHabits),
      streakConsistency: clampPercentage(streakConsistency),
      todayCompletion: clampPercentage(today.percentage),
      trend: toFiniteNumber(trend),
    },
    recommendations,
    riskHabits,
    score,
    timeline,
    userId,
  };
}

async function generateAndStoreProductivityInsight(userId, habits) {
  const insight = buildProductivityInsight(userId, habits);
  const savedInsight = await ProductivityInsight.create(insight);

  return savedInsight;
}

module.exports = {
  generateAndStoreProductivityInsight,
};
