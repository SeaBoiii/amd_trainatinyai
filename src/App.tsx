import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { MissionSelection } from "./components/MissionSelection";
import { TrainingScreen } from "./components/TrainingScreen";
import { TestScreen } from "./components/TestScreen";
import { LearningDashboard } from "./components/LearningDashboard";
import { HardwarePowerScreen } from "./components/HardwarePowerScreen";
import { ResultCard } from "./components/ResultCard";
import { VisitorWall } from "./components/VisitorWall";
import { missions } from "./data/missions";
import { hardwareConcepts } from "./data/hardwareConcepts";
import { getCareerMatch } from "./data/careers";
import { TinyKNNClassifier } from "./utils/classifier";
import {
  AppSettings,
  clearVisitorWall,
  loadSettings,
  loadVisitorWall,
  saveSettings,
  saveVisitorResult
} from "./utils/storage";
import { Mission, PredictionResult, TrainingExample, VisitorResult } from "./types";

type Screen =
  | "welcome"
  | "missions"
  | "training"
  | "test"
  | "dashboard"
  | "hardware"
  | "result"
  | "wall";

const classifier = new TinyKNNClassifier();

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [examples, setExamples] = useState<TrainingExample[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(null);
  const [confidenceHistory, setConfidenceHistory] = useState<number[]>([]);
  const [feedbackCorrect, setFeedbackCorrect] = useState(0);
  const [feedbackWrong, setFeedbackWrong] = useState(0);
  const [improvementCount, setImprovementCount] = useState(0);
  const [visitedHardware, setVisitedHardware] = useState(false);
  const [missionsTried, setMissionsTried] = useState<string[]>([]);
  const [nickname, setNickname] = useState("");
  const [wallEntries, setWallEntries] = useState<VisitorResult[]>([]);

  const [settings, setSettings] = useState<AppSettings>({
    presenterMode: false,
    reducedMotion: false
  });

  useEffect(() => {
    setSettings(loadSettings());
    setWallEntries(loadVisitorWall());
  }, []);

  useEffect(() => {
    saveSettings(settings);
    document.body.classList.toggle("reduced-motion", settings.reducedMotion);
  }, [settings]);

  const resetVisitor = () => {
    classifier.clear();
    setSelectedMission(null);
    setExamples([]);
    setLatestPrediction(null);
    setConfidenceHistory([]);
    setFeedbackCorrect(0);
    setFeedbackWrong(0);
    setImprovementCount(0);
    setVisitedHardware(false);
    setNickname("");
    setScreen("welcome");
  };

  const handleSelectMission = (mission: Mission) => {
    classifier.clear();
    setSelectedMission(mission);
    setExamples([]);
    setLatestPrediction(null);
    setConfidenceHistory([]);
    setFeedbackCorrect(0);
    setFeedbackWrong(0);
    setImprovementCount(0);
    setMissionsTried((prev) => Array.from(new Set([...prev, mission.id])));
    setScreen("training");
  };

  const addExample = (label: string, vector: number[]) => {
    const newExample = classifier.addExample(label, vector);
    setExamples((prev) => [...prev, newExample]);
  };

  const updateTraining = () => {
    classifier.addExamples(examples);
  };

  const predict = (vector: number[]) => {
    if (!selectedMission) {
      return {
        predictedLabel: null,
        confidence: 0,
        confidenceByClass: [],
        nearestExamples: [],
        topGuesses: []
      };
    }

    const result = classifier.predict(vector, selectedMission.labels, 3);
    setLatestPrediction(result);
    if (result.confidence > 0) {
      setConfidenceHistory((prev) => [...prev, result.confidence]);
    }
    return result;
  };

  const counts = useMemo(() => {
    if (!selectedMission) {
      return {} as Record<string, number>;
    }
    return classifier.getLabelCounts(selectedMission.labels);
  }, [examples, selectedMission]);

  const averageConfidence = useMemo(() => {
    if (!confidenceHistory.length) {
      return 0;
    }
    const total = confidenceHistory.reduce((acc, c) => acc + c, 0);
    return total / confidenceHistory.length;
  }, [confidenceHistory]);

  const accuracy = useMemo(() => {
    const total = feedbackCorrect + feedbackWrong;
    return total ? (feedbackCorrect / total) * 100 : 0;
  }, [feedbackCorrect, feedbackWrong]);

  const careerMatch = getCareerMatch({
    examplesTaught: examples.length,
    accuracy,
    viewedHardware: visitedHardware,
    improvementCount,
    missionsTried: missionsTried.length
  });

  const bestPrediction = latestPrediction?.predictedLabel ?? "N/A";

  const saveCard = () => {
    if (!selectedMission) {
      return;
    }

    const entry: VisitorResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nickname: nickname.trim() || "Guest Trainer",
      missionName: selectedMission.name,
      examplesTaught: examples.length,
      accuracy,
      careerMatch,
      bestPrediction,
      dateIso: new Date().toISOString()
    };

    const updated = saveVisitorResult(entry);
    setWallEntries(updated);
    setScreen("wall");
  };

  return (
    <div className={`min-h-screen ${settings.presenterMode ? "text-lg" : "text-base"}`}>
      <Header
        presenterMode={settings.presenterMode}
        reducedMotion={settings.reducedMotion}
        onTogglePresenter={() => setSettings((s) => ({ ...s, presenterMode: !s.presenterMode }))}
        onToggleMotion={() => setSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }))}
        onResetVisitor={resetVisitor}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
        {screen === "welcome" ? (
          <WelcomeScreen onStart={() => setScreen("missions")} onVisitorWall={() => setScreen("wall")} reducedMotion={settings.reducedMotion} />
        ) : null}

        {screen === "missions" ? (
          <MissionSelection missions={missions} onSelect={handleSelectMission} onBack={() => setScreen("welcome")} />
        ) : null}

        {screen === "training" && selectedMission ? (
          <TrainingScreen
            mission={selectedMission}
            examples={examples}
            onAddExample={addExample}
            onTrain={updateTraining}
            onContinue={() => setScreen("test")}
            presenterMode={settings.presenterMode}
          />
        ) : null}

        {screen === "test" && selectedMission ? (
          <TestScreen
            mission={selectedMission}
            onPredict={predict}
            onFeedback={(correct) => {
              if (correct) {
                setFeedbackCorrect((v) => v + 1);
              } else {
                setFeedbackWrong((v) => v + 1);
              }
            }}
            onTeachFromTest={(label, vector) => {
              addExample(label, vector);
              setImprovementCount((v) => v + 1);
            }}
            onNext={() => setScreen("dashboard")}
            presenterMode={settings.presenterMode}
          />
        ) : null}

        {screen === "dashboard" && selectedMission ? (
          <LearningDashboard
            counts={counts}
            feedbackCorrect={feedbackCorrect}
            feedbackWrong={feedbackWrong}
            averageConfidence={averageConfidence}
            onNext={() => {
              setVisitedHardware(true);
              setScreen("hardware");
            }}
          />
        ) : null}

        {screen === "hardware" ? (
          <HardwarePowerScreen concepts={hardwareConcepts} onContinue={() => setScreen("result")} />
        ) : null}

        {screen === "result" && selectedMission ? (
          <ResultCard
            nickname={nickname}
            setNickname={setNickname}
            missionName={selectedMission.name}
            examplesTaught={examples.length}
            accuracy={accuracy}
            bestPrediction={bestPrediction}
            careerMatch={careerMatch}
            onSave={saveCard}
            onBackToStart={resetVisitor}
          />
        ) : null}

        {screen === "wall" ? (
          <VisitorWall
            entries={wallEntries}
            onBack={() => setScreen("welcome")}
            onClear={() => {
              clearVisitorWall();
              setWallEntries([]);
            }}
          />
        ) : null}
      </main>
    </div>
  );
}
