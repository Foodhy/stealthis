import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Config ────────────────────────────────────────────────────────────
const AUTHOR_NAME = "Jane Doe";
const AUTHOR_HEADLINE = "Senior Product Designer · Ex-Google";
const POST_LINES = [
  "Excited to share that I've just joined an incredible team.",
  "Building products that make a difference is what drives me.",
  "Can't wait to show you what we're working on. 🚀",
];
const LIKES = 847;
const BRAND_COLOR = "#0077b5"; // LinkedIn blue
const BG_COLOR = "#f3f2ef";

// ── Avatar ────────────────────────────────────────────────────────────
const Avatar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const translateX = spring({
    frame,
    fps,
    from: -50,
    to: 0,
    config: { damping: 16, stiffness: 120 },
  });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: BRAND_COLOR,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#ffffff",
        }}
      >
        {AUTHOR_NAME.split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
    </div>
  );
};

// ── Author info ───────────────────────────────────────────────────────
const AuthorInfo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 8);
  const opacity = interpolate(delayed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame: delayed,
    fps,
    from: -10,
    to: 0,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#000000",
          lineHeight: 1.2,
        }}
      >
        {AUTHOR_NAME}
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 13,
          color: "rgba(0,0,0,0.55)",
          marginTop: 2,
        }}
      >
        {AUTHOR_HEADLINE}
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: "rgba(0,0,0,0.4)",
          marginTop: 2,
        }}
      >
        Just now · 🌐
      </div>
    </div>
  );
};

// ── Post text (lines fade in one by one) ─────────────────────────────
const PostText: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {POST_LINES.map((line, i) => {
        const delay = 40 + i * 20;
        const f = Math.max(0, frame - delay);
        const opacity = interpolate(f, [0, 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              opacity,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "rgba(0,0,0,0.8)",
              lineHeight: 1.5,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

// ── Engagement counter ────────────────────────────────────────────────
const EngagementBar: React.FC<{ frame: number }> = ({ frame }) => {
  const delayed = Math.max(0, frame - 120);
  const count = Math.floor(
    interpolate(delayed, [0, 60], [0, LIKES], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const opacity = interpolate(delayed, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 12,
        borderTop: "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          color: "rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>👍</span>
        <span>{count.toLocaleString()} reactions</span>
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          color: "rgba(0,0,0,0.55)",
        }}
      >
        142 comments
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const LinkedInPost: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>
      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 740,
          backgroundColor: "#ffffff",
          borderRadius: 8,
          padding: "24px 28px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          opacity: cardOpacity,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar frame={frame} fps={fps} />
          <AuthorInfo frame={frame} fps={fps} />

          {/* LinkedIn logo */}
          <div
            style={{
              marginLeft: "auto",
              backgroundColor: BRAND_COLOR,
              borderRadius: 4,
              padding: "2px 6px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#ffffff",
            }}
          >
            in
          </div>
        </div>

        <PostText frame={frame} />
        <EngagementBar frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="LinkedInPost"
    component={LinkedInPost}
    durationInFrames={180}
    fps={30}
    width={1200}
    height={628}
  />
);
