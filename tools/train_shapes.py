"""
Train a tiny shape classifier and export it to ONNX.

This produces a REAL (small) neural network that recognises four hand-drawn
shapes — circle, triangle, square, star — using the exact same 20x20 normalised
"ink" representation the web app feeds its KNN classifier
(see src/utils/canvasProcessing.ts). The exported model is loaded in the browser
by onnxruntime-web and can run on an NPU (via WebNN), the GPU (WebGPU) or the
CPU (WASM).

Training data is generated procedurally: we draw shape *outlines* (the visitor
draws outlines, not filled shapes) at higher resolution with random position,
size, rotation, stroke width and a little noise, then downsample to 20x20 and
normalise so the strongest stroke is 1.0 — mirroring canvasToVector().

Run:
    python tools/train_shapes.py
Outputs:
    public/models/shape-classifier.onnx
"""

from __future__ import annotations

import math
import os

import numpy as np
from PIL import Image, ImageDraw

# ----- Must match the web app -----
GRID = 20                 # GRID_SIZE in src/types.ts
VECTOR_LENGTH = GRID * GRID
HIRES = 80                # render big, then downsample (4x4 average)
BLOCK = HIRES // GRID
LABELS = ["circle", "triangle", "square", "star"]  # order = mission label ids
NUM_CLASSES = len(LABELS)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "models")
OUT_PATH = os.path.join(OUT_DIR, "shape-classifier.onnx")


# --------------------------------------------------------------------------- #
# Synthetic data generation
# --------------------------------------------------------------------------- #
def render_shape(kind: str, rng: np.random.Generator) -> np.ndarray:
    """Render one augmented outline shape into a normalised 400-length vector."""
    img = Image.new("L", (HIRES, HIRES), 0)
    draw = ImageDraw.Draw(img)

    cx = HIRES / 2 + rng.uniform(-7, 7)
    cy = HIRES / 2 + rng.uniform(-7, 7)
    r = rng.uniform(20, 32)
    width = int(round(rng.uniform(2.5, 5.0)))
    rot = rng.uniform(0, 2 * math.pi)

    if kind == "circle":
        rx = r * rng.uniform(0.85, 1.15)
        ry = r * rng.uniform(0.85, 1.15)
        draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=255, width=width)
    elif kind == "square":
        pts = [
            (cx + r * math.cos(rot + k * math.pi / 2 + math.pi / 4),
             cy + r * math.sin(rot + k * math.pi / 2 + math.pi / 4))
            for k in range(4)
        ]
        draw.line(pts + [pts[0]], fill=255, width=width, joint="curve")
    elif kind == "triangle":
        pts = [
            (cx + r * math.cos(rot + k * 2 * math.pi / 3 - math.pi / 2),
             cy + r * math.sin(rot + k * 2 * math.pi / 3 - math.pi / 2))
            for k in range(3)
        ]
        draw.line(pts + [pts[0]], fill=255, width=width, joint="curve")
    elif kind == "star":
        pts = []
        for k in range(5):
            ao = rot + k * 2 * math.pi / 5 - math.pi / 2
            ai = ao + math.pi / 5
            pts.append((cx + r * math.cos(ao), cy + r * math.sin(ao)))
            pts.append((cx + r * 0.45 * math.cos(ai), cy + r * 0.45 * math.sin(ai)))
        draw.line(pts + [pts[0]], fill=255, width=width, joint="curve")
    else:
        raise ValueError(kind)

    arr = np.asarray(img, dtype=np.float32) / 255.0
    # Downsample HIRES -> GRID by averaging each BLOCK x BLOCK cell.
    arr = arr.reshape(GRID, BLOCK, GRID, BLOCK).mean(axis=(1, 3))
    # A touch of noise so the model generalises to messy human drawings.
    arr = arr + rng.normal(0, 0.02, arr.shape).astype(np.float32)
    arr = np.clip(arr, 0.0, 1.0)
    peak = float(arr.max())
    if peak > 0:
        arr /= peak
    return arr.reshape(-1)


def make_dataset(n_per_class: int, seed: int) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    xs, ys = [], []
    for ci, kind in enumerate(LABELS):
        for _ in range(n_per_class):
            xs.append(render_shape(kind, rng))
            ys.append(ci)
    x = np.asarray(xs, dtype=np.float32)
    y = np.asarray(ys, dtype=np.int64)
    perm = rng.permutation(len(x))
    return x[perm], y[perm]


# --------------------------------------------------------------------------- #
# Tiny 2-layer MLP trained with numpy + Adam
# --------------------------------------------------------------------------- #
def softmax(z: np.ndarray) -> np.ndarray:
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def train() -> dict[str, np.ndarray]:
    hidden = 64
    d = VECTOR_LENGTH
    rng = np.random.default_rng(42)

    w1 = (rng.standard_normal((d, hidden)) * math.sqrt(2 / d)).astype(np.float32)
    b1 = np.zeros(hidden, dtype=np.float32)
    w2 = (rng.standard_normal((hidden, NUM_CLASSES)) * math.sqrt(2 / hidden)).astype(np.float32)
    b2 = np.zeros(NUM_CLASSES, dtype=np.float32)

    params = {"w1": w1, "b1": b1, "w2": w2, "b2": b2}
    m = {k: np.zeros_like(v) for k, v in params.items()}
    v = {k: np.zeros_like(v) for k, v in params.items()}

    x_train, y_train = make_dataset(2500, seed=1)
    lr, beta1, beta2, eps = 1e-2, 0.9, 0.999, 1e-8
    batch = 128
    epochs = 80
    t = 0

    for epoch in range(epochs):
        order = rng.permutation(len(x_train))
        x_train, y_train = x_train[order], y_train[order]
        for i in range(0, len(x_train), batch):
            xb = x_train[i:i + batch]
            yb = y_train[i:i + batch]
            n = len(xb)

            z1 = xb @ params["w1"] + params["b1"]
            a1 = np.maximum(z1, 0)
            z2 = a1 @ params["w2"] + params["b2"]
            probs = softmax(z2)

            dz2 = probs.copy()
            dz2[np.arange(n), yb] -= 1
            dz2 /= n
            grads = {
                "w2": a1.T @ dz2,
                "b2": dz2.sum(axis=0),
            }
            da1 = dz2 @ params["w2"].T
            dz1 = da1 * (z1 > 0)
            grads["w1"] = xb.T @ dz1
            grads["b1"] = dz1.sum(axis=0)

            t += 1
            for k in params:
                g = grads[k].astype(np.float32)
                m[k] = beta1 * m[k] + (1 - beta1) * g
                v[k] = beta2 * v[k] + (1 - beta2) * (g * g)
                mhat = m[k] / (1 - beta1 ** t)
                vhat = v[k] / (1 - beta2 ** t)
                params[k] -= (lr * mhat / (np.sqrt(vhat) + eps)).astype(np.float32)

    # Report held-out accuracy on a fresh test set.
    x_test, y_test = make_dataset(600, seed=999)
    z1 = np.maximum(x_test @ params["w1"] + params["b1"], 0)
    logits = z1 @ params["w2"] + params["b2"]
    acc = (logits.argmax(axis=1) == y_test).mean()
    print(f"Held-out accuracy: {acc * 100:.1f}%")
    return params


# --------------------------------------------------------------------------- #
# Export to ONNX (Gemm -> Relu -> Gemm -> Softmax)
# --------------------------------------------------------------------------- #
def export_onnx(params: dict[str, np.ndarray]) -> None:
    import onnx
    from onnx import TensorProto, helper, numpy_helper

    w1 = numpy_helper.from_array(params["w1"].astype(np.float32), name="W1")
    b1 = numpy_helper.from_array(params["b1"].astype(np.float32), name="B1")
    w2 = numpy_helper.from_array(params["w2"].astype(np.float32), name="W2")
    b2 = numpy_helper.from_array(params["b2"].astype(np.float32), name="B2")

    inp = helper.make_tensor_value_info("input", TensorProto.FLOAT, [1, VECTOR_LENGTH])
    out = helper.make_tensor_value_info("output", TensorProto.FLOAT, [1, NUM_CLASSES])

    nodes = [
        helper.make_node("Gemm", ["input", "W1", "B1"], ["g1"], name="fc1"),
        helper.make_node("Relu", ["g1"], ["r1"], name="relu1"),
        helper.make_node("Gemm", ["r1", "W2", "B2"], ["g2"], name="fc2"),
        helper.make_node("Softmax", ["g2"], ["output"], axis=1, name="softmax"),
    ]

    graph = helper.make_graph(
        nodes,
        "shape-classifier",
        [inp],
        [out],
        initializer=[w1, b1, w2, b2],
    )
    model = helper.make_model(
        graph,
        opset_imports=[helper.make_opsetid("", 13)],
        producer_name="train_shapes.py",
    )
    model.ir_version = 9  # broadly compatible with onnxruntime-web
    onnx.checker.check_model(model)

    os.makedirs(OUT_DIR, exist_ok=True)
    onnx.save(model, OUT_PATH)
    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f"Saved {os.path.normpath(OUT_PATH)} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    print("Generating data and training tiny shape classifier…")
    trained = train()
    export_onnx(trained)
    print("Done. Labels (output order):", ", ".join(LABELS))
