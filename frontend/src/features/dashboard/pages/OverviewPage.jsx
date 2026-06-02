import { Flame, Gauge, ListChecks, Trophy } from "lucide-react";

import AchievementBadges from "../components/AchievementBadges";
import AchievementSummary from "../components/AchievementSummary";
import AiInsightsCard from "../components/AiInsightsCard";
import CalendarHeatmap from "../components/CalendarHeatmap";
import LevelCard from "../components/LevelCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import MetricCard from "../components/MetricCard";
import {
  TodayReminderWidget,
  UpcomingRemindersPanel,
  MissedRemindersPanel,
} from "../components/ReminderWidgets";
import WeeklyProgress from "../components/WeeklyProgress";
import WelcomeHeader from "../components/WelcomeHeader";
import { getDashboardStats } from "../utils/habitAnalytics";

function OverviewPage({ habits, loading, reminderData, user }) {
  const stats = getDashboardStats(habits);
  
  const todayReminders = reminderData?.stats?.todayReminders || [];
  const now = new Date();
  const currentHHMM = now.toTimeString().slice(0, 5);
  const missedReminders = todayReminders.filter(
    (reminder) =>
      reminder.isActive &&
      !reminder.completed &&
      reminder.time.localeCompare(currentHHMM) <= 0
  );

  return (
    <div className="space-y-6">
      <WelcomeHeader loading={loading} userName={user.name} />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Flame} label="Current streak" value={`${stats.currentStreak} days`} />
          <MetricCard icon={Trophy} label="Longest streak" tone="text-amber-200" value={`${stats.bestStreak} days`} />
          <MetricCard icon={ListChecks} label="Total habits" tone="text-sky-200" value={stats.totalHabits} />
          <MetricCard icon={Gauge} label="Completion rate" tone="text-emerald-200" value={`${stats.averageCompletion}%`} />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <WeeklyProgress habits={habits} />
        <TodayReminderWidget reminders={todayReminders} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <AiInsightsCard habits={habits} />
        <UpcomingRemindersPanel
          reminders={reminderData?.stats?.upcomingReminders || []}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <CalendarHeatmap habits={habits} />
        <div className="space-y-6">
          <MissedRemindersPanel reminders={missedReminders} />
          <LevelCard user={user} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <AchievementBadges habits={habits} />
        <AchievementSummary habits={habits} />
      </section>
    </div>
  );
}

export default OverviewPage;
