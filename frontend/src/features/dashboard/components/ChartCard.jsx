function ChartCard({ children, description, heightClassName = "h-80", title }) {
  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.2)] transition duration-200 hover:border-white/15 hover:bg-white/[0.08]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className={`${heightClassName} min-w-0 overflow-hidden`}>{children}</div>
    </article>
  );
}

export default ChartCard;
