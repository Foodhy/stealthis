import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";

const WAVE_COUNT = 5;
const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
const TITLE = "Gradient Wave";
const SUBTITLE = "Abstract motion background";

function wave(
  x: number,
  time: number,
  amplitude: number,
  frequency: number,
  phase: number
): number {
  return amplitude * Math.sin(frequency * x + time + phase);
}

const WaveLayer: React.FC<{ index: number; frame: number; width: number; height: number }> = ({
  index,
  frame,
  width,
  height,
}) => {
  const time = frame * 0.04;
  const baseY = height * 0.45 + index * 40;
  const color = COLORS[index % COLORS.length];
  const opacity = 0.15 + index * 0.05;

  const points: string[] = [];
  const steps = 80;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const normalizedX = i / steps;
    const y =
      baseY +
      wave(normalizedX * Math.PI * 2, time + index * 0.8, 30 + index * 10, 2, index * 1.2) +
      wave(normalizedX * Math.PI * 4, time * 1.3 + index * 0.5, 15, 3, index * 0.7);
    points.push(`${x},${y}`);
  }

  // Close path at bottom
  const d = `M${points[0]} ${points.map((p) => `L${p}`).join(" ")} L${width},${height} L0,${height} Z`;

  return <path d={d} fill={color} opacity={opacity} />;
};

export const GradientWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Overlay fades in
  const overlayOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a14" }}>
      {/* Waves */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, opacity: overlayOpacity }}
      >
        {Array.from({ length: WAVE_COUNT }).map((_, i) => (
          <WaveLayer key={i} index={i} frame={frame} width={width} height={height} />
        ))}
      </svg>

      {/* Top gradient overlay for text readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60%",
          background: "linear-gradient(180deg, #0a0a14 30%, transparent 100%)",
        }}
      />

      {/* Title */}
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: "#ffffff",
              letterSpacing: -2,
              background: `linear-gradient(135deg, ${COLORS[0]}, ${COLORS[4]})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {TITLE}
          </span>
        </div>
        <div style={{ opacity: subtitleOpacity, marginTop: 12 }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {SUBTITLE}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
