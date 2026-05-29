import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { computeOverload, isNormal, computeSetPlan } from '../utils/overload';

const CARD = {
  increase: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/5' },
  maintain: { border: 'border-blue-500/40',    bg: 'bg-blue-500/5'    },
  build:    { border: 'border-amber-500/40',   bg: 'bg-amber-500/5'   },
};
const OVERALL_BADGE = {
  increase: 'bg-emerald-600 text-white',
  maintain: 'bg-blue-600 text-white',
  build:    'bg-amber-600 text-white',
};
const OVERALL_LABEL = {
  increase: '↑ Increase Weight',
  maintain: '→ Push Reps',
  build:    '⬆ Build Up',
};

const SET_STATUS = {
  increase: { icon: '↑', color: 'text-emerald-400', bg: 'bg-emerald-900/60 text-emerald-300' },
  ready:    { icon: '✓', color: 'text-emerald-400', bg: 'bg-emerald-900/40 text-emerald-400' },
  maintain: { icon: '→', color: 'text-blue-400',    bg: 'bg-blue-900/60 text-blue-300'       },
  build:    { icon: '↗', color: 'text-amber-400',   bg: 'bg-amber-900/60 text-amber-300'     },
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{fmtDate(label)}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function SetRow({ num, set, plan }) {
  const s = SET_STATUS[plan.status];
  const weightChanged = plan.targetWeight !== set.weight_kg;
  return (
    <tr className="border-t border-zinc-800/50">
      <td className="py-2 pr-3 text-xs text-zinc-500 font-medium tabular-nums">{num}</td>
      <td className="py-2 pr-4 text-xs text-zinc-400 tabular-nums font-mono">
        {set.weight_kg} kg &times; {set.reps}
      </td>
      <td className={`py-2 pr-3 text-xs font-semibold tabular-nums font-mono ${s.color}`}>
        {plan.targetWeight} kg &times; {plan.targetReps}
        {weightChanged && <span className="ml-1 text-[10px]">(new)</span>}
      </td>
      <td className="py-2">
        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.bg}`}>
          {s.icon}
        </span>
      </td>
    </tr>
  );
}

export function ExerciseCard({ exercise, history }) {
  const [expanded, setExpanded] = useState(false);

  const normalSets = (exercise.sets || []).filter(isNormal);
  if (!normalSets.length) return null;

  const allHit12 = normalSets.every(s => (s.reps ?? 0) >= 12);
  const setPlans = normalSets.map(s => computeSetPlan(s, allHit12));
  const overallStatus = allHit12 ? 'increase'
    : setPlans.some(p => p.status === 'build') ? 'build' : 'maintain';

  const card = CARD[overallStatus];

  return (
    <div className={`rounded-xl border ${card.border} ${card.bg} overflow-hidden`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white leading-snug flex-1">
            {exercise.title}
          </h3>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${OVERALL_BADGE[overallStatus]}`}>
            {OVERALL_LABEL[overallStatus]}
          </span>
        </div>

        {/* Per-set table */}
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[10px] text-zinc-600 font-normal pb-1.5 pr-3 w-8">Set</th>
              <th className="text-left text-[10px] text-zinc-600 font-normal pb-1.5 pr-4">Last session</th>
              <th className="text-left text-[10px] text-zinc-600 font-normal pb-1.5 pr-3">Your target</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {normalSets.map((set, i) => (
              <SetRow key={i} num={i + 1} set={set} plan={setPlans[i]} />
            ))}
          </tbody>
        </table>

        {/* Chart toggle hint */}
        <p className="text-[10px] text-zinc-600 mt-3 text-center">
          {history.length > 1
            ? expanded ? '▴ hide chart' : `▾ ${history.length} sessions history`
            : 'Need 2+ sessions to show chart'}
        </p>
      </div>

      {/* Expanded history chart */}
      {expanded && history.length > 1 && (
        <div
          className="border-t border-zinc-700/40 px-2 pt-3 pb-4"
          onClick={e => e.stopPropagation()}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fontSize: 9, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="weight"
                tick={{ fontSize: 9, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="reps"
                orientation="right"
                tick={{ fontSize: 9, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 20]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: 10, paddingTop: 6, color: '#a1a1aa' }}
              />
              <Line
                yAxisId="weight"
                dataKey="avgWeight"
                name="Weight (kg)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                yAxisId="reps"
                dataKey="avgReps"
                name="Avg Reps"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
