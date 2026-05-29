import { computeOverload } from '../utils/overload';

export function SummaryBar({ exercises }) {
  const counts = { increase: 0, maintain: 0, build: 0 };
  for (const ex of exercises) {
    const plan = computeOverload(ex);
    if (plan) counts[plan.status]++;
  }

  return (
    <div className="flex gap-2 px-4 py-3 shrink-0">
      <Pill count={counts.increase} label="Increase" className="bg-emerald-500/15 text-emerald-400" />
      <Pill count={counts.maintain} label="Maintain" className="bg-blue-500/15 text-blue-400" />
      <Pill count={counts.build}    label="Build"    className="bg-amber-500/15 text-amber-400" />
    </div>
  );
}

function Pill({ count, label, className }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      <span className="font-bold text-sm">{count}</span>
      <span>{label}</span>
    </div>
  );
}
