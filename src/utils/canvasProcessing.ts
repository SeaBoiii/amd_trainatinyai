const VECTOR_SIZE = 16;

export function extractVectorFromCanvas(
  canvas: HTMLCanvasElement,
  targetSize = VECTOR_SIZE
): number[] {
  const tinyCanvas = document.createElement("canvas");
  tinyCanvas.width = targetSize;
  tinyCanvas.height = targetSize;

  const ctx = tinyCanvas.getContext("2d");
  if (!ctx) {
    return [];
  }

  // White background improves consistency for transparent areas.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.drawImage(canvas, 0, 0, targetSize, targetSize);

  const image = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = image.data;
  const vector: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const grayscale = (r + g + b) / 3;
    // Invert so dark pen strokes become higher values.
    const normalized = (255 - grayscale) / 255;
    vector.push(Number(normalized.toFixed(4)));
  }

  return vector;
}

export function vectorInkAmount(vector: number[]): number {
  if (!vector.length) {
    return 0;
  }

  const sum = vector.reduce((acc, v) => acc + v, 0);
  return sum / vector.length;
}
