import { Sparkles } from "lucide-react";

import { getAiInsights } from "../utils/habitAnalytics";

function AiInsightsCard({ habits }) {
  return (
    <section className="h-full rounded-lg border border-teal-200/20 bg-gradient-to-br from-teal-300/12 via-white/[0.07] to-sky-300/10 p-5 shadow-[0_22px_90px_rgba(20,184,166,0.12)]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-300/15">
          <Sparkles className="h-5 w-5 text-teal-100" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            AI coach
          </p>
          <h2 className="text-xl font-semibold text-white">Habit intelligence</h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {getAiInsights(habits).map((insight) => (
          <p
            className="rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-slate-300"
            key={insight}
          >
            {insight}
          </p>
        ))}
      </div>
    </section>
  );
}

export default AiInsightsCard;
