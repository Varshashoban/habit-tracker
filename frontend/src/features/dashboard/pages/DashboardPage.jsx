import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabits,
  updateHabit,
} from "../../../services/api/habits";
import {
  createReminder,
  deleteReminder,
  getReminders,
  updateReminder,
} from "../../../services/api/reminders";
import DashboardShell from "../components/DashboardShell";
import AnalyticsPage from "./AnalyticsPage";
import CalendarPage from "./CalendarPage";
import HabitsPage from "./HabitsPage";
import OverviewPage from "./OverviewPage";
import ProductivityCenterPage from "./ProductivityCenterPage";
import ReminderCenterPage from "./ReminderCenterPage";
import ReportsPage from "./ReportsPage";
import SettingsPage from "./SettingsPage";
import TodayPage from "./TodayPage";

function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reminderData, setReminderData] = useState({
    reminders: [],
    stats: {},
    suggestions: [],
  });
  const { logout, updateUser, user } = useAuth();

  useEffect(() => {
    Promise.all([getHabits(), getReminders()])
      .then(([{ habits: nextHabits }, nextReminderData]) => {
        setHabits(nextHabits);
        setReminderData(nextReminderData);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function refreshReminders() {
    const nextReminderData = await getReminders();
    setReminderData(nextReminderData);
  }

  async function handleCreateHabit(payload) {
    setError("");
    const { habit } = await createHabit(payload);
    setHabits((currentHabits) => [habit, ...currentHabits]);
  }

  async function handleCompleteHabit(habitId) {
    setError("");

    try {
      const { habit, user: updatedUser } = await completeHabit(habitId);
      setHabits((currentHabits) =>
        currentHabits.map((currentHabit) =>
          currentHabit.id === habit.id ? habit : currentHabit,
        ),
      );
      if (updatedUser) {
        updateUser(updatedUser);
      }
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

  async function handleUpdateHabit(habitId, payload) {
    setError("");

    try {
      const { habit, user: updatedUser } = await updateHabit(habitId, payload);
      setHabits((currentHabits) =>
        currentHabits.map((currentHabit) =>
          currentHabit.id === habit.id ? habit : currentHabit,
        ),
      );
      if (updatedUser) {
        updateUser(updatedUser);
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleCreateReminder(payload) {
    await createReminder(payload);
    await refreshReminders();
  }

  async function handleUpdateReminder(reminderId, payload) {
    await updateReminder(reminderId, payload);
    await refreshReminders();
  }

  async function handleDeleteReminder(reminderId) {
    await deleteReminder(reminderId);
    await refreshReminders();
  }

  return (
    <DashboardShell
      onLogout={logout}
      reminderCount={reminderData.stats?.pendingToday || 0}
      user={user}
    >
      <div className="mx-auto w-full max-w-7xl">
        {error && (
          <p className="mb-6 rounded-md border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-rose-100">
            {error}
          </p>
        )}

        <Routes>
          <Route
            index
            element={
              <OverviewPage
                habits={habits}
                loading={loading}
                reminderData={reminderData}
                user={user}
              />
            }
          />
          <Route
            path="today"
            element={
              <TodayPage
                habits={habits}
                onComplete={handleCompleteHabit}
                onDelete={handleDeleteHabit}
              />
            }
          />
          <Route
            path="habits"
            element={
              <HabitsPage
                habits={habits}
                onComplete={handleCompleteHabit}
                onCreate={handleCreateHabit}
                onDelete={handleDeleteHabit}
                onUpdate={handleUpdateHabit}
              />
            }
          />
          <Route
            path="calendar"
            element={<CalendarPage habits={habits} onUpdate={handleUpdateHabit} />}
          />
          <Route path="productivity" element={<ProductivityCenterPage />} />
          <Route
            path="reminders"
            element={
              <ReminderCenterPage
                habits={habits}
                loading={loading}
                onCreate={handleCreateReminder}
                onDelete={handleDeleteReminder}
                onUpdate={handleUpdateReminder}
                reminderData={reminderData}
              />
            }
          />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage habits={habits} />} />
          <Route path="settings" element={<SettingsPage user={user} />} />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Routes>
      </div>
    </DashboardShell>
  );
}

export default DashboardPage;
