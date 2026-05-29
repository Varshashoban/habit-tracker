const statusStyles = {
  checking: "bg-amber-100 text-amber-900",
  offline: "bg-rose-100 text-rose-900",
  online: "bg-emerald-100 text-emerald-900",
};

function AppShell({ apiStatus, children }) {
  return (
  <main className="flex min-h-screen bg-stone-950 text-white">
    {/* Sidebar */}
    <aside className="hidden w-64 flex-col border-r border-stone-800 bg-stone-900 p-6 md:flex">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-400">
          MERN Habit Tracker
        </p>

        <h1 className="mt-3 text-2xl font-bold text-white">
          Dashboard
        </h1>
      </div>

      <nav className="mt-10 flex flex-col gap-3">
        <button className="rounded-xl bg-teal-500 px-4 py-3 text-left font-medium text-black transition hover:bg-teal-400">
          Dashboard
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-stone-300 transition hover:bg-stone-800">
          Habits
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-stone-300 transition hover:bg-stone-800">
          Analytics
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-stone-300 transition hover:bg-stone-800">
          Settings
        </button>
      </nav>
    </aside>

    {/* Main Content */}
    <div className="flex flex-1 flex-col">
      {/* Navbar */}
      <header className="border-b border-stone-800 bg-stone-900 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome back 👋
            </h2>

            <p className="mt-1 text-sm text-stone-400">
              Stay consistent with your daily habits.
            </p>
          </div>

          <p
            className={`rounded-md px-3 py-2 text-sm font-medium ${statusStyles[apiStatus]}`}
          >
            API {apiStatus}
          </p>
        </div>
      </header>

      {/* Page Content */}
      <section className="flex-1 p-6">
        {children}
      </section>
    </div>
  </main>
  );
}

export default AppShell;
