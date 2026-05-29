const Habit = require("../models/habit.model");
const Report = require("../models/report.model");
const {
  generateReport,
  historyToCsv,
  reportToCsv,
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
  const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
  const report = await generateReport(req.user.id, habits);

  res.status(201).json({ report });
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

  if (format === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="habitflow-report-${report.id}.pdf"`);
    return res.send(reportToPdf(report));
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

module.exports = {
  createReport,
  exportReport,
  getReportHistory,
};
