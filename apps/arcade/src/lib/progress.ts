export type ProgressEntry = { correct: boolean; completedAt: number };
export type ProgressMap = Record<string, ProgressEntry>;

export type SessionEntry = { lesson: string; stepIndex: number; updatedAt: number };
export type SessionMap = Record<string, SessionEntry>;

export const PROGRESS_KEY = "arcade:progress";
export const SESSION_KEY = "arcade:session";

export function readProgress(): ProgressMap {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeProgress(slug: string, correct: boolean): void {
  const p = readProgress();
  p[slug] = { correct, completedAt: Date.now() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function readSession(): SessionMap {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeSession(topic: string, lesson: string, stepIndex: number): void {
  const s = readSession();
  s[topic] = { lesson, stepIndex, updatedAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function clearSession(topic: string): void {
  const s = readSession();
  delete s[topic];
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function countCorrect(slugs: string[], progress: ProgressMap): number {
  return slugs.filter((s) => progress[s]?.correct).length;
}

export function countCompleted(slugs: string[], progress: ProgressMap): number {
  return slugs.filter((s) => progress[s]).length;
}

export function getResumeLabel(
  slugs: string[],
  progress: ProgressMap
): "Play" | "Continue" | "Replay" {
  const done = countCompleted(slugs, progress);
  if (done === 0) return "Play";
  if (done >= slugs.length) return "Replay";
  return "Continue";
}
