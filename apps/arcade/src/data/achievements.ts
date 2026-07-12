export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Optional condition hint for UI */
  category: "streak" | "path" | "skill" | "explorer" | "level";
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-challenge", title: "First fix", description: "Complete your first challenge", icon: "🎯", category: "skill" },
  { id: "streak-3", title: "On a roll", description: "3-day streak", icon: "🔥", category: "streak" },
  { id: "streak-7", title: "Week warrior", description: "7-day streak", icon: "🔥", category: "streak" },
  { id: "streak-30", title: "Unstoppable", description: "30-day streak", icon: "💎", category: "streak" },
  { id: "level-5", title: "Rising dev", description: "Reach level 5", icon: "⬆️", category: "level" },
  { id: "level-10", title: "Senior bug hunter", description: "Reach level 10", icon: "🏆", category: "level" },
  { id: "fix-10", title: "Debugger", description: "10 fix challenges correct", icon: "🔧", category: "skill" },
  { id: "perfect-lesson", title: "Flawless", description: "Complete a lesson 100% correct", icon: "✨", category: "skill" },
  { id: "unit-complete", title: "Unit cleared", description: "Complete a path unit", icon: "📦", category: "path" },
  { id: "path-complete", title: "Path master", description: "Complete a full learning path", icon: "🗺️", category: "path" },
  { id: "explorer", title: "Off the map", description: "Play a challenge from Explore", icon: "🧭", category: "explorer" },
  { id: "daily-goal", title: "Daily grind", description: "Hit your daily XP goal", icon: "☀️", category: "skill" },
  { id: "gems-50", title: "Collector", description: "Earn 50 gems total", icon: "💠", category: "level" },
  { id: "css-survival-done", title: "CSS survivor", description: "Complete CSS Survival path", icon: "🎨", category: "path" },
  { id: "forms-done", title: "Form fixer", description: "Complete Forms & Auth path", icon: "📝", category: "path" },
];

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
