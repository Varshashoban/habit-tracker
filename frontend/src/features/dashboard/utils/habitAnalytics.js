const dateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
});

const monthDayFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

function toDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function startOfDay(date = new Date()) {
  return new Date(`${toDateKey(date)}T00:00:00.000Z`);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getCompletionKeys(habits) {
  return habits.flatMap((habit) =>
    habit.completedDates.map((date) => ({
      dateKey: toDateKey(date),
      habitId: habit.id,
    })),
  );
}

export function getDashboardStats(habits) {
  const totalHabits = habits.length;
  const completedToday = habits.filter((habit) => habit.completedToday).length;
  const averageCompletion = totalHabits
    ? Math.round(
        habits.reduce((total, habit) => total + habit.completionRate, 0) /
          totalHabits,
      )
    : 0;
  const bestStreak = habits.reduce(
    (longest, habit) => Math.max(longest, habit.streak),
    0,
  );

  return {
    averageCompletion,
    bestStreak,
    completedToday,
    totalHabits,
  };
}

export function getWeeklyActivity(habits) {
  const today = startOfDay();
  const completions = getCompletionKeys(habits);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const dateKey = toDateKey(date);
    const completed = completions.filter((entry) => entry.dateKey === dateKey).length;

    return {
      completed,
      day: dateFormatter.format(date),
      target: habits.length,
    };
  });
}

export function getMonthlyConsistency(habits) {
  const today = startOfDay();
  const completions = getCompletionKeys(habits);

  return Array.from({ length: 30 }, (_, index) => {
    const date = addDays(today, index - 29);
    const dateKey = toDateKey(date);
    const completed = completions.filter((entry) => entry.dateKey === dateKey).length;
    const percentage = habits.length
      ? Math.round((completed / habits.length) * 100)
      : 0;

    return {
      completed,
      date: monthDayFormatter.format(date),
      percentage,
    };
  });
}

export function getMotivation(stats) {
  if (!stats.totalHabits) {
    return {
      headline: "Start with one visible win.",
      message:
        "Create a habit that is small enough to finish today. Momentum likes evidence.",
    };
  }

  if (stats.completedToday === stats.totalHabits) {
    return {
      headline: "Clean sweep today.",
      message:
        "Every habit is checked off. Protect this feeling by planning tomorrow while it is fresh.",
    };
  }

  if (stats.bestStreak >= 7) {
    return {
      headline: "Your streak is doing the talking.",
      message:
        "Seven days or more means the routine is becoming part of the scenery. Keep it boring, keep it working.",
    };
  }

  return {
    headline: "Stay close to the next action.",
    message:
      "Progress is built from small checkmarks. Finish one more habit and let the dashboard catch up.",
  };
}
