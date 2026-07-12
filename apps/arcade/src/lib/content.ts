import { join } from "node:path";
import { loadChallenges, loadLessons } from "@schema";
import type { ChallengeMetaOutput, LessonOutput } from "@schema";
import { lessonPath } from "./paths";

export type ArcadeTopic = {
  topic: string;
  challenges: number;
  lessons: number;
  lessonSlugs: string[];
  challengeSlugs: string[];
};

export type ResumePoint = {
  lesson: LessonOutput;
  stepIndex: number;
  href: string;
  label: "Play" | "Continue" | "Replay";
};

const contentDir = join(process.cwd(), "..", "..", "packages", "content");

export async function loadArcadeData(): Promise<{
  challenges: ChallengeMetaOutput[];
  lessons: LessonOutput[];
  published: ChallengeMetaOutput[];
}> {
  const [challenges, lessons] = await Promise.all([
    loadChallenges(contentDir),
    loadLessons(contentDir),
  ]);
  const published = challenges.filter((c) => c.quality === "published");
  return { challenges, lessons, published };
}

export function buildArcadeTopics(
  published: ChallengeMetaOutput[],
  lessons: LessonOutput[]
): ArcadeTopic[] {
  const topicsWithLessons = new Set(lessons.map((l) => l.topic));
  const map = new Map<string, ArcadeTopic>();

  for (const topic of topicsWithLessons) {
    map.set(topic, {
      topic,
      challenges: 0,
      lessons: 0,
      lessonSlugs: [],
      challengeSlugs: [],
    });
  }

  for (const l of lessons) {
    const t = map.get(l.topic);
    if (!t) continue;
    t.lessons += 1;
    t.lessonSlugs.push(l.slug);
    for (const slug of l.challenges) {
      if (!t.challengeSlugs.includes(slug)) t.challengeSlugs.push(slug);
    }
  }

  for (const c of published) {
    const t = map.get(c.topic);
    if (!t) continue;
    if (!t.challengeSlugs.includes(c.slug)) t.challengeSlugs.push(c.slug);
  }

  for (const t of map.values()) {
    t.challenges = t.challengeSlugs.length;
  }

  return [...map.values()].sort((a, b) => a.topic.localeCompare(b.topic));
}

export function getLessonsForTopic(topic: string, lessons: LessonOutput[]): LessonOutput[] {
  return lessons
    .filter((l) => l.topic === topic)
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function getFirstLesson(topic: string, lessons: LessonOutput[]): LessonOutput | null {
  const list = getLessonsForTopic(topic, lessons);
  return list[0] ?? null;
}

export type ProgressEntry = { correct: boolean; completedAt: number };
export type ProgressMap = Record<string, ProgressEntry>;
export type SessionMap = Record<string, { lesson: string; stepIndex: number; updatedAt: number }>;

export function getResumePoint(
  topic: string,
  lessons: LessonOutput[],
  progress: ProgressMap,
  session?: SessionMap
): ResumePoint | null {
  const topicLessons = getLessonsForTopic(topic, lessons);
  if (topicLessons.length === 0) return null;

  const sessionEntry = session?.[topic];
  if (sessionEntry) {
    const lesson = topicLessons.find((l) => l.slug === sessionEntry.lesson);
    if (lesson && sessionEntry.stepIndex < lesson.challenges.length) {
      return {
        lesson,
        stepIndex: sessionEntry.stepIndex,
        href: lessonPath(topic, lesson.slug, sessionEntry.stepIndex),
        label: "Continue",
      };
    }
  }

  for (const lesson of topicLessons) {
    for (let i = 0; i < lesson.challenges.length; i++) {
      const slug = lesson.challenges[i];
      if (!progress[slug]) {
        const hasAnyProgress = topicLessons.some((l) =>
          l.challenges.some((s) => Boolean(progress[s]))
        );
        return {
          lesson,
          stepIndex: i,
          href: lessonPath(topic, lesson.slug, i),
          label: hasAnyProgress ? "Continue" : "Play",
        };
      }
    }
  }

  const last = topicLessons[topicLessons.length - 1];
  return {
    lesson: last,
    stepIndex: 0,
    href: lessonPath(topic, last.slug),
    label: "Replay",
  };
}

export function isGeneratedChallenge(challenge: ChallengeMetaOutput): boolean {
  return challenge.tags.includes("generated");
}
