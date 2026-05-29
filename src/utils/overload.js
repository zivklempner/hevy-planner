/**
 * Given an exercise from the most-recent split workout, return the progressive
 * overload recommendation for the next session.
 *
 * Rules (hypertrophy, 8–12 rep range):
 *   all sets ≥ 12 reps  → bump weight +2.5 kg, drop to 8 reps  (status: increase)
 *   avg reps 8–11       → same weight, aim for avg+1 reps       (status: maintain)
 *   avg reps < 8        → same weight, same reps target          (status: build)
 */
export function computeOverload(exercise) {
  const normalSets = (exercise.sets || []).filter(s => s.set_type === 'normal');
  if (!normalSets.length) return null;

  const avgReps = normalSets.reduce((sum, s) => sum + s.reps, 0) / normalSets.length;
  const lastWeight = normalSets[normalSets.length - 1].weight_kg ?? 0;
  const allHit12 = normalSets.every(s => s.reps >= 12);

  if (allHit12) {
    return {
      status: 'increase',
      targetWeight: lastWeight + 2.5,
      targetReps: 8,
      lastReps: Math.round(avgReps),
      lastWeight,
      sets: normalSets.length,
    };
  }

  const status = avgReps < 8 ? 'build' : 'maintain';
  return {
    status,
    targetWeight: lastWeight,
    targetReps: Math.min(Math.round(avgReps) + 1, 12),
    lastReps: Math.round(avgReps),
    lastWeight,
    sets: normalSets.length,
  };
}
