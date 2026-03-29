import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Config ────────────────────────────────────────────────────────────
const HEADLINE = "Ready to level up?";
const SUBTEXT = "Join 10,000+ developers already inside.";
const BUTTON_LABEL = "Get Started Free";
const BRAND_COLOR = "#6366f1";
const BG_COLOR = "#0a0a0f";

// ── Headline ──────────────────────────────────────────────────────────
const Headline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const translateX = spring({
    frame,
    fps,
    from: -60,
    to: 0,
    config: { damping: 16, stiffness: 120 },
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        fontSize: 64,
        color: "#ffffff",
        letterSpacing: -2,
        lineHeight: 1.1,
        textAlign: "center",
      }}
    >
      {HEADLINE}
    </div>
  );
};

// ── Subtext ───────────────────────────────────────────────────────────
const Subtext: React.FC<{ frame: number }> = ({ frame }) => {
  const delayed = Math.max(0, frame - 15);
  const opacity = interpolate(delayed, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 400,
        fontSize: 24,
        color: "rgba(255,255,255,0.55)",
        textAlign: "center",
        marginTop: 16,
      }}
    >
      {SUBTEXT}
    </div>
  );
};

// ── CTA button with shimmer ───────────────────────────────────────────
const CTAButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 30);

  const scale = spring({
    frame: delayed,
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 180, mass: 0.6 },
  });

  // Shimmer sweep after button appears
  const shimmerX = interpolate((frame - 60) % 60, [0, 60], [-200, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showShimmer = frame > 60;

  return (
    <div
      style={{
        marginTop: 40,
        transform: `scale(${scale})`,
        position: "relative",
        overflow: "hidden",
        borderRadius: 50,
      }}
    >
      <div
        style={{
          backgroundColor: BRAND_COLOR,
          borderRadius: 50,
          padding: "20px 52px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "#ffffff",
            letterSpacing: 0.3,
          }}
        >
          {BUTTON_LABEL}
        </div>

        {/* Arrow */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 22,
            color: "#ffffff",
          }}
        >
          →
        </div>

        {/* Shimmer overlay */}
        {showShimmer && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 80,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
              transform: "skewX(-15deg)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Bouncing arrow indicator ──────────────────────────────────────────
const BouncingArrow: React.FC<{ frame: number }> = ({ frame }) => {
  const delayed = Math.max(0, frame - 45);
  const opacity = interpolate(delayed, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bounce = delayed > 15 ? Math.sin(((frame - 60) / 18) * Math.PI) * 8 : 0;

  return (
    <div
      style={{
        marginTop: 32,
        opacity,
        transform: `translateX(${bounce}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 32,
        color: "rgba(255,255,255,0.4)",
      }}
    >
      ›
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const CTAAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: globalOpacity,
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${BRAND_COLOR}20 0%, transparent 70%)`,
        }}
      />

      <Headline frame={frame} fps={fps} />
      <Subtext frame={frame} />
      <CTAButton frame={frame} fps={fps} />
      <BouncingArrow frame={frame} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="CTAAnimation"
    component={CTAAnimation}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
