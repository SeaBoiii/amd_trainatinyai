export type ClassLabel = string;

export interface Mission {
  id: string;
  name: string;
  icon: string;
  description: string;
  labels: ClassLabel[];
  difficulty: "Easy" | "Medium" | "Challenging";
  estTimeMinutes: number;
  recommended?: boolean;
}

export interface TrainingExample {
  id: string;
  label: ClassLabel;
  vector: number[];
  createdAt: number;
}

export interface ConfidenceScore {
  label: ClassLabel;
  score: number;
}

export interface NearestExample {
  label: ClassLabel;
  distance: number;
}

export interface PredictionResult {
  predictedLabel: ClassLabel | null;
  confidence: number;
  confidenceByClass: ConfidenceScore[];
  nearestExamples: NearestExample[];
  topGuesses: ConfidenceScore[];
}

export type CareerMatch =
  | "Machine Learning Engineer"
  | "AI Researcher"
  | "AI Hardware Engineer"
  | "Data Scientist"
  | "STEM Innovator";

export interface VisitorResult {
  id: string;
  nickname: string;
  missionName: string;
  examplesTaught: number;
  accuracy: number;
  careerMatch: CareerMatch;
  bestPrediction: string;
  dateIso: string;
}

export interface HardwareConcept {
  key: "CPU" | "GPU" | "NPU" | "Memory" | "Storage";
  title: string;
  summary: string;
  role: string;
}
