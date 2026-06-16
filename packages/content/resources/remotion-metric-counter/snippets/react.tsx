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
const ACCENT_COLOR = "#6366f1";   // indigo — accent for suffix/prefix
const VALUE_COLOR = "#ffffff";
const MUTED = "rgba(255,255,255,0.45)";

// ── Metric data ───────────────────────────────────────────────────────
const METRIC = {
  target: 1_000_000,
  prefix: "",
  suffix: "M",
  // Display unit divisor — we animate to 1 and show "1.0 M" or count raw
  label: "Total Signups",
  subLabel: "as of June 2026",
};

// ── Helpers ───────────────────────────────────────────────────────────
function formatLargeNumber(raw: number): { integer: string; decimal: string } {
  // Express raw value in millions with one decimal
  const millions = raw / 1_000_000;
  const [int, dec] = millions.toFixed(1).split(".");
  return {
    integer: Number(int).toLocaleString("en-US"),
    decimal: dec ?? "0",
  };
}

// ── Decorative line that draws in from a side ─────────────────────────
const DrawLine: React.FC<{
  frame: number;
  fps: number;
  side: "left" | "right";
  delay: number;
  color: string;
  y: number;
}> = ({ frame, fps, side, delay, color, y }) => {
  const f = Math.max(0, frame - delay);

  const lineWidth = spring({
    frame: f,
    fps,
    from: 0,
    to: 220,
    config: { damping: 18, stiffness: 80 },
  });

  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotScale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        [side]: 80,
        display: "flex",
        alignItems: "center",
        flexDirection: side === "left" ? "row" : "row-reverse",
        gap: 6,
        opacity,
      }}
    >
      {/* Dot terminus */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
          transform: `scale(${dotScale})`,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {/* Line body */}
      <div
        style={{
          width: lineWidth,
          height: 1.5,
          background: `linear-gradient(${side === "left" ? "to right" : "to left"}, ${color}cc, ${color}22)`,
          borderRadius: 1,
        }}
      />
      {/* Short tick at the open end */}
      <div
        style={{
          width: 1.5,
          height: 10,
          backgroundColor: `${color}55`,
          flexShrink: 0,
          borderRadius: 1,
        }}
      />
    </div>
  );
};

// ── Pulsing radial glow ───────────────────────────────────────────────
const RadialGlow: React.FC<{ frame: number; color: string }> = ({ frame, color }) => {
  // Slow pulse using a sin-wave derived from frame
  const pulse = Math.sin((frame / 120) * Math.PI * 2) * 0.5 + 0.5; // 0..1 over full 4s
  const outerAlpha = (0.06 + pulse * 0.06).toFixed(3);
  const innerAlpha = (0.14 + pulse * 0.10).toFixed(3);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 800,
        height: 400,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(ellipse at center, ${color}${Math.round(Number(innerAlpha) * 255).toString(16).padStart(2, "0")} 0%, ${color}${Math.round(Number(outerAlpha) * 255).toString(16).padStart(2, "0")} 40%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Secondary stat chips ──────────────────────────────────────────────
interface StatChip {
  label: string;
  value: string;
  color: string;
}

const CHIPS: StatChip[] = [
  { label: "MoM Growth", value: "+23%", color: "#10b981" },
  { label: "Churn Rate",  value: "1.4%",  color: "#f59e0b" },
  { label: "Paying Users", value: "312K",  color: "#06b6d4" },
];

const Chip: React.FC<{ chip: StatChip; index: number; frame: number; fps: number }> = ({
  chip,
  index,
  frame,
  fps,
}) => {
  const delay = 60 + index * 10;
  const f = Math.max(0, frame - delay);

  const y = spring({ frame: f, fps, from: 16, to: 0, config: { damping: 14, stiffness: 100 } });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "10px 20px",
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.07)`,
        transform: `translateY(${y}px)`,
        opacity,
        minWidth: 110,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          color: chip.color,
          letterSpacing: -0.5,
        }}
      >
        {chip.value}
      </span>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 11,
          color: MUTED,
          letterSpacing: 1.5,
          textTransform: "uppercase" as const,
        }}
      >
        {chip.label}
      </span>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const MetricCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Counter progress ──────────────────────────────────────────────
  const countProgress = interpolate(frame, [0, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const rawValue = countProgress * METRIC.target;
  const { integer, decimal } = formatLargeNumber(rawValue);

  // ── Number reveal spring ──────────────────────────────────────────
  const numScale = spring({
    frame,
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 18, stiffness: 80 },
  });
  const numOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Label / sub-label fades ───────────────────────────────────────
  const labelOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subLabelOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelY = spring({
    frame: Math.max(0, frame - 15),
    fps,
    from: 10,
    to: 0,
    config: { damping: 16, stiffness: 90 },
  });

  // ── Separator line under number ───────────────────────────────────
  const sepWidth = spring({
    frame: Math.max(0, frame - 30),
    fps,
    from: 0,
    to: 280,
    config: { damping: 16, stiffness: 70 },
  });

  // Center Y for decorative flanking lines (relative to 720px height)
  const centerY = 720 / 2 - 40;

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>
      {/* Radial glow */}
      <RadialGlow frame={frame} color={ACCENT_COLOR} />

      {/* Subtle grid lines (purely decorative) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Flanking decorative lines — left */}
      <DrawLine frame={frame} fps={fps} side="left" delay={20} color={ACCENT_COLOR} y={centerY} />

      {/* Flanking decorative lines — right */}
      <DrawLine frame={frame} fps={fps} side="right" delay={20} color={ACCENT_COLOR} y={centerY} />

      {/* Hero number block */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, calc(-50% - 40px)) scale(${numScale})`,
          textAlign: "center",
          opacity: numOpacity,
          zIndex: 2,
        }}
      >
        {/* Big number row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {/* Prefix (empty for this metric, but wired up) */}
          {METRIC.prefix ? (
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 700,
                fontSize: 80,
                color: ACCENT_COLOR,
                letterSpacing: -4,
                lineHeight: 1,
              }}
            >
              {METRIC.prefix}
            </span>
          ) : null}

          {/* Integer portion */}
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 200,
              color: VALUE_COLOR,
              letterSpacing: -12,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {integer}
          </span>

          {/* Decimal dot + digit */}
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 200,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: -10,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            .{decimal}
          </span>

          {/* Suffix */}
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 120,
              color: ACCENT_COLOR,
              letterSpacing: -4,
              lineHeight: 1,
              marginLeft: 4,
              textShadow: `0 0 40px ${ACCENT_COLOR}88`,
            }}
          >
            {METRIC.suffix}
          </span>
        </div>

        {/* Separator */}
        <div
          style={{
            margin: "0 auto",
            marginTop: 12,
            height: 1,
            width: sepWidth,
            background: `linear-gradient(to right, transparent, ${ACCENT_COLOR}88, transparent)`,
            borderRadius: 1,
          }}
        />

        {/* Label */}
        <div
          style={{
            marginTop: 20,
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 28,
              color: VALUE_COLOR,
              letterSpacing: 6,
              textTransform: "uppercase" as const,
            }}
          >
            {METRIC.label}
          </div>
        </div>

        {/* Sub-label */}
        <div
          style={{
            marginTop: 10,
            opacity: subLabelOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 15,
              color: MUTED,
              letterSpacing: 2,
            }}
          >
            {METRIC.subLabel}
          </div>
        </div>
      </div>

      {/* Supporting stat chips */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 16,
          zIndex: 2,
        }}
      >
        {CHIPS.map((chip, i) => (
          <Chip key={chip.label} chip={chip} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="MetricCounter"
    component={MetricCounter}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
