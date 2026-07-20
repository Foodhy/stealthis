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

// ── Config ────────────────────────────────────────────────────────────
const BG_COLOR = "#0a0a0f";
const CARD_STAGGER = 20; // frames between each card slide-up
const TITLE_IN_FRAMES = [0, 25];
const SUBTITLE_IN_FRAMES = [10, 30];

interface KpiMetric {
  id: string;
  label: string;
  rawValue: number;
  displayValue: string;
  formatFn: (n: number) => string;
  delta: string;
  deltaPositive: boolean;
  icon: string;
  accentColor: string;
  glowColor: string;
}

const METRICS: KpiMetric[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    rawValue: 1240000,
    displayValue: "$1.24M",
    formatFn: (n: number) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
      if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
      return `$${Math.round(n)}`;
    },
    delta: "+12.4% vs last quarter",
    deltaPositive: true,
    icon: "◈",
    accentColor: "#6366f1",
    glowColor: "rgba(99,102,241,0.18)",
  },
  {
    id: "users",
    label: "Active Users",
    rawValue: 48291,
    displayValue: "48,291",
    formatFn: (n: number) => Math.floor(n).toLocaleString("en-US"),
    delta: "+8.7% vs last quarter",
    deltaPositive: true,
    icon: "◉",
    accentColor: "#06b6d4",
    glowColor: "rgba(6,182,212,0.18)",
  },
  {
    id: "conversion",
    label: "Conversion Rate",
    rawValue: 3.8,
    displayValue: "3.8%",
    formatFn: (n: number) => `${n.toFixed(1)}%`,
    delta: "−0.3% vs last quarter",
    deltaPositive: false,
    icon: "◎",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.18)",
  },
  {
    id: "aov",
    label: "Avg Order Value",
    rawValue: 84,
    displayValue: "$84",
    formatFn: (n: number) => `$${Math.floor(n)}`,
    delta: "+5.1% vs last quarter",
    deltaPositive: true,
    icon: "◇",
    accentColor: "#f59e0b",
    glowColor: "rgba(245,158,11,0.18)",
  },
];

// ── Section title ─────────────────────────────────────────────────────
const SectionTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, TITLE_IN_FRAMES, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const titleY = interpolate(frame, TITLE_IN_FRAMES, [-14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const subtitleOpacity = interpolate(frame, SUBTITLE_IN_FRAMES, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 40,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 38,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Q4 Performance
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          color: "rgba(255,255,255,0.45)",
          marginTop: 8,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        October — December 2025
      </div>
    </div>
  );
};

// ── Delta badge ───────────────────────────────────────────────────────
const DeltaBadge: React.FC<{
  text: string;
  positive: boolean;
  opacity: number;
}> = ({ text, positive, opacity }) => {
  const bg = positive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)";
  const color = positive ? "#10b981" : "#ef4444";
  const arrow = positive ? "↑" : "↓";

  return (
    <div
      style={{
        opacity,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        backgroundColor: bg,
        borderRadius: 6,
        padding: "4px 10px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 600,
        fontSize: 13,
        color,
        marginTop: 10,
        letterSpacing: "0.01em",
      }}
    >
      <span style={{ fontSize: 11 }}>{arrow}</span>
      {text}
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  metric: KpiMetric;
  index: number;
  frame: number;
  fps: number;
}> = ({ metric, index, frame, fps }) => {
  const delay = 30 + index * CARD_STAGGER;
  const localFrame = Math.max(0, frame - delay);

  // Card slide-up with spring
  const slideProgress = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 16, stiffness: 120, mass: 0.8 },
  });

  const translateY = interpolate(slideProgress, [0, 1], [60, 0]);
  const cardOpacity = interpolate(slideProgress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Value count-up
  const countProgress = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 80, mass: 1.0 },
  });
  const currentValue = countProgress * metric.rawValue;
  const displayValue = metric.formatFn(currentValue);

  // Delta badge fades in after count is nearly done
  const deltaBadgeDelay = delay + 55;
  const deltaOpacity = interpolate(
    frame,
    [deltaBadgeDelay, deltaBadgeDelay + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  // Icon pulse scale
  const iconPulse = spring({
    frame: localFrame,
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });

  return (
    <div
      style={{
        flex: "1 1 0",
        opacity: cardOpacity,
        transform: `translateY(${translateY}px)`,
        position: "relative",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: `4px solid ${metric.accentColor}`,
        padding: "28px 28px 24px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 200,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: -20,
          width: 180,
          height: 180,
          borderRadius: "50%",
          backgroundColor: metric.glowColor,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Top row: icon + label */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {metric.label}
        </span>
        <span
          style={{
            fontSize: 26,
            color: metric.accentColor,
            transform: `scale(${iconPulse})`,
            display: "inline-block",
            lineHeight: 1,
            opacity: 0.9,
          }}
        >
          {metric.icon}
        </span>
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 46,
          color: "#ffffff",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          position: "relative",
          marginTop: 14,
        }}
      >
        {displayValue}
      </div>

      {/* Delta badge */}
      <DeltaBadge
        text={metric.delta}
        positive={metric.deltaPositive}
        opacity={deltaOpacity}
      />
    </div>
  );
};

// ── Background decoration ─────────────────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = interpolate(
    Math.sin((frame / 150) * Math.PI * 2),
    [-1, 1],
    [0.6, 1.0]
  );

  return (
    <>
      {/* Top-left glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: pulse,
          pointerEvents: "none",
        }}
      />
      {/* Bottom-right glow */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
          opacity: pulse * 0.9,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const KpiCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch",
        padding: "48px 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundGlow frame={frame} />

      {/* Subtle grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Section title */}
      <SectionTitle frame={frame} />

      {/* Cards row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
          position: "relative",
        }}
      >
        {METRICS.map((metric, i) => (
          <KpiCard
            key={metric.id}
            metric={metric}
            index={i}
            frame={frame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="KpiCards"
    component={KpiCards}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
