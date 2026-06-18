import { RACE_CONCEPTS } from '../data/hardwareConcepts';

/** A small AMD-inspired chip / circuit badge used as a decorative accent. */
export function ChipBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-amd-line bg-amd-panel/70 px-3 py-1 text-xs font-semibold tracking-wide text-amd-amber ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-amd-orange" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amd-orange" />
      </span>
      AMD-inspired compute demo
    </span>
  );
}

/**
 * The glowing "AI core" visual. Used on the welcome screen and during the
 * training animation. Purely decorative.
 */
export function AICore({ size = 140, active = true }: { size?: number; active?: boolean }) {
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-amd-red via-amd-orange to-amd-amber opacity-30 blur-2xl ${
          active ? 'animate-pulseGlow' : ''
        }`}
      />
      <div className="absolute inset-3 rounded-full border border-amd-orange/40" />
      <div
        className={`absolute inset-6 rounded-full border-2 border-dashed border-amd-orange/60 ${
          active ? 'animate-spinSlow' : ''
        }`}
      />
      <div className="relative grid h-1/2 w-1/2 place-items-center rounded-2xl bg-gradient-to-br from-amd-red to-amd-orange shadow-glow-orange">
        <span style={{ fontSize: size * 0.22 }}>🧠</span>
      </div>
      {/* Orbiting compute dots */}
      <div className={`absolute inset-0 ${active ? 'animate-spinSlow' : ''}`}>
        {RACE_CONCEPTS.map((c, i) => (
          <span
            key={c.id}
            className="absolute left-1/2 top-0 -ml-2 h-4 w-4 rounded-full"
            style={{
              backgroundColor: c.color,
              transform: `rotate(${i * 120}deg) translateY(-${size / 2 - 6}px)`,
              transformOrigin: `center ${size / 2}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** A labelled confidence / progress bar with an animated fill. */
export function ConfidenceBar({
  label,
  emoji,
  value,
  highlight = false,
}: {
  label: string;
  emoji?: string;
  value: number; // 0..1
  highlight?: boolean;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold">
          {emoji ? `${emoji} ` : ''}
          {label}
        </span>
        <span className={highlight ? 'font-bold text-amd-amber' : 'text-slate-300'}>{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-amd-panel2">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
            highlight
              ? 'bg-gradient-to-r from-amd-red to-amd-orange'
              : 'bg-gradient-to-r from-slate-500 to-slate-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
