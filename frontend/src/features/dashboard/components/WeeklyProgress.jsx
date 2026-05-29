import { getWeeklyActivity } from "../utils/habitAnalytics";

function WeeklyProgress({ habits }) {
  const weeklyActivity = getWeeklyActivity(habits);
  const totalTarget = weeklyActivity.reduce((total, day) => total + day.target, 0);
  const totalCompleted = weeklyActivity.reduce(
    (total, day) => total + day.completed,
    0,
  );
  const weeklyPercentage = totalTarget
    ? Math.round((totalCompleted / totalTarget) * 100)
    : 0;

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            Weekly progress
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {weeklyPercentage}% complete
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          {totalCompleted} of {totalTarget} planned checkmarks
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {weeklyActivity.map((day) => {
          const percentage = day.target
            ? Math.round((day.completed / day.target) * 100)
            : 0;

          return (
            <div className="grid gap-2 sm:grid-cols-[4rem_1fr_3rem] sm:items-center" key={day.day}>
              <p className="text-sm font-medium text-slate-300">{day.day}</p>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300 shadow-[0_0_24px_rgba(45,212,191,0.28)] transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 sm:text-right">
                {percentage}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WeeklyProgress;
