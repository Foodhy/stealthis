/**
 * TECHNIQUE: SVG Animation — Animated Pie Chart
 *
 * How it works:
 * - Each pie slice is an SVG <circle> with `stroke-dasharray` and `stroke-dashoffset`
 * - `strokeDasharray` defines a dash pattern: [segmentLength, circumference]
 *   → the dash covers exactly one slice of the circle
 * - `strokeDashoffset` shifts where the dash starts around the circle
 *   → animating from segmentLength → 0 "draws" the segment into view
 * - We rotate the whole SVG so segments stack from 12 o'clock
 *
 * Math:
 *   circumference = 2 * Math.PI * radius
 *   segmentLength = (sliceValue / total) * circumference
 *   startOffset   = (previousSlicesTotal / total) * circumference
 *
 * To recreate this pattern:
 *   1. Calculate circumference from your radius
 *   2. For each slice: compute segmentLength from its data fraction
 *   3. Animate strokeDashoffset from segmentLength → 0 using interpolate()
 *   4. Set strokeDasharray={`${segmentLength} ${circumference}`}
 *   5. Use `transform="rotate(-90 cx cy)"` to start at 12 o'clock
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// --- Chart data ---
const DATA = [
  { label: "React", value: 38, color: "#61dafb" },
  { label: "Vue", value: 24, color: "#42b883" },
  { label: "Angular", value: 20, color: "#dd0031" },
  { label: "Svelte", value: 11, color: "#ff3e00" },
  { label: "Other", value: 7, color: "#94a3b8" },
];

const CX = 250; // SVG circle center X
const CY = 250; // SVG circle center Y
const RADIUS = 180; // Circle radius
const STROKE_W = 80; // Stroke width (thicker = more donut-like)

// --- Single donut segment ---
const Segment: React.FC<{
  frame: number;
  fps: number;
  circumference: number;
  segmentLength: number;
  startOffset: number;
  color: string;
  index: number;
}> = ({ frame, fps, circumference, segmentLength, startOffset, color, index }) => {
  // Each segment animates with a spring, staggered by index
  const progress = spring({
    frame: frame - index * 8,
    fps,
    config: { damping: 200 },
  });

  // strokeDashoffset draws the segment:
  //   at progress=0: offset = segmentLength → nothing visible (the gap covers the stroke)
  //   at progress=1: offset = 0 → full segment is drawn
  // Then add startOffset so segments stack rather than overlap
  const dashOffset = interpolate(progress, [0, 1], [segmentLength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <circle
      r={RADIUS}
      cx={CX}
      cy={CY}
      fill="none"
      stroke={color}
      strokeWidth={STROKE_W}
      // dasharray: [mySegment, everything else] → only my segment is colored
      strokeDasharray={`${segmentLength} ${circumference}`}
      // offset = my draw progress + where to start on the circle
      strokeDashoffset={dashOffset - startOffset}
      // Rotate so we start from 12 o'clock instead of 3 o'clock
      transform={`rotate(-90 ${CX} ${CY})`}
    />
  );
};

// --- Legend item ---
const LegendItem: React.FC<{
  frame: number;
  fps: number;
  index: number;
  label: string;
  value: number;
  color: string;
  total: number;
}> = ({ frame, fps, index, label, value, color, total }) => {
  const progress = spring({
    frame: frame - index * 8,
    fps,
    config: { damping: 200 },
  });

  const pct = Math.round((value / total) * 100);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      <div
        style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: color, flexShrink: 0 }}
      />
      <span style={{ color: "#94a3b8", fontSize: 22, fontFamily: "sans-serif" }}>{label}</span>
      <span style={{ color: "#e2e8f0", fontSize: 22, fontFamily: "monospace", marginLeft: "auto" }}>
        {pct}%
      </span>
    </div>
  );
};

// --- Main composition ---
export const PieChartAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const total = DATA.reduce((sum, d) => sum + d.value, 0);
  const circumference = 2 * Math.PI * RADIUS;

  // Pre-compute the starting offset for each segment
  // (how far around the circle the previous segments take up)
  let cumulativeValue = 0;
  const segments = DATA.map((item, i) => {
    const segmentLength = (item.value / total) * circumference;
    const startOffset = (cumulativeValue / total) * circumference;
    cumulativeValue += item.value;
    return { ...item, segmentLength, startOffset, index: i };
  });

  const titleProgress = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
        padding: 80,
      }}
    >
      {/* Left: SVG donut chart */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <svg width={CX * 2} height={CY * 2}>
          <title>Framework usage donut chart</title>
          {segments.map((seg) => (
            <Segment
              key={seg.label}
              frame={frame}
              fps={fps}
              circumference={circumference}
              segmentLength={seg.segmentLength}
              startOffset={seg.startOffset}
              color={seg.color}
              index={seg.index}
            />
          ))}
          {/* Center label */}
          <text
            x={CX}
            y={CY + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#f8fafc"
            fontSize="32"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {total}
          </text>
          <text
            x={CX}
            y={CY + 44}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748b"
            fontSize="20"
            fontFamily="sans-serif"
          >
            responses
          </text>
        </svg>
      </div>

      {/* Right: legend + title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 320 }}>
        <h1
          style={{
            color: "#f8fafc",
            fontSize: 40,
            fontFamily: "sans-serif",
            margin: 0,
            opacity: titleProgress,
          }}
        >
          Framework Usage
        </h1>
        {DATA.map((item, i) => (
          <LegendItem
            key={item.label}
            frame={frame}
            fps={fps}
            index={i}
            label={item.label}
            value={item.value}
            color={item.color}
            total={total}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
