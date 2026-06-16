import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Design tokens ──────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE = "#12121a";
const CARD = "#1a1a2e";
const BRAND = "#6366f1";
const BRAND_2 = "#8b5cf6";
const ACCENT = "#06b6d4";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";
const GOLD = "#f59e0b";
const FONT = "system-ui, -apple-system, sans-serif";

// ── Data ───────────────────────────────────────────────────────────────
const REVIEWER_NAME = "Sarah K.";
const REVIEWER_FULL = "Sarah Kauffman";
const REVIEWER_TITLE = "Head of Marketing";
const REVIEWER_COMPANY = "Flowbase";
const REVIEWER_INITIALS = "SK";
const REVIEW_TEXT =
  "Flowbase transformed our entire go-to-market motion. We shipped our last campaign in three days instead of three weeks — and the quality was noticeably better. I cannot imagine going back.";
const STAR_COUNT = 5;
const VERIFIED_LABEL = "Verified customer";
const COMPANY_TAGLINE = "flowbase.io";

// ── Avatar (large, spring entrance) ───────────────────────────────────
const Avatar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 180, mass: 0.8 },
  });
  const translateY = spring({
    frame,
    fps,
    from: -60,
    to: 0,
    config: { damping: 14, stiffness: 160, mass: 0.9 },
  });
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Avatar ring */}
      <div
        style={{
          width: 116,
          height: 116,
          borderRadius: "50%",
          background: `conic-gradient(from 180deg, ${BRAND}, ${BRAND_2}, ${ACCENT}, ${BRAND})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 40px ${BRAND}55, 0 0 80px ${BRAND_2}22`,
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${BRAND}cc 0%, ${BRAND_2}cc 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 36,
            color: TEXT,
            letterSpacing: "-0.5px",
          }}
        >
          {REVIEWER_INITIALS}
        </div>
      </div>
    </div>
  );
};

// ── Reviewer name + title ──────────────────────────────────────────────
const ReviewerInfo: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const nameOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameY = spring({
    frame,
    fps,
    from: 20,
    to: 0,
    config: { damping: 16, stiffness: 140 },
  });

  const titleOpacity = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({
    frame: Math.max(0, frame - 8),
    fps,
    from: 14,
    to: 0,
    config: { damping: 16, stiffness: 140 },
  });

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 26,
          color: TEXT,
          letterSpacing: "-0.3px",
        }}
      >
        {REVIEWER_NAME} —{" "}
        <span style={{ color: TEXT_MUTED, fontWeight: 600 }}>
          {REVIEWER_TITLE} at {REVIEWER_COMPANY}
        </span>
      </div>
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 14,
          color: TEXT_MUTED,
          marginTop: 4,
          letterSpacing: "0.3px",
        }}
      >
        {REVIEWER_FULL} · {REVIEWER_COMPANY}
      </div>
    </div>
  );
};

// ── Star rating (fills left-to-right) ─────────────────────────────────
const StarRating: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const delay = i * 7;
        const f = Math.max(0, frame - delay);
        const scale = spring({
          frame: f,
          fps,
          from: 0,
          to: 1,
          config: { damping: 8, stiffness: 220, mass: 0.4 },
        });
        const glowOpacity = interpolate(f, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              fontSize: 38,
              color: GOLD,
              transform: `scale(${scale})`,
              display: "inline-block",
              filter: `drop-shadow(0 0 ${10 * glowOpacity}px ${GOLD}cc)`,
            }}
          >
            ★
          </div>
        );
      })}
    </div>
  );
};

// ── Quote block (expands + word-by-word reveal) ────────────────────────
const QuoteBlock: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const words = REVIEW_TEXT.split(" ");

  // Outer block expand
  const blockHeight = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const blockOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Left accent bar scale
  const accentScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 160 },
  });

  return (
    <div
      style={{
        opacity: blockOpacity,
        overflow: "hidden",
        maxHeight: `${blockHeight * 200}px`,
        transition: "max-height 0.3s",
        width: "100%",
        position: "relative",
        paddingLeft: 28,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
          transform: `scaleY(${accentScale})`,
          transformOrigin: "top center",
        }}
      />

      {/* Quote mark */}
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 72,
          lineHeight: 0.8,
          color: BRAND,
          opacity: 0.6,
          marginBottom: 6,
          userSelect: "none",
        }}
      >
        "
      </div>

      {/* Words */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 8px",
          lineHeight: 1.7,
        }}
      >
        {words.map((word, i) => {
          const wordDelay = 6 + i * 4;
          const f = Math.max(0, frame - wordDelay);
          const wordOpacity = interpolate(f, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wordY = interpolate(f, [0, 12], [8, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });

          return (
            <span
              key={i}
              style={{
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                display: "inline-block",
                fontFamily: FONT,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 22,
                color: TEXT,
                letterSpacing: "0.1px",
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

// ── Company logo + verified badge (slide in from bottom) ───────────────
const CompanyBadge: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const translateY = spring({
    frame,
    fps,
    from: 40,
    to: 0,
    config: { damping: 16, stiffness: 130 },
  });
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      {/* Company logo pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: `linear-gradient(135deg, ${BRAND}18 0%, ${BRAND_2}18 100%)`,
          border: `1px solid ${BRAND}44`,
          borderRadius: 40,
          padding: "8px 18px",
        }}
      >
        {/* Logo icon */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 13,
            color: TEXT,
          }}
        >
          F
        </div>
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 16,
            color: TEXT,
            letterSpacing: "-0.2px",
          }}
        >
          {REVIEWER_COMPANY}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 13,
            color: TEXT_MUTED,
          }}
        >
          {COMPANY_TAGLINE}
        </span>
      </div>

      {/* Verified badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.35)",
          borderRadius: 40,
          padding: "8px 16px",
        }}
      >
        {/* Checkmark circle */}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 13,
            color: "#10b981",
            letterSpacing: "0.2px",
          }}
        >
          {VERIFIED_LABEL}
        </span>
      </div>
    </div>
  );
};

// ── Divider ────────────────────────────────────────────────────────────
const Divider: React.FC<{ frame: number }> = ({ frame }) => {
  const scaleX = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        width: "100%",
        height: 1,
        background: `linear-gradient(90deg, ${BRAND}66 0%, ${BRAND_2}44 50%, transparent 100%)`,
        transform: `scaleX(${scaleX})`,
        transformOrigin: "left center",
      }}
    />
  );
};

// ── Main composition ───────────────────────────────────────────────────
export const ProductReviewVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade out last 0.5 s
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Card scale entrance
  const cardScale = spring({
    frame,
    fps,
    from: 0.88,
    to: 1,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });
  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sequence offsets (in frames)
  const AVATAR_START = 0;
  const INFO_START = 18;
  const STARS_START = 42;
  const DIVIDER_1_START = 72;
  const QUOTE_START = 84;
  const DIVIDER_2_START = 180;
  const BADGE_START = 194;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: globalOpacity,
        fontFamily: FONT,
      }}
    >
      {/* Ambient background gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 900px 600px at 30% 20%, ${BRAND}12 0%, transparent 70%),
                       radial-gradient(ellipse 700px 500px at 75% 80%, ${BRAND_2}0e 0%, transparent 65%)`,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 860,
          transform: `translate(-50%, -50%) scale(${cardScale})`,
          opacity: cardOpacity,
          background: `linear-gradient(160deg, ${CARD}ee 0%, ${SURFACE}f5 100%)`,
          border: `1px solid rgba(99,102,241,0.22)`,
          borderRadius: 20,
          padding: "44px 52px",
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.06)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* 1 — Avatar */}
        <Sequence from={AVATAR_START} layout="none">
          <Avatar frame={frame - AVATAR_START} fps={fps} />
        </Sequence>

        <div style={{ height: 18 }} />

        {/* 2 — Reviewer name + title */}
        <Sequence from={INFO_START} layout="none">
          <ReviewerInfo frame={frame - INFO_START} fps={fps} />
        </Sequence>

        <div style={{ height: 20 }} />

        {/* 3 — Star rating */}
        <Sequence from={STARS_START} layout="none">
          <StarRating frame={frame - STARS_START} fps={fps} />
        </Sequence>

        <div style={{ height: 24 }} />

        {/* Divider 1 */}
        <Sequence from={DIVIDER_1_START} layout="none">
          <Divider frame={frame - DIVIDER_1_START} />
        </Sequence>

        <div style={{ height: 24 }} />

        {/* 4 — Quote block */}
        <Sequence from={QUOTE_START} layout="none">
          <QuoteBlock frame={frame - QUOTE_START} fps={fps} />
        </Sequence>

        <div style={{ height: 24 }} />

        {/* Divider 2 */}
        <Sequence from={DIVIDER_2_START} layout="none">
          <Divider frame={frame - DIVIDER_2_START} />
        </Sequence>

        <div style={{ height: 20 }} />

        {/* 5 — Company logo + verified badge */}
        <Sequence from={BADGE_START} layout="none">
          <CompanyBadge frame={frame - BADGE_START} fps={fps} />
        </Sequence>
      </div>

      {/* Bottom product name watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 12,
          color: TEXT_MUTED,
          letterSpacing: "2px",
          textTransform: "uppercase",
          opacity: interpolate(frame, [60, 80], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Flowbase · Customer Stories
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ProductReviewVideo"
    component={ProductReviewVideo}
    durationInFrames={240}
    fps={30}
    width={1280}
    height={720}
  />
);
