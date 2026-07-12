import type { LessonOutput, PathOutput } from "@schema";
import type { ProgressMap } from "./progress";

export type UnitNode = {
  unitIndex: number;
  lessonSlug: string;
  lessonTitle: string;
  topic: string;
  challengeSlugs: string[];
  state: "locked" | "available" | "in_progress" | "completed" | "perfect";
  href: string;
};

export type PathWithProgress = PathOutput & {
  progressPct: number;
  completedUnits: number;
  totalUnits: number;
  topicSlugs: Set<string>;
};

const UNLOCK_THRESHOLD = 0.8;

function unitCompletion(
  unit: PathOutput["units"][0],
  lessons: LessonOutput[],
  progress: ProgressMap
): { done: number; total: number; correct: number } {
  let total = 0;
  let done = 0;
  let correct = 0;
  for (const lessonSlug of unit.lessons) {
    const lesson = lessons.find((l) => l.topic === unit.topic && l.slug === lessonSlug);
    if (!lesson) continue;
    for (const slug of lesson.challenges) {
      total += 1;
      if (progress[slug]) {
        done += 1;
        if (progress[slug].correct) correct += 1;
      }
    }
  }
  return { done, total, correct };
}

export function isUnitUnlocked(
  path: PathOutput,
  unitIndex: number,
  lessons: LessonOutput[],
  progress: ProgressMap
): boolean {
  if (unitIndex === 0) return true;
  const prev = path.units[unitIndex - 1];
  const { done, total } = unitCompletion(prev, lessons, progress);
  if (total === 0) return true;
  return done / total >= UNLOCK_THRESHOLD;
}

export function unitState(
  path: PathOutput,
  unitIndex: number,
  lessons: LessonOutput[],
  progress: ProgressMap
): UnitNode["state"] {
  if (!isUnitUnlocked(path, unitIndex, lessons, progress)) return "locked";
  const unit = path.units[unitIndex];
  const { done, total, correct } = unitCompletion(unit, lessons, progress);
  if (total === 0) return "available";
  if (done === 0) return "available";
  if (done < total) return "in_progress";
  if (correct === total) return "perfect";
  return "completed";
}

export function buildPathNodes(
  path: PathOutput,
  lessons: LessonOutput[],
  progress: ProgressMap
): UnitNode[] {
  const nodes: UnitNode[] = [];
  for (let unitIndex = 0; unitIndex < path.units.length; unitIndex++) {
    const unit = path.units[unitIndex];
    const state = unitState(path, unitIndex, lessons, progress);
    for (const lessonSlug of unit.lessons) {
      const lesson = lessons.find((l) => l.topic === unit.topic && l.slug === lessonSlug);
      if (!lesson) continue;
      nodes.push({
        unitIndex,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        topic: unit.topic,
        challengeSlugs: lesson.challenges,
        state,
        href: `/topics/${encodeURIComponent(unit.topic)}/${encodeURIComponent(lesson.slug)}?path=${path.slug}&unit=${unitIndex}`,
      });
    }
  }
  return nodes;
}

export function pathProgressPct(
  path: PathOutput,
  lessons: LessonOutput[],
  progress: ProgressMap
): number {
  let total = 0;
  let done = 0;
  for (const unit of path.units) {
    const c = unitCompletion(unit, lessons, progress);
    total += c.total;
    done += c.done;
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function enrichPaths(
  paths: PathOutput[],
  lessons: LessonOutput[],
  progress: ProgressMap
): PathWithProgress[] {
  return paths.map((p) => {
    let completedUnits = 0;
    for (let i = 0; i < p.units.length; i++) {
      const s = unitState(p, i, lessons, progress);
      if (s === "completed" || s === "perfect") completedUnits += 1;
    }
    return {
      ...p,
      progressPct: pathProgressPct(p, lessons, progress),
      completedUnits,
      totalUnits: p.units.length,
      topicSlugs: new Set(p.units.map((u) => u.topic)),
    };
  });
}

export function getTopicsInPaths(paths: PathOutput[]): Set<string> {
  const topics = new Set<string>();
  for (const p of paths) {
    for (const u of p.units) topics.add(u.topic);
  }
  return topics;
}
