function MetricCard({ icon: Icon, label, tone = "text-teal-200", value }) {
  return (
    <article className="flex h-full min-h-32 min-w-0 items-center gap-4 rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-0.5 hover:border-teal-200/25 hover:bg-white/[0.09]">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-teal-200/20 bg-teal-300/10">
        <Icon className={`h-5 w-5 ${tone}`} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-1 break-words text-2xl font-semibold leading-tight text-white">
          {value}
        </p>
      </div>
    </article>
  );
}

export default MetricCard;
