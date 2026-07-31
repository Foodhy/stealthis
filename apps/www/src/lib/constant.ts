export const SHOW_SORT_BAR = true;
export const ENABLE_INDEX_BG_ANIMATION = false;
export const SHOW_BOTTOM_BG_ANIMATION = false;
export const SHOW_LOWER_BG_ANIMATION = true;

export const SHOW_STYLEFORGE_STUDIO = false;
export const SHOW_BUILD_BUTTON = false;
export const SHOW_ARCADE_HEADER = false;
export const SHOW_DBVIZ = true;
export const SHOW_PROMPT_DESIGNER = true;

/**
 * How many library cards are visible on first paint (and after every filter
 * change) before infinite scroll reveals more. Shared between the static markup
 * in `pages/library/index.astro` and the reveal logic in `LibrarySidebar.astro`
 * so the server-rendered HTML matches the post-hydration state exactly — if the
 * two drift apart, the page visibly reflows on load.
 */
export const LIBRARY_INITIAL_REVEAL = 48;

export const DEBUG_MODE = false;
