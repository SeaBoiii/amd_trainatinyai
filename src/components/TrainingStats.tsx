import type { ClassLabel } from '../types';

interface TrainingStatsProps {
  labels: ClassLabel[];
  counts: Record<string, number>;
  minPerClass: number;
}

/**
 * A compact readiness summary for the training screen: total examples, how many
 * classes are ready, and an overall progress bar toward "AI ready".
 */
export default function TrainingStats({ labels, counts, minPerClass }: TrainingStatsProps) {
  const total = labels.reduce((sum, l) => sum + (counts[l.id] ?? 0), 0);
  const classesReady = labels.filter((l) => (counts[l.id] ?? 0) >= minPerClass).length;
  const progress = labels.length > 0 ? classesReady / labels.length : 0;
  const allReady = classesReady === labels.length;

  return (
    <div className="glow-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
          Training progress
        </h3>
        <span className="text-xs text-slate-400">{total} examples</span>
      </div>

      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-amd-panel2">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            allReady
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-amd-red to-amd-orange'
          }`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <p className="text-sm">
        {allReady ? (
          <span className="font-semibold text-emerald-300">
            ✓ Every class is ready — train your AI!
          </span>
        ) : (
          <span className="text-slate-300">
            {classesReady} of {labels.length} classes ready.{' '}
            <span className="text-amd-amber">
              Add at least {minPerClass} examples per class.
            </span>
          </span>
        )}
      </p>
    </div>
  );
}
