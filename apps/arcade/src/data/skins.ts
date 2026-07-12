export type SkinDef = {
  id: string;
  name: string;
  /** CSS custom properties or class suffix */
  primary: string;
  secondary: string;
  accent: string;
  unlock: { type: "default" | "level" | "achievement" | "gems"; value?: number | string };
};

export const MASCOT_SKINS: SkinDef[] = [
  {
    id: "default",
    name: "Patch",
    primary: "#34d399",
    secondary: "#6ee7b7",
    accent: "#059669",
    unlock: { type: "default" },
  },
  {
    id: "gold",
    name: "Golden Patch",
    primary: "#fbbf24",
    secondary: "#fde68a",
    accent: "#d97706",
    unlock: { type: "level", value: 5 },
  },
  {
    id: "cosmic",
    name: "Cosmic Patch",
    primary: "#a78bfa",
    secondary: "#c4b5fd",
    accent: "#7c3aed",
    unlock: { type: "achievement", value: "path-complete" },
  },
  {
    id: "night",
    name: "Night Patch",
    primary: "#60a5fa",
    secondary: "#93c5fd",
    accent: "#2563eb",
    unlock: { type: "gems", value: 100 },
  },
];

export const SKIN_MAP = new Map(MASCOT_SKINS.map((s) => [s.id, s]));
