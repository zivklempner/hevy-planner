import { computeOverload } from '../utils/overload';

export function SummaryBar({ exercises, repRanges = {} }) {
  const counts = { increase: 0, push: 0 };
  for (const ex of exercises) {
    const plan = computeOverload(ex, repRanges[ex.title]);
    if (plan) counts[plan.status] = (counts[plan.status] ?? 0) + 1;
  }

  return (
    <div className="flex gap-2 px-4 md:px-6 py-3 shrink-0">
      <Pill count={counts.increase} label="Increase weight" className="bg-emerald-500/15 text-emerald-400" />
      <Pill count={counts.push}     label="Push reps"       className="bg-blue-500/15 text-blue-400"      />
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
