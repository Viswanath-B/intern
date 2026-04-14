export function StatCard({ label, value, description, accent = "from-blue-500 to-indigo-600" }) {
  return (
    <div className="card-shell overflow-hidden p-5">
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
