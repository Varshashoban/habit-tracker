const express = require("express");

const {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabits,
  updateHabit,
} = require("../controllers/habit.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getHabits).post(createHabit);
router.patch("/:habitId/complete", completeHabit);
router.route("/:habitId").patch(updateHabit).delete(deleteHabit);

module.exports = router;
