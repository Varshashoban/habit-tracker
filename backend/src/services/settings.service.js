const Settings = require("../models/settings.model");
const User = require("../models/user.model");
const AppError = require("../utils/appError");

const firstDayOptions = new Set(["sunday", "monday"]);
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function serializeSettings(settings) {
  return {
    account: {
      darkMode: Boolean(settings.account?.darkMode),
      firstDayOfWeek: settings.account?.firstDayOfWeek || "monday",
      timezone: settings.account?.timezone || "Asia/Kolkata",
    },
    notifications: {
      achievements: Boolean(settings.notifications?.achievements),
      browser: Boolean(settings.notifications?.browser),
      reminders: Boolean(settings.notifications?.reminders),
    },
    productivity: {
      dailyHabitGoal: settings.productivity?.dailyHabitGoal || 3,
      preferredHours: {
        end: settings.productivity?.preferredHours?.end || "17:00",
        start: settings.productivity?.preferredHours?.start || "09:00",
      },
      weeklyCompletionGoal: settings.productivity?.weeklyCompletionGoal || 80,
    },
    updatedAt: settings.updatedAt,
  };
}

async function getOrCreateSettings(userId) {
  let settings = await Settings.findOne({ userId });

  if (!settings) {
    settings = await Settings.create({ userId });
  }

  return settings;
}

function requirePlainObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(400, `${fieldName} must be an object.`);
  }
}

function parseBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new AppError(400, `${fieldName} must be true or false.`);
  }

  return value;
}

function parseInteger(value, fieldName, min, max) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < min || number > max) {
    throw new AppError(400, `${fieldName} must be between ${min} and ${max}.`);
  }

  return number;
}

function parseTime(value, fieldName) {
  if (typeof value !== "string" || !timePattern.test(value)) {
    throw new AppError(400, `${fieldName} must be a valid HH:mm time.`);
  }

  return value;
}

async function updateProfile(user, payload) {
  const { email, name } = payload;

  if (typeof name !== "string" || !name.trim()) {
    throw new AppError(400, "Name is required.");
  }

  if (typeof email !== "string" || !email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new AppError(400, "Enter a valid email address.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({
    _id: { $ne: user.id },
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError(409, "An account with that email already exists.");
  }

  user.name = name.trim();
  user.email = normalizedEmail;
  await user.save();

  return user;
}

async function updateNotificationPreferences(userId, payload) {
  requirePlainObject(payload, "Notification preferences");

  const settings = await getOrCreateSettings(userId);
  const fields = ["achievements", "browser", "reminders"];

  fields.forEach((field) => {
    if (payload[field] !== undefined) {
      settings.notifications[field] = parseBoolean(
        payload[field],
        `Notification preference ${field}`,
      );
    }
  });

  await settings.save();
  return settings;
}

async function updateProductivityPreferences(userId, payload) {
  requirePlainObject(payload, "Productivity preferences");

  const settings = await getOrCreateSettings(userId);

  if (payload.dailyHabitGoal !== undefined) {
    settings.productivity.dailyHabitGoal = parseInteger(
      payload.dailyHabitGoal,
      "Daily habit goal",
      1,
      50,
    );
  }

  if (payload.weeklyCompletionGoal !== undefined) {
    settings.productivity.weeklyCompletionGoal = parseInteger(
      payload.weeklyCompletionGoal,
      "Weekly completion goal",
      1,
      100,
    );
  }

  if (payload.preferredHours !== undefined) {
    requirePlainObject(payload.preferredHours, "Preferred productivity hours");
    settings.productivity.preferredHours = {
      end: parseTime(payload.preferredHours.end, "Preferred end time"),
      start: parseTime(payload.preferredHours.start, "Preferred start time"),
    };
  }

  await settings.save();
  return settings;
}

async function updateAccountPreferences(userId, payload) {
  requirePlainObject(payload, "Account preferences");

  const settings = await getOrCreateSettings(userId);

  if (payload.darkMode !== undefined) {
    settings.account.darkMode = parseBoolean(payload.darkMode, "Dark mode");
  }

  if (payload.timezone !== undefined) {
    if (typeof payload.timezone !== "string" || !payload.timezone.trim()) {
      throw new AppError(400, "Timezone is required.");
    }

    settings.account.timezone = payload.timezone.trim();
  }

  if (payload.firstDayOfWeek !== undefined) {
    if (!firstDayOptions.has(payload.firstDayOfWeek)) {
      throw new AppError(400, "First day of week is invalid.");
    }

    settings.account.firstDayOfWeek = payload.firstDayOfWeek;
  }

  await settings.save();
  return settings;
}

async function updatePassword(userId, payload) {
  const { currentPassword, newPassword } = payload;

  if (typeof currentPassword !== "string" || !currentPassword) {
    throw new AppError(400, "Current password is required.");
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new AppError(400, "New password must be at least 8 characters.");
  }

  const user = await User.findById(userId).select("+password");
  const passwordMatches = user && (await user.comparePassword(currentPassword));

  if (!passwordMatches) {
    throw new AppError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();
}

module.exports = {
  getOrCreateSettings,
  serializeSettings,
  updateAccountPreferences,
  updateNotificationPreferences,
  updatePassword,
  updateProductivityPreferences,
  updateProfile,
};
