import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const DURATION = 900; // 30 s at 30 fps

const CHANNEL_NAME = "@TechShorts";
const CHANNEL_SUBS = "142K subscribers";

const HOOK_WORDS = [
  "This",
  "Will",
  "Change",
  "How",
  "You",
  "Code",
  "Forever",
];

const BG_FROM = "#0f0f0f";
const BG_TO = "#1a1a1a";
const ACCENT = "#ff0000"; // YouTube red
const TEXT_PRIMARY = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.60)";

const FONT = "system-ui, -apple-system, 'Helvetica Neue', sans-serif";

// ── Dot-grid overlay ──────────────────────────────────────────────────────────
const GridOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      pointerEvents: "none",
    }}
  />
);

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number }> = ({ frame }) => {
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
        height: 3,
        backgroundColor: "rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: ACCENT,
        }}
      />
    </div>
  );
};

// ── Channel header (top-left) ─────────────────────────────────────────────────
const ChannelHeader: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame,
    fps,
    from: -24,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 28,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Avatar circle */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff4e50, #fc913a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
          border: "2px solid rgba(255,255,255,0.20)",
        }}
      >
        ⚡
      </div>

      {/* Name + subs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 18,
            color: TEXT_PRIMARY,
            lineHeight: 1,
          }}
        >
          {CHANNEL_NAME}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 13,
            color: TEXT_MUTED,
          }}
        >
          {CHANNEL_SUBS}
        </div>
      </div>
    </div>
  );
};

// ── Subscribe button ──────────────────────────────────────────────────────────
const SubscribeButton: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Bounces in at frame 60
  const f = Math.max(0, frame - 60);
  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 180, mass: 0.6 },
  });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 68,
        right: 28,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center right",
      }}
    >
      <div
        style={{
          backgroundColor: ACCENT,
          borderRadius: 24,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 22,
          paddingRight: 22,
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 0 20px rgba(255,0,0,0.45)",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 15,
            color: TEXT_PRIMARY,
            letterSpacing: 0.3,
          }}
        >
          Subscribe
        </div>
      </div>
    </div>
  );
};

// ── Like / Dislike icons (right side) ─────────────────────────────────────────
const LikeDislike: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Slide in from the right at frame 30
  const f = Math.max(0, frame - 30);
  const translateX = spring({
    frame: f,
    fps,
    from: 80,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const iconStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    border: "1.5px solid rgba(255,255,255,0.14)",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 600,
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: "center" as const,
    marginTop: 4,
  };

  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        bottom: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Like */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={iconStyle}>👍</div>
        <div style={labelStyle}>47K</div>
      </div>

      {/* Dislike */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={iconStyle}>👎</div>
        <div style={labelStyle}>Dislike</div>
      </div>
    </div>
  );
};

// ── Hook text (word-by-word stagger) ──────────────────────────────────────────
const HookText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Overall container fades in gently
  const containerOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 28,
        right: 100,
        opacity: containerOpacity,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 13,
          color: TEXT_MUTED,
          letterSpacing: 1.5,
          textTransform: "uppercase" as const,
          marginBottom: 10,
        }}
      >
        Today's tip
      </div>

      {/* Staggered words */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0 10px", rowGap: 4 }}>
        {HOOK_WORDS.map((word, i) => {
          const startFrame = 10 + i * 7;
          const f = Math.max(0, frame - startFrame);

          const wordOpacity = interpolate(f, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const translateY = spring({
            frame: f,
            fps,
            from: 40,
            to: 0,
            config: { damping: 14, stiffness: 160 },
          });

          return (
            <span
              key={i}
              style={{
                opacity: wordOpacity,
                transform: `translateY(${translateY}px)`,
                display: "inline-block",
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 58,
                lineHeight: 1.08,
                color: TEXT_PRIMARY,
                textShadow: "0 2px 12px rgba(0,0,0,0.7)",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── Center content placeholder ────────────────────────────────────────────────
const ContentArea: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 30], [0, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 16,
          color: TEXT_PRIMARY,
          letterSpacing: 3,
          textTransform: "uppercase" as const,
        }}
      >
        Video Content
      </div>
    </div>
  );
};

// ── Shorts-style top bar (title + close icon) ─────────────────────────────────
const ShortsTopBar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], {
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
        height: 52,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 20,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 16,
          color: TEXT_PRIMARY,
          letterSpacing: 0.5,
          flexGrow: 1,
        }}
      >
        Shorts
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 22,
          color: TEXT_PRIMARY,
          opacity: 0.7,
        }}
      >
        ✕
      </div>
    </div>
  );
};

// ── Main composition ───────────────────────────────────────────────────────────
export const YouTubeShorts: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
        overflow: "hidden",
      }}
    >
      <GridOverlay />
      <ContentArea frame={frame} />
      <ShortsTopBar frame={frame} />
      <ChannelHeader frame={frame} fps={fps} />
      <SubscribeButton frame={frame} fps={fps} />
      <LikeDislike frame={frame} fps={fps} />
      <HookText frame={frame} fps={fps} />
      <ProgressBar frame={frame} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="YouTubeShorts"
    component={YouTubeShorts}
    durationInFrames={DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
