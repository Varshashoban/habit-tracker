function ProgressOverview({ habits }) {
  const completedToday = habits.filter((habit) => habit.completedToday).length;
  const totalHabits = habits.length;
  const averageCompletion = totalHabits
    ? Math.round(
        habits.reduce((total, habit) => total + habit.completionRate, 0) /
          totalHabits,
      )
    : 0;
  const bestStreak = habits.reduce(
    (longest, habit) => Math.max(longest, habit.streak),
    0,
  );

  const metrics = [
    { label: "Completed today", value: `${completedToday}/${totalHabits}` },
    { label: "Best streak", value: `${bestStreak} days` },
    { label: "Average progress", value: `${averageCompletion}%` },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <article
          className="rounded-lg border border-white/10 bg-white/[0.07] p-5"
          key={metric.label}
        >
          <p className="text-sm text-slate-300">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
        </article>
      ))}
    </section>
  );
}

export default ProgressOverview;
