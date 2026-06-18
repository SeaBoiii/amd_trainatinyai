import { useEffect, useState } from 'react';
import type { VisitorResult } from '../types';
import { clearVisitorWall, loadVisitorWall } from '../utils/storage';

interface VisitorWallProps {
  onStart: () => void;
  onHome: () => void;
}

/** Leaderboard / wall of saved visitor results from localStorage. */
export default function VisitorWall({ onStart, onHome }: VisitorWallProps) {
  const [entries, setEntries] = useState<VisitorResult[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setEntries(loadVisitorWall());
  }, []);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearVisitorWall();
    setEntries([]);
    setConfirmClear(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="text-4xl">🏆</span>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">
          Visitor <span className="text-gradient">Wall</span>
        </h2>
        <p className="mt-2 text-slate-300">
          Everyone who trained a Tiny AI at this booth. Can you beat their accuracy?
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="glow-card rounded-2xl p-10 text-center">
          <div className="mb-3 text-5xl">🤖</div>
          <p className="text-slate-300">
            No trainers yet. Be the first to teach an AI and save your result!
          </p>
          <button onClick={onStart} className="btn-primary mt-5 rounded-2xl px-6 py-3 text-lg">
            🚀 Start Training
          </button>
        </div>
      ) : (
        <div className="glow-card overflow-hidden rounded-2xl">
          {/* Header row (hidden on small screens) */}
          <div className="hidden grid-cols-[40px_1.4fr_1.2fr_0.8fr_0.8fr_1.4fr] gap-2 border-b border-amd-line bg-amd-panel2/70 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 sm:grid">
            <span>#</span>
            <span>Trainer</span>
            <span>Mission</span>
            <span className="text-center">Examples</span>
            <span className="text-center">Accuracy</span>
            <span>Career match</span>
          </div>

          <ul className="divide-y divide-amd-line/70">
            {entries.map((e, i) => (
              <li
                key={e.id}
                className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-[40px_1.4fr_1.2fr_0.8fr_0.8fr_1.4fr] sm:items-center"
              >
                <span className="hidden text-lg font-black text-amd-amber sm:block">{i + 1}</span>

                <span className="col-span-2 flex items-center justify-between sm:col-span-1 sm:block">
                  <span className="text-base font-extrabold">
                    <span className="mr-1 text-amd-amber sm:hidden">#{i + 1}</span>
                    {e.nickname}
                  </span>
                  <span className="text-xs text-slate-500 sm:hidden">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </span>

                <span className="text-sm text-slate-300">{e.missionName}</span>

                <span className="text-sm sm:text-center">
                  <span className="text-slate-500 sm:hidden">Examples: </span>
                  <span className="font-bold">{e.examplesTaught}</span>
                </span>

                <span className="text-sm sm:text-center">
                  <span className="text-slate-500 sm:hidden">Accuracy: </span>
                  <span className="font-bold text-amd-amber">{e.accuracy}%</span>
                </span>

                <span className="text-sm">
                  {e.careerEmoji} {e.careerTitle}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button onClick={onHome} className="btn-ghost rounded-2xl px-6 py-3 text-base">
          ← Back to start
        </button>
        <button onClick={onStart} className="btn-primary rounded-2xl px-6 py-3 text-base">
          🚀 Train a Tiny AI
        </button>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className={`rounded-2xl px-6 py-3 text-base font-bold transition ${
              confirmClear
                ? 'bg-amd-red text-white'
                : 'border border-amd-line bg-amd-panel/60 text-slate-300 hover:border-amd-red/60'
            }`}
          >
            {confirmClear ? 'Tap again to confirm clear' : '🗑 Clear visitor wall'}
          </button>
        )}
      </div>
    </div>
  );
}
