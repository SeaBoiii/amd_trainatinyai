import type { FeatureAxis } from '../types';

/**
 * Helpers for slider-based missions. These turn a set of human-friendly slider
 * values into the same kind of normalised number[] vector the drawing missions
 * produce, so the KNN classifier works identically for both.
 */

/** Starting slider values for a mission (one per feature axis). */
export function defaultFeatureValues(axes: FeatureAxis[]): Record<string, number> {
  return Object.fromEntries(axes.map((a) => [a.id, a.default]));
}

/**
 * Converts raw slider values into a normalised 0..1 feature vector, in the same
 * order as `axes`. Each value is scaled to its axis range so every feature
 * counts equally — the same idea as normalising pixel brightness for drawings.
 */
export function featuresToVector(
  values: Record<string, number>,
  axes: FeatureAxis[],
): number[] {
  return axes.map((a) => {
    const raw = values[a.id] ?? a.default;
    const span = a.max - a.min || 1;
    const norm = (raw - a.min) / span;
    return Math.max(0, Math.min(1, norm));
  });
}

/**
 * Turns a normalised colour vector [r, g, b] (each 0..1) into a CSS rgb()
 * string. Used to preview colour-mission examples as real colour swatches.
 */
export function colorFromVector(vector: number[]): string {
  const r = Math.round((vector[0] ?? 0) * 255);
  const g = Math.round((vector[1] ?? 0) * 255);
  const b = Math.round((vector[2] ?? 0) * 255);
  return `rgb(${r}, ${g}, ${b})`;
}
