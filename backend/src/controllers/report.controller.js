const Habit = require("../models/habit.model");
const Reminder = require("../models/reminder.model");
const Report = require("../models/report.model");
const { calculateForecast } = require("../services/forecast.service");
const { serializeHabit } = require("../services/habit.service");
const {
  getReminderStats,
  getSmartReminderSuggestions,
  serializeReminder,
} = require("../services/reminder.service");
const {
  buildReportPayload,
  forecastMetricsToCsv,
  generateReport,
  historyToCsv,
  productivityAnalyticsToCsv,
  reminderStatsToCsv,
  reportToCsv,
  reportToJson,
  reportToPdf,
} = require("../services/report.service");
const AppError = require("../utils/appError");

async function getUserReport(userId, reportId) {
  const report = await Report.findOne({ _id: reportId, userId });

  if (!report) {
    throw new AppError(404, "Report was not found.");
  }

  return report;
}

async function createReport(req, res) {
  const report = await generateReport(req.user.id, req.body);

  res.status(201).json({ report });
}

async function getCurrentReport(req, res) {
  const report = await buildReportPayload(req.user.id, req.query);

  res.json({ report });
}

async function getReportHistory(req, res) {
  const reports = await Report.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ reports });
}

async function exportReport(req, res) {
  const report = await getUserReport(req.user.id, req.params.reportId);
  const format = req.query.format || "csv";
  const userName = req.user.name || "HabitFlow User";

  if (format === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="habitflow-report-${report.id}.pdf"`);
    return res.send(reportToPdf(report, userName));
  }

  if (format === "habit-history-csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="habitflow-history-${report.id}.csv"`);
    return res.send(historyToCsv(report));
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="habitflow-report-${report.id}.csv"`);
  return res.send(reportToCsv(report));
}

async function exportCurrentReport(req, res) {
  const format = req.query.format || "csv";
  const userName = req.user.name || "HabitFlow User";

  if (format === "json") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="habitflow-report-${Date.now()}.json"`);
    return res.send(await reportToJson(req.user.id, req.query));
  }

  const report = await buildReportPayload(req.user.id, req.query);

  if (format === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="habitflow-report-${Date.now()}.pdf"`);
    return res.send(reportToPdf(report, userName));
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="habitflow-report-${Date.now()}.csv"`);
  return res.send(reportToCsv(report));
}

async function exportProductivityAnalytics(req, res) {
  const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
  const userName = req.user.name || "HabitFlow User";
  const csv = productivityAnalyticsToCsv(habits, userName);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="habitflow-productivity-${Date.now()}.csv"`);
  return res.send(csv);
}

async function exportReminderStats(req, res) {
  const reminders = await Reminder.find({ userId: req.user.id })
    .populate("habitId")
    .sort({ createdAt: -1 });
  const habits = await Habit.find({ userId: req.user.id });
  const userName = req.user.name || "HabitFlow User";

  const stats = getReminderStats(reminders);
  const suggestions = getSmartReminderSuggestions(habits);
  const serialized = reminders.map(serializeReminder);

  const csv = reminderStatsToCsv(serialized, stats, suggestions, userName);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="habitflow-reminders-${Date.now()}.csv"`);
  return res.send(csv);
}

async function exportForecastMetrics(req, res) {
  const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
  const serializedHabits = habits.map(serializeHabit);
  const forecast = calculateForecast(habits, serializedHabits);
  const userName = req.user.name || "HabitFlow User";

  const csv = forecastMetricsToCsv(forecast, userName);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="habitflow-forecast-${Date.now()}.csv"`);
  return res.send(csv);
}

module.exports = {
  createReport,
  exportCurrentReport,
  exportForecastMetrics,
  exportProductivityAnalytics,
  exportReminderStats,
  exportReport,
  getCurrentReport,
  getReportHistory,
};
