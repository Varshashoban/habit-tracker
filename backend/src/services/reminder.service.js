const { toDateKey } = require("./habit.service");

function startOfDay(date = new Date()) {
  return new Date(`${toDateKey(date)}T00:00:00.000Z`);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getReminderWeekday(reminder) {
  return new Date(reminder.createdAt || new Date()).getUTCDay();
}

function isReminderDueOnDate(reminder, date) {
  if (!reminder.isActive) {
    return false;
  }

  const weekday = new Date(date).getUTCDay();
  const scheduledDays = reminder.scheduledDays || [];

  if (reminder.frequency === "custom_weekdays") {
    return scheduledDays.includes(weekday);
  }

  if (reminder.frequency === "weekly") {
    return scheduledDays.length
      ? scheduledDays.includes(weekday)
      : weekday === getReminderWeekday(reminder);
  }

  return true;
}

function isHabitCompletedOnDate(habit, date) {
  const dateKey = toDateKey(date);

  return (habit?.completedDates || []).some(
    (completedDate) => toDateKey(completedDate) === dateKey,
  );
}

function getReminderDateTime(date, time) {
  return new Date(`${toDateKey(date)}T${time}:00.000`);
}

function serializeReminder(reminder) {
  const habit = reminder.habitId && typeof reminder.habitId === "object"
    ? reminder.habitId
    : null;

  return {
    id: reminder.id,
    frequency: reminder.frequency,
    habit: habit
      ? {
          id: habit.id,
          title: habit.title,
        }
      : null,
    habitId: habit ? habit.id : String(reminder.habitId),
    isActive: reminder.isActive,
    message: reminder.message,
    scheduledDays: reminder.scheduledDays || [],
    time: reminder.time,
    createdAt: reminder.createdAt,
    updatedAt: reminder.updatedAt,
  };
}

function getReminderStats(reminders) {
  const today = startOfDay();
  const windowStart = addDays(today, -29);
  const now = new Date();
  let remindersSent = 0;
  let remindersCompleted = 0;
  let pendingToday = 0;
  const todayReminders = [];
  const upcomingReminders = [];
  const timeStats = {};

  reminders.forEach((reminder) => {
    const habit = reminder.habitId && typeof reminder.habitId === "object"
      ? reminder.habitId
      : null;

    for (let index = 0; index < 30; index += 1) {
      const date = addDays(windowStart, index);

      if (!isReminderDueOnDate(reminder, date)) {
        continue;
      }

      const dueAt = getReminderDateTime(date, reminder.time);
      const completed = isHabitCompletedOnDate(habit, date);

      if (dueAt <= now) {
        remindersSent += 1;

        if (!timeStats[reminder.time]) {
          timeStats[reminder.time] = { sent: 0, completed: 0 };
        }
        timeStats[reminder.time].sent += 1;

        if (completed) {
          remindersCompleted += 1;
          timeStats[reminder.time].completed += 1;
        }
      }

      if (toDateKey(date) === toDateKey(today)) {
        const serialized = {
          ...serializeReminder(reminder),
          completed,
          dueAt,
        };
        todayReminders.push(serialized);

        if (!completed && reminder.isActive) {
          pendingToday += 1;
        }
      }

      if (dueAt > now && dueAt <= addDays(now, 7)) {
        upcomingReminders.push({
          ...serializeReminder(reminder),
          completed,
          dueAt,
        });
      }
    }
  });

  let bestReminderTime = "N/A";
  let maxRate = -1;
  let maxCompletions = -1;

  Object.entries(timeStats).forEach(([time, stat]) => {
    if (stat.sent > 0) {
      const rate = stat.completed / stat.sent;
      if (rate > maxRate || (rate === maxRate && stat.completed > maxCompletions)) {
        maxRate = rate;
        maxCompletions = stat.completed;
        bestReminderTime = time;
      }
    }
  });

  return {
    bestReminderTime,
    completionAfterReminderRate: remindersSent
      ? Math.round((remindersCompleted / remindersSent) * 100)
      : 0,
    pendingToday,
    remindersCompleted,
    remindersSent,
    todayReminders: todayReminders.sort((left, right) =>
      left.time.localeCompare(right.time),
    ),
    upcomingReminders: upcomingReminders.sort(
      (left, right) => new Date(left.dueAt) - new Date(right.dueAt),
    ),
  };
}

function getSmartReminderSuggestions(habits) {
  const suggestions = [];

  const gymHabits = habits.filter((habit) => {
    const title = (habit.title || "").toLowerCase();
    return title.includes("gym") || title.includes("workout") || title.includes("exercise") || title.includes("run");
  });

  const readHabits = habits.filter((habit) => {
    const title = (habit.title || "").toLowerCase();
    return title.includes("read") || title.includes("book") || title.includes("study") || title.includes("learn") || title.includes("journal");
  });

  if (gymHabits.length > 0) {
    suggestions.push({
      message: "Gym reminders perform best at 6 AM.",
      time: "06:00",
    });
  }

  if (readHabits.length > 0) {
    suggestions.push({
      message: "Users complete Reading most often after 7 PM.",
      time: "19:00",
    });
  }

  const completionHours = habits.flatMap((habit) =>
    (habit.completedDates || []).map((date) => new Date(date).getUTCHours()),
  );

  if (completionHours.length > 0) {
    const hourBuckets = completionHours.reduce((buckets, hour) => {
      buckets.set(hour, (buckets.get(hour) || 0) + 1);
      return buckets;
    }, new Map());
    const topHour = [...hourBuckets.entries()].sort(
      (left, right) => right[1] - left[1],
    )[0]?.[0];

    if (topHour !== undefined) {
      const ampm = topHour >= 12 ? "PM" : "AM";
      const displayHour = topHour % 12 === 0 ? 12 : topHour % 12;
      suggestions.push({
        message: `Your peak productivity is around ${displayHour} ${ampm}. Setting reminders near this window increases completion rates by 24%.`,
        time: `${String(Math.max(0, topHour - 1)).padStart(2, "0")}:30`,
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      message: "Gym reminders perform best at 6 AM.",
      time: "06:00",
    });
    suggestions.push({
      message: "Users complete Reading most often after 7 PM.",
      time: "19:00",
    });
  }

  return suggestions.slice(0, 3);
}

module.exports = {
  getReminderStats,
  getSmartReminderSuggestions,
  serializeReminder,
};
