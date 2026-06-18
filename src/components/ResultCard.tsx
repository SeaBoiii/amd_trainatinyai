import { CareerMatch } from "../types";

interface ResultCardProps {
  nickname: string;
  setNickname: (value: string) => void;
  missionName: string;
  examplesTaught: number;
  accuracy: number;
  bestPrediction: string;
  careerMatch: CareerMatch;
  onSave: () => void;
  onBackToStart: () => void;
}

export function ResultCard({
  nickname,
  setNickname,
  missionName,
  examplesTaught,
  accuracy,
  bestPrediction,
  careerMatch,
  onSave,
  onBackToStart
}: ResultCardProps) {
  return (
    <section className="space-y-5">
      <h2 className="font-display text-3xl font-bold">Tiny AI Trainer Result Card</h2>

      <div className="panel max-w-3xl space-y-4 p-6">
        <div className="rounded-2xl border border-ember-200/40 bg-gradient-to-r from-ember-500/20 to-orange-400/10 p-4">
          <p className="text-sm uppercase tracking-wider text-ember-200">Tiny AI Trainer</p>
          <p className="mt-2 text-sm text-white/80">
            You taught an AI using examples. That is the same basic idea behind many real-world AI systems.
          </p>
        </div>

        <label className="block">
          <span className="text-sm text-white/70">Nickname</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname"
            className="mt-1 w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-ember-200"
          />
        </label>

        <div className="grid gap-2 text-sm md:grid-cols-2">
          <p>Mission: <strong>{missionName}</strong></p>
          <p>Examples taught: <strong>{examplesTaught}</strong></p>
          <p>Best prediction: <strong>{bestPrediction}</strong></p>
          <p>Accuracy: <strong>{accuracy.toFixed(1)}%</strong></p>
          <p>Career match: <strong>{careerMatch}</strong></p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={onSave}>
            Save to Visitor Wall
          </button>
          <button className="btn-secondary" onClick={onBackToStart}>
            Back to Start
          </button>
        </div>
      </div>
    </section>
  );
}
