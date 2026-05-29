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
      <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-sm px-6 text-center gap-2">
        <span className="text-3xl">📊</span>
        <p>Need at least 3 sessions per exercise in the last 90 days.</p>
        <p className="text-xs text-zinc-600">Keep training — insights will appear here once there's enough data.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 pb-28 pt-4 space-y-8 max-w-3xl">

      {/* Legend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 space-y-1.5">
        <p className="font-semibold text-zinc-300 mb-2">How progress is measured</p>
        <p>All scores use <strong className="text-zinc-200">estimated 1-rep max</strong> (Epley formula: weight × (1 + reps ÷ 30)) so that trading weight for reps — or vice versa — still counts as real progress.</p>
      </div>

      {/* Top Improvers */}
      {improvers.length > 0 && (
        <section>
          <SectionHeader icon="🚀" title="Top Improvers" subtitle="Exercises with the biggest strength score gain in the last 90 days" />
          <div className="space-y-2">
            {improvers.map(ex => <ImproverCard key={ex.name} ex={ex} />)}
          </div>
        </section>
      )}

      {/* Stuck */}
      {stuck.length > 0 && (
        <section>
          <SectionHeader icon="🔁" title="Plateau" subtitle="Strength score hasn't moved more than 3% across the last 4+ sessions" />
          <div className="space-y-2">
            {stuck.map(ex => <StuckCard key={ex.name} ex={ex} />)}
          </div>
        </section>
      )}

      {/* Declining */}
      {declining.length > 0 && (
        <section>
          <SectionHeader icon="📉" title="Declining" subtitle="Strength score dropped more than 5% since first session (last 90 days)" />
          <div className="space-y-2">
            {declining.map(ex => <DecliningCard key={ex.name} ex={ex} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold text-white">{icon} {title}</h2>
      <p className="text-xs text-zinc-500">{subtitle}</p>
    </div>
  );
}

function ImproverCard({ ex }) {
  const barWidth = Math.min(ex.e1rmPct, 100);
  const weightNote = ex.weightPct > 2
    ? `Weight +${ex.weightPct.toFixed(0)}%`
    : ex.repsDelta > 0.5
    ? `Reps +${ex.repsDelta.toFixed(1)}/set`
    : null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-white leading-snug flex-1">{ex.name}</p>
        <span className="shrink-0 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
          +{ex.e1rmPct}%
        </span>
      </div>
      <p className="text-xs text-zinc-400 mb-1">
        Est. 1RM: {ex.firstE1rm} kg → <span className="text-emerald-400 font-semibold">{ex.lastE1rm} kg</span>
        {' · '}{ex.sessionCount} sessions
      </p>
      {weightNote && <p className="text-xs text-zinc-600 mb-2">{weightNote}</p>}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${barWidth}%` }} />
      </div>
    </div>
  );
}

function StuckCard({ ex }) {
  return (
    <div className="bg-zinc-900 border border-amber-500/25 rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white leading-snug flex-1">{ex.name}</p>
        <span className="shrink-0 bg-amber-700 text-amber-100 text-xs px-2 py-0.5 rounded-full font-semibold">
          Plateau
        </span>
      </div>
      <p className="text-xs text-zinc-400">
        Holding ~{ex.currentE1rm} kg est. 1RM ({ex.currentWeight} kg × {Math.round(ex.currentReps)} reps)
        {' · '}{ex.sessionCount} sessions
      </p>
      <p className="text-xs text-zinc-500">
        You've hit a ceiling here. Options: try a different grip/angle, add a drop set, or swap the exercise for a few weeks.
      </p>
      {ex.alternatives.length > 0 && (
        <div className="border-t border-zinc-800 pt-2">
          <p className="text-xs text-zinc-500 mb-1.5">Swap ideas:</p>
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
    <div className="bg-zinc-900 border border-red-500/25 rounded-xl p-3 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white leading-snug flex-1">{ex.name}</p>
        <span className="shrink-0 bg-red-800 text-red-100 text-xs px-2 py-0.5 rounded-full font-semibold">
          {ex.e1rmPct.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-zinc-400">
        Est. 1RM: {ex.firstE1rm} kg → <span className="text-red-400 font-semibold">{ex.lastE1rm} kg</span>
        {' · '}{ex.sessionCount} sessions
      </p>
      <p className="text-xs text-zinc-500 leading-relaxed pt-0.5">{ex.interpretation}</p>
    </div>
  );
}
