import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Constants ─────────────────────────────────────────────────────────────────
const BPM = 120;
const FPS = 30;
// At 120 BPM, one beat every 0.5s = 15 frames at 30fps
const FRAMES_PER_BEAT = 15;
const TOTAL_BEATS = 12; // 12 beats over 180 frames (6 seconds)

// Beat frames: 0, 15, 30, 45, ... 165
const BEAT_FRAMES: number[] = Array.from(
  { length: TOTAL_BEATS },
  (_, i) => i * FRAMES_PER_BEAT
);

// Color cycle per bar (4 bars = 1 measure): purple, cyan, pink, gold
const BAR_ACCENT_COLORS = [
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f59e0b", // gold
];

const C = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surface2: "#1e1e2e",
  accent: "#a855f7",
  accent2: "#06b6d4",
  accent3: "#ec4899",
  gold: "#f59e0b",
  green: "#10b981",
  text: "#f1f5f9",
  muted: "#94a3b8",
} as const;

// ── Beat utilities ─────────────────────────────────────────────────────────────
// Returns [0..1] progress since last beat, -1 if no beat has happened yet
function progressSinceBeat(frame: number): number {
  let lastBeat = -1;
  for (const bf of BEAT_FRAMES) {
    if (bf <= frame) lastBeat = bf;
  }
  if (lastBeat === -1) return -1;
  return Math.min(1, (frame - lastBeat) / FRAMES_PER_BEAT);
}

// Returns the index of the last beat that fired (used for bar / color tracking)
function lastBeatIndex(frame: number): number {
  let idx = -1;
  for (let i = 0; i < BEAT_FRAMES.length; i++) {
    if (BEAT_FRAMES[i] <= frame) idx = i;
  }
  return idx;
}

// Which 16th-note subdivision is active (0–3) within the current beat,
// driven by frame position within each FRAMES_PER_BEAT window
function active16thNote(frame: number): number {
  return Math.floor((frame % FRAMES_PER_BEAT) / (FRAMES_PER_BEAT / 4));
}

// Get the beat's accent color for the current measure
function beatColor(beatIdx: number): string {
  if (beatIdx < 0) return C.accent;
  return BAR_ACCENT_COLORS[beatIdx % 4];
}

// ── Background flash on beat ───────────────────────────────────────────────────
const BackgroundFlash: React.FC = () => {
  const frame = useCurrentFrame();

  // For each beat frame, check if we're within 3 frames of it
  let flashIntensity = 0;
  for (const bf of BEAT_FRAMES) {
    if (frame >= bf && frame < bf + 3) {
      const t = frame - bf;
      flashIntensity = Math.max(
        flashIntensity,
        interpolate(t, [0, 3], [0.18, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        })
      );
    }
  }

  const beatIdx = lastBeatIndex(frame);
  const color = beatColor(beatIdx);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: color,
        opacity: flashIntensity,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
};

// ── Radial pulse ring on each beat ────────────────────────────────────────────
const BeatRing: React.FC<{ beatFrame: number; beatIdx: number }> = ({
  beatFrame,
  beatIdx,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const elapsed = frame - beatFrame;
  if (elapsed < 0 || elapsed > FRAMES_PER_BEAT) return null;

  const color = beatColor(beatIdx);

  // Scale: 0.2 → 3.0 over FRAMES_PER_BEAT frames
  const scale = interpolate(elapsed, [0, FRAMES_PER_BEAT], [0.2, 3.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Opacity: 1 → 0 over FRAMES_PER_BEAT frames
  const opacity = interpolate(elapsed, [0, FRAMES_PER_BEAT], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const ringSize = Math.min(width, height) * 0.18;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: ringSize,
        height: ringSize,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        boxShadow: `0 0 24px ${color}, 0 0 48px ${color}66, inset 0 0 16px ${color}33`,
        pointerEvents: "none",
      }}
    />
  );
};

// Render all beat rings (each beat gets its own expanding ring)
const BeatRings: React.FC = () => (
  <>
    {BEAT_FRAMES.map((bf, i) => (
      <BeatRing key={i} beatFrame={bf} beatIdx={i} />
    ))}
  </>
);

// ── Rotating geometric shapes (between beats) ──────────────────────────────────
interface ShapeConfig {
  size: number;
  x: number; // % from left
  y: number; // % from top
  rotationSpeed: number; // degrees per frame
  rotationOffset: number;
  scaleFreq: number;
  scaleAmp: number;
  opacity: number;
  color: string;
  borderWidth: number;
}

const SHAPES: ShapeConfig[] = [
  {
    size: 160,
    x: 18,
    y: 22,
    rotationSpeed: 0.4,
    rotationOffset: 0,
    scaleFreq: 0.055,
    scaleAmp: 0.08,
    opacity: 0.22,
    color: C.accent,
    borderWidth: 1.5,
  },
  {
    size: 100,
    x: 80,
    y: 18,
    rotationSpeed: -0.6,
    rotationOffset: 45,
    scaleFreq: 0.07,
    scaleAmp: 0.12,
    opacity: 0.18,
    color: C.accent2,
    borderWidth: 1,
  },
  {
    size: 220,
    x: 82,
    y: 72,
    rotationSpeed: 0.25,
    rotationOffset: 30,
    scaleFreq: 0.04,
    scaleAmp: 0.06,
    opacity: 0.14,
    color: C.accent3,
    borderWidth: 2,
  },
  {
    size: 70,
    x: 14,
    y: 70,
    rotationSpeed: -0.9,
    rotationOffset: 15,
    scaleFreq: 0.09,
    scaleAmp: 0.15,
    opacity: 0.2,
    color: C.gold,
    borderWidth: 1,
  },
  {
    size: 130,
    x: 50,
    y: 85,
    rotationSpeed: 0.35,
    rotationOffset: 60,
    scaleFreq: 0.06,
    scaleAmp: 0.1,
    opacity: 0.12,
    color: C.accent,
    borderWidth: 1.5,
  },
  {
    size: 85,
    x: 50,
    y: 10,
    rotationSpeed: -0.5,
    rotationOffset: 22,
    scaleFreq: 0.08,
    scaleAmp: 0.11,
    opacity: 0.16,
    color: C.accent2,
    borderWidth: 1,
  },
];

const RotatingShape: React.FC<{ config: ShapeConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const rotation = frame * config.rotationSpeed + config.rotationOffset;
  const scaleBreath = 1 + Math.sin(frame * config.scaleFreq) * config.scaleAmp;

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: (config.x / 100) * width - config.size / 2,
        top: (config.y / 100) * height - config.size / 2,
        width: config.size,
        height: config.size,
        transform: `rotate(${rotation}deg) scale(${scaleBreath})`,
        opacity: config.opacity * fadeIn,
        border: `${config.borderWidth}px solid ${config.color}`,
        borderRadius: 4,
        boxShadow: `0 0 12px ${config.color}55`,
        pointerEvents: "none",
      }}
    />
  );
};

const GeometricShapes: React.FC = () => (
  <>
    {SHAPES.map((s, i) => (
      <RotatingShape key={i} config={s} />
    ))}
  </>
);

// ── Accent triangles / lines ───────────────────────────────────────────────────
const AccentLines: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 8 diagonal lines radiating outward from center at different angles
  const lines = [
    { angle: 30, length: 120, x: width * 0.5, y: height * 0.5, color: C.accent, dist: 180 },
    { angle: 75, length: 80, x: width * 0.5, y: height * 0.5, color: C.accent2, dist: 210 },
    { angle: 120, length: 100, x: width * 0.5, y: height * 0.5, color: C.accent3, dist: 190 },
    { angle: 165, length: 90, x: width * 0.5, y: height * 0.5, color: C.accent, dist: 200 },
    { angle: 210, length: 110, x: width * 0.5, y: height * 0.5, color: C.gold, dist: 175 },
    { angle: 255, length: 75, x: width * 0.5, y: height * 0.5, color: C.accent2, dist: 215 },
    { angle: 300, length: 95, x: width * 0.5, y: height * 0.5, color: C.accent3, dist: 185 },
    { angle: 345, length: 115, x: width * 0.5, y: height * 0.5, color: C.accent, dist: 195 },
  ];

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}
      width={width}
      height={height}
    >
      {lines.map((line, i) => {
        const spinOffset = frame * (0.3 + i * 0.05);
        const totalAngle = ((line.angle + spinOffset) * Math.PI) / 180;
        const startX = line.x + Math.cos(totalAngle) * line.dist;
        const startY = line.y + Math.sin(totalAngle) * line.dist;
        const endX = startX + Math.cos(totalAngle) * line.length;
        const endY = startY + Math.sin(totalAngle) * line.length;
        const breathOpacity = 0.35 + Math.sin(frame * 0.08 + i * 0.7) * 0.2;

        return (
          <line
            key={i}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={line.color}
            strokeWidth={1.5}
            strokeOpacity={breathOpacity}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

// ── Center pulsing circle ──────────────────────────────────────────────────────
const CenterCircle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const beatIdx = lastBeatIndex(frame);
  const color = beatColor(beatIdx);

  // Find the most recent beat and compute spring kick
  let kickScale = 1.0;
  for (const bf of BEAT_FRAMES) {
    if (frame >= bf && frame < bf + FRAMES_PER_BEAT) {
      const beatSpring = spring({
        frame: frame - bf,
        fps,
        config: { damping: 8, stiffness: 280, mass: 0.7 },
        durationInFrames: FRAMES_PER_BEAT,
      });
      // Spring goes 0→1, map to scale 1.0→1.35→1.0
      kickScale = 1.0 + beatSpring * 0.35 * (1 - (frame - bf) / FRAMES_PER_BEAT);
      break;
    }
  }

  // Slow ambient breathing between beats
  const ambientScale = 1 + Math.sin(frame * 0.04) * 0.03;
  const finalScale = kickScale * ambientScale;

  const CIRCLE_SIZE = 140;

  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 1 },
    durationInFrames: 30,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        transform: `translate(-50%, -50%) scale(${finalScale * entranceSpring})`,
        borderRadius: "50%",
        background: `radial-gradient(circle at 38% 38%, ${color}cc, #6d28d9 40%, #1e1e2e 100%)`,
        boxShadow: `0 0 40px ${color}99, 0 0 80px ${color}44, inset 0 0 30px rgba(0,0,0,0.5)`,
        border: `2px solid ${color}88`,
      }}
    />
  );
};

// ── Beat indicator dots (bottom bar) ──────────────────────────────────────────
const BeatDots: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const beatIdx = lastBeatIndex(frame);
  const active16th = active16thNote(frame);

  // 4 dots represent 16th notes within a bar (beat 1–4 of a measure)
  const DOT_COUNT = 4;
  const DOT_SIZE = 16;
  const DOT_GAP = 24;
  const totalWidth = DOT_COUNT * DOT_SIZE + (DOT_COUNT - 1) * DOT_GAP;

  const containerOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: (width - totalWidth) / 2,
        display: "flex",
        gap: DOT_GAP,
        opacity: containerOpacity,
      }}
    >
      {Array.from({ length: DOT_COUNT }, (_, i) => {
        const isActive = i === active16th;
        // Measure-level beat: which of the 4 quarter-notes are we on?
        const measureBeat = beatIdx >= 0 ? beatIdx % 4 : -1;
        const isOnBeat = isActive && i === active16th;

        const dotOpacity = isOnBeat
          ? interpolate(
              (frame % FRAMES_PER_BEAT),
              [0, 3, FRAMES_PER_BEAT],
              [1, 0.7, 0.25],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          : 0.2;

        const accentColor = BAR_ACCENT_COLORS[measureBeat >= 0 ? measureBeat : i];

        return (
          <div
            key={i}
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: "50%",
              background: isOnBeat ? accentColor : "rgba(255,255,255,0.15)",
              opacity: dotOpacity,
              boxShadow: isOnBeat
                ? `0 0 12px ${accentColor}, 0 0 24px ${accentColor}88`
                : "none",
              transition: "background 0.05s",
            }}
          />
        );
      })}
    </div>
  );
};

// ── BPM label ──────────────────────────────────────────────────────────────────
const BpmLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.8 },
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        right: 90,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "baseline",
        gap: 4,
        background: "rgba(168,85,247,0.1)",
        border: "1px solid rgba(168,85,247,0.25)",
        borderRadius: 8,
        padding: "6px 16px",
        backdropFilter: "blur(4px)",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: C.accent,
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        {BPM}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          color: C.muted,
          letterSpacing: 1,
          textTransform: "uppercase" as const,
        }}
      >
        BPM
      </span>
    </div>
  );
};

// ── Title text ─────────────────────────────────────────────────────────────────
const TitleText: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [5, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const y = interpolate(frame, [5, 18], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 90,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: C.text,
          letterSpacing: -0.5,
          lineHeight: 1.2,
        }}
      >
        Beat Sync
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: C.muted,
          letterSpacing: 1.5,
          textTransform: "uppercase" as const,
          marginTop: 2,
        }}
      >
        Abstract Animation
      </div>
    </div>
  );
};

// ── Ambient radial glow ────────────────────────────────────────────────────────
const AmbientGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const beatIdx = lastBeatIndex(frame);
  const color = beatColor(beatIdx);

  const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.12, 0.28]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${color}${Math.round(pulse * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Corner brackets ────────────────────────────────────────────────────────────
const CornerBracket: React.FC<{
  x: "left" | "right";
  y: "top" | "bottom";
}> = ({ x, y }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [20, 35], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const beatIdx = lastBeatIndex(frame);
  const color = beatColor(beatIdx);

  return (
    <div
      style={{
        position: "absolute",
        [x]: 56,
        [y]: 56,
        width: 60,
        height: 60,
        borderTop: y === "top" ? `1px solid ${color}88` : "none",
        borderBottom: y === "bottom" ? `1px solid ${color}88` : "none",
        borderLeft: x === "left" ? `1px solid ${color}88` : "none",
        borderRight: x === "right" ? `1px solid ${color}88` : "none",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Secondary orbit rings (subtle, always present) ─────────────────────────────
const OrbitRings: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rings = [
    { size: 260, speed: 0.15, offset: 0, color: C.accent },
    { size: 360, speed: -0.08, offset: 30, color: C.accent2 },
    { size: 460, speed: 0.05, offset: 60, color: C.accent3 },
  ];

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: opacity * 0.3,
      }}
      width={width}
      height={height}
    >
      {rings.map((ring, i) => {
        const dashOffset = -(frame * ring.speed + ring.offset);
        return (
          <circle
            key={i}
            cx={width / 2}
            cy={height / 2}
            r={ring.size / 2}
            fill="none"
            stroke={ring.color}
            strokeWidth={1}
            strokeDasharray="8 16"
            strokeDashoffset={dashOffset}
          />
        );
      })}
    </svg>
  );
};

// ── Particle sparks on beat ────────────────────────────────────────────────────
const BeatSpark: React.FC<{
  beatFrame: number;
  beatIdx: number;
  sparkIdx: number;
}> = ({ beatFrame, beatIdx, sparkIdx }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const elapsed = frame - beatFrame;
  if (elapsed < 0 || elapsed > FRAMES_PER_BEAT + 5) return null;

  const color = beatColor(beatIdx);
  const angle = (sparkIdx / 8) * Math.PI * 2 + beatIdx * 0.3;
  const distance = interpolate(elapsed, [0, FRAMES_PER_BEAT + 5], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const sparkOpacity = interpolate(
    elapsed,
    [0, 4, FRAMES_PER_BEAT + 5],
    [0, 0.9, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const cx = width / 2 + Math.cos(angle) * distance;
  const cy = height / 2 + Math.sin(angle) * distance;
  const SPARK_SIZE = 5;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - SPARK_SIZE / 2,
        top: cy - SPARK_SIZE / 2,
        width: SPARK_SIZE,
        height: SPARK_SIZE,
        borderRadius: "50%",
        background: color,
        opacity: sparkOpacity,
        boxShadow: `0 0 8px ${color}, 0 0 16px ${color}88`,
        pointerEvents: "none",
      }}
    />
  );
};

const BeatSparks: React.FC = () => (
  <>
    {BEAT_FRAMES.map((bf, beatIdx) =>
      Array.from({ length: 8 }, (_, sparkIdx) => (
        <BeatSpark
          key={`${beatIdx}-${sparkIdx}`}
          beatFrame={bf}
          beatIdx={beatIdx}
          sparkIdx={sparkIdx}
        />
      ))
    )}
  </>
);

// ── Main composition ───────────────────────────────────────────────────────────
export const BeatSyncAnimation: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      {/* Ambient color glow (shifts color per bar) */}
      <AmbientGlow />

      {/* Background flash on each beat */}
      <BackgroundFlash />

      {/* Orbit rings */}
      <OrbitRings />

      {/* Rotating geometric shapes */}
      <GeometricShapes />

      {/* Accent diagonal lines */}
      <AccentLines />

      {/* Beat ripple rings */}
      <BeatRings />

      {/* Beat particle sparks */}
      <BeatSparks />

      {/* Center pulsing circle (kicks on beat) */}
      <CenterCircle />

      {/* Corner brackets */}
      <CornerBracket x="left" y="top" />
      <CornerBracket x="right" y="top" />
      <CornerBracket x="left" y="bottom" />
      <CornerBracket x="right" y="bottom" />

      {/* HUD elements */}
      <TitleText />
      <BpmLabel />

      {/* Bottom gradient strip */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, #a855f7, #06b6d4, #ec4899, #f59e0b)`,
          opacity: 0.75,
        }}
      />

      {/* Beat dot indicators */}
      <BeatDots />

      {/* Beat counter label */}
      <div
        style={{
          position: "absolute",
          bottom: 118,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 11,
          color: C.muted,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
          opacity: interpolate(frame, [5, 20], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        16th notes
      </div>
    </AbsoluteFill>
  );
};

// ── Composition config (required export) ──────────────────────────────────────
export const compositionConfig = {
  id: "remotion-beat-sync",
  component: BeatSyncAnimation,
  durationInFrames: 180,
  fps: 30,
  width: 1920,
  height: 1080,
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-beat-sync"
    component={BeatSyncAnimation}
    durationInFrames={180}
    fps={30}
    width={1920}
    height={1080}
  />
);
