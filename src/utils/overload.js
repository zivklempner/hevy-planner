export function isNormal(s) {
  return s.type === 'normal' || s.set_type === 'normal';
}

/**
 * Per-set recommendation.
 * allHit12: true when every normal set in this exercise hit ≥12 reps last session.
 *
 * Logic:
 *   allHit12          → bump weight +2.5 kg, drop to 8 reps        (increase)
 *   this set = 12     → hold at 12 reps / same weight               (ready – others catching up)
 *   this set 8–11     → +1 rep, same weight                         (maintain)
 *   this set < 8      → +1 rep, same weight                         (build)
 */
export function computeSetPlan(set, allHit12) {
  const weight = set.weight_kg ?? 0;
  const reps = set.reps ?? 0;

  if (allHit12) {
    return { targetWeight: weight + 2.5, targetReps: 8, status: 'increase', lastReps: reps, lastWeight: weight };
  }
  if (reps >= 12) {
    return { targetWeight: weight, targetReps: 12, status: 'ready', lastReps: reps, lastWeight: weight };
  }
  return {
    targetWeight: weight,
    targetReps: Math.min(reps + 1, 12),
    status: reps < 8 ? 'build' : 'maintain',
    lastReps: reps,
    lastWeight: weight,
  };
}

/**
 * Exercise-level summary used by SummaryBar.
 * Returns null if no normal sets found.
 */
export function computeOverload(exercise) {
  const sets = (exercise.sets || []).filter(isNormal);
  if (!sets.length) return null;

  const allHit12 = sets.every(s => (s.reps ?? 0) >= 12);
  const setPlans = sets.map(s => computeSetPlan(s, allHit12));
  const overallStatus = allHit12 ? 'increase'
    : setPlans.some(p => p.status === 'build') ? 'build' : 'maintain';

  return { status: overallStatus, sets: sets.length, setPlans, allHit12 };
}
