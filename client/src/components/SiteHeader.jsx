import { Link } from "react-router-dom";
import { COMPANY_NAME } from "../lib/options";

const navItems = [];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
      <div className="section-shell flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-300/50">
            SP
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Internship Portal</p>
            <p className="font-display text-base font-semibold text-slate-900">{COMPANY_NAME}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a key={item} href={`/#${item.toLowerCase()}`} className="text-[17px] font-medium text-slate-500 transition hover:text-blue-700">
              {item}
            </a>
          ))}
        </nav>

        <Link
          to="/apply/short-term"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-300/60 transition hover:-translate-y-0.5"
        >
          Register Now
        </Link>
      </div>
    </header>
  );
}
