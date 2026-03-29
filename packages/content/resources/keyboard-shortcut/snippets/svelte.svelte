<script>
import { onMount, onDestroy } from "svelte";

const SHORTCUTS = [
  {
    category: "Navigation",
    shortcuts: [
      { description: "Command palette", keys: ["\u2318", "K"] },
      { description: "Quick open file", keys: ["\u2318", "P"] },
      { description: "Go to line", keys: ["\u2303", "G"] },
      { description: "Go to symbol", keys: ["\u2318", "\u21E7", "O"] },
      { description: "Toggle sidebar", keys: ["\u2318", "B"] },
    ],
  },
  {
    category: "Editing",
    shortcuts: [
      { description: "Duplicate line", keys: ["\u2318", "\u21E7", "D"] },
      { description: "Delete line", keys: ["\u2318", "\u21E7", "K"] },
      { description: "Move line up", keys: ["\u2325", "\u2191"] },
      { description: "Move line down", keys: ["\u2325", "\u2193"] },
      { description: "Comment line", keys: ["\u2318", "/"] },
      { description: "Format document", keys: ["\u2325", "\u21E7", "F"] },
    ],
  },
  {
    category: "Selection",
    shortcuts: [
      { description: "Select word", keys: ["\u2318", "D"] },
      { description: "Select line", keys: ["\u2318", "L"] },
      { description: "Select all", keys: ["\u2318", "A"] },
      { description: "Multi-cursor", keys: ["\u2325", "Click"] },
      { description: "Expand selection", keys: ["\u2303", "\u21E7", "\u2192"] },
    ],
  },
  {
    category: "Terminal",
    shortcuts: [
      { description: "New terminal", keys: ["\u2303", "`"] },
      { description: "Kill terminal", keys: ["\u2303", "C"] },
      { description: "Clear", keys: ["\u2303", "K"] },
      { description: "Previous command", keys: ["\u2191"] },
    ],
  },
];

const KEY_MAP = {
  Meta: "\u2318",
  Control: "\u2303",
  Alt: "\u2325",
  Shift: "\u21E7",
  ArrowUp: "\u2191",
  ArrowDown: "\u2193",
  ArrowLeft: "\u2190",
  ArrowRight: "\u2192",
  Backquote: "`",
  Slash: "/",
  Enter: "\u21A9",
  Escape: "\u238B",
  Tab: "\u21E5",
  Backspace: "\u232B",
  Delete: "\u2326",
  " ": "Space",
};

function normalizeKey(key, code) {
  if (KEY_MAP[key]) return KEY_MAP[key];
  if (KEY_MAP[code]) return KEY_MAP[code];
  if (key.length === 1) return key.toUpperCase();
  return key;
}

let search = "";
let pressed = new Set();
let clearTimer = null;

function onKeyDown(e) {
  const label = normalizeKey(e.key, e.code);
  pressed = new Set([...pressed, label]);
  clearTimeout(clearTimer);
}

function onKeyUp() {
  clearTimer = setTimeout(() => {
    pressed = new Set();
  }, 1000);
}

onMount(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
});

onDestroy(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  }
});

function isActive(keys) {
  return keys.length > 0 && keys.every((k) => pressed.has(k));
}

$: pressedKeys = [...pressed];

$: filtered = (() => {
  const q = search.toLowerCase();
  return SHORTCUTS.map((g) => ({
    ...g,
    shortcuts: g.shortcuts.filter(
      (s) =>
        s.description.toLowerCase().includes(q) ||
        s.keys.some((k) => k.toLowerCase().includes(q)) ||
        g.category.toLowerCase().includes(q)
    ),
  })).filter((g) => g.shortcuts.length > 0);
})();
</script>

<div style="min-height:100vh;background:#0d1117;padding:1.5rem;display:flex;justify-content:center;font-family:system-ui,-apple-system,sans-serif">
  <div style="width:100%;max-width:680px;display:flex;flex-direction:column;gap:1.25rem">
    <!-- Header -->
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <h2 style="font-size:15px;font-weight:700;color:#e6edf3;margin:0">Keyboard Shortcuts</h2>
        {#if pressedKeys.length > 0}
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:11px;color:#8b949e">Detecting:</span>
            {#each pressedKeys as k}
              <kbd style="padding:2px 6px;background:rgba(88,166,255,0.2);border:1px solid rgba(88,166,255,0.5);border-radius:4px;font-size:11px;font-family:monospace;font-weight:700;color:#58a6ff">{k}</kbd>
            {/each}
          </div>
        {/if}
      </div>
      <input
        type="text"
        placeholder="Search shortcuts..."
        bind:value={search}
        style="width:100%;background:#21262d;border:1px solid #30363d;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:13px;color:#e6edf3;outline:none;box-sizing:border-box"
      />
      <p style="font-size:11px;color:#484f58;margin:0">Press any key combination &#8212; matching shortcuts will highlight.</p>
    </div>

    <!-- Groups -->
    <div style="display:flex;flex-direction:column;gap:1rem">
      {#each filtered as group}
        <div style="background:#161b22;border:1px solid #30363d;border-radius:0.75rem;overflow:hidden">
          <div style="padding:0.625rem 1rem;background:#21262d;border-bottom:1px solid #30363d">
            <span style="font-size:11px;font-weight:700;color:#8b949e;text-transform:uppercase;letter-spacing:0.08em">{group.category}</span>
          </div>
          <div>
            {#each group.shortcuts as s}
              <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 1rem;border-top:1px solid #21262d;background:{isActive(s.keys) ? 'rgba(88,166,255,0.08)' : 'transparent'}">
                <span style="font-size:13px;color:{isActive(s.keys) ? '#e6edf3' : '#8b949e'};font-weight:{isActive(s.keys) ? '600' : '400'}">{s.description}</span>
                <div style="display:flex;align-items:center;gap:4px">
                  {#each s.keys as k, i}
                    <kbd style="padding:2px 8px;border-radius:4px;font-size:12px;font-family:monospace;font-weight:700;border:1px solid {isActive(s.keys) && pressed.has(k) ? 'rgba(88,166,255,0.6)' : '#30363d'};background:{isActive(s.keys) && pressed.has(k) ? 'rgba(88,166,255,0.2)' : '#21262d'};color:{isActive(s.keys) && pressed.has(k) ? '#58a6ff' : '#e6edf3'};transform:{isActive(s.keys) && pressed.has(k) ? 'scale(1.1)' : 'scale(1)'};transition:all 0.15s">{k}</kbd>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
