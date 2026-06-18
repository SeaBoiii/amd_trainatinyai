import { useState } from "react";
import { Mission, PredictionResult } from "../types";
import { DrawingCanvas } from "./DrawingCanvas";
import { PredictionPanel } from "./PredictionPanel";
import { extractVectorFromCanvas, vectorInkAmount } from "../utils/canvasProcessing";

interface TestScreenProps {
  mission: Mission;
  onPredict: (vector: number[]) => PredictionResult;
  onFeedback: (correct: boolean) => void;
  onTeachFromTest: (label: string, vector: number[]) => void;
  onNext: () => void;
  presenterMode: boolean;
}

export function TestScreen({
  mission,
  onPredict,
  onFeedback,
  onTeachFromTest,
  onNext,
  presenterMode
}: TestScreenProps) {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [message, setMessage] = useState("Draw a fresh test doodle and click Ask the AI.");
  const [latestVector, setLatestVector] = useState<number[] | null>(null);

  const clearCanvas = () => {
    if (!canvasEl) {
      return;
    }
    const ctx = canvasEl.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  };

  const askAI = () => {
    if (!canvasEl) {
      return;
    }

    const vector = extractVectorFromCanvas(canvasEl, 16);
    const ink = vectorInkAmount(vector);
    if (ink < 0.02) {
      setMessage("Please draw something first.");
      return;
    }

    const result = onPredict(vector);
    setLatestVector(vector);
    setPrediction(result);

    if (!result.predictedLabel) {
      setMessage("Your AI needs more examples before predicting.");
      return;
    }

    setMessage(result.confidence >= 70 ? "Nice! Your training examples helped the AI recognise the pattern." : "The AI made a guess. More examples can improve it.");
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-3xl font-bold">Test Your Tiny AI</h2>
          <p className="text-sm text-white/70">Mission: {mission.name}</p>
        </div>
        <button className="btn-primary" onClick={onNext}>
          Open Learning Dashboard
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="panel flex flex-col items-center gap-4 p-4">
          <DrawingCanvas onReady={setCanvasEl} presenterMode={presenterMode} />
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn-secondary" onClick={clearCanvas}>
              Clear Canvas
            </button>
            <button className="btn-primary" onClick={askAI}>
              Ask the AI
            </button>
          </div>
          <p className="text-center text-sm text-ember-200">{message}</p>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button
              className="rounded-xl border border-green-300/40 bg-green-500/20 px-4 py-2"
              onClick={() => {
                onFeedback(true);
                setMessage("Great feedback logged as Correct.");
              }}
              disabled={!prediction?.predictedLabel}
            >
              Correct
            </button>
            <button
              className="rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2"
              onClick={() => {
                onFeedback(false);
                setMessage("That is okay! AI improves when we give it better data.");
              }}
              disabled={!prediction?.predictedLabel}
            >
              Wrong
            </button>
          </div>

          <div className="mt-2 w-full">
            <p className="text-sm text-white/70">If the AI is wrong, teach it this test example:</p>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {mission.labels.map((label) => (
                <button
                  key={label}
                  className="btn-secondary text-xs"
                  disabled={!latestVector}
                  onClick={() => {
                    if (latestVector) {
                      onTeachFromTest(label, latestVector);
                      setMessage("New correction example added. Great iterative improvement!");
                    }
                  }}
                >
                  Teach as {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PredictionPanel prediction={prediction} />
      </div>
    </section>
  );
}
