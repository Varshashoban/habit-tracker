import { Edit3, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import HabitForm from "../../habits/components/HabitForm";
import {
  getCategories,
  getHabitCategory,
  getHabitColor,
} from "../utils/habitAnalytics";
import { weekdayOptions } from "../utils/calendarScheduling";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Completion", value: "completion" },
  { label: "Streak", value: "streak" },
  { label: "Title", value: "title" },
];

function HabitEditForm({ habit, onCancel, onUpdate }) {
  const [values, setValues] = useState({
    description: habit.description || "",
    endDate: habit.endDate || "",
    frequency: habit.frequency,
    scheduledDays: habit.scheduledDays || [],
    specificDatesText: (habit.specificDates || []).join(", "),
    startDate: habit.startDate || new Date().toISOString().slice(0, 10),
    targetCompletionsPerWeek: habit.targetCompletionsPerWeek || 7,
    title: habit.title,
  });

  function updateValue(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function toggleScheduledDay(day) {
    setValues((current) => ({
      ...current,
      scheduledDays: current.scheduledDays.includes(day)
        ? current.scheduledDays.filter((scheduledDay) => scheduledDay !== day)
        : [...current.scheduledDays, day].sort((left, right) => left - right),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onUpdate(habit.id, {
      ...values,
      specificDates: values.specificDatesText
        .split(",")
        .map((date) => date.trim())
        .filter(Boolean),
    });
  }

  return (
    <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
      <input
        className="rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
        name="title"
        onChange={updateValue}
        value={values.title}
      />
      <textarea
        className="min-h-24 resize-none rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
        name="description"
        onChange={updateValue}
        value={values.description}
      />
      <select
        className="rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
        name="frequency"
        onChange={updateValue}
        value={values.frequency}
      >
        <option className="bg-[#101720]" value="daily">Daily</option>
        <option className="bg-[#101720]" value="weekly">Weekly</option>
        <option className="bg-[#101720]" value="custom_weekdays">Custom weekdays</option>
        <option className="bg-[#101720]" value="specific_dates">Specific dates</option>
      </select>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
          name="startDate"
          onChange={updateValue}
          type="date"
          value={values.startDate}
        />
        <input
          className="rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
          name="endDate"
          onChange={updateValue}
          type="date"
          value={values.endDate}
        />
        <input
          className="rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
          max="7"
          min="1"
          name="targetCompletionsPerWeek"
          onChange={updateValue}
          type="number"
          value={values.targetCompletionsPerWeek}
        />
      </div>
      <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
        {weekdayOptions.map((day) => (
          <button
            className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
              values.scheduledDays.includes(day.value)
                ? "border-teal-200/40 bg-teal-300 text-[#04100f]"
                : "border-white/15 bg-black/25 text-slate-300"
            }`}
            key={day.value}
            onClick={() => toggleScheduledDay(day.value)}
            type="button"
          >
            {day.label}
          </button>
        ))}
      </div>
      {values.frequency === "specific_dates" && (
        <input
          className="rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-200/60"
          name="specificDatesText"
          onChange={updateValue}
          placeholder="2026-06-01, 2026-06-08"
          value={values.specificDatesText}
        />
      )}
      <div className="flex gap-3">
        <button className="rounded-md bg-teal-300 px-4 py-2 text-sm font-semibold text-[#04100f]" type="submit">
          Save changes
        </button>
        <button className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}

function HabitsPage({ habits, onComplete, onCreate, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState("");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const filteredHabits = useMemo(() => {
    return habits
      .filter((habit) => {
        const category = getHabitCategory(habit);
        const matchesFilter = filter === "All" || category === filter;
        const matchesQuery = `${habit.title} ${habit.description}`
          .toLowerCase()
          .includes(query.toLowerCase());

        return matchesFilter && matchesQuery;
      })
      .sort((left, right) => {
        if (sort === "completion") return right.completionRate - left.completionRate;
        if (sort === "streak") return right.streak - left.streak;
        if (sort === "title") return left.title.localeCompare(right.title);
        return 0;
      });
  }, [filter, habits, query, sort]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
        <p className="text-sm font-semibold uppercase text-teal-200">Habits</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Habit management
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">
          Create, edit, search, filter, sort, and tune your routine system.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem] xl:items-start">
        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.07] p-4 lg:grid-cols-[1fr_12rem_10rem]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                className="w-full rounded-md border border-white/15 bg-black/25 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-teal-200/60"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search habits"
                value={query}
              />
            </label>
            <label className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <select
                className="w-full rounded-md border border-white/15 bg-black/25 py-3 pl-10 pr-4 text-white outline-none focus:border-teal-200/60"
                onChange={(event) => setFilter(event.target.value)}
                value={filter}
              >
                <option className="bg-[#101720]" value="All">All categories</option>
                {getCategories().map((category) => (
                  <option className="bg-[#101720]" key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <select
              className="rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
              onChange={(event) => setSort(event.target.value)}
              value={sort}
            >
              {sortOptions.map((option) => (
                <option className="bg-[#101720]" key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {filteredHabits.map((habit) => {
              const category = getHabitCategory(habit);

              return (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-teal-200/25"
                  key={habit.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: getHabitColor(habit) }}
                        />
                        <h2 className="text-xl font-semibold text-white">
                          {habit.title}
                        </h2>
                        <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {category}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {habit.description || "No description yet."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-md border border-teal-200/25 bg-teal-300/10 px-3 py-2 text-sm font-semibold text-teal-100"
                        disabled={habit.completedToday}
                        onClick={() => onComplete(habit.id)}
                        type="button"
                      >
                        {habit.completedToday ? "Done" : "Complete"}
                      </button>
                      <button
                        className="rounded-md border border-white/15 bg-white/[0.07] p-2 text-white"
                        onClick={() => setEditingId(habit.id)}
                        type="button"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md border border-rose-200/25 bg-rose-300/10 p-2 text-rose-100"
                        onClick={() => onDelete(habit.id)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: getHabitColor(habit),
                        width: `${habit.completionRate}%`,
                      }}
                    />
                  </div>
                  {editingId === habit.id && (
                    <HabitEditForm
                      habit={habit}
                      onCancel={() => setEditingId("")}
                      onUpdate={(habitId, payload) => {
                        onUpdate(habitId, payload);
                        setEditingId("");
                      }}
                    />
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-4" id="add-habit">
          <HabitForm onCreate={onCreate} />
          <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <p className="text-sm font-semibold uppercase text-teal-200">
              Color system
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {getCategories().map((category) => (
                <div className="flex items-center gap-2 text-sm text-slate-300" key={category}>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getHabitColor({ description: category, title: category }) }}
                  />
                  {category}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default HabitsPage;
