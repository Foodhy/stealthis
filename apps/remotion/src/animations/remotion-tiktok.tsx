import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const USERNAME = "@creator";
const CAPTION_WORDS = ["Watch", "this", "crazy", "trick", "that", "will", "blow", "your", "mind!"];
const DURATION = 450;

const VideoProgress: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = interpolate(frame, [0, DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "rgba(255,255,255,0.25)",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.8)",
        }}
      />
    </div>
  );
};

const ActionIcon: React.FC<{
  frame: number;
  fps: number;
  emoji: string;
  count: string;
  delay: number;
  offsetY: number;
}> = ({ frame, fps, emoji, count, delay, offsetY }) => {
  const f = Math.max(0, frame - delay);
  const translateX = spring({
    frame: f,
    fps,
    from: 60,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });
  const opacity = interpolate(f, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        bottom: offsetY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#ffffff",
        }}
      >
        {count}
      </div>
    </div>
  );
};

const BottomCaption: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", bottom: 80, left: 16, right: 90, opacity }}>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#ffffff",
          marginBottom: 8,
        }}
      >
        {USERNAME}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0 6px" }}>
        {CAPTION_WORDS.map((word, i) => {
          const wordOpacity = interpolate(Math.max(0, frame - (15 + i * 8)), [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={i}
              style={{
                opacity: wordOpacity,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: "#ffffff",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
          color: "rgba(255,255,255,0.7)",
          marginTop: 10,
        }}
      >
        ♪ Original Sound · Creator
      </div>
    </div>
  );
};

export const TiktokVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,0.15)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Video Content
        </div>
      </div>
      <ActionIcon frame={frame} fps={fps} emoji="❤️" count="124K" delay={20} offsetY={340} />
      <ActionIcon frame={frame} fps={fps} emoji="💬" count="3.4K" delay={30} offsetY={240} />
      <ActionIcon frame={frame} fps={fps} emoji="↗️" count="Share" delay={40} offsetY={150} />
      <BottomCaption frame={frame} fps={fps} />
      <VideoProgress frame={frame} />
    </AbsoluteFill>
  );
};
