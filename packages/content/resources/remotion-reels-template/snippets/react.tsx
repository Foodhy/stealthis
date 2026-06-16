import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── CONFIG ─────────────────────────────────────────────────────────────────
const CONFIG = {
  // Creator
  USERNAME: "@pixel.dev",
  FOLLOWERS: "89.2K followers",
  AVATAR_INITIALS: "PD",
  AVATAR_COLOR: "#6c5ce7",

  // Caption
  CAPTION_WORDS: ["when", "the", "code", "finally", "works", "✨"],
  HASHTAGS: "#coding #programmer #dev",

  // Music
  SONG_TITLE: "Lofi Vibes — ChillBeat Studio",

  // Action icon counts
  HEART_COUNT: "847K",
  COMMENT_COUNT: "12.3K",

  // Gradient colors (background)
  COLOR_A: "#ff6b6b",
  COLOR_B: "#feca57",
  COLOR_C: "#48dbfb",

  // Durations
  TOTAL_FRAMES: 900,
  FADE_OUT_START: 880,
} as const;

// ── Animated gradient background ───────────────────────────────────────────
const AnimatedBackground: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  // Cycle through the three-stop gradient by shifting hue angle over time
  const t = frame / totalFrames;

  // Interpolate between color sets in two halves for a seamless loop feel
  const r1 = interpolate(t, [0, 0.33, 0.66, 1], [255, 254, 72, 255]);
  const g1 = interpolate(t, [0, 0.33, 0.66, 1], [107, 202, 219, 107]);
  const b1 = interpolate(t, [0, 0.33, 0.66, 1], [107, 87, 251, 107]);

  const r2 = interpolate(t, [0, 0.33, 0.66, 1], [254, 72, 255, 254]);
  const g2 = interpolate(t, [0, 0.33, 0.66, 1], [202, 219, 107, 202]);
  const b2 = interpolate(t, [0, 0.33, 0.66, 1], [87, 251, 107, 87]);

  const topColor = `rgb(${Math.round(r1)},${Math.round(g1)},${Math.round(b1)})`;
  const bottomColor = `rgb(${Math.round(r2)},${Math.round(g2)},${Math.round(b2)})`;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${topColor} 0%, ${CONFIG.COLOR_B} 50%, ${bottomColor} 100%)`,
      }}
    />
  );
};

// ── Top progress bar ───────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  const progress = interpolate(frame, [0, totalFrames], [0, 1], {
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
        backgroundColor: "rgba(255,255,255,0.25)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 6px rgba(255,255,255,0.7)",
        }}
      />
    </div>
  );
};

// ── Creator header (avatar + username + followers) ─────────────────────────
const CreatorHeader: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const translateY = spring({
    frame,
    fps,
    from: -30,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 24,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 20,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: CONFIG.AVATAR_COLOR,
          border: "2.5px solid #ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          flexShrink: 0,
        }}
      >
        {CONFIG.AVATAR_INITIALS}
      </div>

      {/* Name block */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#ffffff",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {CONFIG.USERNAME}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {CONFIG.FOLLOWERS}
        </div>
      </div>

      {/* Follow pill */}
      <div
        style={{
          marginLeft: 8,
          paddingInline: 18,
          paddingBlock: 6,
          borderRadius: 20,
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: "#ff6b6b",
        }}
      >
        Follow
      </div>
    </div>
  );
};

// ── Right-side action icon ─────────────────────────────────────────────────
interface ActionIconProps {
  frame: number;
  fps: number;
  emoji: string;
  label: string;
  delay: number;
  offsetY: number;
  pulse?: boolean;
}

const ActionIcon: React.FC<ActionIconProps> = ({
  frame,
  fps,
  emoji,
  label,
  delay,
  offsetY,
  pulse = false,
}) => {
  const f = Math.max(0, frame - delay);
  const translateX = spring({
    frame: f,
    fps,
    from: 80,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });
  const opacity = interpolate(f, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle heartbeat pulse for the heart icon
  const scale = pulse
    ? interpolate(
        Math.sin((frame / fps) * Math.PI * 2 * 1.2),
        [-1, 1],
        [0.92, 1.08]
      )
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        bottom: offsetY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity,
        transform: `translateX(${translateX}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          transform: `scale(${scale})`,
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#ffffff",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ── Bottom caption ─────────────────────────────────────────────────────────
const CaptionOverlay: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const blockOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blockY = spring({
    frame,
    fps,
    from: 20,
    to: 0,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 130,
        left: 20,
        right: 96,
        opacity: blockOpacity,
        transform: `translateY(${blockY}px)`,
        zIndex: 20,
      }}
    >
      {/* Caption words stagger */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 8,
          rowGap: 4,
          marginBottom: 10,
        }}
      >
        {CONFIG.CAPTION_WORDS.map((word, i) => {
          const wordDelay = 20 + i * 10;
          const wf = Math.max(0, frame - wordDelay);
          const wordOpacity = interpolate(wf, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wordY = spring({
            frame: wf,
            fps,
            from: 10,
            to: 0,
            config: { damping: 18, stiffness: 120 },
          });

          return (
            <span
              key={i}
              style={{
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                display: "inline-block",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 700,
                fontSize: 28,
                color: "#ffffff",
                textShadow: "0 2px 6px rgba(0,0,0,0.45)",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Hashtags */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 18,
          color: "rgba(255,255,255,0.8)",
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        {CONFIG.HASHTAGS}
      </div>
    </div>
  );
};

// ── Music ticker ───────────────────────────────────────────────────────────
const MusicTicker: React.FC<{ frame: number }> = ({ frame }) => {
  // Marquee: scroll from right to left over 240 frames, then loop
  const loopFrame = frame % 240;
  const translateX = interpolate(loopFrame, [0, 240], [60, -500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Note icon rotation
  const rotation = interpolate(frame, [0, 60], [0, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "wrap",
  });

  const opacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 28,
        left: 0,
        right: 0,
        height: 48,
        overflow: "hidden",
        opacity,
        zIndex: 20,
      }}
    >
      {/* Background strip */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Content row */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          gap: 12,
        }}
      >
        {/* Spinning note */}
        <div
          style={{
            fontSize: 22,
            transform: `rotate(${rotation}deg)`,
            flexShrink: 0,
          }}
        >
          ♪
        </div>

        {/* Scrolling text */}
        <div
          style={{
            whiteSpace: "nowrap",
            transform: `translateX(${translateX}px)`,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 15,
            color: "#ffffff",
          }}
        >
          {CONFIG.SONG_TITLE} &nbsp;&nbsp;&nbsp; {CONFIG.SONG_TITLE} &nbsp;&nbsp;&nbsp; {CONFIG.SONG_TITLE}
        </div>
      </div>
    </div>
  );
};

// ── Global fade overlay ────────────────────────────────────────────────────
const FadeOut: React.FC<{ frame: number; totalFrames: number; fadeStart: number }> = ({
  frame,
  totalFrames,
  fadeStart,
}) => {
  const opacity = interpolate(frame, [fadeStart, totalFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (opacity === 0) return null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        opacity,
        zIndex: 100,
      }}
    />
  );
};

// ── Main composition ───────────────────────────────────────────────────────
export const InstagramReelsTemplate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Animated gradient background */}
      <AnimatedBackground frame={frame} totalFrames={CONFIG.TOTAL_FRAMES} />

      {/* Top progress bar */}
      <ProgressBar frame={frame} totalFrames={CONFIG.TOTAL_FRAMES} />

      {/* Creator header */}
      <CreatorHeader frame={frame} fps={fps} />

      {/* Right-side actions — staggered slide-in from right */}
      <ActionIcon
        frame={frame}
        fps={fps}
        emoji="❤️"
        label={CONFIG.HEART_COUNT}
        delay={15}
        offsetY={480}
        pulse
      />
      <ActionIcon
        frame={frame}
        fps={fps}
        emoji="💬"
        label={CONFIG.COMMENT_COUNT}
        delay={25}
        offsetY={380}
      />
      <ActionIcon
        frame={frame}
        fps={fps}
        emoji="➤"
        label="Share"
        delay={35}
        offsetY={280}
      />
      <ActionIcon
        frame={frame}
        fps={fps}
        emoji="🔖"
        label="Save"
        delay={45}
        offsetY={180}
      />

      {/* Caption */}
      <CaptionOverlay frame={frame} fps={fps} />

      {/* Music ticker */}
      <MusicTicker frame={frame} />

      {/* Fade to black at end */}
      <FadeOut
        frame={frame}
        totalFrames={CONFIG.TOTAL_FRAMES}
        fadeStart={CONFIG.FADE_OUT_START}
      />
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="InstagramReelsTemplate"
    component={InstagramReelsTemplate}
    durationInFrames={CONFIG.TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
