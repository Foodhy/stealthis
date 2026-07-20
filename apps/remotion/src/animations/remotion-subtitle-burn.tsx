import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const CONFIG = {
  speaker: "ALEX RIVERA",
  subtitles: [
    {
      startFrame: 30,
      endFrame: 150,
      text: "Welcome back to the channel.\nToday we're diving into something big.",
    },
    {
      startFrame: 180,
      endFrame: 300,
      text: "Three months ago, I made a decision\nthat changed everything.",
    },
    {
      startFrame: 330,
      endFrame: 420,
      text: "And I'm finally ready to share it with you.",
    },
  ],
  fadeFrames: 10,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  fontSize: 36,
  letterSpacing: "0.5px",
  pillColor: "rgba(10, 10, 20, 0.72)",
  pillBorderRadius: 14,
  textColor: "#ffffff",
  badgeColor: "rgba(255, 255, 255, 0.9)",
  badgeAccentColor: "#6c8eff",
  backgroundGradientTop: "#0b0f2a",
  backgroundGradientBottom: "#030508",
};

// ─── BACKGROUND ──────────────────────────────────────────────────────────────

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(170deg, ${CONFIG.backgroundGradientTop} 0%, ${CONFIG.backgroundGradientBottom} 100%)`,
    }}
  />
);

// ─── SPEAKER BADGE ───────────────────────────────────────────────────────────

const SpeakerBadge: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 52,
      left: 64,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <span
      style={{
        fontFamily: CONFIG.fontFamily,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "2.5px",
        textTransform: "uppercase" as const,
        color: CONFIG.badgeColor,
        lineHeight: 1,
      }}
    >
      {CONFIG.speaker}
    </span>
    <div
      style={{
        height: 2,
        width: 48,
        borderRadius: 2,
        backgroundColor: CONFIG.badgeAccentColor,
      }}
    />
  </div>
);

// ─── SUBTITLE SEGMENT ────────────────────────────────────────────────────────

interface SubtitleSegmentProps {
  text: string;
  durationInFrames: number;
}

const SubtitleSegment: React.FC<SubtitleSegmentProps> = ({
  text,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, CONFIG.fadeFrames, durationInFrames - CONFIG.fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    frame,
    [0, CONFIG.fadeFrames],
    [12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const lines = text.split("\n");

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        padding: "0 120px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: CONFIG.pillColor,
          borderRadius: CONFIG.pillBorderRadius,
          padding: "20px 40px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center" as const,
          maxWidth: 1400,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: CONFIG.fontFamily,
              fontSize: CONFIG.fontSize,
              fontWeight: 700,
              color: CONFIG.textColor,
              letterSpacing: CONFIG.letterSpacing,
              lineHeight: 1.45,
              whiteSpace: "pre" as const,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN COMPOSITION ────────────────────────────────────────────────────────

export const SubtitleBurn: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <SpeakerBadge />

      {CONFIG.subtitles.map((seg, i) => (
        <Sequence
          key={i}
          from={seg.startFrame}
          durationInFrames={seg.endFrame - seg.startFrame}
        >
          <SubtitleSegment
            text={seg.text}
            durationInFrames={seg.endFrame - seg.startFrame}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ───────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SubtitleBurn"
    component={SubtitleBurn}
    durationInFrames={450}
    fps={30}
    width={1920}
    height={1080}
  />
);
