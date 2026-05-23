import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "./ChartCard";
import {
  getMonthlyConsistency,
  getWeeklyActivity,
} from "../utils/habitAnalytics";

const tooltipStyle = {
  background: "#0c1118",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
};

function ActivityCharts({ habits }) {
  const weeklyActivity = getWeeklyActivity(habits);
  const monthlyConsistency = getMonthlyConsistency(habits);

  return (
    <section className="grid gap-4 xl:grid-cols-2" id="analytics">
      <ChartCard
        description="Completions recorded across the last seven days."
        title="Weekly activity"
      >
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={weeklyActivity}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="day"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff10" }} />
            <Bar dataKey="completed" fill="#5eead4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        description="Daily consistency percentage based on your active habit count."
        title="Monthly consistency"
      >
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={monthlyConsistency}>
            <defs>
              <linearGradient id="consistency" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              interval={6}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
            <Area
              dataKey="percentage"
              fill="url(#consistency)"
              stroke="#38bdf8"
              strokeWidth={3}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}

export default ActivityCharts;
