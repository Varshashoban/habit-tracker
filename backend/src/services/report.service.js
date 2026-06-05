const Report = require("../models/report.model");
const { getCompletionRate, getStreak, toDateKey } = require("./habit.service");

const dayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });

const categories = ["Health", "Study", "Fitness", "Reading", "Personal Growth", "Custom"];

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function pct(value) {
  return Math.round(Math.min(100, Math.max(0, finite(value))));
}

function divide(numerator, denominator) {
  return finite(denominator) ? finite(numerator) / finite(denominator) : 0;
}

function startOfDay(date = new Date()) {
  return new Date(`${toDateKey(date)}T00:00:00.000Z`);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getHabitCategory(habit) {
  const text = `${habit.title} ${habit.description}`.toLowerCase();

  if (/read|book|chapter|journal/.test(text)) return "Reading";
  if (/study|learn|course|practice|code/.test(text)) return "Study";
  if (/run|gym|workout|walk|fitness|exercise/.test(text)) return "Fitness";
  if (/sleep|water|meditat|health|meal/.test(text)) return "Health";
  if (/reflect|plan|growth|focus|mind/.test(text)) return "Personal Growth";

  return "Custom";
}

function getCompletedDates(habit) {
  return Array.isArray(habit.completedDates) ? habit.completedDates : [];
}

function isCompletedOnDate(habit, date) {
  const dateKey = toDateKey(date);
  return getCompletedDates(habit).some((completedDate) => toDateKey(completedDate) === dateKey);
}

function getCompletionCount(habits) {
  return habits.reduce((total, habit) => total + getCompletedDates(habit).length, 0);
}

function getDailyTrend(habits, days) {
  const today = startOfDay();

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - (days - 1));
    const completed = habits.filter((habit) => isCompletedOnDate(habit, date)).length;

    return {
      completed,
      date: toDateKey(date),
      day: dayFormatter.format(date),
      percentage: habits.length ? pct(divide(completed, habits.length) * 100) : 0,
      target: habits.length,
    };
  });
}

function getRankings(habits) {
  return habits
    .map((habit) => ({
      category: getHabitCategory(habit),
      completionRate: getCompletionRate(getCompletedDates(habit), habit.frequency),
      completions: getCompletedDates(habit).length,
      id: habit.id,
      missed: Math.max(0, 30 - getCompletedDates(habit).length),
      streak: getStreak(getCompletedDates(habit), habit.frequency),
      title: habit.title,
    }))
    .sort((left, right) => {
      if (right.completionRate !== left.completionRate) {
        return right.completionRate - left.completionRate;
      }

      return right.streak - left.streak;
    });
}

function getCategoryPerformance(rankings) {
  return categories
    .map((category) => {
      const items = rankings.filter((habit) => habit.category === category);
      const completionRate = items.length
        ? pct(divide(items.reduce((total, item) => total + item.completionRate, 0), items.length))
        : 0;

      return {
        category,
        completionRate,
        habits: items.length,
      };
    })
    .filter((item) => item.habits > 0);
}

function getAchievements(habits, totalCompletions, longestStreak) {
  const definitions = [
    ["First Habit", habits.length, 1],
    ["First Completion", totalCompletions, 1],
    ["3 Day Streak", longestStreak, 3],
    ["7 Day Streak", longestStreak, 7],
    ["30 Day Streak", longestStreak, 30],
    ["50 Completions", totalCompletions, 50],
    ["100 Completions", totalCompletions, 100],
  ];
  const badges = definitions.map(([label, progress, target]) => ({
    label,
    progress: Math.min(progress, target),
    target,
    unlocked: progress >= target,
  }));
  const unlocked = badges.filter((badge) => badge.unlocked).length;

  return {
    badges,
    locked: badges.length - unlocked,
    progressPercentage: badges.length ? pct(divide(unlocked, badges.length) * 100) : 0,
    unlocked,
  };
}

function getInsights({ categoryPerformance, monthlyTrend, rankings, weeklyTrend }) {
  const insights = [];
  const bestHabit = rankings[0];
  const bestCategory = [...categoryPerformance].sort(
    (left, right) => right.completionRate - left.completionRate,
  )[0];
  const weekend = monthlyTrend.filter((day) => {
    const weekday = new Date(`${day.date}T00:00:00.000Z`).getUTCDay();
    return weekday === 0 || weekday === 6;
  });
  const weekdays = monthlyTrend.filter((day) => !weekend.includes(day));
  const weekendAverage = weekend.length
    ? divide(weekend.reduce((total, day) => total + day.percentage, 0), weekend.length)
    : 0;
  const weekdayAverage = weekdays.length
    ? divide(weekdays.reduce((total, day) => total + day.percentage, 0), weekdays.length)
    : 0;
  const recentWeek = weeklyTrend.reduce((total, day) => total + day.percentage, 0);
  const previousWeek = monthlyTrend.slice(-14, -7).reduce((total, day) => total + day.percentage, 0);
  const improvement = pct(divide(recentWeek - previousWeek, Math.max(previousWeek, 1)) * 100);

  if (bestHabit) {
    insights.push(`${bestHabit.title} leads your report at ${bestHabit.completionRate}% completion.`);
  }

  if (bestCategory) {
    insights.push(`${bestCategory.category} habits show highest consistency at ${bestCategory.completionRate}%.`);
  }

  insights.push(
    weekendAverage >= weekdayAverage
      ? "You perform best on weekends."
      : "You perform best on weekdays.",
  );

  if (improvement > 0) {
    insights.push(`Your completion trend improved by ${improvement}% this month.`);
  }

  return insights;
}

function makeReportPayload(userId, habits) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const rankings = getRankings(safeHabits);
  const totalCompletions = getCompletionCount(safeHabits);
  const currentStreak = rankings.reduce((best, habit) => Math.max(best, habit.streak), 0);
  const longestStreak = currentStreak;
  const bestPerformingHabit = rankings[0] || null;
  const mostMissedHabit = [...rankings].sort((left, right) => right.missed - left.missed)[0] || null;
  const completionPercentage = safeHabits.length
    ? pct(divide(rankings.reduce((total, habit) => total + habit.completionRate, 0), safeHabits.length))
    : 0;
  const weeklyTrend = getDailyTrend(safeHabits, 7);
  const monthlyTrend = getDailyTrend(safeHabits, 30);
  const categoryPerformance = getCategoryPerformance(rankings);
  const missedHabits = rankings.reduce((total, habit) => total + habit.missed, 0);
  const consistency = monthlyTrend.length
    ? pct(divide(monthlyTrend.reduce((total, day) => total + day.percentage, 0), monthlyTrend.length))
    : 0;
  const performanceScore = pct(
    completionPercentage * 0.45 +
      Math.min(100, currentStreak * 10) * 0.2 +
      consistency * 0.25 +
      Math.max(0, 100 - missedHabits) * 0.1,
  );
  const achievementSummary = getAchievements(safeHabits, totalCompletions, longestStreak);
  const charts = {
    categoryPerformance,
    habitComparison: rankings.map((habit) => ({
      completionRate: habit.completionRate,
      completions: habit.completions,
      title: habit.title.length > 16 ? `${habit.title.slice(0, 16)}...` : habit.title,
    })),
    monthlyTrend,
    weeklyTrend,
  };

  return {
    achievementSummary,
    charts,
    generatedAt: new Date(),
    habitHistory: safeHabits.flatMap((habit) =>
      getCompletedDates(habit).map((date) => ({
        completedDate: toDateKey(date),
        frequency: habit.frequency,
        habitId: habit.id,
        title: habit.title,
      })),
    ),
    insights: getInsights({ categoryPerformance, monthlyTrend, rankings, weeklyTrend }),
    performanceScore,
    rankings,
    summary: {
      bestPerformingHabit: bestPerformingHabit?.title || "No habits yet",
      completionPercentage,
      currentStreak,
      longestStreak,
      mostMissedHabit: mostMissedHabit?.title || "No missed habits yet",
      totalCompletions,
      totalHabitsCreated: safeHabits.length,
    },
    title: "HabitFlow Advanced Report",
    type: "advanced",
    userId,
  };
}

async function generateReport(userId, habits) {
  return Report.create(makeReportPayload(userId, habits));
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function reportToCsv(report) {
  const rows = [
    ["Metric", "Value"],
    ["Total habits created", report.summary.totalHabitsCreated],
    ["Total completions", report.summary.totalCompletions],
    ["Current streak", report.summary.currentStreak],
    ["Longest streak", report.summary.longestStreak],
    ["Best performing habit", report.summary.bestPerformingHabit],
    ["Most missed habit", report.summary.mostMissedHabit],
    ["Completion percentage", `${report.summary.completionPercentage}%`],
    ["Performance score", report.performanceScore],
    [],
    ["Habit", "Category", "Completion Rate", "Completions", "Streak", "Missed"],
    ...(report.rankings || []).map((habit) => [
      habit.title,
      habit.category,
      `${habit.completionRate}%`,
      habit.completions,
      habit.streak,
      habit.missed,
    ]),
  ];

  return rowsToCsv(rows);
}

function historyToCsv(report) {
  const rows = [
    ["Habit", "Frequency", "Completed Date"],
    ...(report.habitHistory || []).map((entry) => [
      entry.title,
      entry.frequency,
      entry.completedDate,
    ]),
  ];

  return rowsToCsv(rows);
}

function productivityAnalyticsToCsv(habits, userName) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const rankings = getRankings(safeHabits);
  const totalCompletions = getCompletionCount(safeHabits);
  const weeklyTrend = getDailyTrend(safeHabits, 7);
  const monthlyTrend = getDailyTrend(safeHabits, 30);
  const categoryPerformance = getCategoryPerformance(rankings);

  const rows = [
    ["HabitFlow - Productivity Analytics Export"],
    [`Generated: ${new Date().toISOString()}`],
    [`User: ${userName || "N/A"}`],
    [],
    ["=== SUMMARY ==="],
    ["Metric", "Value"],
    ["Total Habits", safeHabits.length],
    ["Total Completions", totalCompletions],
    ["Active Streaks", rankings.filter((h) => h.streak > 0).length],
    [],
    ["=== CATEGORY PERFORMANCE ==="],
    ["Category", "Habits", "Completion Rate"],
    ...categoryPerformance.map((cp) => [
      cp.category,
      cp.habits,
      `${cp.completionRate}%`,
    ]),
    [],
    ["=== WEEKLY TREND (Last 7 Days) ==="],
    ["Date", "Day", "Completed", "Target", "Percentage"],
    ...weeklyTrend.map((d) => [d.date, d.day, d.completed, d.target, `${d.percentage}%`]),
    [],
    ["=== MONTHLY TREND (Last 30 Days) ==="],
    ["Date", "Day", "Completed", "Target", "Percentage"],
    ...monthlyTrend.map((d) => [d.date, d.day, d.completed, d.target, `${d.percentage}%`]),
    [],
    ["=== HABIT RANKINGS ==="],
    ["Rank", "Habit", "Category", "Completion Rate", "Completions", "Streak", "Missed"],
    ...rankings.map((h, i) => [
      i + 1,
      h.title,
      h.category,
      `${h.completionRate}%`,
      h.completions,
      h.streak,
      h.missed,
    ]),
  ];

  return rowsToCsv(rows);
}

function reminderStatsToCsv(reminders, stats, suggestions, userName) {
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const safeStats = stats || {};
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const rows = [
    ["HabitFlow - Reminder Statistics Export"],
    [`Generated: ${new Date().toISOString()}`],
    [`User: ${userName || "N/A"}`],
    [],
    ["=== REMINDER PERFORMANCE ==="],
    ["Metric", "Value"],
    ["Reminders Sent", safeStats.remindersSent || 0],
    ["Reminders Completed", safeStats.remindersCompleted || 0],
    ["Completion After Reminder Rate", `${safeStats.completionAfterReminderRate || 0}%`],
    ["Best Reminder Time", safeStats.bestReminderTime || "N/A"],
    ["Pending Today", safeStats.pendingToday || 0],
    [],
    ["=== ALL REMINDERS ==="],
    ["Habit", "Time", "Frequency", "Active", "Custom Message"],
    ...safeReminders.map((r) => [
      r.habit?.title || r.habitId || "Unknown",
      r.time,
      r.frequency,
      r.isActive ? "Yes" : "No",
      r.message || "",
    ]),
    [],
    ["=== SMART SUGGESTIONS ==="],
    ["Suggestion", "Recommended Time"],
    ...safeSuggestions.map((s) => [s.message, s.time]),
  ];

  return rowsToCsv(rows);
}

function forecastMetricsToCsv(forecast, userName) {
  const safeForecast = forecast || {};
  const burnout = safeForecast.burnout || {};
  const momentum = safeForecast.momentum || {};
  const monthly = safeForecast.monthlyForecast || {};
  const weekly = safeForecast.weeklyForecast || [];
  const habits = safeForecast.habitsForecast || [];

  const rows = [
    ["HabitFlow - Forecast Metrics Export"],
    [`Generated: ${new Date().toISOString()}`],
    [`User: ${userName || "N/A"}`],
    [],
    ["=== BURNOUT RISK ==="],
    ["Metric", "Value"],
    ["Score", `${burnout.score || 0}%`],
    ["Risk Level", burnout.riskLevel || "Unknown"],
    ["Advice", burnout.advice || ""],
    [],
    ["=== PRODUCTIVITY MOMENTUM ==="],
    ["Momentum", `${momentum.percentage || 0}%`],
    ["Status", momentum.status || "Unknown"],
    [],
    ["=== MONTHLY CONSISTENCY FORECAST ==="],
    ["Predicted Consistency", `${monthly.consistency || 0}%`],
    [],
    ["=== WEEKLY COMPLETION FORECAST (Next 7 Days) ==="],
    ["Date", "Day", "Expected Completions", "Target Completions"],
    ...weekly.map((d) => [d.date, d.day, d.expectedCompletions, d.targetCompletions]),
    [],
    ["=== HABIT SUCCESS FORECASTS ==="],
    ["Habit", "Frequency", "Current Streak", "Predicted Streak", "Success Probability"],
    ...habits.map((h) => [
      h.title,
      h.frequency,
      h.currentStreak,
      h.predictedStreak,
      `${h.successProbability}%`,
    ]),
  ];

  return rowsToCsv(rows);
}

function textToPdfBuffer(text) {
  const lines = text.split("\n").slice(0, 42);
  const content = [
    "BT",
    "/F1 14 Tf",
    "50 760 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -18 Td",
      `(${line.replace(/[()\\]/g, "\\$&")}) Tj`,
    ]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf);
}

function reportToPdf(report, userName) {
  const hr = "________________________________________";
  const generated = new Date(report.generatedAt).toLocaleString();
  const text = [
    "HabitFlow - Advanced Report",
    hr,
    `Report: ${report.title}`,
    `Generated: ${generated}`,
    `User: ${userName || "N/A"}`,
    "",
    "=== SUMMARY ===",
    `Performance Score: ${report.performanceScore}/100`,
    `Total Habits: ${report.summary.totalHabitsCreated}`,
    `Total Completions: ${report.summary.totalCompletions}`,
    `Completion: ${report.summary.completionPercentage}%`,
    `Current Streak: ${report.summary.currentStreak} days`,
    `Longest Streak: ${report.summary.longestStreak} days`,
    `Best: ${report.summary.bestPerformingHabit}`,
    `Missed: ${report.summary.mostMissedHabit}`,
    "",
    "=== ANALYTICS ===",
    ...(report.insights || []).map((insight) => `- ${insight}`),
    "",
    "=== RECOMMENDATIONS ===",
    report.performanceScore >= 70
      ? "- Keep your streak momentum going!"
      : "- Focus on building small daily streaks.",
    report.summary.completionPercentage >= 50
      ? "- Strong consistency. Push for 80%+ next."
      : "- Set reminders to boost completions.",
    "",
    "=== RANKINGS ===",
    ...(report.rankings || []).slice(0, 8).map(
      (h, i) => `${i + 1}. ${h.title}: ${h.completionRate}%`,
    ),
  ].join("\n");

  return textToPdfBuffer(text);
}

module.exports = {
  forecastMetricsToCsv,
  generateReport,
  historyToCsv,
  makeReportPayload,
  productivityAnalyticsToCsv,
  reminderStatsToCsv,
  reportToCsv,
  reportToPdf,
};

