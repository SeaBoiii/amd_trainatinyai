import { ClassLabel } from "../types";

interface LearningDashboardProps {
  counts: Record<ClassLabel, number>;
  feedbackCorrect: number;
  feedbackWrong: number;
  averageConfidence: number;
  onNext: () => void;
}

export function LearningDashboard({
  counts,
  feedbackCorrect,
  feedbackWrong,
  averageConfidence,
  onNext
}: LearningDashboardProps) {
  const totalExamples = Object.values(counts).reduce((a, b) => a + b, 0);
  const classesTrained = Object.values(counts).filter((v) => v > 0).length;
  const feedbackTotal = feedbackCorrect + feedbackWrong;
  const accuracy = feedbackTotal ? (feedbackCorrect / feedbackTotal) * 100 : 0;
  const modelReadiness = Math.min(100, totalExamples * 3 + classesTrained * 8);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-3xl font-bold">AI Learning Dashboard</h2>
        <button className="btn-primary" onClick={onNext}>
          Continue to Hardware Power
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="panel p-4">
          <p className="text-sm text-white/70">Training data</p>
          <p className="font-display text-4xl font-bold">{totalExamples}</p>
          <p className="text-xs text-white/60">Examples you gave the AI</p>
        </div>

        <div className="panel p-4">
          <p className="text-sm text-white/70">Classes trained</p>
          <p className="font-display text-4xl font-bold">{classesTrained}</p>
          <p className="text-xs text-white/60">Different labels covered</p>
        </div>

        <div className="panel p-4">
          <p className="text-sm text-white/70">Accuracy</p>
          <p className="font-display text-4xl font-bold">{accuracy.toFixed(1)}%</p>
          <p className="text-xs text-white/60">How often it gets feedback as correct</p>
        </div>

        <div className="panel p-4">
          <p className="text-sm text-white/70">Average confidence</p>
          <p className="font-display text-4xl font-bold">{averageConfidence.toFixed(1)}%</p>
          <p className="text-xs text-white/60">How sure the AI feels</p>
        </div>

        <div className="panel p-4">
          <p className="text-sm text-white/70">Model readiness</p>
          <p className="font-display text-4xl font-bold">{modelReadiness.toFixed(0)}%</p>
          <p className="text-xs text-white/60">More examples usually make AI better</p>
        </div>

        <div className="panel p-4">
          <p className="text-sm text-white/70">Confusion hint</p>
          <p className="text-lg font-semibold">Circle and oval-like drawings may be confused.</p>
          <p className="mt-2 text-xs text-white/60">Neat, consistent sketches improve class separation.</p>
        </div>
      </div>

      <div className="panel p-4 text-sm text-white/80">
        <p>Prediction = the AI's best guess</p>
        <p>Confidence = how sure the AI feels</p>
        <p>Accuracy = how often visitors marked predictions as correct</p>
      </div>
    </section>
  );
}
