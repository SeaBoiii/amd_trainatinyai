import { useEffect, useState } from 'react';
import { AICore, ChipBadge } from './ui';

interface WelcomeScreenProps {
  onStart: () => void;
  onVisitorWall: () => void;
  reducedMotion: boolean;
}

const ATTRACT_LINES = [
  'Teach a machine using examples…',
  'Watch it make predictions…',
  'See how hardware powers intelligence…',
  'Ready to train your own Tiny AI?',
];

/**
 * Landing screen with a glowing AI core and a rotating "attract" line that
 * cycles when the booth is idle, to draw passers-by in.
 */
export default function WelcomeScreen({
  onStart,
  onVisitorWall,
  reducedMotion,
}: WelcomeScreenProps) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setLine((l) => (l + 1) % ATTRACT_LINES.length), 2600);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10 text-center">
      <ChipBadge className="mb-6 animate-fadeUp" />

      <div className={`mb-6 ${reducedMotion ? '' : 'animate-floaty'}`}>
        <AICore size={150} active={!reducedMotion} />
      </div>

      <h1 className="animate-fadeUp text-5xl font-black leading-tight tracking-tight sm:text-6xl">
        Train a <span className="grad-text">Tiny AI</span>
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-300 sm:text-xl">
        Teach an AI. Test it. See how hardware powers intelligence.
      </p>

      <div className="mt-4 h-7">
        <p
          key={line}
          className="animate-fadeUp text-base font-semibold text-amd-amber sm:text-lg"
          aria-live="polite"
        >
          {ATTRACT_LINES[line]}
        </p>
      </div>

      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onStart}
          className="btn-primary animate-pulse-ring rounded-2xl px-8 py-5 text-xl"
          autoFocus
        >
          🚀 Start Training
        </button>
        <button onClick={onVisitorWall} className="btn-ghost rounded-2xl px-8 py-5 text-xl">
          🏆 Visitor Wall
        </button>
      </div>

      <div className="mt-10 max-w-xl panel px-5 py-4">
        <p className="text-base text-slate-200">
          <span className="font-bold text-amd-amber">AI learns from data.</span> Hardware helps it
          train and predict faster.
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        An AMD-inspired compute demo · not an official AMD product
      </p>
    </div>
  );
}
