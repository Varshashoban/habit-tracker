import StatCard from "./StatCard";

function StatsGrid({ stats }) {
  const cards = [
    {
      accent: "text-teal-200",
      label: "Today's completion",
      note: "Habits checked off today.",
      value: `${stats.completedToday}/${stats.totalHabits}`,
    },
    {
      accent: "text-emerald-200",
      label: "Best streak",
      note: "Longest active habit run.",
      value: `${stats.bestStreak} days`,
    },
    {
      accent: "text-sky-200",
      label: "Completion percentage",
      note: "Average recent habit progress.",
      value: `${stats.averageCompletion}%`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3" id="overview">
      {cards.map((card) => (
        <StatCard {...card} key={card.label} />
      ))}
    </section>
  );
}

export default StatsGrid;
