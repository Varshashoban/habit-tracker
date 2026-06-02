import { ArrowDown, ArrowUp, Brain, Heart, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getForecast } from "../../../services/api/forecast";
import ChartCard from "../components/ChartCard";

const tooltipStyle = {
  background: "#0c1118",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
};

function ForecastPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getForecast()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || "Failed to load forecast intelligence.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-teal-300 border-white/10" />
        <p className="text-slate-400">Running predictive models on MongoDB logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200/20 bg-rose-300/10 p-6 text-center text-rose-100">
        <p className="font-semibold">Error Loading Forecast Data</p>
        <p className="mt-1 text-sm opacity-80">{error}</p>
      </div>
    );
  }

  const { burnout = {}, momentum = {}, monthlyForecast = {}, habitsForecast = [], weeklyForecast = [] } = data || {};

  // Burnout styling
  let burnoutColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (burnout.score > 80) {
    burnoutColorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  } else if (burnout.score > 40) {
    burnoutColorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }

  // Momentum styling
  const isPositiveMomentum = momentum.percentage >= 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <div className="rounded-lg border border-white/10 bg-white/[0.07] p-6 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-200 animate-pulse" />
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-200">
              AI Forecast Engine
            </p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Predictive intelligence
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Model completion trends, predict future streak thresholds, track burnout risks,
            and monitor momentum based on historical database records.
          </p>
        </div>
        <div className="rounded-lg border border-teal-300/20 bg-teal-300/5 p-6 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400 font-medium">Monthly Consistency Forecast</span>
            <TrendingUp className="h-5 w-5 text-teal-200" />
          </div>
          <div className="mt-4">
            <span className="text-5xl font-bold text-white">{monthlyForecast.consistency || 50}%</span>
            <p className="text-xs text-slate-400 mt-2">
              Expected consistency rate across all active habits for the next 30 days.
            </p>
          </div>
        </div>
      </section>

      {/* Burnout and Momentum Indicator Grid */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Burnout Card */}
        <article className={`rounded-lg border p-6 shadow-sm flex flex-col justify-between ${burnoutColorClass}`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider">Burnout Risk Zone</span>
              <Heart className="h-5 w-5" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{burnout.score || 0}%</span>
              <span className="text-lg font-semibold uppercase">({burnout.riskLevel})</span>
            </div>
            <p className="mt-4 text-sm text-slate-300 leading-6">
              {burnout.advice}
            </p>
          </div>
          <div className="mt-6 border-t border-white/5 pt-3">
            <p className="text-xs text-slate-400">
              Assesses active workload, streak lengths, and consistency volatility.
            </p>
          </div>
        </article>

        {/* Momentum Card */}
        <article className="rounded-lg border border-white/10 bg-white/[0.07] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-teal-200">
                Productivity Momentum
              </span>
              <Brain className="h-5 w-5 text-teal-200" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">
                {isPositiveMomentum ? "+" : ""}
                {momentum.percentage || 0}%
              </span>
              <span className="text-lg font-semibold uppercase text-slate-300">
                ({momentum.status})
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              {isPositiveMomentum ? (
                <ArrowUp className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <ArrowDown className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              <span>
                {isPositiveMomentum
                  ? "Your daily completion velocity has improved relative to your historical baseline."
                  : "Your daily completion velocity is declining. Re-evaluate your scheduled workload."}
              </span>
            </div>
          </div>
          <div className="mt-6 border-t border-white/5 pt-3">
            <p className="text-xs text-slate-400">
              Compares recent 7-day completion rate against the prior 23-day consistency.
            </p>
          </div>
        </article>
      </section>

      {/* Weekly Forecast Chart Card */}
      <section className="grid gap-6">
        <ChartCard
          description="Expected daily completions for the next 7 days modeled on individual habit probability."
          title="7-Day expected completions"
        >
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={weeklyForecast}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff10" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="targetCompletions"
                  fill="rgba(255, 255, 255, 0.12)"
                  name="Scheduled Habits"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expectedCompletions"
                  fill="#5eead4"
                  name="Predicted Completions"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* Habits Forecast Table */}
      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Habit Success Forecasts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Habit</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4 text-center">Current Streak</th>
                <th className="py-3 px-4 text-center">Predicted Streak (7d)</th>
                <th className="py-3 px-4 text-right">Success Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {habitsForecast.length ? (
                habitsForecast.map((habit) => {
                  let probColor = "bg-rose-500/10 text-rose-300 border-rose-500/20";
                  if (habit.successProbability >= 75) {
                    probColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
                  } else if (habit.successProbability >= 45) {
                    probColor = "bg-sky-500/10 text-sky-300 border-sky-500/20";
                  }

                  return (
                    <tr className="hover:bg-white/[0.02] transition-colors" key={habit.id}>
                      <td className="py-4 px-4 font-medium text-white">{habit.title}</td>
                      <td className="py-4 px-4 capitalize">{habit.frequency.replace("_", " ")}</td>
                      <td className="py-4 px-4 text-center font-semibold">{habit.currentStreak} days</td>
                      <td className="py-4 px-4 text-center font-semibold text-teal-200">
                        {habit.predictedStreak} days
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${probColor}`}>
                          {habit.successProbability}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-6 text-center text-slate-400" colSpan="5">
                    Create active habits to unlock predictions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ForecastPage;
