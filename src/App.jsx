import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
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

  useEffect(() => {
    if (nextSplit && !selectedTab) setSelectedTab(nextSplit);
  }, [nextSplit]);

  const { exercises, history, repRanges, lastSession } = useSplitData(workouts, selectedTab || '');

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

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  // All tabs including Insights at end
  const allTabs = [...uniqueSplits, 'Insights'];
  const isInsights = selectedTab === 'Insights';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* ── Update banner (shown when a new service worker is waiting) ── */}
      {needRefresh && (
        <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
          <div className="bg-blue-600 text-white text-sm rounded-full px-5 py-2.5 shadow-xl flex items-center gap-3">
            <span>Update available</span>
            <button
              onClick={() => updateServiceWorker(true)}
              className="font-bold underline"
            >Reload</button>
          </div>
        </div>
      )}

      {/* ── Header — pt-safe pushes content below iPhone status bar ── */}
      {/* pt-safe pads below the iPhone status bar; inner div is the visible 56px row */}
      <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 shrink-0 pt-safe">
        <div className="h-14 px-4 md:px-8 flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight">Hevy Planner</h1>
          <div className="flex items-center gap-3">
            {syncLabel() && (
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${effectiveSyncMin < 30 ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                {loading ? 'Syncing…' : syncLabel()}
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="text-zinc-500 hover:text-zinc-200 text-lg leading-none transition-colors p-2 -mr-2"
              aria-label="Settings"
            >⚙</button>
          </div>
        </div>
      </header>

      {/* ── Body row ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-zinc-800 overflow-y-auto">
          <nav className="py-4 space-y-0.5">
            {uniqueSplits.map(tab => (
              <SidebarButton
                key={tab}
                label={tab}
                active={selectedTab === tab}
                isNext={tab === nextSplit}
                onClick={() => setSelectedTab(tab)}
              />
            ))}
            <div className="mx-4 my-3 border-t border-zinc-800" />
            <SidebarButton
              label="Insights"
              active={selectedTab === 'Insights'}
              onClick={() => setSelectedTab('Insights')}
              icon="✦"
            />
          </nav>

          {/* Workout count */}
          {workouts.length > 0 && (
            <p className="mt-auto px-4 pb-4 text-[10px] text-zinc-600">
              {workouts.length} workouts loaded
            </p>
          )}
        </aside>

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Mobile tab bar */}
          <div className="md:hidden shrink-0">
            <SplitTabs
              splits={allTabs}
              selected={selectedTab}
              nextSplit={nextSplit}
              onSelect={setSelectedTab}
            />
          </div>

          {/* Main scrollable content */}
          <main className="flex-1 overflow-y-auto">
            {loading && workouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-zinc-500 text-sm">Loading all workouts…</p>
              </div>
            ) : error ? (
              <div className="p-6 space-y-2">
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={refresh} className="text-xs text-zinc-400 underline">Retry</button>
              </div>
            ) : isInsights ? (
              <InsightsTab workouts={workouts} />
            ) : (
              <>
                <SummaryBar exercises={exercises} repRanges={repRanges} />
              {lastSession && <LastSessionBanner session={lastSession} />}
                <div className="px-4 md:px-6 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  {exercises.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center col-span-full py-10">
                      {selectedTab ? `No data found for "${selectedTab}"` : 'Pick a split on the left'}
                    </p>
                  ) : (
                    exercises.map((ex, i) => (
                      <ExerciseCard
                        key={`${ex.title}-${i}`}
                        exercise={ex}
                        history={history[ex.title] || []}
                        repRange={repRanges[ex.title]}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <RestTimer />
    </div>
  );
}

function fmtTimeAgo(dateStr) {
  const diffMs   = Date.now() - new Date(dateStr);
  const diffMins  = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins  < 60)  return `${diffMins}m ago`;
  if (diffHours < 24)  return `${diffHours}h ago`;
  if (diffDays  === 1) return 'Yesterday';
  if (diffDays  < 7)   return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtDuration(mins) {
  if (!mins) return null;
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`.trim();
}

function LastSessionBanner({ session }) {
  const parts = [
    fmtTimeAgo(session.date),
    fmtDuration(session.durationMins),
    session.exerciseCount ? `${session.exerciseCount} exercises` : null,
  ].filter(Boolean);

  return (
    <div className="px-4 md:px-6 pb-2">
      <p className="text-xs text-zinc-500">
        <span className="text-zinc-600">Last session:</span>{' '}
        {parts.join(' · ')}
      </p>
    </div>
  );
}

function SidebarButton({ label, active, isNext, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-lg mx-0',
        active
          ? 'bg-zinc-800 text-white font-semibold'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50',
      ].join(' ')}
    >
      {isNext && !active && <span className="text-emerald-400 text-xs">✦</span>}
      {icon && !isNext && <span className="text-zinc-500 text-xs">{icon}</span>}
      {label}
    </button>
  );
}
