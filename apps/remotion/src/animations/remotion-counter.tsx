import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

const TARGET = 10000;
const PREFIX = "";
const SUFFIX = "+";
const LABEL = "Total Users";
const COLOR = "#6366f1";
const DURATION = 120;

export const AnimatedCounter: React.FC = () => {
  const frame = useCurrentFrame();

  const rawProgress = interpolate(frame, [0, DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const currentValue = rawProgress * TARGET;
  const displayStr = `${PREFIX}${Math.floor(currentValue).toLocaleString("en-US")}${SUFFIX}`;

  const labelOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const numOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const circumference = 2 * Math.PI * 140;
  const dashOffset = circumference * (1 - rawProgress);

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
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${COLOR}18 0%, transparent 70%)`,
        }}
      />

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
        <circle
          cx={160}
          cy={160}
          r={140}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
        <circle
          cx={160}
          cy={160}
          r={140}
          fill="none"
          stroke={COLOR}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 160 160)"
          style={{ filter: `drop-shadow(0 0 8px ${COLOR})` }}
        />
      </svg>

      <div style={{ position: "relative", zIndex: 1, opacity: numOpacity, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
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
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {LABEL}
        </div>
      </div>
    </AbsoluteFill>
  );
};
