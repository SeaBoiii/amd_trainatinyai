import { RACE_CONCEPTS } from '../data/hardwareConcepts';

interface ComputeSignProps {
  onBack: () => void;
  onResultCard: () => void;
}

/**
 * A single, booth-sign style screen: "Powered by Compute". Explains conceptually
 * how AMD-style CPUs, GPUs, and AI engines help real AI systems train and run.
 * Deliberately educational, not salesy, with no performance claims.
 */
export default function ComputeSign({ onBack, onResultCard }: ComputeSignProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="glow-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        {/* Decorative circuit corner */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amd-red/30 to-amd-orange/20 blur-2xl" />

        <div className="text-center">
          <span className="inline-block rounded-full border border-amd-line bg-amd-panel/70 px-3 py-1 text-xs font-semibold text-amd-amber">
            Booth sign · AMD-inspired compute demo
          </span>
          <h2 className="mt-3 text-4xl font-black sm:text-5xl">
            Powered by <span className="text-gradient">Compute</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-200">
            Every AI — from your Tiny AI to the big ones — needs hardware to learn from data and to
            make predictions. Here's the simple idea behind it.
          </p>
        </div>

        {/* Three pillars */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RACE_CONCEPTS.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border p-5 text-center"
              style={{ borderColor: `${c.color}55`, backgroundColor: `${c.color}12` }}
            >
              <div className="text-4xl">{c.emoji}</div>
              <h3 className="mt-2 text-xl font-extrabold" style={{ color: c.color }}>
                {c.name}
              </h3>
              <p className="mt-1 text-sm text-slate-200">{c.raceRole}</p>
            </div>
          ))}
        </div>

        {/* The flow */}
        <div className="mt-8 rounded-2xl border border-amd-line bg-amd-panel2/50 p-5">
          <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-slate-300">
            How real AI systems train and run
          </h3>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FlowStep emoji="🗂️" title="Data" text="Examples teach the AI what things look like." />
            <Arrow />
            <FlowStep emoji="🧠" title="Train" text="Chips crunch the numbers to find patterns." />
            <Arrow />
            <FlowStep emoji="🎯" title="Predict" text="The AI makes fast guesses on new things." />
          </div>
        </div>

        {/* Educational statement */}
        <div className="mt-6 rounded-2xl border border-amd-orange/40 bg-gradient-to-br from-amd-red/10 to-amd-orange/10 p-5 text-center">
          <p className="text-base text-slate-100">
            AMD-style <span className="font-bold text-amd-amber">CPUs</span> handle the logic,{' '}
            <span className="font-bold text-amd-amber">GPUs</span> do many calculations in parallel,
            and <span className="font-bold text-amd-amber">AI engines (NPUs)</span> run AI tasks
            efficiently. Together they help AI systems train and run — the same building blocks you
            just used, scaled up.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Educational illustration · not an official AMD product and no performance claims.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={onBack} className="btn-ghost rounded-2xl px-6 py-4 text-lg">
            ← Back to hardware
          </button>
          <button onClick={onResultCard} className="btn-primary rounded-2xl px-6 py-4 text-lg">
            🎉 Get my result card →
          </button>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="flex-1 rounded-xl bg-amd-panel/70 p-4 text-center">
      <div className="text-3xl">{emoji}</div>
      <div className="mt-1 font-extrabold text-amd-amber">{title}</div>
      <div className="text-xs text-slate-300">{text}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="grid place-items-center text-2xl text-amd-orange" aria-hidden="true">
      <span className="hidden sm:block">→</span>
      <span className="sm:hidden">↓</span>
    </div>
  );
}
