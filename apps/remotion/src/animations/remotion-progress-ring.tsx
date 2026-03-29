import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const RINGS = [
  { label: "Performance", value: 92, color: "#6366f1", delay: 10 },
  { label: "Accessibility", value: 88, color: "#10b981", delay: 20 },
  { label: "Best Practices", value: 95, color: "#f59e0b", delay: 30 },
  { label: "SEO", value: 100, color: "#ef4444", delay: 40 },
];

const RING_SIZE = 130;
const STROKE_WIDTH = 10;

const ProgressRing: React.FC<{ ring: (typeof RINGS)[number]; frame: number; fps: number }> = ({
  ring,
  frame,
  fps,
}) => {
  const f = Math.max(0, frame - ring.delay);
  const progress = spring({
    frame: f,
    fps,
    from: 0,
    to: ring.value / 100,
    config: { damping: 20, stiffness: 50 },
  });
  const opacity = interpolate(f, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({
    frame: f,
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 12, stiffness: 100 },
  });

  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const displayValue = Math.round(progress * 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            fill="none"
            stroke={ring.color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 8px ${ring.color}60)` }}
          />
        </svg>
        {/* Value text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: "#ffffff",
            }}
          >
            {displayValue}
          </span>
        </div>
      </div>
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "rgba(255,255,255,0.6)",
          textAlign: "center",
        }}
      >
        {ring.label}
      </span>
    </div>
  );
};

export const ProgressRingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({ frame, fps, from: -20, to: 0, config: { damping: 14, stiffness: 80 } });

  const subtitleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowOpacity = interpolate(frame, [0, 30], [0, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 1000,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity,
        }}
      />

      {/* Title */}
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 42,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            Lighthouse Score
          </span>
        </div>
        <div style={{ opacity: subtitleOpacity, marginTop: 8 }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 18,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            stealthis.dev — Performance Audit
          </span>
        </div>
      </div>

      {/* Rings */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -30%)",
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
        }}
      >
        {RINGS.map((ring) => (
          <ProgressRing key={ring.label} ring={ring} frame={frame} fps={fps} />
        ))}
      </div>

      {/* Bottom badge */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 20,
            backgroundColor: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#6366f1",
            }}
          >
            All scores above 85 — Great job!
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
