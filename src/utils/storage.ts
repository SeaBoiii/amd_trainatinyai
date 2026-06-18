import type { VisitorResult } from '../types';

const WALL_KEY = 'tinyai.visitorWall.v1';
const PREFS_KEY = 'tinyai.prefs.v1';

/** Visitor-facing booth preferences that should persist between visitors. */
export interface BoothPrefs {
  presenterMode: boolean;
  reducedMotion: boolean;
}

const DEFAULT_PREFS: BoothPrefs = {
  presenterMode: false,
  reducedMotion: false,
};

/** Reads the saved Visitor Wall, newest first. Never throws. */
export function loadVisitorWall(): VisitorResult[] {
  try {
    const raw = localStorage.getItem(WALL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VisitorResult[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Adds a result to the Visitor Wall and returns the updated list. */
export function saveVisitorResult(result: VisitorResult): VisitorResult[] {
  const current = loadVisitorWall();
  const updated = [result, ...current].slice(0, 100); // cap stored entries
  try {
    localStorage.setItem(WALL_KEY, JSON.stringify(updated));
  } catch {
    // Storage might be full or blocked; fail quietly so the booth keeps working.
  }
  return updated;
}

/** Clears every entry from the Visitor Wall. */
export function clearVisitorWall(): void {
  try {
    localStorage.removeItem(WALL_KEY);
  } catch {
    // Ignore.
  }
}

/** Loads persisted booth preferences, falling back to defaults. */
export function loadPrefs(): BoothPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<BoothPrefs>) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/** Persists booth preferences. */
export function savePrefs(prefs: BoothPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore.
  }
}
