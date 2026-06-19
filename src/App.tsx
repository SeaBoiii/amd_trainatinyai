import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type {
  CareerMatch,
  Mission,
  PredictionResult,
  Screen,
  SessionStats,
  VisitorResult,
} from './types';
import { DEFAULT_MISSION_ID, getMissionById } from './data/missions';
import {
  addExample as addExampleToModel,
  countByLabel,
  getConfusionHints,
  resetClassifier,
} from './utils/classifier';
import {
  loadPrefs,
  saveVisitorResult,
  savePrefs,
  type BoothPrefs,
} from './utils/storage';
import WelcomeScreen from './components/WelcomeScreen';
import MissionSelection from './components/MissionSelection';
import TrainingScreen from './components/TrainingScreen';
import TestScreen from './components/TestScreen';
import LearningDashboard from './components/LearningDashboard';
import HardwarePowerScreen from './components/HardwarePowerScreen';
import ComputeSign from './components/ComputeSign';
import ResultCard from './components/ResultCard';
import VisitorWall from './components/VisitorWall';

const MIN_PER_CLASS = 2;
const IDLE_RESET_MS = 90_000; // return to welcome after ~90s idle (booth hygiene)

/** Raw, accumulating session signals; derived stats are computed from these. */
interface SessionState {
  predictionsMade: number;
  correctFeedback: number;
  wrongFeedback: number;
  confidenceSum: number;
  improvementsUsed: number;
  missionsTried: Set<string>;
  exploredHardware: boolean;
  bestPrediction: { label: string; confidence: number } | null;
}

const EMPTY_SESSION: SessionState = {
  predictionsMade: 0,
  correctFeedback: 0,
  wrongFeedback: 0,
  confidenceSum: 0,
  improvementsUsed: 0,
  missionsTried: new Set(),
  exploredHardware: false,
  bestPrediction: null,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mission, setMission] = useState<Mission>(
    () => getMissionById(DEFAULT_MISSION_ID)!,
  );
  const [selectedLabel, setSelectedLabel] = useState<string>(mission.labels[0].id);
  // counts is a plain object kept in React state so the UI re-renders; the
  // authoritative example vectors live in the classifier module.
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [session, setSession] = useState<SessionState>(() => ({ ...EMPTY_SESSION }));
  const [savedToWall, setSavedToWall] = useState(false);
  // When true, the Test screen opens with the pretrained model already on
  // (set by the "Show the pretrained AI" shortcut on the training screen).
  const [demoPretrained, setDemoPretrained] = useState(false);

  const [prefs, setPrefs] = useState<BoothPrefs>(() => loadPrefs());

  // Apply booth preference classes to <body>.
  useEffect(() => {
    document.body.classList.toggle('presenter-mode', prefs.presenterMode);
    document.body.classList.toggle('reduce-motion', prefs.reducedMotion);
    savePrefs(prefs);
  }, [prefs]);

  // Idle auto-reset to keep the booth fresh for the next visitor.
  useEffect(() => {
    if (screen === 'welcome') return;
    let timer = window.setTimeout(handleFullReset, IDLE_RESET_MS);
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(handleFullReset, IDLE_RESET_MS);
    };
    const events = ['pointerdown', 'keydown', 'pointermove'];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // ----- Derived stats -----
  const stats: SessionStats = useMemo(() => {
    const totalExamples = Object.values(counts).reduce((a, b) => a + b, 0);
    const classesTrained = mission.labels.filter(
      (l) => (counts[l.id] ?? 0) >= MIN_PER_CLASS,
    ).length;
    const totalFeedback = session.correctFeedback + session.wrongFeedback;
    return {
      totalExamples,
      classesTrained,
      totalClasses: mission.labels.length,
      predictionsMade: session.predictionsMade,
      correctFeedback: session.correctFeedback,
      wrongFeedback: session.wrongFeedback,
      accuracy: totalFeedback > 0 ? session.correctFeedback / totalFeedback : 0,
      averageConfidence:
        session.predictionsMade > 0 ? session.confidenceSum / session.predictionsMade : 0,
      improvementsUsed: session.improvementsUsed,
      missionsTried: session.missionsTried.size,
      exploredHardware: session.exploredHardware,
    };
  }, [counts, mission.labels, session]);

  const labelNameMap = useMemo(
    () => Object.fromEntries(mission.labels.map((l) => [l.id, l.name])),
    [mission.labels],
  );

  const confusionHints = useMemo(
    () => getConfusionHints(labelNameMap),
    // Recompute when example counts change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [counts, labelNameMap],
  );

  const bestPredictionName = session.bestPrediction
    ? labelNameMap[session.bestPrediction.label] ?? ''
    : '';

  // ----- Actions -----
  const refreshCounts = useCallback(() => {
    setCounts(countByLabel());
  }, []);

  const handleSelectMission = (m: Mission) => {
    // Switching missions starts a fresh model but remembers it was tried.
    resetClassifier();
    setMission(m);
    setSelectedLabel(m.labels[0].id);
    setCounts({});
    setSavedToWall(false);
    setSession((s) => {
      const missionsTried = new Set(s.missionsTried);
      missionsTried.add(m.id);
      // Reset model-specific signals but keep cross-mission exploration flags.
      return {
        ...EMPTY_SESSION,
        missionsTried,
        exploredHardware: s.exploredHardware,
      };
    });
    setScreen('training');
  };

  const handleAddExample = useCallback(
    (label: string, vector: number[]) => {
      addExampleToModel(label, vector);
      refreshCounts();
    },
    [refreshCounts],
  );

  const handleTeachFromTest = useCallback(
    (label: string, vector: number[]) => {
      addExampleToModel(label, vector);
      refreshCounts();
      setSession((s) => ({ ...s, improvementsUsed: s.improvementsUsed + 1 }));
    },
    [refreshCounts],
  );

  const handleRecordPrediction = useCallback((result: PredictionResult) => {
    if (result.insufficientData || !result.predictedLabel) return;
    setSession((s) => {
      const best =
        !s.bestPrediction || result.confidence > s.bestPrediction.confidence
          ? { label: result.predictedLabel!, confidence: result.confidence }
          : s.bestPrediction;
      return {
        ...s,
        predictionsMade: s.predictionsMade + 1,
        confidenceSum: s.confidenceSum + result.confidence,
        bestPrediction: best,
      };
    });
  }, []);

  const handleFeedback = useCallback((correct: boolean) => {
    setSession((s) => ({
      ...s,
      correctFeedback: s.correctFeedback + (correct ? 1 : 0),
      wrongFeedback: s.wrongFeedback + (correct ? 0 : 1),
    }));
  }, []);

  const handleEnterHardware = () => {
    setSession((s) => ({ ...s, exploredHardware: true }));
    setScreen('hardware');
  };

  const handleSaveResult = (nickname: string, career: CareerMatch) => {
    const entry: VisitorResult = {
      id: `v_${Date.now()}`,
      nickname,
      missionName: mission.name,
      examplesTaught: stats.totalExamples,
      accuracy: stats.predictionsMade > 0 ? Math.round(stats.accuracy * 100) : 0,
      careerTitle: career.title,
      careerEmoji: career.emoji,
      bestPrediction: bestPredictionName,
      createdAt: Date.now(),
    };
    saveVisitorResult(entry);
    setSavedToWall(true);
  };

  function handleFullReset() {
    resetClassifier();
    const fresh = getMissionById(DEFAULT_MISSION_ID)!;
    setMission(fresh);
    setSelectedLabel(fresh.labels[0].id);
    setCounts({});
    setSession({ ...EMPTY_SESSION, missionsTried: new Set() });
    setSavedToWall(false);
    setScreen('welcome');
  }

  const goHome = () => setScreen('welcome');

  // ----- Render -----
  return (
    <div className="circuit-bg min-h-screen">
      {/* Floating controls — no persistent top nav, matching the sibling app.
          Booth toggles stay reachable; Home/Reset appear once past welcome. */}
      <div className="fixed right-3 top-3 z-50 flex items-center gap-2">
        {screen !== 'welcome' && (
          <>
            <FloatingButton onClick={goHome} title="Back to the start screen">
              🏠 <span className="hidden sm:inline">Home</span>
            </FloatingButton>
            <FloatingButton
              onClick={handleFullReset}
              title="Clear everything and start fresh for the next visitor"
              tone="primary"
            >
              🔄 <span className="hidden sm:inline">Reset</span>
            </FloatingButton>
          </>
        )}
        <FloatingButton
          onClick={() => setPrefs((p) => ({ ...p, presenterMode: !p.presenterMode }))}
          title="Presenter Mode: bigger text for the booth"
          active={prefs.presenterMode}
          aria-pressed={prefs.presenterMode}
        >
          🔎 <span className="hidden md:inline">Presenter</span>
        </FloatingButton>
        <FloatingButton
          onClick={() => setPrefs((p) => ({ ...p, reducedMotion: !p.reducedMotion }))}
          title="Reduced motion: fewer animations"
          active={prefs.reducedMotion}
          aria-pressed={prefs.reducedMotion}
        >
          🌙 <span className="hidden md:inline">Calm</span>
        </FloatingButton>
      </div>

      <main>
        {screen === 'welcome' && (
          <WelcomeScreen
            onStart={() => setScreen('missions')}
            onVisitorWall={() => setScreen('wall')}
            reducedMotion={prefs.reducedMotion}
          />
        )}

        {screen === 'missions' && <MissionSelection onSelect={handleSelectMission} />}

        {screen === 'training' && (
          <TrainingScreen
            mission={mission}
            counts={counts}
            minPerClass={MIN_PER_CLASS}
            selectedLabel={selectedLabel}
            onSelectLabel={setSelectedLabel}
            onAddExample={handleAddExample}
            onTrained={() => {
              setDemoPretrained(false);
              setScreen('test');
            }}
            onBack={() => setScreen('missions')}
            onTryPretrained={() => {
              setDemoPretrained(true);
              setScreen('test');
            }}
          />
        )}

        {screen === 'test' && (
          <TestScreen
            mission={mission}
            onFeedback={handleFeedback}
            onTeach={handleTeachFromTest}
            onRecordPrediction={handleRecordPrediction}
            onDashboard={() => setScreen('dashboard')}
            onBackToTraining={() => {
              setDemoPretrained(false);
              setScreen('training');
            }}
            defaultAccelerated={demoPretrained}
          />
        )}

        {screen === 'dashboard' && (
          <LearningDashboard
            mission={mission}
            stats={stats}
            confusionHints={confusionHints}
            onTestMore={() => setScreen('test')}
            onHardware={handleEnterHardware}
          />
        )}

        {screen === 'hardware' && (
          <HardwarePowerScreen
            onComputeSign={() => setScreen('compute')}
            onResultCard={() => setScreen('result')}
          />
        )}

        {screen === 'compute' && (
          <ComputeSign
            onBack={() => setScreen('hardware')}
            onResultCard={() => setScreen('result')}
          />
        )}

        {screen === 'result' && (
          <ResultCard
            mission={mission}
            stats={stats}
            bestPredictionName={bestPredictionName}
            onSave={handleSaveResult}
            onVisitorWall={() => setScreen('wall')}
            onReset={handleFullReset}
            saved={savedToWall}
          />
        )}

        {screen === 'wall' && (
          <VisitorWall onStart={() => setScreen('missions')} onHome={goHome} />
        )}
      </main>

      <footer className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
        Train a Tiny AI · An AMD-inspired compute demo for STEM festivals · Built with React +
        TypeScript · Runs fully in your browser
      </footer>
    </div>
  );
}

/** Floating booth control pill. Replaces the old persistent top nav bar. */
function FloatingButton({
  children,
  onClick,
  title,
  active = false,
  tone = 'ghost',
  ...rest
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  tone?: 'ghost' | 'primary';
} & ComponentPropsWithoutRef<'button'>) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur transition active:scale-95';
  const styles =
    tone === 'primary'
      ? 'border-amd-orange/60 bg-gradient-to-r from-amd-red to-amd-orange text-white shadow-glow-orange hover:brightness-110'
      : active
        ? 'border-amd-orange/60 bg-amd-orange/20 text-amd-amber shadow-glow-orange'
        : 'border-white/15 bg-black/40 text-slate-300 hover:bg-black/60';
  return (
    <button type="button" onClick={onClick} title={title} className={`${base} ${styles}`} {...rest}>
      {children}
    </button>
  );
}
