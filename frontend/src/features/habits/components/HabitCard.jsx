function HabitCard({ habit, onComplete, onDelete }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:border-teal-200/25 hover:bg-white/[0.09]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-white">{habit.title}</h3>
            <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium capitalize text-slate-300">
              {habit.frequency}
            </span>
          </div>
          <p className="mt-3 leading-7 text-slate-300">
            {habit.description || "No description yet."}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-slate-400">Current streak</p>
          <p className="mt-1 text-3xl font-semibold text-teal-200">
            {habit.streak}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Completion progress</span>
          <span>{habit.completionRate}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 to-emerald-300 transition-all"
            style={{ width: `${habit.completionRate}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-md bg-teal-300 px-4 py-2.5 text-sm font-semibold text-[#04100f] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={habit.completedToday}
          onClick={() => onComplete(habit.id)}
          type="button"
        >
          {habit.completedToday ? "Completed today" : "Mark completed"}
        </button>
        <button
          className="rounded-md border border-rose-200/25 bg-rose-300/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15"
          onClick={() => onDelete(habit.id)}
          type="button"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default HabitCard;
