const mongoose = require("mongoose");

const Habit = require("../models/habit.model");
const Report = require("../models/report.model");
const { getStreak, toDateKey } = require("./habit.service");
const AppError = require("../utils/appError");

const categories = ["Health", "Study", "Fitness", "Reading", "Personal Growth", "Custom"];
const dayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, finite(value)));
}

function pct(value) {
  return Math.round(clamp(value));
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

function parseDate(value, fieldName) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw new AppError(400, `${fieldName} is invalid.`);
  }

  return startOfDay(date);
}

function getReportRange(filters = {}) {
  const preset = filters.range || filters.preset || "last30";
  const today = startOfDay();

  if (preset === "custom") {
    const startDate = parseDate(filters.startDate, "Start date");
    const endDate = parseDate(filters.endDate, "End date");

    if (endDate < startDate) {
      throw new AppError(400, "End date must be after start date.");
    }

    return {
      endDate,
      label: "Custom Range",
      preset,
      startDate,
    };
  }

  const presets = {
    last30: ["Last 30 Days", 29],
    last7: ["Last 7 Days", 6],
    last90: ["Last 90 Days", 89],
    today: ["Today", 0],
  };
  const selectedPreset = presets[preset] ? preset : "last30";
  const [label, daysBack] = presets[selectedPreset];

  return {
    endDate: today,
    label,
    preset: selectedPreset,
    startDate: addDays(today, -daysBack),
  };
}

function enumerateDays(startDate, endDate) {
  const days = [];
  let cursor = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  return days;
}

function getCompletedDates(habit) {
  return Array.isArray(habit.completedDates) ? habit.completedDates : [];
}

function getHabitCategory(habit) {
  const text = `${habit.title || ""} ${habit.description || ""}`.toLowerCase();

  if (/read|book|chapter|journal/.test(text)) return "Reading";
  if (/study|learn|course|practice|code/.test(text)) return "Study";
  if (/run|gym|workout|walk|fitness|exercise/.test(text)) return "Fitness";
  if (/sleep|water|meditat|health|meal/.test(text)) return "Health";
  if (/reflect|plan|growth|focus|mind/.test(text)) return "Personal Growth";

  return "Custom";
}

function getWeekday(date) {
  return startOfDay(date).getUTCDay();
}

function isWithinHabitBounds(habit, date) {
  const dateKey = toDateKey(date);
  const startDateKey = toDateKey(habit.startDate || habit.createdAt || date);
  const endDateKey = habit.endDate ? toDateKey(habit.endDate) : null;

  return dateKey >= startDateKey && (!endDateKey || dateKey <= endDateKey);
}

function isHabitScheduledOnDate(habit, date) {
  if (!isWithinHabitBounds(habit, date)) {
    return false;
  }

  const weekday = getWeekday(date);
  const scheduledDays = Array.isArray(habit.scheduledDays)
    ? habit.scheduledDays
    : [];

  if (habit.frequency === "specific_dates") {
    return (habit.specificDates || []).some(
      (specificDate) => toDateKey(specificDate) === toDateKey(date),
    );
  }

  if (habit.frequency === "custom_weekdays") {
    return scheduledDays.includes(weekday);
  }

  if (habit.frequency === "weekly") {
    return scheduledDays.length
      ? scheduledDays.includes(weekday)
      : weekday === getWeekday(habit.startDate || habit.createdAt || new Date());
  }

  return true;
}

function isCompletedOnDate(habit, date) {
  const dateKey = toDateKey(date);
  return getCompletedDates(habit).some(
    (completedDate) => toDateKey(completedDate) === dateKey,
  );
}

function getCompletionsInRange(habit, startDate, endDate) {
  return getCompletedDates(habit).filter((completedDate) => {
    const date = startOfDay(completedDate);
    return date >= startDate && date <= endDate;
  });
}

function getLongestStreak(completedDates, frequency) {
  if (!completedDates.length) {
    return 0;
  }

  const periodDays = frequency === "weekly" ? 7 : 1;
  const sortedKeys = [...new Set(completedDates.map((date) => toDateKey(date)))].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < sortedKeys.length; index += 1) {
    const previousDate = startOfDay(sortedKeys[index - 1]);
    const nextDate = startOfDay(sortedKeys[index]);
    const dayGap = Math.round((nextDate - previousDate) / 86400000);

    if (dayGap <= periodDays) {
      current += 1;
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
  }

  return longest;
}

function getStatus(completionRate) {
  if (completionRate >= 80) return "Excellent";
  if (completionRate >= 50) return "Steady";
  if (completionRate > 0) return "Needs attention";
  return "No activity";
}

function getHabitRows(habits, days, range) {
  return habits
    .map((habit) => {
      const scheduled = days.filter((date) => isHabitScheduledOnDate(habit, date)).length;
      const completions = getCompletionsInRange(habit, range.startDate, range.endDate);
      const completionRate = scheduled ? pct(divide(completions.length, scheduled) * 100) : 0;
      const currentStreak = getStreak(getCompletedDates(habit), habit.frequency);
      const longestStreak = getLongestStreak(getCompletedDates(habit), habit.frequency);

      return {
        category: getHabitCategory(habit),
        completionRate,
        currentStreak,
        id: String(habit._id || habit.id),
        longestStreak,
        missed: Math.max(0, scheduled - completions.length),
        scheduled,
        status: getStatus(completionRate),
        title: habit.title,
        totalCompletions: completions.length,
      };
    })
    .sort((left, right) => {
      if (right.completionRate !== left.completionRate) {
        return right.completionRate - left.completionRate;
      }

      return right.totalCompletions - left.totalCompletions;
    });
}

function getDailySeries(habits, days) {
  return days.map((date) => {
    const scheduled = habits.filter((habit) => isHabitScheduledOnDate(habit, date)).length;
    const completed = habits.filter((habit) => isCompletedOnDate(habit, date)).length;

    return {
      completed,
      date: toDateKey(date),
      day: dayFormatter.format(date),
      percentage: scheduled ? pct(divide(completed, scheduled) * 100) : 0,
      scheduled,
    };
  });
}

function getWeekStart(date) {
  const weekStart = startOfDay(date);
  const day = weekStart.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);
  return weekStart;
}

function getGroupedTrend(dailySeries, keyFactory, labelFactory) {
  const groups = new Map();

  dailySeries.forEach((day) => {
    const date = startOfDay(day.date);
    const key = keyFactory(date);
    const current = groups.get(key) || {
      completed: 0,
      label: labelFactory(date),
      scheduled: 0,
    };

    current.completed += day.completed;
    current.scheduled += day.scheduled;
    groups.set(key, current);
  });

  return [...groups.values()].map((group) => ({
    ...group,
    percentage: group.scheduled ? pct(divide(group.completed, group.scheduled) * 100) : 0,
  }));
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

function getMostImprovedHabit(habits, days) {
  if (days.length < 2) {
    return null;
  }

  const midpoint = Math.floor(days.length / 2);
  const firstHalf = days.slice(0, midpoint);
  const secondHalf = days.slice(midpoint);

  return habits
    .map((habit) => {
      const rateForDays = (selectedDays) => {
        const scheduled = selectedDays.filter((date) => isHabitScheduledOnDate(habit, date)).length;
        const completed = selectedDays.filter((date) => isCompletedOnDate(habit, date)).length;
        return scheduled ? pct(divide(completed, scheduled) * 100) : 0;
      };
      const improvement = rateForDays(secondHalf) - rateForDays(firstHalf);

      return {
        improvement,
        title: habit.title,
      };
    })
    .sort((left, right) => right.improvement - left.improvement)[0];
}

function getProductivitySummary({ completionRate, currentStreak, totalHabits, weeklyCompletion }) {
  if (!totalHabits) {
    return "Create your first habit to start building reportable momentum.";
  }

  if (completionRate >= 80) {
    return `Excellent momentum: ${completionRate}% completion with a ${currentStreak}-day leading streak.`;
  }

  if (weeklyCompletion >= 60) {
    return `Your recent week is stable at ${weeklyCompletion}%. Focus on the lowest-performing habit next.`;
  }

  return "Your report shows room for recovery. Smaller goals and reminder tuning can lift consistency quickly.";
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

async function getReportHabits(userId) {
  return Habit.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        completedDates: 1,
        createdAt: 1,
        description: 1,
        endDate: 1,
        frequency: 1,
        scheduledDays: 1,
        specificDates: 1,
        startDate: 1,
        targetCompletionsPerWeek: 1,
        title: 1,
        totalLifetimeCompletions: { $size: { $ifNull: ["$completedDates", []] } },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
}

async function buildReportPayload(userId, filters = {}) {
  const range = getReportRange(filters);
  const habits = await getReportHabits(userId);
  const days = enumerateDays(range.startDate, range.endDate);
  const rankings = getHabitRows(habits, days, range);
  const dailyTrend = getDailySeries(habits, days);
  const totalScheduled = dailyTrend.reduce((total, day) => total + day.scheduled, 0);
  const totalCompletions = rankings.reduce((total, habit) => total + habit.totalCompletions, 0);
  const completionRate = totalScheduled ? pct(divide(totalCompletions, totalScheduled) * 100) : 0;
  const activeHabits = rankings.filter((habit) => habit.scheduled > 0).length;
  const habitSuccessRate = activeHabits
    ? pct(divide(rankings.filter((habit) => habit.completionRate >= 70).length, activeHabits) * 100)
    : 0;
  const weeklyTrend = getGroupedTrend(
    dailyTrend,
    (date) => toDateKey(getWeekStart(date)),
    (date) => `Week of ${toDateKey(getWeekStart(date))}`,
  );
  const monthlyTrend = getGroupedTrend(
    dailyTrend,
    (date) => toDateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))),
    (date) => monthFormatter.format(date),
  );
  const weeklyCompletion = weeklyTrend.length ? weeklyTrend[weeklyTrend.length - 1].percentage : 0;
  const monthlyCompletion = monthlyTrend.length ? monthlyTrend[monthlyTrend.length - 1].percentage : 0;
  const currentStreak = rankings.reduce((best, habit) => Math.max(best, habit.currentStreak), 0);
  const longestStreak = rankings.reduce((best, habit) => Math.max(best, habit.longestStreak), 0);
  const bestPerformingHabit = rankings[0] || null;
  const worstPerformingHabit = [...rankings].reverse()[0] || null;
  const mostMissedHabit = [...rankings].sort((left, right) => right.missed - left.missed)[0] || null;
  const mostImprovedHabit = getMostImprovedHabit(habits, days);
  const productivitySummary = getProductivitySummary({
    completionRate,
    currentStreak,
    totalHabits: habits.length,
    weeklyCompletion,
  });
  const categoryPerformance = getCategoryPerformance(rankings);
  const performanceScore = pct(
    completionRate * 0.45 +
      Math.min(100, currentStreak * 10) * 0.2 +
      habitSuccessRate * 0.2 +
      Math.max(0, 100 - rankings.reduce((total, habit) => total + habit.missed, 0)) * 0.15,
  );

  return {
    achievementSummary: getAchievements(habits, totalCompletions, longestStreak),
    charts: {
      categoryPerformance,
      completionHeatmap: dailyTrend,
      habitComparison: rankings.map((habit) => ({
        completionRate: habit.completionRate,
        completions: habit.totalCompletions,
        title: habit.title.length > 16 ? `${habit.title.slice(0, 16)}...` : habit.title,
      })),
      monthlyTrend,
      productivityTrend: dailyTrend.map((day) => ({
        date: day.date,
        productivityScore: day.percentage,
      })),
      weeklyTrend,
    },
    generatedAt: new Date(),
    habitHistory: habits.flatMap((habit) =>
      getCompletionsInRange(habit, range.startDate, range.endDate).map((date) => ({
        completedDate: toDateKey(date),
        frequency: habit.frequency,
        habitId: String(habit._id),
        title: habit.title,
      })),
    ),
    insights: {
      bestPerformingHabit,
      mostImprovedHabit:
        mostImprovedHabit && mostImprovedHabit.improvement > 0
          ? mostImprovedHabit
          : null,
      mostMissedHabit,
      productivitySummary,
      worstPerformingHabit,
    },
    performanceScore,
    rankings,
    range: {
      endDate: toDateKey(range.endDate),
      label: range.label,
      preset: range.preset,
      startDate: toDateKey(range.startDate),
    },
    summary: {
      completionRate,
      currentStreak,
      habitSuccessRate,
      longestStreak,
      monthlyCompletion,
      totalCompletions,
      totalHabits: habits.length,
      totalHabitsCreated: habits.length,
      totalScheduled,
      weeklyCompletion,
    },
    title: "HabitFlow Analytics Report",
    type: "advanced",
    userId,
  };
}

async function generateReport(userId, filters = {}) {
  const payload = await buildReportPayload(userId, filters);
  return Report.create(payload);
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function reportToCsv(report) {
  const rows = [
    ["HabitFlow Analytics Report"],
    ["Range", report.range?.label || ""],
    ["Start Date", report.range?.startDate || ""],
    ["End Date", report.range?.endDate || ""],
    [],
    ["Metric", "Value"],
    ["Total habits", report.summary.totalHabits],
    ["Completion rate", `${report.summary.completionRate}%`],
    ["Current streak", report.summary.currentStreak],
    ["Longest streak", report.summary.longestStreak],
    ["Weekly completion", `${report.summary.weeklyCompletion}%`],
    ["Monthly completion", `${report.summary.monthlyCompletion}%`],
    ["Habit success rate", `${report.summary.habitSuccessRate}%`],
    ["Performance score", `${report.performanceScore}/100`],
    [],
    ["Habit", "Total Completions", "Completion %", "Current Streak", "Longest Streak", "Status"],
    ...(report.rankings || []).map((habit) => [
      habit.title,
      habit.totalCompletions,
      `${habit.completionRate}%`,
      habit.currentStreak,
      habit.longestStreak,
      habit.status,
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

async function reportToJson(userId, filters = {}) {
  const report = await buildReportPayload(userId, filters);
  return JSON.stringify(report, null, 2);
}

function productivityAnalyticsToCsv(habits, userName) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  const rows = [
    ["HabitFlow - Productivity Analytics Export"],
    [`Generated: ${new Date().toISOString()}`],
    [`User: ${userName || "N/A"}`],
    [],
    ["Habit", "Lifetime Completions"],
    ...safeHabits.map((habit) => [habit.title, getCompletedDates(habit).length]),
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
    ["Metric", "Value"],
    ["Reminders Sent", safeStats.remindersSent || 0],
    ["Reminders Completed", safeStats.remindersCompleted || 0],
    ["Completion After Reminder Rate", `${safeStats.completionAfterReminderRate || 0}%`],
    ["Best Reminder Time", safeStats.bestReminderTime || "N/A"],
    ["Pending Today", safeStats.pendingToday || 0],
    [],
    ["Habit", "Time", "Frequency", "Active", "Custom Message"],
    ...safeReminders.map((reminder) => [
      reminder.habit?.title || reminder.habitId || "Unknown",
      reminder.time,
      reminder.frequency,
      reminder.isActive ? "Yes" : "No",
      reminder.message || "",
    ]),
    [],
    ["Suggestion", "Recommended Time"],
    ...safeSuggestions.map((suggestion) => [suggestion.message, suggestion.time]),
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
    ["Score", `${burnout.score || 0}%`],
    ["Risk Level", burnout.riskLevel || "Unknown"],
    ["Advice", burnout.advice || ""],
    ["Momentum", `${momentum.percentage || 0}%`],
    ["Predicted Monthly Consistency", `${monthly.consistency || 0}%`],
    [],
    ["Date", "Day", "Expected Completions", "Target Completions"],
    ...weekly.map((day) => [day.date, day.day, day.expectedCompletions, day.targetCompletions]),
    [],
    ["Habit", "Frequency", "Current Streak", "Predicted Streak", "Success Probability"],
    ...habits.map((habit) => [
      habit.title,
      habit.frequency,
      habit.currentStreak,
      habit.predictedStreak,
      `${habit.successProbability}%`,
    ]),
  ];

  return rowsToCsv(rows);
}

function textToPdfBuffer(text) {
  const lines = text.split("\n").slice(0, 48);
  const content = [
    "BT",
    "/F1 13 Tf",
    "50 760 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -16 Td",
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
  const generated = new Date(report.generatedAt).toLocaleString();
  const text = [
    "HabitFlow - Analytics Report",
    "________________________________________",
    `Generated: ${generated}`,
    `User: ${userName || "N/A"}`,
    `Range: ${report.range?.label || "Report range"}`,
    `${report.range?.startDate || ""} to ${report.range?.endDate || ""}`,
    "",
    "REPORT DASHBOARD",
    `Total habits: ${report.summary.totalHabits}`,
    `Completion rate: ${report.summary.completionRate}%`,
    `Current streak: ${report.summary.currentStreak} days`,
    `Longest streak: ${report.summary.longestStreak} days`,
    `Weekly completion: ${report.summary.weeklyCompletion}%`,
    `Monthly completion: ${report.summary.monthlyCompletion}%`,
    `Habit success rate: ${report.summary.habitSuccessRate}%`,
    "",
    "INSIGHTS",
    `Best habit: ${report.insights?.bestPerformingHabit?.title || "N/A"}`,
    `Worst habit: ${report.insights?.worstPerformingHabit?.title || "N/A"}`,
    `Most improved: ${report.insights?.mostImprovedHabit?.title || "N/A"}`,
    `Most missed: ${report.insights?.mostMissedHabit?.title || "N/A"}`,
    report.insights?.productivitySummary || "",
    "",
    "HABIT PERFORMANCE",
    ...(report.rankings || []).slice(0, 12).map(
      (habit) =>
        `${habit.title}: ${habit.completionRate}% | ${habit.totalCompletions} completions | ${habit.status}`,
    ),
  ].join("\n");

  return textToPdfBuffer(text);
}

module.exports = {
  buildReportPayload,
  forecastMetricsToCsv,
  generateReport,
  getReportRange,
  historyToCsv,
  productivityAnalyticsToCsv,
  reminderStatsToCsv,
  reportToCsv,
  reportToJson,
  reportToPdf,
};
