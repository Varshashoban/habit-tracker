const ProductivityInsight = require("../models/productivityInsight.model");
const { toDateKey } = require("./habit.service");

const weekdayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
});

function startOfDay(date = new Date()) {
  return new Date(`${toDateKey(date)}T00:00:00.000Z`);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getWeekday(date) {
  return new Date(date).getUTCDay();
}

function isWithinScheduleBounds(habit, date) {
  const dateKey = toDateKey(date);
  const startDate = habit.startDate || habit.createdAt || new Date();
  const startDateKey = toDateKey(startDate);
  const endDateKey = habit.endDate ? toDateKey(habit.endDate) : null;

  return dateKey >= startDateKey && (!endDateKey || dateKey <= endDateKey);
}

function isHabitScheduledOnDate(habit, date) {
  if (!isWithinScheduleBounds(habit, date)) {
    return false;
  }

  const dateKey = toDateKey(date);
  const weekday = getWeekday(date);
  const scheduledDays = habit.scheduledDays || [];

  if (habit.frequency === "specific_dates") {
    return (habit.specificDates || []).map(toDateKey).includes(dateKey);
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
  return (habit.completedDates || []).some(
    (completedDate) => toDateKey(completedDate) === dateKey,
  );
}

function getTimeline(habits) {
  const today = startOfDay();

  return Array.from({ length: 30 }, (_, index) => {
    const date = addDays(today, index - 29);
    const scheduledHabits = habits.filter((habit) =>
      isHabitScheduledOnDate(habit, date),
    );
    const completed = scheduledHabits.filter((habit) =>
      isHabitCompletedOnDate(habit, date),
    ).length;
    const isPast = date < today;
    const missed = isPast ? scheduledHabits.length - completed : 0;

    return {
      completed,
      date: toDateKey(date),
      missed,
      percentage: scheduledHabits.length
        ? Math.round((completed / scheduledHabits.length) * 100)
        : 0,
      scheduled: scheduledHabits.length,
    };
  });
}

function getHabitCompletionRate(habit, timeline) {
  const scheduledDates = timeline.filter((day) =>
    isHabitScheduledOnDate(habit, new Date(`${day.date}T00:00:00.000Z`)),
  );
  const completed = scheduledDates.filter((day) =>
    isHabitCompletedOnDate(habit, new Date(`${day.date}T00:00:00.000Z`)),
  ).length;

  return scheduledDates.length
    ? Math.round((completed / scheduledDates.length) * 100)
    : habit.completedDates.length
      ? 100
      : 0;
}

function getWeeklyTrend(timeline) {
  const recent = timeline.slice(-7);
  const previous = timeline.slice(-14, -7);
  const average = (days) =>
    days.length
      ? days.reduce((total, day) => total + day.percentage, 0) / days.length
      : 0;

  return Math.round(average(recent) - average(previous));
}

function getStrongestWeekday(timeline) {
  const byWeekday = new Map();

  timeline.forEach((day) => {
    const weekday = weekdayFormatter.format(new Date(`${day.date}T00:00:00.000Z`));
    const current = byWeekday.get(weekday) || { completed: 0, scheduled: 0 };
    byWeekday.set(weekday, {
      completed: current.completed + day.completed,
      scheduled: current.scheduled + day.scheduled,
    });
  });

  return [...byWeekday.entries()]
    .map(([weekday, stats]) => ({
      percentage: stats.scheduled
        ? Math.round((stats.completed / stats.scheduled) * 100)
        : 0,
      weekday,
    }))
    .sort((left, right) => right.percentage - left.percentage)[0];
}

function calculateScore({ missedHabits, streakConsistency, todayCompletion, trend }) {
  const missedPenalty = Math.min(25, missedHabits * 3);
  const trendScore = Math.max(0, Math.min(100, 50 + trend));
  const score =
    todayCompletion * 0.45 +
    streakConsistency * 0.25 +
    trendScore * 0.2 +
    (100 - missedPenalty) * 0.1;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildProductivityInsight(userId, habits) {
  const timeline = getTimeline(habits);
  const today = timeline[timeline.length - 1] || {
    missed: 0,
    percentage: 0,
    scheduled: 0,
  };
  const trend = getWeeklyTrend(timeline);
  const totalStreak = habits.reduce((total, habit) => total + habit.streak, 0);
  const streakConsistency = habits.length
    ? Math.min(100, Math.round((totalStreak / (habits.length * 7)) * 100))
    : 0;
  const missedHabits = timeline.slice(-7).reduce((total, day) => total + day.missed, 0);
  const score = calculateScore({
    missedHabits,
    streakConsistency,
    todayCompletion: today.percentage,
    trend,
  });

  const enrichedHabits = habits.map((habit) => ({
    completionRate: getHabitCompletionRate(habit, timeline),
    completedDates: habit.completedDates.length,
    habit,
  }));
  const focusHabit = [...enrichedHabits].sort((left, right) => {
    if (right.completionRate !== left.completionRate) {
      return right.completionRate - left.completionRate;
    }

    return right.habit.streak - left.habit.streak;
  })[0];
  const lowestHabit = [...enrichedHabits]
    .filter((entry) => entry.habit.completedDates.length || entry.completionRate < 70)
    .sort((left, right) => left.completionRate - right.completionRate)[0];
  const strongestWeekday = getStrongestWeekday(timeline);

  const coachMessages = [];

  if (strongestWeekday && strongestWeekday.percentage > 0) {
    coachMessages.push(
      `You are strongest on ${strongestWeekday.weekday}s with ${strongestWeekday.percentage}% completion.`,
    );
  }

  if (focusHabit) {
    coachMessages.push(
      `${focusHabit.habit.title} is your highest performing habit at ${focusHabit.completionRate}%.`,
    );
  }

  if (trend >= 0) {
    coachMessages.push(`Your weekly completion trend is up ${trend}%.`);
  } else {
    coachMessages.push(`Your weekly completion trend is down ${Math.abs(trend)}%.`);
  }

  const atRisk = enrichedHabits.filter((entry) => {
    const scheduledTomorrow = isHabitScheduledOnDate(entry.habit, addDays(startOfDay(), 1));
    const incompleteToday = isHabitScheduledOnDate(entry.habit, startOfDay()) &&
      !isHabitCompletedOnDate(entry.habit, startOfDay());

    return scheduledTomorrow && incompleteToday && entry.habit.streak > 0;
  });

  if (atRisk.length) {
    coachMessages.push(`${atRisk[0].habit.title} has a streak at risk tomorrow.`);
  }

  const recommendations = [];

  if (lowestHabit && lowestHabit.completionRate < 50) {
    recommendations.push({
      habitId: lowestHabit.habit.id,
      message: `${lowestHabit.habit.title} is below 50%. Reduce frequency or shrink the task until it becomes automatic.`,
      title: lowestHabit.habit.title,
      type: "reduce_frequency",
    });
  }

  if (focusHabit && focusHabit.completionRate >= 85) {
    recommendations.push({
      habitId: focusHabit.habit.id,
      message: `${focusHabit.habit.title} is consistently strong. Consider increasing the goal slightly this week.`,
      title: focusHabit.habit.title,
      type: "increase_goal",
    });
  }

  enrichedHabits
    .filter((entry) => entry.completionRate < 70)
    .slice(0, 3)
    .forEach((entry) => {
      recommendations.push({
        habitId: entry.habit.id,
        message: `${entry.habit.title} needs attention at ${entry.completionRate}% completion.`,
        title: entry.habit.title,
        type: "needs_attention",
      });
    });

  const riskHabits = atRisk.map((entry) => ({
    habitId: entry.habit.id,
    message: `${entry.habit.title} is scheduled tomorrow and today's check-in is still open.`,
    riskLevel: entry.completionRate < 50 ? "high" : "medium",
    streak: entry.habit.streak,
    title: entry.habit.title,
  }));

  return {
    coachMessages,
    focusHabit: focusHabit
      ? {
          completionRate: focusHabit.completionRate,
          completedDates: focusHabit.habit.completedDates.length,
          habitId: focusHabit.habit.id,
          streak: focusHabit.habit.streak,
          title: focusHabit.habit.title,
        }
      : null,
    metrics: {
      missedHabits,
      streakConsistency,
      todayCompletion: today.percentage,
      trend,
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
