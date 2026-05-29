const express = require("express");

const {
  createReminder,
  deleteReminder,
  getReminders,
  updateReminder,
} = require("../controllers/reminder.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getReminders).post(createReminder);
router.route("/:reminderId").patch(updateReminder).delete(deleteReminder);

module.exports = router;
