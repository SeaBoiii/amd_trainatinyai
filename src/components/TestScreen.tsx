import { useRef, useState } from 'react';
import type { Mission, PredictionResult } from '../types';
import MissionInput, { type MissionInputHandle } from './MissionInput';
import PredictionPanel from './PredictionPanel';
import { predict } from '../utils/classifier';

interface TestScreenProps {
  mission: Mission;
  onFeedback: (correct: boolean) => void;
  /** Adds the just-tested drawing as a new example for the chosen label. */
  onTeach: (label: string, vector: number[]) => void;
  onRecordPrediction: (result: PredictionResult) => void;
  onDashboard: () => void;
  onBackToTraining: () => void;
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
    // Brief pause so the "comparing" message is visible — feels like real work.
    setTimeout(() => {
      const prediction = predict(vector, labelIds, 3);
      setResult(prediction);
      onRecordPrediction(prediction);
      setPhase('result');
      setAnswered(false);
      setTeachOpen(false);
      setFeedbackMsg('');
      setTaughtMsg('');
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
    setTeachOpen(true);
    setFeedbackMsg('That is okay! AI improves when we give it better data.');
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
                The AI is comparing your example with the ones you gave it…
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
