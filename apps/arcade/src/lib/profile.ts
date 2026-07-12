import { ACHIEVEMENTS } from "../data/achievements";
import { MASCOT_SKINS, SKIN_MAP } from "../data/skins";
import { readProgress, type ProgressMap } from "./progress";

export const PROFILE_KEY = "arcade:profile";
export const PROFILE_VERSION = 1;
export const DAILY_XP_GOAL = 50;

export type AchievementUnlock = { id: string; unlockedAt: number };
export type PathProgressEntry = { currentUnitIndex: number; completedUnits: number[] };
export type StreakState = { current: number; longest: number; lastActiveDate: string };
export type DailyState = { date: string; xpEarned: number; goalTarget: number };

export type ArcadeProfile = {
  v: number;
  xp: number;
  level: number;
  gems: number;
  streak: StreakState;
  equipped: { mascotSkin: string };
  unlockedSkins: string[];
  achievements: AchievementUnlock[];
  pathProgress: Record<string, PathProgressEntry>;
  daily: DailyState;
  stats: {
    fixCorrect: number;
    lessonsPerfect: number;
    exploredChallenge: boolean;
    gemsEarnedTotal: number;
  };
};

export type AwardResult = {
  xpGained: number;
  gemsGained: number;
  leveledUp: boolean;
  newLevel: number;
  streak: StreakState;
  newAchievements: string[];
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultProfile(): ArcadeProfile {
  return {
    v: PROFILE_VERSION,
    xp: 0,
    level: 1,
    gems: 0,
    streak: { current: 0, longest: 0, lastActiveDate: "" },
    equipped: { mascotSkin: "default" },
    unlockedSkins: ["default"],
    achievements: [],
    pathProgress: {},
    daily: { date: todayKey(), xpEarned: 0, goalTarget: DAILY_XP_GOAL },
    stats: { fixCorrect: 0, lessonsPerfect: 0, exploredChallenge: false, gemsEarnedTotal: 0 },
  };
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return level * level * 100;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

export function xpProgressInLevel(xp: number, level: number): { current: number; needed: number; pct: number } {
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const needed = ceiling - floor;
  const current = xp - floor;
  return { current, needed, pct: needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 0 };
}

export function readProfile(): ArcadeProfile {
  if (typeof localStorage === "undefined") return defaultProfile();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as ArcadeProfile;
    if (parsed.v !== PROFILE_VERSION) return defaultProfile();
    return { ...defaultProfile(), ...parsed, stats: { ...defaultProfile().stats, ...parsed.stats } };
  } catch {
    return defaultProfile();
  }
}

export function writeProfile(profile: ArcadeProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  if (typeof document !== "undefined") {
    document.dispatchEvent(new CustomEvent("arcade:profile-updated"));
  }
}

function hasAchievement(profile: ArcadeProfile, id: string): boolean {
  return profile.achievements.some((a) => a.id === id);
}

function unlockAchievement(profile: ArcadeProfile, id: string): boolean {
  if (hasAchievement(profile, id)) return false;
  profile.achievements.push({ id, unlockedAt: Date.now() });
  return true;
}

function unlockSkinsForLevel(profile: ArcadeProfile): void {
  for (const skin of MASCOT_SKINS) {
    if (skin.unlock.type === "level" && typeof skin.unlock.value === "number") {
      if (profile.level >= skin.unlock.value && !profile.unlockedSkins.includes(skin.id)) {
        profile.unlockedSkins.push(skin.id);
      }
    }
    if (skin.unlock.type === "achievement" && typeof skin.unlock.value === "string") {
      if (hasAchievement(profile, skin.unlock.value) && !profile.unlockedSkins.includes(skin.id)) {
        profile.unlockedSkins.push(skin.id);
      }
    }
  }
}

function updateStreak(profile: ArcadeProfile): void {
  const today = todayKey();
  const { lastActiveDate, current, longest } = profile.streak;

  if (lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (lastActiveDate === yesterdayKey) {
    profile.streak.current = current + 1;
  } else if (lastActiveDate === "") {
    profile.streak.current = 1;
  } else {
    profile.streak.current = 1;
  }

  profile.streak.lastActiveDate = today;
  profile.streak.longest = Math.max(longest, profile.streak.current);
}

function evaluateAchievements(profile: ArcadeProfile, progress: ProgressMap, ctx: {
  challengeType?: string;
  correct?: boolean;
  lessonPerfect?: boolean;
  pathSlug?: string;
  fromExplore?: boolean;
}): string[] {
  const unlocked: string[] = [];
  const tryUnlock = (id: string) => {
    if (unlockAchievement(profile, id)) unlocked.push(id);
  };

  const completedCount = Object.keys(progress).length;
  if (completedCount >= 1) tryUnlock("first-challenge");
  if (profile.streak.current >= 3) tryUnlock("streak-3");
  if (profile.streak.current >= 7) tryUnlock("streak-7");
  if (profile.streak.current >= 30) tryUnlock("streak-30");
  if (profile.level >= 5) tryUnlock("level-5");
  if (profile.level >= 10) tryUnlock("level-10");
  if (profile.stats.fixCorrect >= 10) tryUnlock("fix-10");
  if (ctx.lessonPerfect) tryUnlock("perfect-lesson");
  if (ctx.fromExplore) tryUnlock("explorer");
  if (profile.daily.xpEarned >= profile.daily.goalTarget) tryUnlock("daily-goal");
  if (profile.stats.gemsEarnedTotal >= 50) tryUnlock("gems-50");
  if (ctx.pathSlug === "css-survival" && profile.pathProgress["css-survival"]?.completedUnits.length === 4)
    tryUnlock("css-survival-done");
  if (ctx.pathSlug === "forms-auth" && profile.pathProgress["forms-auth"]?.completedUnits.length === 4)
    tryUnlock("forms-done");

  unlockSkinsForLevel(profile);
  return unlocked;
}

export function calcChallengeXp(difficulty: number, correct: boolean): number {
  if (!correct) return 5;
  return 10 + difficulty * 5;
}

export function awardChallengeComplete(opts: {
  slug: string;
  correct: boolean;
  difficulty: number;
  challengeType?: string;
  fromExplore?: boolean;
}): AwardResult {
  const profile = readProfile();
  const progress = readProgress();
  const today = todayKey();

  if (profile.daily.date !== today) {
    profile.daily = { date: today, xpEarned: 0, goalTarget: DAILY_XP_GOAL };
  }

  updateStreak(profile);

  const xpGained = calcChallengeXp(opts.difficulty, opts.correct);
  const oldLevel = profile.level;
  profile.xp += xpGained;
  profile.daily.xpEarned += xpGained;
  profile.level = levelFromXp(profile.xp);

  let gemsGained = 0;
  if (profile.level > oldLevel) {
    gemsGained = 10 + profile.level * 5;
    profile.gems += gemsGained;
    profile.stats.gemsEarnedTotal += gemsGained;
  }

  if (opts.challengeType === "fix" && opts.correct) {
    profile.stats.fixCorrect += 1;
  }
  if (opts.fromExplore) {
    profile.stats.exploredChallenge = true;
  }

  const newAchievements = evaluateAchievements(profile, progress, {
    challengeType: opts.challengeType,
    correct: opts.correct,
    fromExplore: opts.fromExplore,
  });

  writeProfile(profile);

  return {
    xpGained,
    gemsGained,
    leveledUp: profile.level > oldLevel,
    newLevel: profile.level,
    streak: profile.streak,
    newAchievements,
  };
}

export function awardLessonComplete(opts: {
  correctCount: number;
  total: number;
  pathSlug?: string;
  unitIndex?: number;
}): AwardResult {
  const profile = readProfile();
  const progress = readProgress();
  const perfect = opts.correctCount === opts.total && opts.total > 0;

  let xpGained = 25;
  if (perfect) {
    xpGained += 15;
    profile.stats.lessonsPerfect += 1;
  }

  const oldLevel = profile.level;
  profile.xp += xpGained;
  profile.level = levelFromXp(profile.xp);

  let gemsGained = perfect ? 5 : 0;
  if (profile.level > oldLevel) {
    gemsGained += 10 + profile.level * 5;
  }
  profile.gems += gemsGained;
  profile.stats.gemsEarnedTotal += gemsGained;

  if (opts.pathSlug != null && opts.unitIndex != null) {
    const entry = profile.pathProgress[opts.pathSlug] ?? { currentUnitIndex: 0, completedUnits: [] };
    if (!entry.completedUnits.includes(opts.unitIndex)) {
      entry.completedUnits.push(opts.unitIndex);
    }
    entry.currentUnitIndex = Math.max(entry.currentUnitIndex, opts.unitIndex + 1);
    profile.pathProgress[opts.pathSlug] = entry;
  }

  const newAchievements = evaluateAchievements(profile, progress, {
    lessonPerfect: perfect,
    pathSlug: opts.pathSlug,
  });

  if (opts.pathSlug && profile.pathProgress[opts.pathSlug]?.completedUnits.length) {
    if (unlockAchievement(profile, "unit-complete")) newAchievements.push("unit-complete");
  }

  writeProfile(profile);

  return {
    xpGained,
    gemsGained,
    leveledUp: profile.level > oldLevel,
    newLevel: profile.level,
    streak: profile.streak,
    newAchievements,
  };
}

export function equipSkin(skinId: string): boolean {
  const profile = readProfile();
  if (!profile.unlockedSkins.includes(skinId) || !SKIN_MAP.has(skinId)) return false;
  profile.equipped.mascotSkin = skinId;
  writeProfile(profile);
  return true;
}

export function purchaseSkin(skinId: string): boolean {
  const skin = SKIN_MAP.get(skinId);
  if (!skin || skin.unlock.type !== "gems") return false;
  const cost = typeof skin.unlock.value === "number" ? skin.unlock.value : 0;
  const profile = readProfile();
  if (profile.unlockedSkins.includes(skinId) || profile.gems < cost) return false;
  profile.gems -= cost;
  profile.unlockedSkins.push(skinId);
  writeProfile(profile);
  return true;
}

export function exportProfileJson(): string {
  return JSON.stringify(readProfile(), null, 2);
}

export function importProfileJson(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as ArcadeProfile;
    if (typeof parsed.xp !== "number") return false;
    writeProfile({ ...defaultProfile(), ...parsed, v: PROFILE_VERSION });
    return true;
  } catch {
    return false;
  }
}
