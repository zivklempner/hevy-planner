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
  'Zottman Curl': ['Dumbbell Curl', 'Hammer Curl', 'Reverse Curl'],
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

// Epley estimated 1-rep max — combines weight + reps into one score.
function est1RM(weight, reps) {
  if (!reps || !weight) return 0;
  return weight * (1 + reps / 30);
}

function isNormal(s) {
  return s.type === 'normal' || s.set_type === 'normal';
}

/**
 * Analyse workouts and return three insight buckets.
 * All progress is measured via estimated 1RM so that trading weight for reps
 * (e.g. dropping 1 kg while gaining 2 reps) doesn't incorrectly look like decline.
 *
 * Thresholds:
 *   improvers  e1RM improved > 5%   (first → last session, min 3 sessions)
 *   stuck      e1RM variation < 3%  across last 4+ sessions
 *   declining  e1RM dropped  > 5%   (first → last session, min 3 sessions)
 */
export function computeInsights(workouts, daysBack = 90) {
  const cutoff = new Date(Date.now() - daysBack * 86400000);
  const recent = workouts.filter(w => new Date(w.start_time) >= cutoff);

  // Build per-exercise session arrays
  const byExercise = {};
  for (const workout of recent) {
    for (const exercise of workout.exercises || []) {
      const name = exercise.title;
      const sets = (exercise.sets || []).filter(isNormal);
      if (!sets.length) continue;
      const avgWeight = sets.reduce((s, x) => s + (x.weight_kg ?? 0), 0) / sets.length;
      const avgReps   = sets.reduce((s, x) => s + x.reps, 0) / sets.length;
      if (!byExercise[name]) byExercise[name] = [];
      byExercise[name].push({
        date: workout.start_time,
        avgWeight,
        avgReps,
        e1rm: est1RM(avgWeight, avgReps),
      });
    }
  }

  const improvers = [];
  const stuck = [];
  const declining = [];

  for (const [name, sessions] of Object.entries(byExercise)) {
    if (sessions.length < 3) continue;
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const first = sessions[0];
    const last  = sessions[sessions.length - 1];

    const e1rmPct    = first.e1rm > 0 ? ((last.e1rm - first.e1rm) / first.e1rm) * 100 : 0;
    const weightPct  = first.avgWeight > 0 ? ((last.avgWeight - first.avgWeight) / first.avgWeight) * 100 : 0;
    const repsDelta  = last.avgReps - first.avgReps;

    // Stuck: last 4+ sessions with < 3% e1RM spread
    if (sessions.length >= 4) {
      const tail  = sessions.slice(-4).map(s => s.e1rm);
      const hi    = Math.max(...tail);
      const lo    = Math.min(...tail);
      const spread = hi > 0 ? ((hi - lo) / hi) * 100 : 0;
      if (spread < 3) {
        stuck.push({
          name,
          currentWeight:  +last.avgWeight.toFixed(1),
          currentReps:    +last.avgReps.toFixed(1),
          currentE1rm:    +last.e1rm.toFixed(1),
          sessionCount:   sessions.length,
          alternatives:   ALTERNATIVES[name] || [],
        });
      }
    }

    if (e1rmPct >= 5) {
      improvers.push({
        name,
        firstWeight: +first.avgWeight.toFixed(1),
        lastWeight:  +last.avgWeight.toFixed(1),
        firstE1rm:   +first.e1rm.toFixed(1),
        lastE1rm:    +last.e1rm.toFixed(1),
        sessionCount: sessions.length,
        e1rmPct:     +e1rmPct.toFixed(1),
        weightPct:   +weightPct.toFixed(1),
        repsDelta:   +repsDelta.toFixed(1),
      });
    } else if (e1rmPct < -5) {
      // Characterise the decline so the UI can give context
      const weightDown = weightPct < -2;
      const repsDown   = repsDelta < -0.5;
      const repsUp     = repsDelta >  0.5;

      let interpretation;
      if (weightDown && repsUp) {
        interpretation = 'Weight reduced while reps increased — likely a technique reset or form focus. Worth monitoring but not alarming.';
      } else if (weightDown && repsDown) {
        interpretation = 'Both weight and reps declined. Consider a deload week or review sleep and recovery.';
      } else {
        interpretation = 'Rep fatigue — normal variation. Watch next 2–3 sessions before acting.';
      }

      declining.push({
        name,
        firstWeight:  +first.avgWeight.toFixed(1),
        lastWeight:   +last.avgWeight.toFixed(1),
        firstE1rm:    +first.e1rm.toFixed(1),
        lastE1rm:     +last.e1rm.toFixed(1),
        sessionCount: sessions.length,
        e1rmPct:      +e1rmPct.toFixed(1),
        interpretation,
      });
    }
  }

  improvers.sort((a, b) => b.e1rmPct - a.e1rmPct);
  declining.sort((a, b) => a.e1rmPct - b.e1rmPct); // worst first

  return { improvers: improvers.slice(0, 6), stuck, declining };
}
