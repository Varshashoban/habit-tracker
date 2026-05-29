import { Award } from "lucide-react";

import { getAchievements } from "../utils/habitAnalytics";

function AchievementSummary({ habits }) {
  const achievements = getAchievements(habits);
  const unlocked = achievements.filter((achievement) => achievement.earned).length;

  return (
    <section className="h-full rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            Achievement Summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {unlocked}/{achievements.length} unlocked
          </h2>
        </div>
        <Award className="h-6 w-6 text-teal-200" />
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-300 to-sky-300"
          style={{ width: `${Math.round((unlocked / achievements.length) * 100)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-slate-400">
        Complete habits and build streaks to unlock the full badge cabinet.
      </p>
    </section>
  );
}

export default AchievementSummary;
