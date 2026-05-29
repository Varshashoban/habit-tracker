function QuickActions() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <a
        className="rounded-lg border border-teal-200/25 bg-teal-300 px-5 py-4 text-center text-sm font-semibold text-[#04100f] shadow-[0_0_34px_rgba(45,212,191,0.18)] transition hover:-translate-y-0.5 hover:bg-teal-200"
        href="#add-habit"
      >
        Add Habit
      </a>
      <a
        className="rounded-lg border border-white/12 bg-white/[0.07] px-5 py-4 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-sky-200/30 hover:bg-white/[0.1]"
        href="#analytics"
      >
        View Analytics
      </a>
    </section>
  );
}

export default QuickActions;
