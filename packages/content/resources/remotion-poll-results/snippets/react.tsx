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

// ── Palette & Config ──────────────────────────────────────────────────────────
const BG_COLOR = "#0a0a0f";

const POLL_QUESTION = "Which feature do you want most?";
const TOTAL_VOTES = 1842;

interface PollOption {
  label: string;
  votes: number;
  pct: number;   // 0–100
  color: string;
  isWinner: boolean;
}

// ── Dataset ───────────────────────────────────────────────────────────────────
const OPTIONS: PollOption[] = [
  { label: "Dark Mode",       votes: 774,  pct: 42, color: "#6366f1", isWinner: true  },
  { label: "API Access",      votes: 516,  pct: 28, color: "#06b6d4", isWinner: false },
  { label: "Mobile App",      votes: 331,  pct: 18, color: "#10b981", isWinner: false },
  { label: "More Templates",  votes: 221,  pct: 12, color: "#f59e0b", isWinner: false },
];

// ── Timing constants ──────────────────────────────────────────────────────────
// Donut reveals from frame 0 to 60
const DONUT_START  = 0;
const DONUT_END    = 60;
// Options stagger in from frame 60, 15-frame gap each
const OPTIONS_START = 60;
const OPTION_STAGGER = 15;

// ── Helper: spring convenience ────────────────────────────────────────────────
function springVal(frame: number, fps: number, delay = 0, cfg?: object): number {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 100, mass: 0.7, ...cfg },
  });
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

interface DonutProps {
  frame: number;
  fps: number;
}

const Donut: React.FC<DonutProps> = ({ frame, fps }) => {
  const SIZE = 260;
  const cx   = SIZE / 2;
  const cy   = SIZE / 2;
  const R    = 108;
  const stroke = 32;

  // 0→1 progress for full donut reveal
  const revealProgress = spring({
    frame: Math.max(0, frame - DONUT_START),
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 70, mass: 1.1 },
  });

  // Clamp so we never draw more than the full circle
  const clampedProgress = Math.min(1, revealProgress);

  // Build cumulative arcs for each segment
  const circumference = 2 * Math.PI * R;

  // Each segment runs from its cumulative start to end, clipped by revealProgress
  let cumulative = 0;

  // SVG arc segments
  const segments = OPTIONS.map((opt) => {
    const segFraction = opt.pct / 100;
    const segStart    = cumulative;
    const segEnd      = cumulative + segFraction;
    cumulative        = segEnd;

    // How much of this segment is visible
    const visibleEnd   = Math.min(segEnd, clampedProgress);
    const visibleStart = Math.min(segStart, clampedProgress);
    const visibleFrac  = Math.max(0, visibleEnd - visibleStart);

    // strokeDasharray trick for partial arc
    const dashLength = visibleFrac * circumference;
    const dashOffset = -(segStart * circumference);

    return { ...opt, dashLength, dashOffset };
  });

  // Fade in the center text
  const centerOpacity = interpolate(frame, [DONUT_START + 40, DONUT_END + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Total votes count-up
  const displayVotes = Math.round(
    interpolate(frame, [DONUT_START + 40, DONUT_END + 15], [0, TOTAL_VOTES], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    })
  );

  // Glow pulse keyed to reveal progress
  const glowOpacity = interpolate(clampedProgress, [0, 0.5, 1], [0, 0.35, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE,
        flexShrink: 0,
      }}
    >
      {/* Ambient glow behind donut */}
      <div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      <svg width={SIZE} height={SIZE} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />

        {/* Colored segments — drawn clockwise from 12 o'clock (-90°) */}
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke - 2}
            strokeLinecap="butt"
            strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
            strokeDashoffset={-(seg.dashOffset)}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 8px ${seg.color}88)` }}
          />
        ))}
      </svg>

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: centerOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color: "#ffffff",
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          {displayVotes.toLocaleString()}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            marginTop: 5,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          votes
        </div>
      </div>
    </div>
  );
};

// ── Option Row ────────────────────────────────────────────────────────────────

interface OptionRowProps {
  opt: PollOption;
  frame: number;
  fps: number;
  delay: number;
  index: number;
}

const OptionRow: React.FC<OptionRowProps> = ({ opt, frame, fps, delay, index }) => {
  const f = Math.max(0, frame - delay);

  // Slide + fade entrance
  const entranceT = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 90, mass: 0.8 },
  });
  const opacity = Math.min(1, entranceT * 1.5);
  const translateX = interpolate(entranceT, [0, 1], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Bar fill width spring (0 → pct%)
  const barFill = spring({
    frame: Math.max(0, f - 6),
    fps,
    from: 0,
    to: opt.pct / 100,
    config: { damping: 18, stiffness: 80, mass: 0.9 },
  });

  // Vote count-up
  const displayVotes = Math.round(
    interpolate(f, [6, 35], [0, opt.votes], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    })
  );

  const pctDisplay = Math.round(
    interpolate(f, [6, 35], [0, opt.pct], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    })
  );

  const BAR_HEIGHT = 10;
  const BAR_WIDTH  = 380;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        opacity,
        transform: `translateX(${translateX}px)`,
        padding: "14px 18px",
        borderRadius: 12,
        background: opt.isWinner
          ? `linear-gradient(135deg, ${opt.color}14 0%, transparent 100%)`
          : "transparent",
        border: opt.isWinner
          ? `1px solid ${opt.color}30`
          : "1px solid transparent",
      }}
    >
      {/* Top row: dot + label + winner badge + votes + pct */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Colored dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: opt.color,
            boxShadow: `0 0 8px ${opt.color}`,
            flexShrink: 0,
          }}
        />

        {/* Label */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: opt.isWinner ? 700 : 600,
            fontSize: 18,
            color: opt.isWinner ? "#ffffff" : "rgba(255,255,255,0.75)",
            flex: 1,
            letterSpacing: "-0.3px",
          }}
        >
          {opt.label}
        </div>

        {/* Winner crown badge */}
        {opt.isWinner && (
          <div
            style={{
              background: `linear-gradient(135deg, ${opt.color} 0%, ${opt.color}aa 100%)`,
              borderRadius: 6,
              padding: "2px 8px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 10,
              color: "#fff",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Top
          </div>
        )}

        {/* Vote count */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "rgba(255,255,255,0.45)",
            minWidth: 60,
            textAlign: "right",
          }}
        >
          {displayVotes.toLocaleString()}
        </div>

        {/* Percentage */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: opt.color,
            minWidth: 46,
            textAlign: "right",
            letterSpacing: "-0.5px",
          }}
        >
          {pctDisplay}%
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: BAR_WIDTH,
          height: BAR_HEIGHT,
          borderRadius: 6,
          backgroundColor: "rgba(255,255,255,0.07)",
          overflow: "hidden",
          marginLeft: 20,
        }}
      >
        <div
          style={{
            width: `${barFill * 100}%`,
            height: "100%",
            borderRadius: 6,
            background: `linear-gradient(90deg, ${opt.color}cc 0%, ${opt.color} 100%)`,
            boxShadow: `0 0 10px ${opt.color}66`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shine */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
              borderRadius: "6px 6px 0 0",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────

export const PollResults: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title / question fade + slide in
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 20], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Overall bg glow opacity
  const bgGlow = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Radial background glow */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "20%",
          width: 700,
          height: 500,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.05) 45%, transparent 70%)",
          opacity: bgGlow,
          pointerEvents: "none",
        }}
      />

      {/* Secondary glow top-right */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          opacity: bgGlow,
          pointerEvents: "none",
        }}
      />

      {/* ── Poll question header ── */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 72,
          right: 72,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Community Poll
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          {POLL_QUESTION}
        </div>
      </div>

      {/* ── Main content row ── */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 72,
          right: 72,
          bottom: 60,
          display: "flex",
          alignItems: "center",
          gap: 64,
        }}
      >
        {/* Left: Donut chart */}
        <Donut frame={frame} fps={fps} />

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            alignSelf: "stretch",
            backgroundColor: "rgba(255,255,255,0.08)",
            flexShrink: 0,
            opacity: bgGlow,
          }}
        />

        {/* Right: Option list */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {OPTIONS.map((opt, i) => (
            <OptionRow
              key={opt.label}
              opt={opt}
              frame={frame}
              fps={fps}
              delay={OPTIONS_START + i * OPTION_STAGGER}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          right: 72,
          fontSize: 11,
          fontWeight: 400,
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.8px",
          opacity: bgGlow,
          textTransform: "uppercase",
        }}
      >
        Fictional data · Stealthis
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="PollResults"
    component={PollResults}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
