const navigationItems = ["Overview", "Today", "Analytics", "Habits"];

function DashboardShell({ children, onLogout, user }) {
  return (
    <div className="min-h-screen bg-[#070a0e] text-white">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-[#090d13]/95 px-5 py-6 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/15 text-lg font-semibold text-teal-100">
            H
          </span>
          <div>
            <p className="font-semibold">HabitFlow</p>
            <p className="text-xs text-slate-400">Personal analytics</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navigationItems.map((item) => (
            <a
              className="flex rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              href={`#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="mt-1 break-all text-xs text-slate-400">{user.email}</p>
          <button
            className="mt-4 w-full rounded-md border border-rose-200/25 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15"
            onClick={onLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#070a0e]/90 px-5 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/15 font-semibold text-teal-100">
              H
            </span>
            <div>
              <p className="font-semibold">HabitFlow</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          </div>
          <button
            className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white"
            onClick={onLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="px-5 py-6 sm:px-8 lg:ml-72 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}

export default DashboardShell;
