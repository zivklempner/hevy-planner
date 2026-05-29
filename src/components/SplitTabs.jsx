export function SplitTabs({ splits, selected, nextSplit, onSelect }) {
  const tabs = [...splits, 'Insights'];

  return (
    <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-zinc-800 no-scrollbar shrink-0">
      {tabs.map(tab => {
        const isNext = tab === nextSplit;
        const isSelected = tab === selected;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={[
              'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              isSelected
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700',
              isNext && !isSelected ? 'ring-2 ring-emerald-500' : '',
            ].join(' ')}
          >
            {tab}
            {isNext ? ' ✦' : ''}
          </button>
        );
      })}
    </div>
  );
}
