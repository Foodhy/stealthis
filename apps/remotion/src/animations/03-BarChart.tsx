/**
 * TECHNIQUE: Data Visualization — Animated Bar Chart
 *
 * How it works:
 * - Each bar's height is driven by `spring()` with a stagger delay
 * - The bar height = spring progress × actual data height
 * - Labels fade in after their bar is mostly grown
 *
 * Key ideas:
 * - `delay: i * STAGGER_DELAY` staggers each bar's entrance
 * - `spring()` with { damping: 200 } gives a smooth, no-bounce grow-in
 * - To recreate: map your data values to pixel heights, then multiply by spring progress
 *
 * To recreate this pattern:
 *   1. Normalize your data to a max chart height (e.g. 400px)
 *   2. For each bar: const progress = spring({ frame, fps, delay: i * N })
 *   3. Render a div with height = targetHeight * progress
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// --- Data ---
const DATA = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 78 },
  { label: "Wed", value: 55 },
  { label: "Thu", value: 91 },
  { label: "Fri", value: 63 },
  { label: "Sat", value: 29 },
  { label: "Sun", value: 47 },
];

const MAX_BAR_HEIGHT = 380; // Max pixel height a bar can reach
const STAGGER_DELAY = 6; // Frames between each bar starting its animation
const BAR_COLOR = "#6366f1";
const BAR_COLOR_PEAK = "#a78bfa"; // Color of the tallest bar

// --- Single Bar ---
const Bar: React.FC<{
  frame: number;
  fps: number;
  item: { label: string; value: number };
  index: number;
  maxValue: number;
}> = ({ frame, fps, item, index, maxValue }) => {
  // spring grows from 0 → 1, delayed by index so bars stagger in
  const progress = spring({
    frame: frame - index * STAGGER_DELAY,
    fps,
    config: { damping: 200 }, // smooth, no bounce — good for data viz
  });

  // Scale data value to pixel height
  const targetHeight = (item.value / maxValue) * MAX_BAR_HEIGHT;
  const barHeight = targetHeight * progress;

  const isPeak = item.value === maxValue;

  // Value label fades in once the bar is mostly grown
  const labelOpacity = interpolate(progress, [0.7, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        flex: 1,
      }}
    >
      {/* Value label above the bar */}
      <span
        style={{
          color: "#e2e8f0",
          fontSize: 20,
          fontFamily: "sans-serif",
          opacity: labelOpacity,
        }}
      >
        {item.value}
      </span>

      {/* The bar itself — height animated by spring progress */}
      <div
        style={{
          width: "70%",
          height: barHeight,
          backgroundColor: isPeak ? BAR_COLOR_PEAK : BAR_COLOR,
          borderRadius: "8px 8px 0 0",
        }}
      />
    </div>
  );
};

// --- Main composition ---
export const BarChartAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...DATA.map((d) => d.value));

  // Title slides down with a spring
  const titleY = interpolate(spring({ frame, fps, config: { damping: 200 } }), [0, 1], [-60, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {/* Animated title */}
      <h1
        style={{
          color: "#f8fafc",
          fontSize: 42,
          fontFamily: "sans-serif",
          margin: 0,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Weekly Activity
      </h1>

      {/* Chart area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Bars */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            borderBottom: "2px solid #334155",
            paddingBottom: 0,
          }}
        >
          {DATA.map((item, i) => (
            <Bar
              key={item.label}
              frame={frame}
              fps={fps}
              item={item}
              index={i}
              maxValue={maxValue}
            />
          ))}
        </div>

        {/* X-axis labels */}
        <div style={{ display: "flex", gap: 16 }}>
          {DATA.map((item) => (
            <div
              key={item.label}
              style={{
                flex: 1,
                textAlign: "center",
                color: "#64748b",
                fontSize: 20,
                fontFamily: "sans-serif",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
