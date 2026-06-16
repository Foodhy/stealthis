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

// ── Config constants (customize here) ─────────────────────────────────────────
const BRAND_NAME = "Luxe Store";
const BRAND_INITIALS = "LS";
const DISCOUNT_LABEL = "15% OFF";
const BADGE_SUB = "Your entire order";
const CTA_TEXT = "SHOP NOW";
const TICKER_TEXT =
  "FREE SHIPPING on orders over $50  •  USE CODE: LUXE15  •  LIMITED TIME OFFER  •  FREE SHIPPING on orders over $50  •  USE CODE: LUXE15  •  LIMITED TIME OFFER  •  ";

// Palette
const VIOLET = "#7c3aed";
const VIOLET_LIGHT = "#a78bfa";
const PINK = "#db2777";
const PINK_LIGHT = "#f472b6";
const BG = "#0a0a0f";
const SURFACE = "rgba(255,255,255,0.07)";
const BORDER = "rgba(255,255,255,0.12)";

// Layout — banner sits in a 1280×200 strip centered in 1280×720
const BANNER_HEIGHT = 210;
const BANNER_Y = (720 - BANNER_HEIGHT) / 2; // 255

// ── BackgroundLayer — gradient ribbon + radial glows ──────────────────────────
const BackgroundLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const bannerOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const violetGlowOpacity = interpolate(frame, [8, 35], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const pinkGlowOpacity = interpolate(frame, [12, 40], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Slow ambient shimmer drift
  const shimmerX = interpolate(frame, [0, 90], [-200, 1480], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <>
      {/* Full scene dark bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: BG,
        }}
      />

      {/* Gradient banner ribbon */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: BANNER_Y,
          height: BANNER_HEIGHT,
          background: `linear-gradient(105deg, ${VIOLET} 0%, #9d174d 50%, ${PINK} 100%)`,
          opacity: bannerOpacity,
          overflow: "hidden",
        }}
      >
        {/* Diagonal highlight stripe */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.0) 60%)",
          }}
        />

        {/* Moving shimmer sweep */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: shimmerX,
            width: 180,
            height: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.13) 50%, transparent 100%)",
            transform: "skewX(-20deg)",
          }}
        />

        {/* Top edge highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(255,255,255,0.25)",
          }}
        />

        {/* Bottom edge shadow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Violet radial glow behind left section */}
      <div
        style={{
          position: "absolute",
          left: -60,
          top: BANNER_Y - 140,
          width: 700,
          height: 490,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${VIOLET}66 0%, transparent 65%)`,
          opacity: violetGlowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Pink radial glow behind badge center */}
      <div
        style={{
          position: "absolute",
          left: "40%",
          top: BANNER_Y - 80,
          width: 600,
          height: 380,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${PINK}44 0%, transparent 65%)`,
          transform: "translateX(-50%)",
          opacity: pinkGlowOpacity,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── BrandLockup — logo mark + wordmark ────────────────────────────────────────
const BrandLockup: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Logo mark springs in from left
  const logoX = spring({
    frame,
    fps,
    from: -60,
    to: 0,
    config: { damping: 14, stiffness: 130, mass: 0.75 },
  });
  const logoOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Wordmark fades + rises slightly after logo
  const f2 = Math.max(0, frame - 10);
  const wordY = spring({
    frame: f2,
    fps,
    from: 18,
    to: 0,
    config: { damping: 16, stiffness: 120, mass: 0.8 },
  });
  const wordOpacity = interpolate(f2, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline even more delayed
  const f3 = Math.max(0, frame - 20);
  const tagOpacity = interpolate(f3, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `translateX(${logoX}px)`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 14,
            background: "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: 20,
              color: "#ffffff",
              letterSpacing: -0.5,
            }}
          >
            {BRAND_INITIALS}
          </span>
        </div>
      </div>

      {/* Text column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          style={{
            opacity: wordOpacity,
            transform: `translateY(${wordY}px)`,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: "#ffffff",
            letterSpacing: -0.5,
            lineHeight: 1,
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}
        >
          {BRAND_NAME}
        </div>
        <div
          style={{
            opacity: tagOpacity * 0.65,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: 2.5,
            textTransform: "uppercase",
          }}
        >
          Premium Fashion
        </div>
      </div>
    </div>
  );
};

// ── DiscountBadge — rotating 15% OFF medallion ────────────────────────────────
const DiscountBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Scale spring — pops in
  const scaleIn = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 9, stiffness: 100, mass: 0.6 },
  });

  // Full rotation spring: 0 → 360 (over-rotates then settles)
  const rotation = spring({
    frame,
    fps,
    from: 0,
    to: 360,
    config: { damping: 14, stiffness: 70, mass: 1.1 },
  });

  const badgeOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sub-label fades in after badge lands (around frame 38)
  const f2 = Math.max(0, frame - 40);
  const subOpacity = interpolate(f2, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle continuous pulse after settling
  const settled = frame > 45 ? 1 : 0;
  const pulse = settled * (1 + Math.sin((frame / 22) * Math.PI) * 0.018);

  return (
    <div
      style={{
        opacity: badgeOpacity,
        transform: `scale(${scaleIn * pulse}) rotate(${rotation}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Outer ring */}
      <div
        style={{
          position: "relative",
          width: 148,
          height: 148,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${VIOLET_LIGHT}, ${PINK_LIGHT}, ${VIOLET_LIGHT})`,
          padding: 3,
          boxShadow: `0 0 40px ${VIOLET}99, 0 0 80px ${PINK}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner disk */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, #2d1b69 0%, #1a0533 60%, #0f0022 100%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {/* Discount number */}
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: 42,
              color: "#ffffff",
              letterSpacing: -2,
              lineHeight: 1,
              textShadow: `0 0 20px ${VIOLET_LIGHT}cc`,
              // Counter-rotate so text stays upright as badge spins
              transform: `rotate(${-rotation}deg)`,
            }}
          >
            {DISCOUNT_LABEL}
          </span>
        </div>
      </div>

      {/* Sub-label pill — counter-rotated to stay readable */}
      <div
        style={{
          marginTop: -14,
          opacity: subOpacity,
          transform: `rotate(${-rotation}deg)`,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 20,
            padding: "4px 14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 11,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {BADGE_SUB}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── CTAButton — SHOP NOW with animated underline ──────────────────────────────
const CTAButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Whole block springs in from right
  const f0 = Math.max(0, frame - 22);
  const ctaX = spring({
    frame: f0,
    fps,
    from: 70,
    to: 0,
    config: { damping: 15, stiffness: 120, mass: 0.8 },
  });
  const ctaOpacity = interpolate(f0, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Underline sweeps left → right starting at frame 45
  const fUnder = Math.max(0, frame - 45);
  const underlineWidth = interpolate(fUnder, [0, 25], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Arrow nudge on loop after frame 50
  const arrowX =
    frame > 50 ? 4 * Math.sin(((frame - 50) / 18) * Math.PI) : 0;

  return (
    <div
      style={{
        opacity: ctaOpacity,
        transform: `translateX(${ctaX}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {/* Pill button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.14)",
          border: "1.5px solid rgba(255,255,255,0.28)",
          borderRadius: 50,
          padding: "10px 26px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 16,
            color: "#ffffff",
            letterSpacing: 2.5,
            textTransform: "uppercase",
          }}
        >
          {CTA_TEXT}
        </span>
        {/* Arrow */}
        <span
          style={{
            fontSize: 16,
            transform: `translateX(${arrowX}px)`,
            display: "inline-block",
          }}
        >
          →
        </span>
      </div>

      {/* Animated underline bar */}
      <div
        style={{
          width: 200,
          height: 2,
          borderRadius: 1,
          backgroundColor: "rgba(255,255,255,0.12)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${underlineWidth}%`,
            background: `linear-gradient(90deg, ${VIOLET_LIGHT}, ${PINK_LIGHT})`,
            borderRadius: 1,
            boxShadow: `0 0 8px ${VIOLET_LIGHT}88`,
          }}
        />
      </div>
    </div>
  );
};

// ── TickerStrip — RTL scrolling text at bottom of banner ──────────────────────
const TickerStrip: React.FC<{ frame: number }> = ({ frame }) => {
  const stripOpacity = interpolate(frame, [28, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // RTL scroll: translateX from 0 → -960 (one full scroll cycle over 90 frames)
  // We loop by using modulo-like interpolation — text is duplicated in the string
  const tickerX = interpolate(frame, [0, 90], [0, -960], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 38,
        backgroundColor: "rgba(0,0,0,0.28)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        opacity: stripOpacity,
      }}
    >
      {/* Scrolling text — wide enough to loop seamlessly */}
      <div
        style={{
          transform: `translateX(${tickerX}px)`,
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Render 3 copies to ensure seamless loop */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 12,
              color: "rgba(255,255,255,0.82)",
              letterSpacing: 1.8,
              textTransform: "uppercase",
              paddingRight: 40,
            }}
          >
            {TICKER_TEXT}
          </span>
        ))}
      </div>

      {/* Left fade edge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(90deg, rgba(100,20,80,0.8), transparent)`,
          pointerEvents: "none",
        }}
      />
      {/* Right fade edge */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(270deg, rgba(100,20,80,0.8), transparent)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ── Divider — vertical separator between brand and badge ─────────────────────
const VerticalDivider: React.FC<{ frame: number }> = ({ frame }) => {
  const height = interpolate(frame, [18, 42], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        width: 1,
        height: 100,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${height}%`,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
        }}
      />
    </div>
  );
};

// ── Main Composition ───────────────────────────────────────────────────────────
export const DiscountBanner: React.FC = () => {
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
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: globalOpacity,
        overflow: "hidden",
      }}
    >
      {/* Layer 0: Background ribbon + glows */}
      <BackgroundLayer frame={frame} />

      {/* Layer 1: Main banner content strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: BANNER_Y,
          height: BANNER_HEIGHT,
          display: "flex",
          alignItems: "center",
          paddingLeft: 48,
          paddingRight: 48,
          overflow: "hidden",
        }}
      >
        {/* LEFT: Brand lockup */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          <BrandLockup frame={frame} fps={fps} />
        </div>

        {/* Divider */}
        <div style={{ marginLeft: 32, marginRight: 32 }}>
          <VerticalDivider frame={frame} />
        </div>

        {/* CENTER: Discount badge */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DiscountBadge frame={frame} fps={fps} />
        </div>

        {/* RIGHT: CTA */}
        <div style={{ flex: "0 0 auto" }}>
          <CTAButton frame={frame} fps={fps} />
        </div>
      </div>

      {/* Layer 2: Ticker strip at bottom of banner */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: BANNER_Y,
          height: BANNER_HEIGHT,
        }}
      >
        <TickerStrip frame={frame} />
      </div>

      {/* Layer 3: Edge vignette on full scene */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="DiscountBanner"
    component={DiscountBanner}
    durationInFrames={90}
    fps={30}
    width={1280}
    height={720}
  />
);
