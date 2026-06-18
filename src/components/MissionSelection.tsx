import type { Difficulty, Mission } from '../types';
import { MISSIONS } from '../data/missions';

interface MissionSelectionProps {
  onSelect: (mission: Mission) => void;
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: 'bg-emerald-500/20 text-emerald-300',
  Medium: 'bg-amd-amber/20 text-amd-amber',
  Hard: 'bg-amd-red/20 text-red-300',
};

/** Grid of mission cards. The recommended booth mission is badged and listed first. */
export default function MissionSelection({ onSelect }: MissionSelectionProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-black sm:text-4xl">
          Choose your <span className="text-gradient">AI mission</span>
        </h2>
        <p className="mt-2 text-slate-300">
          Pick what you want to teach your AI. Each one takes just a couple of minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MISSIONS.map((mission, i) => (
          <button
            key={mission.id}
            onClick={() => onSelect(mission)}
            style={{ animationDelay: `${i * 60}ms` }}
            className="glow-card glow-card-hover animate-fadeUp relative overflow-hidden rounded-2xl p-5 text-left"
          >
            {mission.recommended && (
              <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-amd-red to-amd-orange px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-glow">
                ★ Booth pick
              </span>
            )}

            <div
              className={`mb-3 inline-grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${mission.accent} text-3xl shadow-card`}
            >
              {mission.emoji}
            </div>

            <h3 className="text-xl font-extrabold">{mission.name}</h3>
            <p className="mt-1 min-h-[40px] text-sm text-slate-300">{mission.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {mission.labels.map((label) => (
                <span
                  key={label.id}
                  className="rounded-full border border-amd-line bg-amd-panel2/70 px-2.5 py-1 text-xs font-medium"
                >
                  {label.emoji} {label.name}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  DIFFICULTY_STYLES[mission.difficulty]
                }`}
              >
                {mission.difficulty}
              </span>
              <span className="rounded-full border border-amd-line bg-amd-panel2/70 px-2.5 py-1 text-xs font-semibold text-slate-200">
                {mission.inputType === 'draw' ? '✏️ Draw' : '🎚️ Sliders'}
              </span>
              <span className="text-xs text-slate-400">⏱ {mission.estimatedTime}</span>
            </div>

            <div className="mt-4 rounded-xl bg-gradient-to-r from-amd-red to-amd-orange py-2.5 text-center text-sm font-bold text-white">
              Start this mission →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
