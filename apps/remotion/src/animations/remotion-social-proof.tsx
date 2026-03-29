import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const TITLE = "Trusted by thousands";
const STATS = [
  { value: 12500, suffix: "+", label: "Active Users", icon: "👥" },
  { value: 99.9, suffix: "%", label: "Uptime", icon: "⚡" },
  { value: 4.8, suffix: "/5", label: "Rating", icon: "⭐" },
  { value: 150, suffix: "+", label: "Countries", icon: "🌍" },
];
const ACCENT = "#6366f1";

const StatCard: React.FC<{
  stat: (typeof STATS)[number];
  index: number;
  frame: number;
  fps: number;
}> = ({ stat, index, frame, fps }) => {
  const delay = 25 + index * 12;
  const f = Math.max(0, frame - delay);
  const scale = spring({
    frame: f,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 12, stiffness: 120 },
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = spring({ frame: f, fps, from: 40, to: 0, config: { damping: 14, stiffness: 100 } });

  // Animate counter
  const countProgress = interpolate(f, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const displayValue =
    stat.value >= 100
      ? Math.round(countProgress * stat.value).toLocaleString()
      : (countProgress * stat.value).toFixed(stat.value % 1 === 0 ? 0 : 1);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: 24,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 4 }}>{stat.icon}</div>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 40,
          color: "#ffffff",
          letterSpacing: -1,
        }}
      >
        {displayValue}
        {stat.suffix}
      </div>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 15,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        {stat.label}
      </div>
    </div>
  );
};

export const SocialProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = spring({
    frame,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 16, stiffness: 100 },
  });

  const fadeOut = interpolate(frame, [170, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f", opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${ACCENT}10 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 48,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          {TITLE}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 60,
          right: 60,
          transform: "translateY(-20%)",
          display: "flex",
          gap: 16,
        }}
      >
        {STATS.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
