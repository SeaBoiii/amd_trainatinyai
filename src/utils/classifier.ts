import type {
  ClassScore,
  NeighborMatch,
  PredictionResult,
  TrainingExample,
} from '../types';
import { VECTOR_LENGTH } from '../types';

/**
 * A tiny K-Nearest-Neighbour (KNN) classifier that runs entirely in the
 * browser. This is a real (if small) machine-learning model:
 *
 *  - "Training" = remembering the example vectors the visitor draws.
 *  - "Predicting" = comparing a new drawing to every stored example using
 *    Euclidean distance, then letting the closest `k` examples vote.
 *
 * Nothing here is faked: the prediction is fully determined by the examples
 * the visitor provided.
 */

let examples: TrainingExample[] = [];
let nextId = 0;

/** Removes all stored examples (used when resetting for the next visitor). */
export function resetClassifier(): void {
  examples = [];
}

/** Adds one example vector for a given class label. Returns the new example. */
export function addExample(label: string, vector: number[]): TrainingExample {
  const example: TrainingExample = {
    id: `ex_${Date.now()}_${nextId++}`,
    label,
    vector,
    createdAt: Date.now(),
  };
  examples.push(example);
  return example;
}

/** Returns a shallow copy of all stored examples. */
export function getExamples(): TrainingExample[] {
  return examples.slice();
}

/** Counts how many examples exist for each label id. */
export function countByLabel(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ex of examples) {
    counts[ex.label] = (counts[ex.label] ?? 0) + 1;
  }
  return counts;
}

/** Euclidean distance between two equal-length vectors. */
export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Converts a distance into a 0..1 similarity score. The maximum possible
 * distance between two normalised vectors of length `dim` is sqrt(dim) (every
 * value differs by 1), so we scale against that for an intuitive percentage.
 * Scaling by the real dimension keeps confidence meaningful for both the
 * 400-value drawing vectors and the short feature vectors of slider missions.
 */
function distanceToSimilarity(distance: number, dim: number): number {
  const maxDistance = Math.sqrt(dim) || 1;
  const similarity = 1 - distance / maxDistance;
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Predicts the class of a test vector.
 *
 * @param vector   The normalised drawing vector to classify.
 * @param allLabels Every possible label id for the current mission, so classes
 *                  with zero votes still appear (at 0%) in the confidence list.
 * @param k        Number of nearest neighbours to consult.
 */
export function predict(
  vector: number[],
  allLabels: string[],
  k = 3,
): PredictionResult {
  // Not enough data to make any real comparison.
  if (examples.length === 0) {
    return {
      predictedLabel: null,
      confidence: 0,
      scores: allLabels.map((label) => ({ label, confidence: 0 })),
      neighbors: [],
      insufficientData: true,
    };
  }

  // 1. Measure distance to every stored example.
  const dim = vector.length;
  const ranked: NeighborMatch[] = examples
    .map((example) => {
      const distance = euclideanDistance(vector, example.vector);
      return {
        example,
        distance,
        similarity: distanceToSimilarity(distance, dim),
      };
    })
    .sort((a, b) => a.distance - b.distance);

  // 2. Keep the k closest neighbours (or fewer if we don't have k yet).
  const effectiveK = Math.min(k, ranked.length);
  const neighbors = ranked.slice(0, effectiveK);

  // 3. Each neighbour votes for its label, weighted by similarity so closer
  //    matches count for more. This gives smooth, explainable confidence.
  const weightByLabel: Record<string, number> = {};
  for (const label of allLabels) weightByLabel[label] = 0;

  let totalWeight = 0;
  for (const n of neighbors) {
    // Add a small epsilon so an exact match (similarity 1) still dominates
    // without letting a single far neighbour contribute nothing at all.
    const weight = n.similarity + 0.01;
    weightByLabel[n.example.label] = (weightByLabel[n.example.label] ?? 0) + weight;
    totalWeight += weight;
  }

  // 4. Turn vote weights into 0..1 confidence scores.
  const scores: ClassScore[] = allLabels
    .map((label) => ({
      label,
      confidence: totalWeight > 0 ? weightByLabel[label] / totalWeight : 0,
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const top = scores[0];

  return {
    predictedLabel: top.confidence > 0 ? top.label : null,
    confidence: top.confidence,
    scores,
    neighbors,
    insufficientData: false,
  };
}

/**
 * Returns simple, beginner-friendly confusion hints by finding pairs of classes
 * whose example drawings look similar on average. Helps the dashboard say
 * things like "Circle and Square drawings may be confused".
 */
export function getConfusionHints(
  labelNames: Record<string, string>,
  maxHints = 2,
): string[] {
  const byLabel: Record<string, number[][]> = {};
  for (const ex of examples) {
    (byLabel[ex.label] ??= []).push(ex.vector);
  }

  const labels = Object.keys(byLabel);
  if (labels.length < 2) return [];

  // Vectors all share the same dimension within a mission.
  const dim = examples[0]?.vector.length ?? VECTOR_LENGTH;

  // Average vector (centroid) per class.
  const centroids: Record<string, number[]> = {};
  for (const label of labels) {
    const vecs = byLabel[label];
    const mean = new Array<number>(dim).fill(0);
    for (const v of vecs) {
      for (let i = 0; i < dim; i++) mean[i] += v[i];
    }
    for (let i = 0; i < dim; i++) mean[i] /= vecs.length;
    centroids[label] = mean;
  }

  // Compare every pair of centroids; closer pairs are more confusable.
  const pairs: { a: string; b: string; distance: number }[] = [];
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      pairs.push({
        a: labels[i],
        b: labels[j],
        distance: euclideanDistance(centroids[labels[i]], centroids[labels[j]]),
      });
    }
  }

  pairs.sort((p, q) => p.distance - q.distance);

  const maxDistance = Math.sqrt(dim) || 1;
  return pairs
    .filter((p) => p.distance / maxDistance < 0.4) // only flag genuinely close pairs
    .slice(0, maxHints)
    .map(
      (p) =>
        `${labelNames[p.a] ?? p.a} and ${labelNames[p.b] ?? p.b} examples may be confused — try making them more different.`,
    );
}
