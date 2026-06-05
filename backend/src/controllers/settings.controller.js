const {
  getOrCreateSettings,
  serializeSettings,
  updateAccountPreferences,
  updateNotificationPreferences,
  updatePassword,
  updateProductivityPreferences,
  updateProfile,
} = require("../services/settings.service");

async function getSettings(req, res) {
  const settings = await getOrCreateSettings(req.user.id);

  res.json({
    settings: serializeSettings(settings),
    user: req.user.toAuthJSON(),
  });
}

async function updateProfileSettings(req, res) {
  const user = await updateProfile(req.user, req.body);
  const settings = await getOrCreateSettings(req.user.id);

  res.json({
    message: "Profile updated successfully.",
    settings: serializeSettings(settings),
    user: user.toAuthJSON(),
  });
}

async function updateNotificationSettings(req, res) {
  const settings = await updateNotificationPreferences(req.user.id, req.body);

  res.json({
    message: "Notification preferences saved.",
    settings: serializeSettings(settings),
  });
}

async function updateProductivitySettings(req, res) {
  const settings = await updateProductivityPreferences(req.user.id, req.body);

  res.json({
    message: "Productivity preferences saved.",
    settings: serializeSettings(settings),
  });
}

async function updateAccountSettings(req, res) {
  const settings = await updateAccountPreferences(req.user.id, req.body);

  res.json({
    message: "Account preferences saved.",
    settings: serializeSettings(settings),
  });
}

async function updateSecuritySettings(req, res) {
  await updatePassword(req.user.id, req.body);

  res.json({
    message: "Password updated successfully.",
  });
}

module.exports = {
  getSettings,
  updateAccountSettings,
  updateNotificationSettings,
  updateProductivitySettings,
  updateProfileSettings,
  updateSecuritySettings,
};
