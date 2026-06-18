interface HeaderProps {
  presenterMode: boolean;
  reducedMotion: boolean;
  onTogglePresenter: () => void;
  onToggleMotion: () => void;
  onResetVisitor: () => void;
}

export function Header({
  presenterMode,
  reducedMotion,
  onTogglePresenter,
  onToggleMotion,
  onResetVisitor
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-coal-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div>
          <p className="font-display text-lg font-bold text-white">Train a Tiny AI</p>
          <p className="text-xs text-ember-200">AMD-inspired compute demo</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={onTogglePresenter} className="btn-secondary" aria-pressed={presenterMode}>
            Presenter Mode: {presenterMode ? "On" : "Off"}
          </button>
          <button onClick={onToggleMotion} className="btn-secondary" aria-pressed={reducedMotion}>
            Reduced Motion: {reducedMotion ? "On" : "Off"}
          </button>
          <button onClick={onResetVisitor} className="rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-2 font-medium hover:bg-red-500/30">
            Reset for Next Visitor
          </button>
        </div>
      </div>
    </header>
  );
}
