// Mobile-only horizontal tab bar. Receives full tab list (including Insights) from App.
export function SplitTabs({ splits, selected, nextSplit, onSelect }) {
  return (
    <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-zinc-800 no-scrollbar">
      {splits.map(tab => {
        const isNext = tab === nextSplit;
        const isSelected = tab === selected;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={[
              'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0',
              isSelected
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700',
              isNext && !isSelected ? 'ring-2 ring-emerald-500' : '',
            ].join(' ')}
          >
            {isNext && !isSelected ? '✦ ' : ''}{tab}
          </button>
        );
      })}
    </div>
  );
}
