import { Bell, CheckCircle2, Clock3, Lightbulb, Trash2 } from "lucide-react";
import { useState } from "react";

import { weekdayOptions } from "../utils/calendarScheduling";

const initialValues = {
  frequency: "daily",
  habitId: "",
  message: "",
  scheduledDays: [],
  time: "08:00",
};

function ReminderForm({ habits, onCreate }) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);

  function updateValue(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function toggleDay(day) {
    setValues((current) => ({
      ...current,
      scheduledDays: current.scheduledDays.includes(day)
        ? current.scheduledDays.filter((scheduledDay) => scheduledDay !== day)
        : [...current.scheduledDays, day].sort((left, right) => left - right),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!values.habitId) {
      setError("Choose a habit for this reminder.");
      return;
    }

    if (!values.time) {
      setError("Choose a reminder time.");
      return;
    }

    setSubmitting(true);

    try {
      await onCreate(values);
      setValues(initialValues);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-white/10 bg-white/[0.07] p-5"
      onSubmit={handleSubmit}
    >
      <p className="text-sm font-semibold uppercase text-teal-200">New reminder</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Create a cue</h2>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Habit
          </span>
          <select
            className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
            name="habitId"
            onChange={updateValue}
            value={values.habitId}
          >
            <option className="bg-[#101720]" value="">
              Select habit
            </option>
            {habits.map((habit) => (
              <option className="bg-[#101720]" key={habit.id} value={habit.id}>
                {habit.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Time
            </span>
            <input
              className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
              name="time"
              onChange={updateValue}
              type="time"
              value={values.time}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Frequency
            </span>
            <select
              className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
              name="frequency"
              onChange={updateValue}
              value={values.frequency}
            >
              <option className="bg-[#101720]" value="daily">
                Daily
              </option>
              <option className="bg-[#101720]" value="weekly">
                Weekly
              </option>
              <option className="bg-[#101720]" value="custom_weekdays">
                Custom weekdays
              </option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Scheduled Days
          </span>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {weekdayOptions.map((day) => (
              <button
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  values.scheduledDays.includes(day.value)
                    ? "border-teal-200/40 bg-teal-300 text-[#04100f]"
                    : "border-white/15 bg-black/25 text-slate-300"
                }`}
                key={day.value}
                onClick={() => toggleDay(day.value)}
                type="button"
              >
                {day.label}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Custom message
          </span>
          <textarea
            className="min-h-24 w-full resize-none rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-200/60"
            name="message"
            onChange={updateValue}
            placeholder="A small prompt for your future self"
            value={values.message}
          />
        </label>

        {error && (
          <p className="rounded-md border border-rose-200/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </p>
        )}

        <button
          className="w-full rounded-md bg-teal-300 px-4 py-3 font-semibold text-[#04100f] transition hover:bg-teal-200 disabled:cursor-wait disabled:opacity-70"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating..." : "Create reminder"}
        </button>
      </div>
    </form>
  );
}

function ReminderCenterPage({
  habits,
  loading,
  onCreate,
  onDelete,
  onUpdate,
  reminderData,
}) {
  const { reminders = [], stats = {}, suggestions = [] } = reminderData || {};

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
        <p className="text-sm font-semibold uppercase text-teal-200">
          Reminder Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Notification and reminder system
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">
          Create habit cues, track reminder performance, and tune the timing
          around your real completion history.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
          <Bell className="h-5 w-5 text-teal-200" />
          <p className="mt-3 text-sm text-slate-400">Reminders sent</p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {stats.remindersSent || 0}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-200" />
          <p className="mt-3 text-sm text-slate-400">Completed after reminder</p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {stats.remindersCompleted || 0}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
          <Clock3 className="h-5 w-5 text-sky-200" />
          <p className="mt-3 text-sm text-slate-400">Completion after reminder</p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {stats.completionAfterReminderRate || 0}%
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem] xl:items-start">
        <div className="space-y-4">
          <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <h2 className="text-2xl font-semibold text-white">Active reminders</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="h-28 animate-pulse rounded-lg bg-white/[0.06]" />
              ) : reminders.length ? (
                reminders.map((reminder) => (
                  <article
                    className="rounded-lg border border-white/10 bg-black/15 p-4"
                    key={reminder.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {reminder.habit?.title || "Habit reminder"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {reminder.message || "No custom message."}
                        </p>
                        <p className="mt-2 text-xs uppercase text-teal-200">
                          {reminder.frequency.replace("_", " ")} at {reminder.time}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                            reminder.isActive
                              ? "border-emerald-200/25 bg-emerald-300/10 text-emerald-100"
                              : "border-white/15 bg-white/[0.07] text-slate-300"
                          }`}
                          onClick={() =>
                            onUpdate(reminder.id, { isActive: !reminder.isActive })
                          }
                          type="button"
                        >
                          {reminder.isActive ? "Active" : "Paused"}
                        </button>
                        <button
                          className="rounded-md border border-rose-200/25 bg-rose-300/10 p-2 text-rose-100"
                          onClick={() => onDelete(reminder.id)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-white/15 bg-black/15 p-6 text-center text-slate-400">
                  No reminders yet. Create one to start nudging your habits.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-teal-200" />
              <h2 className="text-xl font-semibold text-white">
                Smart reminder suggestions
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              {suggestions.map((suggestion) => (
                <p
                  className="rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300"
                  key={suggestion.message}
                >
                  {suggestion.message}
                </p>
              ))}
            </div>
          </section>
        </div>

        <ReminderForm habits={habits} onCreate={onCreate} />
      </section>
    </div>
  );
}

export default ReminderCenterPage;
