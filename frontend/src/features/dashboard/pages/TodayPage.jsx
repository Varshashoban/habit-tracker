import { Target } from "lucide-react";

import ProgressRing from "../components/ProgressRing";
import TodayHabits from "../components/TodayHabits";
import { getDashboardStats, getMotivation } from "../utils/habitAnalytics";

function TodayPage({ habits, onComplete, onDelete }) {
  const stats = getDashboardStats(habits);
  const percentage = stats.totalHabits
    ? Math.round((stats.completedToday / stats.totalHabits) * 100)
    : 0;
  const motivation = getMotivation(stats);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
          <p className="text-sm font-semibold uppercase text-teal-200">Today</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            You completed {stats.completedToday} of {stats.totalHabits} habits today
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Keep the surface focused: one day, one checklist, one next action.
          </p>
        </div>
        <ProgressRing label="Productivity score" percentage={percentage} />
      </section>

      <section className="rounded-lg border border-teal-200/20 bg-teal-300/10 p-5">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-300/15">
            <Target className="h-5 w-5 text-teal-100" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-teal-200">
              Daily focus
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {motivation.headline}
            </h2>
            <p className="mt-2 leading-7 text-slate-300">{motivation.message}</p>
          </div>
        </div>
      </section>

      <TodayHabits habits={habits} onComplete={onComplete} onDelete={onDelete} />
    </div>
  );
}

export default TodayPage;
