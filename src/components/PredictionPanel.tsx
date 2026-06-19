import { useEffect, useRef } from 'react';
import type { ClassLabel, Mission, PredictionResult } from '../types';
import { drawVectorToCanvas } from '../utils/canvasProcessing';
import { colorFromVector } from '../utils/featureProcessing';
import { ConfidenceBar } from './ui';

interface PredictionPanelProps {
  result: PredictionResult;
  labels: ClassLabel[];
  mission: Mission;
}

/**
 * Shows the AI's answer: predicted class, confidence bars for the top guesses,
 * and a "show your work" row of the nearest training examples it compared
 * against. This is what makes the demo feel honest and explainable.
 */
export default function PredictionPanel({ result, labels, mission }: PredictionPanelProps) {
  const labelMap = Object.fromEntries(labels.map((l) => [l.id, l]));

  if (result.insufficientData || !result.predictedLabel) {
    return (
      <div className="glow-card rounded-2xl p-5 text-center">
        <p className="text-slate-300">
          The AI needs a few examples first. Go back and teach it some examples!
        </p>
      </div>
    );
  }

  const winner = labelMap[result.predictedLabel];
  const topScores = result.scores.filter((s) => s.confidence > 0).slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      {/* Headline prediction */}
      <div className="glow-card animate-fadeUp rounded-2xl p-5 text-center">
        <p className="text-sm uppercase tracking-wide text-slate-400">The AI thinks this is</p>
        <div className="my-2 flex items-center justify-center gap-3">
          <span className="text-5xl" aria-hidden="true">
            {winner?.emoji}
          </span>
          <span className="text-4xl font-extrabold text-gradient">{winner?.name}</span>
        </div>
        <p className="text-lg">
          Confidence:{' '}
          <span className="font-bold text-amd-amber">{Math.round(result.confidence * 100)}%</span>
        </p>
      </div>

      {/* Top 3 confidence bars */}
      <div className="glow-card rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
          Top guesses
        </h3>
        <div className="flex flex-col gap-3">
          {topScores.map((score, i) => {
            const label = labelMap[score.label];
            return (
              <ConfidenceBar
                key={score.label}
                label={label?.name ?? score.label}
                emoji={label?.emoji}
                value={score.confidence}
                highlight={i === 0}
              />
            );
          })}
        </div>
      </div>

      {/* Nearest examples (show your work) */}
      {result.neighbors.length > 0 && (
        <div className="glow-card rounded-2xl p-5">
          <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-300">
            Closest examples it compared
          </h3>
          <p className="mb-3 text-xs text-slate-400">
            The AI lined your example up against every example you gave it. These were the most
            similar.
          </p>
          <div className="flex flex-wrap gap-3">
            {result.neighbors.map((n) => (
              <NeighborTile
                key={n.example.id}
                vector={n.example.vector}
                labelName={labelMap[n.example.label]?.name ?? n.example.label}
                emoji={labelMap[n.example.label]?.emoji ?? ''}
                similarity={n.similarity}
                mission={mission}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NeighborTile({
  vector,
  labelName,
  emoji,
  similarity,
  mission,
}: {
  vector: number[];
  labelName: string;
  emoji: string;
  similarity: number;
  mission: Mission;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <NeighborVisual vector={vector} labelName={labelName} mission={mission} />
      <span className="text-xs font-semibold">
        {emoji} {labelName}
      </span>
      <span className="text-[11px] text-amd-amber">{Math.round(similarity * 100)}% match</span>
    </div>
  );
}

/** Renders a stored example in a way that suits the mission's input type. */
function NeighborVisual({
  vector,
  labelName,
  mission,
}: {
  vector: number[];
  labelName: string;
  mission: Mission;
}) {
  if (mission.inputType === 'sliders' && mission.preview === 'color') {
    return (
      <div
        className="h-[72px] w-[72px] rounded-lg border border-amd-line"
        style={{ backgroundColor: colorFromVector(vector) }}
        aria-label={`Stored ${labelName} example colour`}
      />
    );
  }

  if (mission.inputType === 'sliders') {
    const axes = mission.features ?? [];
    return (
      <div
        className="flex h-[72px] w-[72px] flex-col justify-center gap-1 rounded-lg border border-amd-line bg-amd-panel2/60 px-2"
        aria-label={`Stored ${labelName} example values`}
      >
        {axes.map((axis, i) => (
          <div key={axis.id} className="flex items-center gap-1">
            <span className="text-[9px] leading-none">{axis.emoji}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amd-panel2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amd-red to-amd-orange"
                style={{ width: `${Math.round((vector[i] ?? 0) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <NeighborCanvas vector={vector} labelName={labelName} />;
}

function NeighborCanvas({ vector, labelName }: { vector: number[]; labelName: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current) drawVectorToCanvas(ref.current, vector);
  }, [vector]);

  return (
    <canvas
      ref={ref}
      width={72}
      height={72}
      className="rounded-lg border border-amd-line"
      aria-label={`Stored ${labelName} example`}
    />
  );
}
