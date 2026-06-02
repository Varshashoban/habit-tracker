import { AlertCircle, Bell, Clock3 } from "lucide-react";

function ReminderRow({ reminder }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/15 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {reminder.habit?.title || "Habit reminder"}
        </p>
        <p className="truncate text-xs text-slate-400">
          {reminder.message || "Time to keep the streak alive."}
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-teal-300/10 px-2 py-1 text-xs font-semibold text-teal-100">
        {reminder.time}
      </span>
    </div>
  );
}

export function TodayReminderWidget({ reminders = [] }) {
  return (
    <section className="h-full rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-300/10">
          <Bell className="h-5 w-5 text-teal-100" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            Today&apos;s Reminders
          </p>
          <h2 className="text-xl font-semibold text-white">
            {reminders.length} scheduled
          </h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {reminders.length ? (
          reminders.slice(0, 4).map((reminder) => (
            <ReminderRow key={`${reminder.id}-${reminder.time}`} reminder={reminder} />
          ))
        ) : (
          <p className="rounded-md border border-dashed border-white/15 bg-black/15 p-4 text-sm text-slate-400">
            No reminders scheduled for today.
          </p>
        )}
      </div>
    </section>
  );
}

export function UpcomingRemindersPanel({ reminders = [] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-300/10">
          <Clock3 className="h-5 w-5 text-sky-100" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            Upcoming Reminders
          </p>
          <h2 className="text-xl font-semibold text-white">Next 7 days</h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {reminders.length ? (
          reminders.slice(0, 6).map((reminder) => (
            <ReminderRow
              key={`${reminder.id}-${reminder.dueAt}`}
              reminder={{
                ...reminder,
                time: new Date(reminder.dueAt).toLocaleString([], {
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "short",
                }),
              }}
            />
          ))
        ) : (
          <p className="rounded-md border border-dashed border-white/15 bg-black/15 p-4 text-sm text-slate-400">
            No upcoming reminders yet.
          </p>
        )}
      </div>
    </section>
  );
}

export function MissedRemindersPanel({ reminders = [] }) {
  return (
    <section className="rounded-lg border border-rose-500/20 bg-rose-500/[0.03] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-rose-500/10 animate-pulse">
          <AlertCircle className="h-5 w-5 text-rose-300" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase text-rose-300 tracking-wider">
            Missed Reminders
          </p>
          <h2 className="text-xl font-semibold text-white">
            {reminders.length} pending completion
          </h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {reminders.length ? (
          reminders.slice(0, 4).map((reminder) => (
            <div
              className="flex items-center justify-between gap-3 rounded-md border border-rose-500/10 bg-black/25 px-3 py-2.5 transition hover:border-rose-500/20"
              key={`${reminder.id}-${reminder.time}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {reminder.habit?.title || "Habit reminder"}
                </p>
                <p className="truncate text-xs text-rose-200/60 mt-0.5">
                  {reminder.message || "Time to keep the streak alive."}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-300">
                {reminder.time}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-white/10 bg-black/15 p-4 text-sm text-slate-400">
            No missed reminders. Great job!
          </p>
        )}
      </div>
    </section>
  );
}
