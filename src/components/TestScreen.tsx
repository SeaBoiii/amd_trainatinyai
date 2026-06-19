import { useEffect, useRef, useState } from 'react';
import type { Mission, PredictionResult } from '../types';
import MissionInput, { type MissionInputHandle } from './MissionInput';
import PredictionPanel from './PredictionPanel';
import { predict } from '../utils/classifier';
import {
  classifyShape,
  detectAccelerator,
  supportsAcceleratedModel,
  type AcceleratorInfo,
} from '../utils/shapeModel';

interface TestScreenProps {
  mission: Mission;
  onFeedback: (correct: boolean) => void;
  /** Adds the just-tested drawing as a new example for the chosen label. */
  onTeach: (label: string, vector: number[]) => void;
  onRecordPrediction: (result: PredictionResult) => void;
  onDashboard: () => void;
  onBackToTraining: () => void;
  /** Start with the pretrained "accelerated" model already enabled (demo path). */
  defaultAccelerated?: boolean;
}

type Phase = 'drawing' | 'thinking' | 'result';

/**
 * Test screen: the visitor makes a new example, asks the AI, and gives feedback.
 * If the AI is wrong, they can teach it the new example to improve it — showing
 * the iterative "more/better data makes AI smarter" idea.
 */
export default function TestScreen({
  mission,
  onFeedback,
  onTeach,
  onRecordPrediction,
  onDashboard,
  onBackToTraining,
  defaultAccelerated = false,
}: TestScreenProps) {
  const canvasRef = useRef<MissionInputHandle>(null);
  const [phase, setPhase] = useState<Phase>('drawing');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [lastVector, setLastVector] = useState<number[] | null>(null);
  const [warning, setWarning] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [answered, setAnswered] = useState(false);
  const [teachOpen, setTeachOpen] = useState(false);
  const [taughtMsg, setTaughtMsg] = useState('');

  const labelIds = mission.labels.map((l) => l.id);
  const isDraw = mission.inputType === 'draw';
  const actionVerb = isDraw ? 'Draw' : 'Make';

  // ----- Accelerated (pretrained ONNX) mode -----
  // Only offered for missions whose labels the bundled model actually knows.
  const acceleratedAvailable = isDraw && supportsAcceleratedModel(labelIds);
  const [accelerated, setAccelerated] = useState(defaultAccelerated && acceleratedAvailable);
  const [accel, setAccel] = useState<AcceleratorInfo | null>(null);
  const [accelStatus, setAccelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  // When the visitor switches to accelerated mode, find which compute device
  // (NPU / GPU / CPU) their machine will use.
  useEffect(() => {
    if (!accelerated || accel || accelStatus === 'loading') return;
    let cancelled = false;
    setAccelStatus('loading');
    detectAccelerator()
      .then((info) => {
        if (!cancelled) {
          setAccel(info);
          setAccelStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setAccelStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [accelerated, accel, accelStatus]);

  const handleAsk = () => {
    const vector = canvasRef.current?.getVector();
    if (!vector) {
      setWarning(
        isDraw
          ? 'Draw a bigger shape so the AI has something to compare.'
          : 'Adjust the sliders to set up an example first.',
      );
      return;
    }
    setWarning('');
    setLastVector(vector);
    setPhase('thinking');

    const showResult = (prediction: PredictionResult) => {
      setResult(prediction);
      onRecordPrediction(prediction);
      setPhase('result');
      setAnswered(false);
      setTeachOpen(false);
      setFeedbackMsg('');
      setTaughtMsg('');
    };

    if (accelerated && acceleratedAvailable) {
      // Real pretrained neural network running on NPU / GPU / CPU.
      classifyShape(vector, labelIds)
        .then((prediction) => {
          setAccel(prediction.accelerator);
          setAccelStatus('ready');
          showResult(prediction);
        })
        .catch(() => {
          setAccelStatus('error');
          setPhase('drawing');
          setWarning('The accelerated model could not load. Switch off Accelerated mode to use the model you trained.');
        });
      return;
    }

    // Default: the KNN the visitor trained live. Brief pause so the
    // "comparing" message is visible — feels like real work.
    setTimeout(() => {
      showResult(predict(vector, labelIds, 3));
    }, 850);
  };

  const handleNewDrawing = () => {
    canvasRef.current?.reset();
    setPhase('drawing');
    setResult(null);
    setLastVector(null);
    setAnswered(false);
    setTeachOpen(false);
    setWarning('');
    setFeedbackMsg('');
    setTaughtMsg('');
  };

  const handleCorrect = () => {
    onFeedback(true);
    setAnswered(true);
    setFeedbackMsg('Nice! Your training examples helped the AI recognise the pattern.');
  };

  const handleWrong = () => {
    onFeedback(false);
    setAnswered(true);
    if (accelerated) {
      // The pretrained model is fixed — it doesn't learn from new examples live.
      setFeedbackMsg(
        'Good spot! This model was trained ahead of time, so it cannot learn live. Switch off Accelerated mode to teach your own AI.',
      );
    } else {
      setTeachOpen(true);
      setFeedbackMsg('That is okay! AI improves when we give it better data.');
    }
  };

  const handleTeach = (labelId: string) => {
    if (!lastVector) return;
    onTeach(labelId, lastVector);
    const name = mission.labels.find((l) => l.id === labelId)?.name ?? labelId;
    setTaughtMsg(`Thanks! The AI now knows this example is a ${name}. It just got a little smarter.`);
    setTeachOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            🔍
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">Test your Tiny AI</h2>
            <p className="text-sm text-slate-400">
              {actionVerb} a new {mission.name.toLowerCase()} item and see what the AI guesses.
            </p>
          </div>
        </div>
        <button onClick={onBackToTraining} className="btn-ghost rounded-xl px-4 py-2 text-sm">
          ← Add more examples
        </button>
      </div>

      {/* Optional accelerated mode: run a real pretrained neural net on the
          best available compute device (NPU → GPU → CPU). */}
      {acceleratedAvailable && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-850/60 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              ⚡
            </span>
            <div>
              <p className="text-sm font-bold text-slate-100">Hardware-accelerated AI</p>
              <p className="text-xs text-slate-400">
                Run a real pretrained neural network on your{' '}
                <span className="font-semibold text-amd-amber">NPU</span>, GPU or CPU instead of the
                model you trained.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {accelerated && (
              <span className="chip border-amd-orange/40 bg-amd-orange/10 text-amd-amber">
                {accelStatus === 'loading' && '… detecting device'}
                {accelStatus === 'ready' && accel && `${accel.emoji} ${accel.label}`}
                {accelStatus === 'error' && '⚠️ unavailable'}
                {accelStatus === 'idle' && '…'}
              </span>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={accelerated}
              onClick={() => setAccelerated((v) => !v)}
              className={`relative h-7 w-12 rounded-full border transition ${
                accelerated
                  ? 'border-amd-orange/60 bg-amd-orange/30'
                  : 'border-white/15 bg-white/5'
              }`}
              title="Toggle hardware-accelerated AI"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-gradient-to-br from-amd-red to-amd-orange transition-all ${
                  accelerated ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: input */}
        <div className="flex flex-col items-center">
          <MissionInput ref={canvasRef} mission={mission} size={340} disabled={phase === 'thinking'} />

          <div className="mt-4 grid w-full max-w-[340px] grid-cols-2 gap-3">
            <button onClick={handleNewDrawing} className="btn-ghost rounded-xl py-3 text-base">
              {isDraw ? '🧹 New Drawing' : '🔄 New Example'}
            </button>
            <button
              onClick={handleAsk}
              disabled={phase === 'thinking'}
              className="btn-primary rounded-xl py-3 text-base disabled:opacity-60"
            >
              🤖 Ask the AI
            </button>
          </div>

          <div className="mt-3 min-h-[28px] w-full max-w-[340px] text-center" aria-live="polite">
            {warning && (
              <p className="rounded-lg bg-amd-red/15 px-3 py-2 text-sm font-medium text-red-200">
                {warning}
              </p>
            )}
            {phase === 'thinking' && (
              <p className="rounded-lg bg-amd-orange/15 px-3 py-2 text-sm font-medium text-amd-amber">
                {accelerated && acceleratedAvailable
                  ? `Running the neural network on your ${accel?.device ?? 'device'}…`
                  : 'The AI is comparing your example with the ones you gave it…'}
              </p>
            )}
          </div>
        </div>

        {/* Right: results */}
        <div>
          {phase !== 'result' || !result ? (
            <div className="glow-card grid h-full min-h-[300px] place-items-center rounded-2xl p-6 text-center">
              <div>
                <div className="mb-3 text-5xl">{phase === 'thinking' ? '🧠' : '👈'}</div>
                <p className="text-slate-300">
                  {phase === 'thinking'
                    ? 'Thinking…'
                    : `${actionVerb} on the left and tap “Ask the AI” to see its prediction.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {accelerated && accel && (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-amd-orange/30 bg-amd-orange/10 px-4 py-2 text-sm font-semibold text-amd-amber">
                  <span aria-hidden="true">{accel.emoji}</span>
                  Pretrained neural net · ran on your {accel.device} ({accel.label})
                </div>
              )}
              <PredictionPanel result={result} labels={mission.labels} mission={mission} />

              {/* Feedback */}
              {!result.insufficientData && (
                <div className="glow-card rounded-2xl p-5">
                  {!answered ? (
                    <>
                      <p className="mb-3 text-center text-sm font-semibold text-slate-200">
                        Did the AI get it right?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleCorrect}
                          className="rounded-xl bg-emerald-500/90 py-3 text-base font-bold text-white transition hover:bg-emerald-500"
                        >
                          ✓ Correct
                        </button>
                        <button
                          onClick={handleWrong}
                          className="rounded-xl bg-amd-red/90 py-3 text-base font-bold text-white transition hover:bg-amd-red"
                        >
                          ✗ Wrong
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-sm font-medium text-slate-200">{feedbackMsg}</p>
                  )}

                  {/* Improvement loop */}
                  {teachOpen && (
                    <div className="mt-4 border-t border-amd-line pt-4">
                      <p className="mb-2 text-center text-sm font-semibold text-amd-amber">
                        Teach the AI this example — what should it have been?
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {mission.labels.map((label) => (
                          <button
                            key={label.id}
                            onClick={() => handleTeach(label.id)}
                            className="btn-ghost rounded-xl px-3 py-2 text-sm"
                          >
                            {label.emoji} {label.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {taughtMsg && (
                    <p className="mt-3 rounded-lg bg-emerald-500/15 px-3 py-2 text-center text-sm font-medium text-emerald-200">
                      {taughtMsg}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button onClick={handleNewDrawing} className="btn-ghost flex-1 rounded-xl py-3">
                  🔁 Try another
                </button>
                <button onClick={onDashboard} className="btn-primary flex-1 rounded-xl py-3">
                  📊 See AI Dashboard →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
