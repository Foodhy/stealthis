import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Color constants ───────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE = "#12121a";
const ACCENT_PURPLE = "#a855f7";
const ACCENT_CYAN = "#06b6d4";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";
const GRID_LINE = "rgba(255,255,255,0.035)";

// ─── Wave synthesis ────────────────────────────────────────────────────────────
// Summing 5 sine waves at different frequencies and amplitudes to simulate
// a realistic multi-harmonic audio signal.

interface WaveDef {
  freq: number;   // cycles per 150-frame duration
  amp: number;    // 0–1 relative amplitude
  phase: number;  // initial phase offset in radians
  drift: number;  // slow time-drift multiplier (evolves over frames)
}

const WAVE_DEFS: WaveDef[] = [
  { freq: 2.1,  amp: 0.42, phase: 0.0,  drift: 0.018 },
  { freq: 4.7,  amp: 0.28, phase: 1.3,  drift: 0.031 },
  { freq: 8.3,  amp: 0.16, phase: 2.7,  drift: 0.047 },
  { freq: 13.9, amp: 0.09, phase: 0.9,  drift: 0.072 },
  { freq: 22.5, amp: 0.05, phase: 4.1,  drift: 0.110 },
];

/** Evaluate the composite waveform at normalised x ∈ [0,1] and current frame. */
function sampleWave(x: number, frame: number): number {
  let y = 0;
  for (const w of WAVE_DEFS) {
    const t = frame * w.drift;
    y += w.amp * Math.sin(2 * Math.PI * (w.freq * x + t + w.phase));
  }
  // Normalise so total amplitude stays ≈ ±1
  const totalAmp = WAVE_DEFS.reduce((s, w) => s + w.amp, 0);
  return y / totalAmp;
}

// ─── Build SVG polyline points ─────────────────────────────────────────────────

function buildWavePoints(
  frame: number,
  width: number,
  centerY: number,
  amplitude: number,
  segments = 300
): string {
  const pts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const norm = i / segments;
    const y = centerY + sampleWave(norm, frame) * amplitude;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

// ─── Background grid ───────────────────────────────────────────────────────────

const BackgroundGrid: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const cols = 16;
  const rows = 9;
  return (
    <svg
      style={{ position: "absolute", inset: 0 }}
      width={width}
      height={height}
    >
      {/* Vertical lines */}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line
          key={`col-${i}`}
          x1={(i / cols) * width}
          y1={0}
          x2={(i / cols) * width}
          y2={height}
          stroke={GRID_LINE}
          strokeWidth={1}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line
          key={`row-${i}`}
          x1={0}
          y1={(i / rows) * height}
          x2={width}
          y2={(i / rows) * height}
          stroke={GRID_LINE}
          strokeWidth={1}
        />
      ))}
      {/* Strong center horizontal line */}
      <line
        x1={0}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke={"rgba(168,85,247,0.12)"}
        strokeWidth={1.5}
      />
    </svg>
  );
};

// ─── Ambient glow blobs ────────────────────────────────────────────────────────

const AmbientGlow: React.FC<{ frame: number; width: number; height: number }> =
  ({ frame, width, height }) => {
    // Slow pulsing glow intensity
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06);
    const purpleAlpha = (0.10 + pulse * 0.08).toFixed(3);
    const cyanAlpha = (0.07 + (1 - pulse) * 0.06).toFixed(3);
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: [
            `radial-gradient(ellipse 900px 400px at 30% 50%, rgba(168,85,247,${purpleAlpha}) 0%, transparent 70%)`,
            `radial-gradient(ellipse 700px 350px at 72% 50%, rgba(6,182,212,${cyanAlpha}) 0%, transparent 70%)`,
          ].join(", "),
        }}
      />
    );
  };

// ─── SVG Waveform (with glow filter + gradient stroke) ────────────────────────

const WaveformSVG: React.FC<{
  frame: number;
  width: number;
  height: number;
  envelopeOpacity: number;
}> = ({ frame, width, height, envelopeOpacity }) => {
  const centerY = height / 2;
  const amplitude = height * 0.32;

  // Main wave points
  const mainPoints = buildWavePoints(frame, width, centerY, amplitude);
  // Mirrored wave (flipped around center line, slightly smaller amplitude)
  const mirrorPoints = buildWavePoints(frame, width, centerY, amplitude * 0.72, 300)
    .split(" ")
    .map((pt) => {
      const [x, y] = pt.split(",").map(Number);
      // Mirror: y reflected across centerY
      const mirY = 2 * centerY - y;
      return `${x.toFixed(2)},${mirY.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      style={{ position: "absolute", inset: 0 }}
      width={width}
      height={height}
    >
      <defs>
        {/* Gradient for stroke: purple → cyan */}
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={ACCENT_PURPLE} stopOpacity="1" />
          <stop offset="50%" stopColor={ACCENT_CYAN} stopOpacity="1" />
          <stop offset="100%" stopColor={ACCENT_PURPLE} stopOpacity="1" />
        </linearGradient>

        {/* Softer gradient for mirror */}
        <linearGradient id="mirrorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={ACCENT_PURPLE} stopOpacity="0.5" />
          <stop offset="50%" stopColor={ACCENT_CYAN} stopOpacity="0.5" />
          <stop offset="100%" stopColor={ACCENT_PURPLE} stopOpacity="0.5" />
        </linearGradient>

        {/* Glow filter for main wave */}
        <filter id="glowFilter" x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle glow for mirror */}
        <filter id="glowFilterMirror" x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Fade mask — fades edges in/out */}
        <mask id="edgeFade">
          <linearGradient id="fadeMask" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="6%"   stopColor="white" stopOpacity="1" />
            <stop offset="94%"  stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <rect x="0" y="0" width={width} height={height} fill="url(#fadeMask)" />
        </mask>
      </defs>

      {/* Mirror wave (below center) */}
      <polyline
        points={mirrorPoints}
        fill="none"
        stroke="url(#mirrorGradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={envelopeOpacity * 0.55}
        filter="url(#glowFilterMirror)"
        mask="url(#edgeFade)"
      />

      {/* Main wave */}
      <polyline
        points={mainPoints}
        fill="none"
        stroke="url(#waveGradient)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={envelopeOpacity}
        filter="url(#glowFilter)"
        mask="url(#edgeFade)"
      />
    </svg>
  );
};

// ─── Center playhead dot ───────────────────────────────────────────────────────

const PlayheadDot: React.FC<{ frame: number; fps: number; width: number; height: number }> =
  ({ frame, fps, width, height }) => {
    // Spring scale-in on first frames
    const scaleValue = spring({
      frame,
      fps,
      from: 0,
      to: 1,
      config: { damping: 14, stiffness: 160 },
    });

    // Continuous pulsing ring
    const pulseScale = 1 + 0.35 * Math.sin(frame * 0.18);
    const pulseAlpha = 0.3 + 0.25 * Math.sin(frame * 0.18);

    const cx = width / 2;
    const cy = height / 2;
    const dotR = 10;

    return (
      <div
        style={{
          position: "absolute",
          left: cx - 30,
          top: cy - 30,
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scaleValue})`,
        }}
      >
        {/* Outer pulse ring */}
        <div
          style={{
            position: "absolute",
            width: dotR * 2 * pulseScale * 3,
            height: dotR * 2 * pulseScale * 3,
            borderRadius: "50%",
            border: `1.5px solid rgba(168,85,247,${pulseAlpha})`,
            boxShadow: `0 0 12px rgba(168,85,247,${pulseAlpha * 0.6})`,
          }}
        />
        {/* Inner solid dot */}
        <div
          style={{
            width: dotR * 2,
            height: dotR * 2,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #a855f7, #06b6d4)",
            boxShadow:
              "0 0 18px rgba(168,85,247,0.8), 0 0 36px rgba(6,182,212,0.4)",
          }}
        />
      </div>
    );
  };

// ─── Title label ───────────────────────────────────────────────────────────────

const TitleLabel: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [10, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const tx = interpolate(frame, [10, 24], [-16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 72,
        opacity,
        transform: `translateX(${tx}px)`,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: 4,
          height: 48,
          background: "linear-gradient(180deg, #a855f7, #06b6d4)",
          borderRadius: 2,
          position: "absolute",
          left: -18,
          top: 4,
          boxShadow: "0 0 10px rgba(168,85,247,0.7)",
        }}
      />
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 52,
          letterSpacing: 8,
          color: TEXT,
          lineHeight: 1,
          textShadow: "0 0 32px rgba(168,85,247,0.5)",
        }}
      >
        WAVEFORM
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          letterSpacing: 4,
          color: MUTED,
          marginTop: 6,
        }}
      >
        AUDIO VISUALIZER
      </div>
    </div>
  );
};

// ─── Frequency readout (decorative HUD) ───────────────────────────────────────

const FrequencyHUD: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Simulate a scrolling frequency value
  const hz = (440 + 128 * Math.sin(frame * 0.04 + 1.2)).toFixed(1);
  const db = (-12 + 8 * Math.sin(frame * 0.07)).toFixed(1);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        right: 72,
        opacity,
        display: "flex",
        gap: 32,
        alignItems: "flex-end",
      }}
    >
      {/* dB readout */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: ACCENT_CYAN,
            letterSpacing: 2,
            lineHeight: 1,
            textShadow: "0 0 16px rgba(6,182,212,0.6)",
          }}
        >
          {db} <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7 }}>dB</span>
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 10,
            color: MUTED,
            letterSpacing: 2,
            marginTop: 4,
          }}
        >
          PEAK LEVEL
        </div>
      </div>
      {/* Frequency readout */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: ACCENT_PURPLE,
            letterSpacing: 2,
            lineHeight: 1,
            textShadow: "0 0 16px rgba(168,85,247,0.6)",
          }}
        >
          {hz} <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7 }}>Hz</span>
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 10,
            color: MUTED,
            letterSpacing: 2,
            marginTop: 4,
          }}
        >
          FREQUENCY
        </div>
      </div>
    </div>
  );
};

// ─── Mini spectrum bar strip (bottom decorative) ───────────────────────────────

const SpectrumStrip: React.FC<{ frame: number; width: number }> = ({
  frame,
  width,
}) => {
  const opacity = interpolate(frame, [22, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const BAR_COUNT = 64;
  const stripWidth = width - 144;
  const barW = (stripWidth / BAR_COUNT) * 0.65;
  const gap = (stripWidth / BAR_COUNT) * 0.35;
  const maxBarH = 48;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: 72,
        width: stripWidth,
        height: maxBarH,
        opacity,
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        // Each bar: different frequency + phase
        const f1 = 0.06 + (i / BAR_COUNT) * 0.18;
        const f2 = 0.13 + (i / BAR_COUNT) * 0.07;
        const ph = (i * 0.41) % (2 * Math.PI);
        const raw = 0.5 + 0.4 * Math.sin(frame * f1 + ph) + 0.1 * Math.sin(frame * f2);
        const h = Math.max(4, raw * maxBarH);
        const t = i / BAR_COUNT;
        // Color transitions purple→cyan across bar strip
        const r = Math.round(168 + (6 - 168) * t);
        const g = Math.round(85 + (182 - 85) * t);
        const b = Math.round(247 + (212 - 247) * t);
        const color = `rgb(${r},${g},${b})`;

        return (
          <div
            key={i}
            style={{
              width: barW,
              height: h,
              backgroundColor: color,
              borderRadius: 2,
              marginRight: gap,
              opacity: 0.7 + 0.3 * (h / maxBarH),
              boxShadow: `0 0 6px ${color}55`,
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Edge vignette ─────────────────────────────────────────────────────────────

const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.75) 100%)",
      pointerEvents: "none",
    }}
  />
);

// ─── Main composition ──────────────────────────────────────────────────────────

export const WaveformVisualizer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Global fade-in envelope over first 20 frames
  const envelopeOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Faint surface panel behind center strip */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: height * 0.72,
          transform: "translateY(-50%)",
          background: `linear-gradient(180deg, transparent 0%, ${SURFACE}66 30%, ${SURFACE}66 70%, transparent 100%)`,
        }}
      />

      {/* Grid */}
      <BackgroundGrid width={width} height={height} />

      {/* Ambient purple/cyan glow */}
      <AmbientGlow frame={frame} width={width} height={height} />

      {/* Main SVG waveform (main + mirrored) */}
      <WaveformSVG
        frame={frame}
        width={width}
        height={height}
        envelopeOpacity={envelopeOpacity}
      />

      {/* Center playhead pulsing dot */}
      <PlayheadDot frame={frame} fps={fps} width={width} height={height} />

      {/* Vignette overlay */}
      <Vignette />

      {/* Title top-left — fades in at frame 10 */}
      <TitleLabel frame={frame} />

      {/* HUD readouts bottom-right */}
      <FrequencyHUD frame={frame} />

      {/* Spectrum bar strip bottom-left */}
      <SpectrumStrip frame={frame} width={width} />
    </AbsoluteFill>
  );
};

// ─── Composition config (required export) ─────────────────────────────────────

export const compositionConfig = {
  id: "remotion-waveform",
  component: WaveformVisualizer,
  durationInFrames: 150,
  fps: 30,
  width: 1920,
  height: 1080,
};
