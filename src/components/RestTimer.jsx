import { useState, useEffect, useRef } from 'react';

const DURATION = 90;

export function RestTimer() {
  const [state, setState] = useState('idle'); // idle | running | done
  const [remaining, setRemaining] = useState(DURATION);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setState('done');
            navigator.vibrate?.(500);
            setTimeout(() => setState('idle'), 3000);
            return DURATION;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [state]);

  function handleTap() {
    if (state === 'running') {
      setState('idle');
      setRemaining(DURATION);
    } else if (state === 'done') {
      setState('idle');
      setRemaining(DURATION);
    } else {
      setRemaining(DURATION);
      setState('running');
    }
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = (DURATION - remaining) / DURATION;

  const bgColor =
    state === 'done'    ? 'bg-emerald-500' :
    state === 'running' ? 'bg-red-600'     :
    'bg-zinc-700';

  return (
    <button
      onClick={handleTap}
      className={`fixed bottom-6 right-4 w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center transition-colors z-50 ${bgColor}`}
      aria-label="Rest timer"
    >
      {state === 'done' ? (
        <>
          <span className="text-white text-xs font-bold leading-tight">Rest</span>
          <span className="text-white text-xs font-bold">Done!</span>
        </>
      ) : state === 'running' ? (
        <>
          <span className="text-white text-sm font-bold leading-none">
            {mins}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-white/60 text-[10px] mt-0.5">tap reset</span>
          {/* thin arc to show progress */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 64 64"
          >
            <circle
              cx="32" cy="32" r="30"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="3"
              strokeDasharray={`${progress * 188} 188`}
              strokeLinecap="round"
            />
          </svg>
        </>
      ) : (
        <>
          <span className="text-xl leading-none">⏱</span>
          <span className="text-white/70 text-[10px] mt-0.5">90s</span>
        </>
      )}
    </button>
  );
}
