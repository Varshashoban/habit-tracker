import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { getHabitColor } from "../utils/habitAnalytics";
import {
  getDateCompletionSummary,
  getMonthDays,
  getScheduledHabitsForDate,
  getUpcomingReminders,
  getWeekScheduleSummary,
  parseDateKey,
  toDateKey,
  weekdayOptions,
} from "../utils/calendarScheduling";

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

const statusStyles = {
  completed: {
    dot: "bg-emerald-300",
    label: "text-emerald-200",
    ring: "border-emerald-200/25 bg-emerald-300/10",
  },
  missed: {
    dot: "bg-rose-300",
    label: "text-rose-200",
    ring: "border-rose-200/25 bg-rose-300/10",
  },
  pending: {
    dot: "bg-amber-300",
    label: "text-amber-200",
    ring: "border-amber-200/25 bg-amber-300/10",
  },
};

function CalendarStat({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-300/10">
          <Icon className="h-5 w-5 text-teal-100" />
        </span>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </article>
  );
}

function ReminderGroup({ items, title }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/15 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.slice(0, 6).map((item) => {
            const habit = item.habit || item;
            const date = item.date;

            return (
              <div className="flex items-center justify-between gap-3" key={`${habit.id}-${date || title}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getHabitColor(habit) }}
                  />
                  <p className="truncate text-sm text-slate-300">{habit.title}</p>
                </div>
                {date && (
                  <p className="shrink-0 text-xs text-slate-500">
                    {shortDateFormatter.format(date)}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">No scheduled habits.</p>
        )}
      </div>
    </div>
  );
}

function DayPanel({ habits, onClose, onCompleteDate, selectedDate }) {
  const summary = getDateCompletionSummary(habits, selectedDate);
  const selectedDateKey = toDateKey(selectedDate);

  return (
    <aside className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_22px_90px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            Day details
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {shortDateFormatter.format(selectedDate)}
          </h2>
        </div>
        <button
          className="rounded-md border border-white/10 bg-white/[0.07] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <CalendarStat icon={CalendarDays} label="Scheduled" value={summary.scheduled.length} />
        <CalendarStat icon={CheckCircle2} label="Completed" value={summary.completed.length} />
        <CalendarStat icon={Clock3} label="Pending" value={summary.pending.length} />
        <CalendarStat icon={XCircle} label="Missed" value={summary.missed.length} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Completion</span>
          <span>{summary.percentage}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 to-emerald-300"
            style={{ width: `${summary.percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {summary.scheduled.length ? (
          summary.scheduled.map((habit) => (
            <article
              className={`rounded-lg border p-4 ${statusStyles[habit.calendarStatus].ring}`}
              key={habit.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusStyles[habit.calendarStatus].dot}`} />
                    <h3 className="truncate font-semibold text-white">{habit.title}</h3>
                  </div>
                  <p className={`mt-1 text-xs font-semibold uppercase ${statusStyles[habit.calendarStatus].label}`}>
                    {habit.calendarStatus}
                  </p>
                </div>
                {habit.calendarStatus !== "completed" && (
                  <button
                    className="shrink-0 rounded-md bg-teal-300 px-3 py-2 text-xs font-semibold text-[#04100f] transition hover:bg-teal-200"
                    onClick={() => onCompleteDate(habit.id, selectedDateKey)}
                    type="button"
                  >
                    Mark done
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-white/15 bg-black/15 p-5 text-center text-sm text-slate-400">
            No habits scheduled for this date.
          </p>
        )}
      </div>
    </aside>
  );
}

function CalendarPage({ habits, onUpdate }) {
  const [activeDate, setActiveDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(new Date()));
  const monthDays = useMemo(() => getMonthDays(activeDate), [activeDate]);
  const selectedDate = parseDateKey(selectedDateKey);
  const reminders = getUpcomingReminders(habits);
  const weekSummary = getWeekScheduleSummary(habits);

  function moveMonth(amount) {
    setActiveDate((currentDate) => {
      const nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() + amount);
      return nextDate;
    });
  }

  function jumpToToday() {
    const today = new Date();
    setActiveDate(today);
    setSelectedDateKey(toDateKey(today));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
        <p className="text-sm font-semibold uppercase text-teal-200">Calendar</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Planning calendar
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">
          Schedule habits visually, inspect each day, and keep upcoming routines
          close to the work surface.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <CalendarStat icon={CalendarDays} label="Scheduled this week" value={weekSummary.scheduled} />
        <CalendarStat icon={CheckCircle2} label="Completed this week" value={weekSummary.completed} />
        <CalendarStat icon={XCircle} label="Missed this week" value={weekSummary.missed} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem] xl:items-start">
        <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.2)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {monthFormatter.format(activeDate)}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-md border border-white/10 bg-white/[0.07] p-2 text-slate-200 transition hover:bg-white/10"
                onClick={() => moveMonth(-1)}
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="flex items-center gap-2 rounded-md border border-teal-200/25 bg-teal-300/10 px-3 py-2 text-sm font-semibold text-teal-100 transition hover:bg-teal-300/15"
                onClick={jumpToToday}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                Today
              </button>
              <button
                className="rounded-md border border-white/10 bg-white/[0.07] p-2 text-slate-200 transition hover:bg-white/10"
                onClick={() => moveMonth(1)}
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto pb-2">
            <div className="min-w-[44rem]">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-500">
                {weekdayOptions.map((day) => (
                  <span key={day.value}>{day.label}</span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {monthDays.map((day) => {
                  const dayHabits = getScheduledHabitsForDate(habits, day.date);
                  const isSelected = day.dateKey === selectedDateKey;

                  return (
                    <button
                      className={`min-h-28 rounded-lg border p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-teal-200/30 ${
                        isSelected
                          ? "border-teal-200/40 bg-teal-300/10"
                          : "border-white/10 bg-black/15"
                      } ${day.inCurrentMonth ? "" : "opacity-45"}`}
                      key={day.dateKey}
                      onClick={() => setSelectedDateKey(day.dateKey)}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                            day.isToday
                              ? "bg-teal-300 text-[#04100f]"
                              : "text-slate-200"
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                        <span className="text-xs text-slate-500">
                          {dayHabits.length || ""}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {dayHabits.slice(0, 3).map((habit) => (
                          <div
                            className="flex items-center gap-2 rounded-md bg-white/[0.06] px-2 py-1"
                            key={habit.id}
                          >
                            <span className={`h-2 w-2 shrink-0 rounded-full ${statusStyles[habit.calendarStatus].dot}`} />
                            <span className="truncate text-xs text-slate-300">
                              {habit.title}
                            </span>
                          </div>
                        ))}
                        {dayHabits.length > 3 && (
                          <p className="text-xs text-slate-500">
                            +{dayHabits.length - 3} more
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <DayPanel
            habits={habits}
            onClose={() => setSelectedDateKey(toDateKey(new Date()))}
            onCompleteDate={(habitId, completedDate) =>
              onUpdate(habitId, { completedDate })
            }
            selectedDate={selectedDate}
          />

          <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <p className="text-sm font-semibold uppercase text-teal-200">
              Upcoming reminders
            </p>
            <div className="mt-4 space-y-3">
              <ReminderGroup items={reminders.today} title="Today" />
              <ReminderGroup items={reminders.tomorrow} title="Tomorrow" />
              <ReminderGroup items={reminders.thisWeek} title="This Week" />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default CalendarPage;
