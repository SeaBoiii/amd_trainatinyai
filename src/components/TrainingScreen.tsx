import { useMemo, useRef, useState } from 'react';
import type { Mission } from '../types';
import MissionInput, { type MissionInputHandle } from './MissionInput';
import ClassSelector from './ClassSelector';
import TrainingStats from './TrainingStats';
import { AICore } from './ui';
import { supportsAcceleratedModel } from '../utils/shapeModel';

interface TrainingScreenProps {
  mission: Mission;
  counts: Record<string, number>;
  minPerClass: number;
  selectedLabel: string;
  onSelectLabel: (id: string) => void;
  onAddExample: (label: string, vector: number[]) => void;
  onTrained: () => void;
  onBack: () => void;
  /** Jump straight to a ready-made pretrained AI demo (Shape Sorter only). */
  onTryPretrained?: () => void;
}

const TRAIN_STEPS = [
  'Reading examples…',
  'Finding patterns…',
  'Preparing tiny model…',
  'Ready for inference!',
];

/**
 * The main training interaction: select a label, draw, add the example, repeat.
 * When every class has enough examples, the visitor runs a short, friendly
 * "training" animation (KNN simply stores the examples) and moves to testing.
 */
export default function TrainingScreen({
  mission,
  counts,
  minPerClass,
  selectedLabel,
  onSelectLabel,
  onAddExample,
  onTrained,
  onBack,
  onTryPretrained,
}: TrainingScreenProps) {
  const canvasRef = useRef<MissionInputHandle>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
  const [training, setTraining] = useState(false);
  const [trainStep, setTrainStep] = useState(0);
  const [pulseLabel, setPulseLabel] = useState<string | null>(null);

  const selected = mission.labels.find((l) => l.id === selectedLabel) ?? mission.labels[0];
  const isDraw = mission.inputType === 'draw';
  const actionVerb = isDraw ? 'Draw' : 'Make';
  const pretrainedAvailable =
    !!onTryPretrained && supportsAcceleratedModel(mission.labels.map((l) => l.id));

  const allReady = useMemo(
    () => mission.labels.every((l) => (counts[l.id] ?? 0) >= minPerClass),
    [mission.labels, counts, minPerClass],
  );

  const totalExamples = mission.labels.reduce((s, l) => s + (counts[l.id] ?? 0), 0);

  const handleAdd = () => {
    const vector = canvasRef.current?.getVector();
    if (!vector) {
      setWarning(
        isDraw
          ? 'Draw a bigger shape so the AI can see it, then add it as an example.'
          : 'Adjust the sliders to set up this example first.',
      );
      setFeedback('');
      return;
    }
    onAddExample(selected.id, vector);
    setWarning('');
    setFeedback(`Great! Your AI now has another ${selected.name} example to learn from.`);
    setPulseLabel(selected.id);
    setTimeout(() => setPulseLabel(null), 600);
    canvasRef.current?.reset();
  };

  const handleClear = () => {
    canvasRef.current?.reset();
    setFeedback('');
    setWarning('');
  };

  const handleTrain = () => {
    if (!allReady) {
      setWarning(
        `Add at least ${minPerClass} examples for each class so your AI has something to learn from.`,
      );
      return;
    }
    setWarning('');
    setTraining(true);
    setTrainStep(0);
    // Step through the friendly "training" messages, then advance to testing.
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      if (step >= TRAIN_STEPS.length) {
        clearInterval(id);
        setTimeout(() => {
          setTraining(false);
          onTrained();
        }, 700);
      } else {
        setTrainStep(step);
      }
    }, 750);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Mission header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {mission.emoji}
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">{mission.name}</h2>
            <p className="text-sm text-slate-400">
              Teach the AI by giving it examples for each class.
            </p>
          </div>
        </div>
        <button onClick={onBack} className="btn-ghost rounded-xl px-4 py-2 text-sm">
          ← Missions
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Left: class selector + stats */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-300">
              1 · Pick what to teach
            </h3>
            <ClassSelector
              labels={mission.labels}
              selectedId={selected.id}
              counts={counts}
              onSelect={onSelectLabel}
              minPerClass={minPerClass}
            />
          </div>
          <TrainingStats labels={mission.labels} counts={counts} minPerClass={minPerClass} />
        </div>

        {/* Right: canvas + actions */}
        <div className="flex flex-col items-center">
          <div className="mb-2 self-start">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
              2 · {actionVerb} a{' '}
              <span className="text-amd-amber">
                {selected.emoji} {selected.name}
              </span>
            </h3>
          </div>

          <MissionInput
            ref={canvasRef}
            mission={mission}
            size={340}
            onInteract={() => setWarning('')}
          />

          <div className="mt-4 grid w-full max-w-[340px] grid-cols-2 gap-3">
            <button onClick={handleClear} className="btn-ghost rounded-xl py-3 text-base">
              {isDraw ? '🧹 Clear' : '🔄 Reset'}
            </button>
            <button onClick={handleAdd} className="btn-primary rounded-xl py-3 text-base">
              ➕ Add Example
            </button>
          </div>

          {/* Live feedback / warnings */}
          <div className="mt-3 min-h-[28px] w-full max-w-[340px] text-center" aria-live="polite">
            {warning && (
              <p className="rounded-lg bg-amd-red/15 px-3 py-2 text-sm font-medium text-red-200">
                {warning}
              </p>
            )}
            {!warning && feedback && (
              <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-200">
                {feedback}
              </p>
            )}
          </div>

          {/* Train button */}
          <button
            onClick={handleTrain}
            disabled={!allReady}
            className={`mt-4 w-full max-w-[340px] rounded-2xl py-4 text-lg font-extrabold transition ${
              allReady
                ? 'btn-primary'
                : 'cursor-not-allowed border border-amd-line bg-amd-panel/60 text-slate-500'
            }`}
          >
            {allReady ? '🧠 Train Tiny AI →' : `Add ${minPerClass}+ per class to train`}
          </button>
          <p className="mt-2 max-w-[340px] text-center text-xs text-slate-400">
            Your AI stores your examples and compares new ones against them. You've taught it{' '}
            <span className="font-bold text-amd-amber">{totalExamples}</span> example
            {totalExamples === 1 ? '' : 's'} so far.
          </p>

          {/* Shortcut: skip teaching and demo the ready-made pretrained model. */}
          {pretrainedAvailable && (
            <div className="mt-4 w-full max-w-[340px]">
              <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                or
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <button
                onClick={onTryPretrained}
                className="btn-ghost w-full rounded-2xl py-3 text-base"
                title="Skip teaching and show a ready-made AI running on your NPU/GPU/CPU"
              >
                ⚡ Show the pretrained AI (no teaching needed)
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                Great for a quick demo: a real neural network that already knows these four shapes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pulse acknowledgement when an example is added */}
      {pulseLabel && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 animate-fadeUp rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-bold text-white shadow-glow">
          +1 example added ✓
        </div>
      )}

      {/* Training overlay animation */}
      {training && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-amd-dark/90 backdrop-blur">
          <div className="flex flex-col items-center text-center">
            <AICore size={170} active />
            <p className="mt-6 text-2xl font-extrabold text-gradient">{TRAIN_STEPS[trainStep]}</p>
            <div className="mt-4 flex gap-2">
              {TRAIN_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i <= trainStep ? 'bg-amd-orange' : 'bg-amd-line'
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Your tiny model is getting your examples ready for comparison.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
