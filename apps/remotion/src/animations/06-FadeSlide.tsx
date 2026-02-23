/**
 * TECHNIQUE: interpolate() + Easing Curves
 *
 * This animation demonstrates all the main easing options side by side.
 * Easing controls the "feel" of movement — same duration, very different personality.
 *
 * How interpolate() + easing works:
 *   interpolate(frame, [inputStart, inputEnd], [outputStart, outputEnd], { easing })
 *   - input range: frame numbers on the timeline
 *   - output range: the values you want (opacity, px, degrees, etc.)
 *   - easing: an optional curve function
 *
 * Easing building blocks:
 *   Curve shapes:  Easing.linear | .quad | .sin | .exp | .circle
 *   Directions:    Easing.in() | Easing.out() | Easing.inOut()
 *   → Combine them: Easing.inOut(Easing.exp)
 *
 * Also shown: in/out animation pattern using TWO springs that subtract
 *   → item springs in, then springs out at the end
 *
 * To recreate this pattern:
 *   1. Define ENTER_FRAMES and EXIT_FRAMES
 *   2. const inVal  = spring({ frame, fps })
 *   3. const outVal = spring({ frame: frame - exitStart, fps })
 *   4. const combined = inVal - outVal  → 0→1→0
 */

import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DURATION_SEC = 2; // How long each element's enter animation lasts
const STAGGER = 12; // Frames between each row starting

const ROWS = [
  { label: "linear", easing: Easing.linear, color: "#94a3b8" },
  { label: "out(quad)", easing: Easing.out(Easing.quad), color: "#818cf8" },
  { label: "in(quad)", easing: Easing.in(Easing.quad), color: "#34d399" },
  { label: "inOut(quad)", easing: Easing.inOut(Easing.quad), color: "#f472b6" },
  { label: "inOut(exp)", easing: Easing.inOut(Easing.exp), color: "#fb923c" },
  { label: "bezier(custom)", easing: Easing.bezier(0.4, 0, 0.2, 1), color: "#e879f9" },
] as const;

// --- Single row: a colored bar that slides in using a particular easing ---
const EasingRow: React.FC<{
  frame: number;
  fps: number;
  index: number;
  label: string;
  easing: (t: number) => number;
  color: string;
  maxWidth: number;
}> = ({ frame, fps, index, label, easing, color, maxWidth }) => {
  const delay = index * STAGGER;

  // interpolate maps frame → 0..1 with the given easing curve applied
  const progress = interpolate(frame - delay, [0, DURATION_SEC * fps], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barWidth = progress * maxWidth;

  // Also fade the label in
  const labelOpacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        height: 52,
      }}
    >
      {/* Label */}
      <span
        style={{
          color: "#94a3b8",
          fontSize: 20,
          fontFamily: "monospace",
          width: 200,
          textAlign: "right",
          flexShrink: 0,
          opacity: labelOpacity,
        }}
      >
        {label}
      </span>

      {/* Animated bar */}
      <div
        style={{
          width: barWidth,
          height: 36,
          backgroundColor: color,
          borderRadius: 8,
          transition: "none", // CSS transitions are forbidden — animation is frame-driven
        }}
      />
    </div>
  );
};

// --- Bonus: in-out spring (enters AND exits) ---
const InOutDemo: React.FC<{ frame: number; fps: number; durationInFrames: number }> = ({
  frame,
  fps,
  durationInFrames,
}) => {
  // The exit starts 1 second before the composition ends
  const exitStart = durationInFrames - 1 * fps;

  // inAnimation: 0 → 1 from the start
  const inAnimation = spring({ frame, fps });

  // outAnimation: 0 → 1 starting at exitStart
  // Subtracting outAnimation cancels the inAnimation → value goes back to 0
  const outAnimation = spring({ frame: frame - exitStart, fps });

  // Combined: 0 → 1 → 0
  const scale = inAnimation - outAnimation;
  const opacity = inAnimation - outAnimation;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <span
        style={{
          color: "#94a3b8",
          fontSize: 20,
          fontFamily: "monospace",
          width: 200,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        spring in + out
      </span>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "#facc15",
          transform: `scale(${scale})`,
          opacity,
        }}
      />
    </div>
  );
};

// --- Main composition ---
export const FadeSlideAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  const maxBarWidth = width - 400; // Leave room for labels

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <h1
        style={{
          color: "#f8fafc",
          fontSize: 40,
          fontFamily: "sans-serif",
          margin: 0,
          opacity: titleProgress,
        }}
      >
        Easing Curves Compared
      </h1>

      {/* One row per easing type */}
      {ROWS.map((row, i) => (
        <EasingRow
          key={row.label}
          frame={frame}
          fps={fps}
          index={i}
          label={row.label}
          easing={row.easing}
          color={row.color}
          maxWidth={maxBarWidth}
        />
      ))}

      {/* Spring in+out demo */}
      <InOutDemo frame={frame} fps={fps} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
