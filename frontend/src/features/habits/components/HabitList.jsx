import HabitCard from "./HabitCard";

function HabitList({ habits, onComplete, onDelete }) {
  if (!habits.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
        <h2 className="text-xl font-semibold text-white">No habits yet</h2>
        <p className="mt-3 text-slate-300">
          Add your first routine and your streaks will start showing up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <HabitCard
          habit={habit}
          key={habit.id}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default HabitList;
