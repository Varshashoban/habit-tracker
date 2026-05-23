import { getMotivation } from "../utils/habitAnalytics";

function MotivationCard({ stats }) {
  const motivation = getMotivation(stats);

  return (
    <section className="rounded-lg border border-teal-200/20 bg-gradient-to-br from-teal-300/15 via-white/[0.07] to-sky-300/10 p-6 shadow-[0_22px_90px_rgba(20,184,166,0.12)]">
      <p className="text-sm font-semibold uppercase text-teal-100">
        Momentum note
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-white">
        {motivation.headline}
      </h2>
      <p className="mt-3 leading-7 text-slate-300">{motivation.message}</p>
    </section>
  );
}

export default MotivationCard;
