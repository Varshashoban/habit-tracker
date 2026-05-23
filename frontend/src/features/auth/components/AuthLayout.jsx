import { Link } from "react-router";

function AuthLayout({ children, description, title }) {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#070a0e] px-5 py-8 sm:px-8 lg:grid-cols-[1fr_34rem] lg:px-10">
      <section className="hidden min-h-full flex-col justify-between border-r border-white/10 pr-12 lg:flex">
        <Link className="flex w-fit items-center gap-3 text-white" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/15 text-lg font-semibold text-teal-100">
            H
          </span>
          <span className="text-lg font-semibold">HabitFlow</span>
        </Link>
        <div className="max-w-xl pb-8">
          <p className="text-sm font-semibold uppercase text-teal-200">
            Secure habit tracking
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight text-white">
            Keep your progress private and your routine visible.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Your session is handled with an HttpOnly authentication cookie while
            the dashboard stays guarded behind the API and the React router.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center py-8 lg:pl-12">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.07] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-8">
          <Link className="mb-8 flex w-fit items-center gap-3 text-white lg:hidden" to="/">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/15 font-semibold text-teal-100">
              H
            </span>
            <span className="font-semibold">HabitFlow</span>
          </Link>
          <h2 className="text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-3 leading-7 text-slate-300">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
