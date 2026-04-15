export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Spheronix Labs";
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "spheronixtechnology@gmail.com";
export const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || "+91 63057 95067";
export const CONTACT_PHONE1 = import.meta.env.VITE_CONTACT_PHONE1 || "+91 73867 89578";
export const UPI_ID = import.meta.env.VITE_UPI_ID || "spheronixlabs@upi";
export const UPI_PAYEE_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || COMPANY_NAME;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export const SERVER_PORT = Number(import.meta.env.VITE_SERVER_PORT || 5000);   
export const SHORT_TERM_BASE_FEE = Number(import.meta.env.VITE_SHORT_TERM_BASE_FEE || 1694);
export const SHORT_TERM_FULL_FEE = Number(import.meta.env.VITE_SHORT_TERM_FULL_FEE || 1999);
export const LONG_TERM_BASE_FEE = Number(import.meta.env.VITE_LONG_TERM_BASE_FEE || 2965);
export const LONG_TERM_FULL_FEE = Number(import.meta.env.VITE_LONG_TERM_FULL_FEE || 3499);
export const CERTIFICATE_FEE = 300;
export const GST_RATE = 0.18;

// Removed legacy overrides VITE_BASE_AMOUNT and VITE_FULL_AMOUNT

export const INTERNSHIP_MODE_OPTIONS = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" }
];

export const DOMAIN_OPTIONS = [
  { label: "Full Stack with AI", value: "Full Stack with AI" },
  { label: "Embedded Systems with IoT", value: "Embedded Systems with IoT" }
];

export const SERVER_ORIGIN =
  import.meta.env.VITE_SERVER_ORIGIN ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`
    : `http://localhost:${SERVER_PORT}`);

export const BRAND_LOGO_URL = import.meta.env.VITE_BRAND_LOGO_URL || `${SERVER_ORIGIN}/logo.jpeg`;

export const ROLE_OPTIONS = [
  { label: "Training Based", value: "Training Based" },
  { label: "Work Based", value: "Work Based" }
];

export const INTERNSHIP_DETAILS = {
  short: {
    key: "short",
    slug: "short-term",
    title: "Short-Term Internship",
    duration: "2 months",
    baseFee: SHORT_TERM_BASE_FEE,
    fullFee: SHORT_TERM_FULL_FEE,
    route: "/apply/short-term",
    accent: "from-cyan-500 via-blue-500 to-indigo-600",
    summary:
      "Best for students who want a focused, high-impact internship with structured guidance and certificate delivery."
  },
  long: {
    key: "long",
    slug: "long-term",
    title: "Long-Term Internship",
    duration: "4 months",
    baseFee: LONG_TERM_BASE_FEE,
    fullFee: LONG_TERM_FULL_FEE,
    route: "/apply/long-term",
    accent: "from-indigo-600 via-blue-600 to-sky-500",
    summary:
      "Built for students looking for extended mentorship, deeper project ownership, and stronger industry readiness."
  }
};

export function calculatePayableAmount({ internshipMode, internshipType }) {
  if (internshipMode === "online") {
    return CERTIFICATE_FEE;
  }

  const baseAmount = INTERNSHIP_DETAILS[internshipType]?.fee || SHORT_TERM_FEE;
  return Math.round(baseAmount * (1 + GST_RATE));
}

export function buildUpiLink({ amount, note }) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount).toFixed(2) : "0.00";

  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: safeAmount,
    cu: "INR"
  });

  return `upi://pay?${params.toString()}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}
