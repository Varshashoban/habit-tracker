export const weekdayOptions = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function toDateKey(date) {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey) {
  return new Date(`${dateKey}T00:00:00`);
}

export function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function startOfDay(date = new Date()) {
  return parseDateKey(toDateKey(date));
}

export function startOfWeek(date = new Date()) {
  const weekStart = startOfDay(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart;
}

export function endOfWeek(date = new Date()) {
  return addDays(startOfWeek(date), 6);
}

export function getMonthDays(activeDate) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const gridStart = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);

    return {
      date,
      dateKey: toDateKey(date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isToday: toDateKey(date) === toDateKey(new Date()),
    };
  });
}

function isBetweenScheduleBounds(habit, date) {
  const dateKey = toDateKey(date);
  const startDateKey = habit.startDate || toDateKey(habit.createdAt || new Date());
  const endDateKey = habit.endDate;

  return dateKey >= startDateKey && (!endDateKey || dateKey <= endDateKey);
}

export function isHabitScheduledOnDate(habit, date) {
  if (!isBetweenScheduleBounds(habit, date)) {
    return false;
  }

  const dateKey = toDateKey(date);
  const weekday = date.getDay();
  const scheduledDays = habit.scheduledDays || [];

  if (habit.frequency === "specific_dates") {
    return (habit.specificDates || []).includes(dateKey);
  }

  if (habit.frequency === "custom_weekdays") {
    return scheduledDays.includes(weekday);
  }

  if (habit.frequency === "weekly") {
    return scheduledDays.length
      ? scheduledDays.includes(weekday)
      : weekday === parseDateKey(habit.startDate || habit.createdAt).getDay();
  }

  return true;
}

export function getHabitStatusForDate(habit, date) {
  const dateKey = toDateKey(date);
  const completed = (habit.completedDates || []).includes(dateKey);

  if (completed) {
    return "completed";
  }

  return parseDateKey(dateKey) < startOfDay() ? "missed" : "pending";
}

export function getScheduledHabitsForDate(habits, date) {
  return habits
    .filter((habit) => isHabitScheduledOnDate(habit, date))
    .map((habit) => ({
      ...habit,
      calendarStatus: getHabitStatusForDate(habit, date),
    }));
}

export function getDateCompletionSummary(habits, date) {
  const scheduled = getScheduledHabitsForDate(habits, date);
  const completed = scheduled.filter(
    (habit) => habit.calendarStatus === "completed",
  );
  const missed = scheduled.filter((habit) => habit.calendarStatus === "missed");
  const pending = scheduled.filter((habit) => habit.calendarStatus === "pending");

  return {
    completed,
    missed,
    pending,
    percentage: scheduled.length
      ? Math.round((completed.length / scheduled.length) * 100)
      : 0,
    scheduled,
  };
}

export function getWeekScheduleSummary(habits, date = new Date()) {
  const weekStart = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const summaries = days.map((day) => getDateCompletionSummary(habits, day));

  return {
    completed: summaries.reduce(
      (total, summary) => total + summary.completed.length,
      0,
    ),
    missed: summaries.reduce((total, summary) => total + summary.missed.length, 0),
    scheduled: summaries.reduce(
      (total, summary) => total + summary.scheduled.length,
      0,
    ),
  };
}

export function getUpcomingReminders(habits) {
  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const weekEnd = endOfWeek(today);
  const onlyOpen = (habit) => habit.calendarStatus !== "completed";

  return {
    thisWeek: Array.from({ length: 7 }, (_, index) => addDays(today, index))
      .filter((date) => date <= weekEnd)
      .flatMap((date) =>
        getScheduledHabitsForDate(habits, date)
          .filter(onlyOpen)
          .map((habit) => ({
            date,
            habit,
          })),
      ),
    today: getScheduledHabitsForDate(habits, today).filter(onlyOpen),
    tomorrow: getScheduledHabitsForDate(habits, tomorrow).filter(onlyOpen),
  };
}
