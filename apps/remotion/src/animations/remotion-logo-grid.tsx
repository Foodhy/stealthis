import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const TITLE = "Trusted by industry leaders";
const LOGOS = [
  { name: "Acme", letter: "A", color: "#6366f1" },
  { name: "Globex", letter: "G", color: "#8b5cf6" },
  { name: "Initech", letter: "I", color: "#06b6d4" },
  { name: "Hooli", letter: "H", color: "#10b981" },
  { name: "Massive", letter: "M", color: "#f59e0b" },
  { name: "Umbrella", letter: "U", color: "#ef4444" },
  { name: "Stark", letter: "S", color: "#ec4899" },
  { name: "Wayne", letter: "W", color: "#14b8a6" },
];

const LogoItem: React.FC<{
  logo: (typeof LOGOS)[number];
  index: number;
  frame: number;
  fps: number;
}> = ({ logo, index, frame, fps }) => {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const delay = 20 + (row * 4 + col) * 6;
  const f = Math.max(0, frame - delay);

  const opacity = interpolate(f, [0, 15], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({
    frame: f,
    fps,
    from: 0.3,
    to: 1,
    config: { damping: 12, stiffness: 120 },
  });

  // Hover-like pulse
  const pulse = interpolate(Math.sin((frame + index * 20) * 0.05), [-1, 1], [0.95, 1.05]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity,
        transform: `scale(${scale * pulse})`,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          backgroundColor: `${logo.color}15`,
          border: `1px solid ${logo.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 36,
            color: logo.color,
          }}
        >
          {logo.letter}
        </span>
      </div>
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        {logo.name}
      </span>
    </div>
  );
};

export const LogoGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({ frame, fps, from: -20, to: 0, config: { damping: 14, stiffness: 80 } });

  const lineWidth = spring({
    frame: Math.max(0, frame - 10),
    fps,
    from: 0,
    to: 100,
    config: { damping: 30, stiffness: 60 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 36,
            color: "#ffffff",
          }}
        >
          {TITLE}
        </span>
        <div
          style={{
            margin: "16px auto 0",
            width: `${lineWidth}px`,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 1,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -30%)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 140px)",
          gap: "40px 48px",
          justifyItems: "center",
        }}
      >
        {LOGOS.map((logo, i) => (
          <LogoItem key={i} logo={logo} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
