import { VisitorResult } from "../types";

interface VisitorWallProps {
  entries: VisitorResult[];
  onBack: () => void;
  onClear: () => void;
}

export function VisitorWall({ entries, onBack, onClear }: VisitorWallProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-3xl font-bold">Visitor Wall</h2>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onBack}>
            Back to Start
          </button>
          <button className="rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2" onClick={onClear}>
            Clear Visitor Wall
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="panel p-6 text-white/75">No entries yet. Train a tiny AI and save your result card.</div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <div key={entry.id} className="panel grid gap-2 p-4 md:grid-cols-6 md:items-center">
              <p className="font-semibold">{entry.nickname}</p>
              <p>{entry.missionName}</p>
              <p>{entry.examplesTaught} examples</p>
              <p>{entry.accuracy.toFixed(1)}% accuracy</p>
              <p>{entry.careerMatch}</p>
              <p className="text-xs text-white/60">{new Date(entry.dateIso).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
