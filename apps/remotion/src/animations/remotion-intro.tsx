import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const CHANNEL_NAME = "My Channel";
const TAGLINE = "Design · Code · Create";
const BRAND_COLOR = "#6366f1";

const AccentBar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scaleX = spring({ frame, fps, from: 0, to: 1, config: { damping: 200, stiffness: 80 } });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 220,
        left: 120,
        width: 520,
        height: 4,
        backgroundColor: BRAND_COLOR,
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
        borderRadius: 2,
      }}
    />
  );
};

const Title: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 8);
  const translateX = spring({
    frame: f,
    fps,
    from: -80,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 240,
        left: 120,
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 72,
          color: "#ffffff",
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        {CHANNEL_NAME}
      </div>
    </div>
  );
};

const Subtitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 20);
  const opacity = interpolate(f, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame: f,
    fps,
    from: 12,
    to: 0,
    config: { damping: 14, stiffness: 80 },
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 185,
        left: 122,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 24,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {TAGLINE}
      </div>
    </div>
  );
};

export const YoutubeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f", opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND_COLOR} 0%, transparent 70%)`,
          opacity: interpolate(frame, [0, 30], [0, 0.35], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }),
          pointerEvents: "none",
        }}
      />
      <AccentBar frame={frame} fps={fps} />
      <Title frame={frame} fps={fps} />
      <Subtitle frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
