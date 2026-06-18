import { GRID_SIZE, VECTOR_LENGTH } from '../types';

/**
 * Turns a drawing canvas into a small, normalised grayscale vector that the
 * KNN classifier can compare. This is the "feature extraction" step.
 *
 * Steps:
 *  1. Read the raw RGBA pixels from the canvas.
 *  2. Convert each pixel to a single "ink" value (how dark / how much was drawn).
 *  3. Downsample the big canvas into a small GRID_SIZE x GRID_SIZE grid by
 *     averaging the ink in each block.
 *  4. Normalise so the strongest stroke in the drawing is 1.0. This makes the
 *     AI focus on the SHAPE rather than how hard someone pressed.
 *
 * Returns a flat array of length VECTOR_LENGTH with values from 0 to 1.
 */
export function canvasToVector(canvas: HTMLCanvasElement): number[] {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return new Array(VECTOR_LENGTH).fill(0);
  }

  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height).data;

  const cellW = width / GRID_SIZE;
  const cellH = height / GRID_SIZE;

  const grid = new Array<number>(VECTOR_LENGTH).fill(0);
  let maxInk = 0;

  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const startX = Math.floor(gx * cellW);
      const endX = Math.floor((gx + 1) * cellW);
      const startY = Math.floor(gy * cellH);
      const endY = Math.floor((gy + 1) * cellH);

      let inkSum = 0;
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          const alpha = image[idx + 3] / 255;
          // Average the colour channels, then weight by alpha. The canvas is
          // drawn with a bright stroke on a dark background, so brightness is
          // a good proxy for "there is ink here".
          const brightness = (image[idx] + image[idx + 1] + image[idx + 2]) / (3 * 255);
          inkSum += brightness * alpha;
          count++;
        }
      }

      const value = count > 0 ? inkSum / count : 0;
      grid[gy * GRID_SIZE + gx] = value;
      if (value > maxInk) maxInk = value;
    }
  }

  // Normalise so the brightest cell becomes 1.0 (avoids divide-by-zero).
  if (maxInk > 0) {
    for (let i = 0; i < grid.length; i++) {
      grid[i] = grid[i] / maxInk;
    }
  }

  return grid;
}

/** Returns true when the drawing has enough ink to be a real example. */
export function hasEnoughInk(vector: number[], threshold = 4): boolean {
  let inkCells = 0;
  for (const v of vector) {
    if (v > 0.15) inkCells++;
  }
  return inkCells >= threshold;
}

/**
 * Renders a stored vector back into a small canvas so we can show the visitor
 * the "nearest examples" the AI compared against. Each grid value becomes a
 * warm-coloured pixel block.
 */
export function drawVectorToCanvas(canvas: HTMLCanvasElement, vector: number[]): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  const cellW = width / GRID_SIZE;
  const cellH = height / GRID_SIZE;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0A0E14';
  ctx.fillRect(0, 0, width, height);

  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const value = vector[gy * GRID_SIZE + gx];
      if (value <= 0.05) continue;
      // Warm AMD-inspired gradient from orange to red as ink gets stronger.
      const r = 255;
      const g = Math.round(160 - value * 130);
      const b = Math.round(40 - value * 40);
      ctx.fillStyle = `rgba(${r}, ${Math.max(0, g)}, ${Math.max(0, b)}, ${0.25 + value * 0.75})`;
      ctx.fillRect(gx * cellW, gy * cellH, Math.ceil(cellW), Math.ceil(cellH));
    }
  }
}
