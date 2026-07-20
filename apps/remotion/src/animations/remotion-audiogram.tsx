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
const BAR_COUNT = 80;
const SHOW_NAME = "The Signal Podcast";
const EPISODE_TITLE = "EP 24 · The Future of Sound";
const GUEST_NAME = "Maya Chen";
const GUEST_INITIALS = "MC";
const TOTAL_DURATION_S = 6;

const C = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surface2: "#1e1e2e",
  accent: "#a855f7",
  accent2: "#06b6d4",
  accent3: "#ec4899",
  gold: "#f59e0b",
  text: "#f1f5f9",
  muted: "#94a3b8",
} as const;

// ── Audio simulation ──────────────────────────────────────────────────────────
// Stacks multiple sine waves to produce realistic speech-like energy per bar
function simulateBarHeight(
  barIndex: number,
  frame: number,
  totalBars: number
): number {
  const norm = barIndex / totalBars; // 0..1
  // Center emphasis: bars near the middle are naturally taller
  const centerBoost = 1 - Math.abs(norm - 0.5) * 1.6;

  // Wave 1 — slow rhythm (beat)
  const w1 = Math.sin(frame * 0.18 + barIndex * 0.31) * 0.35;
  // Wave 2 — mid frequency (syllables)
  const w2 = Math.sin(frame * 0.42 + barIndex * 0.67 + 1.2) * 0.25;
  // Wave 3 — high frequency (texture)
  const w3 = Math.sin(frame * 0.91 + barIndex * 1.13 + 0.8) * 0.15;
  // Wave 4 — very low (breath)
  const w4 = Math.sin(frame * 0.07 + barIndex * 0.19 + 2.5) * 0.20;
  // Wave 5 — unique per-bar micro-variation
  const w5 = Math.sin(frame * 0.55 + barIndex * 2.37 + barIndex * 0.1) * 0.12;

  const raw = 0.15 + w1 + w2 + w3 + w4 + w5;
  const clamped = Math.max(0.05, Math.min(1, raw));
  return clamped * Math.max(0.1, centerBoost);
}

// ── Radial glow background ─────────────────────────────────────────────────
const RadialGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Slowly breathe the glow opacity
  const glowPulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.18, 0.32]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 70% 55% at 50% 62%, rgba(168,85,247,${glowPulse}) 0%, rgba(6,182,212,0.04) 55%, transparent 80%)`,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Avatar / show logo ─────────────────────────────────────────────────────
const ShowAvatar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
    durationInFrames: 30,
  });

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const AVATAR_SIZE = 100;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer gradient ring */}
      <div
        style={{
          width: AVATAR_SIZE + 8,
          height: AVATAR_SIZE + 8,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #a855f7, #06b6d4, #ec4899)",
          padding: 3,
          boxShadow: "0 0 28px rgba(168,85,247,0.65), 0 0 56px rgba(168,85,247,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner avatar circle */}
        <div
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: "50%",
            background: `linear-gradient(145deg, ${C.surface2}, #2a1f3d)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${C.surface}`,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 32,
              color: C.text,
              letterSpacing: -1,
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {GUEST_INITIALS}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Episode info (title + guest) ───────────────────────────────────────────
const EpisodeInfo: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(frame, [8, 22], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const guestOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const guestY = interpolate(frame, [14, 28], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const showOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textAlign: "center",
      }}
    >
      {/* Show name (small badge) */}
      <div
        style={{
          opacity: showOpacity,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(168,85,247,0.15)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 20,
          padding: "4px 14px",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: C.accent3,
            boxShadow: `0 0 8px ${C.accent3}`,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: C.accent,
            letterSpacing: 1.2,
            textTransform: "uppercase" as const,
          }}
        >
          {SHOW_NAME}
        </span>
      </div>

      {/* Episode title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 38,
            color: C.text,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          {EPISODE_TITLE}
        </span>
      </div>

      {/* Guest name */}
      <div
        style={{
          opacity: guestOpacity,
          transform: `translateY(${guestY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 18,
            color: C.muted,
            letterSpacing: 0.3,
          }}
        >
          with{" "}
          <span style={{ color: C.text, fontWeight: 500 }}>{GUEST_NAME}</span>
        </span>
      </div>
    </div>
  );
};

// ── Waveform bar ───────────────────────────────────────────────────────────
const WaveBar: React.FC<{
  index: number;
  frame: number;
  fps: number;
  totalBars: number;
  barWidth: number;
  gap: number;
  maxBarHeight: number;
}> = ({ index, frame, fps, totalBars, barWidth, gap, maxBarHeight }) => {
  // Staggered entrance — each bar grows in with a spring offset by index
  const entranceDelay = Math.floor(index * 0.22);
  const entranceSpring = spring({
    frame: Math.max(0, frame - entranceDelay),
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.5 },
    durationInFrames: 22,
  });

  const audioHeight = simulateBarHeight(index, frame, totalBars);
  const barHeight = Math.max(4, audioHeight * maxBarHeight * entranceSpring);

  // Gradient: center bars lean purple, edges lean cyan
  const norm = index / totalBars;
  const centerDist = Math.abs(norm - 0.5) * 2; // 0 at center, 1 at edges
  const r1 = Math.round(168 + (6 - 168) * centerDist);
  const g1 = Math.round(85 + (182 - 85) * centerDist);
  const b1 = Math.round(247 + (212 - 247) * centerDist);
  const barColor = `rgb(${r1},${g1},${b1})`;

  const glowOpacity = 0.3 + audioHeight * 0.5;

  return (
    <div
      style={{
        width: barWidth,
        height: barHeight,
        background: `linear-gradient(180deg, ${barColor} 0%, rgba(168,85,247,0.4) 100%)`,
        borderRadius: barWidth / 2,
        flexShrink: 0,
        marginLeft: index === 0 ? 0 : gap / 2,
        marginRight: gap / 2,
        boxShadow: `0 0 ${6 + audioHeight * 12}px rgba(${r1},${g1},${b1},${glowOpacity})`,
        alignSelf: "flex-end",
      }}
    />
  );
};

// ── Waveform container ─────────────────────────────────────────────────────
const Waveform: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { width } = useVideoConfig();
  const waveformWidth = Math.min(width * 0.8, 1200);
  const totalGapSpace = BAR_COUNT * 3;
  const barWidth = Math.floor((waveformWidth - totalGapSpace) / BAR_COUNT);
  const gap = 3;
  const maxBarHeight = 200;

  const containerOpacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: containerOpacity,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        width: waveformWidth,
        height: maxBarHeight + 16,
        padding: "8px 0",
      }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <WaveBar
          key={i}
          index={i}
          frame={frame}
          fps={fps}
          totalBars={BAR_COUNT}
          barWidth={Math.max(4, barWidth)}
          gap={gap}
          maxBarHeight={maxBarHeight}
        />
      ))}
    </div>
  );
};

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number; durationInFrames: number; fps: number }> = ({
  frame,
  durationInFrames,
  fps,
}) => {
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const totalSeconds = Math.floor(durationInFrames / fps);
  const elapsedSeconds = Math.min(totalSeconds, Math.floor((frame / fps)));

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const barOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        opacity: barOpacity,
        width: "100%",
        maxWidth: 860,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Track */}
      <div
        style={{
          width: "100%",
          height: 4,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #a855f7, #06b6d4)",
            borderRadius: 2,
            boxShadow: "0 0 10px rgba(168,85,247,0.7)",
          }}
        />
        {/* Playhead dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${progress * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 0 8px rgba(168,85,247,0.9)",
          }}
        />
      </div>

      {/* Time labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: C.muted,
          fontWeight: 500,
          letterSpacing: 0.5,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>{fmt(elapsedSeconds)}</span>
        <span style={{ color: "rgba(148,163,184,0.5)" }}>{fmt(totalSeconds)}</span>
      </div>
    </div>
  );
};

// ── Decorative corner lines ────────────────────────────────────────────────
const CornerAccent: React.FC<{
  x: "left" | "right";
  y: "top" | "bottom";
  frame: number;
}> = ({ x, y, frame }) => {
  const opacity = interpolate(frame, [25, 40], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        [x]: 60,
        [y]: 60,
        width: 80,
        height: 80,
        borderTop: y === "top" ? "1px solid rgba(168,85,247,0.5)" : "none",
        borderBottom: y === "bottom" ? "1px solid rgba(168,85,247,0.5)" : "none",
        borderLeft: x === "left" ? "1px solid rgba(168,85,247,0.5)" : "none",
        borderRight: x === "right" ? "1px solid rgba(168,85,247,0.5)" : "none",
        opacity,
      }}
    />
  );
};

// ── Live badge ─────────────────────────────────────────────────────────────
const LiveBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
    durationInFrames: 20,
  });

  // Pulsing dot
  const dotOpacity = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0.4, 1]
  );

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        position: "absolute",
        top: 56,
        right: 120,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(236,72,153,0.15)",
        border: "1px solid rgba(236,72,153,0.4)",
        borderRadius: 20,
        padding: "5px 14px",
        boxShadow: "0 0 14px rgba(236,72,153,0.2)",
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: C.accent3,
          boxShadow: `0 0 8px ${C.accent3}`,
          opacity: dotOpacity,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: C.accent3,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
        }}
      >
        Now Playing
      </span>
    </div>
  );
};

// ── Main composition ───────────────────────────────────────────────────────
export const AudiogramWaveformClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

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
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Radial purple glow */}
      <RadialGlow />

      {/* Corner accents */}
      <CornerAccent x="left" y="top" frame={frame} />
      <CornerAccent x="right" y="top" frame={frame} />
      <CornerAccent x="left" y="bottom" frame={frame} />
      <CornerAccent x="right" y="bottom" frame={frame} />

      {/* Live badge */}
      <LiveBadge frame={frame} fps={fps} />

      {/* Main content — centered column */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          paddingTop: 20,
          paddingBottom: 60,
        }}
      >
        {/* Avatar */}
        <ShowAvatar frame={frame} fps={fps} />

        {/* Episode info */}
        <EpisodeInfo frame={frame} />

        {/* Waveform visualization */}
        <Waveform frame={frame} fps={fps} />

        {/* Progress bar */}
        <ProgressBar frame={frame} durationInFrames={durationInFrames} fps={fps} />
      </div>

      {/* Bottom branding strip */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #a855f7, #06b6d4, #ec4899)",
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Composition config (required export) ──────────────────────────────────
export const compositionConfig = {
  id: "remotion-audiogram",
  component: AudiogramWaveformClip,
  durationInFrames: 180,
  fps: 30,
  width: 1920,
  height: 1080,
};

// ── Remotion Root ─────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-audiogram"
    component={AudiogramWaveformClip}
    durationInFrames={180}
    fps={30}
    width={1920}
    height={1080}
  />
);
