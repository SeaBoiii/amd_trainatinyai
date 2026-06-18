import { ClassLabel } from "../types";

interface TrainingStatsProps {
  counts: Record<ClassLabel, number>;
  labels: ClassLabel[];
  minPerClass: number;
  isTrained: boolean;
}

export function TrainingStats({ counts, labels, minPerClass, isTrained }: TrainingStatsProps) {
  const total = labels.reduce((acc, label) => acc + (counts[label] ?? 0), 0);
  const ready = labels.every((label) => (counts[label] ?? 0) >= minPerClass);

  return (
    <div className="panel p-4">
      <h3 className="font-display text-xl font-semibold">Training Progress</h3>
      <p className="mt-2 text-sm text-white/80">Total examples: {total}</p>
      <p className="text-sm text-white/80">Classes trained: {labels.filter((l) => (counts[l] ?? 0) > 0).length}</p>
      <p className="mt-2 text-sm text-ember-200">
        {ready
          ? "Great coverage! Your tiny AI is ready to compare new drawings."
          : `Add at least ${minPerClass} examples for each class so your AI has something to learn from.`}
      </p>
      <p className="mt-2 text-xs text-white/60">
        Status: {isTrained ? "AI memory updated and ready for inference" : "Awaiting training update"}
      </p>
    </div>
  );
}
