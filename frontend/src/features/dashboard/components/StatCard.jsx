function StatCard({ accent = "text-teal-200", label, value, note }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-teal-200/25 hover:bg-white/[0.09]">
      <p className="text-sm text-slate-300">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
      {note && <p className="mt-3 text-sm leading-6 text-slate-400">{note}</p>}
    </article>
  );
}

export default StatCard;
