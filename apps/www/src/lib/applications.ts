import { SITE_URLS } from "@lib/urls";

export type AppIcon = "dbviz" | "zenpomodoro" | "video" | "record" | "office";

export type AppEntry = {
  /** Stable slug — also the preview image filename: /apps/<slug>.webp */
  slug: string;
  name: string;
  /** Short "what it does" blurb (English; product copy). */
  desc: string;
  /** Preview image, served from public/apps/. */
  image: string;
  /** Inline icon key rendered by the page. */
  icon: AppIcon;
  /** Live demo / hosted app URL, when one exists. */
  demoHref?: string;
  /** Source repository, when public. */
  repoHref?: string;
};

/**
 * Single source of truth for the Applications showcase.
 * Each card surfaces a demo link and/or a repo link — desktop apps ship
 * a repo only, hosted apps ship a demo (and a repo when open source).
 */
export const APPLICATIONS: AppEntry[] = [
  {
    slug: "dbviz",
    name: "DbViz",
    desc: "Visual database schema explorer — design tables, generate ERDs, and run SQL right in the browser.",
    image: "/apps/dbviz.webp",
    icon: "dbviz",
    demoHref: SITE_URLS.dbviz,
    repoHref: "https://github.com/Foodhy/stealthis/tree/main/apps/dbviz",
  },
  {
    slug: "zenpomodoro",
    name: "Zen Pomodoro",
    desc: "Calm focus timer for deep work — minimalist Pomodoro sessions with tasks, notes, and history.",
    image: "/apps/zenpomodoro.webp",
    icon: "zenpomodoro",
    demoHref: SITE_URLS.zenpomodoro,
    repoHref: "https://github.com/Foodhy/zen-pomodoro",
  },
  {
    slug: "video-gen",
    name: "Video Gen",
    desc: "Fully-local Mac video editor with a CapCut-style timeline — subtitles, translation, and effects, all offline.",
    image: "/apps/video-gen.webp",
    icon: "video",
    repoHref: "https://github.com/Foodhy/video-gen",
  },
  {
    slug: "insta-record",
    name: "Insta Record",
    desc: "Lightweight native menubar screen recorder with global hotkeys and built-in video trimming.",
    image: "/apps/insta-record.webp",
    icon: "record",
    repoHref: "https://github.com/Foodhy/insta-record",
  },
  {
    slug: "multi-office",
    name: "Multi Office",
    desc: "Word, Excel, and PowerPoint in one web app — a unified .mox file with Document, Spreadsheet, and Slides views.",
    image: "/apps/multi-office.webp",
    icon: "office",
    repoHref: "https://github.com/Foodhy/multi-office",
  },
];
