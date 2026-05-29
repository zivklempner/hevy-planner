const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

initializeApp();

// POST /hevyWebhook — called by Hevy when a workout is finished
exports.hevyWebhook = onRequest(
  { timeoutSeconds: 30, memory: '256MiB' },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();

    const { workout_id } = req.body;
    if (!workout_id) return res.status(400).json({ error: 'Missing workout_id' });

    const apiKey = process.env.HEVY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'HEVY_API_KEY not set' });

    let workout;
    try {
      const r = await fetch(`https://api.hevyapp.com/v1/workouts/${workout_id}`, {
        headers: { 'api-key': apiKey },
      });
      if (!r.ok) return res.status(502).json({ error: `Hevy API ${r.status}` });
      workout = await r.json();
    } catch (e) {
      return res.status(502).json({ error: e.message });
    }

    const db = getDatabase();
    await db.ref(`workouts/${workout_id}`).set(workout);
    await db.ref('meta/latest_sync').set(Date.now());

    res.status(200).json({ ok: true });
  }
);

// GET /getWorkouts — called by React app to fetch cached workouts
exports.getWorkouts = onRequest(
  { timeoutSeconds: 10, memory: '256MiB' },
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const db = getDatabase();
    const [workoutsSnap, metaSnap] = await Promise.all([
      db.ref('workouts').orderByChild('start_time').limitToLast(90).once('value'),
      db.ref('meta/latest_sync').once('value'),
    ]);

    const workouts = [];
    workoutsSnap.forEach(child => workouts.unshift(child.val()));

    res.json({ workouts, latestSync: metaSnap.val() });
  }
);
