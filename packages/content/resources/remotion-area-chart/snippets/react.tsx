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

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface DataPoint {
  week: string;
  value: number;
}

const DATA: DataPoint[] = [
  { week: "W1", value: 41200 },
  { week: "W2", value: 53800 },
  { week: "W3", value: 48600 },
  { week: "W4", value: 67300 },
  { week: "W5", value: 72100 },
  { week: "W6", value: 61500 },
  { week: "W7", value: 84900 },
  { week: "W8", value: 79400 },
  { week: "W9", value: 93200 },
  { week: "W10", value: 88700 },
  { week: "W11", value: 107500 },
  { week: "W12", value: 124800 },
];

const COMPANY = "Vaultex Commerce";
const PERIOD = "Q1 2026 · Weekly Revenue";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const BG_COLOR = "#0a0a0f";
const ACCENT = "#6366f1";
const ACCENT_SECONDARY = "#8b5cf6";
const CYAN = "#06b6d4";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.45)";

const CHART_LEFT = 90;
const CHART_RIGHT = 1160;
const CHART_TOP = 160;
const CHART_BOTTOM = 580;
const CHART_W = CHART_RIGHT - CHART_LEFT;
const CHART_H = CHART_BOTTOM - CHART_TOP;

const GRID_LINES = 5;
const GRADIENT_ID = "areaGradient";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatK(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `$${v}`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function mapValue(v: number, min: number, max: number): number {
  // y axis: 0 at bottom (CHART_BOTTOM), max at top (CHART_TOP)
  return CHART_BOTTOM - ((v - min) / (max - min)) * CHART_H;
}

function xForIndex(i: number, total: number): number {
  return CHART_LEFT + (i / (total - 1)) * CHART_W;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const GridLines: React.FC<{ revealProgress: number }> = ({ revealProgress }) => {
  const minVal = 0;
  const maxVal = 140000;
  const step = maxVal / GRID_LINES;

  return (
    <>
      {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
        const v = i * step;
        const y = mapValue(v, minVal, maxVal);
        const opacity = interpolate(revealProgress, [i * 0.12, i * 0.12 + 0.25], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        });
        return (
          <React.Fragment key={i}>
            {/* Gridline */}
            <line
              x1={CHART_LEFT}
              y1={y}
              x2={CHART_RIGHT}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 8"
              opacity={opacity}
            />
            {/* Y-axis label */}
            <text
              x={CHART_LEFT - 14}
              y={y + 5}
              textAnchor="end"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight={500}
              fontSize={13}
              fill="rgba(255,255,255,0.35)"
              opacity={opacity}
            >
              {formatK(v)}
            </text>
          </React.Fragment>
        );
      })}
    </>
  );
};

const XAxisLabels: React.FC<{ revealProgress: number }> = ({ revealProgress }) => {
  const total = DATA.length;
  return (
    <>
      {DATA.map((d, i) => {
        const x = xForIndex(i, total);
        const opacity = interpolate(revealProgress, [i / total, i / total + 0.15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <text
            key={i}
            x={x}
            y={CHART_BOTTOM + 26}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight={500}
            fontSize={13}
            fill="rgba(255,255,255,0.35)"
            opacity={opacity}
          >
            {d.week}
          </text>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const AreaChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const total = DATA.length;
  const minVal = 0;
  const maxVal = 140000;

  // --- Phase timing ---
  // 0–25  : title fade in
  // 10–50 : grid lines + axis labels reveal
  // 30–110: line stroke draw (clip-rect slides right)
  // 60–130: area fill reveal (clip-rect slides right, slightly offset)
  // 80–160: dot markers stagger in
  // 120–170: callout badge slides in
  // 130–180: value label of last point counts up

  // Title
  const titleOpacity = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const titleY = spring({ frame, fps, from: -28, to: 0, config: { damping: 14, stiffness: 90 } });

  const subtitleOpacity = interpolate(frame, [14, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Grid reveal progress (0→1)
  const gridReveal = interpolate(frame, [10, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Line stroke draw: clipRect x2 sweeps from CHART_LEFT to CHART_RIGHT
  const lineProgress = interpolate(frame, [30, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const lineClipX2 = CHART_LEFT + lineProgress * CHART_W;

  // Area fill reveal (slightly delayed behind line)
  const fillProgress = interpolate(frame, [58, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const fillClipX2 = CHART_LEFT + fillProgress * CHART_W;

  // Build SVG path points
  const points: { x: number; y: number }[] = DATA.map((d, i) => ({
    x: xForIndex(i, total),
    y: mapValue(d.value, minVal, maxVal),
  }));

  // Smooth line using cubic bezier via catmull-rom tangents
  function buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const linePath = buildSmoothPath(points);

  // Area path = line path + close down to baseline
  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaPath = `${linePath} L ${lastPt.x},${CHART_BOTTOM} L ${firstPt.x},${CHART_BOTTOM} Z`;

  // Dot markers (staggered spring entrance)
  const dotMarkers = points.map((pt, i) => {
    const dotDelay = 80 + i * 6;
    const f = Math.max(0, frame - dotDelay);
    const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 10, stiffness: 160 } });
    const opacity = interpolate(f, [0, 8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { pt, scale, opacity };
  });

  // Callout badge (last point)
  const calloutDelay = 118;
  const calloutF = Math.max(0, frame - calloutDelay);
  const calloutScale = spring({
    frame: calloutF,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 11, stiffness: 130 },
  });
  const calloutOpacity = interpolate(calloutF, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const calloutX = lastPt.x;
  const calloutY = lastPt.y;

  // Animated "current value" count-up at callout
  const countStart = 128;
  const countProgress = interpolate(frame, [countStart, countStart + 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const displayValue = Math.round(countProgress * DATA[DATA.length - 1].value);

  // Period label reveal
  const periodOpacity = interpolate(frame, [20, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const periodX = interpolate(frame, [20, 46], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Background glow
  const glowOpacity = interpolate(frame, [0, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          left: "40%",
          top: "55%",
          width: 760,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${ACCENT}18 0%, transparent 68%)`,
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "75%",
          top: "30%",
          width: 300,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${CYAN}0f 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity * 0.7,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: CHART_LEFT,
          right: 60,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: WHITE,
              letterSpacing: -0.5,
            }}
          >
            {COMPANY}
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: MUTED,
              marginTop: 4,
              opacity: subtitleOpacity,
            }}
          >
            Weekly Revenue
          </div>
        </div>

        {/* Period tag */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: ACCENT,
            backgroundColor: `${ACCENT}18`,
            border: `1px solid ${ACCENT}40`,
            borderRadius: 8,
            padding: "5px 14px",
            letterSpacing: 0.3,
            opacity: periodOpacity,
            transform: `translateX(${periodX}px)`,
          }}
        >
          {PERIOD}
        </div>
      </div>

      {/* SVG chart */}
      <svg
        width={1280}
        height={720}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.42} />
            <stop offset="55%" stopColor={ACCENT_SECONDARY} stopOpacity={0.14} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>

          {/* Clip rect for line stroke draw */}
          <clipPath id="lineClip">
            <rect
              x={CHART_LEFT - 2}
              y={CHART_TOP - 20}
              width={Math.max(0, lineClipX2 - CHART_LEFT + 4)}
              height={CHART_H + 60}
            />
          </clipPath>

          {/* Clip rect for fill reveal */}
          <clipPath id="fillClip">
            <rect
              x={CHART_LEFT - 2}
              y={CHART_TOP - 20}
              width={Math.max(0, fillClipX2 - CHART_LEFT + 4)}
              height={CHART_H + 80}
            />
          </clipPath>
        </defs>

        {/* Grid lines + axis labels */}
        <GridLines revealProgress={gridReveal} />
        <XAxisLabels revealProgress={gridReveal} />

        {/* Axes */}
        <line
          x1={CHART_LEFT}
          y1={CHART_TOP - 10}
          x2={CHART_LEFT}
          y2={CHART_BOTTOM}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          opacity={gridReveal}
        />
        <line
          x1={CHART_LEFT}
          y1={CHART_BOTTOM}
          x2={CHART_RIGHT}
          y2={CHART_BOTTOM}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          opacity={gridReveal}
        />

        {/* Area fill — revealed with clip rect */}
        <path
          d={areaPath}
          fill={`url(#${GRADIENT_ID})`}
          clipPath="url(#fillClip)"
        />

        {/* Stroke line — drawn first with its own clip rect */}
        <path
          d={linePath}
          fill="none"
          stroke={`url(#lineStroke)`}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#lineClip)"
        />

        {/* Stroke gradient definition */}
        <defs>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ACCENT} />
            <stop offset="60%" stopColor={ACCENT_SECONDARY} />
            <stop offset="100%" stopColor={CYAN} />
          </linearGradient>
        </defs>

        {/* Dot markers */}
        {dotMarkers.map(({ pt, scale, opacity }, i) => (
          <g key={i} opacity={opacity} transform={`translate(${pt.x}, ${pt.y})`}>
            {/* Outer ring */}
            <circle
              r={8 * scale}
              fill={`${ACCENT}22`}
              stroke={i === total - 1 ? CYAN : ACCENT}
              strokeWidth={2}
            />
            {/* Inner dot */}
            <circle
              r={4 * scale}
              fill={i === total - 1 ? CYAN : ACCENT_SECONDARY}
            />
          </g>
        ))}

        {/* Callout badge at last point */}
        <g
          opacity={calloutOpacity}
          transform={`translate(${calloutX}, ${calloutY}) scale(${calloutScale})`}
        >
          {/* Arrow stem */}
          <line
            x1={0}
            y1={-10}
            x2={0}
            y2={-44}
            stroke={CYAN}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          {/* Badge background */}
          <rect
            x={-62}
            y={-88}
            width={124}
            height={40}
            rx={10}
            fill="#0e1020"
            stroke={CYAN}
            strokeWidth={1.5}
          />
          {/* Badge inner glow */}
          <rect
            x={-60}
            y={-86}
            width={120}
            height={36}
            rx={9}
            fill={`${CYAN}12`}
          />
          {/* Value text */}
          <text
            x={0}
            y={-61}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight={700}
            fontSize={18}
            fill={WHITE}
          >
            {`$${displayValue.toLocaleString()}`}
          </text>
          {/* Label */}
          <text
            x={0}
            y={-100}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight={500}
            fontSize={12}
            fill={CYAN}
            letterSpacing={1}
          >
            CURRENT WEEK
          </text>
        </g>

        {/* Vertical hover line at last point (subtle) */}
        <line
          x1={calloutX}
          y1={CHART_TOP}
          x2={calloutX}
          y2={CHART_BOTTOM}
          stroke={CYAN}
          strokeWidth={1}
          strokeDasharray="4 6"
          opacity={calloutOpacity * 0.35}
        />
      </svg>

      {/* Bottom summary row */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: CHART_LEFT,
          display: "flex",
          flexDirection: "row",
          gap: 32,
          opacity: interpolate(frame, [140, 165], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {[
          { label: "Peak week", value: "$124.8k", color: CYAN },
          { label: "Average", value: "$76.9k", color: ACCENT },
          { label: "Growth", value: "+203%", color: "#10b981" },
          { label: "Total Q1", value: "$922.5k", color: "#f59e0b" },
        ].map((stat, i) => {
          const statDelay = i * 8;
          const statOpacity = interpolate(
            frame,
            [140 + statDelay, 165 + statDelay],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const statY = spring({
            frame: Math.max(0, frame - 140 - statDelay),
            fps,
            from: 14,
            to: 0,
            config: { damping: 14, stiffness: 120 },
          });
          return (
            <div
              key={i}
              style={{
                opacity: statOpacity,
                transform: `translateY(${statY}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: stat.color,
                  letterSpacing: -0.3,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  color: MUTED,
                  marginTop: 2,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AreaChart"
    component={AreaChart}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
  />
);
