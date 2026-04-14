import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="card-shell max-w-xl p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          The page you are looking for does not exist. Use the links below to return to the portal.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="primary-button">
            Back to home
          </Link>
          <Link to="/apply/short-term" className="secondary-button">
            Start application
          </Link>
        </div>
      </div>
    </main>
  );
}
