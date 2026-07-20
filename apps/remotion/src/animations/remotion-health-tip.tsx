import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Config constants ────────────────────────────────────────────────────────
const CLINIC_NAME = "Greenfield Medical Center";
const SERIES_LABEL = "Wellness Tips";
const TIP_TEXT =
  "Drink 8 glasses of water daily to stay hydrated and boost energy levels.";
const GOAL_COUNT = 8; // number of glasses in the tracker

// Spring default config
const SPRING_CFG = { damping: 14, stiffness: 120 } as const;

// ── Palette ─────────────────────────────────────────────────────────────────
const COLORS = {
  BG: "#0a1a18",
  TEAL: "#12b5a8",
  TEAL_SOFT: "#e7f5f3",
  WHITE: "#ffffff",
  CORAL: "#ff7a66",
  MUTED: "#6b9e99",
  OK: "#2f9e6f",
  CARD: "rgba(18, 181, 168, 0.07)",
  CARD_BORDER: "rgba(18, 181, 168, 0.18)",
} as const;

// ── Pill / Capsule icon ──────────────────────────────────────────────────────
// Drawn entirely with inline SVG — no external assets.
const PillIcon: React.FC<{ size?: number }> = ({ size = 120 }) => {
  const r = size / 2;
  const width = size * 2.2;
  const height = size;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Left half — teal */}
      <path
        d={`M ${r} 0 A ${r} ${r} 0 0 0 ${r} ${height} L ${width / 2} ${height} L ${width / 2} 0 Z`}
        fill={COLORS.TEAL}
      />
      {/* Right half — white/soft */}
      <path
        d={`M ${width / 2} 0 L ${width / 2} ${height} A ${r} ${r} 0 0 0 ${width / 2 + r} ${height / 2} L ${width - r} ${height / 2} A ${r} ${r} 0 0 0 ${width / 2} 0 Z`}
        fill={COLORS.TEAL_SOFT}
      />
      {/* Right end cap */}
      <circle cx={width - r} cy={r} r={r} fill={COLORS.TEAL_SOFT} />
      {/* Left end cap */}
      <circle cx={r} cy={r} r={r} fill={COLORS.TEAL} />
      {/* Divider */}
      <rect
        x={width / 2 - 2}
        y={0}
        width={4}
        height={height}
        fill="rgba(0,0,0,0.15)"
      />
      {/* Centre highlight line */}
      <rect
        x={width / 2 + 3}
        y={height * 0.2}
        width={3}
        height={height * 0.6}
        rx={1.5}
        fill="rgba(255,255,255,0.35)"
      />
    </svg>
  );
};

// ── Word-by-word text reveal ─────────────────────────────────────────────────
const WORDS = TIP_TEXT.split(" ");
// Reveal one word every ~2 frames, starting at frame 24
const WORD_START_FRAME = 24;
const FRAMES_PER_WORD = 2;

const WordReveal: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        fontWeight: 700,
        fontSize: 54,
        lineHeight: 1.25,
        color: COLORS.WHITE,
        textAlign: "center",
        padding: "0 60px",
      }}
    >
      {WORDS.map((word, i) => {
        const revealFrame = WORD_START_FRAME + i * FRAMES_PER_WORD;
        const wordProgress = Math.max(0, frame - revealFrame);
        const opacity = interpolate(wordProgress, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateY = interpolate(wordProgress, [0, 8], [12, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${translateY}px)`,
              marginRight: 14,
              color:
                word.toLowerCase() === "8" || word.toLowerCase() === "water"
                  ? COLORS.TEAL
                  : COLORS.WHITE,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ── Glass icon (SVG) ─────────────────────────────────────────────────────────
const GlassIcon: React.FC<{ filled: boolean; progress: number }> = ({
  filled,
  progress,
}) => {
  const fillHeight = interpolate(progress, [0, 1], [0, 26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glassColor = filled ? COLORS.TEAL : "rgba(18,181,168,0.22)";

  return (
    <svg width={30} height={40} viewBox="0 0 30 40">
      {/* Glass outline */}
      <path
        d="M4 4 L8 36 L22 36 L26 4 Z"
        fill="none"
        stroke={glassColor}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* Water fill — clipped from bottom */}
      {fillHeight > 0 && (
        <clipPath id={`clip-${filled ? "on" : "off"}-${fillHeight.toFixed(0)}`}>
          <rect x={0} y={36 - fillHeight} width={30} height={fillHeight} />
        </clipPath>
      )}
      <path
        d="M8 36 L22 36 L26 4 L4 4 Z"
        fill={COLORS.TEAL}
        fillOpacity={0.7}
        clipPath={`url(#clip-${filled ? "on" : "off"}-${fillHeight.toFixed(0)})`}
      />
    </svg>
  );
};

// ── Hydration progress bar ───────────────────────────────────────────────────
// Bar fills from frame 60 → 120
const BAR_START = 60;
const BAR_END = 120;

const HydrationBar: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const barProgress = interpolate(frame, [BAR_START, BAR_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const containerOpacity = interpolate(frame, [BAR_START - 10, BAR_START + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const filledGlasses = Math.floor(barProgress * GOAL_COUNT);

  return (
    <div
      style={{
        width: "100%",
        padding: "0 60px",
        opacity: containerOpacity,
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            fontWeight: 600,
            fontSize: 30,
            color: COLORS.TEAL_SOFT,
            letterSpacing: 0.3,
          }}
        >
          Hydration goal
        </span>
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            fontWeight: 800,
            fontSize: 32,
            color: COLORS.TEAL,
          }}
        >
          {filledGlasses} / {GOAL_COUNT}
        </span>
      </div>

      {/* Track */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 18,
          borderRadius: 9,
          background: "rgba(18,181,168,0.12)",
          border: `1px solid ${COLORS.CARD_BORDER}`,
          overflow: "hidden",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${barProgress * 100}%`,
            borderRadius: 9,
            background: `linear-gradient(90deg, ${COLORS.TEAL} 0%, #1de9d8 100%)`,
            boxShadow: `0 0 16px ${COLORS.TEAL}80`,
          }}
        />
        {/* Shimmer */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${barProgress * 100}%`,
            background:
              "linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.25) 80%, transparent 100%)",
            borderRadius: 9,
          }}
        />
      </div>

      {/* Glass icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
          padding: "0 4px",
        }}
      >
        {Array.from({ length: GOAL_COUNT }).map((_, i) => {
          const glassThreshold = (i + 1) / GOAL_COUNT;
          const filled = barProgress >= glassThreshold;
          const glassProgress = interpolate(
            barProgress,
            [
              Math.max(0, glassThreshold - 1 / GOAL_COUNT),
              glassThreshold,
            ],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            <GlassIcon key={i} filled={filled} progress={glassProgress} />
          );
        })}
      </div>
    </div>
  );
};

// ── Background decoration ────────────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const glowOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, #0e2a26 0%, ${COLORS.BG} 65%)`,
        }}
      />
      {/* Top glow blob */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.TEAL}22 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />
      {/* Bottom glow blob */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.TEAL}14 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />
      {/* Subtle dot pattern using box-shadow trick */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${COLORS.TEAL}18 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }}
      />
    </>
  );
};

// ── "Tag" label at top ───────────────────────────────────────────────────────
const TopTag: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame,
    fps,
    from: -20,
    to: 0,
    config: SPRING_CFG,
  });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        opacity,
        transform: `translateY(${translateY}px)`,
        background: `linear-gradient(135deg, ${COLORS.TEAL}30 0%, ${COLORS.TEAL}14 100%)`,
        border: `1px solid ${COLORS.TEAL}50`,
        borderRadius: 100,
        padding: "10px 28px",
      }}
    >
      {/* Dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: COLORS.TEAL,
          boxShadow: `0 0 8px ${COLORS.TEAL}`,
        }}
      />
      <span
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 700,
          fontSize: 26,
          color: COLORS.TEAL,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
        }}
      >
        Health Tip of the Day
      </span>
    </div>
  );
};

// ── Footer ───────────────────────────────────────────────────────────────────
const Footer: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [105, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [105, 135], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 6,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Divider line */}
      <div
        style={{
          width: 120,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${COLORS.MUTED}60, transparent)`,
          marginBottom: 10,
        }}
      />
      <span
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 700,
          fontSize: 28,
          color: COLORS.WHITE,
          letterSpacing: 0.2,
        }}
      >
        {CLINIC_NAME}
      </span>
      <span
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 400,
          fontSize: 22,
          color: COLORS.MUTED,
          letterSpacing: 1,
          textTransform: "uppercase" as const,
        }}
      >
        {SERIES_LABEL}
      </span>
    </div>
  );
};

// ── Main composition ─────────────────────────────────────────────────────────
export const HealthTip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pill icon spring drop
  const pillY = spring({
    frame,
    fps,
    from: -260,
    to: 0,
    config: SPRING_CFG,
  });
  const pillOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillScale = spring({
    frame,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 12, stiffness: 100 },
  });

  // Card entrance
  const cardScale = spring({
    frame: Math.max(0, frame - 6),
    fps,
    from: 0.92,
    to: 1,
    config: SPRING_CFG,
  });
  const cardOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.BG }}>
      <Background frame={frame} />

      {/* Content column */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          padding: "80px 0",
        }}
      >
        {/* ── Top tag ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 56 }}>
          <TopTag frame={frame} fps={fps} />
        </div>

        {/* ── Pill icon ────────────────────────────────────────────── */}
        <div
          style={{
            transform: `translateY(${pillY}px) scale(${pillScale})`,
            opacity: pillOpacity,
            marginBottom: 52,
            filter: `drop-shadow(0 12px 40px ${COLORS.TEAL}55)`,
          }}
        >
          <PillIcon size={96} />
        </div>

        {/* ── Card ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: "100%",
            maxWidth: 960,
            background: COLORS.CARD,
            border: `1px solid ${COLORS.CARD_BORDER}`,
            borderRadius: 32,
            padding: "56px 0 48px",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: 52,
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            backdropFilter: "blur(8px)",
            boxShadow: `0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Tip text word reveal */}
          <WordReveal frame={frame} fps={fps} />

          {/* Horizontal divider */}
          <div
            style={{
              width: "calc(100% - 120px)",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${COLORS.TEAL}30, transparent)`,
            }}
          />

          {/* Progress bar */}
          <HydrationBar frame={frame} fps={fps} />
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div style={{ marginTop: 60 }}>
          <Footer frame={frame} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="HealthTip"
    component={HealthTip}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1920}
  />
);
