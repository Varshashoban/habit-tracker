import { Bell, Clock, Moon, User } from "lucide-react";
import { useState } from "react";

function SettingsPage({ user }) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6">
        <p className="text-sm font-semibold uppercase text-teal-200">Settings</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Workspace preferences
        </h1>
      </section>

      <section className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
          <div className="grid h-24 w-24 place-items-center rounded-full border border-teal-200/25 bg-teal-300/15">
            <User className="h-10 w-10 text-teal-100" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-white">{user.name}</h2>
          <p className="mt-2 break-all text-sm text-slate-400">{user.email}</p>
        </article>

        <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
          <h2 className="text-xl font-semibold text-white">Preferences</h2>
          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/15 p-4">
              <span className="flex items-center gap-3 text-slate-200">
                <Moon className="h-5 w-5 text-teal-200" />
                Dark mode
              </span>
              <input
                checked={darkMode}
                className="h-5 w-5 accent-teal-300"
                onChange={(event) => setDarkMode(event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/15 p-4">
              <span className="flex items-center gap-3 text-slate-200">
                <Bell className="h-5 w-5 text-teal-200" />
                Notifications
              </span>
              <input
                checked={notifications}
                className="h-5 w-5 accent-teal-300"
                onChange={(event) => setNotifications(event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="block rounded-lg border border-white/10 bg-black/15 p-4">
              <span className="flex items-center gap-3 text-slate-200">
                <Clock className="h-5 w-5 text-teal-200" />
                Reminder time
              </span>
              <input
                className="mt-3 w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none focus:border-teal-200/60"
                onChange={(event) => setReminderTime(event.target.value)}
                type="time"
                value={reminderTime}
              />
            </label>
          </div>
        </article>
      </section>
    </div>
  );
}

export default SettingsPage;
