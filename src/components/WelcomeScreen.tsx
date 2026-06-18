interface WelcomeScreenProps {
  onStart: () => void;
  onVisitorWall: () => void;
  reducedMotion: boolean;
}

export function WelcomeScreen({ onStart, onVisitorWall, reducedMotion }: WelcomeScreenProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-coal-800/70 p-6 shadow-glow md:p-10">
      <div className="circuit-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-5">
          <p className="inline-flex rounded-full border border-ember-200/40 bg-ember-500/10 px-3 py-1 text-xs uppercase tracking-wider text-ember-200">
            Interactive STEM Booth Experience
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">Train a Tiny AI</h1>
          <p className="max-w-2xl text-lg text-white/90">
            Teach an AI. Test it. See how hardware powers intelligence.
          </p>
          <p className="max-w-xl text-base text-white/75">
            Teach a machine using examples, then watch it make predictions.
          </p>
          <p className="text-sm text-ember-200/90">
            AI learns from data. Hardware helps it train and predict faster.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={onStart} className="btn-primary px-8 py-4 text-lg">
              Start Training
            </button>
            <button onClick={onVisitorWall} className="btn-secondary px-8 py-4 text-lg">
              Visitor Wall
            </button>
          </div>
        </div>

        <div className="panel relative min-h-64 p-6">
          <p className="font-display text-xl font-semibold">Idle Attract Mode</p>
          <p className="mt-2 text-sm text-white/70">
            Draw. Train. Predict. Improve. In just a few minutes.
          </p>
          <div className="mt-6 space-y-3">
            {["Collecting examples", "Comparing vectors", "Running inference"].map((line, idx) => (
              <div key={line} className="overflow-hidden rounded-lg border border-white/15 bg-black/20 p-2">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r from-ember-500 via-orange-300 to-ember-500 bg-[length:200%_100%] ${
                    reducedMotion ? "" : "animate-shimmer"
                  }`}
                  style={{ width: `${80 - idx * 15}%` }}
                />
              </div>
            ))}
          </div>
          <div className={`mx-auto mt-6 h-20 w-20 rounded-full bg-ember-500/30 blur-sm ${reducedMotion ? "" : "animate-pulseCore"}`} />
        </div>
      </div>
    </section>
  );
}
