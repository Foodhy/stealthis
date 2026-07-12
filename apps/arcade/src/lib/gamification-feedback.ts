import { ACHIEVEMENT_MAP } from "../data/achievements";
import type { AwardResult } from "./profile";

export function showXpToast(xp: number, streak: number): void {
  const el = document.createElement("div");
  el.className =
    "pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-400/40 bg-emerald-950/95 px-5 py-3 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-900/40 animate-[toast-in_0.35s_ease-out]";
  el.innerHTML = `+${xp} XP${streak > 0 ? ` · 🔥 ${streak} day streak` : ""}`;
  document.body.appendChild(el);
  window.setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translate(-50%, 8px)";
    el.style.transition = "opacity 0.3s, transform 0.3s";
    window.setTimeout(() => el.remove(), 320);
  }, 2200);
}

export function showAchievementToast(id: string): void {
  const def = ACHIEVEMENT_MAP.get(id);
  if (!def) return;
  const el = document.createElement("div");
  el.className =
    "pointer-events-none fixed top-20 right-4 z-50 flex max-w-xs items-start gap-3 rounded-xl border border-violet-400/40 bg-[#12101a]/95 p-4 shadow-xl shadow-violet-900/30 animate-[toast-in_0.35s_ease-out]";
  el.innerHTML = `<span class="text-2xl">${def.icon}</span><div><p class="text-xs uppercase tracking-wider text-violet-300/80">Achievement</p><p class="font-semibold text-white">${def.title}</p><p class="text-xs text-white/50">${def.description}</p></div>`;
  document.body.appendChild(el);
  window.setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.3s";
    window.setTimeout(() => el.remove(), 320);
  }, 3500);
}

export function showAwardFeedback(result: AwardResult): void {
  if (result.xpGained > 0) showXpToast(result.xpGained, result.streak.current);
  for (const id of result.newAchievements) showAchievementToast(id);
}
