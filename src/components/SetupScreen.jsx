import { useState } from 'react';
import { validateApiKey } from '../api/hevy';

const DEFAULT_KEY = '8ee43f57-a586-4233-860e-9ec1f1023cf5';

export function SetupScreen({ onSave, existing }) {
  const [key, setKey] = useState(existing || DEFAULT_KEY);
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!key.trim()) { setErr('Paste your Hevy API key above.'); return; }
    setChecking(true);
    setErr('');
    try {
      const ok = await validateApiKey(key.trim());
      if (!ok) { setErr('Key rejected by Hevy — double-check it.'); return; }
      localStorage.setItem('hevy_api_key', key.trim());
      onSave(key.trim());
    } catch {
      setErr('Could not reach Hevy API. Check your connection and try again.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🏋️</div>
          <h1 className="text-2xl font-bold text-white">Hevy Planner</h1>
          <p className="text-sm text-zinc-400">Connect your Hevy account to get started</p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">Hevy API Key</label>
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Paste your API key…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="text-xs text-zinc-500">
            Find it at{' '}
            <span className="text-zinc-300">app.hevyapp.com → Profile → API</span>
          </p>
          {err && <p className="text-xs text-red-400">{err}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={checking}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {checking ? 'Checking…' : existing ? 'Save New Key' : 'Connect Hevy'}
        </button>

        {/* Webhook instructions (shown only on first setup) */}
        {!existing && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-300">Optional: Auto-sync via Webhook</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              After deploying the Cloud Function, go to{' '}
              <span className="text-zinc-300">app.hevyapp.com → Settings → API &amp; Webhooks</span>{' '}
              and set your webhook URL to:
            </p>
            <p className="text-xs text-blue-400 font-mono break-all">
              {import.meta.env.VITE_FUNCTIONS_BASE_URL
                ? `${import.meta.env.VITE_FUNCTIONS_BASE_URL}/hevyWebhook`
                : 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/hevyWebhook'}
            </p>
            <p className="text-xs text-zinc-500">
              Finishing a workout in Hevy will then instantly sync to this app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
