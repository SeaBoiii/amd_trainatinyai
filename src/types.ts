// Core data model for "Train a Tiny AI"
// All types are intentionally small and explainable for a STEM booth demo.

/** Size of the downsampled grayscale grid used as the model input vector. */
export const GRID_SIZE = 20;
/** Length of a flattened example vector (GRID_SIZE * GRID_SIZE). */
export const VECTOR_LENGTH = GRID_SIZE * GRID_SIZE;

/** A single category the visitor can teach the AI to recognise. */
export interface ClassLabel {
  /** Stable id used as a key in maps and storage. */
  id: string;
  /** Friendly display name, e.g. "Circle". */
  name: string;
  /** Emoji shown on the label button. */
  emoji: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/**
 * How the visitor creates an example for a mission.
 *  - 'draw'    : draw on the canvas (vector = pixel grid)
 *  - 'sliders' : adjust feature sliders (vector = normalised feature values)
 */
export type MissionInputType = 'draw' | 'sliders';

/** How a slider-mission example should be previewed in the UI. */
export type FeaturePreview = 'color' | 'bars';

/** One adjustable feature (slider) used by slider-based missions. */
export interface FeatureAxis {
  id: string;
  name: string;
  emoji: string;
  /** Slider range. */
  min: number;
  max: number;
  /** Starting value. */
  default: number;
  /** Optional friendly labels for the low and high ends. */
  lowLabel?: string;
  highLabel?: string;
}

/** A pre-built activity the visitor can choose. */
export interface Mission {
  id: string;
  name: string;
  emoji: string;
  description: string;
  labels: ClassLabel[];
  difficulty: Difficulty;
  /** Estimated completion time, e.g. "2 min". */
  estimatedTime: string;
  /** Marks the suggested default mission for the booth. */
  recommended?: boolean;
  /** Tailwind gradient classes for the card accent. */
  accent: string;
  /** How the visitor makes examples for this mission. Defaults to 'draw'. */
  inputType: MissionInputType;
  /** For 'sliders' missions: the feature axes the visitor adjusts. */
  features?: FeatureAxis[];
  /** For 'sliders' missions: how to preview an example. */
  preview?: FeaturePreview;
}

/** One drawing the visitor added as training data. */
export interface TrainingExample {
  /** Unique id for this example. */
  id: string;
  /** The ClassLabel id this example belongs to. */
  label: string;
  /**
   * Normalised feature vector (values 0..1). For 'draw' missions this is the
   * flattened grayscale pixel grid (length VECTOR_LENGTH); for 'sliders'
   * missions it is one value per feature axis.
   */
  vector: number[];
  /** When the example was captured. */
  createdAt: number;
}

/** A nearest example returned alongside a prediction (for the "show your work" panel). */
export interface NeighborMatch {
  example: TrainingExample;
  /** Euclidean distance to the test vector (smaller = more similar). */
  distance: number;
  /** Similarity score 0..1 derived from distance (1 = identical). */
  similarity: number;
}

/** Per-class confidence score from the classifier. */
export interface ClassScore {
  label: string;
  /** Confidence 0..1 for this class. */
  confidence: number;
}

/** The full result of asking the AI to classify a drawing. */
export interface PredictionResult {
  /** Winning ClassLabel id, or null when there is not enough data. */
  predictedLabel: string | null;
  /** Confidence 0..1 of the winning label. */
  confidence: number;
  /** All class scores, sorted high to low. */
  scores: ClassScore[];
  /** The nearest training examples that drove the decision. */
  neighbors: NeighborMatch[];
  /** True when the model had too few examples to make a real prediction. */
  insufficientData: boolean;
}

/** A possible "career match" outcome shown on the result card. */
export interface CareerMatch {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
}

/** A piece of hardware explained on the Hardware Power screen. */
export interface HardwareConcept {
  id: string;
  name: string;
  short: string;
  emoji: string;
  /** Beginner-friendly explanation of the component's role. */
  description: string;
  /** Conceptual role in the "AI Workload Race" visual. */
  raceRole: string;
  /** Relative bar fill 0..100 for the conceptual race (not a benchmark claim). */
  raceFill: number;
  /** Tailwind colour for the component's accents. */
  color: string;
}

/** Aggregate stats describing how the session went. */
export interface SessionStats {
  totalExamples: number;
  classesTrained: number;
  totalClasses: number;
  predictionsMade: number;
  correctFeedback: number;
  wrongFeedback: number;
  /** Accuracy 0..1 based on visitor feedback. */
  accuracy: number;
  /** Average winning confidence 0..1 across predictions. */
  averageConfidence: number;
  /** Number of times the visitor used the "teach this example" loop. */
  improvementsUsed: number;
  /** Number of distinct missions the visitor tried this session. */
  missionsTried: number;
  /** Whether the hardware screen was viewed. */
  exploredHardware: boolean;
}

/** A saved entry on the Visitor Wall. */
export interface VisitorResult {
  id: string;
  nickname: string;
  missionName: string;
  examplesTaught: number;
  /** Accuracy as a whole-number percentage. */
  accuracy: number;
  careerTitle: string;
  careerEmoji: string;
  bestPrediction: string;
  createdAt: number;
}

/** The screens the app can show. */
export type Screen =
  | 'welcome'
  | 'missions'
  | 'training'
  | 'test'
  | 'dashboard'
  | 'hardware'
  | 'compute'
  | 'result'
  | 'wall';
