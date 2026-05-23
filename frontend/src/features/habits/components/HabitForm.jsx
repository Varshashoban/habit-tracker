import { useState } from "react";

const initialValues = {
  description: "",
  frequency: "daily",
  title: "",
};

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
        description: values.description,
        frequency: values.frequency,
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
          </select>
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
          {submitting ? "Adding..." : "Add habit"}
        </button>
      </div>
    </form>
  );
}

export default HabitForm;
