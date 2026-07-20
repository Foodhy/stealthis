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

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationInFrames: 240, // 8 seconds
  bg: "#0a0a0f",
  surface: "#12121a",
  accent: "#a855f7",
  accentCyan: "#06b6d4",
  accentPink: "#ec4899",
  text: "#f1f5f9",
  muted: "#94a3b8",
};

// ─── LYRIC DATA ───────────────────────────────────────────────────────────────
// Each lyric segment: startFrame, endFrame, words[]
// Each word can optionally be "highlighted" (first word of phrase = gradient)
interface LyricSegment {
  startFrame: number;
  endFrame: number;
  words: string[];
  highlightIndex: number; // which word index gets the gradient color
}

const LYRICS: LyricSegment[] = [
  {
    startFrame: 0,
    endFrame: 55,
    words: ["Lost", "in", "the", "frequency"],
    highlightIndex: 0,
  },
  {
    startFrame: 58,
    endFrame: 113,
    words: ["Every", "beat", "finds", "me"],
    highlightIndex: 1,
  },
  {
    startFrame: 116,
    endFrame: 171,
    words: ["Resonating", "through", "the", "night"],
    highlightIndex: 0,
  },
  {
    startFrame: 174,
    endFrame: 229,
    words: ["Chasing", "soundwaves", "into", "light"],
    highlightIndex: 1,
  },
  {
    startFrame: 190,
    endFrame: 240,
    words: ["—", "∞", "—"],
    highlightIndex: 1,
  },
];

// Interlude frame range (between lyric segments)
const INTERLUDES = [
  { start: 55, end: 58 },
  { start: 113, end: 116 },
  { start: 171, end: 174 },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// ─── BACKGROUND GRADIENT MESH ────────────────────────────────────────────────
const BackgroundMesh: React.FC = () => {
  const frame = useCurrentFrame();

  // Slowly shift background gradient hues
  const hueShift = interpolate(frame, [0, 240], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const blob1X = 30 + Math.sin(frame * 0.008) * 15;
  const blob1Y = 25 + Math.cos(frame * 0.006) * 12;
  const blob2X = 65 + Math.cos(frame * 0.007) * 18;
  const blob2Y = 60 + Math.sin(frame * 0.009) * 10;
  const blob3X = 50 + Math.sin(frame * 0.005 + 1.5) * 20;
  const blob3Y = 45 + Math.cos(frame * 0.004 + 0.8) * 15;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Base deep background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `#0a0a0f`,
        }}
      />

      {/* Animated color blob 1 — purple/violet */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 700,
          left: `${blob1X}%`,
          top: `${blob1Y}%`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse, rgba(${clamp(
            120 + Math.sin(hueShift * 0.05) * 30,
            80,
            160
          )},60,220,0.18) 0%, transparent 70%)`,
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />

      {/* Animated color blob 2 — deep indigo */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 600,
          left: `${blob2X}%`,
          top: `${blob2Y}%`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse, rgba(100,60,${clamp(
            180 + Math.cos(hueShift * 0.04) * 40,
            140,
            240
          )},0.16) 0%, transparent 70%)`,
          filter: "blur(80px)",
          borderRadius: "50%",
        }}
      />

      {/* Animated color blob 3 — pink accent */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 500,
          left: `${blob3X}%`,
          top: `${blob3Y}%`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse, rgba(236,72,153,0.12) 0%, transparent 65%)`,
          filter: "blur(50px)",
          borderRadius: "50%",
        }}
      />

      {/* Subtle scanline vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
interface ParticleDef {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobbleFreq: number;
  wobbleAmp: number;
  wobblePhase: number;
  opacity: number;
  color: string;
}

const PARTICLES: ParticleDef[] = [
  { x: 0.08, y: 0.9, size: 4, speed: 0.18, wobbleFreq: 0.04, wobbleAmp: 22, wobblePhase: 0.0, opacity: 0.55, color: "#a855f7" },
  { x: 0.15, y: 0.85, size: 3, speed: 0.22, wobbleFreq: 0.03, wobbleAmp: 18, wobblePhase: 1.1, opacity: 0.45, color: "#06b6d4" },
  { x: 0.22, y: 0.95, size: 5, speed: 0.14, wobbleFreq: 0.05, wobbleAmp: 30, wobblePhase: 2.3, opacity: 0.35, color: "#ec4899" },
  { x: 0.35, y: 0.88, size: 3, speed: 0.19, wobbleFreq: 0.04, wobbleAmp: 15, wobblePhase: 0.7, opacity: 0.5, color: "#a855f7" },
  { x: 0.45, y: 0.92, size: 4, speed: 0.16, wobbleFreq: 0.06, wobbleAmp: 25, wobblePhase: 3.1, opacity: 0.4, color: "#06b6d4" },
  { x: 0.55, y: 0.87, size: 6, speed: 0.12, wobbleFreq: 0.03, wobbleAmp: 20, wobblePhase: 1.8, opacity: 0.3, color: "#f59e0b" },
  { x: 0.62, y: 0.93, size: 3, speed: 0.21, wobbleFreq: 0.05, wobbleAmp: 28, wobblePhase: 0.4, opacity: 0.48, color: "#a855f7" },
  { x: 0.72, y: 0.86, size: 5, speed: 0.15, wobbleFreq: 0.04, wobbleAmp: 16, wobblePhase: 2.7, opacity: 0.38, color: "#ec4899" },
  { x: 0.80, y: 0.91, size: 4, speed: 0.17, wobbleFreq: 0.035, wobbleAmp: 22, wobblePhase: 1.4, opacity: 0.44, color: "#06b6d4" },
  { x: 0.88, y: 0.89, size: 3, speed: 0.2, wobbleFreq: 0.045, wobbleAmp: 19, wobblePhase: 3.5, opacity: 0.5, color: "#a855f7" },
  { x: 0.93, y: 0.94, size: 5, speed: 0.13, wobbleFreq: 0.038, wobbleAmp: 24, wobblePhase: 0.9, opacity: 0.36, color: "#ec4899" },
  { x: 0.28, y: 0.96, size: 4, speed: 0.25, wobbleFreq: 0.06, wobbleAmp: 12, wobblePhase: 2.0, opacity: 0.42, color: "#f59e0b" },
  { x: 0.50, y: 0.98, size: 3, speed: 0.3, wobbleFreq: 0.05, wobbleAmp: 35, wobblePhase: 1.6, opacity: 0.3, color: "#06b6d4" },
];

const FloatingParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {PARTICLES.map((p, i) => {
        // Upward drift — wrap around when particle goes above top
        const totalDrift = frame * p.speed * height * 0.001;
        const rawY = p.y * height - totalDrift;
        const wrappedY = ((rawY % height) + height) % height;

        // Lateral sine wobble
        const wobbleX = Math.sin(frame * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
        const baseX = p.x * width + wobbleX;

        // Fade in near top (disappear gracefully)
        const fadeTop = interpolate(
          wrappedY / height,
          [0, 0.08, 0.15, 1],
          [0, 0, p.opacity, p.opacity],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: baseX - p.size / 2,
              top: wrappedY - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: fadeTop,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── WORD COMPONENT ───────────────────────────────────────────────────────────
interface WordProps {
  word: string;
  index: number;
  localFrame: number; // frame relative to segment start
  fps: number;
  highlighted: boolean;
  segmentDuration: number;
  wordCount: number;
}

const Word: React.FC<WordProps> = ({
  word,
  index,
  localFrame,
  fps,
  highlighted,
  segmentDuration,
  wordCount,
}) => {
  const STAGGER = 8;
  const enterFrame = Math.max(0, localFrame - index * STAGGER);

  const y = spring({
    frame: enterFrame,
    fps,
    from: 60,
    to: 0,
    config: { damping: 14, stiffness: 130, mass: 0.8 },
  });

  const scale = spring({
    frame: enterFrame,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 16, stiffness: 120 },
  });

  const enterOpacity = interpolate(enterFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit: fade+slide up as segment ends
  const exitStart = segmentDuration - 18 - (wordCount - 1 - index) * 3;
  const exitOpacity = interpolate(
    localFrame,
    [exitStart, exitStart + 14],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitY = interpolate(
    localFrame,
    [exitStart, exitStart + 14],
    [0, -30],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Highlighted word: gradient text effect via background-clip
  const highlightGradient = "linear-gradient(135deg, #a855f7, #ec4899)";

  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 14px",
        transform: `translateY(${y + exitY}px) scale(${scale})`,
        opacity: enterOpacity * exitOpacity,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 800,
        fontSize: 88,
        letterSpacing: -3,
        color: highlighted ? "transparent" : CONFIG.text,
        background: highlighted ? highlightGradient : "none",
        WebkitBackgroundClip: highlighted ? "text" : "unset",
        WebkitTextFillColor: highlighted ? "transparent" : CONFIG.text,
        textShadow: highlighted
          ? "none"
          : "0 0 40px rgba(241,245,249,0.3), 0 4px 24px rgba(0,0,0,0.6)",
        filter: highlighted ? "drop-shadow(0 0 24px rgba(168,85,247,0.7))" : "none",
      }}
    >
      {word}
    </span>
  );
};

// ─── LYRIC SEGMENT ────────────────────────────────────────────────────────────
const LyricSegment: React.FC<{ segment: LyricSegment }> = ({ segment }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - segment.startFrame;
  const segmentDuration = segment.endFrame - segment.startFrame;

  // Only render if we're within the window
  if (localFrame < 0 || localFrame > segmentDuration + 5) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "0 120px",
      }}
    >
      {segment.words.map((word, i) => (
        <Word
          key={`${segment.startFrame}-${i}`}
          word={word}
          index={i}
          localFrame={localFrame}
          fps={fps}
          highlighted={i === segment.highlightIndex}
          segmentDuration={segmentDuration}
          wordCount={segment.words.length}
        />
      ))}
    </div>
  );
};

// ─── BEAT PULSE RING ──────────────────────────────────────────────────────────
const BeatPulseRing: React.FC<{ active: boolean }> = ({ active }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  if (!active) return null;

  // Simulated beat pulse: series of concentric rings expanding outward
  const NUM_RINGS = 6;
  const beatFreq = 0.35; // beat frequency in cycles/frame
  const beatPhase = frame * beatFreq * Math.PI * 2;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: NUM_RINGS }).map((_, i) => {
        const phase = beatPhase - i * 0.6;
        const radius = 60 + (Math.sin(phase) * 0.5 + 0.5) * 180 + i * 30;
        const opacity = (Math.sin(phase) * 0.5 + 0.5) * 0.45 * (1 - i / NUM_RINGS);
        const color = i % 2 === 0 ? CONFIG.accent : CONFIG.accentCyan;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              border: `2px solid ${color}`,
              opacity,
              boxShadow: `0 0 16px ${color}, inset 0 0 16px ${color}40`,
              transform: `scale(${0.8 + Math.sin(phase + i) * 0.2})`,
            }}
          />
        );
      })}

      {/* Center orb */}
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CONFIG.accent}cc 0%, ${CONFIG.accentPink}88 60%, transparent 100%)`,
          boxShadow: `0 0 60px ${CONFIG.accent}, 0 0 30px ${CONFIG.accentPink}`,
          transform: `scale(${0.9 + Math.sin(beatPhase * 2) * 0.1})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── SPECTRUM BARS (INTERLUDE VISUALIZER) ─────────────────────────────────────
const SpectrumBars: React.FC<{ visible: boolean }> = ({ visible }) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  const NUM_BARS = 32;
  const BAR_W = 18;
  const BAR_GAP = 8;
  const totalW = NUM_BARS * (BAR_W + BAR_GAP) - BAR_GAP;
  const MAX_H = 160;

  const opacity = interpolate(frame % 240, [0, 8, 232, 240], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "flex-end",
        gap: BAR_GAP,
        opacity,
      }}
    >
      {Array.from({ length: NUM_BARS }).map((_, i) => {
        // Layered sine waves for organic spectrum look
        const t = frame * 0.08;
        const barH =
          MAX_H *
          Math.abs(
            Math.sin(t + i * 0.38) * 0.4 +
              Math.sin(t * 1.7 + i * 0.22) * 0.3 +
              Math.sin(t * 2.3 + i * 0.55) * 0.2 +
              Math.cos(t * 0.9 + i * 0.15) * 0.1
          );
        const normalizedI = i / NUM_BARS;
        const hue = 270 + normalizedI * 120; // purple → cyan
        const barColor =
          normalizedI < 0.5
            ? `hsl(${270 + normalizedI * 60}, 80%, 65%)`
            : `hsl(${300 + (normalizedI - 0.5) * 100}, 75%, 60%)`;

        return (
          <div
            key={i}
            style={{
              width: BAR_W,
              height: Math.max(6, barH),
              background: `linear-gradient(to top, ${CONFIG.accent}, ${barColor})`,
              borderRadius: 4,
              boxShadow: `0 0 8px ${barColor}88`,
              transition: "height 0.05s",
            }}
          />
        );
      })}
    </div>
  );
};

// ─── WAVEFORM UNDERLINE ───────────────────────────────────────────────────────
const WaveformUnderline: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const POINTS = 80;
  const W = 600;
  const H = 40;
  const cx = width / 2 - W / 2;
  const cy = 600 + H / 2;

  const pathPoints = Array.from({ length: POINTS + 1 }, (_, i) => {
    const x = cx + (i / POINTS) * W;
    const t = frame * 0.12;
    const y =
      cy +
      Math.sin(t + i * 0.35) * 8 * Math.abs(Math.sin(t * 0.3 + i * 0.1)) +
      Math.sin(t * 1.8 + i * 0.6) * 5;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const d = pathPoints.join(" ");

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={CONFIG.accent} stopOpacity="0" />
          <stop offset="25%" stopColor={CONFIG.accent} stopOpacity="0.9" />
          <stop offset="75%" stopColor={CONFIG.accentCyan} stopOpacity="0.9" />
          <stop offset="100%" stopColor={CONFIG.accentCyan} stopOpacity="0" />
        </linearGradient>
        <filter id="waveGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="url(#waveGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#waveGlow)"
      />
    </svg>
  );
};

// ─── DECORATIVE CORNER LINES ──────────────────────────────────────────────────
const CornerDecor: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineLen = 60;
  const pad = 40;
  const color = CONFIG.accent;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    >
      {/* Top-left */}
      <line x1={pad} y1={pad} x2={pad + lineLen} y2={pad} stroke={color} strokeWidth="1.5" />
      <line x1={pad} y1={pad} x2={pad} y2={pad + lineLen} stroke={color} strokeWidth="1.5" />
      {/* Top-right */}
      <line x1={width - pad} y1={pad} x2={width - pad - lineLen} y2={pad} stroke={color} strokeWidth="1.5" />
      <line x1={width - pad} y1={pad} x2={width - pad} y2={pad + lineLen} stroke={color} strokeWidth="1.5" />
      {/* Bottom-left */}
      <line x1={pad} y1={height - pad} x2={pad + lineLen} y2={height - pad} stroke={color} strokeWidth="1.5" />
      <line x1={pad} y1={height - pad} x2={pad} y2={height - pad - lineLen} stroke={color} strokeWidth="1.5" />
      {/* Bottom-right */}
      <line x1={width - pad} y1={height - pad} x2={width - pad - lineLen} y2={height - pad} stroke={color} strokeWidth="1.5" />
      <line x1={width - pad} y1={height - pad} x2={width - pad} y2={height - pad - lineLen} stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

// ─── TRACK INFO FOOTER ────────────────────────────────────────────────────────
const TrackFooter: React.FC = () => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Simulate progress bar
  const progress = frame / 240;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: "50%",
        transform: `translateX(-50%) translateY(${enterY}px)`,
        opacity: enterOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        minWidth: 480,
      }}
    >
      {/* Track label */}
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: CONFIG.muted,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          frequency loop
        </span>
        <span style={{ color: CONFIG.accent, fontSize: 13 }}>•</span>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: CONFIG.muted,
            letterSpacing: 2,
          }}
        >
          deep pulses vol. 1
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 480,
          height: 3,
          background: "rgba(148,163,184,0.18)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${CONFIG.accent}, ${CONFIG.accentCyan})`,
            borderRadius: 2,
            boxShadow: `0 0 10px ${CONFIG.accent}88`,
          }}
        />
      </div>
    </div>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
export const LyricVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine if we're in an interlude
  const isInterlude = INTERLUDES.some(
    (il) => frame >= il.start && frame < il.end
  );

  // Global fade-in
  const globalOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global fade-out at end
  const globalFadeOut = interpolate(frame, [228, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: globalOpacity * globalFadeOut }}>
      {/* Layer 1: Animated background gradient mesh */}
      <BackgroundMesh />

      {/* Layer 2: Floating particles */}
      <FloatingParticles />

      {/* Layer 3: Corner decoration */}
      <CornerDecor />

      {/* Layer 4: Waveform underline */}
      <WaveformUnderline />

      {/* Layer 5: Lyric segments */}
      {LYRICS.map((segment, i) => (
        <LyricSegment key={i} segment={segment} />
      ))}

      {/* Layer 6: Beat pulse rings (interlude) */}
      <BeatPulseRing active={isInterlude} />

      {/* Layer 7: Spectrum bars (always subtle at bottom) */}
      <SpectrumBars visible={true} />

      {/* Layer 8: Track footer */}
      <TrackFooter />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT + COMPOSITION CONFIG ───────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-lyric-video"
    component={LyricVideo}
    durationInFrames={CONFIG.durationInFrames}
    fps={CONFIG.fps}
    width={CONFIG.width}
    height={CONFIG.height}
  />
);

export const compositionConfig = {
  id: "remotion-lyric-video",
  component: LyricVideo,
  durationInFrames: 240,
  fps: 30,
  width: 1920,
  height: 1080,
};
