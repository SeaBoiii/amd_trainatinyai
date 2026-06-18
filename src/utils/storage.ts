import { VisitorResult } from "../types";

const VISITOR_WALL_KEY = "tiny-ai-visitor-wall";
const SETTINGS_KEY = "tiny-ai-settings";

export interface AppSettings {
  presenterMode: boolean;
  reducedMotion: boolean;
}

export function loadVisitorWall(): VisitorResult[] {
  try {
    const raw = localStorage.getItem(VISITOR_WALL_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as VisitorResult[];
  } catch {
    return [];
  }
}

export function saveVisitorResult(result: VisitorResult): VisitorResult[] {
  const wall = loadVisitorWall();
  const updated = [result, ...wall].slice(0, 100);
  localStorage.setItem(VISITOR_WALL_KEY, JSON.stringify(updated));
  return updated;
}

export function clearVisitorWall(): void {
  localStorage.removeItem(VISITOR_WALL_KEY);
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { presenterMode: false, reducedMotion: false };
    }

    const parsed = JSON.parse(raw) as AppSettings;
    return {
      presenterMode: Boolean(parsed.presenterMode),
      reducedMotion: Boolean(parsed.reducedMotion)
    };
  } catch {
    return { presenterMode: false, reducedMotion: false };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
