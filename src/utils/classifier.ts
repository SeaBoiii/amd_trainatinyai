import {
  ClassLabel,
  PredictionResult,
  TrainingExample,
  ConfidenceScore,
  NearestExample
} from "../types";

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export class TinyKNNClassifier {
  private examples: TrainingExample[] = [];

  addExample(label: ClassLabel, vector: number[]): TrainingExample {
    const newExample: TrainingExample = {
      id: `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      vector,
      createdAt: Date.now()
    };

    this.examples.push(newExample);
    return newExample;
  }

  addExamples(examples: TrainingExample[]): void {
    this.examples = [...examples];
  }

  clear(): void {
    this.examples = [];
  }

  getExamples(): TrainingExample[] {
    return this.examples;
  }

  getLabelCounts(labels: ClassLabel[]): Record<ClassLabel, number> {
    return labels.reduce<Record<ClassLabel, number>>((acc, label) => {
      acc[label] = this.examples.filter((ex) => ex.label === label).length;
      return acc;
    }, {} as Record<ClassLabel, number>);
  }

  predict(vector: number[], labels: ClassLabel[], k = 3): PredictionResult {
    if (!this.examples.length || !vector.length) {
      return {
        predictedLabel: null,
        confidence: 0,
        confidenceByClass: labels.map((label) => ({ label, score: 0 })),
        nearestExamples: [],
        topGuesses: []
      };
    }

    const withDistances = this.examples
      .map((example) => ({
        label: example.label,
        distance: euclideanDistance(vector, example.vector)
      }))
      .sort((a, b) => a.distance - b.distance);

    const nearest = withDistances.slice(0, Math.max(1, k));

    const votes = new Map<ClassLabel, number>();
    nearest.forEach((n) => {
      const weight = 1 / (n.distance + 0.0001);
      votes.set(n.label, (votes.get(n.label) ?? 0) + weight);
    });

    const totalWeight = Array.from(votes.values()).reduce((acc, v) => acc + v, 0) || 1;

    const confidenceByClass: ConfidenceScore[] = labels.map((label) => {
      const score = (votes.get(label) ?? 0) / totalWeight;
      return { label, score };
    });

    confidenceByClass.sort((a, b) => b.score - a.score);
    const predictedLabel = confidenceByClass[0]?.label ?? null;
    const confidence = (confidenceByClass[0]?.score ?? 0) * 100;

    const nearestExamples: NearestExample[] = nearest.map((n) => ({
      label: n.label,
      distance: Number(n.distance.toFixed(3))
    }));

    return {
      predictedLabel,
      confidence,
      confidenceByClass,
      nearestExamples,
      topGuesses: confidenceByClass.slice(0, 3)
    };
  }
}
