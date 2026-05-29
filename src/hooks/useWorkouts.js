import { useState, useEffect, useCallback } from 'react';
import { getRecentWorkouts } from '../api/hevy';

export function useWorkouts(apiKey) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [firebaseSync, setFirebaseSync] = useState(null);

  const refresh = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const { workouts: data, latestSync } = await getRecentWorkouts();
      setWorkouts(data);
      setLastSync(Date.now());
      if (latestSync) setFirebaseSync(latestSync);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => { refresh(); }, [refresh]);

  // Detect splits from all workouts, preserve insertion order (newest first)
  const uniqueSplits = [];
  const seen = new Set();
  for (const w of workouts) {
    if (w.title && !seen.has(w.title)) {
      seen.add(w.title);
      uniqueSplits.push(w.title);
    }
  }

  // Next split = the one whose most-recent workout is oldest
  const splitLastDone = {};
  for (const w of workouts) {
    if (w.title && !splitLastDone[w.title]) {
      splitLastDone[w.title] = new Date(w.start_time);
    }
  }
  const nextSplit = [...uniqueSplits].sort(
    (a, b) => (splitLastDone[a] || 0) - (splitLastDone[b] || 0)
  )[0] || null;

  return { workouts, loading, error, lastSync, firebaseSync, refresh, uniqueSplits, nextSplit };
}

/**
 * Given all workouts and a split name, return:
 *   - exercises: from the most recent workout of that split
 *   - history:   { [exerciseName]: [{date, avgWeight, avgReps}] } across all sessions
 */
export function useSplitData(workouts, split) {
  const splitWorkouts = workouts
    .filter(w => w.title === split)
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  const exercises = splitWorkouts[0]?.exercises || [];

  const history = {};
  for (const workout of splitWorkouts) {
    for (const ex of workout.exercises || []) {
      const normalSets = (ex.sets || []).filter(s => s.set_type === 'normal');
      if (!normalSets.length) continue;
      const avgWeight = normalSets.reduce((s, set) => s + (set.weight_kg ?? 0), 0) / normalSets.length;
      const avgReps = normalSets.reduce((s, set) => s + set.reps, 0) / normalSets.length;
      if (!history[ex.title]) history[ex.title] = [];
      history[ex.title].push({
        date: workout.start_time,
        avgWeight: +avgWeight.toFixed(1),
        avgReps: +avgReps.toFixed(1),
      });
    }
  }
  for (const name of Object.keys(history)) {
    history[name].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return { exercises, history };
}
