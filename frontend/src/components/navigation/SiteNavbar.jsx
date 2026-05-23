import { useState } from "react";
import { Link } from "react-router";

const navigationItems = [
  { label: "Features", href: "#features" },
  { label: "Insights", href: "#features" },
  { label: "Reminders", href: "#features" },
];

function SiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10"
      >
        <Link className="flex items-center gap-3 text-white" to="/">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/15 text-lg font-semibold text-teal-100 shadow-[0_0_32px_rgba(45,212,191,0.16)]">
            H
          </span>
          <span>
            <span className="block text-base font-semibold">HabitFlow</span>
            <span className="block text-xs text-slate-300">Habit Tracker</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 rounded-lg border border-white/10 bg-black/25 px-6 py-3 text-sm text-slate-200 backdrop-blur-md md:flex">
          {navigationItems.map((item) => (
            <a
              className="transition hover:text-teal-200"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            className="hidden rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-teal-200/40 hover:bg-teal-200/15 sm:inline-flex"
            to="/signup"
          >
            Get Started
          </Link>
          <button
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 bg-white/10 text-white transition hover:border-teal-200/40 hover:bg-teal-200/15 md:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            <span className="flex w-4 flex-col gap-1">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mx-5 rounded-lg border border-white/10 bg-[#0c1118]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-md md:hidden">
          {navigationItems.map((item) => (
            <a
              className="block rounded-md px-3 py-3 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.label}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

export default SiteNavbar;
