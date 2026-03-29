import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const HANDLE = "@youraccount";
const HEADLINE_WORDS = ["Big", "News.", "Coming", "Soon!"];
const SUBTITLE_TEXT = "Stay tuned for our big announcement this week.";
const CTA_TEXT = "Swipe Up to Learn More";
const DURATION = 450;

const ProgressBar: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = interpolate(frame, [0, DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.3)",
      }}
    >
      <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: "#ffffff" }} />
    </div>
  );
};

const AccountHandle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.25)",
          border: "2px solid rgba(255,255,255,0.7)",
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 16,
          color: "#ffffff",
        }}
      >
        {HANDLE}
      </div>
    </div>
  );
};

const HeadlineWords: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div
    style={{
      position: "absolute",
      top: "38%",
      left: 0,
      right: 0,
      paddingLeft: 40,
      paddingRight: 40,
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    {HEADLINE_WORDS.map((word, i) => {
      const f = Math.max(0, frame - (20 + i * 14));
      const opacity = interpolate(f, [0, 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const translateY = spring({
        frame: f,
        fps,
        from: 24,
        to: 0,
        config: { damping: 14, stiffness: 100 },
      });
      return (
        <div
          key={i}
          style={{
            opacity,
            transform: `translateY(${translateY}px)`,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 64,
            color: "#ffffff",
            lineHeight: 1.1,
          }}
        >
          {word}
        </div>
      );
    })}
  </div>
);

const SubtitleText: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(Math.max(0, frame - 80), [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: "62%",
        left: 40,
        right: 40,
        opacity,
        fontFamily: "system-ui, sans-serif",
        fontWeight: 400,
        fontSize: 24,
        color: "rgba(255,255,255,0.75)",
        lineHeight: 1.5,
      }}
    >
      {SUBTITLE_TEXT}
    </div>
  );
};

const CTAButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 120);
  const translateY = spring({
    frame: f,
    fps,
    from: 40,
    to: 0,
    config: { damping: 14, stiffness: 80 },
  });
  const opacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.22)",
          border: "2px solid rgba(255,255,255,0.5)",
          borderRadius: 50,
          padding: "18px 40px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#ffffff",
          whiteSpace: "nowrap",
        }}
      >
        ↑ {CTA_TEXT}
      </div>
    </div>
  );
};

export const InstagramStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #667eea 0%, #764ba2 100%)" }}>
      <ProgressBar frame={frame} />
      <AccountHandle frame={frame} />
      <HeadlineWords frame={frame} fps={fps} />
      <SubtitleText frame={frame} />
      <CTAButton frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
