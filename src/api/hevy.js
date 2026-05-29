const HEVY_BASE = 'https://api.hevyapp.com/v1';
const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL || '';

function apiKey() {
  return localStorage.getItem('hevy_api_key') || '';
}

/**
 * Fetch workouts: tries Cloud Function cache first, falls back to direct Hevy API.
 * Returns { workouts: [...], latestSync: timestamp|null }
 */
export async function getRecentWorkouts() {
  if (FUNCTIONS_BASE) {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/getWorkouts`, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const workouts = Array.isArray(data) ? data : data.workouts;
        if (workouts?.length) {
          return { workouts, latestSync: data.latestSync ?? null };
        }
      }
    } catch {
      // fall through to direct API
    }
  }

  return fetchFromHevy();
}

async function fetchFromHevy(maxPages = 9) {
  const key = apiKey();
  const allWorkouts = [];

  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(
      `${HEVY_BASE}/workouts?page=${page}&pageSize=10`,
      { headers: { 'api-key': key } }
    );
    if (!res.ok) throw new Error(`Hevy API ${res.status}`);
    const json = await res.json();
    const batch = json.workouts || json || [];
    allWorkouts.push(...batch);
    if (batch.length < 10) break;
  }

  // Ensure newest-first order
  allWorkouts.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  return { workouts: allWorkouts, latestSync: null };
}

export async function validateApiKey(key) {
  const res = await fetch(`${HEVY_BASE}/workouts?page=1&pageSize=1`, {
    headers: { 'api-key': key },
  });
  return res.ok;
}
