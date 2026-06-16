import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const NUM_BARS = 60;
const DURATION_FRAMES = 150; // 5 s @ 30 fps

/** Per-bar configuration: unique freq, phase, amplitude — simulates real FFT data. */
interface BarConfig {
  freq: number;
  phase: number;
  amplitude: number;   // 0–1 max fraction of bar zone height
  baseLevel: number;   // minimum height fraction (floor)
}

/** Seed a pseudo-random number [0,1) from a bar index */
function seededRandom(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const BAR_CONFIGS: BarConfig[] = Array.from({ length: NUM_BARS }, (_, i) => {
  const r0 = seededRandom(i);
  const r1 = seededRandom(i + 100);
  const r2 = seededRandom(i + 200);
  const r3 = seededRandom(i + 300);

  // Low-frequency bars (left side) move slower; high-frequency bars (right) move faster
  const normalizedIndex = i / (NUM_BARS - 1); // 0 → 1
  const baseFreq = interpolate(normalizedIndex, [0, 1], [0.04, 0.18]);

  return {
    freq: baseFreq + r0 * 0.06,           // randomized per-bar
    phase: r1 * Math.PI * 2,              // random start phase
    amplitude: 0.45 + r2 * 0.45,          // 0.45–0.90
    baseLevel: 0.04 + r3 * 0.08,          // 0.04–0.12 floor
  };
});

/** Hue-shift color for each bar: purple → cyan → pink */
function barColor(index: number, alpha = 1): string {
  const t = index / (NUM_BARS - 1); // 0 → 1
  if (t < 0.5) {
    // purple (#a855f7) → cyan (#06b6d4)
    const u = t / 0.5;
    const r = Math.round(interpolate(u, [0, 1], [168, 6]));
    const g = Math.round(interpolate(u, [0, 1], [85, 182]));
    const b = Math.round(interpolate(u, [0, 1], [247, 212]));
    return `rgba(${r},${g},${b},${alpha})`;
  } else {
    // cyan (#06b6d4) → pink (#ec4899)
    const u = (t - 0.5) / 0.5;
    const r = Math.round(interpolate(u, [0, 1], [6, 236]));
    const g = Math.round(interpolate(u, [0, 1], [182, 72]));
    const b = Math.round(interpolate(u, [0, 1], [212, 153]));
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

// ─── PEAK HOLD STATE ─────────────────────────────────────────────────────────
// We compute peak hold per bar by looking back N frames (pure function — no React state)
const PEAK_HOLD_FRAMES = 30; // how long a peak lingers before starting to fall
const PEAK_FALL_RATE = 0.012; // fraction per frame

/** Compute bar height fraction at a given frame (layered sines). */
function getBarHeight(cfg: BarConfig, frame: number): number {
  // Layer three sine waves for organic FFT feel
  const wave1 = Math.sin(frame * cfg.freq + cfg.phase);
  const wave2 = Math.sin(frame * cfg.freq * 1.7 + cfg.phase * 1.3) * 0.35;
  const wave3 = Math.sin(frame * cfg.freq * 0.4 + cfg.phase * 2.1) * 0.2;
  const combined = Math.abs(wave1 + wave2 + wave3) / 1.55; // normalize to ~0–1
  return cfg.baseLevel + combined * cfg.amplitude * (1 - cfg.baseLevel);
}

/** Compute the peak marker position at a given frame. */
function getPeakHeight(cfg: BarConfig, frame: number): number {
  // Find max over the past PEAK_HOLD_FRAMES frames
  let peak = 0;
  let peakFrame = 0;
  for (let f = Math.max(0, frame - PEAK_HOLD_FRAMES); f <= frame; f++) {
    const h = getBarHeight(cfg, f);
    if (h > peak) {
      peak = h;
      peakFrame = f;
    }
  }

  // After peakFrame + PEAK_HOLD_FRAMES, the peak falls with gravity
  const age = frame - peakFrame - PEAK_HOLD_FRAMES;
  if (age <= 0) return peak;
  return Math.max(cfg.baseLevel, peak - age * PEAK_FALL_RATE);
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

interface SingleBarProps {
  index: number;
  barWidth: number;
  gap: number;
  zoneTop: number;
  zoneHeight: number;
  frame: number;
  globalEnvelope: number; // 0–1 intro scale
}

const SingleBar: React.FC<SingleBarProps> = ({
  index,
  barWidth,
  gap,
  zoneTop,
  zoneHeight,
  frame,
  globalEnvelope,
}) => {
  const cfg = BAR_CONFIGS[index];
  const rawHeight = getBarHeight(cfg, frame);
  const heightFraction = rawHeight * globalEnvelope;
  const peakFraction = getPeakHeight(cfg, frame) * globalEnvelope;

  const barPx = heightFraction * zoneHeight;
  const peakPx = peakFraction * zoneHeight;

  const x = index * (barWidth + gap);
  const barTop = zoneTop + zoneHeight - barPx;

  const color = barColor(index);
  const colorGlow = barColor(index, 0.5);

  // Gradient for each bar: brighter at top, dimmer at base
  const gradId = `bg${index}`;

  return (
    <g key={index}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
        {/* Glow filter per bar — reused */}
        <filter id={`gf${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main bar */}
      <rect
        x={x}
        y={barTop}
        width={barWidth}
        height={barPx}
        fill={`url(#${gradId})`}
        rx={2}
        filter={`url(#gf${index})`}
      />

      {/* Reflection bar (flipped below the baseline) */}
      <rect
        x={x}
        y={zoneTop + zoneHeight}
        width={barWidth}
        height={barPx * 0.5}
        fill={`url(#${gradId})`}
        opacity={0.3}
        rx={2}
        transform={`scale(1,-1) translate(0,${-2 * (zoneTop + zoneHeight)})`}
      />

      {/* Peak hold marker */}
      {peakPx > 4 && (
        <rect
          x={x}
          y={zoneTop + zoneHeight - peakPx - 1}
          width={barWidth}
          height={2}
          fill={color}
          opacity={0.9}
          style={{ filter: `drop-shadow(0 0 4px ${colorGlow})` }}
        />
      )}
    </g>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────

export const SpectrumBars: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Intro envelope: bars rise in from 0 over 20 frames
  const globalEnvelope = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Title fade-in
  const titleOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [5, 30], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });

  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Layout
  const padH = 80;  // horizontal padding
  const padTop = 140; // space for title
  const padBottom = 100; // space for reflection + glow line
  const totalWidth = width - padH * 2;
  const gap = 4;
  const barWidth = (totalWidth - gap * (NUM_BARS - 1)) / NUM_BARS;
  const zoneTop = padTop;
  const zoneHeight = height - padTop - padBottom;

  // Horizontal glow line color — animated pulse
  const glowPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.4, 0.85]
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)`,
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Background grid lines (subtle) ── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.07 }}
      >
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padH}
            y1={zoneTop + zoneHeight * (1 - frac)}
            x2={width - padH}
            y2={zoneTop + zoneHeight * (1 - frac)}
            stroke="#a855f7"
            strokeWidth={1}
            strokeDasharray="6 6"
          />
        ))}
      </svg>

      {/* ── Bars + reflections (SVG) ── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Horizontal glow line at bar baseline */}
        <defs>
          <linearGradient id="baselineGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a0a0f" stopOpacity="0" />
            <stop offset="20%" stopColor="#a855f7" stopOpacity={glowPulse} />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity={glowPulse} />
            <stop offset="80%" stopColor="#ec4899" stopOpacity={glowPulse} />
            <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0" />
          </linearGradient>
          <filter id="baseBlur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Baseline glow line */}
        <rect
          x={padH}
          y={zoneTop + zoneHeight - 1}
          width={totalWidth}
          height={3}
          fill="url(#baselineGlow)"
          filter="url(#baseBlur)"
        />
        <rect
          x={padH}
          y={zoneTop + zoneHeight - 1}
          width={totalWidth}
          height={1}
          fill="url(#baselineGlow)"
          opacity={0.9}
        />

        {/* Reflection fade mask (gradient rect overlaid on bottom half) */}
        <defs>
          <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0a0f" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0a0f" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* All bars */}
        <g transform={`translate(${padH}, 0)`}>
          {Array.from({ length: NUM_BARS }, (_, i) => (
            <SingleBar
              key={i}
              index={i}
              barWidth={barWidth}
              gap={gap}
              zoneTop={zoneTop}
              zoneHeight={zoneHeight}
              frame={frame}
              globalEnvelope={globalEnvelope}
            />
          ))}
        </g>

        {/* Reflection fade overlay */}
        <rect
          x={padH}
          y={zoneTop + zoneHeight}
          width={totalWidth}
          height={padBottom}
          fill="url(#reflFade)"
        />
      </svg>

      {/* ── Title overlay (HTML for better text rendering) ── */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: padH,
          right: padH,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "transparent",
            backgroundImage: "linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #ec4899 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            textShadow: "none",
            filter: "drop-shadow(0 0 24px rgba(168,85,247,0.55))",
          }}
        >
          SPECTRUM
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: "0.3em",
            color: "#94a3b8",
            textTransform: "uppercase",
            opacity: subtitleOpacity,
          }}
        >
          Frequency Analyzer
        </div>
      </div>

      {/* ── Frequency labels (bottom) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: padH,
          right: padH,
          display: "flex",
          justifyContent: "space-between",
          opacity: subtitleOpacity * 0.6,
        }}
      >
        {["20 Hz", "100 Hz", "500 Hz", "1 kHz", "5 kHz", "10 kHz", "20 kHz"].map((label) => (
          <span
            key={label}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#94a3b8",
              letterSpacing: "0.06em",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── COMPOSITION CONFIG ───────────────────────────────────────────────────────

export const compositionConfig = {
  id: "remotion-spectrum-bars",
  component: SpectrumBars,
  durationInFrames: DURATION_FRAMES,
  fps: 30,
  width: 1920,
  height: 1080,
};

// ─── REMOTION ENTRY (for local preview via `npx remotion studio`) ─────────────

export const RemotionRoot: React.FC = () => (
  <Composition
    id={compositionConfig.id}
    component={compositionConfig.component}
    durationInFrames={compositionConfig.durationInFrames}
    fps={compositionConfig.fps}
    width={compositionConfig.width}
    height={compositionConfig.height}
  />
);
