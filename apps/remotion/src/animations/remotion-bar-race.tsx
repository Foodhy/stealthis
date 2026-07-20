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

// ── Palette & Config ──────────────────────────────────────────────────────────
const BG_COLOR = "#0a0a0f";

const COLORS: Record<string, string> = {
  Zephyr:   "#6366f1",
  Novex:    "#06b6d4",
  Astrova:  "#10b981",
  Quilora:  "#f59e0b",
  Driftex:  "#ef4444",
  Veloris:  "#8b5cf6",
  Cambrix:  "#38bdf8",
  Orynth:   "#f97316",
};

// Frames at which each snapshot becomes "active"
const SNAPSHOT_START = [0, 100, 200];
// Each transition takes this many frames
const TRANSITION_FRAMES = 70;

interface AppEntry {
  name: string;
  value: number; // monthly active users in millions
}

// ── Dataset: 3 time snapshots, 8 competing apps ───────────────────────────────
const SNAPSHOTS: { period: string; data: AppEntry[] }[] = [
  {
    period: "Q1 2022",
    data: [
      { name: "Zephyr",  value: 42 },
      { name: "Novex",   value: 68 },
      { name: "Astrova", value: 31 },
      { name: "Quilora", value: 55 },
      { name: "Driftex", value: 77 },
      { name: "Veloris", value: 24 },
      { name: "Cambrix", value: 49 },
      { name: "Orynth",  value: 36 },
    ],
  },
  {
    period: "Q1 2023",
    data: [
      { name: "Zephyr",  value: 91 },
      { name: "Novex",   value: 74 },
      { name: "Astrova", value: 58 },
      { name: "Quilora", value: 43 },
      { name: "Driftex", value: 82 },
      { name: "Veloris", value: 67 },
      { name: "Cambrix", value: 39 },
      { name: "Orynth",  value: 71 },
    ],
  },
  {
    period: "Q1 2024",
    data: [
      { name: "Zephyr",  value: 138 },
      { name: "Novex",   value: 79 },
      { name: "Astrova", value: 114 },
      { name: "Quilora", value: 38 },
      { name: "Driftex", value: 96 },
      { name: "Veloris", value: 122 },
      { name: "Cambrix", value: 53 },
      { name: "Orynth",  value: 107 },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the sorted rank-order array for a snapshot (desc by value) */
function sortedRanks(data: AppEntry[]): string[] {
  return [...data].sort((a, b) => b.value - a.value).map((d) => d.name);
}

/** Get value for a name in a snapshot */
function getValue(data: AppEntry[], name: string): number {
  return data.find((d) => d.name === name)?.value ?? 0;
}

/** Eased progress 0→1 for a snapshot transition */
function transitionProgress(
  frame: number,
  snapshotIndex: number
): number {
  const start = SNAPSHOT_START[snapshotIndex];
  const raw = (frame - start) / TRANSITION_FRAMES;
  return Math.min(1, Math.max(0, raw));
}

/** Which two snapshots are we interpolating between at a given frame? */
function activePhase(frame: number): { from: number; to: number; t: number } {
  if (frame < SNAPSHOT_START[1]) {
    const t = transitionProgress(frame, 0);
    return { from: 0, to: 0, t };
  } else if (frame < SNAPSHOT_START[2]) {
    const t = transitionProgress(frame, 1);
    return { from: 0, to: 1, t };
  } else {
    const t = transitionProgress(frame, 2);
    return { from: 1, to: 2, t };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface RacingBarProps {
  name: string;
  interpolatedValue: number;
  maxValue: number;
  rankY: number;      // absolute Y in px for this bar's vertical slot
  barWidth: number;   // chart draw width in px
  rowHeight: number;
  frame: number;
  fps: number;
  entryDelay: number; // stagger delay for initial entrance
}

const RacingBar: React.FC<RacingBarProps> = ({
  name,
  interpolatedValue,
  maxValue,
  rankY,
  barWidth,
  rowHeight,
  frame,
  fps,
  entryDelay,
}) => {
  const color = COLORS[name] ?? "#ffffff";

  // Entrance spring from left
  const entranceF = Math.max(0, frame - entryDelay);
  const widthFraction = spring({
    frame: entranceF,
    fps,
    from: 0,
    to: interpolatedValue / maxValue,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });

  const filledWidth = widthFraction * barWidth * 0.88;

  // Value label count-up
  const displayValue = Math.round(interpolatedValue);

  // Badge opacity on entrance
  const badgeOpacity = interpolate(entranceF, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const BAR_H = rowHeight * 0.52;
  const BAR_OFFSET_Y = (rowHeight - BAR_H) / 2;

  return (
    <div
      style={{
        position: "absolute",
        top: rankY + BAR_OFFSET_Y,
        left: 0,
        width: barWidth,
        height: BAR_H,
        display: "flex",
        alignItems: "center",
        // Smooth vertical repositioning via CSS transition would be ideal,
        // but we handle it via interpolated rankY in the parent instead.
      }}
    >
      {/* Bar fill */}
      <div
        style={{
          width: filledWidth,
          height: "100%",
          borderRadius: "0 6px 6px 0",
          background: `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)`,
          boxShadow: `0 0 18px ${color}55`,
          position: "relative",
          overflow: "visible",
          flexShrink: 0,
        }}
      >
        {/* Shine overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            borderRadius: "0 6px 0 0",
            background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Value label (right of bar) */}
      <div
        style={{
          opacity: badgeOpacity,
          marginLeft: 10,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: Math.round(BAR_H * 0.52),
          color: color,
          whiteSpace: "nowrap",
          letterSpacing: "-0.5px",
        }}
      >
        {displayValue}M
      </div>

      {/* Name label (left of bar, outside chart) */}
      <div
        style={{
          position: "absolute",
          right: barWidth + 10,
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: Math.round(BAR_H * 0.46),
          color: "rgba(255,255,255,0.9)",
          whiteSpace: "nowrap",
          opacity: badgeOpacity,
          textAlign: "right",
          width: 110,
        }}
      >
        {name}
      </div>

      {/* Color dot badge */}
      <div
        style={{
          position: "absolute",
          right: barWidth - 6,
          top: "50%",
          transform: "translateY(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          opacity: badgeOpacity,
          zIndex: 2,
        }}
      />
    </div>
  );
};

// ── Period Label ──────────────────────────────────────────────────────────────

const PeriodLabel: React.FC<{ frame: number }> = ({ frame }) => {
  const { from, to, t } = activePhase(frame);

  const fromPeriod = SNAPSHOTS[from].period;
  const toPeriod = SNAPSHOTS[to].period;

  const switchT = interpolate(t, [0.4, 0.85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const outOpacity = interpolate(switchT, [0, 0.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inOpacity = interpolate(switchT, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outY = interpolate(switchT, [0, 0.5], [0, -14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inY = interpolate(switchT, [0.5, 1], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sharedStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontWeight: 700,
    fontSize: 42,
    letterSpacing: "-1px",
    color: "rgba(255,255,255,0.22)",
  };

  return (
    <div style={{ position: "relative", height: 56, width: 240 }}>
      <div
        style={{
          ...sharedStyle,
          opacity: outOpacity,
          transform: `translateY(${outY}px)`,
        }}
      >
        {fromPeriod}
      </div>
      <div
        style={{
          ...sharedStyle,
          opacity: inOpacity,
          transform: `translateY(${inY}px)`,
        }}
      >
        {toPeriod}
      </div>
    </div>
  );
};

// ── Title ─────────────────────────────────────────────────────────────────────

const Title: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 25], [-16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: "#ffffff",
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        Top Apps by Monthly Active Users
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 15,
          color: "rgba(255,255,255,0.45)",
          marginTop: 6,
          letterSpacing: "0.2px",
        }}
      >
        Fictional streaming &amp; productivity apps · millions of users
      </div>
    </div>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────

export const BarRace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Layout constants
  const PADDING_LEFT = 160;   // space for name labels
  const PADDING_RIGHT = 120;
  const PADDING_TOP = 110;
  const PADDING_BOTTOM = 70;

  const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;

  const NUM_BARS = SNAPSHOTS[0].data.length;
  const ROW_HEIGHT = chartHeight / NUM_BARS;

  // Determine which two snapshots to interpolate
  const { from, to, t } = activePhase(frame);

  const fromData = SNAPSHOTS[from].data;
  const toData = SNAPSHOTS[to].data;

  // spring-eased t for smooth cross-fade of values
  const easedT = spring({
    frame: Math.round(t * TRANSITION_FRAMES),
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 90, mass: 1 },
  });

  // Interpolate each app's value between snapshots
  const interpolatedValues: Record<string, number> = {};
  SNAPSHOTS[0].data.forEach(({ name }) => {
    const vFrom = getValue(fromData, name);
    const vTo = getValue(toData, name);
    interpolatedValues[name] = vFrom + (vTo - vFrom) * easedT;
  });

  // Determine current ranking
  const sortedNames = Object.keys(interpolatedValues).sort(
    (a, b) => interpolatedValues[b] - interpolatedValues[a]
  );
  const maxValue = Math.max(...Object.values(interpolatedValues));

  // Build rank Y positions
  const rankPositions: Record<string, number> = {};
  sortedNames.forEach((name, i) => {
    rankPositions[name] = i * ROW_HEIGHT;
  });

  // BG glow — shifts color subtly across snapshots
  const glowOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 700,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.09) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Subtle grid lines */}
      {[0.25, 0.5, 0.75, 1.0].map((frac) => {
        const x = PADDING_LEFT + frac * chartWidth * 0.88;
        const lineOpacity = interpolate(frame, [10, 30], [0, 0.08], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={frac}
            style={{
              position: "absolute",
              left: x,
              top: PADDING_TOP - 10,
              width: 1,
              height: chartHeight + 10,
              backgroundColor: "rgba(255,255,255,0.9)",
              opacity: lineOpacity,
            }}
          />
        );
      })}

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: PADDING_LEFT,
          right: PADDING_RIGHT,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Title frame={frame} />
        <PeriodLabel frame={frame} />
      </div>

      {/* Chart area */}
      <div
        style={{
          position: "absolute",
          top: PADDING_TOP,
          left: PADDING_LEFT,
          width: chartWidth,
          height: chartHeight,
        }}
      >
        {SNAPSHOTS[0].data.map(({ name }, i) => {
          const entryDelay = 15 + i * 8;
          return (
            <RacingBar
              key={name}
              name={name}
              interpolatedValue={interpolatedValues[name]}
              maxValue={maxValue}
              rankY={rankPositions[name]}
              barWidth={chartWidth}
              rowHeight={ROW_HEIGHT}
              frame={frame}
              fps={fps}
              entryDelay={entryDelay}
            />
          );
        })}
      </div>

      {/* Bottom axis line */}
      <div
        style={{
          position: "absolute",
          left: PADDING_LEFT,
          right: PADDING_RIGHT,
          bottom: PADDING_BOTTOM - 4,
          height: 1,
          backgroundColor: "rgba(255,255,255,0.1)",
          opacity: glowOpacity,
        }}
      />

      {/* Source watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          right: PADDING_RIGHT,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: "rgba(255,255,255,0.2)",
          opacity: glowOpacity,
          letterSpacing: "0.5px",
        }}
      >
        FICTIONAL DATA · STEALTHIS
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="BarRace"
    component={BarRace}
    durationInFrames={300}
    fps={30}
    width={1280}
    height={720}
  />
);
