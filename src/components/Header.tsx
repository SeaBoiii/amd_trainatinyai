import type { Screen } from '../types';

interface HeaderProps {
  onHome: () => void;
  onReset: () => void;
  presenterMode: boolean;
  reducedMotion: boolean;
  onTogglePresenter: () => void;
  onToggleMotion: () => void;
  currentScreen: Screen;
}

/**
 * Persistent top bar. Always offers a way home, a "Reset for Next Visitor"
 * button, and booth toggles (Presenter Mode + Reduced Motion).
 */
export default function Header({
  onHome,
  onReset,
  presenterMode,
  reducedMotion,
  onTogglePresenter,
  onToggleMotion,
  currentScreen,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-amd-line/80 bg-amd-dark/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={onHome}
          className="group flex items-center gap-3 rounded-lg px-1 py-1 text-left"
          aria-label="Train a Tiny AI — go to start"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-amd-red to-amd-orange text-lg shadow-glow">
            🧠
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold sm:text-lg">
              Train a <span className="text-gradient">Tiny AI</span>
            </span>
            <span className="hidden text-[11px] text-slate-400 sm:block">
              AMD-inspired compute demo
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <Toggle
            label="Presenter"
            title="Presenter Mode: bigger text for the booth"
            active={presenterMode}
            onClick={onTogglePresenter}
            emoji="🔎"
          />
          <Toggle
            label="Calm"
            title="Reduced motion: fewer animations"
            active={reducedMotion}
            onClick={onToggleMotion}
            emoji="🌙"
          />
          {currentScreen !== 'welcome' && (
            <button
              onClick={onReset}
              className="btn-primary rounded-lg px-3 py-2 text-sm sm:text-base"
              title="Clear everything and start fresh for the next visitor"
            >
              <span className="hidden sm:inline">Reset for Next Visitor</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Toggle({
  label,
  title,
  active,
  onClick,
  emoji,
}: {
  label: string;
  title: string;
  active: boolean;
  onClick: () => void;
  emoji: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-sm font-semibold transition ${
        active
          ? 'border-amd-orange bg-amd-orange/15 text-amd-amber'
          : 'border-amd-line bg-amd-panel/60 text-slate-300 hover:border-amd-orange/50'
      }`}
    >
      <span aria-hidden="true">{emoji}</span>
      <span className="hidden md:inline">{label}</span>
      <span
        className={`hidden h-2 w-2 rounded-full md:inline-block ${
          active ? 'bg-amd-orange' : 'bg-slate-600'
        }`}
      />
    </button>
  );
}
