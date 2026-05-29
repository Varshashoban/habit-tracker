const dateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
});

const monthDayFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

const categories = [
  "Health",
  "Study",
  "Fitness",
  "Reading",
  "Personal Growth",
  "Custom",
];

const categoryColors = {
  Custom: "#38bdf8",
  Fitness: "#34d399",
  Health: "#2dd4bf",
  "Personal Growth": "#a78bfa",
  Reading: "#fbbf24",
  Study: "#60a5fa",
};

const levelThresholds = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
];

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
    currentStreak: bestStreak,
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

export function getHabitCategory(habit) {
  const text = `${habit.title} ${habit.description}`.toLowerCase();

  if (/read|book|chapter|journal/.test(text)) return "Reading";
  if (/study|learn|course|practice|code/.test(text)) return "Study";
  if (/run|gym|workout|walk|fitness|exercise/.test(text)) return "Fitness";
  if (/sleep|water|meditat|health|meal/.test(text)) return "Health";
  if (/reflect|plan|growth|focus|mind/.test(text)) return "Personal Growth";

  return "Custom";
}

export function getHabitColor(habit) {
  return categoryColors[getHabitCategory(habit)];
}

export function getCategories() {
  return categories;
}

export function getCategoryDistribution(habits) {
  return categories
    .map((category) => ({
      category,
      color: categoryColors[category],
      count: habits.filter((habit) => getHabitCategory(habit) === category).length,
    }))
    .filter((item) => item.count > 0);
}

export function getWeeklySummary(habits) {
  return getWeeklyActivity(habits).map((day) => ({
    ...day,
    percentage: day.target ? Math.round((day.completed / day.target) * 100) : 0,
  }));
}

export function getCalendarHeatmap(habits) {
  const completions = getCompletionKeys(habits);
  const today = startOfDay();

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
      dateKey,
      percentage,
    };
  });
}

export function getAchievements(habits) {
  const completions = getCompletionKeys(habits).length;
  const bestStreak = habits.reduce(
    (longest, habit) => Math.max(longest, habit.streak),
    0,
  );

  return [
    {
      description: "Created your first routine.",
      earned: habits.length > 0,
      label: "First Habit",
      progress: Math.min(habits.length, 1),
      target: 1,
    },
    {
      description: "Logged your first completed habit.",
      earned: completions > 0,
      label: "First Completion",
      progress: Math.min(completions, 1),
      target: 1,
    },
    {
      description: "Kept a routine alive for three periods.",
      earned: bestStreak >= 3,
      label: "3 Day Streak",
      progress: Math.min(bestStreak, 3),
      target: 3,
    },
    {
      description: "Built a full week of momentum.",
      earned: bestStreak >= 7,
      label: "7 Day Streak",
      progress: Math.min(bestStreak, 7),
      target: 7,
    },
    {
      description: "Reached a month-long streak.",
      earned: bestStreak >= 30,
      label: "30 Day Streak",
      progress: Math.min(bestStreak, 30),
      target: 30,
    },
    {
      description: "Logged 50 total completions.",
      earned: completions >= 50,
      label: "50 Completions",
      progress: Math.min(completions, 50),
      target: 50,
    },
    {
      description: "Logged 100 total completions.",
      earned: completions >= 100,
      label: "100 Completions",
      progress: Math.min(completions, 100),
      target: 100,
    },
  ];
}

export function getGamification(userXp = 0) {
  const xp = userXp || 0;
  const currentThreshold = [...levelThresholds]
    .reverse()
    .find((threshold) => xp >= threshold.xp);
  const nextThreshold = levelThresholds.find((threshold) => threshold.xp > xp);
  const level = currentThreshold.level;
  const levelStartXp = currentThreshold.xp;
  const levelEndXp = nextThreshold?.xp || currentThreshold.xp;
  const xpIntoLevel = xp - levelStartXp;
  const xpForLevel = Math.max(levelEndXp - levelStartXp, 1);
  const xpRemaining = nextThreshold ? nextThreshold.xp - xp : 0;

  return {
    level,
    levelEndXp,
    levelStartXp,
    progressPercentage: nextThreshold
      ? Math.round((xpIntoLevel / xpForLevel) * 100)
      : 100,
    xpRemaining,
    xp,
  };
}

export function getMostSuccessfulHabit(habits) {
  return [...habits].sort((left, right) => {
    if (right.completionRate !== left.completionRate) {
      return right.completionRate - left.completionRate;
    }

    return right.streak - left.streak;
  })[0];
}

export function getStreakChart(habits) {
  return habits.map((habit) => ({
    name: habit.title.length > 14 ? `${habit.title.slice(0, 14)}...` : habit.title,
    streak: habit.streak,
  }));
}

export function getTrendIndicators(habits) {
  const weekly = getWeeklySummary(habits);
  const recent = weekly.slice(-3);
  const previous = weekly.slice(0, 3);
  const recentAverage = recent.length
    ? recent.reduce((total, day) => total + day.percentage, 0) / recent.length
    : 0;
  const previousAverage = previous.length
    ? previous.reduce((total, day) => total + day.percentage, 0) / previous.length
    : 0;
  const growth = Math.round(recentAverage - previousAverage);

  return {
    growth,
    label: growth >= 0 ? "Improving" : "Needs attention",
  };
}

export function getAiInsights(habits) {
  const stats = getDashboardStats(habits);
  const bestHabit = getMostSuccessfulHabit(habits);
  const lowestHabit = [...habits]
    .filter((habit) => habit.completedDates.length > 0 || habit.completionRate > 0)
    .sort((left, right) => left.completionRate - right.completionRate)[0];
  const trend = getTrendIndicators(habits);
  const weekly = getWeeklySummary(habits);
  const bestDay = [...weekly].sort((left, right) => right.completed - left.completed)[0];
  const insights = [];

  if (bestHabit) {
    insights.push(
      `Most consistent habit: ${bestHabit.title} at ${bestHabit.completionRate}% completion.`,
    );
  }

  if (lowestHabit) {
    insights.push(
      `Lowest performing habit: ${lowestHabit.title} at ${lowestHabit.completionRate}%. Give it a smaller next action.`,
    );
  }

  if (bestDay && bestDay.completed > 0) {
    insights.push(
      `Best completion day: ${bestDay.day} with ${bestDay.completed} completed habits.`,
    );
  }

  insights.push(
    `Weekly completion trend: ${trend.growth >= 0 ? "up" : "down"} ${Math.abs(
      trend.growth,
    )}%.`,
  );

  if (stats.bestStreak >= 7) {
    insights.push(
      `Current streak analysis: your ${stats.bestStreak} day streak is strong enough to protect with reminders.`,
    );
  } else if (stats.bestStreak > 0) {
    insights.push(
      `Current streak analysis: ${stats.bestStreak} days. Reach 3 days to unlock the next streak badge.`,
    );
  }

  if (stats.completedToday < stats.totalHabits) {
    insights.push(
      `You have ${stats.totalHabits - stats.completedToday} habits left to finish today.`,
    );
  } else if (stats.totalHabits) {
    insights.push("Today is fully complete. Protect the streak tomorrow.");
  }

  return insights;
}
