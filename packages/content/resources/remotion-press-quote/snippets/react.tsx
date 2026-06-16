import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Customizable constants ────────────────────────────────────────────────
const QUOTE =
  "The decisions we make today will define the landscape of tomorrow's economy for an entire generation.";
const SPEAKER = "Christine Okafor";
const SPEAKER_TITLE = "U.S. Secretary of the Treasury";
const SOURCE_BADGE = "NNX EXCLUSIVE INTERVIEW";
const NETWORK = "NNX";
const SHOW_NAME = "NNX Nightly News";

const ACCENT_RED = "#e8001e";
const ACCENT_CYAN = "#00d4ff";
const BG = "#0d1117";
const WHITE = "#ffffff";
const OFF_WHITE = "rgba(255,255,255,0.88)";
const SUBTEXT = "rgba(255,255,255,0.55)";
const GRID_LINE = "rgba(255,255,255,0.04)";
const CARD_BG = "rgba(255,255,255,0.03)";
const CYAN_DIM = "rgba(0,212,255,0.75)";

// ─── Scene boundaries ──────────────────────────────────────────────────────
// Scene 1:   0–30  — Open-quote mark springs in; red accent line sweeps right
// Scene 2:  30–90  — Quote words appear staggered, 3 frames per word
// Scene 3:  90–130 — Attribution springs up; source badge fades in right
// Scene 4: 130–150 — NNX logo + show name fade in; closing quote mirrors in

// ─── Utilities ─────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ─── Sub-components ────────────────────────────────────────────────────────

/** Subtle broadcast grid lines for depth texture */
const BackgroundGrid: React.FC = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={`col-${i}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${(i / 10) * 100}%`,
          width: 1,
          backgroundColor: GRID_LINE,
        }}
      />
    ))}
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={`row-${i}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${(i / 6) * 100}%`,
          height: 1,
          backgroundColor: GRID_LINE,
        }}
      />
    ))}
  </>
);

/** Radial vignette for cinematic depth */
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.72) 100%)",
      pointerEvents: "none",
    }}
  />
);

/** Ambient red glow in top-left corner (quote mark area) */
const AmbientGlow: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: -60,
      left: -60,
      width: 320,
      height: 320,
      borderRadius: "50%",
      background: `radial-gradient(circle, rgba(232,0,30,0.12) 0%, transparent 70%)`,
      pointerEvents: "none",
    }}
  />
);

/** Premium card background panel */
const CardPanel: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      top: 80,
      left: 80,
      right: 80,
      bottom: 80,
      backgroundColor: CARD_BG,
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 4,
      opacity,
    }}
  />
);

// ─── Scene 1: Open-quote mark + red accent line (frames 0–30) ──────────────

const Scene1QuoteMark: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 200 },
  });

  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 112,
        left: 112,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        opacity,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 140,
        lineHeight: 1,
        color: ACCENT_RED,
        fontWeight: 900,
        letterSpacing: -4,
        userSelect: "none",
        filter: `drop-shadow(0 0 24px rgba(232,0,30,0.45))`,
      }}
    >
      &ldquo;
    </div>
  );
};

const Scene1AccentLine: React.FC<{ frame: number }> = ({ frame }) => {
  // Line sweeps from left to right, starts at frame 10
  const progress = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [10, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 228,
        left: 112,
        width: 840,
        height: 3,
        overflow: "hidden",
        opacity,
      }}
    >
      {/* Full line background (dim) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(232,0,30,0.18)",
        }}
      />
      {/* Sweeping bright segment */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: `${progress * 100}%`,
          backgroundColor: ACCENT_RED,
          boxShadow: `0 0 12px rgba(232,0,30,0.6)`,
        }}
      />
    </div>
  );
};

// ─── Scene 2: Staggered word-by-word quote reveal (frames 30–90) ───────────

const WORDS = QUOTE.split(" ");
const FRAMES_PER_WORD = 3;
const WORD_FADE_DURATION = 10; // each word fades over this many frames

const QuoteText: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Overall container fades in at start of scene 2
  const containerOpacity = interpolate(frame, [30, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 248,
        left: 112,
        right: 112,
        opacity: containerOpacity,
      }}
    >
      <p
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 36,
          fontWeight: 400,
          lineHeight: 1.55,
          color: OFF_WHITE,
          letterSpacing: 0.3,
        }}
      >
        {WORDS.map((word, i) => {
          // Each word starts appearing at frame 30 + i * FRAMES_PER_WORD
          const wordStartFrame = 30 + i * FRAMES_PER_WORD;
          const wordProgress = clamp(
            (frame - wordStartFrame) / WORD_FADE_DURATION,
            0,
            1
          );
          const wordOpacity = Easing.out(Easing.quad)(wordProgress);
          const wordY = interpolate(wordProgress, [0, 1], [8, 0]);

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                marginRight: word === WORDS[WORDS.length - 1] ? 0 : "0.28em",
                whiteSpace: "pre",
              }}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
};

// ─── Scene 3: Attribution + source badge (frames 90–130) ───────────────────

const Attribution: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const springVal = spring({
    frame: frame - 90,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const opacity = interpolate(frame, [90, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(springVal, [0, 1], [28, 0]);

  // Separator line between quote text and attribution
  const lineWidth = interpolate(frame, [90, 110], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 476,
        left: 112,
        right: 112,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Separator line */}
      <div
        style={{
          width: lineWidth,
          height: 1,
          backgroundColor: "rgba(0,212,255,0.35)",
          marginBottom: 18,
        }}
      />

      {/* Em-dash + name + title */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          color: CYAN_DIM,
          letterSpacing: 0.8,
        }}
      >
        <span
          style={{
            color: ACCENT_CYAN,
            marginRight: 8,
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          &mdash;
        </span>
        <span style={{ color: WHITE, fontWeight: 600 }}>{SPEAKER}</span>
        <span
          style={{
            color: SUBTEXT,
            marginLeft: 10,
            fontWeight: 400,
            fontSize: 16,
          }}
        >
          &middot;&nbsp;{SPEAKER_TITLE}
        </span>
      </div>
    </div>
  );
};

const SourceBadge: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const springVal = spring({
    frame: frame - 100,
    fps,
    config: { damping: 18, stiffness: 180 },
  });

  const opacity = interpolate(frame, [100, 112], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(springVal, [0, 1], [0.82, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 476,
        right: 112,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "right center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: ACCENT_RED,
          borderRadius: 20,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 7,
          paddingBottom: 7,
          boxShadow: `0 0 18px rgba(232,0,30,0.38)`,
        }}
      >
        {/* Small dot icon */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: WHITE,
            opacity: 0.9,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 800,
            color: WHITE,
            letterSpacing: 1.8,
          }}
        >
          {SOURCE_BADGE}
        </span>
      </div>
    </div>
  );
};

// ─── Scene 4: NNX logo + show name + closing quote (frames 130–150) ────────

const NNXLogoMark: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    {/* Red circle logo mark */}
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: ACCENT_RED,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 10px rgba(232,0,30,0.45)`,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 900,
          color: WHITE,
          letterSpacing: 0.5,
        }}
      >
        {NETWORK}
      </span>
    </div>
    {/* Show name text */}
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 14,
        fontWeight: 600,
        color: WHITE,
        letterSpacing: 1.2,
        opacity: 0.85,
      }}
    >
      {SHOW_NAME}
    </span>
  </div>
);

const BottomBar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [130, 142], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out near end
  const exitOpacity = interpolate(frame, [144, 150], [1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 88,
        left: 112,
        right: 112,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: opacity * exitOpacity,
      }}
    >
      <NNXLogoMark />
      {/* Thin separator */}
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: "rgba(255,255,255,0.08)",
          marginLeft: 24,
          marginRight: 24,
        }}
      />
      {/* Timestamp */}
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 400,
          color: SUBTEXT,
          letterSpacing: 1.0,
        }}
      >
        LIVE BROADCAST
      </span>
    </div>
  );
};

const ClosingQuoteMark: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const springVal = spring({
    frame: frame - 132,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  const opacity = interpolate(frame, [132, 142], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Mirrors from right — scale from 0 with slight translateX
  const scale = interpolate(springVal, [0, 1], [0, 1]);
  const tx = interpolate(springVal, [0, 1], [40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        right: 100,
        opacity,
        transform: `scale(${scale}) translateX(${tx}px)`,
        transformOrigin: "bottom right",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 100,
        lineHeight: 1,
        color: ACCENT_RED,
        fontWeight: 900,
        letterSpacing: -4,
        userSelect: "none",
        filter: `drop-shadow(0 0 18px rgba(232,0,30,0.35))`,
        opacity: opacity * 0.45,
      }}
    >
      &rdquo;
    </div>
  );
};

// ─── Top decorative bar ─────────────────────────────────────────────────────

const TopDecorativeBar: React.FC<{ frame: number }> = ({ frame }) => {
  const width = interpolate(frame, [2, 22], [0, 1080], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.expo),
  });

  const opacity = interpolate(frame, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 100,
        height: 2,
        width,
        opacity,
        background: `linear-gradient(to right, ${ACCENT_RED}, rgba(232,0,30,0.0))`,
      }}
    />
  );
};

// ─── Corner accents ─────────────────────────────────────────────────────────

const CornerAccent: React.FC<{
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  flipX?: boolean;
  flipY?: boolean;
  opacity: number;
}> = ({ top, bottom, left, right, flipX, flipY, opacity }) => {
  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  return (
    <div
      style={{
        position: "absolute",
        top,
        bottom,
        left,
        right,
        width: 28,
        height: 28,
        opacity,
        transform: `scale(${scaleX}, ${scaleY})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 2,
          backgroundColor: "rgba(232,0,30,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 2,
          height: "100%",
          backgroundColor: "rgba(232,0,30,0.5)",
        }}
      />
    </div>
  );
};

const CornerAccents: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [14, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <CornerAccent top={78} left={78} opacity={opacity} />
      <CornerAccent top={78} right={78} flipX opacity={opacity} />
      <CornerAccent bottom={78} left={78} flipY opacity={opacity} />
      <CornerAccent bottom={78} right={78} flipX flipY opacity={opacity} />
    </>
  );
};

// ─── Broadcast chyron tag top-left (OPINION label) ─────────────────────────

const OpinionTag: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tx = interpolate(frame, [18, 30], [-24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        left: 112,
        opacity,
        transform: `translateX(${tx}px)`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          backgroundColor: ACCENT_RED,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 4,
          paddingBottom: 4,
          borderRadius: 2,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 800,
            color: WHITE,
            letterSpacing: 2.2,
          }}
        >
          OPINION
        </span>
      </div>
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 400,
          color: SUBTEXT,
          letterSpacing: 1.0,
        }}
      >
        NNX NIGHTLY NEWS · JUNE 2026
      </span>
    </div>
  );
};

// ─── Decorative vertical line on left edge of card ─────────────────────────

const LeftEdgeLine: React.FC<{ frame: number }> = ({ frame }) => {
  const height = interpolate(frame, [20, 40], [0, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [20, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 128,
        left: 96,
        width: 3,
        height,
        opacity,
        background: `linear-gradient(to bottom, ${ACCENT_RED}, rgba(232,0,30,0.0))`,
        borderRadius: 2,
        boxShadow: `0 0 8px rgba(232,0,30,0.3)`,
      }}
    />
  );
};

// ─── Main composition ──────────────────────────────────────────────────────

export default function PressQuoteCard() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Overall card panel opacity ramps in early and stays
  const panelOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Structural layers */}
      <BackgroundGrid />
      <AmbientGlow />
      <CardPanel opacity={panelOpacity} />
      <Vignette />

      {/* Top decorative sweep line */}
      <TopDecorativeBar frame={frame} />

      {/* Corner brackets */}
      <CornerAccents frame={frame} />

      {/* Left vertical accent bar */}
      <LeftEdgeLine frame={frame} />

      {/* OPINION / chyron tag */}
      <OpinionTag frame={frame} />

      {/* ── Scene 1 (0–30): Open-quote + red sweep line ── */}
      <Scene1QuoteMark frame={frame} fps={fps} />
      <Scene1AccentLine frame={frame} />

      {/* ── Scene 2 (30–90): Staggered quote words ── */}
      <QuoteText frame={frame} fps={fps} />

      {/* ── Scene 3 (90–130): Attribution + source badge ── */}
      {frame >= 88 && <Attribution frame={frame} fps={fps} />}
      {frame >= 98 && <SourceBadge frame={frame} fps={fps} />}

      {/* ── Scene 4 (130–150): NNX logo bar + closing quote ── */}
      <BottomBar frame={frame} />
      {frame >= 130 && <ClosingQuoteMark frame={frame} fps={fps} />}
    </AbsoluteFill>
  );
}
