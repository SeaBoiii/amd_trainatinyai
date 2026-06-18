import { PredictionResult } from "../types";

interface PredictionPanelProps {
  prediction: PredictionResult | null;
}

export function PredictionPanel({ prediction }: PredictionPanelProps) {
  if (!prediction || !prediction.predictedLabel) {
    return (
      <div className="panel p-4">
        <h3 className="font-display text-xl font-semibold">AI Prediction</h3>
        <p className="mt-2 text-sm text-white/70">Ask the AI to see top guesses and confidence bars.</p>
      </div>
    );
  }

  return (
    <div className="panel space-y-4 p-4">
      <div>
        <h3 className="font-display text-xl font-semibold">AI Prediction</h3>
        <p className="mt-1 text-sm text-white/70">The AI is comparing your drawing with the examples you gave it.</p>
      </div>

      <div className="rounded-xl border border-ember-200/30 bg-ember-500/10 p-3">
        <p className="text-sm text-ember-200">Predicted class</p>
        <p className="font-display text-3xl font-bold">{prediction.predictedLabel}</p>
        <p className="text-sm text-white/80">Confidence: {prediction.confidence.toFixed(1)}%</p>
      </div>

      <div>
        <p className="mb-2 text-sm text-white/80">Top 3 guesses</p>
        <div className="space-y-2">
          {prediction.topGuesses.map((guess) => (
            <div key={guess.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{guess.label}</span>
                <span>{(guess.score * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-ember-500 to-orange-300"
                  style={{ width: `${Math.max(2, guess.score * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-white/80">Nearest training examples used</p>
        <div className="mt-2 grid gap-2">
          {prediction.nearestExamples.map((ex, i) => (
            <div key={`${ex.label}-${i}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
              Label: {ex.label} | Distance: {ex.distance}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
