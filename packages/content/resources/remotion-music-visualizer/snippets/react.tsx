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

// ── Color palette ──────────────────────────────────────────────────────────────
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

// ── Track metadata ─────────────────────────────────────────────────────────────
const ARTIST_NAME = "Nova Signal";
const TRACK_TITLE = "Luminous Drift";
const ALBUM_NAME = "Chromosphere — Vol. II";

// ── Audio simulation helpers ──────────────────────────────────────────────────
// Stacks 5 sine waves to simulate rich, organic audio energy per angular position
function simulateSpectrum(barIndex: number, totalBars: number, frame: number): number {
  const phase = (barIndex / totalBars) * Math.PI * 2;
  // Beat / low-freq
  const w1 = Math.sin(frame * 0.16 + phase * 1.3) * 0.32;
  // Rhythm / mid
  const w2 = Math.sin(frame * 0.38 + phase * 2.1 + 1.1) * 0.22;
  // Texture / high
  const w3 = Math.sin(frame * 0.85 + phase * 3.7 + 0.6) * 0.14;
  // Breath / very low
  const w4 = Math.sin(frame * 0.06 + phase * 0.9 + 2.4) * 0.19;
  // Micro per-bar variation
  const w5 = Math.sin(frame * 0.52 + barIndex * 2.3 + barIndex * 0.07) * 0.10;

  const raw = 0.22 + w1 + w2 + w3 + w4 + w5;
  return Math.max(0.04, Math.min(1, raw));
}

// Dominant beat wave (0..1) — peaks every ~15 frames
function beatPulse(frame: number): number {
  // Composite beat: fast pulse + slow accent
  const fast = Math.sin(frame * 0.42) * 0.5 + 0.5;
  const slow = Math.sin(frame * 0.21) * 0.5 + 0.5;
  return fast * 0.6 + slow * 0.4;
}

// Flash: sharp spike every 15 frames
function beatFlash(frame: number): number {
  const beatFrame = frame % 15;
  return interpolate(beatFrame, [0, 3, 8], [1, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
}

// ── LAYER 1: Gradient mesh background ─────────────────────────────────────────
const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Slowly rotate hue: purple blob drifts, cyan blob drifts differently
  const hue1 = interpolate(frame, [0, 200], [260, 310], { extrapolateRight: "clamp" });
  const hue2 = interpolate(frame, [0, 200], [185, 215], { extrapolateRight: "clamp" });
  const hue3 = interpolate(frame, [0, 200], [320, 280], { extrapolateRight: "clamp" });

  // Blob position drifts over time
  const blob1X = 30 + Math.sin(frame * 0.018) * 8;
  const blob1Y = 35 + Math.cos(frame * 0.012) * 6;
  const blob2X = 70 + Math.cos(frame * 0.022) * 7;
  const blob2Y = 65 + Math.sin(frame * 0.016) * 8;
  const blob3X = 50 + Math.sin(frame * 0.014 + 1.5) * 10;
  const blob3Y = 50 + Math.cos(frame * 0.009 + 0.8) * 5;

  return (
    <>
      {/* Base dark fill */}
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Blob 1 — purple */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 45% at ${blob1X}% ${blob1Y}%, hsla(${hue1},85%,55%,0.13) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Blob 2 — cyan */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 50% 50% at ${blob2X}% ${blob2Y}%, hsla(${hue2},85%,55%,0.10) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Blob 3 — pink accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 40% 40% at ${blob3X}% ${blob3Y}%, hsla(${hue3},80%,55%,0.08) 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Very subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── LAYER 2: Circular spectrum ─────────────────────────────────────────────────
const BAR_COUNT = 128;
const CIRCLE_RADIUS = 290; // px from center to inner edge of bars
const MIN_BAR_LENGTH = 8;
const MAX_BAR_LENGTH = 110;
const BAR_THICKNESS = 3;

const CircularSpectrum: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  // Entrance: bars spring in from frame 0
  const entranceProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80, mass: 1.2 },
    durationInFrames: 45,
  });

  // Beat flash brightens all bars briefly
  const flash = beatFlash(frame);
  const beat = beatPulse(frame);

  const bars: React.ReactElement[] = [];

  for (let i = 0; i < BAR_COUNT; i++) {
    const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2; // start from top
    const energy = simulateSpectrum(i, BAR_COUNT, frame);
    const barLen = (MIN_BAR_LENGTH + energy * MAX_BAR_LENGTH * (0.8 + beat * 0.2)) * entranceProgress;

    // Inner start point
    const innerR = CIRCLE_RADIUS;
    const outerR = innerR + barLen;

    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;

    // Hue interpolation: top = purple, right = cyan, bottom = pink, left = purple
    const hueDeg = (i / BAR_COUNT) * 360;
    const hue1 = 270 + hueDeg * 0.15; // roughly purple..cyan..pink
    const barAlpha = 0.65 + energy * 0.35 + flash * 0.2;

    // Derive a rich color per bar
    const r = Math.round(
      interpolate(i, [0, BAR_COUNT * 0.33, BAR_COUNT * 0.66, BAR_COUNT], [168, 6, 236, 168])
    );
    const g = Math.round(
      interpolate(i, [0, BAR_COUNT * 0.33, BAR_COUNT * 0.66, BAR_COUNT], [85, 182, 72, 85])
    );
    const b = Math.round(
      interpolate(i, [0, BAR_COUNT * 0.33, BAR_COUNT * 0.66, BAR_COUNT], [247, 212, 153, 247])
    );

    bars.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`rgba(${r},${g},${b},${Math.min(1, barAlpha)})`}
        strokeWidth={BAR_THICKNESS}
        strokeLinecap="round"
        filter="url(#barGlow)"
      />
    );
  }

  const svgOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity: svgOpacity }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {bars}
    </svg>
  );
};

// ── Beat ring (expands on every beat) ─────────────────────────────────────────
const BeatRing: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  // Ring expands over 15 frames each cycle
  const cycleFrame = frame % 15;
  const ringScale = interpolate(cycleFrame, [0, 15], [1, 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const ringOpacity = interpolate(cycleFrame, [0, 2, 15], [0.8, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const r = CIRCLE_RADIUS * ringScale;

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(168,85,247,1)"
        strokeWidth={2}
        opacity={ringOpacity}
        filter="url(#ringGlow)"
      />
      <defs>
        <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

// ── LAYER 3: Central pulsing orb ───────────────────────────────────────────────
const CentralOrb: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  // Entrance spring
  const entranceScale = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100, mass: 1 },
    durationInFrames: 35,
  });

  // Breathing based on dominant beat
  const beat = beatPulse(frame);
  const breathScale = 0.88 + beat * 0.32;
  const flash = beatFlash(frame);

  const orbScale = entranceScale * breathScale;
  const ORB_RADIUS = 100;

  // Rotating ring of dots
  const DOT_COUNT = 16;
  const dotRingR = 130;
  const rotAngle = (frame / 200) * Math.PI * 2 * 1.5; // 1.5 full rotations over clip

  const outerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {/* Core radial gradient */}
        <radialGradient id="orbCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="20%" stopColor="#e9d5ff" stopOpacity={0.85} />
          <stop offset="50%" stopColor="#a855f7" stopOpacity={0.6} />
          <stop offset="80%" stopColor="#7c3aed" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#0a0a0f" stopOpacity={0} />
        </radialGradient>
        {/* Outer halo */}
        <radialGradient id="orbHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2} />
          <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.06} />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>
        <filter id="orbGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer halo */}
      <circle
        cx={cx}
        cy={cy}
        r={ORB_RADIUS * 2.8 * orbScale}
        fill="url(#orbHalo)"
        opacity={outerOpacity}
      />

      {/* Core orb */}
      <circle
        cx={cx}
        cy={cy}
        r={ORB_RADIUS * orbScale}
        fill="url(#orbCore)"
        filter="url(#orbGlow)"
        opacity={outerOpacity}
      />

      {/* Flash overlay on beat */}
      <circle
        cx={cx}
        cy={cy}
        r={ORB_RADIUS * orbScale * 1.4}
        fill="rgba(168,85,247,1)"
        opacity={flash * 0.18}
      />

      {/* Rotating ring of dots */}
      {Array.from({ length: DOT_COUNT }, (_, i) => {
        const angle = (i / DOT_COUNT) * Math.PI * 2 + rotAngle;
        const dx = cx + Math.cos(angle) * dotRingR * entranceScale;
        const dy = cy + Math.sin(angle) * dotRingR * entranceScale;
        const dotAlpha = 0.4 + Math.sin(frame * 0.2 + i * 0.7) * 0.35;
        const dotR = 3 + Math.sin(frame * 0.15 + i * 0.5) * 1.5;
        // Alternate dot colors
        const dotColor = i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#06b6d4" : "#ec4899";
        return (
          <circle
            key={i}
            cx={dx}
            cy={dy}
            r={dotR}
            fill={dotColor}
            opacity={Math.max(0, Math.min(1, dotAlpha)) * outerOpacity}
            filter="url(#orbGlow)"
          />
        );
      })}
    </svg>
  );
};

// ── LAYER 4: Track info overlay ────────────────────────────────────────────────
// Mini spectrum bars under the track title
const MiniSpectrum: React.FC<{ frame: number }> = ({ frame }) => {
  const barCount = 32;
  const barW = 5;
  const gap = 2;
  const maxH = 28;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: gap,
        height: maxH + 4,
      }}
    >
      {Array.from({ length: barCount }, (_, i) => {
        const energy = simulateSpectrum(i, barCount, frame);
        const h = Math.max(3, energy * maxH);
        const norm = i / barCount;
        const r = Math.round(168 + (6 - 168) * norm);
        const g = Math.round(85 + (182 - 85) * norm);
        const b = Math.round(247 + (212 - 247) * norm);
        return (
          <div
            key={i}
            style={{
              width: barW,
              height: h,
              background: `rgb(${r},${g},${b})`,
              borderRadius: 2,
              flexShrink: 0,
              boxShadow: `0 0 6px rgba(${r},${g},${b},0.7)`,
            }}
          />
        );
      })}
    </div>
  );
};

const TrackInfo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Artist name slides in at frame 20
  const artistOpacity = interpolate(frame, [20, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const artistX = interpolate(frame, [20, 36], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Track title slides in at frame 40
  const trackOpacity = interpolate(frame, [40, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const trackX = interpolate(frame, [40, 56], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Album + mini spectrum appear after track title
  const detailOpacity = interpolate(frame, [52, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        left: 100,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 600,
        overflow: "hidden",
      }}
    >
      {/* Artist name */}
      <div
        style={{
          opacity: artistOpacity,
          transform: `translateX(${artistX}px)`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Animated dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            boxShadow: "0 0 10px rgba(168,85,247,0.8)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 18,
            color: C.muted,
            letterSpacing: 2.5,
            textTransform: "uppercase" as const,
          }}
        >
          {ARTIST_NAME}
        </span>
      </div>

      {/* Track title */}
      <div
        style={{
          opacity: trackOpacity,
          transform: `translateX(${trackX}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 54,
            color: C.text,
            letterSpacing: -2,
            lineHeight: 1,
            background: "linear-gradient(135deg, #f1f5f9 0%, #a855f7 60%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {TRACK_TITLE}
        </span>
      </div>

      {/* Album + mini spectrum */}
      <div
        style={{
          opacity: detailOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: C.muted,
            letterSpacing: 0.5,
          }}
        >
          {ALBUM_NAME}
        </span>
        <MiniSpectrum frame={frame} />
      </div>
    </div>
  );
};

// ── LAYER 5: Particle system ───────────────────────────────────────────────────
interface Particle {
  id: number;
  lifetime: number; // frames before respawn
  startFrame: number;
  x0: number; // initial x (% of width)
  speed: number; // upward speed px/frame
  wobbleFreq: number;
  wobbleAmp: number;
  color: string;
  size: number;
}

// Pre-generate 20 stable particles
const PARTICLES: Particle[] = Array.from({ length: 20 }, (_, i) => {
  const lifetime = 60 + Math.floor(Math.sin(i * 1.3) * 20 + Math.cos(i * 2.1) * 15);
  return {
    id: i,
    lifetime: Math.max(40, lifetime),
    startFrame: Math.floor(i * 7), // stagger initial spawn
    x0: 0.08 + (i / 19) * 0.84, // spread across width
    speed: 1.8 + Math.sin(i * 0.8) * 0.8,
    wobbleFreq: 0.04 + Math.sin(i * 1.7) * 0.02,
    wobbleAmp: 12 + Math.cos(i * 2.3) * 8,
    color:
      i % 3 === 0
        ? `rgba(168,85,247,1)`
        : i % 3 === 1
        ? `rgba(6,182,212,1)`
        : `rgba(236,72,153,1)`,
    size: 2.5 + Math.abs(Math.sin(i * 1.1)) * 2.5,
  };
});

const ParticleSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {PARTICLES.map((p) => {
        // Each particle runs on its own timeline, cycling via modulo
        const age = (frame - p.startFrame + p.lifetime * 10) % p.lifetime;
        // Fade in at birth, fade out near end
        const alpha = interpolate(age, [0, 6, p.lifetime - 10, p.lifetime], [0, 1, 0.8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Drift upward
        const progress = age / p.lifetime;
        const py = height * 0.95 - progress * height * 0.85;

        // Lateral sine wobble
        const px = p.x0 * width + Math.sin(age * p.wobbleFreq * Math.PI * 2) * p.wobbleAmp;

        // Scale pulsing
        const pScale = 1 + Math.sin(age * 0.18) * 0.3;
        const r = p.size * pScale;

        if (alpha <= 0 || frame < p.startFrame) return null;

        return (
          <circle
            key={p.id}
            cx={px}
            cy={py}
            r={r}
            fill={p.color}
            opacity={Math.max(0, Math.min(1, alpha))}
            filter="url(#particleGlow)"
          />
        );
      })}
    </svg>
  );
};

// ── Bottom info bar ────────────────────────────────────────────────────────────
const BottomBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  const barOpacity = interpolate(frame, [30, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const elapsedSeconds = Math.min(
    Math.floor(durationInFrames / fps),
    Math.floor(frame / fps)
  );
  const totalSeconds = Math.floor(durationInFrames / fps);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Pulsing dot for "live" indicator
  const dotAlpha = interpolate(Math.sin(frame * 0.22), [-1, 1], [0.4, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        opacity: barOpacity,
        padding: "0 100px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Progress track */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Playing dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.accent3,
            boxShadow: `0 0 10px ${C.accent3}`,
            opacity: dotAlpha,
            flexShrink: 0,
          }}
        />

        {/* Time */}
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: C.muted,
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
            minWidth: 36,
          }}
        >
          {fmt(elapsedSeconds)}
        </span>

        {/* Track */}
        <div
          style={{
            flex: 1,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            position: "relative",
            overflow: "visible",
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
              boxShadow: "0 0 12px rgba(168,85,247,0.7)",
            }}
          />
          {/* Playhead */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${progress * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 10px rgba(168,85,247,0.9), 0 0 4px rgba(255,255,255,0.8)",
            }}
          />
        </div>

        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(148,163,184,0.45)",
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
            minWidth: 36,
          }}
        >
          {fmt(totalSeconds)}
        </span>
      </div>
    </div>
  );
};

// ── Gradient bottom rainbow line ───────────────────────────────────────────────
const RainbowLine: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      background: "linear-gradient(90deg, #a855f7 0%, #06b6d4 40%, #ec4899 70%, #a855f7 100%)",
      opacity: 0.8,
    }}
  />
);

// ── Corner accent brackets ─────────────────────────────────────────────────────
const CornerBracket: React.FC<{
  corner: "tl" | "tr" | "bl" | "br";
  frame: number;
}> = ({ corner, frame }) => {
  const opacity = interpolate(frame, [18, 35], [0, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const size = 70;
  const offset = 56;
  const isTop = corner.startsWith("t");
  const isLeft = corner.endsWith("l");

  return (
    <div
      style={{
        position: "absolute",
        top: isTop ? offset : undefined,
        bottom: isTop ? undefined : offset,
        left: isLeft ? offset : undefined,
        right: isLeft ? undefined : offset,
        width: size,
        height: size,
        borderTop: isTop ? "1.5px solid rgba(168,85,247,0.6)" : "none",
        borderBottom: isTop ? "none" : "1.5px solid rgba(168,85,247,0.6)",
        borderLeft: isLeft ? "1.5px solid rgba(168,85,247,0.6)" : "none",
        borderRight: isLeft ? "none" : "1.5px solid rgba(168,85,247,0.6)",
        opacity,
      }}
    />
  );
};

// ── Main composition ───────────────────────────────────────────────────────────
export const MusicVisualizerScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* LAYER 1 — Gradient mesh background */}
      <GradientBackground />

      {/* LAYER 2 — Circular spectrum */}
      <CircularSpectrum />

      {/* Beat ring (expands on beat pulses) */}
      <BeatRing />

      {/* LAYER 3 — Central pulsing orb */}
      <CentralOrb />

      {/* LAYER 4 — Track info overlay */}
      <TrackInfo />

      {/* LAYER 5 — Particle system */}
      <ParticleSystem />

      {/* Bottom progress bar + time */}
      <BottomBar />

      {/* Corner brackets */}
      <CornerBracket corner="tl" frame={frame} />
      <CornerBracket corner="tr" frame={frame} />
      <CornerBracket corner="bl" frame={frame} />
      <CornerBracket corner="br" frame={frame} />

      {/* Rainbow bottom line */}
      <RainbowLine />
    </AbsoluteFill>
  );
};

// ── Composition config (required export) ──────────────────────────────────────
export const compositionConfig = {
  id: "remotion-music-visualizer",
  component: MusicVisualizerScene,
  durationInFrames: 200,
  fps: 30,
  width: 1920,
  height: 1080,
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-music-visualizer"
    component={MusicVisualizerScene}
    durationInFrames={200}
    fps={30}
    width={1920}
    height={1080}
  />
);
