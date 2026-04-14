import { Link } from "react-router-dom";
import { BRAND_LOGO_URL, COMPANY_NAME } from "../lib/options";

const quickActions = [
  {
    label: "Short Term Internship",
    to: "/apply/short-term",
    className: "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-blue-300/60"
  },
  {
    label: "Long Term Internship",
    to: "/apply/long-term",
    className: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-red-300/50"
  },
];

const timerBlocks = ["DAYS", "HOURS", "MINS", "SECS"];

export function LandingPage() {
  return (
    <main id="home" className="relative min-h-screen overflow-hidden pb-0 pt-0">
      <div className="absolute inset-0 -z-10 bg-[#f8f9fb]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.16),transparent_36%),radial-gradient(circle_at_78%_72%,rgba(59,130,246,0.12),transparent_34%)]" />

      <section className="h-screen w-full p-3 sm:p-4 lg:p-5">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white/75 px-5 py-10 shadow-xl shadow-slate-300/30 backdrop-blur-sm sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <img
            src={BRAND_LOGO_URL}
            alt={`${COMPANY_NAME} logo`}
            className="absolute left-5 top-5 h-32 w-32 object-contain sm:left-6 sm:top-6 sm:h-36 sm:w-36 lg:h-44 lg:w-44"
          />

          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
            <p className="inline-flex rounded-full border border-sky-200 bg-sky-100/70 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              Learning Managemant System
            </p>

            <h1 className="mt-7 font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-slate-900 via-sky-700 to-indigo-600 bg-clip-text text-transparent">
                Welcome to Internship Learning
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-2xl sm:leading-10">
              A premium internship experience with guided project execution, elite mentorship, and industry-focused outcomes.
            </p>

            

            <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-semibold shadow-lg transition hover:-translate-y-0.5 ${action.className}`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="about" className="h-2" />
      <div id="domains" className="h-2" />
      <div id="prizes" className="h-2" />
      <div id="crew" className="h-2" />
      <div id="contact" className="h-2" />
    </main>
  );
}
