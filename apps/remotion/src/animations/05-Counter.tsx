/**
 * TECHNIQUE: Animated Number Counter with Easing
 *
 * How it works:
 * - `interpolate(frame, [startFrame, endFrame], [startValue, endValue])` maps
 *   the timeline frame to any numeric range
 * - Wrap in Math.round() to avoid fractional numbers
 * - Add an `easing` option to control the acceleration curve:
 *     Easing.out(Easing.quad) → starts fast, slows at the end (natural count-up)
 *
 * Easing cheat sheet:
 *   Easing.linear          — constant speed
 *   Easing.out(Easing.quad) — decelerates (good for counting up)
 *   Easing.in(Easing.quad)  — accelerates (good for counting down into 0)
 *   Easing.inOut(Easing.exp) — sigmoid — slow start, fast middle, slow end
 *
 * To recreate this pattern:
 *   1. const raw = interpolate(frame, [0, durationFrames], [0, targetNumber], { easing })
 *   2. Math.round(raw) for whole numbers, or toFixed(1) for decimals
 *   3. Use extrapolateRight: "clamp" so it freezes at the target
 */

import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// --- Stats to animate ---
const STATS = [
  { label: "Users", from: 0, to: 12_500, suffix: "", color: "#818cf8" },
  { label: "Revenue", from: 0, to: 98_432, prefix: "$", color: "#34d399" },
  { label: "Uptime", from: 95, to: 99.9, suffix: "%", color: "#fb923c", decimals: 1 },
  { label: "NPS", from: 0, to: 72, suffix: "", color: "#f472b6" },
];

const COUNT_DURATION_SEC = 2.5; // How long the count-up lasts (seconds)

// --- Single stat card ---
const StatCard: React.FC<{
  frame: number;
  fps: number;
  index: number;
  stat: (typeof STATS)[number];
}> = ({ frame, fps, index, stat }) => {
  // Stagger card entrance: each card springs in with a delay
  const entranceProgress = spring({
    frame: frame - index * 8,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Count-up: interpolate from `from` to `to` over COUNT_DURATION_SEC seconds
  const rawValue = interpolate(frame, [0, COUNT_DURATION_SEC * fps], [stat.from, stat.to], {
    easing: Easing.out(Easing.quad), // Starts fast, decelerates to a stop
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp", // Freeze at target value after animation ends
  });

  // Format the number
  const formatted =
    "decimals" in stat
      ? rawValue.toFixed(stat.decimals ?? 0)
      : Math.round(rawValue).toLocaleString();

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: 20,
        padding: "40px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        // Spring drives both Y-position and opacity for entrance
        transform: `translateY(${interpolate(entranceProgress, [0, 1], [60, 0])}px)`,
        opacity: entranceProgress,
        minWidth: 240,
      }}
    >
      <span
        style={{
          color: stat.color,
          fontSize: 56,
          fontFamily: "monospace",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {stat.prefix ?? ""}
        {formatted}
        {stat.suffix ?? ""}
      </span>
      <span
        style={{
          color: "#64748b",
          fontSize: 22,
          fontFamily: "sans-serif",
        }}
      >
        {stat.label}
      </span>
    </div>
  );
};

// --- Main composition ---
export const CounterAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fades in from top
  const titleProgress = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 60,
        padding: 80,
      }}
    >
      {/* Title */}
      <h1
        style={{
          color: "#f1f5f9",
          fontSize: 44,
          fontFamily: "sans-serif",
          margin: 0,
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [-40, 0])}px)`,
        }}
      >
        Q4 Metrics
      </h1>

      {/* Stat cards grid */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} frame={frame} fps={fps} index={i} stat={stat} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
