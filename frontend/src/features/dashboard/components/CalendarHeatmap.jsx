import { getCalendarHeatmap } from "../utils/habitAnalytics";

function getCellColor(percentage) {
  if (percentage >= 80) return "bg-teal-300";
  if (percentage >= 50) return "bg-teal-400/60";
  if (percentage > 0) return "bg-teal-500/25";
  return "bg-white/10";
}

function CalendarHeatmap({ habits }) {
  const days = getCalendarHeatmap(habits);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-200">
          Monthly heatmap
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Last 30 days
        </h2>
      </div>
      <div className="mt-5 grid grid-cols-10 gap-2">
        {days.map((day) => (
          <div
            className={`aspect-square rounded-md ${getCellColor(
              day.percentage,
            )} transition hover:scale-110`}
            key={day.dateKey}
            title={`${day.date}: ${day.percentage}%`}
          />
        ))}
      </div>
    </section>
  );
}

export default CalendarHeatmap;
