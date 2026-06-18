import type { FeatureAxis, FeaturePreview } from '../types';
import { colorFromVector, featuresToVector } from '../utils/featureProcessing';

interface SliderStudioProps {
  axes: FeatureAxis[];
  values: Record<string, number>;
  preview?: FeaturePreview;
  onChange: (id: string, value: number) => void;
  disabled?: boolean;
}

/**
 * The slider-based example builder. The visitor adjusts a few sliders and sees
 * a live preview (a colour swatch, or feature bars). This is the non-drawing
 * way to create training examples for missions like Color Mixer Lab.
 */
export default function SliderStudio({
  axes,
  values,
  preview = 'bars',
  onChange,
  disabled = false,
}: SliderStudioProps) {
  const vector = featuresToVector(values, axes);

  return (
    <div className={`w-full max-w-[340px] ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      {/* Live preview */}
      {preview === 'color' ? (
        <div
          className="grid h-40 w-full place-items-center rounded-2xl border-2 border-amd-orange/50 shadow-glow-orange transition-colors"
          style={{ backgroundColor: colorFromVector(vector) }}
          role="img"
          aria-label="Live colour preview"
        >
          <span className="rounded-lg bg-black/35 px-3 py-1 text-sm font-bold text-white">
            {colorFromVector(vector)}
          </span>
        </div>
      ) : (
        <div className="flex h-40 w-full flex-col justify-center gap-2 rounded-2xl border-2 border-amd-orange/50 bg-amd-panel/70 p-4 shadow-glow-orange">
          {axes.map((axis, i) => (
            <div key={axis.id}>
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="font-semibold">
                  {axis.emoji} {axis.name}
                </span>
                <span className="text-amd-amber">{Math.round((vector[i] ?? 0) * 100)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-amd-panel2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amd-red to-amd-orange transition-[width] duration-200"
                  style={{ width: `${Math.round((vector[i] ?? 0) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sliders */}
      <div className="mt-4 flex flex-col gap-4">
        {axes.map((axis) => {
          const value = values[axis.id] ?? axis.default;
          return (
            <div key={axis.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold">
                  {axis.emoji} {axis.name}
                </span>
                <span className="font-bold text-amd-amber">{value}</span>
              </div>
              <input
                type="range"
                min={axis.min}
                max={axis.max}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(axis.id, Number(e.target.value))}
                aria-label={`${axis.name} slider`}
                className="h-3 w-full cursor-pointer appearance-none rounded-full bg-amd-panel2"
                style={{ accentColor: '#FF6B00' }}
              />
              {(axis.lowLabel || axis.highLabel) && (
                <div className="mt-0.5 flex justify-between text-[11px] text-slate-500">
                  <span>{axis.lowLabel}</span>
                  <span>{axis.highLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
