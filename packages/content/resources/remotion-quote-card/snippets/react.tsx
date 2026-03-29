import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const QUOTE = "The best way to predict the future is to invent it.";
const AUTHOR = "Alan Kay";
const ROLE = "Computer Scientist";
const ACCENT = "#f59e0b";

export const QuoteCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardScale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 16, stiffness: 80 },
  });
  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Quote mark
  const quoteMarkOpacity = interpolate(frame, [5, 20], [0, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const quoteMarkScale = spring({
    frame: Math.max(0, frame - 5),
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 14, stiffness: 80 },
  });

  // Quote text - word by word
  const words = QUOTE.split(" ");

  // Author
  const authorDelay = 20 + words.length * 4;
  const authorOpacity = interpolate(Math.max(0, frame - authorDelay), [0, 15], [0, 1], {
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

  // Accent line
  const lineWidth = spring({
    frame: Math.max(0, frame - 10),
    fps,
    from: 0,
    to: 80,
    config: { damping: 20, stiffness: 60 },
  });

  // Background glow
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Fade out
  const fadeOut = interpolate(frame, [140, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f", opacity: fadeOut }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${ACCENT}20 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${cardScale})`,
          width: 800,
          opacity: cardOpacity,
        }}
      >
        {/* Giant quote mark */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: -20,
            opacity: quoteMarkOpacity,
            transform: `scale(${quoteMarkScale})`,
          }}
        >
          <span
            style={{ fontFamily: "Georgia, serif", fontSize: 240, color: ACCENT, lineHeight: 1 }}
          >
            &ldquo;
          </span>
        </div>

        {/* Quote text */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "0 10px",
          }}
        >
          {words.map((word, i) => {
            const wordOpacity = interpolate(Math.max(0, frame - (12 + i * 4)), [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const wordY = spring({
              frame: Math.max(0, frame - (12 + i * 4)),
              fps,
              from: 15,
              to: 0,
              config: { damping: 14, stiffness: 120 },
            });
            return (
              <span
                key={i}
                style={{
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  fontFamily: "Georgia, serif",
                  fontWeight: 400,
                  fontSize: 44,
                  color: "#ffffff",
                  lineHeight: 1.4,
                  fontStyle: "italic",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: ACCENT,
            borderRadius: 2,
            marginTop: 32,
            marginBottom: 24,
          }}
        />

        {/* Author */}
        <div style={{ opacity: authorOpacity, transform: `translateY(${authorY}px)` }}>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: ACCENT,
            }}
          >
            {AUTHOR}
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
            }}
          >
            {ROLE}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="QuoteCard"
      component={QuoteCard}
      durationInFrames={180}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
