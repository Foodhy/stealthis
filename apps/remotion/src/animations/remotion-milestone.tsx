import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── Theme ────────────────────────────────────────────────────────────────────
const TEAL = "#14b8a6";
const EMERALD = "#10b981";
const EMERALD_LIGHT = "#34d399";
const BG_DARK = "#060e0d";
const BG_MID = "#0a1a18";
const MILESTONE_NUMBER = "10,000";
const MILESTONE_LABEL = "Subscribers";
const BRAND_NAME = "Stealthis";

// ─── Confetti dot ─────────────────────────────────────────────────────────────
interface ConfettiDotProps {
  index: number;
  frame: number;
  startFrame: number;
}

const CONFETTI_COLORS = [
  "#14b8a6", "#10b981", "#34d399", "#6ee7b7",
  "#f0fdf4", "#86efac", "#a7f3d0", "#ffffff",
  "#5eead4", "#2dd4bf",
];

const ConfettiDot: React.FC<ConfettiDotProps> = ({ index, frame, startFrame }) => {
  const f = Math.max(0, frame - startFrame);
  if (f <= 0) return null;

  // Deterministic pseudo-random per index
  const seed1 = (index * 1.618 + 0.3) % 1;
  const seed2 = (index * 2.414 + 0.7) % 1;
  const seed3 = (index * 3.141 + 0.1) % 1;
  const seed4 = (index * 0.577 + 0.5) % 1;

  const angle = seed1 * Math.PI * 2;
  const speed = 3 + seed2 * 5;
  const size = 5 + seed3 * 9;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

  // Physics: initial burst + gravity
  const t = f * 0.6;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed - 4; // upward bias
  const gravity = 0.18;

  const x = 640 + vx * t;
  const y = 360 + vy * t + 0.5 * gravity * t * t;

  const maxLife = 70 + seed4 * 30;
  const opacity = interpolate(f, [0, 8, maxLife - 12, maxLife], [0, 1, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rotation = seed3 * 360 + f * (seed1 * 8 - 4);
  const isRect = index % 3 === 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: isRect ? size * 0.5 : size,
        borderRadius: isRect ? 2 : "50%",
        backgroundColor: color,
        opacity,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
};

// ─── Concentric ring ──────────────────────────────────────────────────────────
interface RingProps {
  frame: number;
  startFrame: number;
  delay: number;
  maxRadius: number;
  color: string;
  thickness: number;
}

const Ring: React.FC<RingProps> = ({ frame, startFrame, delay, maxRadius, color, thickness }) => {
  const f = Math.max(0, frame - startFrame - delay);
  const duration = 50;

  const progress = interpolate(f, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const radius = progress * maxRadius;
  const opacity = interpolate(f, [0, 10, duration - 10, duration], [0, 0.8, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (radius <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 640 - radius,
        top: 360 - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `${thickness}px solid ${color}`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Background grid ─────────────────────────────────────────────────────────
const BackgroundGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 30], [0, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lines = [];
  const cols = 20;
  const rows = 11;

  for (let i = 0; i <= cols; i++) {
    lines.push(
      <line
        key={`v${i}`}
        x1={i * (1280 / cols)}
        y1={0}
        x2={i * (1280 / cols)}
        y2={720}
        stroke="white"
        strokeWidth={0.5}
      />
    );
  }
  for (let j = 0; j <= rows; j++) {
    lines.push(
      <line
        key={`h${j}`}
        x1={0}
        y1={j * (720 / rows)}
        x2={1280}
        y2={j * (720 / rows)}
        stroke="white"
        strokeWidth={0.5}
      />
    );
  }

  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity }}
      width={1280}
      height={720}
    >
      {lines}
    </svg>
  );
};

// ─── Radial glow ─────────────────────────────────────────────────────────────
const CenterGlow: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const f = Math.max(0, frame - startFrame);
  const size = interpolate(f, [0, 40], [0, 900], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const opacity = interpolate(f, [0, 15, 90, 120], [0, 0.35, 0.25, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 640 - size / 2,
        top: 360 - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${TEAL}55 0%, ${EMERALD}22 40%, transparent 70%)`,
        opacity,
      }}
    />
  );
};

// ─── Milestone number display ─────────────────────────────────────────────────
const MilestoneNumber: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ENTER = 15;
  const f = Math.max(0, frame - ENTER);

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 160 },
  });

  const opacity = interpolate(frame, [ENTER, ENTER + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle shimmer pulse after entry
  const shimmer = interpolate(
    Math.max(0, frame - 45) % 90,
    [0, 15, 30],
    [1, 1.015, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        textAlign: "center",
        transform: `scale(${scale * shimmer})`,
        opacity,
      }}
    >
      {/* Emoji badge */}
      <div
        style={{
          fontSize: 52,
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        🎯
      </div>

      {/* Big number */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 148,
          lineHeight: 1,
          letterSpacing: -6,
          background: `linear-gradient(135deg, ${EMERALD_LIGHT} 0%, ${TEAL} 50%, #67e8f9 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {MILESTONE_NUMBER}
      </div>
    </div>
  );
};

// ─── Milestone label ──────────────────────────────────────────────────────────
const MilestoneLabel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ENTER = 30;
  const f = Math.max(0, frame - ENTER);

  const y = spring({
    frame: f,
    fps,
    from: 28,
    to: 0,
    config: { damping: 14, stiffness: 90 },
  });

  const opacity = interpolate(frame, [ENTER, ENTER + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        textAlign: "center",
        transform: `translateY(${y}px)`,
        opacity,
        marginTop: 8,
      }}
    >
      {/* "Milestone Reached" tag */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: `${TEAL}22`,
          border: `1.5px solid ${TEAL}55`,
          borderRadius: 100,
          padding: "6px 20px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: TEAL,
            boxShadow: `0 0 8px ${TEAL}`,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: TEAL,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Milestone Reached
        </span>
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 300,
          fontSize: 36,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {MILESTONE_LABEL}
      </div>
    </div>
  );
};

// ─── Thank you end card ───────────────────────────────────────────────────────
const ThankYouCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ENTER = 88;
  const f = Math.max(0, frame - ENTER);

  const opacity = interpolate(frame, [ENTER, ENTER + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = spring({
    frame: f,
    fps,
    from: 20,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 52,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* Divider */}
      <div
        style={{
          width: 220,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${TEAL}66, transparent)`,
          marginBottom: 4,
        }}
      />

      {/* Brand row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* Logo placeholder */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${TEAL}, ${EMERALD})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ✦
        </div>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: -0.5,
          }}
        >
          {BRAND_NAME}
        </span>
      </div>

      {/* Thank you message */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        Thank You!
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const RemotionMilestone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const BURST_START = 12;
  const CONFETTI_COUNT = 60;

  // Ring wave config: [delay from BURST_START, maxRadius, color, thickness]
  const rings: Array<[number, number, string, number]> = [
    [0, 180, TEAL, 3],
    [6, 290, EMERALD, 2],
    [12, 410, TEAL, 1.5],
    [20, 520, EMERALD_LIGHT, 1],
    [28, 620, TEAL, 1],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK, overflow: "hidden" }}>
      {/* Background gradient sweep */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 120% 80% at 50% 50%, ${BG_MID} 0%, ${BG_DARK} 100%)`,
        }}
      />

      {/* Subtle grid */}
      <BackgroundGrid frame={frame} />

      {/* Center radial glow */}
      <CenterGlow frame={frame} startFrame={BURST_START} />

      {/* Expanding concentric rings */}
      {rings.map(([delay, maxR, color, thick], i) => (
        <Ring
          key={i}
          frame={frame}
          startFrame={BURST_START}
          delay={delay}
          maxRadius={maxR}
          color={color}
          thickness={thick}
        />
      ))}

      {/* Confetti scatter */}
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <ConfettiDot
          key={i}
          index={i}
          frame={frame}
          startFrame={BURST_START + Math.floor(i / 12) * 2}
        />
      ))}

      {/* Main content centered */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          paddingBottom: 60,
        }}
      >
        <MilestoneNumber frame={frame} fps={fps} />
        <MilestoneLabel frame={frame} fps={fps} />
      </div>

      {/* Thank you end card */}
      <ThankYouCard frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ─── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionMilestone"
    component={RemotionMilestone}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
