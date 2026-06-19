# Train a Tiny AI 🧠⚡

An interactive STEM-booth web app where kids **teach a tiny AI** to recognize
their drawings, then watch it make predictions live. It's themed to match the
AMD "Build a PC" booth and can optionally run the Shape Sorter model on the
PC's **NPU / GPU** through ONNX Runtime Web.

Built with **Vite + React + TypeScript + Tailwind CSS**. Designed to run
**fully offline** at a booth after a one-time setup.

---

## ✨ What it does

- **Draw & teach** — kids draw shapes/symbols and label them to train a tiny
  nearest-neighbour classifier right in the browser.
- **Test it live** — the AI predicts new drawings and shows how confident it is.
- **Pretrained Shape Sorter** — a real ONNX neural network that recognizes
  `circle`, `triangle`, `square`, and `star` with no teaching required.
  Great for a quick "here's how it works" demo.
- **Hardware acceleration** — when available, the Shape Sorter runs on the
  PC's accelerator using this fallback chain:

  **NPU (WebNN)** → **GPU (WebNN)** → **GPU (WebGPU)** → **CPU (WASM)**

  The active device is shown on screen so kids can see whether the NPU is doing
  the thinking.

---

## 🚀 Quick start (offline booth)

> The **installer needs internet once** to download dependencies and build the
> app. After that, the booth runs **completely offline**.

1. Install [Node.js LTS](https://nodejs.org/en/download) (version 18 or newer).
2. Open **PowerShell** in this folder and run the installer:

   ```powershell
   .\install.ps1
   ```

3. Start the booth (no internet needed from here on):

   ```powershell
   .\start.ps1
   ```

   This serves the app at **http://localhost:4173** and opens your browser.

To stop the booth, press **Ctrl+C** in the PowerShell window.

---

## 🛠️ Manual commands

If you prefer running things by hand:

| Task                                   | Command            |
| -------------------------------------- | ------------------ |
| Install dependencies + offline runtime | `npm install`      |
| Run the dev server (hot reload)        | `npm run dev`      |
| Build for production                   | `npm run build`    |
| Serve the built app offline            | `npm run serve`    |
| Re-copy the offline AI runtime         | `npm run copy-ort` |

`npm install` automatically vendors the ONNX Runtime files into `public/ort`
(via the `postinstall` step), so the accelerated model works without a CDN.

---

## 📦 Project structure

```
public/
  models/shape-classifier.onnx   The pretrained Shape Sorter neural net
  ort/                           Vendored ONNX Runtime (offline WASM/WebGPU/WebNN)
scripts/
  copy-ort-assets.mjs            Copies ONNX Runtime into public/ort for offline use
src/
  components/                    Screens & UI (Welcome, Training, Test, etc.)
  utils/shapeModel.ts            Loads/runs the ONNX model + hardware detection
  data/                          Missions, careers, hardware concepts
tools/
  train_shapes.py                Retrains the Shape Sorter model (Python)
install.ps1                      One-time installer (run with internet)
start.ps1                        Starts the offline booth
```

---

## 🧩 Offline notes

The app is offline because:

- All JavaScript/CSS is bundled by Vite into `dist/`.
- The ONNX Runtime WASM/WebGPU/WebNN files are vendored in `public/ort` and
  loaded locally (`ort.env.wasm.wasmPaths` points to `/ort/`, **not** a CDN).
- The pretrained model lives in `public/models/shape-classifier.onnx`.

If acceleration files ever go missing, run `npm run copy-ort` to restore them.

---

## 🤖 Retraining the Shape Sorter model (optional)

The pretrained model is already included — you only need this if you want to
change or improve it.

Requirements: **Python 3.10+** with `numpy`, `pillow`, and `onnx`.

```powershell
pip install numpy pillow onnx
python tools/train_shapes.py
```

This procedurally generates outline shapes, trains a small MLP
(`400 → 64 → 4`), and writes a fresh
`public/models/shape-classifier.onnx`. Rebuild the app afterwards
(`npm run build`).

---

## 🧯 Troubleshooting

- **"Node.js was not found"** — install Node.js LTS and re-run `install.ps1`.
- **Accelerated model won't load** — run `npm run copy-ort`, then rebuild.
  The app automatically falls back to CPU if the NPU/GPU isn't usable.
- **`start.ps1` won't run** — PowerShell may block scripts. Allow them for the
  current session with:

  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

- **Port already in use** — edit the port in the `serve` script in
  `package.json` (defaults to `4173`).

---

## 🧪 Requirements summary

- Node.js 18+ (for install/build/serve)
- A modern browser (Chrome/Edge recommended for NPU/GPU acceleration)
- Internet access **once** during installation only
