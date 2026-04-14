import { COMPANY_NAME, CONTACT_EMAIL, CONTACT_PHONE } from "../lib/options";
import { CONTACT_PHONE1 } from "../lib/options";

export function SiteFooter() {
  const dialPhone = CONTACT_PHONE.replace(/\s+/g, "");
  const dialPhone1 = CONTACT_PHONE1.replace(/\s+/g, "");

  return (
    <footer className="border-t border-slate-200/80 bg-white/70">
      <div className="section-shell grid gap-8 py-8 lg:grid-cols-2 lg:items-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Contact Us</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">Get in touch</h3>
          <p className="mt-2 text-sm text-slate-600">Have a question about internships? Send us a message.</p>

          <form className="mt-5 space-y-3">
            <input type="text" name="name" placeholder="Your name" className="field-input mt-0" />
            <input type="email" name="email" placeholder="Your email" className="field-input mt-0" />
            <textarea name="message" rows={4} placeholder="Your message" className="field-input mt-0 resize-none" />
            <button type="button" className="primary-button w-full sm:w-auto">
              Send Message
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <p className="font-display text-lg font-semibold text-slate-950">{COMPANY_NAME}</p>
          <p className="mt-2 text-sm text-slate-600">Support contact details</p>

          <div className="mt-4 space-y-3">
            <a href={`tel:${dialPhone}`} className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50">
              Mobile: {CONTACT_PHONE}
            </a>
            <a href={`tel:${dialPhone1}`} className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50">
              Mobile: {CONTACT_PHONE1}
            </a>
            
            <a href={`mailto:${CONTACT_EMAIL}`} className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50">
              Email: {CONTACT_EMAIL}
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-500">Built with React, Express, MongoDB, and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
