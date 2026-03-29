import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const PRODUCT_NAME = "AppFlow";
const TAGLINE = "Ship faster. Build smarter.";
const FEATURES = [
  { icon: "⚡", title: "Lightning Fast", desc: "Sub-second builds" },
  { icon: "🔒", title: "Secure by Default", desc: "Zero-trust architecture" },
  { icon: "🔄", title: "Auto Scaling", desc: "Handle any traffic spike" },
  { icon: "📊", title: "Real-time Analytics", desc: "Insights that matter" },
];
const ACCENT = "#06b6d4";

const FeatureCard: React.FC<{
  feature: (typeof FEATURES)[number];
  index: number;
  frame: number;
  fps: number;
}> = ({ feature, index, frame, fps }) => {
  const delay = 40 + index * 15;
  const f = Math.max(0, frame - delay);
  const scale = spring({
    frame: f,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 14, stiffness: 120 },
  });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = spring({ frame: f, fps, from: 30, to: 0, config: { damping: 16, stiffness: 100 } });

  return (
    <div
      style={{
        flex: 1,
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        padding: 20,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 4 }}>{feature.icon}</div>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#ffffff",
        }}
      >
        {feature.title}
      </div>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {feature.desc}
      </div>
    </div>
  );
};

export const ProductShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 16, stiffness: 100 },
  });
  const taglineOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = spring({
    frame: Math.max(0, frame - 15),
    fps,
    from: 15,
    to: 0,
    config: { damping: 14, stiffness: 80 },
  });

  // Subtle background pulse
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Fade out
  const fadeOut = interpolate(frame, [170, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f", opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}30 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity,
        }}
      />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ opacity: titleOpacity, transform: `scale(${titleScale})` }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: "#ffffff",
              letterSpacing: -2,
            }}
          >
            {PRODUCT_NAME}
          </span>
        </div>
        <div
          style={{ opacity: taglineOpacity, transform: `translateY(${taglineY}px)`, marginTop: 12 }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 24,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {TAGLINE}
          </span>
        </div>
      </div>

      <div
        style={{ position: "absolute", bottom: 80, left: 60, right: 60, display: "flex", gap: 16 }}
      >
        {FEATURES.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
