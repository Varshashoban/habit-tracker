import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  Mail,
  Moon,
  Save,
  ShieldCheck,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  updateAccountSettings,
  updateNotificationSettings,
  updatePassword,
  updateProductivitySettings,
  updateProfileSettings,
} from "../../../services/api/settings";

const defaultSettings = {
  account: {
    darkMode: true,
    firstDayOfWeek: "monday",
    timezone: "Asia/Kolkata",
  },
  notifications: {
    achievements: true,
    browser: true,
    reminders: true,
  },
  productivity: {
    dailyHabitGoal: 3,
    preferredHours: {
      end: "17:00",
      start: "09:00",
    },
    weeklyCompletionGoal: 80,
  },
};

const timezoneOptions = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Australia/Sydney",
];

function mergeSettings(settings) {
  return {
    account: {
      ...defaultSettings.account,
      ...(settings?.account || {}),
    },
    notifications: {
      ...defaultSettings.notifications,
      ...(settings?.notifications || {}),
    },
    productivity: {
      ...defaultSettings.productivity,
      ...(settings?.productivity || {}),
      preferredHours: {
        ...defaultSettings.productivity.preferredHours,
        ...(settings?.productivity?.preferredHours || {}),
      },
    },
  };
}

function SectionCard({ children, description, icon: Icon, title }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.18)] transition duration-200 hover:border-white/15 hover:bg-white/[0.08]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-teal-200/20 bg-teal-300/15">
          <Icon className="h-5 w-5 text-teal-100" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TextInput({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-md border border-white/15 bg-black/25 px-3 py-2.5 transition focus-within:border-teal-200/60">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-teal-200" />}
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          {...props}
        />
      </span>
    </label>
  );
}

function SelectInput({ icon: Icon, label, options, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-md border border-white/15 bg-black/25 px-3 py-2.5 transition focus-within:border-teal-200/60">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-teal-200" />}
        <select
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
          {...props}
        >
          {options.map((option) => (
            <option className="bg-[#090d13] text-white" key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function ToggleRow({ checked, description, disabled, icon: Icon, label, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/15 p-4">
      <span className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
        <span>
          <span className="block text-sm font-semibold text-slate-100">{label}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-400">
            {description}
          </span>
        </span>
      </span>
      <input
        checked={checked}
        className="h-5 w-5 shrink-0 accent-teal-300"
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}

function SaveButton({ loading, children = "Save changes" }) {
  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-300 px-4 py-2.5 text-sm font-bold text-[#04100f] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={loading}
      type="submit"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {children}
    </button>
  );
}

function StatusMessage({ error, success }) {
  if (!error && !success) {
    return null;
  }

  return (
    <p
      className={`rounded-md border px-4 py-3 text-sm ${
        error
          ? "border-rose-200/25 bg-rose-300/10 text-rose-100"
          : "border-teal-200/25 bg-teal-300/10 text-teal-100"
      }`}
    >
      {error || success}
    </p>
  );
}

function SettingsPage({ settings, updateSettings, updateUser, user }) {
  const mergedSettings = useMemo(() => mergeSettings(settings), [settings]);
  const [profileForm, setProfileForm] = useState({
    email: user.email || "",
    name: user.name || "",
  });
  const [notificationForm, setNotificationForm] = useState(
    mergedSettings.notifications,
  );
  const [productivityForm, setProductivityForm] = useState(
    mergedSettings.productivity,
  );
  const [accountForm, setAccountForm] = useState(mergedSettings.account);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [status, setStatus] = useState({});
  const [saving, setSaving] = useState("");

  function setSectionStatus(section, nextStatus) {
    setStatus((currentStatus) => ({
      ...currentStatus,
      [section]: nextStatus,
    }));
  }

  async function saveSection(section, request) {
    setSaving(section);
    setSectionStatus(section, {});

    try {
      const result = await request();

      if (result?.settings) {
        updateSettings(result.settings);
      }

      if (result?.user) {
        updateUser(result.user);
      }

      setSectionStatus(section, {
        success: result?.message || "Changes saved.",
      });
      return result;
    } catch (requestError) {
      setSectionStatus(section, {
        error: requestError.message || "Unable to save changes.",
      });
      return null;
    } finally {
      setSaving("");
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    await saveSection("profile", () => updateProfileSettings(profileForm));
  }

  async function handleNotificationSubmit(event) {
    event.preventDefault();

    if (
      notificationForm.browser &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setNotificationForm((currentForm) => ({
          ...currentForm,
          browser: false,
        }));
        setSectionStatus("notifications", {
          error: "Browser notification permission was not granted.",
        });
        return;
      }
    }

    await saveSection("notifications", () =>
      updateNotificationSettings(notificationForm),
    );
  }

  async function handleProductivitySubmit(event) {
    event.preventDefault();
    await saveSection("productivity", () =>
      updateProductivitySettings(productivityForm),
    );
  }

  async function handleAccountSubmit(event) {
    event.preventDefault();
    await saveSection("account", () => updateAccountSettings(accountForm));
  }

  async function handleSecuritySubmit(event) {
    event.preventDefault();
    const result = await saveSection("security", () => updatePassword(passwordForm));

    if (result) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-teal-200/20 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(6,78,72,0.28))] p-6 shadow-[0_24px_100px_rgba(20,184,166,0.14)]">
        <p className="text-sm font-semibold uppercase text-teal-200">Settings</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              User Preference Center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Manage your profile, notification rules, productivity targets,
              account defaults, and password from one synced workspace.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Signed in as
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-white">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <aside className="space-y-6">
          <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-teal-200/25 bg-teal-300/15">
              <User className="h-10 w-10 text-teal-100" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-white">
              {profileForm.name || user.name}
            </h2>
            <p className="mt-2 break-all text-sm text-slate-400">
              {profileForm.email || user.email}
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-md border border-white/10 bg-black/15 p-3">
                <p className="text-slate-500">Daily habit goal</p>
                <p className="mt-1 font-semibold text-teal-100">
                  {productivityForm.dailyHabitGoal} habits
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/15 p-3">
                <p className="text-slate-500">Preferred focus window</p>
                <p className="mt-1 font-semibold text-teal-100">
                  {productivityForm.preferredHours.start} to{" "}
                  {productivityForm.preferredHours.end}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-teal-200" />
              <h2 className="text-lg font-semibold text-white">Preference sync</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Settings are saved to MongoDB and loaded automatically when you
              sign in on any device.
            </p>
          </article>
        </aside>

        <div className="space-y-6">
          <SectionCard
            description="Update the identity shown across HabitFlow."
            icon={User}
            title="User Profile"
          >
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  autoComplete="name"
                  icon={User}
                  label="Name"
                  onChange={(event) =>
                    setProfileForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }))
                  }
                  type="text"
                  value={profileForm.name}
                />
                <TextInput
                  autoComplete="email"
                  icon={Mail}
                  label="Email"
                  onChange={(event) =>
                    setProfileForm((currentForm) => ({
                      ...currentForm,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  value={profileForm.email}
                />
              </div>
              <StatusMessage {...(status.profile || {})} />
              <SaveButton loading={saving === "profile"} />
            </form>
          </SectionCard>

          <SectionCard
            description="Control which reminders and milestone prompts HabitFlow can surface."
            icon={Bell}
            title="Notification Preferences"
          >
            <form className="space-y-4" onSubmit={handleNotificationSubmit}>
              <ToggleRow
                checked={notificationForm.browser}
                description="Allow HabitFlow to use the browser Notification API."
                icon={Bell}
                label="Browser notifications"
                onChange={(browser) =>
                  setNotificationForm((currentForm) => ({
                    ...currentForm,
                    browser,
                  }))
                }
              />
              <ToggleRow
                checked={notificationForm.reminders}
                description="Send habit reminder notifications when active reminders are due."
                icon={Clock}
                label="Reminder notifications"
                onChange={(reminders) =>
                  setNotificationForm((currentForm) => ({
                    ...currentForm,
                    reminders,
                  }))
                }
              />
              <ToggleRow
                checked={notificationForm.achievements}
                description="Reserve notification preferences for streaks, levels, and milestones."
                icon={Trophy}
                label="Achievement notifications"
                onChange={(achievements) =>
                  setNotificationForm((currentForm) => ({
                    ...currentForm,
                    achievements,
                  }))
                }
              />
              <StatusMessage {...(status.notifications || {})} />
              <SaveButton loading={saving === "notifications"} />
            </form>
          </SectionCard>

          <SectionCard
            description="Tune your goals and focus hours for dashboard guidance."
            icon={Target}
            title="Productivity Preferences"
          >
            <form className="space-y-4" onSubmit={handleProductivitySubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  icon={Target}
                  label="Daily habit goal"
                  max="50"
                  min="1"
                  onChange={(event) =>
                    setProductivityForm((currentForm) => ({
                      ...currentForm,
                      dailyHabitGoal: event.target.value,
                    }))
                  }
                  type="number"
                  value={productivityForm.dailyHabitGoal}
                />
                <TextInput
                  icon={CheckCircle2}
                  label="Weekly completion goal (%)"
                  max="100"
                  min="1"
                  onChange={(event) =>
                    setProductivityForm((currentForm) => ({
                      ...currentForm,
                      weeklyCompletionGoal: event.target.value,
                    }))
                  }
                  type="number"
                  value={productivityForm.weeklyCompletionGoal}
                />
                <TextInput
                  icon={Clock}
                  label="Preferred start time"
                  onChange={(event) =>
                    setProductivityForm((currentForm) => ({
                      ...currentForm,
                      preferredHours: {
                        ...currentForm.preferredHours,
                        start: event.target.value,
                      },
                    }))
                  }
                  type="time"
                  value={productivityForm.preferredHours.start}
                />
                <TextInput
                  icon={Clock}
                  label="Preferred end time"
                  onChange={(event) =>
                    setProductivityForm((currentForm) => ({
                      ...currentForm,
                      preferredHours: {
                        ...currentForm.preferredHours,
                        end: event.target.value,
                      },
                    }))
                  }
                  type="time"
                  value={productivityForm.preferredHours.end}
                />
              </div>
              <StatusMessage {...(status.productivity || {})} />
              <SaveButton loading={saving === "productivity"} />
            </form>
          </SectionCard>

          <SectionCard
            description="Set app-level defaults that can be reused across HabitFlow screens."
            icon={Moon}
            title="Account Preferences"
          >
            <form className="space-y-4" onSubmit={handleAccountSubmit}>
              <ToggleRow
                checked={accountForm.darkMode}
                description="Persist your theme preference for current and future UI surfaces."
                icon={Moon}
                label="Dark mode"
                onChange={(darkMode) =>
                  setAccountForm((currentForm) => ({
                    ...currentForm,
                    darkMode,
                  }))
                }
              />
              <div className="grid gap-4 md:grid-cols-2">
                <SelectInput
                  icon={Clock}
                  label="Timezone"
                  onChange={(event) =>
                    setAccountForm((currentForm) => ({
                      ...currentForm,
                      timezone: event.target.value,
                    }))
                  }
                  options={timezoneOptions.map((timezone) => ({
                    label: timezone,
                    value: timezone,
                  }))}
                  value={accountForm.timezone}
                />
                <SelectInput
                  icon={CalendarDays}
                  label="First day of week"
                  onChange={(event) =>
                    setAccountForm((currentForm) => ({
                      ...currentForm,
                      firstDayOfWeek: event.target.value,
                    }))
                  }
                  options={[
                    { label: "Monday", value: "monday" },
                    { label: "Sunday", value: "sunday" },
                  ]}
                  value={accountForm.firstDayOfWeek}
                />
              </div>
              <StatusMessage {...(status.account || {})} />
              <SaveButton loading={saving === "account"} />
            </form>
          </SectionCard>

          <SectionCard
            description="Change your password with current password validation."
            icon={KeyRound}
            title="Security"
          >
            <form className="space-y-4" onSubmit={handleSecuritySubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  autoComplete="current-password"
                  icon={KeyRound}
                  label="Current password"
                  onChange={(event) =>
                    setPasswordForm((currentForm) => ({
                      ...currentForm,
                      currentPassword: event.target.value,
                    }))
                  }
                  type="password"
                  value={passwordForm.currentPassword}
                />
                <TextInput
                  autoComplete="new-password"
                  icon={ShieldCheck}
                  label="New password"
                  minLength="8"
                  onChange={(event) =>
                    setPasswordForm((currentForm) => ({
                      ...currentForm,
                      newPassword: event.target.value,
                    }))
                  }
                  type="password"
                  value={passwordForm.newPassword}
                />
              </div>
              <StatusMessage {...(status.security || {})} />
              <SaveButton loading={saving === "security"}>
                Update password
              </SaveButton>
            </form>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
