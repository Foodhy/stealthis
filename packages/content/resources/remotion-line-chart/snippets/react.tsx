import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Config ─────────────────────────────────────────────────────────────────
const BG_COLOR = "#0a0a0f";
const AXIS_COLOR = "rgba(255,255,255,0.12)";
const GRID_COLOR = "rgba(255,255,255,0.06)";
const CHART_TITLE = "Revenue vs. User Growth";
const CHART_SUBTITLE = "Veltrix SaaS — Jan–Dec 2025";

// Chart layout
const PAD = { top: 100, right: 120, bottom: 90, left: 80 };

// ── Data ───────────────────────────────────────────────────────────────────
interface DataPoint {
  month: string;
  revenue: number; // $K
  users: number;   // users (hundreds)
}

const DATA: DataPoint[] = [
  { month: "Jan", revenue: 41,  users: 12 },
  { month: "Feb", revenue: 58,  users: 19 },
  { month: "Mar", revenue: 53,  users: 23 },
  { month: "Apr", revenue: 72,  users: 31 },
  { month: "May", revenue: 88,  users: 38 },
  { month: "Jun", revenue: 81,  users: 44 },
  { month: "Jul", revenue: 95,  users: 52 },
  { month: "Aug", revenue: 107, users: 61 },
  { month: "Sep", revenue: 98,  users: 68 },
  { month: "Oct", revenue: 124, users: 77 },
  { month: "Nov", revenue: 139, users: 86 },
  { month: "Dec", revenue: 152, users: 94 },
];

interface Series {
  key: "revenue" | "users";
  label: string;
  unit: string;
  color: string;
  glowColor: string;
  fillColor: string;
}

const SERIES: Series[] = [
  {
    key: "revenue",
    label: "Revenue",
    unit: "$K",
    color: "#6366f1",
    glowColor: "rgba(99,102,241,0.5)",
    fillColor: "rgba(99,102,241,0.12)",
  },
  {
    key: "users",
    label: "Users (×100)",
    unit: "×100",
    color: "#06b6d4",
    glowColor: "rgba(6,182,212,0.5)",
    fillColor: "rgba(6,182,212,0.10)",
  },
];

const Y_TICKS = 5;

// ── Helpers ────────────────────────────────────────────────────────────────
function buildPoints(
  normalized: number[],
  chartW: number,
  chartH: number
): Array<[number, number]> {
  const n = normalized.length;
  return normalized.map((v, i) => [
    (i / (n - 1)) * chartW,
    chartH - v * chartH * 0.85,
  ]);
}

function pointsToPolyline(pts: Array<[number, number]>): string {
  return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function buildAreaPath(
  pts: Array<[number, number]>,
  chartH: number
): string {
  if (pts.length === 0) return "";
  const poly = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L ");
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `M ${first[0].toFixed(2)},${chartH} L ${poly} L ${last[0].toFixed(2)},${chartH} Z`;
}

// Total SVG polyline length estimate (straight-line segments)
function approxPolylineLength(pts: Array<[number, number]>): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

// ── Background glow ────────────────────────────────────────────────────────
const BgGlow: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: "25%",
        width: 700,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "40%",
        left: "55%",
        width: 500,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
  </>
);

// ── Title block ────────────────────────────────────────────────────────────
const TitleBlock: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const translateY = interpolate(frame, [0, 18], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: PAD.left,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: "#ffffff",
          letterSpacing: "-0.5px",
        }}
      >
        {CHART_TITLE}
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "rgba(255,255,255,0.45)",
          marginTop: 4,
        }}
      >
        {CHART_SUBTITLE}
      </div>
    </div>
  );
};

// ── Legend ─────────────────────────────────────────────────────────────────
const Legend: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        right: PAD.right - 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {SERIES.map((s, i) => {
        const delay = i * 10;
        const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        });
        const translateX = interpolate(frame, [delay, delay + 20], [12, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={s.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity,
              transform: `translateX(${translateX}px)`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 3,
                borderRadius: 2,
                backgroundColor: s.color,
                boxShadow: `0 0 8px ${s.glowColor}`,
              }}
            />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: s.color,
                boxShadow: `0 0 6px ${s.glowColor}`,
              }}
            />
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── SVG Line Series ────────────────────────────────────────────────────────
interface LineSeriesProps {
  series: Series;
  points: Array<[number, number]>;
  chartH: number;
  drawProgress: number; // 0→1
  dotsProgress: number[]; // per-dot opacity 0→1
  isLast?: boolean;
  lastValue: number;
}

const LineSeries: React.FC<LineSeriesProps> = ({
  series,
  points,
  chartH,
  drawProgress,
  dotsProgress,
  isLast,
  lastValue,
}) => {
  const totalLen = approxPolylineLength(points);
  const dashOffset = totalLen * (1 - drawProgress);

  return (
    <g>
      {/* Area fill */}
      <path
        d={buildAreaPath(points, chartH)}
        fill={series.fillColor}
        opacity={drawProgress}
      />

      {/* Line stroke */}
      <polyline
        points={pointsToPolyline(points)}
        fill="none"
        stroke={series.color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLen}
        strokeDashoffset={dashOffset}
        style={{ filter: `drop-shadow(0 0 6px ${series.glowColor})` }}
      />

      {/* Data point dots */}
      {points.map(([x, y], i) => {
        const op = dotsProgress[i] ?? 0;
        const r = 4 + op * 1.5;
        return (
          <g key={i} opacity={op}>
            <circle cx={x} cy={y} r={r + 3} fill={series.fillColor} />
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={series.color}
              style={{ filter: `drop-shadow(0 0 5px ${series.glowColor})` }}
            />
            <circle cx={x} cy={y} r={r * 0.45} fill="white" opacity={0.9} />
          </g>
        );
      })}

      {/* Callout on last point */}
      {isLast && (() => {
        const [lx, ly] = points[points.length - 1];
        const calloutOp = dotsProgress[points.length - 1] ?? 0;
        return (
          <g opacity={calloutOp}>
            <line
              x1={lx}
              y1={ly - 8}
              x2={lx}
              y2={ly - 28}
              stroke={series.color}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              opacity={0.7}
            />
            <rect
              x={lx - 28}
              y={ly - 52}
              width={56}
              height={22}
              rx={4}
              fill={series.color}
              opacity={0.9}
            />
            <text
              x={lx}
              y={ly - 37}
              textAnchor="middle"
              fill="white"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight={700}
              fontSize={12}
            >
              {lastValue}{series.unit}
            </text>
          </g>
        );
      })()}
    </g>
  );
};

// ── Main composition ────────────────────────────────────────────────────────
export const LineChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const chartW = width - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  // Axis + grid fade in (frames 0–20)
  const axisOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const gridOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Line draw progress (frames 30–130) — series 1 leads by 8 frames
  const line0Draw = interpolate(frame, [30, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const line1Draw = interpolate(frame, [38, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Precompute normalized points for each series
  const rev = DATA.map((d) => d.revenue);
  const usr = DATA.map((d) => d.users);

  // Use a shared max for both series so they share the same Y-axis scale
  const globalMax = Math.max(...rev, ...usr);
  const revPoints = buildPoints(
    rev.map((v) => v / globalMax),
    chartW,
    chartH
  );
  const usrPoints = buildPoints(
    usr.map((v) => v / globalMax),
    chartW,
    chartH
  );

  // Dots: each dot appears when the line has reached it (based on draw progress fraction)
  const n = DATA.length;
  function dotOpacities(lineStartFrame: number): number[] {
    return DATA.map((_, i) => {
      const dotThreshold = i / (n - 1);
      const dotFrame = lineStartFrame + dotThreshold * 100;
      return interpolate(frame, [dotFrame, dotFrame + 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.5)),
      });
    });
  }

  const rev0Dots = dotOpacities(30);
  const usr0Dots = dotOpacities(38);

  // Y-axis tick labels
  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => i / Y_TICKS);
  const tickMaxValue = globalMax;

  // X-axis labels fade in staggered
  const xLabelOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>
      <BgGlow />
      <TitleBlock frame={frame} />
      <Legend frame={frame} />

      {/* Chart SVG */}
      <svg
        style={{ position: "absolute", top: PAD.top, left: PAD.left }}
        width={chartW}
        height={chartH}
        overflow="visible"
      >
        {/* Grid lines */}
        {yTicks.map((t, i) => {
          const y = chartH - t * chartH * 0.85;
          return (
            <line
              key={i}
              x1={0}
              y1={y}
              x2={chartW}
              y2={y}
              stroke={GRID_COLOR}
              strokeWidth={1}
              opacity={gridOpacity}
            />
          );
        })}

        {/* Y-axis */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={chartH}
          stroke={AXIS_COLOR}
          strokeWidth={1}
          opacity={axisOpacity}
        />

        {/* X-axis */}
        <line
          x1={0}
          y1={chartH}
          x2={chartW}
          y2={chartH}
          stroke={AXIS_COLOR}
          strokeWidth={1}
          opacity={axisOpacity}
        />

        {/* Y-axis tick labels */}
        {yTicks.map((t, i) => {
          const y = chartH - t * chartH * 0.85;
          const value = Math.round(t * tickMaxValue);
          return (
            <text
              key={i}
              x={-10}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.3)"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={11}
              opacity={axisOpacity}
            >
              {value}
            </text>
          );
        })}

        {/* X-axis month labels */}
        {DATA.map((d, i) => {
          const x = (i / (n - 1)) * chartW;
          return (
            <text
              key={i}
              x={x}
              y={chartH + 22}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={12}
              fontWeight={500}
              opacity={xLabelOpacity}
            >
              {d.month}
            </text>
          );
        })}

        {/* Revenue series */}
        <LineSeries
          series={SERIES[0]}
          points={revPoints}
          chartH={chartH}
          drawProgress={line0Draw}
          dotsProgress={rev0Dots}
          isLast={true}
          lastValue={DATA[DATA.length - 1].revenue}
        />

        {/* Users series */}
        <LineSeries
          series={SERIES[1]}
          points={usrPoints}
          chartH={chartH}
          drawProgress={line1Draw}
          dotsProgress={usr0Dots}
          isLast={false}
          lastValue={DATA[DATA.length - 1].users}
        />
      </svg>

      {/* Bottom tagline */}
      {(() => {
        const tagOp = interpolate(frame, [150, 170], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: PAD.right,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,255,255,0.2)",
              opacity: tagOp,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            veltrix.io · annual overview
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ── Remotion Root ───────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="LineChart"
    component={LineChart}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
  />
);
