import {
  BarChart3,
  Brain,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router";

const navigationItems = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
  { icon: CalendarCheck, label: "Today", to: "/dashboard/today" },
  { icon: CalendarDays, label: "Calendar", to: "/dashboard/calendar" },
  { icon: Brain, label: "Productivity", to: "/dashboard/productivity" },
  { icon: Bell, label: "Reminders", to: "/dashboard/reminders" },
  { icon: FileText, label: "Reports", to: "/dashboard/reports" },
  { icon: CheckSquare, label: "Habits", to: "/dashboard/habits" },
  { icon: BarChart3, label: "Analytics", to: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

function DashboardShell({ children, onLogout, reminderCount = 0, user }) {
  return (
    <div className="min-h-screen bg-[#070a0e] text-white">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-[#090d13]/95 px-5 py-6 shadow-[22px_0_90px_rgba(0,0,0,0.28)] lg:flex lg:flex-col">
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
          {navigationItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border border-teal-200/20 bg-teal-300/15 text-teal-100 shadow-[0_0_28px_rgba(45,212,191,0.12)]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
              end={to === "/dashboard"}
              key={label}
              to={to}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {label === "Reminders" && reminderCount > 0 && (
                <span className="rounded-full bg-teal-300 px-2 py-0.5 text-xs font-bold text-[#04100f]">
                  {reminderCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="mt-1 break-all text-xs text-slate-400">{user.email}</p>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-rose-200/25 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15"
            onClick={onLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
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
            className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            onClick={onLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {navigationItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-300 text-[#04100f]"
                    : "bg-white/[0.07] text-slate-300"
                }`
              }
              end={to === "/dashboard"}
              key={label}
              to={to}
            >
              <Icon className="h-4 w-4" />
              {label}
              {label === "Reminders" && reminderCount > 0 && (
                <span className="rounded-full bg-[#04100f] px-1.5 py-0.5 text-xs font-bold text-teal-200">
                  {reminderCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-5 py-6 sm:px-8 lg:ml-72 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}

export default DashboardShell;
