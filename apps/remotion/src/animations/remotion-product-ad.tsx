import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Config ────────────────────────────────────────────────────────────────────
const PRODUCT_NAME = "ProFlow X1";
const PRODUCT_SUBTITLE = "Wireless Earbuds";
const BENEFITS = [
  "40-hour battery life with charging case",
  "Adaptive ANC with 3-mic array",
  "Hi-Res Audio · Bluetooth 5.4",
];
const PRICE = "$149";
const PRICE_ORIGINAL = "$199";
const CTA_LABEL = "Shop Now — Free Shipping";
const BRAND_COLOR = "#2563eb";
const BRAND_GLOW = "#3b82f6";
const BG_COLOR = "#0a0a0f";
const CARD_BG = "#111827";
const DURATION = 150;

// ── Background layer: deep radial glow + grid ─────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const glowOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Subtle pulsing glow after initial reveal
  const pulse = interpolate(
    Math.sin(((frame - 25) / 60) * Math.PI * 2),
    [-1, 1],
    [0.7, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* Main ambient glow — centered left where product card lives */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "32%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND_GLOW}22 0%, ${BRAND_GLOW}08 40%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity * pulse,
          pointerEvents: "none",
        }}
      />
      {/* Secondary glow top-right accent */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "8%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, #7c3aed18 0%, transparent 70%)`,
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Subtle dot-grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: glowOpacity * 0.6,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Product hero card (left column) ──────────────────────────────────────────
const ProductCard: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    from: 0.72,
    to: 1,
    config: { damping: 16, stiffness: 90, mass: 0.8 },
  });

  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Inner icon drift — floating animation after entrance
  const floatY = interpolate(
    Math.sin(((frame - 20) / 70) * Math.PI * 2),
    [-1, 1],
    [-6, 6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Glint sweep across the card after frame 40
  const glintProgress = interpolate(frame, [45, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const glintX = interpolate(glintProgress, [0, 1], [-320, 380], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 420,
        height: 420,
        borderRadius: 32,
        background: `linear-gradient(145deg, ${CARD_BG} 0%, #1e2435 100%)`,
        border: `1.5px solid rgba(37,99,235,0.35)`,
        boxShadow: `0 0 60px rgba(37,99,235,0.18), 0 32px 80px rgba(0,0,0,0.6)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        opacity,
        transform: `scale(${scale}) translateY(${floatY}px)`,
        flexShrink: 0,
      }}
    >
      {/* Card inner glow ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 32,
          background: `radial-gradient(ellipse at 35% 30%, ${BRAND_GLOW}14 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Earbud icon illustration */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Pod silhouette — left earbud */}
        <div style={{ display: "flex", gap: 36, alignItems: "flex-end" }}>
          <div
            style={{
              width: 80,
              height: 100,
              borderRadius: "50% 50% 45% 45%",
              background: `linear-gradient(160deg, #1d4ed8 0%, #1e3a5f 60%, #111827 100%)`,
              boxShadow: `0 0 24px ${BRAND_GLOW}50`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          </div>
          {/* Pod silhouette — right earbud */}
          <div
            style={{
              width: 80,
              height: 100,
              borderRadius: "50% 50% 45% 45%",
              background: `linear-gradient(160deg, #1d4ed8 0%, #1e3a5f 60%, #111827 100%)`,
              boxShadow: `0 0 24px ${BRAND_GLOW}50`,
              transform: "scaleX(-1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          </div>
        </div>
        {/* Charging case */}
        <div
          style={{
            width: 180,
            height: 52,
            borderRadius: 26,
            background: `linear-gradient(140deg, #1e293b 0%, #0f172a 100%)`,
            border: `1.5px solid rgba(37,99,235,0.3)`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* LED indicator */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: BRAND_COLOR,
              boxShadow: `0 0 10px ${BRAND_GLOW}`,
            }}
          />
        </div>
      </div>

      {/* Glint effect sweeping across */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: glintX,
          width: 60,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
          transform: "skewX(-12deg)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ── Product name — letter-by-letter entrance ──────────────────────────────────
const ProductTitle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const letters = PRODUCT_NAME.split("");
  const LETTER_STAGGER = 3;
  const START_FRAME = 10;

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: 72,
        letterSpacing: -2,
        color: "#ffffff",
        lineHeight: 1,
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: 0,
      }}
    >
      {letters.map((char, i) => {
        const localFrame = Math.max(0, frame - START_FRAME - i * LETTER_STAGGER);
        const y = spring({
          frame: localFrame,
          fps,
          from: 40,
          to: 0,
          config: { damping: 14, stiffness: 160 },
        });
        const opacity = interpolate(localFrame, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}px)`,
              color: char === " " ? "transparent" : "#ffffff",
              width: char === " " ? 18 : "auto",
            }}
          >
            {char === " " ? " " : char}
          </span>
        );
      })}
    </div>
  );
};

// ── Product subtitle line ─────────────────────────────────────────────────────
const ProductSubtitle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const START_FRAME = 28;
  const f = Math.max(0, frame - START_FRAME);
  const opacity = interpolate(f, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = spring({
    frame: f,
    fps,
    from: -20,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 500,
        fontSize: 24,
        color: `${BRAND_GLOW}`,
        letterSpacing: 3,
        textTransform: "uppercase" as const,
        opacity,
        transform: `translateX(${x}px)`,
        marginTop: 8,
      }}
    >
      {PRODUCT_SUBTITLE}
    </div>
  );
};

// ── Divider line ──────────────────────────────────────────────────────────────
const DividerLine: React.FC<{ frame: number }> = ({ frame }) => {
  const START_FRAME = 38;
  const f = Math.max(0, frame - START_FRAME);
  const scaleX = interpolate(f, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 20,
        height: 1,
        width: 480,
        background: `linear-gradient(90deg, ${BRAND_GLOW}60, ${BRAND_GLOW}20, transparent)`,
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
        opacity,
      }}
    />
  );
};

// ── Benefits list with staggered entrance ─────────────────────────────────────
const BenefitItem: React.FC<{
  text: string;
  index: number;
  frame: number;
  fps: number;
}> = ({ text, index, frame, fps }) => {
  const START_FRAME = 48 + index * 12;
  const f = Math.max(0, frame - START_FRAME);

  const x = spring({
    frame: f,
    fps,
    from: -28,
    to: 0,
    config: { damping: 15, stiffness: 130 },
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const checkScale = spring({
    frame: Math.max(0, f - 4),
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `translateX(${x}px)`,
        marginBottom: 14,
      }}
    >
      {/* Check badge */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: `${BRAND_COLOR}30`,
          border: `1.5px solid ${BRAND_COLOR}80`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${checkScale})`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: BRAND_GLOW,
            boxShadow: `0 0 6px ${BRAND_GLOW}`,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          color: "rgba(255,255,255,0.78)",
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ── Price badge with spring pop + pulse ──────────────────────────────────────
const PriceBadge: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const START_FRAME = 84;
  const f = Math.max(0, frame - START_FRAME);

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 9, stiffness: 220, mass: 0.55 },
  });

  // Pulse ring after initial spring
  const pulseScale = interpolate(
    (f - 10) % 45,
    [0, 22, 44],
    [1, 1.12, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const pulseOpacity = interpolate(
    (f - 10) % 45,
    [0, 22, 44],
    [0.5, 0, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const showPulse = f > 10;

  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
        position: "relative",
        marginBottom: 24,
      }}
    >
      {/* Price badge pill */}
      <div style={{ position: "relative" }}>
        {/* Pulse ring */}
        {showPulse && (
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 20,
              border: `2px solid ${BRAND_GLOW}`,
              opacity: pulseOpacity,
              transform: `scale(${pulseScale})`,
              pointerEvents: "none",
            }}
          />
        )}
        <div
          style={{
            backgroundColor: BRAND_COLOR,
            borderRadius: 14,
            padding: "10px 24px",
            boxShadow: `0 0 32px ${BRAND_GLOW}50, 0 8px 24px rgba(37,99,235,0.4)`,
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: 42,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            {PRICE}
          </span>
        </div>
      </div>

      {/* Original price strikethrough */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 20,
            color: "rgba(255,255,255,0.35)",
            textDecoration: "line-through",
          }}
        >
          {PRICE_ORIGINAL}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#4ade80",
            letterSpacing: 0.5,
            textTransform: "uppercase" as const,
          }}
        >
          Save 25%
        </span>
      </div>
    </div>
  );
};

// ── CTA button with shimmer sweep ─────────────────────────────────────────────
const CTAButton: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const START_FRAME = 108;
  const f = Math.max(0, frame - START_FRAME);

  const scale = spring({
    frame: f,
    fps,
    from: 0.82,
    to: 1,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shimmer cycles after the button appears
  const shimmerProgress = interpolate(
    (frame - START_FRAME - 12) % 55,
    [0, 55],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const shimmerX = interpolate(shimmerProgress, [0, 1], [-120, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showShimmer = frame >= START_FRAME + 12;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          backgroundColor: BRAND_COLOR,
          borderRadius: 14,
          padding: "16px 40px",
          overflow: "hidden",
          boxShadow: `0 0 40px ${BRAND_GLOW}40, 0 8px 32px rgba(37,99,235,0.35)`,
          cursor: "pointer",
        }}
      >
        {/* Button text */}
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#ffffff",
            letterSpacing: 0.2,
            position: "relative",
            zIndex: 1,
          }}
        >
          {CTA_LABEL}
        </span>

        {/* Arrow */}
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.85)",
            position: "relative",
            zIndex: 1,
          }}
        >
          →
        </span>

        {/* Shimmer overlay */}
        {showShimmer && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 90,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
              transform: "skewX(-14deg)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Badge: "NEW RELEASE" top-left corner ──────────────────────────────────────
const NewBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 6);
  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 200, mass: 0.5 },
  });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        left: 60,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#4ade80",
          boxShadow: "0 0 8px #4ade80",
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: "#4ade80",
          letterSpacing: 2.5,
          textTransform: "uppercase" as const,
        }}
      >
        New Release
      </span>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const ProductAdSpot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out in last 20 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, opacity: globalOpacity }}>
      <BackgroundGlow frame={frame} />

      {/* "NEW RELEASE" badge top-left */}
      <NewBadge frame={frame} fps={fps} />

      {/* Main two-column layout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: 70,
          paddingRight: 60,
          gap: 64,
        }}
      >
        {/* LEFT: product hero card */}
        <ProductCard frame={frame} fps={fps} />

        {/* RIGHT: copy panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <ProductSubtitle frame={frame} fps={fps} />
          <ProductTitle frame={frame} fps={fps} />
          <DividerLine frame={frame} />

          {/* Benefits */}
          <div style={{ marginBottom: 4 }}>
            {BENEFITS.map((benefit, i) => (
              <BenefitItem
                key={i}
                text={benefit}
                index={i}
                frame={frame}
                fps={fps}
              />
            ))}
          </div>

          {/* Price + CTA */}
          <PriceBadge frame={frame} fps={fps} />
          <CTAButton frame={frame} fps={fps} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ProductAdSpot"
    component={ProductAdSpot}
    durationInFrames={DURATION}
    fps={30}
    width={1280}
    height={720}
  />
);
