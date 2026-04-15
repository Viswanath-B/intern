import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildUpiLink, COMPANY_NAME, CERTIFICATE_FEE, formatCurrency, UPI_ID } from "../lib/options";

export function PaymentSection({ amount, baseAmount, fullAmount, amountType, onAmountTypeChange, internshipTitle, internshipMode, isOpen, onToggle }) {
  const qrWrapperRef = useRef(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const selectedAmountLabel = amountType === "base" ? "Base amount" : "Full amount";
  const paymentLink = buildUpiLink({
    amount,
    note: `${internshipTitle} ${internshipMode} ${selectedAmountLabel.toLowerCase()}`
  });
  const [copyLabel, setCopyLabel] = useState("Copy generic UPI link");
  const [upiIdCopyLabel, setUpiIdCopyLabel] = useState("Copy UPI ID");
  const [amountCopyLabel, setAmountCopyLabel] = useState("Copy amount");
  const hasTinyAmount = Number(amount) < 10;

  async function copyTextWithFallback(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall back to legacy copy path below.
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textArea);
      return copied;
    } catch {
      return false;
    }
  }

  async function handleCopy() {
    const copied = await copyTextWithFallback(paymentLink);

    if (copied) {
      setCopyLabel("Link copied");
    } else {
      setCopyLabel("Copy failed");
    }

    window.setTimeout(() => {
      setCopyLabel("Copy generic UPI link");
    }, 1800);
  }

  async function handleDownloadQr() {
    try {
      const svgElement = qrWrapperRef.current?.querySelector("svg");

      if (!svgElement) {
        return;
      }

      const qrSize = 1024;
      let serializedSvg = new XMLSerializer().serializeToString(svgElement);

      if (!serializedSvg.includes("xmlns=\"http://www.w3.org/2000/svg\"")) {
        serializedSvg = serializedSvg.replace("<svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"");
      }

      if (!serializedSvg.includes("xmlns:xlink=\"http://www.w3.org/1999/xlink\"")) {
        serializedSvg = serializedSvg.replace("<svg", "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\"");
      }

      const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      try {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = svgUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = qrSize;
        canvas.height = qrSize;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas context unavailable");
        }

        context.imageSmoothingEnabled = false;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const pngDataUrl = canvas.toDataURL("image/png");
        const pngAnchor = document.createElement("a");
        pngAnchor.href = pngDataUrl;
        pngAnchor.download = `${internshipTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${selectedAmountLabel.replace(/\s+/g, "-").toLowerCase()}.png`;
        document.body.appendChild(pngAnchor);
        pngAnchor.click();
        pngAnchor.remove();
      } catch {
        const svgDownloadUrl = URL.createObjectURL(svgBlob);
        const svgAnchor = document.createElement("a");
        svgAnchor.href = svgDownloadUrl;
        svgAnchor.download = `${internshipTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${selectedAmountLabel.replace(/\s+/g, "-").toLowerCase()}.svg`;
        document.body.appendChild(svgAnchor);
        svgAnchor.click();
        svgAnchor.remove();
        URL.revokeObjectURL(svgDownloadUrl);
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    } catch {
      setCopyLabel("Download failed");
    }
  }

  async function handleCopyUpiId() {
    const copied = await copyTextWithFallback(UPI_ID);

    if (copied) {
      setUpiIdCopyLabel("UPI ID copied");
    } else {
      setUpiIdCopyLabel("Copy failed");
    }

    window.setTimeout(() => {
      setUpiIdCopyLabel("Copy UPI ID");
    }, 1800);
  }

  async function handleCopyAmount() {
    const copied = await copyTextWithFallback(String(amount));

    if (copied) {
      setAmountCopyLabel("Amount copied");
    } else {
      setAmountCopyLabel("Copy failed");
    }

    window.setTimeout(() => {
      setAmountCopyLabel("Copy amount");
    }, 1800);
  }

  return (
    <section className="card-shell relative p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Payment</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-slate-950">Scan to Pay</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {internshipMode === "online"
              ? `Online mode is free for the internship itself. Pay only the certificate fee of ${formatCurrency(CERTIFICATE_FEE)} using the QR code below or open the UPI deep link in your preferred payment app.`
              : "Offline mode includes the program fee plus GST. Pay using the QR code below or open the UPI deep link in your preferred payment app."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="w-full sm:w-56">
            <label className="field-label" htmlFor="amountType">
              Amount Type
            </label>
            <select
              id="amountType"
              className="field-select"
              value={amountType}
              onChange={(event) => onAmountTypeChange(event.target.value)}
            >
              <option value="base">Base Amount ({formatCurrency(baseAmount)})</option>
              <option value="full">Full Amount ({formatCurrency(fullAmount)})</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="secondary-button px-4 py-2 text-sm" onClick={() => setShowTerms(true)}>
              Terms & Conditions
            </button>
            <button type="button" className="secondary-button px-4 py-2 text-sm" onClick={onToggle}>
              {isOpen ? "Hide payment options" : "Unable to scan?"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          {termsAccepted ? (
            <div ref={qrWrapperRef} className="flex flex-col items-center">
              <QRCodeSVG value={paymentLink} size={180} bgColor="transparent" fgColor="#0f172a" />
              <p className="mt-4 text-sm font-medium text-slate-700">Scan to pay</p>
              <p className="mt-1 text-xs text-slate-500">{COMPANY_NAME}</p>
              <p className="mt-1 text-xs text-slate-500">{selectedAmountLabel}</p>
              <p className="mt-1 text-xs text-slate-500">{formatCurrency(amount)}</p>
              <button type="button" className="secondary-button mt-4 px-4 py-2 text-sm" onClick={handleDownloadQr}>
                Download QR
              </button>
            </div>
          ) : (
            <div className="max-w-xs">
              <p className="text-sm font-semibold text-slate-950">Accept the terms to view the QR code</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The payment QR code is shown only after you accept the terms and conditions.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          {hasTinyAmount ? (
            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Very small amounts (like ₹1 or ₹3) are frequently blocked by UPI apps for security checks. Use ₹10+ for reliable payments.
            </div>
          ) : null}

          {isOpen ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">UPI ID</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{UPI_ID}</p>
                <button type="button" className="secondary-button mt-3 px-3 py-1.5 text-xs" onClick={handleCopyUpiId}>
                  {upiIdCopyLabel}
                </button>
              </div>

              <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Amount</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{formatCurrency(amount)}</p>
                <p className="mt-1 text-xs text-slate-500">{selectedAmountLabel}</p>
                <button type="button" className="secondary-button mt-3 px-3 py-1.5 text-xs" onClick={handleCopyAmount}>
                  {amountCopyLabel}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
              If the QR does not scan, reveal this section to view the UPI ID, exact amount, and copy the payment link.
            </div>
          )}
        </div>
      </div>

      {showTerms ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Terms & Conditions</p>
            <h4 className="mt-3 font-display text-2xl font-semibold text-slate-950">Please review before payment</h4>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>If you choose online internship the internship program is free. The certificate cost is 300₹.</p>
              <p>If you choose offline internship the internship program cost is 1000₹ + GST. In this you can choose work based or training based internship.</p>
              <p>In work based internship you will get an experience letter from the company.</p>
              <p>In training based internship you will not get an experience letter from the company
                <p>Payment receipts must be uploaded after completion of the transaction.</p>.</p>
              <p>By accepting, you confirm that the details entered in the application form are accurate.</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="secondary-button px-4 py-2 text-sm"
                onClick={() => {
                  setShowTerms(false);
                  setTermsAccepted(false);
                }}
              >
                Decline
              </button>
              <button
                type="button"
                className="primary-button px-4 py-2 text-sm"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTerms(false);
                }}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
