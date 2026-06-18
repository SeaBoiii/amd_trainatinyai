import { useMemo, useState } from 'react';
import type { CareerMatch, Mission, SessionStats } from '../types';
import { matchCareer } from '../data/careers';
import { AICore } from './ui';

interface ResultCardProps {
  mission: Mission;
  stats: SessionStats;
  bestPredictionName: string;
  onSave: (nickname: string, career: CareerMatch) => void;
  onVisitorWall: () => void;
  onReset: () => void;
  saved: boolean;
}

/**
 * Fun "Tiny AI Trainer" result card. The visitor enters a nickname, sees their
 * career match (derived from how they used the activity), and saves to the wall.
 */
export default function ResultCard({
  mission,
  stats,
  bestPredictionName,
  onSave,
  onVisitorWall,
  onReset,
  saved,
}: ResultCardProps) {
  const [nickname, setNickname] = useState('');
  const career = useMemo(() => matchCareer(stats), [stats]);
  const accuracyPct = stats.predictionsMade > 0 ? Math.round(stats.accuracy * 100) : 0;

  const handleSave = () => {
    const name = nickname.trim() || 'Anonymous Trainer';
    onSave(name, career);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="glow-card animate-fadeUp relative overflow-hidden rounded-3xl p-6 sm:p-8">
        {/* Glow accents */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-amd-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-amd-red/20 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-2">
            <AICore size={110} active />
          </div>
          <span className="rounded-full bg-gradient-to-r from-amd-red to-amd-orange px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Tiny AI Trainer
          </span>

          {/* Nickname */}
          {!saved ? (
            <div className="mt-4 w-full max-w-sm">
              <label htmlFor="nickname" className="mb-1 block text-sm font-semibold text-slate-300">
                Enter your nickname
              </label>
              <input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="e.g. Maya"
                className="w-full rounded-xl border border-amd-line bg-amd-panel2 px-4 py-3 text-center text-xl font-bold outline-none focus:border-amd-orange"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
            </div>
          ) : (
            <h3 className="mt-3 text-3xl font-black text-gradient">
              {nickname.trim() || 'Anonymous Trainer'}
            </h3>
          )}

          {/* Stat rows */}
          <div className="mt-5 w-full max-w-sm divide-y divide-amd-line/70 rounded-2xl border border-amd-line bg-amd-panel/60 text-left">
            <Row label="Mission" value={`${mission.emoji} ${mission.name}`} />
            <Row label="Examples taught" value={`${stats.totalExamples}`} />
            <Row label="Best prediction" value={bestPredictionName || '—'} />
            <Row label="Accuracy" value={`${accuracyPct}%`} highlight />
          </div>

          {/* Career match */}
          <div className="mt-5 w-full max-w-sm rounded-2xl border border-amd-orange/40 bg-gradient-to-br from-amd-red/10 to-amd-orange/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Career match
            </p>
            <p className="mt-1 text-2xl font-black">
              {career.emoji} <span className="text-gradient">{career.title}</span>
            </p>
            <p className="mt-1 text-sm text-slate-200">{career.blurb}</p>
          </div>

          <p className="mt-5 max-w-sm text-sm text-slate-300">
            You taught an AI using examples. That is the same basic idea behind many real-world AI
            systems. 🎉
          </p>

          {/* Actions */}
          <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
            {!saved ? (
              <button onClick={handleSave} className="btn-primary rounded-2xl py-4 text-lg">
                💾 Save to Visitor Wall
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200">
                ✓ Saved! Added to the Visitor Wall.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onVisitorWall} className="btn-ghost rounded-2xl py-3">
                🏆 Visitor Wall
              </button>
              <button onClick={onReset} className="btn-ghost rounded-2xl py-3">
                🔄 Next Visitor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-base font-bold ${highlight ? 'text-amd-amber' : ''}`}>{value}</span>
    </div>
  );
}
