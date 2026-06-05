const express = require("express");
const { getForecast } = require("../controllers/forecast.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getForecast);

module.exports = router;
