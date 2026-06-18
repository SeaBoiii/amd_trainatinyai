import { useEffect, useState } from 'react';
import { HARDWARE_CONCEPTS, RACE_CONCEPTS } from '../data/hardwareConcepts';

interface HardwarePowerScreenProps {
  onComputeSign: () => void;
  onResultCard: () => void;
}

/**
 * Explains, in beginner terms, how CPUs, GPUs, NPUs, memory and storage help AI.
 * Includes the interactive "AI Workload Race" — animated conceptual bars (not a
 * benchmark) the visitor can replay.
 */
export default function HardwarePowerScreen({
  onComputeSign,
  onResultCard,
}: HardwarePowerScreenProps) {
  const [raceKey, setRaceKey] = useState(0);
  const [running, setRunning] = useState(false);

  // Kick off the race automatically when the screen mounts.
  useEffect(() => {
    const id = setTimeout(() => setRunning(true), 250);
    return () => clearTimeout(id);
  }, []);

  const runRace = () => {
    setRunning(false);
    setRaceKey((k) => k + 1);
    setTimeout(() => setRunning(true), 60);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 text-center">
        <span className="inline-block rounded-full border border-amd-line bg-amd-panel/70 px-3 py-1 text-xs font-semibold text-amd-amber">
          AMD-inspired · educational
        </span>
        <h2 className="mt-3 text-3xl font-black sm:text-4xl">
          AI Needs <span className="text-gradient">Hardware</span>
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-300">
          When you tested your example, the AI compared <em>many numbers</em>. GPUs and NPUs are
          useful because AI often needs lots of calculations at once.
        </p>
      </div>

      {/* AI Workload Race */}
      <div className="glow-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">🏁 AI Workload Race</h3>
          <button onClick={runRace} className="btn-ghost rounded-xl px-4 py-2 text-sm">
            ▶ Replay
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {RACE_CONCEPTS.map((c, i) => (
            <div key={c.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold">
                  {c.emoji} {c.name}
                </span>
                <span className="text-slate-400">{c.raceRole}</span>
              </div>
              <div className="h-5 w-full overflow-hidden rounded-full bg-amd-panel2">
                <div
                  key={`${raceKey}-${c.id}`}
                  className="flex h-full items-center justify-end rounded-full pr-2 text-[11px] font-bold text-white"
                  style={{
                    width: running ? `${c.raceFill}%` : '0%',
                    backgroundColor: c.color,
                    transition: `width 1.4s ease-out ${i * 0.15}s`,
                  }}
                >
                  {running ? '⚙️' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          This is a conceptual illustration to show different strengths — not an exact performance
          measurement.
        </p>
      </div>

      {/* Hardware concept cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HARDWARE_CONCEPTS.map((c) => (
          <div key={c.id} className="glow-card rounded-2xl p-5">
            <div className="mb-2 flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-2xl"
                style={{ backgroundColor: `${c.color}22`, border: `1px solid ${c.color}55` }}
              >
                {c.emoji}
              </span>
              <div>
                <h4 className="text-lg font-extrabold" style={{ color: c.color }}>
                  {c.name}
                </h4>
                <p className="text-xs text-slate-400">{c.short}</p>
              </div>
            </div>
            <p className="text-sm text-slate-200">{c.description}</p>
          </div>
        ))}
      </div>

      {/* AMD-inspired connection */}
      <div className="mt-6 rounded-2xl border border-amd-orange/40 bg-gradient-to-br from-amd-red/10 to-amd-orange/10 p-5 text-center">
        <p className="text-base text-slate-100">
          <span className="font-bold text-amd-amber">Modern AMD technologies</span> combine CPUs,
          GPUs, and AI engines to help AI applications run faster and more efficiently.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button onClick={onComputeSign} className="btn-ghost rounded-2xl px-6 py-4 text-lg">
          🪧 Powered by Compute
        </button>
        <button onClick={onResultCard} className="btn-primary rounded-2xl px-6 py-4 text-lg">
          🎉 Get my AI Trainer card →
        </button>
      </div>
    </div>
  );
}
