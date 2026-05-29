const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
});

function WelcomeHeader({ loading, userName }) {
  return (
    <section className="overflow-hidden rounded-lg border border-teal-200/20 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(6,78,72,0.36))] p-6 shadow-[0_24px_100px_rgba(20,184,166,0.16)] sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-200">
            {dateFormatter.format(new Date())}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Welcome back, {userName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Small actions compound into visible momentum. Pick the next habit,
            mark it complete, and let consistency do its quiet work.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4 shadow-[0_0_40px_rgba(45,212,191,0.12)] lg:max-w-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Daily focus
          </p>
          <p className="mt-2 text-lg font-medium leading-7 text-teal-100">
            "Win the day with one repeatable action."
          </p>
          {loading && (
            <p className="mt-4 w-fit rounded-md border border-white/10 bg-white/[0.07] px-3 py-2 text-sm text-slate-300">
              Syncing habits...
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default WelcomeHeader;
