/** Parse ANSI escape codes into styled spans */

type Span = { text: string; style: React.CSSProperties };

const ANSI_COLORS: Record<number, string> = {
  30: "#1e1e1e",
  31: "#f87171",
  32: "#4ade80",
  33: "#facc15",
  34: "#60a5fa",
  35: "#c084fc",
  36: "#22d3ee",
  37: "#e2e8f0",
  // Bright
  90: "#6b7280",
  91: "#fca5a5",
  92: "#86efac",
  93: "#fde047",
  94: "#93c5fd",
  95: "#d8b4fe",
  96: "#67e8f9",
  97: "#f8fafc",
};

const ANSI_BG: Record<number, string> = {
  40: "#1e1e1e",
  41: "#991b1b",
  42: "#166534",
  43: "#854d0e",
  44: "#1e40af",
  45: "#6b21a8",
  46: "#155e75",
  47: "#d1d5db",
};

/** Strip all ANSI escape sequences from a string */
export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/** Parse a string with ANSI codes into an array of styled spans */
export function parseAnsi(raw: string): Span[] {
  const spans: Span[] = [];
  // eslint-disable-next-line no-control-regex
  const regex = /\x1b\[([0-9;]*)([a-zA-Z])/g;

  let lastIndex = 0;
  let currentStyle: React.CSSProperties = {};
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    // Text before this escape
    if (match.index > lastIndex) {
      const text = raw.slice(lastIndex, match.index);
      if (text) spans.push({ text, style: { ...currentStyle } });
    }
    lastIndex = regex.lastIndex;

    const code = match[1];
    const letter = match[2];

    if (letter !== "m") continue; // Only handle SGR (Select Graphic Rendition)

    const codes = code ? code.split(";").map(Number) : [0];

    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) {
        currentStyle = {};
      } else if (c === 1) {
        currentStyle = { ...currentStyle, fontWeight: "bold" };
      } else if (c === 2) {
        currentStyle = { ...currentStyle, opacity: 0.6 };
      } else if (c === 3) {
        currentStyle = { ...currentStyle, fontStyle: "italic" };
      } else if (c === 4) {
        currentStyle = { ...currentStyle, textDecoration: "underline" };
      } else if (c === 22) {
        const { fontWeight: _, ...rest } = currentStyle;
        currentStyle = rest;
      } else if (c === 39) {
        const { color: _, ...rest } = currentStyle;
        currentStyle = rest;
      } else if (c === 49) {
        const { background: _, ...rest } = currentStyle;
        currentStyle = rest;
      } else if (ANSI_COLORS[c]) {
        currentStyle = { ...currentStyle, color: ANSI_COLORS[c] };
      } else if (ANSI_BG[c]) {
        currentStyle = { ...currentStyle, background: ANSI_BG[c] };
      } else if (c === 38 && codes[i + 1] === 5) {
        // 256-color: \x1b[38;5;Nm — map to approximate
        const n = codes[i + 2] ?? 0;
        currentStyle = { ...currentStyle, color: color256(n) };
        i += 2;
      } else if (c === 48 && codes[i + 1] === 5) {
        const n = codes[i + 2] ?? 0;
        currentStyle = { ...currentStyle, background: color256(n) };
        i += 2;
      }
    }
  }

  // Remaining text
  if (lastIndex < raw.length) {
    const text = raw.slice(lastIndex);
    if (text) spans.push({ text, style: { ...currentStyle } });
  }

  // If no ANSI codes, return single plain span
  if (spans.length === 0 && raw) {
    spans.push({ text: raw, style: {} });
  }

  return spans;
}

/** Approximate 256-color to hex */
function color256(n: number): string {
  if (n < 16) {
    const basic = [
      "#1e1e1e",
      "#f87171",
      "#4ade80",
      "#facc15",
      "#60a5fa",
      "#c084fc",
      "#22d3ee",
      "#e2e8f0",
      "#6b7280",
      "#fca5a5",
      "#86efac",
      "#fde047",
      "#93c5fd",
      "#d8b4fe",
      "#67e8f9",
      "#f8fafc",
    ];
    return basic[n] ?? "#e2e8f0";
  }
  if (n >= 232) {
    const gray = 8 + (n - 232) * 10;
    return `rgb(${gray},${gray},${gray})`;
  }
  // 6x6x6 cube (16-231)
  const idx = n - 16;
  const r = Math.floor(idx / 36) * 51;
  const g = Math.floor((idx % 36) / 6) * 51;
  const b = (idx % 6) * 51;
  return `rgb(${r},${g},${b})`;
}
