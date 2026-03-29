import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CODE_LINES = [
  {
    text: "import { serve } from 'bun';",
    colors: ["#c586c0", "#9cdcfe", "#d4d4d4", "#ce9178"],
  },
  { text: "", colors: [] },
  {
    text: "const app = serve({",
    colors: ["#569cd6", "#9cdcfe", "#d4d4d4", "#dcdcaa"],
  },
  { text: "  port: 3000,", colors: ["#9cdcfe", "#b5cea8"] },
  { text: "  fetch(req) {", colors: ["#dcdcaa", "#9cdcfe"] },
  {
    text: "    const url = new URL(req.url);",
    colors: ["#569cd6", "#9cdcfe", "#569cd6", "#4ec9b0", "#9cdcfe"],
  },
  {
    text: "    if (url.pathname === '/api') {",
    colors: ["#c586c0", "#9cdcfe", "#ce9178"],
  },
  {
    text: "      return Response.json({",
    colors: ["#569cd6", "#4ec9b0", "#dcdcaa"],
  },
  { text: "        message: 'Hello!',", colors: ["#9cdcfe", "#ce9178"] },
  {
    text: "        time: Date.now(),",
    colors: ["#9cdcfe", "#4ec9b0", "#dcdcaa"],
  },
  { text: "      });", colors: ["#d4d4d4"] },
  { text: "    }", colors: ["#d4d4d4"] },
  {
    text: "    return new Response('OK');",
    colors: ["#c586c0", "#569cd6", "#4ec9b0", "#ce9178"],
  },
  { text: "  },", colors: ["#d4d4d4"] },
  { text: "});", colors: ["#d4d4d4"] },
  { text: "", colors: [] },
  {
    text: "console.log(`Server on :${app.port}`);",
    colors: ["#9cdcfe", "#dcdcaa", "#ce9178", "#9cdcfe"],
  },
];

const CHARS_PER_FRAME = 1.5;
const TITLE = "server.ts";

const CodeLine: React.FC<{
  line: (typeof CODE_LINES)[number];
  lineIndex: number;
  charOffset: number;
  totalTyped: number;
}> = ({ line, lineIndex, charOffset, totalTyped }) => {
  const lineCharsTyped = Math.max(0, Math.min(line.text.length, totalTyped - charOffset));
  const visibleText = line.text.slice(0, lineCharsTyped);

  if (!line.text) return <div style={{ height: 24 }} />;

  // Simple color: use first color for the whole line
  const color = line.colors[0] || "#d4d4d4";

  return (
    <div style={{ display: "flex", alignItems: "center", height: 28 }}>
      <span
        style={{
          width: 40,
          textAlign: "right",
          marginRight: 16,
          fontFamily: "ui-monospace, monospace",
          fontSize: 13,
          color: "rgba(255,255,255,0.2)",
        }}
      >
        {lineIndex + 1}
      </span>
      <span
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 15,
          color,
          whiteSpace: "pre",
        }}
      >
        {visibleText}
        {lineCharsTyped < line.text.length &&
          lineCharsTyped === Math.floor(totalTyped - charOffset) && (
            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                width: 2,
                height: 18,
                display: "inline-block",
                marginLeft: 1,
                animation: "none",
              }}
            />
          )}
      </span>
    </div>
  );
};

export const CodeWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalTyped = Math.max(0, (frame - 25) * CHARS_PER_FRAME);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({
    frame,
    fps,
    from: -10,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });

  const editorOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const editorScale = spring({
    frame: Math.max(0, frame - 10),
    fps,
    from: 0.95,
    to: 1,
    config: { damping: 20, stiffness: 100 },
  });

  let charOffset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1e1e2e" }}>
      {/* Editor window */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 80,
          right: 80,
          bottom: 40,
          borderRadius: 12,
          backgroundColor: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          opacity: editorOpacity,
          transform: `scale(${editorScale})`,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 40,
            backgroundColor: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#febc2e",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#28c840",
            }}
          />
          <div
            style={{
              marginLeft: 16,
              fontFamily: "system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
            }}
          >
            {TITLE}
          </div>
        </div>

        {/* Code area */}
        <div style={{ padding: "16px 20px" }}>
          {CODE_LINES.map((line, i) => {
            const offset = charOffset;
            charOffset += line.text.length || 0;
            return (
              <CodeLine
                key={i}
                line={line}
                lineIndex={i}
                charOffset={offset}
                totalTyped={totalTyped}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CodeWalkthrough"
    component={CodeWalkthrough}
    durationInFrames={240}
    fps={30}
    width={1280}
    height={720}
  />
);
