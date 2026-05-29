const express = require("express");

const {
  createReport,
  exportReport,
  getReportHistory,
} = require("../controllers/report.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.post("/generate", createReport);
router.get("/history", getReportHistory);
router.get("/:reportId/export", exportReport);

module.exports = router;
