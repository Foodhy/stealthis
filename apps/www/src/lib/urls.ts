const isDev = import.meta.env.DEV;

export const SITE_URLS = {
  www: isDev ? "http://localhost:4321" : "https://stealthis.dev",
  docs: isDev ? "http://localhost:4322" : "https://docs.stealthis.dev",
  lab: isDev ? "http://localhost:4323" : "https://lab.stealthis.dev",
  build: isDev ? "http://localhost:4324/" : "https://build.stealthis.dev",
  styleforge: isDev ? "http://localhost:4326/" : "https://styleforge.stealthis.dev",
  dbviz: isDev ? "http://localhost:4327/" : "https://dbviz.stealthis.dev",
  remotion: isDev ? "http://localhost:4325" : "https://remotion.stealthis.dev",
  changelog: "https://github.com/Foodhy/stealthis/releases",
} as const;
