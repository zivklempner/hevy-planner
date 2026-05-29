import { useState, useEffect } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { SplitTabs } from './components/SplitTabs';
import { ExerciseCard } from './components/ExerciseCard';
import { RestTimer } from './components/RestTimer';
import { SummaryBar } from './components/SummaryBar';
import { InsightsTab } from './components/InsightsTab';
import { useWorkouts, useSplitData } from './hooks/useWorkouts';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('hevy_api_key') || '');
  const [selectedTab, setSelectedTab] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { workouts, loading, error, lastSync, firebaseSync, refresh, uniqueSplits, nextSplit } =
    useWorkouts(apiKey);

  // Auto-select next split on first load
  useEffect(() => {
    if (nextSplit && !selectedTab) setSelectedTab(nextSplit);
  }, [nextSplit]);

  const { exercises, history } = useSplitData(workouts, selectedTab || '');

  if (!apiKey || showSettings) {
    return (
      <SetupScreen
        existing={showSettings ? apiKey : undefined}
        onSave={key => { setApiKey(key); setShowSettings(false); }}
      />
    );
  }

  const syncAgoMin = lastSync ? Math.floor((Date.now() - lastSync) / 60000) : null;
  const fbSyncAgoMin = firebaseSync ? Math.floor((Date.now() - firebaseSync) / 60000) : null;
  const effectiveSyncMin = fbSyncAgoMin ?? syncAgoMin;

  function syncLabel() {
    if (effectiveSyncMin === null) return null;
    if (effectiveSyncMin < 1) return 'just now';
    if (effectiveSyncMin < 60) return `${effectiveSyncMin}m ago`;
    return `${Math.floor(effectiveSyncMin / 60)}h ago`;
  }

  const allTabs = [...uniqueSplits];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col">

        {/* Header */}
        <header className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <h1 className="text-lg font-bold tracking-tight">Hevy Planner</h1>
          <div className="flex items-center gap-3">
            {syncLabel() && (
              <button
                onClick={refresh}
                className="flex items-center gap-1.5 text-xs text-zinc-400 active:text-zinc-200"
                disabled={loading}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    effectiveSyncMin < 30 ? 'bg-emerald-500' : 'bg-zinc-500'
                  }`}
                />
                {loading ? 'Syncing…' : syncLabel()}
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="text-zinc-500 active:text-zinc-200 text-lg leading-none"
              aria-label="Settings"
            >
              ⚙
            </button>
          </div>
        </header>

        {/* Split tabs */}
        {allTabs.length > 0 && (
          <SplitTabs
            splits={allTabs}
            selected={selectedTab}
            nextSplit={nextSplit}
            onSelect={setSelectedTab}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {loading && workouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Fetching workouts…</p>
            </div>
          ) : error ? (
            <div className="p-4 space-y-2">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={refresh} className="text-xs text-zinc-400 underline">
                Retry
              </button>
            </div>
          ) : selectedTab === 'Insights' ? (
            <InsightsTab workouts={workouts} />
          ) : (
            <div className="pb-28">
              <SummaryBar exercises={exercises} />
              <div className="px-4 space-y-3">
                {exercises.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-10">
                    {selectedTab
                      ? `No workout data found for "${selectedTab}"`
                      : 'Select a split above'}
                  </p>
                ) : (
                  exercises.map((ex, i) => (
                    <ExerciseCard
                      key={`${ex.title}-${i}`}
                      exercise={ex}
                      history={history[ex.title] || []}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        <RestTimer />
      </div>
    </div>
  );
}
