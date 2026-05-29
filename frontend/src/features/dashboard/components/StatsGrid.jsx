import StatCard from "./StatCard";

function StatsGrid({ stats }) {
  const cards = [
    {
      accent: "text-teal-200",
      label: "Total Habits",
      note: "Active routines in your system.",
      value: stats.totalHabits,
    },
    {
      accent: "text-emerald-200",
      label: "Completed Today",
      note: "Habits checked off today.",
      value: stats.completedToday,
    },
    {
      accent: "text-emerald-200",
      label: "Current Streak",
      note: "Longest active habit run.",
      value: `${stats.bestStreak} days`,
    },
    {
      accent: "text-sky-200",
      label: "Completion Rate",
      note: "Average recent habit progress.",
      value: `${stats.averageCompletion}%`,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" id="overview">
      {cards.map((card) => (
        <StatCard {...card} key={card.label} />
      ))}
    </section>
  );
}

export default StatsGrid;
