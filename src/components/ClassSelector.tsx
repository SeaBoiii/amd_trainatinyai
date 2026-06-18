import { ClassLabel } from "../types";

interface ClassSelectorProps {
  labels: ClassLabel[];
  selected: ClassLabel;
  counts: Record<ClassLabel, number>;
  onSelect: (label: ClassLabel) => void;
}

export function ClassSelector({ labels, selected, counts, onSelect }: ClassSelectorProps) {
  return (
    <div className="panel p-4">
      <h3 className="font-display text-xl font-semibold">Class Labels</h3>
      <p className="mt-1 text-sm text-white/70">Pick one label, draw it, then add as example.</p>
      <div className="mt-3 grid gap-2">
        {labels.map((label) => {
          const isSelected = selected === label;
          return (
            <button
              key={label}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-ember-200 bg-ember-500/20 text-white"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => onSelect(label)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{label}</span>
                <span className="rounded-full bg-black/30 px-2 py-1 text-xs">{counts[label] ?? 0} examples</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
