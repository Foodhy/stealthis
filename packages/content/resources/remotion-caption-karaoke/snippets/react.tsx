import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationFrames: 600,

  // Speaker / episode metadata
  speakerName: "Alex Rivera",
  episodeLabel: "Episode 12 · The AI Frontier",

  // Colors
  bgColor: "#0d0d0f",
  wordColorInactive: "#ffffff",
  wordColorActive: "#ffd23f",
  speakerColor: "#ffd23f",
  episodeColor: "rgba(255,255,255,0.55)",

  // Typography
  captionFontSize: 72,
  speakerFontSize: 22,
  episodeFontSize: 20,

  // Vertical placement: caption line sits at 75% of height
  captionTopPercent: 0.75,

  // Word color transition ramp (frames)
  highlightRampIn: 3,
  highlightRampOut: 4,

  // Film grain intensity (0–1)
  grainIntensity: 0.045,

  // Metadata fade-in
  metaFadeStart: 20,
  metaFadeEnd: 45,
} as const;

// ─── WORD TIMESTAMPS ─────────────────────────────────────────────────────────
// Each entry: the word and the frame range [start, end] during which it is "active".
// Words are spread across frames 60–540 (realistic speech pacing at 30 fps).
interface WordEntry {
  word: string;
  start: number;
  end: number;
}

const WORDS: WordEntry[] = [
  { word: "The",     start: 60,  end: 102 },
  { word: "future",  start: 102, end: 162 },
  { word: "of",      start: 162, end: 204 },
  { word: "AI",      start: 204, end: 270 },
  { word: "coding",  start: 270, end: 348 },
  { word: "is",      start: 348, end: 384 },
  { word: "already", start: 384, end: 456 },
  { word: "here",    start: 456, end: 498 },
  { word: "right",   start: 498, end: 522 },
  { word: "now",     start: 522, end: 570 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Pseudo-random value in [0,1) seeded by (x, y, frame).
 * Pure arithmetic — no external deps.
 */
function noise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

// ─── FILM GRAIN ──────────────────────────────────────────────────────────────
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Build a canvas-like SVG filter using feTurbulence seeded by frame
  // to produce a different grain pattern each frame.
  const seed = (frame * 17) % 9999;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, opacity: CONFIG.grainIntensity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={`grain-${frame}`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            seed={seed}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="overlay" />
        </filter>
        <rect width={width} height={height} filter={`url(#grain-${frame})`} />
      </svg>
    </div>
  );
};

// ─── VIGNETTE ─────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.72) 100%)",
      pointerEvents: "none",
    }}
  />
);

// ─── SPEAKER METADATA ────────────────────────────────────────────────────────
const SpeakerMeta: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [CONFIG.metaFadeStart, CONFIG.metaFadeEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const y = interpolate(
    frame,
    [CONFIG.metaFadeStart, CONFIG.metaFadeEnd],
    [18, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: `calc(${CONFIG.captionTopPercent * 100}% - 100px)`,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: 40,
          height: 3,
          borderRadius: 2,
          backgroundColor: CONFIG.speakerColor,
          marginBottom: 8,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: CONFIG.speakerFontSize,
          color: CONFIG.speakerColor,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {CONFIG.speakerName}
      </span>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: CONFIG.episodeFontSize,
          color: CONFIG.episodeColor,
          letterSpacing: "0.06em",
        }}
      >
        {CONFIG.episodeLabel}
      </span>
    </div>
  );
};

// ─── SINGLE WORD ─────────────────────────────────────────────────────────────
const KaraokeWord: React.FC<{ entry: WordEntry }> = ({ entry }) => {
  const frame = useCurrentFrame();

  // 1 when fully active, 0 when inactive — smooth ramp in / out
  const activeProgress = interpolate(
    frame,
    [
      entry.start - CONFIG.highlightRampIn,
      entry.start,
      entry.end,
      entry.end + CONFIG.highlightRampOut,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Lerp between inactive (white) and active (yellow) as RGB components
  // Active: #ffd23f → rgb(255, 210, 63)
  // Inactive: #ffffff → rgb(255, 255, 255)
  const r = 255;
  const g = Math.round(255 + (210 - 255) * activeProgress); // 255 → 210
  const b = Math.round(255 + (63  - 255) * activeProgress); // 255 → 63
  const color = `rgb(${r},${g},${b})`;

  // Slight scale-up on active word for emphasis
  const scale = interpolate(activeProgress, [0, 1], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow (text-shadow) only when active
  const glowAlpha = Math.round(activeProgress * 180)
    .toString(16)
    .padStart(2, "0");
  const textShadow =
    activeProgress > 0.05
      ? `0 0 28px #ffd23f${glowAlpha}, 0 0 8px #ffd23f88`
      : "none";

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        fontSize: CONFIG.captionFontSize,
        color,
        textShadow,
        transform: `scale(${scale})`,
        transformOrigin: "center bottom",
        margin: "0 10px",
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
        transition: "none",
      }}
    >
      {entry.word}
    </span>
  );
};

// ─── CAPTION LINE ─────────────────────────────────────────────────────────────
const CaptionLine: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade the whole caption block in from frame 50
  const opacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out after the last word ends
  const fadeOutOpacity = interpolate(frame, [570, 595], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: `${CONFIG.captionTopPercent * 100}%`,
        left: 0,
        right: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        opacity: opacity * fadeOutOpacity,
        padding: "0 120px",
      }}
    >
      {WORDS.map((entry, i) => (
        <KaraokeWord key={i} entry={entry} />
      ))}
    </div>
  );
};

// ─── MAIN COMPOSITION ────────────────────────────────────────────────────────
export const KaraokeCaption: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.bgColor }}>
      {/* Subtle warm center glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,210,63,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <FilmGrain />
      <Vignette />
      <SpeakerMeta />
      <CaptionLine />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="KaraokeCaption"
    component={KaraokeCaption}
    durationInFrames={CONFIG.durationFrames}
    fps={CONFIG.fps}
    width={CONFIG.width}
    height={CONFIG.height}
  />
);
