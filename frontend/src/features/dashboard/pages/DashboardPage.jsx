import { useEffect, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import HabitForm from "../../habits/components/HabitForm";
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabits,
} from "../../../services/api/habits";
import ActivityCharts from "../components/ActivityCharts";
import DashboardShell from "../components/DashboardShell";
import MotivationCard from "../components/MotivationCard";
import StatsGrid from "../components/StatsGrid";
import TodayHabits from "../components/TodayHabits";
import { getDashboardStats } from "../utils/habitAnalytics";

function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();
  const stats = getDashboardStats(habits);

  useEffect(() => {
    getHabits()
      .then(({ habits: nextHabits }) => setHabits(nextHabits))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateHabit(payload) {
    setError("");
    const { habit } = await createHabit(payload);
    setHabits((currentHabits) => [habit, ...currentHabits]);
  }

  async function handleCompleteHabit(habitId) {
    setError("");

    try {
      const { habit } = await completeHabit(habitId);
      setHabits((currentHabits) =>
        currentHabits.map((currentHabit) =>
          currentHabit.id === habit.id ? habit : currentHabit,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDeleteHabit(habitId) {
    setError("");

    try {
      await deleteHabit(habitId);
      setHabits((currentHabits) =>
        currentHabits.filter((habit) => habit.id !== habitId),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <DashboardShell onLogout={logout} user={user}>
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-200">
              Advanced dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Welcome back, {user.name}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Track today&apos;s habits, study your consistency, and keep your
              streaks visible without leaving the dashboard.
            </p>
          </div>
          {loading && (
            <p className="w-fit rounded-md border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-slate-300">
              Loading habits...
            </p>
          )}
        </header>

        {error && (
          <p className="mt-8 rounded-md border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-rose-100">
            {error}
          </p>
        )}

        <StatsGrid stats={stats} />

        <div className="mt-6">
          <MotivationCard stats={stats} />
        </div>

        <div className="mt-6">
          <ActivityCharts habits={habits} />
        </div>

        <section
          className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem] xl:items-start"
          id="habits"
        >
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-teal-200">
                  Today&apos;s habits
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Choose the next checkmark
                </h2>
              </div>
            </div>
            <TodayHabits
              habits={habits}
              onComplete={handleCompleteHabit}
              onDelete={handleDeleteHabit}
            />
          </div>
          <HabitForm onCreate={handleCreateHabit} />
        </section>
      </div>
    </DashboardShell>
  );
}

export default DashboardPage;
