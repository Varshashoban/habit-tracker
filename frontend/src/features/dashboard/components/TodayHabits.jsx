function TodayHabits({ habits, onComplete, onDelete }) {
  if (!habits.length) {
    return (
      <section
        className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-8 text-center"
        id="today"
      >
        <h2 className="text-xl font-semibold text-white">No habits yet</h2>
        <p className="mt-3 text-slate-300">
          Add your first habit and this section becomes your daily command center.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4" id="today">
      {habits.map((habit) => (
        <article
          className="rounded-lg border border-white/10 bg-white/[0.07] p-5 transition hover:-translate-y-1 hover:border-teal-200/25 hover:bg-white/[0.09]"
          key={habit.id}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-white">{habit.title}</h3>
                <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium capitalize text-slate-300">
                  {habit.frequency}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {habit.description || "No description yet."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase text-slate-500">Streak</p>
                <p className="text-2xl font-semibold text-teal-200">
                  {habit.streak}
                </p>
              </div>
              <button
                className="rounded-md bg-teal-300 px-3 py-2 text-sm font-semibold text-[#04100f] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={habit.completedToday}
                onClick={() => onComplete(habit.id)}
                type="button"
              >
                {habit.completedToday ? "Done" : "Complete"}
              </button>
              <button
                className="rounded-md border border-rose-200/25 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15"
                onClick={() => onDelete(habit.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Recent completion</span>
              <span>{habit.completionRate}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300 transition-all"
                style={{ width: `${habit.completionRate}%` }}
              />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default TodayHabits;
