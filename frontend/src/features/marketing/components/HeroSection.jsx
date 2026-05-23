import heroImage from "../../../assets/habit-hero.png";
import { Link } from "react-router";

function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[36rem] items-end overflow-hidden sm:min-h-[42rem] lg:min-h-[46rem]">
      <img
        alt="Habit Tracker dashboard shown on a tablet and mobile phone"
        className="absolute inset-0 h-full w-full object-cover object-[67%_center] sm:object-center"
        src={heroImage}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,14,0.98)_0%,rgba(7,10,14,0.84)_38%,rgba(7,10,14,0.28)_72%,rgba(7,10,14,0.68)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,14,0.82)_0%,rgba(7,10,14,0.04)_34%,rgba(7,10,14,0.96)_100%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex rounded-md border border-teal-200/20 bg-teal-200/10 px-3 py-2 text-sm font-medium text-teal-100 backdrop-blur-sm">
            Streaks, reminders, and smarter momentum
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
            HabitFlow
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-200 sm:text-xl">
            A modern habit tracker that turns daily consistency into clear
            streaks, useful analytics, and AI productivity insights you can act
            on.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex w-fit items-center justify-center rounded-md bg-teal-300 px-5 py-3 text-base font-semibold text-[#04100f] shadow-[0_18px_50px_rgba(45,212,191,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-200"
              to="/signup"
            >
              Get Started
            </Link>
            <p className="text-sm leading-6 text-slate-300">
              Track the routine. Notice the pattern. Keep the promise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
