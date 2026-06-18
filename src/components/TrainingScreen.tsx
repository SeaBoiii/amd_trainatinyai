import { useMemo, useState } from "react";
import { ClassLabel, Mission, TrainingExample } from "../types";
import { DrawingCanvas } from "./DrawingCanvas";
import { ClassSelector } from "./ClassSelector";
import { TrainingStats } from "./TrainingStats";
import { extractVectorFromCanvas, vectorInkAmount } from "../utils/canvasProcessing";

interface TrainingScreenProps {
  mission: Mission;
  examples: TrainingExample[];
  onAddExample: (label: ClassLabel, vector: number[]) => void;
  onTrain: () => void;
  onContinue: () => void;
  presenterMode: boolean;
}

const MIN_PER_CLASS = 2;

export function TrainingScreen({
  mission,
  examples,
  onAddExample,
  onTrain,
  onContinue,
  presenterMode
}: TrainingScreenProps) {
  const [selectedLabel, setSelectedLabel] = useState<ClassLabel>(mission.labels[0]);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [statusText, setStatusText] = useState("Select a label and start drawing.");
  const [isTraining, setIsTraining] = useState(false);
  const [trained, setTrained] = useState(false);

  const counts = useMemo(() => {
    return mission.labels.reduce<Record<ClassLabel, number>>((acc, label) => {
      acc[label] = examples.filter((e) => e.label === label).length;
      return acc;
    }, {} as Record<ClassLabel, number>);
  }, [examples, mission.labels]);

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

  const addExample = () => {
    if (!canvasEl) {
      return;
    }

    const vector = extractVectorFromCanvas(canvasEl, 16);
    const ink = vectorInkAmount(vector);

    if (ink < 0.02) {
      setStatusText("Draw something first, then add example.");
      return;
    }

    onAddExample(selectedLabel, vector);
    setStatusText("Great! Your AI now has another example to learn from.");
    clearCanvas();
  };

  const readyForTraining = mission.labels.every((label) => (counts[label] ?? 0) >= MIN_PER_CLASS);

  const runTraining = async () => {
    if (!readyForTraining) {
      setStatusText("Add at least 2 examples for each class so your AI has something to learn from.");
      return;
    }

    setIsTraining(true);
    const steps = ["Reading examples...", "Finding patterns...", "Preparing tiny model...", "Ready for inference!"];

    for (const step of steps) {
      setStatusText(step);
      await new Promise((resolve) => window.setTimeout(resolve, 450));
    }

    onTrain();
    setIsTraining(false);
    setTrained(true);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-3xl font-bold">Training: {mission.name}</h2>
          <p className="text-sm text-white/70">Teach your AI with examples for each class label.</p>
        </div>
        <button className="btn-primary" onClick={onContinue} disabled={!trained}>
          Go to Test Screen
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr_1fr]">
        <ClassSelector
          labels={mission.labels}
          selected={selectedLabel}
          counts={counts}
          onSelect={(label) => {
            setSelectedLabel(label);
            setStatusText(`Now teaching label: ${label}`);
          }}
        />

        <div className="panel flex flex-col items-center gap-4 p-4">
          <p className="text-sm text-white/70">Draw a {selectedLabel} example</p>
          <DrawingCanvas onReady={setCanvasEl} presenterMode={presenterMode} />
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn-secondary" onClick={clearCanvas}>
              Clear Canvas
            </button>
            <button className="btn-primary" onClick={addExample}>
              Add Example
            </button>
            <button className="btn-secondary" onClick={runTraining} disabled={isTraining}>
              Train / Update AI
            </button>
          </div>
          <p className="text-sm text-ember-200">{statusText}</p>
          <div className={`h-16 w-16 rounded-full bg-gradient-to-r from-ember-500 to-orange-300 ${isTraining ? "animate-pulseCore" : ""}`} />
        </div>

        <TrainingStats counts={counts} labels={mission.labels} minPerClass={MIN_PER_CLASS} isTrained={trained} />
      </div>
    </section>
  );
}
