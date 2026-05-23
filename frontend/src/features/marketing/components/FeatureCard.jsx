function FeatureCard({ feature }) {
  return (
    <article className="group rounded-lg border border-white/10 bg-white/[0.06] p-5 transition duration-300 hover:-translate-y-1 hover:border-teal-200/30 hover:bg-white/[0.09] hover:shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="flex items-start justify-between gap-5">
        <span
          aria-hidden="true"
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border text-sm font-bold ${feature.accent}`}
        >
          {feature.mark}
        </span>
        <span className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-400 transition group-hover:text-slate-200">
          {feature.signal}
        </span>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{feature.description}</p>
    </article>
  );
}

export default FeatureCard;
