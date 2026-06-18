import type { Mission, SessionStats } from '../types';

interface LearningDashboardProps {
  mission: Mission;
  stats: SessionStats;
  confusionHints: string[];
  onTestMore: () => void;
  onHardware: () => void;
}

const GLOSSARY: { term: string; meaning: string; emoji: string }[] = [
  { term: 'Training data', meaning: 'the examples you gave the AI', emoji: '🗂️' },
  { term: 'Prediction', meaning: 'the AI’s best guess', emoji: '🎯' },
  { term: 'Confidence', meaning: 'how sure the AI feels', emoji: '📈' },
  { term: 'Accuracy', meaning: 'how often it gets the answer right', emoji: '✅' },
];

/** Live, beginner-friendly metrics describing how the visitor's AI is doing. */
export default function LearningDashboard({
  mission,
  stats,
  confusionHints,
  onTestMore,
  onHardware,
}: LearningDashboardProps) {
  const accuracyPct =
    stats.predictionsMade > 0 ? Math.round(stats.accuracy * 100) : null;
  const avgConfPct = Math.round(stats.averageConfidence * 100);
  const readiness = Math.min(
    100,
    Math.round((stats.classesTrained / Math.max(1, stats.totalClasses)) * 100),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-black sm:text-4xl">
          AI Learning <span className="text-gradient">Dashboard</span>
        </h2>
        <p className="mt-2 text-slate-300">
          Here's how your {mission.name} AI is doing right now.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metric emoji="🗂️" label="Examples collected" value={`${stats.totalExamples}`} />
        <Metric
          emoji="🏷️"
          label="Classes trained"
          value={`${stats.classesTrained}/${stats.totalClasses}`}
        />
        <Metric
          emoji="✅"
          label="Accuracy"
          value={accuracyPct === null ? '—' : `${accuracyPct}%`}
          hint={accuracyPct === null ? 'Test the AI to measure' : 'From your feedback'}
        />
        <Metric emoji="📈" label="Avg confidence" value={`${avgConfPct}%`} />
        <Metric
          emoji="🚦"
          label="Model readiness"
          value={`${readiness}%`}
          highlight={readiness === 100}
        />
      </div>

      {/* Readiness bar */}
      <div className="glow-card mt-5 rounded-2xl p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
            Model readiness
          </h3>
          <span className="text-sm font-bold text-amd-amber">{readiness}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-amd-panel2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amd-red to-amd-orange transition-[width] duration-700"
            style={{ width: `${readiness}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-300">
          More examples usually make AI better. Try adding a few more for any class that struggles.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Confusion hints */}
        <div className="glow-card rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
            💡 Confusion hints
          </h3>
          {confusionHints.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {confusionHints.map((hint, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-amd-line bg-amd-panel2/60 px-3 py-2 text-sm text-slate-200"
                >
                  {hint}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-300">
              Your classes look nicely different so far — great job keeping them distinct!
            </p>
          )}
          {stats.improvementsUsed > 0 && (
            <p className="mt-3 text-xs text-emerald-300">
              You improved the AI {stats.improvementsUsed} time
              {stats.improvementsUsed === 1 ? '' : 's'} using better data. That's real data science!
            </p>
          )}
        </div>

        {/* Glossary */}
        <div className="glow-card rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
            📚 AI words, made simple
          </h3>
          <ul className="flex flex-col gap-2">
            {GLOSSARY.map((g) => (
              <li key={g.term} className="text-sm">
                <span className="font-bold text-amd-amber">
                  {g.emoji} {g.term}
                </span>{' '}
                <span className="text-slate-300">= {g.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button onClick={onTestMore} className="btn-ghost rounded-2xl px-6 py-4 text-lg">
          🔁 Test the AI more
        </button>
        <button onClick={onHardware} className="btn-primary rounded-2xl px-6 py-4 text-lg">
          ⚡ How hardware powers AI →
        </button>
      </div>
    </div>
  );
}

function Metric({
  emoji,
  label,
  value,
  hint,
  highlight = false,
}: {
  emoji: string;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`glow-card rounded-2xl p-4 text-center ${
        highlight ? 'border-emerald-500/60' : ''
      }`}
    >
      <div className="text-2xl" aria-hidden="true">
        {emoji}
      </div>
      <div className="mt-1 text-2xl font-black text-gradient">{value}</div>
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-slate-500">{hint}</div>}
    </div>
  );
}
