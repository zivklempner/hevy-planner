import { useMemo } from 'react';
import { computeInsights } from '../utils/insights';

export function InsightsTab({ workouts }) {
  const { improvers, stuck, declining } = useMemo(
    () => computeInsights(workouts, 90),
    [workouts]
  );

  const total = improvers.length + stuck.length + declining.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-sm px-4 text-center">
        Need at least 3 sessions per exercise for insights. Keep training!
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 space-y-6 pt-4">
      {/* Top Improvers */}
      {improvers.length > 0 && (
        <section>
          <SectionHeader icon="🚀" title="Top Improvers" subtitle="Most progress in last 90 days" />
          <div className="space-y-2">
            {improvers.map(ex => (
              <ImproverCard key={ex.name} ex={ex} />
            ))}
          </div>
        </section>
      )}

      {/* Stuck */}
      {stuck.length > 0 && (
        <section>
          <SectionHeader icon="🔁" title="Stuck" subtitle="Less than 1 kg variation in last 4+ sessions" />
          <div className="space-y-2">
            {stuck.map(ex => (
              <StuckCard key={ex.name} ex={ex} />
            ))}
          </div>
        </section>
      )}

      {/* Declining */}
      {declining.length > 0 && (
        <section>
          <SectionHeader icon="📉" title="Declining" subtitle="Weight down >5% since first session" />
          <div className="space-y-2">
            {declining.map(ex => (
              <DecliningCard key={ex.name} ex={ex} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold text-white">
        {icon} {title}
      </h2>
      <p className="text-xs text-zinc-500">{subtitle}</p>
    </div>
  );
}

function ImproverCard({ ex }) {
  const barWidth = Math.min(ex.pctChange, 100);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-white leading-snug flex-1">{ex.name}</p>
        <span className="shrink-0 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
          +{ex.pctChange}%
        </span>
      </div>
      <p className="text-xs text-zinc-400 mb-2">
        {ex.firstWeight} kg → {ex.lastWeight} kg · {ex.sessionCount} sessions
      </p>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

function StuckCard({ ex }) {
  return (
    <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white leading-snug flex-1">{ex.name}</p>
        <span className="shrink-0 bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
          Consider Swap
        </span>
      </div>
      <p className="text-xs text-zinc-400">
        Holding at {ex.currentWeight} kg · {ex.sessionCount} sessions
      </p>
      {ex.alternatives.length > 0 && (
        <div className="border-t border-zinc-800 pt-2">
          <p className="text-xs text-zinc-500 mb-1">Try instead:</p>
          <div className="flex flex-wrap gap-1.5">
            {ex.alternatives.map(alt => (
              <span key={alt} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DecliningCard({ ex }) {
  return (
    <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-white leading-snug flex-1">{ex.name}</p>
        <span className="shrink-0 bg-red-700 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
          {ex.pctChange.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-zinc-400">
        {ex.firstWeight} kg → {ex.lastWeight} kg · {ex.sessionCount} sessions
      </p>
      <p className="text-xs text-zinc-600 mt-1">
        May be a deload, form correction, or injury — monitor closely.
      </p>
    </div>
  );
}
