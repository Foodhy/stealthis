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

// ─── Data ────────────────────────────────────────────────────────────────────

interface YearData {
  year: number;
  current: number; // $M
  previous: number; // $M
}

const DATA: YearData[] = [
  { year: 2019, current: 12.4, previous: 9.1 },
  { year: 2020, current: 15.8, previous: 12.4 },
  { year: 2021, current: 22.3, previous: 15.8 },
  { year: 2022, current: 31.6, previous: 22.3 },
  { year: 2023, current: 47.2, previous: 31.6 },
  { year: 2024, current: 68.9, previous: 47.2 },
];

const BG_COLOR = "#0a0a0f";
const COLOR_CURRENT = "#6366f1"; // indigo
const COLOR_PREVIOUS = "#334155"; // slate muted
const COLOR_GRID = "rgba(255,255,255,0.07)";
const COLOR_AXIS = "rgba(255,255,255,0.18)";
const COLOR_LABEL = "rgba(255,255,255,0.55)";
const COLOR_WHITE = "#ffffff";
const COLOR_DELTA = "#10b981"; // emerald for positive delta badges
const COLOR_ARROW = "#f59e0b"; // amber annotation

const Y_AXIS_MAX = 80; // $M ceiling for grid
const Y_TICKS = [0, 20, 40, 60, 80];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deltaPercent(current: number, previous: number): string {
  const pct = Math.round(((current - previous) / previous) * 100);
  return `+${pct}%`;
}

function formatValue(v: number): string {
  return `$${v.toFixed(1)}M`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface AnimatedBarProps {
  x: number;
  barWidth: number;
  value: number;
  maxValue: number;
  chartHeight: number;
  color: string;
  delay: number; // frames
  fps: number;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({
  x,
  barWidth,
  value,
  maxValue,
  chartHeight,
  color,
  delay,
  fps,
}) => {
  const frame = useCurrentFrame();
  const effectiveFrame = Math.max(0, frame - delay);
  const progress = spring({
    frame: effectiveFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
    durationInFrames: 40,
  });

  const targetHeight = (value / maxValue) * chartHeight;
  const animatedHeight = targetHeight * progress;

  return (
    <rect
      x={x}
      y={chartHeight - animatedHeight}
      width={barWidth}
      height={animatedHeight}
      rx={4}
      fill={color}
    />
  );
};

interface DeltaBadgeProps {
  x: number;
  y: number;
  label: string;
  delay: number;
  fps: number;
}

const DeltaBadge: React.FC<DeltaBadgeProps> = ({ x, y, label, delay, fps }) => {
  const frame = useCurrentFrame();
  const effectiveFrame = Math.max(0, frame - delay);
  const scale = spring({
    frame: effectiveFrame,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.6 },
    durationInFrames: 20,
  });
  const opacity = interpolate(effectiveFrame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      style={{ transformOrigin: `${x}px ${y}px` }}
      opacity={opacity}
    >
      <rect x={-22} y={-12} width={44} height={22} rx={6} fill={COLOR_DELTA} opacity={0.18} />
      <rect
        x={-22}
        y={-12}
        width={44}
        height={22}
        rx={6}
        fill="none"
        stroke={COLOR_DELTA}
        strokeWidth={1}
        opacity={0.5}
      />
      <text
        x={0}
        y={5}
        textAnchor="middle"
        fill={COLOR_DELTA}
        fontSize={11}
        fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {label}
      </text>
    </g>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const GrowthChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Layout constants
  const PADDING_LEFT = 88;
  const PADDING_RIGHT = 56;
  const PADDING_TOP = 100;
  const PADDING_BOTTOM = 60;
  const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;

  const groupCount = DATA.length;
  const groupWidth = chartWidth / groupCount;
  const BAR_GAP = 4;
  const barWidth = groupWidth * 0.36;

  // ── Global entrance timing ──────────────────────────────────────────────────
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(frame, [0, 18], [-16, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const axisOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Bars start at frame 28, stagger by 10 per group
  const BARS_START = 28;
  const BAR_STAGGER = 9;
  // Delta badges appear 45 frames after bars start + stagger
  const BADGE_EXTRA_DELAY = 45;

  // ── Annotation arrow: appears at frame 140 ──────────────────────────────────
  const highestIndex = DATA.reduce(
    (best, d, i) => (d.current > DATA[best].current ? i : best),
    0
  );
  const arrowOpacity = interpolate(frame, [138, 155], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const arrowSlide = interpolate(frame, [138, 155], [-12, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ── Compute group x positions ───────────────────────────────────────────────
  const groupX = (i: number) => PADDING_LEFT + i * groupWidth;
  const currentBarX = (i: number) => groupX(i) + groupWidth / 2 - barWidth - BAR_GAP / 2;
  const prevBarX = (i: number) => groupX(i) + groupWidth / 2 + BAR_GAP / 2;

  // ── Highest bar annotation coords ───────────────────────────────────────────
  const highestCurrentHeight = (DATA[highestIndex].current / Y_AXIS_MAX) * chartHeight;
  const highestBarCenterX =
    currentBarX(highestIndex) + barWidth / 2 + (barWidth + BAR_GAP) / 2;
  const highestBarTopY = PADDING_TOP + chartHeight - highestCurrentHeight;

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>
      {/* ── Background radial glow ── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="bgGlow" cx="60%" cy="70%" r="55%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow2" cx="20%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />
        <rect width={width} height={height} fill="url(#bgGlow2)" />
      </svg>

      {/* ── Title block ── */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: PADDING_LEFT,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: COLOR_WHITE,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Revenue Growth YoY
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            marginTop: 4,
            letterSpacing: "0.02em",
          }}
        >
          Axon Dynamics · FY 2019 – 2024 · Revenue in USD millions
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: COLOR_CURRENT,
              }}
            />
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Current Year
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: COLOR_PREVIOUS,
              }}
            />
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Previous Year
            </span>
          </div>
        </div>
      </div>

      {/* ── Chart SVG ── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
        opacity={axisOpacity}
      >
        {/* Y-axis gridlines + labels */}
        {Y_TICKS.map((tick) => {
          const yPos = PADDING_TOP + chartHeight - (tick / Y_AXIS_MAX) * chartHeight;
          return (
            <g key={tick}>
              <line
                x1={PADDING_LEFT}
                y1={yPos}
                x2={PADDING_LEFT + chartWidth}
                y2={yPos}
                stroke={tick === 0 ? COLOR_AXIS : COLOR_GRID}
                strokeWidth={tick === 0 ? 1.5 : 1}
              />
              <text
                x={PADDING_LEFT - 10}
                y={yPos + 4}
                textAnchor="end"
                fill={COLOR_LABEL}
                fontSize={11}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight={500}
              >
                {tick === 0 ? "" : `$${tick}M`}
              </text>
            </g>
          );
        })}

        {/* X-axis line */}
        <line
          x1={PADDING_LEFT}
          y1={PADDING_TOP + chartHeight}
          x2={PADDING_LEFT + chartWidth}
          y2={PADDING_TOP + chartHeight}
          stroke={COLOR_AXIS}
          strokeWidth={1.5}
        />

        {/* Y-axis vertical line */}
        <line
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={PADDING_LEFT}
          y2={PADDING_TOP + chartHeight}
          stroke={COLOR_AXIS}
          strokeWidth={1.5}
        />

        {/* Bars + x-labels per group */}
        {DATA.map((d, i) => {
          const barDelay = BARS_START + i * BAR_STAGGER;
          const badgeDelay = BARS_START + i * BAR_STAGGER + BADGE_EXTRA_DELAY;

          const cX = currentBarX(i);
          const pX = prevBarX(i);

          const currentHeight = (d.current / Y_AXIS_MAX) * chartHeight;
          const badgeX = groupX(i) + groupWidth / 2;
          const badgeY = PADDING_TOP + chartHeight - currentHeight - 20;

          const centerGroupX = groupX(i) + groupWidth / 2;

          return (
            <g key={d.year}>
              {/* Previous year bar */}
              <AnimatedBar
                x={pX}
                barWidth={barWidth}
                value={d.previous}
                maxValue={Y_AXIS_MAX}
                chartHeight={chartHeight}
                color={COLOR_PREVIOUS}
                delay={barDelay}
                fps={fps}
              />
              {/* Current year bar */}
              <AnimatedBar
                x={cX}
                barWidth={barWidth}
                value={d.current}
                maxValue={Y_AXIS_MAX}
                chartHeight={chartHeight}
                color={COLOR_CURRENT}
                delay={barDelay + 4}
                fps={fps}
              />
              {/* X-axis year label */}
              <text
                x={centerGroupX}
                y={PADDING_TOP + chartHeight + 22}
                textAnchor="middle"
                fill={COLOR_LABEL}
                fontSize={12}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight={600}
              >
                {d.year}
              </text>
              {/* Delta badge */}
              <DeltaBadge
                x={badgeX}
                y={badgeY}
                label={deltaPercent(d.current, d.previous)}
                delay={badgeDelay}
                fps={fps}
              />
            </g>
          );
        })}

        {/* ── Annotation arrow to highest bar ── */}
        <g opacity={arrowOpacity} transform={`translate(0, ${arrowSlide})`}>
          {/* Arrow line */}
          <line
            x1={highestBarCenterX + 52}
            y1={highestBarTopY - 10}
            x2={highestBarCenterX + 10}
            y2={highestBarTopY - 4}
            stroke={COLOR_ARROW}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          {/* Arrow head */}
          <polygon
            points={`${highestBarCenterX + 10},${highestBarTopY - 4} ${highestBarCenterX + 17},${highestBarTopY - 12} ${highestBarCenterX + 17},${highestBarTopY + 4}`}
            fill={COLOR_ARROW}
          />
          {/* Callout box */}
          <rect
            x={highestBarCenterX + 52}
            y={highestBarTopY - 28}
            width={132}
            height={36}
            rx={7}
            fill="#f59e0b"
            fillOpacity={0.15}
            stroke={COLOR_ARROW}
            strokeWidth={1}
            strokeOpacity={0.6}
          />
          <text
            x={highestBarCenterX + 118}
            y={highestBarTopY - 14}
            textAnchor="middle"
            fill={COLOR_ARROW}
            fontSize={11}
            fontWeight={700}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Peak: {formatValue(DATA[highestIndex].current)}
          </text>
          <text
            x={highestBarCenterX + 118}
            y={highestBarTopY + 2}
            textAnchor="middle"
            fill="rgba(245,158,11,0.65)"
            fontSize={10}
            fontWeight={500}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Best year on record
          </text>
        </g>
      </svg>

      {/* ── Value labels above current bars (count-up effect) ── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {DATA.map((d, i) => {
          const barDelay = BARS_START + i * BAR_STAGGER + 4;
          const effectiveFrame = Math.max(0, frame - barDelay);
          const progress = spring({
            frame: effectiveFrame,
            fps,
            config: { damping: 18, stiffness: 120, mass: 0.8 },
            durationInFrames: 40,
          });
          const displayValue = d.current * progress;
          const currentHeight = (d.current / Y_AXIS_MAX) * chartHeight;
          const labelY = PADDING_TOP + chartHeight - currentHeight - 6;
          const labelX = currentBarX(i) + barWidth / 2;

          const labelOpacity = interpolate(effectiveFrame, [10, 22], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <text
              key={`lbl-${d.year}`}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize={10}
              fontWeight={600}
              fontFamily="system-ui, -apple-system, sans-serif"
              opacity={labelOpacity}
            >
              ${displayValue.toFixed(1)}M
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GrowthChart"
    component={GrowthChart}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
  />
);
