// Copies the onnxruntime-web WebAssembly runtime files into public/ort so the
// app can load them locally instead of from a CDN. This is what makes the
// hardware-accelerated Shape Sorter model work on a fully OFFLINE booth.
//
// Runs automatically after `npm install` (postinstall) and before builds.
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const srcDir = join(root, 'node_modules', 'onnxruntime-web', 'dist');
const outDir = join(root, 'public', 'ort');

if (!existsSync(srcDir)) {
  console.warn(
    '[copy-ort-assets] onnxruntime-web is not installed yet — skipping. ' +
      'Run "npm install" first.',
  );
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

// All wasm runtime variants + their loader glue. Copying every variant keeps
// the app working no matter which backend (WASM/WebGPU/WebNN) the booth PC uses.
const wanted = readdirSync(srcDir).filter(
  (name) => name.startsWith('ort-wasm-simd-threaded.') && /\.(wasm|mjs)$/.test(name),
);

let copied = 0;
let bytes = 0;
for (const name of wanted) {
  const from = join(srcDir, name);
  const to = join(outDir, name);
  copyFileSync(from, to);
  copied += 1;
  bytes += statSync(to).size;
}

console.log(
  `[copy-ort-assets] Copied ${copied} ONNX Runtime file(s) ` +
    `(${(bytes / 1024 / 1024).toFixed(1)} MB) to public/ort for offline use.`,
);
