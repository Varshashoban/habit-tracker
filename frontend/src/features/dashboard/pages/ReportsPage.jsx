import {
  Activity,
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  FileJson,
  FileText,
  Flame,
  Loader2,
  Medal,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
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
  downloadCurrentReport,
  downloadReport,
  generateReport,
  getCurrentReport,
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

const rangeOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Last 90 Days", value: "last90" },
  { label: "Custom Date Range", value: "custom" },
];

function toDateInputValue(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function getDefaultCustomRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29);

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

function getFilters(range, customRange) {
  if (range === "custom") {
    return {
      endDate: customRange.endDate,
      range,
      startDate: customRange.startDate,
    };
  }

  return { range };
}

function ReportMetric({ icon: Icon, label, tone = "text-teal-200", value }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="mt-3 text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-words text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-teal-300 text-[#04100f]"
          : "border border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ExportButton({ icon: Icon, label, onClick, working }) {
  return (
    <button
      className="flex items-center justify-between rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-70"
      disabled={working}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-teal-200" />
        {label}
      </span>
      {working ? (
        <Loader2 className="h-4 w-4 animate-spin text-teal-200" />
      ) : (
        <Download className="h-4 w-4 text-teal-200" />
      )}
    </button>
  );
}

function Heatmap({ days }) {
  if (!days.length) {
    return (
      <p className="rounded-md border border-dashed border-white/15 bg-black/15 p-4 text-sm text-slate-400">
        No completion days available for this range.
      </p>
    );
  }

  const maxValue = Math.max(...days.map((day) => day.percentage), 1);

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const intensity = day.percentage / maxValue;
        const background = `rgba(45, 212, 191, ${0.12 + intensity * 0.72})`;

        return (
          <div
            className="aspect-square rounded-md border border-white/10"
            key={day.date}
            style={{ background }}
            title={`${day.date}: ${day.percentage}%`}
          >
            <span className="sr-only">
              {day.date}: {day.percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const tone =
    status === "Excellent"
      ? "border-teal-200/25 bg-teal-300/10 text-teal-100"
      : status === "Steady"
        ? "border-sky-200/25 bg-sky-300/10 text-sky-100"
        : status === "Needs attention"
          ? "border-amber-200/25 bg-amber-300/10 text-amber-100"
          : "border-slate-200/15 bg-white/5 text-slate-300";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}

function ReportsPage() {
  const [customRange, setCustomRange] = useState(getDefaultCustomRange);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("last30");
  const [report, setReport] = useState(null);
  const [working, setWorking] = useState(false);

  const filters = useMemo(() => getFilters(range, customRange), [customRange, range]);

  const fetchReportData = useCallback(async (nextFilters) => {
    const [{ report: nextReport }, { reports }] = await Promise.all([
      getCurrentReport(nextFilters),
      getReportHistory(),
    ]);

    return { nextReport, reports };
  }, []);

  const loadReport = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const { nextReport, reports } = await fetchReportData(filters);
      setReport(nextReport);
      setHistory(reports);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [fetchReportData, filters]);

  useEffect(() => {
    let isCurrent = true;

    fetchReportData(filters)
      .then(({ nextReport, reports }) => {
        if (!isCurrent) {
          return;
        }

        setReport(nextReport);
        setHistory(reports);
        setError("");
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchReportData, filters]);

  async function handleGenerateReport() {
    setError("");
    setWorking(true);

    try {
      const { report: nextReport } = await generateReport(filters);
      const { reports } = await getReportHistory();
      setReport(nextReport);
      setHistory(reports);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  async function handleDownloadCurrent(format) {
    setError("");
    setExporting(format);

    try {
      await downloadCurrentReport(format, filters);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExporting("");
    }
  }

  async function handleDownloadSaved(reportId, format) {
    setError("");
    setExporting(`${reportId}-${format}`);

    try {
      await downloadReport(reportId, format);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExporting("");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
          <p className="text-sm font-semibold uppercase text-teal-200">Reports</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Analytics and Export Center
          </h1>
        </section>
        <LoadingSkeleton />
      </div>
    );
  }

  const summary = report?.summary || {};
  const charts = report?.charts || {};
  const insights = report?.insights || {};
  const rankings = report?.rankings || [];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-teal-200/20 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(6,78,72,0.28))] p-6 shadow-[0_24px_100px_rgba(20,184,166,0.14)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-200">
              Reports
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Analytics and Export Center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Filter real HabitFlow history, compare habit performance, inspect
              completion trends, and export production-ready reports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={loadReport}
              type="button"
            >
              <RefreshCw className="h-4 w-4 text-teal-200" />
              Refresh
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-teal-300 px-4 py-3 text-sm font-bold text-[#04100f] transition hover:bg-teal-200 disabled:cursor-wait disabled:opacity-70"
              disabled={working}
              onClick={handleGenerateReport}
              type="button"
            >
              {working ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Save snapshot
            </button>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-rose-100">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Date filters</h2>
            <p className="mt-1 text-sm text-slate-400">
              Current range: {report?.range?.label} ({report?.range?.startDate} to{" "}
              {report?.range?.endDate})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <FilterButton
                active={range === option.value}
                key={option.value}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </FilterButton>
            ))}
          </div>
        </div>

        {range === "custom" && (
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Start date</span>
              <input
                className="mt-2 w-full rounded-md border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-200/60"
                onChange={(event) =>
                  setCustomRange((currentRange) => ({
                    ...currentRange,
                    startDate: event.target.value,
                  }))
                }
                type="date"
                value={customRange.startDate}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">End date</span>
              <input
                className="mt-2 w-full rounded-md border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-200/60"
                onChange={(event) =>
                  setCustomRange((currentRange) => ({
                    ...currentRange,
                    endDate: event.target.value,
                  }))
                }
                type="date"
                value={customRange.endDate}
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-300 px-4 py-2.5 text-sm font-bold text-[#04100f] transition hover:bg-teal-200"
              onClick={loadReport}
              type="button"
            >
              <CalendarDays className="h-4 w-4" />
              Apply range
            </button>
          </div>
        )}
      </section>

      {!report ? (
        <section className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-teal-200" />
          <h2 className="mt-4 text-2xl font-semibold text-white">
            No report data available
          </h2>
          <p className="mt-2 text-slate-400">
            Create habits and complete them to populate analytics.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportMetric icon={FileText} label="Total habits" value={summary.totalHabits || 0} />
            <ReportMetric icon={CheckCircle2} label="Completion rate" value={`${summary.completionRate || 0}%`} />
            <ReportMetric icon={Flame} label="Current streak" value={`${summary.currentStreak || 0} days`} />
            <ReportMetric icon={Medal} label="Longest streak" value={`${summary.longestStreak || 0} days`} />
            <ReportMetric icon={TrendingUp} label="Weekly completion" value={`${summary.weeklyCompletion || 0}%`} />
            <ReportMetric icon={Activity} label="Monthly completion" value={`${summary.monthlyCompletion || 0}%`} />
            <ReportMetric icon={Target} label="Habit success rate" value={`${summary.habitSuccessRate || 0}%`} />
            <ReportMetric icon={Award} label="Performance score" value={`${report.performanceScore || 0}/100`} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
            <section className="rounded-lg border border-teal-200/20 bg-gradient-to-br from-teal-300/12 via-white/[0.07] to-sky-300/10 p-6">
              <p className="text-sm font-semibold uppercase text-teal-200">
                Productivity summary
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                {report.performanceScore}/100
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {insights.productivitySummary}
              </p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-300 to-sky-300"
                  style={{ width: `${report.performanceScore || 0}%` }}
                />
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
              <p className="text-sm font-semibold uppercase text-teal-200">
                Export current report
              </p>
              <div className="mt-4 grid gap-3">
                <ExportButton
                  icon={FileText}
                  label="Export as CSV"
                  onClick={() => handleDownloadCurrent("csv")}
                  working={exporting === "csv"}
                />
                <ExportButton
                  icon={FileJson}
                  label="Export as JSON"
                  onClick={() => handleDownloadCurrent("json")}
                  working={exporting === "json"}
                />
                <ExportButton
                  icon={Download}
                  label="Export as PDF"
                  onClick={() => handleDownloadCurrent("pdf")}
                  working={exporting === "pdf"}
                />
              </div>
            </section>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard description="Completion grouped by week in the selected range." title="Weekly completion trend">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={charts.weeklyTrend || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line dataKey="percentage" dot={false} stroke="#5eead4" strokeWidth={3} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard description="Completion grouped by month in the selected range." title="Monthly completion trend">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={charts.monthlyTrend || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area dataKey="percentage" fill="#38bdf8" fillOpacity={0.18} stroke="#38bdf8" strokeWidth={3} type="monotone" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard description="Completion percentages by habit." title="Habit comparison chart">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={charts.habitComparison || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="title" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completionRate" fill="#5eead4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard description="Daily productivity score across the selected range." title="Productivity trend graph">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={charts.productivityTrend || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" interval="preserveStartEnd" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line dataKey="productivityScore" dot={false} stroke="#a78bfa" strokeWidth={3} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
            <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
              <h2 className="text-xl font-semibold text-white">Completion heatmap</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Each square represents one day in the selected range.
              </p>
              <div className="mt-5">
                <Heatmap days={charts.completionHeatmap || []} />
              </div>
            </section>

            <section className="space-y-4">
              <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
                <h2 className="text-xl font-semibold text-white">Insights engine</h2>
                <div className="mt-4 space-y-3">
                  <p className="rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-300">
                    Best performing habit:{" "}
                    <span className="font-semibold text-teal-100">
                      {insights.bestPerformingHabit?.title || "N/A"}
                    </span>
                  </p>
                  <p className="rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-300">
                    Worst performing habit:{" "}
                    <span className="font-semibold text-rose-100">
                      {insights.worstPerformingHabit?.title || "N/A"}
                    </span>
                  </p>
                  <p className="rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-300">
                    Most improved habit:{" "}
                    <span className="font-semibold text-sky-100">
                      {insights.mostImprovedHabit?.title || "N/A"}
                    </span>
                  </p>
                  <p className="rounded-md border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-300">
                    Most missed habit:{" "}
                    <span className="font-semibold text-amber-100">
                      {insights.mostMissedHabit?.title || "N/A"}
                    </span>
                  </p>
                </div>
              </section>

              <ChartCard description="Completion rates by inferred habit category." title="Category success rate">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={charts.categoryPerformance || []}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="completionRate" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Habit Performance Table
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Range-based completions, streaks, and performance status.
                </p>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Habit Name</th>
                    <th className="px-3 py-2">Total Completions</th>
                    <th className="px-3 py-2">Completion %</th>
                    <th className="px-3 py-2">Current Streak</th>
                    <th className="px-3 py-2">Longest Streak</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.length ? (
                    rankings.map((habit) => (
                      <tr className="bg-black/15 text-slate-200" key={habit.id}>
                        <td className="rounded-l-md px-3 py-3 font-semibold text-white">
                          {habit.title}
                        </td>
                        <td className="px-3 py-3">{habit.totalCompletions}</td>
                        <td className="px-3 py-3">{habit.completionRate}%</td>
                        <td className="px-3 py-3">{habit.currentStreak} days</td>
                        <td className="px-3 py-3">{habit.longestStreak} days</td>
                        <td className="rounded-r-md px-3 py-3">
                          <StatusBadge status={habit.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-4 text-slate-400" colSpan="6">
                        No habit performance data for this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <h2 className="text-xl font-semibold text-white">Report History</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {history.length ? (
                history.map((item) => (
                  <article
                    className="rounded-md border border-white/10 bg-black/15 p-4"
                    key={item._id}
                  >
                    <button
                      className="block w-full text-left"
                      onClick={() => setReport(item)}
                      type="button"
                    >
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.range?.label || "Saved snapshot"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(item.generatedAt).toLocaleString()}
                      </p>
                    </button>
                    <button
                      className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                      onClick={() => handleDownloadSaved(item._id || item.id, "pdf")}
                      type="button"
                    >
                      {exporting === `${item._id || item.id}-pdf` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-200" />
                      ) : (
                        <Download className="h-3.5 w-3.5 text-teal-200" />
                      )}
                      PDF
                    </button>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-400">No saved report snapshots yet.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ReportsPage;
