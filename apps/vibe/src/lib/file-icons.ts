/** File/folder icon and color mapping (VS Code-inspired) */

type IconDef = { icon: string; color: string };

const FOLDER_ICONS: Record<string, IconDef> = {
  src:        { icon: "📦", color: "#C3E88D" },
  components: { icon: "🧩", color: "#89DDFF" },
  lib:        { icon: "📚", color: "#82AAFF" },
  hooks:      { icon: "🪝", color: "#C792EA" },
  pages:      { icon: "📄", color: "#FFCB6B" },
  api:        { icon: "⚡", color: "#F78C6C" },
  styles:     { icon: "🎨", color: "#FF5370" },
  public:     { icon: "🌐", color: "#89DDFF" },
  assets:     { icon: "🖼", color: "#C3E88D" },
  utils:      { icon: "🔧", color: "#FFCB6B" },
  config:     { icon: "⚙", color: "#676E95" },
  test:       { icon: "🧪", color: "#C3E88D" },
  tests:      { icon: "🧪", color: "#C3E88D" },
  node_modules: { icon: "📦", color: "#676E95" },
  dist:       { icon: "📁", color: "#676E95" },
  build:      { icon: "📁", color: "#676E95" },
};

const EXT_ICONS: Record<string, IconDef> = {
  // JavaScript / TypeScript
  js:    { icon: "JS", color: "#FFCB6B" },
  jsx:   { icon: "JX", color: "#61DAFB" },
  ts:    { icon: "TS", color: "#3178C6" },
  tsx:   { icon: "TX", color: "#61DAFB" },
  mjs:   { icon: "JS", color: "#FFCB6B" },
  cjs:   { icon: "JS", color: "#FFCB6B" },

  // Web
  html:  { icon: "H", color: "#E44D26" },
  css:   { icon: "C", color: "#1572B6" },
  scss:  { icon: "S", color: "#CC6699" },
  svg:   { icon: "◇", color: "#FFB13B" },

  // Data / Config
  json:  { icon: "{}", color: "#FFCB6B" },
  yaml:  { icon: "Y", color: "#CB171E" },
  yml:   { icon: "Y", color: "#CB171E" },
  toml:  { icon: "T", color: "#9C4121" },
  env:   { icon: "⊡", color: "#C3E88D" },

  // Markdown
  md:    { icon: "M↓", color: "#519ABA" },
  mdx:   { icon: "M↓", color: "#FCBA03" },

  // Frameworks
  astro: { icon: "🚀", color: "#FF5D01" },
  vue:   { icon: "V", color: "#42B883" },
  svelte:{ icon: "S", color: "#FF3E00" },

  // Backend
  py:    { icon: "Py", color: "#3572A5" },
  rs:    { icon: "Rs", color: "#DEA584" },
  go:    { icon: "Go", color: "#00ADD8" },
  rb:    { icon: "Rb", color: "#CC342D" },
  java:  { icon: "Jv", color: "#B07219" },
  php:   { icon: "Php", color: "#4F5D95" },

  // Shell
  sh:    { icon: ">_", color: "#89E051" },
  bash:  { icon: ">_", color: "#89E051" },
  zsh:   { icon: ">_", color: "#89E051" },

  // Other
  sql:   { icon: "Sq", color: "#E38C00" },
  graphql:{ icon: "Gq", color: "#E535AB" },
  lock:  { icon: "🔒", color: "#676E95" },
  gitignore: { icon: "G", color: "#F05032" },
  gitkeep: { icon: "·", color: "#676E95" },
  dockerfile: { icon: "🐳", color: "#2496ED" },
  xml:   { icon: "<>", color: "#E44D26" },

  // Images
  png:   { icon: "🖼", color: "#A074C4" },
  jpg:   { icon: "🖼", color: "#A074C4" },
  jpeg:  { icon: "🖼", color: "#A074C4" },
  gif:   { icon: "🖼", color: "#A074C4" },
  webp:  { icon: "🖼", color: "#A074C4" },
  ico:   { icon: "🖼", color: "#A074C4" },
};

const FILENAME_ICONS: Record<string, IconDef> = {
  "package.json":    { icon: "📦", color: "#C3E88D" },
  "tsconfig.json":   { icon: "TS", color: "#3178C6" },
  ".gitignore":      { icon: "G", color: "#F05032" },
  ".env":            { icon: "⊡", color: "#C3E88D" },
  ".env.example":    { icon: "⊡", color: "#C3E88D" },
  ".env.local":      { icon: "⊡", color: "#C3E88D" },
  "README.md":       { icon: "ℹ", color: "#519ABA" },
  "LICENSE":         { icon: "§", color: "#D4AA00" },
  "Dockerfile":      { icon: "🐳", color: "#2496ED" },
  "docker-compose.yml": { icon: "🐳", color: "#2496ED" },
  "vite.config.ts":  { icon: "⚡", color: "#646CFF" },
  "vite.config.js":  { icon: "⚡", color: "#646CFF" },
  "astro.config.mjs": { icon: "🚀", color: "#FF5D01" },
  "tailwind.config.mjs": { icon: "🌊", color: "#38BDF8" },
  "tailwind.config.js":  { icon: "🌊", color: "#38BDF8" },
  "biome.json":      { icon: "🌿", color: "#60A5FA" },
  ".prettierrc":     { icon: "✨", color: "#56B3B4" },
  ".eslintrc.js":    { icon: "📏", color: "#4B32C3" },
  "bun.lock":        { icon: "🔒", color: "#FBF0DF" },
  "package-lock.json": { icon: "🔒", color: "#C3E88D" },
  "yarn.lock":       { icon: "🔒", color: "#2C8EBB" },
};

const DEFAULT_FILE: IconDef = { icon: "📄", color: "#676E95" };
const DEFAULT_FOLDER: IconDef = { icon: "📁", color: "#90A4AE" };

export function getFileIcon(fileName: string): IconDef {
  // Check full filename first
  if (FILENAME_ICONS[fileName]) return FILENAME_ICONS[fileName];

  // Check extension
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  // Handle dotfiles like .gitignore
  if (fileName.startsWith(".") && !ext) {
    const dotName = fileName.slice(1);
    if (EXT_ICONS[dotName]) return EXT_ICONS[dotName];
  }
  if (EXT_ICONS[ext]) return EXT_ICONS[ext];

  return DEFAULT_FILE;
}

export function getFolderIcon(folderName: string): IconDef {
  const lower = folderName.toLowerCase();
  if (FOLDER_ICONS[lower]) return FOLDER_ICONS[lower];
  return DEFAULT_FOLDER;
}
