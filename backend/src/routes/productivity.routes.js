const express = require("express");

const {
  getProductivityInsight,
} = require("../controllers/productivity.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getProductivityInsight);

module.exports = router;
