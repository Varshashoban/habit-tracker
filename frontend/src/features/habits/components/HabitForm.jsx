import { useState } from "react";

import { weekdayOptions } from "../../dashboard/utils/calendarScheduling";

const initialValues = {
  category: "Health",
  color: "#2dd4bf",
  description: "",
  endDate: "",
  frequency: "daily",
  scheduledDays: [],
  specificDatesText: "",
  startDate: new Date().toISOString().slice(0, 10),
  targetCompletionsPerWeek: 7,
  title: "",
};

const categoryOptions = [
  "Health",
  "Study",
  "Fitness",
  "Reading",
  "Personal Growth",
  "Custom",
];

const colorOptions = ["#2dd4bf", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

function HabitForm({ onCreate }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateValue(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function toggleScheduledDay(day) {
    setValues((current) => {
      const scheduledDays = current.scheduledDays.includes(day)
        ? current.scheduledDays.filter((scheduledDay) => scheduledDay !== day)
        : [...current.scheduledDays, day].sort((left, right) => left - right);

      return {
        ...current,
        scheduledDays,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (values.title.trim().length < 2) {
      setError("Habit title must be at least 2 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await onCreate({
        category: values.category,
        color: values.color,
        description: values.description,
        endDate: values.endDate,
        frequency: values.frequency,
        scheduledDays: values.scheduledDays,
        specificDates: values.specificDatesText
          .split(",")
          .map((date) => date.trim())
          .filter(Boolean),
        startDate: values.startDate,
        targetCompletionsPerWeek: values.targetCompletionsPerWeek,
        title: values.title,
      });
      setValues(initialValues);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-sm font-semibold uppercase text-teal-200">New habit</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Add a routine</h2>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Title
          </span>
          <input
            className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-200/60"
            name="title"
            onChange={updateValue}
            placeholder="Read for 20 minutes"
            value={values.title}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Description
          </span>
          <textarea
            className="min-h-28 w-full resize-none rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-200/60"
            name="description"
            onChange={updateValue}
            placeholder="Why this habit matters"
            value={values.description}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Frequency
          </span>
          <select
            className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-teal-200/60"
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
            <option className="bg-[#101720]" value="specific_dates">
              Specific dates
            </option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Start Date
            </span>
            <input
              className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-teal-200/60"
              name="startDate"
              onChange={updateValue}
              type="date"
              value={values.startDate}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              End Date
            </span>
            <input
              className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-teal-200/60"
              name="endDate"
              onChange={updateValue}
              type="date"
              value={values.endDate}
            />
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
                    : "border-white/15 bg-black/25 text-slate-300 hover:bg-white/10"
                }`}
                key={day.value}
                onClick={() => toggleScheduledDay(day.value)}
                type="button"
              >
                {day.label}
              </button>
            ))}
          </div>
        </label>

        {values.frequency === "specific_dates" && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Specific Dates
            </span>
            <input
              className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-200/60"
              name="specificDatesText"
              onChange={updateValue}
              placeholder="2026-06-01, 2026-06-08"
              value={values.specificDatesText}
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Target Completions Per Week
          </span>
          <input
            className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-teal-200/60"
            max="7"
            min="1"
            name="targetCompletionsPerWeek"
            onChange={updateValue}
            type="number"
            value={values.targetCompletionsPerWeek}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Category
            </span>
            <select
              className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-teal-200/60"
              name="category"
              onChange={updateValue}
              value={values.category}
            >
              {categoryOptions.map((category) => (
                <option className="bg-[#101720]" key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Color
            </span>
            <div className="flex h-[50px] items-center gap-2 rounded-md border border-white/15 bg-black/25 px-3">
              {colorOptions.map((color) => (
                <button
                  aria-label={`Use ${color}`}
                  className={`h-7 w-7 rounded-full border transition ${
                    values.color === color
                      ? "border-white scale-110"
                      : "border-white/20"
                  }`}
                  key={color}
                  onClick={() =>
                    setValues((current) => ({ ...current, color }))
                  }
                  style={{ backgroundColor: color }}
                  type="button"
                />
              ))}
            </div>
          </label>
        </div>

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
          {submitting ? "Adding..." : "Add habit"}
        </button>
      </div>
    </form>
  );
}

export default HabitForm;
