export function isNormal(s) {
  return s.type === 'normal' || s.set_type === 'normal';
}

// Per-exercise rep ranges: [min, max].
// "Increase weight" triggers when ALL sets reach max.
// "Build" when any set is below min.
const REP_RANGES = {
  // Heavy strength compounds
  'Deadlift':                        [5,  8],
  'Barbell Squat':                   [5,  8],
  'Squat (Barbell)':                 [5,  8],
  'Romanian Deadlift':               [6, 10],
  'Nordic Curl':                     [5,  8],
  'Good Morning':                    [8, 12],
  'Push Press':                      [6, 10],
  'Pull-up':                         [6, 10],
  'Close-Grip Bench Press':          [8, 12],
  'Trap Bar Deadlift':               [5,  8],

  // Standard barbell compounds
  'Bench Press':                     [8, 12],
  'Barbell Bench Press':             [8, 12],
  'Incline Bench Press':             [8, 12],
  'Overhead Press':                  [8, 12],
  'Overhead Press (Barbell)':        [8, 12],
  'Barbell Row':                     [8, 12],
  'T-Bar Row':                       [8, 12],

  // Leg machines / accessories
  'Leg Press':                       [8, 10],
  'Hack Squat':                      [8, 10],
  'Bulgarian Split Squat':           [8, 10],
  'Hip Thrust':                      [10, 12],
  'Glute Bridge':                    [12, 15],
  'Single-Leg Hip Thrust':           [10, 12],
  'Leg Curl':                        [10, 12],
  'Leg Extension':                   [12, 15],
  'Single Leg Extensions':           [12, 15],
  'Calf Raise':                      [15, 20],
  'Seated Calf Raise':               [15, 20],
  'Leg Press Calf Raise':            [15, 20],
  'Step-up':                         [10, 12],
  'Sissy Squat':                     [12, 15],
  'Terminal Knee Extension':         [15, 20],
  'Swiss Ball Leg Curl':             [12, 15],

  // Back accessories
  'Lat Pulldown':                    [10, 12],
  'Seated Cable Row':                [10, 12],
  'Cable Row':                       [10, 15],
  'Iso-Lateral Row (Machine)':       [10, 12],
  'Dumbbell Row':                    [10, 12],
  'Single-Arm Pulldown':             [12, 15],
  'Assisted Pull-up':                [8, 12],

  // Rear delt / rotator
  'Face Pull':                       [15, 20],
  'Rear Delt Fly':                   [15, 20],
  'Reverse Pec Deck':                [15, 20],
  'Band Pull Apart':                 [20, 25],

  // Chest accessories
  'Dumbbell Bench Press':            [10, 12],
  'Incline Dumbbell Press':          [10, 12],
  'Cable Fly':                       [12, 15],
  'Chest Fly':                       [12, 15],

  // Shoulders
  'Shoulder Press (Dumbbell)':       [10, 12],
  'Arnold Press':                    [10, 12],
  'Seated Dumbbell Press':           [10, 12],
  'Lateral Raise':                   [15, 20],
  'Lateral Raise (Dumbbell)':        [15, 20],
  'Cable Lateral Raise':             [15, 20],
  'Machine Lateral Raise':           [15, 20],
  'Upright Row':                     [12, 15],
  'Landmine Press':                  [10, 12],
  'Z-Press':                         [8, 12],

  // Biceps
  'Bicep Curl':                      [10, 15],
  'Dumbbell Bicep Curl':             [10, 15],
  'Barbell Bicep Curl':              [8,  12],
  'Hammer Curl':                     [10, 15],
  'Preacher Curl':                   [10, 12],
  'Zottman Curl':                    [10, 12],
  'Incline Dumbbell Curl':           [10, 15],
  'Incline Curl':                    [10, 15],
  'Spider Curl':                     [10, 15],
  'Cable Curl':                      [12, 15],
  'Concentration Curl':              [12, 15],
  'Reverse Curl':                    [12, 15],

  // Triceps
  'Tricep Pushdown':                 [12, 15],
  'Overhead Tricep Extension':       [12, 15],
  'Skull Crusher':                   [10, 12],
  'Dumbbell Tricep Extension':       [12, 15],

  // Core
  'Hanging Leg Raise':               [10, 15],
  'Ab Wheel Rollout':                [8,  12],
  'Cable Crunch':                    [12, 15],
  'Dragon Flag':                     [5,  10],
};

const DEFAULT_RANGE = { min: 8, max: 12 };

/**
 * Returns { min, max } for an exercise.
 * Falls back to inferring from the user's historical avgReps if the exercise
 * isn't in the hardcoded map.
 */
export function getRepRange(exerciseName, historyAvgReps = []) {
  const mapped = REP_RANGES[exerciseName];
  if (mapped) return { min: mapped[0], max: mapped[1] };

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
  const weight = set.weight_kg ?? 0;
  const reps   = set.reps ?? 0;
  const { min, max } = range;

  if (allHitMax) {
    return { targetWeight: weight + 2.5, targetReps: min, status: 'increase', lastReps: reps, lastWeight: weight };
  }
  if (reps >= max) {
    return { targetWeight: weight, targetReps: max, status: 'ready', lastReps: reps, lastWeight: weight };
  }
  return {
    targetWeight: weight,
    targetReps:   Math.min(reps + 1, max),
    status:       reps < min ? 'build' : 'maintain',
    lastReps: reps,
    lastWeight: weight,
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
  const overallStatus = allHitMax ? 'increase'
    : setPlans.some(p => p.status === 'build') ? 'build' : 'maintain';

  return { status: overallStatus, sets: sets.length, setPlans, allHitMax, range };
}
