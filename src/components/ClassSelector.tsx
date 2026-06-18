import type { ClassLabel } from '../types';

interface ClassSelectorProps {
  labels: ClassLabel[];
  selectedId: string;
  counts: Record<string, number>;
  onSelect: (id: string) => void;
  /** Minimum examples per class before the AI is ready. */
  minPerClass: number;
}

/**
 * The list of class buttons (e.g. Circle / Triangle / Square / Star). Shows a
 * live example count per class and highlights the active one.
 */
export default function ClassSelector({
  labels,
  selectedId,
  counts,
  onSelect,
  minPerClass,
}: ClassSelectorProps) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Choose what to teach">
      {labels.map((label) => {
        const count = counts[label.id] ?? 0;
        const ready = count >= minPerClass;
        const active = label.id === selectedId;
        return (
          <button
            key={label.id}
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(label.id)}
            className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
              active
                ? 'border-amd-orange bg-amd-orange/15 shadow-glow-orange'
                : 'border-amd-line bg-amd-panel/70 hover:border-amd-orange/50'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {label.emoji}
              </span>
              <span className="text-lg font-bold">{label.name}</span>
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold ${
                ready ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amd-panel2 text-slate-300'
              }`}
              title={`${count} example${count === 1 ? '' : 's'} taught`}
            >
              {ready && <span aria-hidden="true">✓</span>}
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
