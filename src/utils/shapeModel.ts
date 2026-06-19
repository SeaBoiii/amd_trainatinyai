import * as ort from 'onnxruntime-web/webgpu';
import type { ClassScore, PredictionResult } from '../types';

/**
 * Optional "accelerated" inference for the Shape Sorter mission.
 *
 * Unlike the live-training KNN (src/utils/classifier.ts), this runs a REAL
 * pretrained neural network (a tiny MLP exported to ONNX by
 * tools/train_shapes.py) entirely in the browser via onnxruntime-web.
 *
 * It tries hardware backends in order of preference and reports which one the
 * visitor's machine actually used:
 *   1. WebNN → NPU   (e.g. AMD Ryzen AI)
 *   2. WebNN → GPU
 *   3. WebGPU → GPU
 *   4. WASM   → CPU  (always available fallback)
 */

/** Output order MUST match LABELS in tools/train_shapes.py. */
export const SHAPE_MODEL_LABELS = ['circle', 'triangle', 'square', 'star'] as const;

export type ComputeDevice = 'NPU' | 'GPU' | 'CPU';

export interface AcceleratorInfo {
  /** Human-friendly device class actually used. */
  device: ComputeDevice;
  /** Emoji for the booth badge. */
  emoji: string;
  /** Which onnxruntime execution provider succeeded. */
  backend: 'webnn-npu' | 'webnn-gpu' | 'webgpu' | 'wasm';
  /** Short label for the UI, e.g. "NPU (WebNN)". */
  label: string;
}

// onnxruntime-web ships its WASM/JSEP assets separately. We vendor them into
// public/ort (see scripts/copy-ort-assets.mjs) and load them locally so the
// booth works fully OFFLINE — no CDN required.
ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`;
// Single-threaded avoids the cross-origin-isolation (COOP/COEP) requirement of
// threaded WASM, so the CPU fallback works on a plain static host.
ort.env.wasm.numThreads = 1;
ort.env.logLevel = 'error';

const MODEL_URL = `${import.meta.env.BASE_URL}models/shape-classifier.onnx`;

interface LoadedModel {
  session: ort.InferenceSession;
  info: AcceleratorInfo;
}

const ATTEMPTS: {
  providers: ort.InferenceSession.SessionOptions['executionProviders'];
  info: AcceleratorInfo;
}[] = [
  {
    providers: [{ name: 'webnn', deviceType: 'npu', powerPreference: 'high-performance' }],
    info: { device: 'NPU', emoji: '⚡', backend: 'webnn-npu', label: 'NPU (WebNN)' },
  },
  {
    providers: [{ name: 'webnn', deviceType: 'gpu' }],
    info: { device: 'GPU', emoji: '🎮', backend: 'webnn-gpu', label: 'GPU (WebNN)' },
  },
  {
    providers: ['webgpu'],
    info: { device: 'GPU', emoji: '🎮', backend: 'webgpu', label: 'GPU (WebGPU)' },
  },
  {
    providers: ['wasm'],
    info: { device: 'CPU', emoji: '🧩', backend: 'wasm', label: 'CPU (WASM)' },
  },
];

let loadPromise: Promise<LoadedModel> | null = null;

/** Runs a zero-input warmup so a backend that *creates* but cannot *run* is rejected. */
async function warmup(session: ort.InferenceSession): Promise<void> {
  const dummy = new ort.Tensor('float32', new Float32Array(400), [1, 400]);
  const feeds = { [session.inputNames[0]]: dummy };
  await session.run(feeds);
}

async function loadModel(): Promise<LoadedModel> {
  let lastError: unknown;
  for (const attempt of ATTEMPTS) {
    try {
      const session = await ort.InferenceSession.create(MODEL_URL, {
        executionProviders: attempt.providers,
      });
      await warmup(session);
      return { session, info: attempt.info };
    } catch (err) {
      lastError = err;
      // Try the next backend in the fallback chain.
    }
  }
  throw new Error(
    `No usable inference backend (WebNN/WebGPU/WASM). Last error: ${String(lastError)}`,
  );
}

/** Lazily loads the model once and caches the chosen backend. */
export function getShapeModel(): Promise<LoadedModel> {
  if (!loadPromise) {
    loadPromise = loadModel().catch((err) => {
      // Allow a later retry if the first attempt failed (e.g. offline CDN).
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

/** Resolves which compute device will be used, loading the model if needed. */
export async function detectAccelerator(): Promise<AcceleratorInfo> {
  const { info } = await getShapeModel();
  return info;
}

/**
 * Classifies a 20x20 normalised ink vector (same format as canvasToVector) with
 * the pretrained model. The returned shape matches the KNN's PredictionResult
 * so the existing PredictionPanel can render it unchanged.
 */
export async function classifyShape(
  vector: number[],
  allLabels: string[],
): Promise<PredictionResult & { accelerator: AcceleratorInfo }> {
  const { session, info } = await getShapeModel();

  const input = new ort.Tensor('float32', Float32Array.from(vector), [1, vector.length]);
  const output = await session.run({ [session.inputNames[0]]: input });
  const probs = output[session.outputNames[0]].data as Float32Array;

  // Map model outputs to the mission's label ids, keeping any extra labels at 0.
  const scores: ClassScore[] = allLabels.map((label) => {
    const idx = SHAPE_MODEL_LABELS.indexOf(label as (typeof SHAPE_MODEL_LABELS)[number]);
    return { label, confidence: idx >= 0 ? probs[idx] : 0 };
  });
  scores.sort((a, b) => b.confidence - a.confidence);

  const top = scores[0];
  return {
    predictedLabel: top && top.confidence > 0 ? top.label : null,
    confidence: top ? top.confidence : 0,
    scores,
    neighbors: [],
    insufficientData: false,
    accelerator: info,
  };
}

/** True only for missions whose labels the pretrained model actually knows. */
export function supportsAcceleratedModel(labelIds: string[]): boolean {
  return labelIds.every((id) =>
    SHAPE_MODEL_LABELS.includes(id as (typeof SHAPE_MODEL_LABELS)[number]),
  );
}
