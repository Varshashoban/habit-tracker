import {
  AlertTriangle,
  Brain,
  Lightbulb,
  Target,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getProductivityInsight } from "../../../services/api/productivity";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ProductivityScoreGauge from "../components/ProductivityScoreGauge";

const tooltipStyle = {
  background: "#0c1118",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
};

function InsightCard({ icon: Icon, children, title }) {
  return (
    <section className="h-full rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-300/10">
          <Icon className="h-5 w-5 text-teal-100" />
        </span>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ text }) {
  return <p className="text-sm leading-6 text-slate-400">{text}</p>;
}

function ProductivityCenterPage() {
  const [error, setError] = useState("");
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductivityInsight()
      .then(({ insight: nextInsight }) => setInsight(nextInsight))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
          <p className="text-sm font-semibold uppercase text-teal-200">
            Productivity Center
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Intelligence engine
          </h1>
        </section>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-md border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-rose-100">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
        <p className="text-sm font-semibold uppercase text-teal-200">
          Productivity Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Intelligence engine
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">
          A persisted productivity snapshot built from your real habit completion
          history.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <ProductivityScoreGauge score={insight.score} />
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <p className="text-sm text-slate-400">Habit completion</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {insight.metrics.todayCompletion}%
            </p>
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <p className="text-sm text-slate-400">Weekly trend</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {insight.metrics.trend >= 0 ? "+" : ""}
              {insight.metrics.trend}%
            </p>
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <p className="text-sm text-slate-400">Streak consistency</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {insight.metrics.streakConsistency}%
            </p>
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <p className="text-sm text-slate-400">Missed this week</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {insight.metrics.missedHabits}
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <InsightCard icon={Brain} title="AI Coach Panel">
          <div className="space-y-3">
            {insight.coachMessages.length ? (
              insight.coachMessages.map((message) => (
                <p
                  className="rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-slate-300"
                  key={message}
                >
                  {message}
                </p>
              ))
            ) : (
              <EmptyState text="Complete habits to unlock coaching messages." />
            )}
          </div>
        </InsightCard>

        <InsightCard icon={Lightbulb} title="Smart Recommendations">
          <div className="space-y-3">
            {insight.recommendations.length ? (
              insight.recommendations.slice(0, 4).map((recommendation) => (
                <p
                  className="rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-slate-300"
                  key={`${recommendation.type}-${recommendation.habitId}`}
                >
                  {recommendation.message}
                </p>
              ))
            ) : (
              <EmptyState text="No recommendations yet. Your system looks stable." />
            )}
          </div>
        </InsightCard>

        <InsightCard icon={AlertTriangle} title="Habit Risk Detection">
          <div className="space-y-3">
            {insight.riskHabits.length ? (
              insight.riskHabits.map((habit) => (
                <article
                  className="rounded-md border border-amber-200/25 bg-amber-300/10 px-4 py-3"
                  key={habit.habitId}
                >
                  <p className="font-semibold text-amber-100">{habit.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {habit.message}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState text="No streaks look at risk right now." />
            )}
          </div>
        </InsightCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <InsightCard icon={Trophy} title="Focus Habit of the Week">
          {insight.focusHabit ? (
            <div>
              <h3 className="text-2xl font-semibold text-white">
                {insight.focusHabit.title}
              </h3>
              <div className="mt-5 grid gap-3">
                <p className="rounded-md bg-black/20 px-4 py-3 text-sm text-slate-300">
                  Completion rate: {insight.focusHabit.completionRate}%
                </p>
                <p className="rounded-md bg-black/20 px-4 py-3 text-sm text-slate-300">
                  Current streak: {insight.focusHabit.streak} days
                </p>
                <p className="rounded-md bg-black/20 px-4 py-3 text-sm text-slate-300">
                  Total completions: {insight.focusHabit.completedDates}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState text="Create and complete habits to select a weekly focus." />
          )}
        </InsightCard>

        <ChartCard
          description="Completion percentage generated from real scheduled and completed habit history."
          title="Productivity Timeline"
        >
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={insight.timeline}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                interval={5}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
              <Line
                dataKey="percentage"
                dot={false}
                stroke="#5eead4"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-teal-200" />
          <p className="text-sm text-slate-400">
            Snapshot stored in MongoDB at{" "}
            {new Date(insight.createdAt).toLocaleString()}.
          </p>
        </div>
      </section>
    </div>
  );
}

export default ProductivityCenterPage;
