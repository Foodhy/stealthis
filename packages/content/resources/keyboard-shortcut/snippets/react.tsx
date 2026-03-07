import { useState, useEffect } from "react";

interface Shortcut {
  description: string;
  keys: string[];
}

interface Group {
  category: string;
  shortcuts: Shortcut[];
}

const SHORTCUTS: Group[] = [
  {
    category: "Navigation",
    shortcuts: [
      { description: "Command palette",  keys: ["⌘", "K"] },
      { description: "Quick open file",  keys: ["⌘", "P"] },
      { description: "Go to line",       keys: ["⌃", "G"] },
      { description: "Go to symbol",     keys: ["⌘", "⇧", "O"] },
      { description: "Toggle sidebar",   keys: ["⌘", "B"] },
    ],
  },
  {
    category: "Editing",
    shortcuts: [
      { description: "Duplicate line",   keys: ["⌘", "⇧", "D"] },
      { description: "Delete line",      keys: ["⌘", "⇧", "K"] },
      { description: "Move line up",     keys: ["⌥", "↑"] },
      { description: "Move line down",   keys: ["⌥", "↓"] },
      { description: "Comment line",     keys: ["⌘", "/"] },
      { description: "Format document",  keys: ["⌥", "⇧", "F"] },
    ],
  },
  {
    category: "Selection",
    shortcuts: [
      { description: "Select word",      keys: ["⌘", "D"] },
      { description: "Select line",      keys: ["⌘", "L"] },
      { description: "Select all",       keys: ["⌘", "A"] },
      { description: "Multi-cursor",     keys: ["⌥", "Click"] },
      { description: "Expand selection", keys: ["⌃", "⇧", "→"] },
    ],
  },
  {
    category: "Terminal",
    shortcuts: [
      { description: "New terminal",     keys: ["⌃", "`"] },
      { description: "Kill terminal",    keys: ["⌃", "C"] },
      { description: "Clear",            keys: ["⌃", "K"] },
      { description: "Previous command", keys: ["↑"] },
    ],
  },
];

const KEY_MAP: Record<string, string> = {
  Meta:      "⌘",
  Control:   "⌃",
  Alt:       "⌥",
  Shift:     "⇧",
  ArrowUp:   "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight:"→",
  Backquote: "`",
  Slash:     "/",
  Enter:     "↩",
  Escape:    "⎋",
  Tab:       "⇥",
  Backspace: "⌫",
  Delete:    "⌦",
  " ":       "Space",
};

function normalizeKey(key: string, code: string): string {
  if (KEY_MAP[key]) return KEY_MAP[key];
  if (KEY_MAP[code]) return KEY_MAP[code];
  if (key.length === 1) return key.toUpperCase();
  return key;
}

export default function KeyboardShortcutRC() {
  const [search, setSearch] = useState("");
  const [pressed, setPressed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout>;

    const onKeyDown = (e: KeyboardEvent) => {
      const label = normalizeKey(e.key, e.code);
      setPressed((prev) => new Set([...prev, label]));
      clearTimeout(clearTimer);
    };

    const onKeyUp = () => {
      clearTimer = setTimeout(() => setPressed(new Set()), 1000);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const isActive = (keys: string[]) =>
    keys.length > 0 && keys.every((k) => pressed.has(k));

  const q = search.toLowerCase();
  const filtered = SHORTCUTS.map((g) => ({
    ...g,
    shortcuts: g.shortcuts.filter(
      (s) =>
        s.description.toLowerCase().includes(q) ||
        s.keys.some((k) => k.toLowerCase().includes(q)) ||
        g.category.toLowerCase().includes(q)
    ),
  })).filter((g) => g.shortcuts.length > 0);

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[680px] space-y-5">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#e6edf3]">Keyboard Shortcuts</h2>
            {pressed.size > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#8b949e]">Detecting:</span>
                {[...pressed].map((k) => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 bg-[#58a6ff]/20 border border-[#58a6ff]/50 rounded text-[11px] font-mono font-bold text-[#58a6ff]"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Search shortcuts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
          />
          <p className="text-[11px] text-[#484f58]">
            Press any key combination — matching shortcuts will highlight.
          </p>
        </div>

        {/* Groups */}
        <div className="space-y-4">
          {filtered.map((group) => (
            <div
              key={group.category}
              className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-[#21262d] border-b border-[#30363d]">
                <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">
                  {group.category}
                </span>
              </div>
              <div className="divide-y divide-[#21262d]">
                {group.shortcuts.map((s) => {
                  const active = isActive(s.keys);
                  return (
                    <div
                      key={s.description}
                      className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                        active ? "bg-[#58a6ff]/[0.08]" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <span
                        className={`text-[13px] transition-colors ${
                          active ? "text-[#e6edf3] font-semibold" : "text-[#8b949e]"
                        }`}
                      >
                        {s.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {s.keys.map((k, i) => (
                          <kbd
                            key={i}
                            className={`px-2 py-0.5 rounded text-[12px] font-mono font-bold border transition-all ${
                              active && pressed.has(k)
                                ? "bg-[#58a6ff]/20 border-[#58a6ff]/60 text-[#58a6ff] scale-110"
                                : "bg-[#21262d] border-[#30363d] text-[#e6edf3]"
                            }`}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
