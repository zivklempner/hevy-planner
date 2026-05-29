export const ALTERNATIVES = {
  'Shoulder Press (Dumbbell)': ['Arnold Press', 'Landmine Press', 'Z-Press'],
  'Overhead Press': ['Push Press', 'Arnold Press', 'Dumbbell Shoulder Press'],
  'Overhead Press (Barbell)': ['Push Press', 'Arnold Press', 'Seated Dumbbell Press'],
  'Single Leg Extensions': ['Bulgarian Split Squat', 'Sissy Squat', 'Step-up'],
  'Leg Extension': ['Bulgarian Split Squat', 'Sissy Squat', 'Terminal Knee Extension'],
  'Bench Press': ['Dumbbell Bench Press', 'Cable Fly', 'Weighted Push-up'],
  'Barbell Bench Press': ['Dumbbell Bench Press', 'Cable Fly', 'Weighted Push-up'],
  'Incline Bench Press': ['Incline Dumbbell Press', 'Cable Incline Fly', 'Landmine Press'],
  'Preacher Curl': ['Incline Dumbbell Curl', 'Spider Curl', 'Cable Curl'],
  'Bicep Curl': ['Hammer Curl', 'Incline Curl', 'Cable Curl'],
  'Barbell Bicep Curl': ['Hammer Curl', 'Incline Curl', 'Spider Curl'],
  'Dumbbell Bicep Curl': ['Hammer Curl', 'Concentration Curl', 'Cable Curl'],
  'Tricep Pushdown': ['Skull Crusher', 'Close-Grip Bench Press', 'Overhead Tricep Extension'],
  'Skull Crusher': ['Tricep Pushdown', 'Close-Grip Bench Press', 'Dumbbell Tricep Extension'],
  'Lateral Raise': ['Cable Lateral Raise', 'Upright Row', 'Face Pull'],
  'Lateral Raise (Dumbbell)': ['Cable Lateral Raise', 'Machine Lateral Raise', 'Upright Row'],
  'Barbell Squat': ['Hack Squat', 'Leg Press', 'Bulgarian Split Squat'],
  'Deadlift': ['Romanian Deadlift', 'Trap Bar Deadlift', 'Good Morning'],
  'Romanian Deadlift': ['Nordic Curl', 'Good Morning', 'Glute Ham Raise'],
  'Pull-up': ['Lat Pulldown', 'Assisted Pull-up', 'Seated Cable Row'],
  'Lat Pulldown': ['Pull-up', 'Seated Cable Row', 'Single-Arm Pulldown'],
  'Barbell Row': ['Dumbbell Row', 'Seated Cable Row', 'T-Bar Row'],
  'Dumbbell Row': ['Barbell Row', 'Seated Cable Row', 'T-Bar Row'],
  'Iso-Lateral Row (Machine)': ['Dumbbell Row', 'Seated Cable Row', 'T-Bar Row'],
  'Chest Fly': ['Cable Fly', 'Dumbbell Bench Press', 'Wide Push-up'],
  'Calf Raise': ['Seated Calf Raise', 'Leg Press Calf Raise', 'Single-Leg Calf Raise'],
  'Face Pull': ['Rear Delt Fly', 'Band Pull Apart', 'Reverse Pec Deck'],
  'Hip Thrust': ['Glute Bridge', 'Cable Pull Through', 'Single-Leg Hip Thrust'],
  'Leg Curl': ['Romanian Deadlift', 'Nordic Curl', 'Swiss Ball Leg Curl'],
  'Leg Press': ['Hack Squat', 'Bulgarian Split Squat', 'Barbell Squat'],
  'Hanging Leg Raise': ['Cable Crunch', 'Ab Wheel Rollout', 'Dragon Flag'],
};

/**
 * Analyse workout history and return three insight buckets:
 *   improvers — top 6 exercises by % weight gain (min 3 sessions)
 *   stuck     — exercises where last 4+ sessions have < 1 kg weight variation
 *   declining — exercises with > 5% weight decrease first → last
 */
export function computeInsights(workouts, daysBack = 90) {
  const cutoff = new Date(Date.now() - daysBack * 86400000);
  const recent = workouts.filter(w => new Date(w.start_time) >= cutoff);

  // Build per-exercise session arrays: [{date, avgWeight, avgReps}]
  const byExercise = {};
  for (const workout of recent) {
    for (const exercise of workout.exercises || []) {
      const name = exercise.title;
      const normalSets = (exercise.sets || []).filter(s => s.type === 'normal' || s.set_type === 'normal');
      if (!normalSets.length) continue;
      const avgWeight = normalSets.reduce((s, set) => s + (set.weight_kg ?? 0), 0) / normalSets.length;
      const avgReps = normalSets.reduce((s, set) => s + set.reps, 0) / normalSets.length;
      if (!byExercise[name]) byExercise[name] = [];
      byExercise[name].push({ date: workout.start_time, avgWeight, avgReps });
    }
  }

  const improvers = [];
  const stuck = [];
  const declining = [];

  for (const [name, sessions] of Object.entries(byExercise)) {
    if (sessions.length < 3) continue;
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const first = sessions[0];
    const last = sessions[sessions.length - 1];
    const pctChange = first.avgWeight > 0
      ? ((last.avgWeight - first.avgWeight) / first.avgWeight) * 100
      : 0;

    // Stuck: last 4+ sessions with < 1 kg variation
    if (sessions.length >= 4) {
      const tail = sessions.slice(-4).map(s => s.avgWeight);
      const variation = Math.max(...tail) - Math.min(...tail);
      if (variation < 1) {
        stuck.push({
          name,
          currentWeight: +last.avgWeight.toFixed(1),
          sessionCount: sessions.length,
          alternatives: ALTERNATIVES[name] || [],
        });
      }
    }

    if (pctChange >= 5) {
      improvers.push({
        name,
        firstWeight: +first.avgWeight.toFixed(1),
        lastWeight: +last.avgWeight.toFixed(1),
        sessionCount: sessions.length,
        pctChange: +pctChange.toFixed(1),
      });
    } else if (pctChange < -5) {
      declining.push({
        name,
        firstWeight: +first.avgWeight.toFixed(1),
        lastWeight: +last.avgWeight.toFixed(1),
        sessionCount: sessions.length,
        pctChange: +pctChange.toFixed(1),
      });
    }
  }

  improvers.sort((a, b) => b.pctChange - a.pctChange);

  return { improvers: improvers.slice(0, 6), stuck, declining };
}
