function HabitBoard({ habits }) {
  return (
    <>
      <div className="flex flex-col gap-3 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-950">Today</h2>
          <p className="mt-1 text-stone-600">
            Starter data lives inside the habits feature until the API grows.
          </p>
        </div>
        <button
          className="w-fit rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          type="button"
        >
          Add habit
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {habits.map((habit) => (
          <article
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            key={habit.name}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-stone-950">{habit.name}</h3>
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
            </div>
            <p className="mt-3 text-sm text-stone-600">
              {habit.completedDays} of {habit.targetDays} target days completed
              this week
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: habit.color,
                  width: `${(habit.completedDays / habit.targetDays) * 100}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default HabitBoard;
