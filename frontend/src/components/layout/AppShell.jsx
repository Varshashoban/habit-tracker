const statusStyles = {
  checking: "bg-amber-100 text-amber-900",
  offline: "bg-rose-100 text-rose-900",
  online: "bg-emerald-100 text-emerald-900",
};

function AppShell({ apiStatus, children }) {
  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              MERN Habit Tracker
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">
              Build routines you can keep.
            </h1>
          </div>
          <p
            className={`w-fit rounded-md px-3 py-2 text-sm font-medium ${statusStyles[apiStatus]}`}
          >
            API {apiStatus}
          </p>
        </div>
      </header>
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        {children}
      </section>
    </main>
  );
}

export default AppShell;
