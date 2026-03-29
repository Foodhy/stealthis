import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WORDS = ["Build", "Something", "People", "Actually", "Want"];
const ACCENT = "#f59e0b";
const STAGGER = 8;

const Word: React.FC<{
  word: string;
  index: number;
  frame: number;
  fps: number;
  total: number;
}> = ({ word, index, frame, fps, total }) => {
  const enter = Math.max(0, frame - index * STAGGER);
  const y = spring({
    frame: enter,
    fps,
    from: 80,
    to: 0,
    config: { damping: 12, stiffness: 120 },
  });
  const opacity = interpolate(enter, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({
    frame: enter,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 14, stiffness: 100 },
  });

  // Exit
  const exitStart = 90 + index * 4;
  const exitOpacity = interpolate(frame, [exitStart, exitStart + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(frame, [exitStart, exitStart + 15], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isLast = index === total - 1;

  return (
    <div
      style={{
        display: "inline-block",
        margin: "0 12px",
        opacity: opacity * exitOpacity,
        transform: `translateY(${y + exitY}px) scale(${scale})`,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 80,
          color: isLast ? ACCENT : "#ffffff",
          letterSpacing: -2,
        }}
      >
        {word}
      </span>
    </div>
  );
};

export const KineticText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}15 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: bgOpacity,
        }}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: 1000,
          padding: 40,
        }}
      >
        {WORDS.map((word, i) => (
          <Word key={i} word={word} index={i} frame={frame} fps={fps} total={WORDS.length} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="KineticText"
    component={KineticText}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
