import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications } from "../lib/api";

const PAGE_SIZE = 12;
const DASHBOARD_TOKEN_STORAGE_KEY = "internship_portal_admin_token";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function looksLikePdf(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  return /\.pdf(?:$|\?)/i.test(url);
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function ApplicationsPage() {
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.sessionStorage.getItem(DASHBOARD_TOKEN_STORAGE_KEY) || "";
  });
  const [adminTokenInput, setAdminTokenInput] = useState("");
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [summary, setSummary] = useState({ total: 0, shortCount: 0, longCount: 0, workBasedCount: 0, trainingBasedCount: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: PAGE_SIZE,
    search: "",
    internshipType: "",
    role: ""
  });

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      if (!adminToken) {
        setLoading(false);
        setApplications([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const payload = await fetchApplications({
          ...filters,
          adminToken
        });

        if (cancelled) {
          return;
        }

        setApplications(Array.isArray(payload?.applications) ? payload.applications : []);
        setPagination(payload?.pagination || { page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
        setSummary(
          payload?.summary || {
            total: 0,
            shortCount: 0,
            longCount: 0,
            workBasedCount: 0,
            trainingBasedCount: 0,
            totalRevenue: 0
          }
        );
      } catch (requestError) {
        if (!cancelled) {
          if (requestError?.statusCode === 401) {
            if (typeof window !== "undefined") {
              window.sessionStorage.removeItem(DASHBOARD_TOKEN_STORAGE_KEY);
            }

            setAdminToken("");
            setAdminTokenInput("");
            setError("Access denied. Enter a valid admin token to continue.");
            setApplications([]);
            return;
          }

          setError(requestError?.message || "Failed to load applications.");
          setApplications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [adminToken, filters]);

  const paginationLabel = useMemo(() => {
    if (!pagination.total) {
      return "No records";
    }

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + applications.length - 1, pagination.total);
    return `${start}-${end} of ${pagination.total}`;
  }, [applications.length, pagination]);

  function handleFilterSubmit(event) {
    event.preventDefault();

    setFilters((current) => ({
      ...current,
      page: 1,
      search: searchInput.trim()
    }));
  }

  function updateDropdownFilter(fieldName, value) {
    setFilters((current) => ({
      ...current,
      page: 1,
      [fieldName]: value
    }));
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.pages || nextPage === pagination.page) {
      return;
    }

    setFilters((current) => ({
      ...current,
      page: nextPage
    }));
  }

  function handleUnlockDashboard(event) {
    event.preventDefault();

    const trimmedToken = adminTokenInput.trim();

    if (!trimmedToken) {
      setError("Please enter the admin token.");
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DASHBOARD_TOKEN_STORAGE_KEY, trimmedToken);
    }

    setError("");
    setAdminToken(trimmedToken);
    setAdminTokenInput("");
  }

  function handleLockDashboard() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(DASHBOARD_TOKEN_STORAGE_KEY);
    }

    setAdminToken("");
    setAdminTokenInput("");
    setApplications([]);
    setPagination({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
    setSummary({ total: 0, shortCount: 0, longCount: 0, workBasedCount: 0, trainingBasedCount: 0, totalRevenue: 0 });
  }

  if (!adminToken) {
    return (
      <main className="section-shell py-10 sm:py-14 lg:py-16">
        <section className="mx-auto max-w-2xl space-y-6 animate-fadeUp">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Protected dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-950 sm:text-4xl">Unlock Applications View</h1>
            <p className="mt-3 text-sm text-slate-600">
              Enter the admin token configured on the server to load application data and uploaded receipts.
            </p>
          </div>

          <form onSubmit={handleUnlockDashboard} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <label className="field-label" htmlFor="adminToken">
              Admin Token
            </label>
            <input
              id="adminToken"
              type="password"
              value={adminTokenInput}
              onChange={(event) => setAdminTokenInput(event.target.value)}
              className="field-input"
              placeholder="Enter admin token"
              autoComplete="off"
            />

            {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="submit" className="primary-button px-5 py-3 text-sm">
                Unlock Dashboard
              </button>
              <Link to="/" className="secondary-button px-5 py-3 text-sm">
                Back to home
              </Link>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="section-shell py-10 sm:py-14 lg:py-16">
      <section className="mx-auto max-w-7xl space-y-6 animate-fadeUp">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Admin view</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-slate-950 sm:text-4xl">Applications & Receipts</h1>
            <p className="mt-2 text-sm text-slate-600">Data is fetched from MongoDB and images are securely served from Amazon S3 bucket.</p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="secondary-button px-5 py-3 text-sm" onClick={handleLockDashboard}>
              Lock
            </button>
            <Link to="/" className="secondary-button px-5 py-3 text-sm">
              Back to home
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Total Amount" value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(summary.totalRevenue || 0)} />
          <SummaryCard label="Short-Term" value={summary.shortCount} />
          <SummaryCard label="Long-Term" value={summary.longCount} />
          <SummaryCard label="Work Based" value={summary.workBasedCount} />
          <SummaryCard label="Training Based" value={summary.trainingBasedCount} />
        </div>

        <form onSubmit={handleFilterSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr,180px,180px,auto]">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, roll number, email, city..."
              className="field-input mt-0"
            />

            <select
              className="field-select mt-0"
              value={filters.internshipType}
              onChange={(event) => updateDropdownFilter("internshipType", event.target.value)}
            >
              <option value="">All types</option>
              <option value="short">Short-term</option>
              <option value="long">Long-term</option>
            </select>

            <select className="field-select mt-0" value={filters.role} onChange={(event) => updateDropdownFilter("role", event.target.value)}>
              <option value="">All roles</option>
              <option value="Training Based">Training Based</option>
              <option value="Work Based">Work Based</option>
            </select>

            <button type="submit" className="primary-button px-5 py-3 text-sm">
              Apply filters
            </button>
          </div>
        </form>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">Loading applications...</div>
        ) : null}

        {!loading && applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">No applications found for the selected filters.</div>
        ) : null}

        {!loading && applications.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((application) => {
              const receiptUrl = application?.paymentScreenshot || "";
              const isPdf = looksLikePdf(receiptUrl);

              return (
                <article key={application._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{application.fullName}</p>
                    <p className="text-xs text-slate-500">{application.rollNo} • {formatDate(application.createdAt)}</p>
                  </div>

                  <div className="p-4">
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-900">Email:</span> {application.email}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">College:</span> {application.collegeName}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">City:</span> {application.city}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Program:</span> {application.internshipType} • {application.internshipMode}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Role:</span> {application.role}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Amount Paid:</span> {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(application.amount || 0)}
                      </p>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {receiptUrl ? (
                        isPdf ? (
                          <div className="flex min-h-44 flex-col items-center justify-center gap-3 p-4 text-center">
                            <p className="text-sm font-semibold text-slate-900">PDF receipt uploaded</p>
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                            >
                              Open PDF
                            </a>
                          </div>
                        ) : (
                          <a href={receiptUrl} target="_blank" rel="noreferrer" className="block">
                            <img src={receiptUrl} alt={`Payment receipt of ${application.fullName}`} className="h-52 w-full object-cover" loading="lazy" />
                          </a>
                        )
                      ) : (
                        <div className="flex min-h-44 items-center justify-center p-4 text-sm text-slate-500">No receipt URL found</div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">Showing {paginationLabel}</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="secondary-button px-4 py-2 text-sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              Previous
            </button>
            <p className="text-sm font-medium text-slate-700">
              Page {pagination.page} / {pagination.pages}
            </p>
            <button
              type="button"
              className="secondary-button px-4 py-2 text-sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
