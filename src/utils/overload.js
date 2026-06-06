export function isNormal(s) {
  return s.type === 'normal' || s.set_type === 'normal';
}

// Per-exercise rep ranges: [min, max].
// Keyed by the exact name Hevy uses in its API (with suffix stripping as fallback).
// Organised by the four hypertrophy brackets the user wants.
const REP_RANGES = {

  // ── 6–8  Heavy barbell compounds ──────────────────────────────────────
  'Bench Press (Barbell)':                    [6,  8],
  'Bench Press':                              [6,  8],
  'Barbell Bench Press':                      [6,  8],
  'Decline Bench Press (Barbell)':            [6,  8],
  'Decline Bench Press':                      [6,  8],
  'Bench Press - Close Grip (Barbell)':       [6,  8],
  'Close-Grip Bench Press':                   [6,  8],
  'Pull Up':                                  [6,  8],
  'Pull-up':                                  [6,  8],
  'Chin Up':                                  [6,  8],
  'Chin-up':                                  [6,  8],
  'Deadlift':                                 [5,  8],
  'Deadlift (Barbell)':                       [5,  8],
  'Barbell Squat':                            [5,  8],
  'Squat (Barbell)':                          [5,  8],
  'Trap Bar Deadlift':                        [5,  8],
  'Nordic Curl':                              [5,  8],
  'Dragon Flag':                              [5,  8],
  'Muscle Up':                                [4,  8],

  // ── 8–10  Moderate compounds ───────────────────────────────────────────
  'Iso-Lateral Row (Machine)':                [8, 10],
  'Leg Press (Machine)':                      [8, 10],
  'Leg Press':                                [8, 10],
  'Shoulder Press (Dumbbell)':                [8, 10],
  'Overhead Press (Barbell)':                 [8, 10],
  'Overhead Press':                           [8, 10],
  'Push Press':                               [8, 10],
  'Back Extension (Weighted Hyperextension)': [8, 10],
  'Barbell Row':                              [8, 10],
  'T-Bar Row':                                [8, 10],
  'Hack Squat':                               [8, 10],
  'Bulgarian Split Squat':                    [8, 10],
  'Romanian Deadlift':                        [8, 10],
  'Romanian Deadlift (Dumbbell)':             [8, 10],
  'Standing Leg Curls':                       [8, 10],
  'Leg Curl':                                 [8, 10],
  'Leg Curl (Machine)':                       [8, 10],
  'Hip Thrust':                               [8, 10],
  'Hip Thrust (Barbell)':                     [8, 10],
  'Assisted Pull-up':                         [8, 10],
  'Ab Wheel Rollout':                         [8, 10],
  'Good Morning':                             [8, 10],
  'Landmine Press':                           [8, 10],
  'Z-Press':                                  [8, 10],

  // ── 10–12  Standard hypertrophy ────────────────────────────────────────
  'Incline Bench Press (Dumbbell)':           [10, 12],
  'Incline Bench Press':                      [10, 12],
  'Incline Dumbbell Press':                   [10, 12],
  'Chest Press (Machine)':                    [10, 12],
  'Seated Dip Machine':                       [10, 12],
  'Dumbbell Bench Press':                     [10, 12],
  'Arnold Press':                             [10, 12],
  'Seated Dumbbell Press':                    [10, 12],
  'Lat Pulldown':                             [10, 12],
  'Lat Pulldown - Close Grip (Cable)':        [10, 12],
  'Single Arm Lat Pulldown':                  [10, 12],
  'Single-Arm Pulldown':                      [10, 12],
  'Dumbbell Row':                             [10, 12],
  'Seated Cable Row':                         [10, 12],
  'Single Arm Cable Row':                     [10, 12],
  'Cable Row':                                [10, 12],
  'Preacher Curl (Barbell)':                  [10, 12],
  'Preacher Curl (Dumbbell)':                 [10, 12],
  'Preacher Curl':                            [10, 12],
  'Zottman Curl (Dumbbell)':                  [10, 12],
  'Zottman Curl':                             [10, 12],
  'Hammer Curl (Dumbbell)':                   [10, 12],
  'Hammer Curl':                              [10, 12],
  'Bicep Curl':                               [10, 12],
  'Bicep Curl (Dumbbell)':                    [10, 12],
  'Bicep Curl (Barbell)':                     [10, 12],
  'Barbell Bicep Curl':                       [10, 12],
  'Dumbbell Bicep Curl':                      [10, 12],
  'Reverse Curl (Cable)':                     [10, 12],
  'Reverse Curl':                             [10, 12],
  'Incline Dumbbell Curl':                    [10, 12],
  'Incline Curl':                             [10, 12],
  'Spider Curl':                              [10, 12],
  'Cable Curl':                               [10, 12],
  'Concentration Curl':                       [10, 12],
  'Triceps Pushdown':                         [10, 12],
  'Triceps Pressdown':                        [10, 12],
  'Tricep Pushdown':                          [10, 12],
  'Tricep Pushdown (Cable)':                  [10, 12],
  'Single Arm Triceps Pushdown (Cable)':      [10, 12],
  'Overhead Tricep Extension':                [10, 12],
  'Overhead Tricep Extension (Cable)':        [10, 12],
  'Skull Crusher':                            [10, 12],
  'Dumbbell Tricep Extension':                [10, 12],
  'Single Leg Extensions':                    [10, 12],
  'Leg Extension':                            [10, 12],
  'Leg Extension (Machine)':                  [10, 12],
  'Step-up':                                  [10, 12],
  'Sissy Squat':                              [10, 12],
  'Glute Bridge':                             [10, 12],
  'Single-Leg Hip Thrust':                    [10, 12],
  'Swiss Ball Leg Curl':                      [10, 12],

  // ── 12–15  Isolation / high-rep ────────────────────────────────────────
  'Face Pull':                                [12, 15],
  'Single Arm Lateral Raise (Cable)':         [12, 15],
  'Lateral Raise':                            [12, 15],
  'Lateral Raise (Dumbbell)':                 [12, 15],
  'Lateral Raise (Cable)':                    [12, 15],
  'Cable Lateral Raise':                      [12, 15],
  'Machine Lateral Raise':                    [12, 15],
  'Upright Row':                              [12, 15],
  'Rear Delt Fly':                            [12, 15],
  'Reverse Pec Deck':                         [12, 15],
  'Seated Calf Raise':                        [12, 15],
  'Calf Raise':                               [12, 15],
  'Leg Press Calf Raise':                     [12, 15],
  'Cable Fly':                                [12, 15],
  'Chest Fly':                                [12, 15],
  'Chest Fly (Cable)':                        [12, 15],
  'Hanging Leg Raise':                        [12, 15],
  'Lying Leg Raise':                          [12, 15],
  'Terminal Knee Extension':                  [15, 20],
  'Band Pull Apart':                          [15, 20],
  'Crunch':                                   [15, 20],
  'Cable Crunch':                             [15, 20],
};

const DEFAULT_RANGE = { min: 8, max: 12 };

// Strip implement suffix like " (Barbell)", " (Dumbbell)", " (Machine)", " (Cable)"
// so "Zottman Curl (Dumbbell)" falls back to "Zottman Curl" automatically.
function stripSuffix(name) {
  return name.replace(/\s*\((Barbell|Dumbbell|Machine|Cable|Band|Smith|EZ Bar|Kettlebell)\)\s*$/i, '').trim();
}

/**
 * Returns { min, max } for an exercise.
 * Resolution order:
 *   1. Exact name in map
 *   2. Name with implement suffix stripped
 *   3. Inferred from user's historical avgReps
 *   4. Default 8–12
 */
export function getRepRange(exerciseName, historyAvgReps = []) {
  const direct = REP_RANGES[exerciseName];
  if (direct) return { min: direct[0], max: direct[1] };

  const stripped = REP_RANGES[stripSuffix(exerciseName)];
  if (stripped) return { min: stripped[0], max: stripped[1] };

  // Infer from history: centre a 4-rep window on the user's typical rep count
  if (historyAvgReps.length >= 3) {
    const sorted = [...historyAvgReps].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const mid = Math.round(median);
    return { min: Math.max(4, mid - 2), max: Math.min(30, mid + 2) };
  }

  return DEFAULT_RANGE;
}

/**
 * Per-set recommendation given the exercise's rep range.
 *
 *   allHitMax true  → bump weight +2.5 kg, drop to range.min     (increase)
 *   this set = max  → hold at max while others catch up           (ready)
 *   reps in range   → +1 rep, same weight                        (maintain)
 *   reps < min      → +1 rep, same weight                        (build)
 */
export function computeSetPlan(set, allHitMax, range = DEFAULT_RANGE) {
  const weight     = set.weight_kg ?? null; // null = bodyweight
  const reps       = set.reps ?? 0;
  const bodyweight = weight === null || weight === 0;
  const { min, max } = range;

  if (allHitMax) {
    return {
      targetWeight: bodyweight ? null : weight + 2.5,
      targetReps:   min,
      status:       bodyweight ? 'push' : 'increase',
      lastReps: reps,
      lastWeight: weight,
      bodyweight,
    };
  }
  if (reps >= max) {
    // This set is at max but not all sets are — hold here while others catch up
    return { targetWeight: weight, targetReps: max, status: 'ready', lastReps: reps, lastWeight: weight, bodyweight };
  }
  // Both "in range" and "below range" have the same action: +1 rep, same weight
  return {
    targetWeight: weight,
    targetReps:   Math.min(reps + 1, max),
    status:       'push',
    lastReps: reps,
    lastWeight: weight,
    bodyweight,
  };
}

/**
 * Exercise-level summary.  Pass repRange from getRepRange() for accuracy.
 */
export function computeOverload(exercise, range = DEFAULT_RANGE) {
  const sets = (exercise.sets || []).filter(isNormal);
  if (!sets.length) return null;

  const allHitMax = sets.every(s => (s.reps ?? 0) >= range.max);
  const setPlans  = sets.map(s => computeSetPlan(s, allHitMax, range));
  const overallStatus = allHitMax ? 'increase' : 'push';

  return { status: overallStatus, sets: sets.length, setPlans, allHitMax, range };
}
