import { Link, useSearchParams } from "react-router-dom";
import { COMPANY_NAME, CERTIFICATE_FEE, formatCurrency } from "../lib/options";

export function ScannerPage() {
  const [searchParams] = useSearchParams();

  const amount = Number.parseInt(searchParams.get("amount") || String(CERTIFICATE_FEE), 10) || CERTIFICATE_FEE;
  const internshipTitle = searchParams.get("title") || "Internship application";
  const scannerImageUrl = import.meta.env.VITE_SCANNER_IMAGE || "/scanner.png";

  async function handleDownloadScanner() {
    const response = await fetch(scannerImageUrl);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${internshipTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-scanner`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <main className="section-shell flex min-h-[calc(100vh-10rem)] items-center py-12 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="card-shell overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Scanner link page</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-slate-950 sm:text-5xl">Payment Scanner</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              This page keeps the same QR scanner image in a standalone view for quick access and sharing.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <img
                src={scannerImageUrl}
                alt="Payment scanner"
                className="h-[220px] w-[220px] rounded-2xl object-contain"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-slate-950">{COMPANY_NAME}</p>
              <p className="mt-1 text-sm text-slate-500">{internshipTitle}</p>
              <p className="mt-1 text-sm text-slate-500">{formatCurrency(amount)}</p>
            </div>

            <button type="button" className="secondary-button px-5 py-3 text-sm" onClick={handleDownloadScanner}>
              Download Scanner
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="secondary-button px-5 py-3 text-sm">
                Back to home
              </Link>
              <Link to="/apply/short-term" className="primary-button px-5 py-3 text-sm">
                Apply now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}