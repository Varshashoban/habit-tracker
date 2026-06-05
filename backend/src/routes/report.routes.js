const express = require("express");

const {
  createReport,
  exportCurrentReport,
  exportReport,
  getCurrentReport,
  getReportHistory,
} = require("../controllers/report.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.post("/generate", createReport);
router.get("/current", getCurrentReport);
router.get("/export", exportCurrentReport);
router.get("/history", getReportHistory);
router.get("/:reportId/export", exportReport);

module.exports = router;
