import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Props ─────────────────────────────────────────────────────────────
interface CounterProps {
  target?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  color?: string;
}

const defaultProps: Required<CounterProps> = {
  target: 10000,
  prefix: "",
  suffix: "+",
  label: "Total Users",
  color: "#6366f1",
};

// ── Format number with commas ─────────────────────────────────────────
function formatNumber(n: number): string {
  return Math.floor(n).toLocaleString("en-US");
}

// ── Tick marks ───────────────────────────────────────────────────────
const TickMarks: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const count = 8;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 340,
        height: 340,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const tickProgress = Math.min(1, progress * count - i);
        const opacity = Math.max(0, tickProgress) * 0.3;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 2,
              height: 16,
              marginLeft: -1,
              marginTop: -170,
              backgroundColor: color,
              opacity,
              transformOrigin: "bottom center",
              transform: `rotate(${angle}deg) translateY(154px)`,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const AnimatedCounter: React.FC<CounterProps> = (inputProps) => {
  const props = { ...defaultProps, ...inputProps };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DURATION = 120; // 4 seconds
  const EASE_OUT_START = 80;

  // Eased count: fast start, slows near the end
  const rawProgress = interpolate(frame, [0, DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const currentValue = rawProgress * props.target;

  // Display string
  const displayStr = `${props.prefix}${formatNumber(currentValue)}${props.suffix}`;

  // Label
  const labelOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Accent ring progress
  const ringProgress = interpolate(frame, [0, DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const circumference = 2 * Math.PI * 140;
  const dashOffset = circumference * (1 - ringProgress);

  // Number scale — subtle spring-in
  const numOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${props.color}18 0%, transparent 70%)`,
        }}
      />

      {/* SVG ring */}
      <svg
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        width={320}
        height={320}
        viewBox="0 0 320 320"
      >
        {/* Track */}
        <circle
          cx={160}
          cy={160}
          r={140}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
        {/* Progress */}
        <circle
          cx={160}
          cy={160}
          r={140}
          fill="none"
          stroke={props.color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 160 160)"
          style={{ filter: `drop-shadow(0 0 8px ${props.color})` }}
        />
      </svg>

      <TickMarks progress={ringProgress} color={props.color} />

      {/* Number */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: numOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 80,
            color: "#ffffff",
            letterSpacing: -4,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayStr}
        </div>

        <div
          style={{
            marginTop: 12,
            opacity: labelOpacity,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {props.label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="AnimatedCounter"
    component={AnimatedCounter}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
    defaultProps={defaultProps}
  />
);
