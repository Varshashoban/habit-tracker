import { TrendingUp } from "lucide-react";

import AiInsightsCard from "../components/AiInsightsCard";
import AnalyticsCharts from "../components/AnalyticsCharts";
import MetricCard from "../components/MetricCard";
import {
  getMostSuccessfulHabit,
  getTrendIndicators,
} from "../utils/habitAnalytics";

function AnalyticsPage({ habits }) {
  const trend = getTrendIndicators(habits);
  const bestHabit = getMostSuccessfulHabit(habits);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <div className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
          <p className="text-sm font-semibold uppercase text-teal-200">
            Analytics
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Performance intelligence
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Track consistency, streak health, category balance, and growth over
            time.
          </p>
        </div>
        <MetricCard
          icon={TrendingUp}
          label={trend.label}
          value={`${trend.growth >= 0 ? "+" : ""}${trend.growth}%`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
          <p className="text-sm font-semibold uppercase text-teal-200">
            Most successful habit
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {bestHabit?.title || "No habits yet"}
          </h2>
          <p className="mt-2 text-slate-400">
            {bestHabit
              ? `${bestHabit.completionRate}% completion with a ${bestHabit.streak} day streak.`
              : "Create habits to unlock performance rankings."}
          </p>
        </section>
        <AiInsightsCard habits={habits} />
      </section>

      <AnalyticsCharts habits={habits} />
    </div>
  );
}

export default AnalyticsPage;
