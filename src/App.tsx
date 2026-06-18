import { useCallback, useEffect, useMemo, useState } from 'react';
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
import Header from './components/Header';
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
      <Header
        onHome={goHome}
        onReset={handleFullReset}
        presenterMode={prefs.presenterMode}
        reducedMotion={prefs.reducedMotion}
        onTogglePresenter={() =>
          setPrefs((p) => ({ ...p, presenterMode: !p.presenterMode }))
        }
        onToggleMotion={() => setPrefs((p) => ({ ...p, reducedMotion: !p.reducedMotion }))}
        currentScreen={screen}
      />

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
            onTrained={() => setScreen('test')}
            onBack={() => setScreen('missions')}
          />
        )}

        {screen === 'test' && (
          <TestScreen
            mission={mission}
            onFeedback={handleFeedback}
            onTeach={handleTeachFromTest}
            onRecordPrediction={handleRecordPrediction}
            onDashboard={() => setScreen('dashboard')}
            onBackToTraining={() => setScreen('training')}
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

      <footer className="border-t border-amd-line/60 px-4 py-4 text-center text-xs text-slate-500">
        Train a Tiny AI · An AMD-inspired compute demo for STEM festivals · Built with React +
        TypeScript · Runs fully in your browser
      </footer>
    </div>
  );
}
