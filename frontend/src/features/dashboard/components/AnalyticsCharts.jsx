import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "./ChartCard";
import {
  getCategoryDistribution,
  getMonthlyConsistency,
  getStreakChart,
  getWeeklyActivity,
} from "../utils/habitAnalytics";

const tooltipStyle = {
  background: "#0c1118",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
};

function AnalyticsCharts({ habits }) {
  const weeklyActivity = getWeeklyActivity(habits);
  const monthlyConsistency = getMonthlyConsistency(habits);
  const streakChart = getStreakChart(habits);
  const categoryDistribution = getCategoryDistribution(habits);

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <ChartCard
        description="Completed habits across the last seven days."
        title="Weekly completion"
      >
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={weeklyActivity}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff10" }} />
            <Bar dataKey="completed" fill="#5eead4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        description="Consistency percentage over the last 30 days."
        title="Monthly consistency"
      >
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={monthlyConsistency}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              interval={6}
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
              stroke="#38bdf8"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard description="Active streak by habit." title="Habit streaks">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={streakChart}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff10" }} />
            <Bar dataKey="streak" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        description="Habit mix inferred from your titles and descriptions."
        title="Category distribution"
      >
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              data={categoryDistribution}
              dataKey="count"
              innerRadius={60}
              nameKey="category"
              outerRadius={95}
              paddingAngle={4}
            >
              {categoryDistribution.map((entry) => (
                <Cell fill={entry.color} key={entry.category} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}

export default AnalyticsCharts;
