import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const LINES = ["Design is not", "just what it looks like.", "Design is how", "it works."];
const AUTHOR = "— Steve Jobs";
const ACCENT = "#a855f7";

const RevealLine: React.FC<{ text: string; index: number; frame: number; fps: number }> = ({
  text,
  index,
  frame,
  fps,
}) => {
  const delay = 15 + index * 20;
  const f = Math.max(0, frame - delay);

  const clipX = spring({ frame: f, fps, from: 0, to: 100, config: { damping: 30, stiffness: 60 } });
  const blockX = spring({
    frame: f,
    fps,
    from: 0,
    to: 110,
    config: { damping: 30, stiffness: 60 },
  });
  const opacity = interpolate(f, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", marginBottom: 8, overflow: "hidden" }}>
      {/* Reveal block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${Math.min(blockX, 100)}%`,
          backgroundColor: ACCENT,
          zIndex: 2,
          opacity: blockX > 100 ? 0 : 1,
        }}
      />
      {/* Text */}
      <div style={{ clipPath: `inset(0 ${100 - clipX}% 0 0)`, opacity }}>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: index % 2 === 0 ? 300 : 700,
            fontSize: 52,
            color: "#ffffff",
            lineHeight: 1.3,
            letterSpacing: -1,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export const TextReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const authorDelay = 15 + LINES.length * 20 + 10;
  const authorOpacity = interpolate(Math.max(0, frame - authorDelay), [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorY = spring({
    frame: Math.max(0, frame - authorDelay),
    fps,
    from: 10,
    to: 0,
    config: { damping: 14, stiffness: 80 },
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
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)`,
          opacity: interpolate(frame, [0, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 120,
          right: 120,
          transform: "translateY(-50%)",
        }}
      >
        {LINES.map((line, i) => (
          <RevealLine key={i} text={line} index={i} frame={frame} fps={fps} />
        ))}
        <div
          style={{ opacity: authorOpacity, transform: `translateY(${authorY}px)`, marginTop: 24 }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 22,
              color: ACCENT,
            }}
          >
            {AUTHOR}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TextReveal"
      component={TextReveal}
      durationInFrames={210}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
