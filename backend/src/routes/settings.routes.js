const express = require("express");

const {
  getSettings,
  updateAccountSettings,
  updateNotificationSettings,
  updateProductivitySettings,
  updateProfileSettings,
  updateSecuritySettings,
} = require("../controllers/settings.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", getSettings);
router.patch("/profile", updateProfileSettings);
router.patch("/notifications", updateNotificationSettings);
router.patch("/productivity", updateProductivitySettings);
router.patch("/account", updateAccountSettings);
router.patch("/security", updateSecuritySettings);

module.exports = router;
