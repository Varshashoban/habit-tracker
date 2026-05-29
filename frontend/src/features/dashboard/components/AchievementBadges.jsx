import { Award } from "lucide-react";

import { getAchievements } from "../utils/habitAnalytics";

function AchievementBadges({ habits }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            Achievements
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Badge cabinet</h2>
        </div>
        <Award className="h-6 w-6 text-teal-200" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {getAchievements(habits).map((badge) => (
          <article
            className={`rounded-lg border p-4 transition ${
              badge.earned
                ? "border-teal-200/25 bg-teal-300/10 shadow-[0_0_28px_rgba(45,212,191,0.12)]"
                : "border-white/10 bg-black/15 opacity-60"
            }`}
            key={badge.label}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
                <Award className="h-5 w-5 text-teal-100" />
              </span>
              <div>
                <h3 className="font-semibold text-white">{badge.label}</h3>
                <p className="mt-1 text-sm text-slate-400">{badge.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>{badge.earned ? "Unlocked" : "Locked"}</span>
                <span>
                  {badge.progress}/{badge.target}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-300 to-sky-300"
                  style={{
                    width: `${Math.round((badge.progress / badge.target) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AchievementBadges;
