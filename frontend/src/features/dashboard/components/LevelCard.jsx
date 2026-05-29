import { Trophy } from "lucide-react";

import { getGamification } from "../utils/habitAnalytics";

function LevelCard({ user }) {
  const gamification = getGamification(user?.xp);

  return (
    <section className="h-full rounded-lg border border-teal-200/20 bg-gradient-to-br from-teal-300/14 via-white/[0.07] to-sky-300/10 p-5 shadow-[0_22px_90px_rgba(20,184,166,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            Level Card
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Level {gamification.level}
          </h2>
          <p className="mt-2 text-sm text-slate-400">{gamification.xp} XP earned</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-teal-300/15">
          <Trophy className="h-6 w-6 text-teal-100" />
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>XP progress</span>
          <span>{gamification.progressPercentage}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300 shadow-[0_0_24px_rgba(45,212,191,0.28)]"
            style={{ width: `${gamification.progressPercentage}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          {gamification.xpRemaining > 0
            ? `${gamification.xpRemaining} XP remaining until next level`
            : "Maximum level reached"}
        </p>
      </div>
    </section>
  );
}

export default LevelCard;
