import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const CHART_TITLE = "Monthly Revenue";
const UNIT = "$K";
const STAGGER = 10;
const DATA = [
  { label: "Jan", value: 42, color: "#6366f1" },
  { label: "Feb", value: 78, color: "#8b5cf6" },
  { label: "Mar", value: 55, color: "#06b6d4" },
  { label: "Apr", value: 91, color: "#10b981" },
  { label: "May", value: 67, color: "#f59e0b" },
  { label: "Jun", value: 84, color: "#ef4444" },
];
const MAX_VALUE = Math.max(...DATA.map((d) => d.value));

const Bar: React.FC<{
  datum: (typeof DATA)[number];
  index: number;
  frame: number;
  fps: number;
  chartHeight: number;
}> = ({ datum, index, frame, fps, chartHeight }) => {
  const f = Math.max(0, frame - (20 + index * STAGGER));
  const heightPct = spring({
    frame: f,
    fps,
    from: 0,
    to: datum.value / MAX_VALUE,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });
  const barHeight = heightPct * chartHeight * 0.85;
  const displayValue = Math.round(
    interpolate(f, [0, 30], [0, datum.value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );
  const labelOpacity = interpolate(f, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 8 }}
    >
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 16,
          color: datum.color,
          height: 24,
          display: "flex",
          alignItems: "center",
        }}
      >
        {displayValue}
        {UNIT}
      </div>
      <div
        style={{
          width: "60%",
          height: barHeight,
          backgroundColor: datum.color,
          borderRadius: "4px 4px 0 0",
          alignSelf: "flex-end",
          boxShadow: `0 0 20px ${datum.color}60`,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
          opacity: labelOpacity,
        }}
      >
        {datum.label}
      </div>
    </div>
  );
};

export const ChartBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const PADDING = { top: 80, right: 80, bottom: 80, left: 80 };
  const chartHeight = height - PADDING.top - PADDING.bottom - 60;
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const axisOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 600,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: PADDING.top,
          left: PADDING.left,
          right: PADDING.right,
          bottom: PADDING.bottom,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color: "#ffffff",
            marginBottom: 20,
          }}
        >
          {CHART_TITLE}
        </div>
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              position: "absolute",
              left: -24,
              top: 0,
              bottom: 48,
              width: 1,
              backgroundColor: "rgba(255,255,255,0.15)",
              opacity: axisOpacity,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -24,
              right: 0,
              bottom: 47,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.15)",
              opacity: axisOpacity,
            }}
          />
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
            {DATA.map((datum, i) => (
              <Bar
                key={datum.label}
                datum={datum}
                index={i}
                frame={frame}
                fps={fps}
                chartHeight={chartHeight}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
