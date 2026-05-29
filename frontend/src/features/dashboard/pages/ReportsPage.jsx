import {
  Award,
  Download,
  FileText,
  Flame,
  Medal,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  downloadReport,
  generateReport,
  getReportHistory,
} from "../../../services/api/reports";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

const tooltipStyle = {
  background: "#0c1118",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
};

function ReportMetric({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <Icon className="h-5 w-5 text-teal-200" />
      <p className="mt-3 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

function ReportsPage() {
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    getReportHistory()
      .then(({ reports }) => {
        setHistory(reports);
        setReport(reports[0] || null);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerateReport() {
    setError("");
    setWorking(true);

    try {
      const { report: nextReport } = await generateReport();
      setReport(nextReport);
      const { reports } = await getReportHistory();
      setHistory(reports);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  async function handleDownload(format) {
    if (!report) {
      return;
    }

    try {
      await downloadReport(report._id || report.id, format);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
          <p className="text-sm font-semibold uppercase text-teal-200">Reports</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Advanced Reporting Center
          </h1>
        </section>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-200">
              Reports
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Advanced Reporting Center
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Generate weekly, monthly, and yearly productivity reports from real
              HabitFlow history.
            </p>
          </div>
          <button
            className="rounded-md bg-teal-300 px-4 py-3 font-semibold text-[#04100f] transition hover:bg-teal-200 disabled:cursor-wait disabled:opacity-70"
            disabled={working}
            onClick={handleGenerateReport}
            type="button"
          >
            {working ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-rose-100">
          {error}
        </p>
      )}

      {!report ? (
        <section className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-teal-200" />
          <h2 className="mt-4 text-2xl font-semibold text-white">
            No reports generated yet
          </h2>
          <p className="mt-2 text-slate-400">
            Generate your first report to unlock charts, rankings, exports, and insights.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportMetric icon={FileText} label="Total habits created" value={report.summary.totalHabitsCreated} />
            <ReportMetric icon={Award} label="Total completions" value={report.summary.totalCompletions} />
            <ReportMetric icon={Flame} label="Current streak" value={`${report.summary.currentStreak} days`} />
            <ReportMetric icon={TrendingUp} label="Completion percentage" value={`${report.summary.completionPercentage}%`} />
            <ReportMetric icon={Medal} label="Longest streak" value={`${report.summary.longestStreak} days`} />
            <ReportMetric icon={Award} label="Best performing habit" value={report.summary.bestPerformingHabit} />
            <ReportMetric icon={FileText} label="Most missed habit" value={report.summary.mostMissedHabit} />
            <ReportMetric icon={TrendingUp} label="Performance score" value={`${report.performanceScore}/100`} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
            <section className="rounded-lg border border-teal-200/20 bg-gradient-to-br from-teal-300/12 via-white/[0.07] to-sky-300/10 p-6">
              <p className="text-sm font-semibold uppercase text-teal-200">
                Weekly / Monthly / Yearly Summary
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                {report.performanceScore}/100
              </h2>
              <p className="mt-3 text-slate-300">
                Performance score calculated from completion rate, streak strength,
                consistency, and missed habits.
              </p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-300 to-sky-300"
                  style={{ width: `${report.performanceScore}%` }}
                />
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
              <p className="text-sm font-semibold uppercase text-teal-200">
                Export
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  ["PDF", "pdf"],
                  ["Report CSV", "csv"],
                  ["Habit History CSV", "habit-history-csv"],
                ].map(([label, format]) => (
                  <button
                    className="flex items-center justify-between rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    key={format}
                    onClick={() => handleDownload(format)}
                    type="button"
                  >
                    {label}
                    <Download className="h-4 w-4 text-teal-200" />
                  </button>
                ))}
              </div>
            </section>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard description="Completions across the last seven days." title="Weekly completion trend">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={report.charts.weeklyTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line dataKey="percentage" dot={false} stroke="#5eead4" strokeWidth={3} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard description="Consistency over the last 30 days." title="Monthly consistency graph">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={report.charts.monthlyTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" interval={5} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line dataKey="percentage" dot={false} stroke="#38bdf8" strokeWidth={3} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard description="Completion rates by habit." title="Habit comparison chart">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={report.charts.habitComparison}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="title" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completionRate" fill="#5eead4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard description="Average completion by inferred category." title="Category performance chart">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={report.charts.categoryPerformance}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completionRate" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
            <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
              <h2 className="text-2xl font-semibold text-white">
                Habit Performance Rankings
              </h2>
              <div className="mt-5 space-y-3">
                {report.rankings.length ? (
                  report.rankings.map((habit, index) => (
                    <article
                      className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/15 px-4 py-3"
                      key={habit.id}
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {index + 1}. {habit.title}
                        </p>
                        <p className="text-sm text-slate-400">{habit.category}</p>
                      </div>
                      <p className="text-lg font-semibold text-teal-200">
                        {habit.completionRate}%
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No habit data yet.</p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
                <h2 className="text-xl font-semibold text-white">
                  AI-style insights
                </h2>
                <div className="mt-4 space-y-3">
                  {report.insights.map((insight) => (
                    <p className="rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300" key={insight}>
                      {insight}
                    </p>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
                <h2 className="text-xl font-semibold text-white">
                  Achievement Summary
                </h2>
                <p className="mt-2 text-3xl font-semibold text-teal-200">
                  {report.achievementSummary.progressPercentage}%
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {report.achievementSummary.unlocked} unlocked,{" "}
                  {report.achievementSummary.locked} locked
                </p>
              </section>
            </section>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <h2 className="text-xl font-semibold text-white">Report History</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {history.map((item) => (
                <button
                  className="rounded-md border border-white/10 bg-black/15 px-4 py-3 text-left transition hover:bg-white/10"
                  key={item._id}
                  onClick={() => setReport(item)}
                  type="button"
                >
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {new Date(item.generatedAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ReportsPage;
