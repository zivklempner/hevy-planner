const HEVY_BASE = 'https://api.hevyapp.com/v1';
const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL || '';

function apiKey() {
  return localStorage.getItem('hevy_api_key') || '';
}

export async function getRecentWorkouts() {
  if (FUNCTIONS_BASE) {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/getWorkouts`, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const workouts = Array.isArray(data) ? data : data.workouts;
        if (workouts?.length) return { workouts, latestSync: data.latestSync ?? null };
      }
    } catch {
      // fall through
    }
  }
  return fetchAllFromHevy();
}

// Fetch ALL available pages so the history chart and insights have full data.
async function fetchAllFromHevy() {
  const headers = { 'api-key': apiKey() };

  const firstRes = await fetch(`${HEVY_BASE}/workouts?page=1&pageSize=10`, { headers });
  if (!firstRes.ok) throw new Error(`Hevy API ${firstRes.status}`);
  const firstData = await firstRes.json();

  const totalPages = Math.min(firstData.page_count || 1, 50); // hard cap at 500 workouts
  const all = [...(firstData.workouts || [])];

  for (let page = 2; page <= totalPages; page++) {
    const res = await fetch(`${HEVY_BASE}/workouts?page=${page}&pageSize=10`, { headers });
    if (!res.ok) break;
    const batch = (await res.json()).workouts || [];
    if (!batch.length) break;
    all.push(...batch);
  }

  all.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  return { workouts: all, latestSync: null };
}

export async function validateApiKey(key) {
  const res = await fetch(`${HEVY_BASE}/workouts?page=1&pageSize=1`, {
    headers: { 'api-key': key },
  });
  return res.ok;
}
