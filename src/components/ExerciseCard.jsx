import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { computeOverload } from '../utils/overload';

const STATUS = {
  increase: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-600 text-white',
    label: '↑ Increase Weight',
  },
  maintain: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    badge: 'bg-blue-600 text-white',
    label: '→ Push Reps',
  },
  build: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-600 text-white',
    label: '⬆ Build Up',
  },
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-1">{fmtDate(label)}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function ExerciseCard({ exercise, history }) {
  const [expanded, setExpanded] = useState(false);
  const plan = computeOverload(exercise);
  if (!plan) return null;

  const s = STATUS[plan.status];

  return (
    <div
      className={`rounded-xl border ${s.border} ${s.bg} overflow-hidden`}
      onClick={() => setExpanded(v => !v)}
    >
      {/* Card header row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white leading-snug flex-1">{exercise.title}</h3>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
            {s.label}
          </span>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Sets" value={plan.sets} />
          <Stat label="Target" value={`${plan.targetReps} reps`} />
          <Stat
            label="Weight"
            value={`${plan.targetWeight} kg`}
            highlight={plan.status === 'increase'}
          />
        </div>

        <p className="text-xs text-zinc-500 mt-2">
          Last session: {plan.lastReps} reps @ {plan.lastWeight} kg
          {history.length > 0 && (
            <span className="ml-2 text-zinc-600">· {history.length} sessions</span>
          )}
        </p>
      </div>

      {/* Expanded chart */}
      {expanded && history.length > 1 && (
        <div
          className="border-t border-zinc-700/50 px-2 pt-3 pb-4"
          onClick={e => e.stopPropagation()}
        >
          <ResponsiveContainer width="100%" height={190}>
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
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: 10, paddingTop: 4, color: '#a1a1aa' }}
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

      {expanded && history.length <= 1 && (
        <p className="text-xs text-zinc-600 text-center pb-4">
          Need 2+ sessions to show a chart.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className={`text-base font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
