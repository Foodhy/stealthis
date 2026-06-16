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

// ── Config ────────────────────────────────────────────────────────────────────
const BRAND = "ShopNow";
const DISCOUNT_PCT = "50% OFF";
const ORIGINAL_PRICE = "$199.99";
const NEW_PRICE = "$99.99";
const ACCENT_COLOR = "#ef4444";      // vivid red
const GOLD_COLOR = "#f59e0b";        // warm gold for accents
const BG_COLOR = "#0a0a0f";          // near-black
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.45)";

const CONFETTI_DOTS = [
  { x: 120,  y: 580, color: "#ef4444", size: 14, delay: 0  },
  { x: 280,  y: 640, color: "#f59e0b", size: 10, delay: 4  },
  { x: 460,  y: 600, color: "#fbbf24", size: 16, delay: 2  },
  { x: 680,  y: 660, color: "#ef4444", size: 12, delay: 6  },
  { x: 820,  y: 590, color: "#f97316", size: 18, delay: 3  },
  { x: 980,  y: 630, color: "#fbbf24", size: 10, delay: 7  },
  { x: 1100, y: 600, color: "#ef4444", size: 14, delay: 1  },
  { x: 1200, y: 650, color: "#f59e0b", size: 12, delay: 5  },
];

// ── Background layer ──────────────────────────────────────────────────────────
const Background: React.FC = () => (
  <>
    {/* Deep radial glow centred on canvas */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 860px 500px at 50% 50%,
          ${ACCENT_COLOR}18 0%,
          ${GOLD_COLOR}0a 45%,
          transparent 72%)`,
      }}
    />
    {/* Subtle vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)",
      }}
    />
  </>
);

// ── Confetti dots ─────────────────────────────────────────────────────────────
const ConfettiDot: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}> = ({ frame, fps, x, y, color, size, delay }) => {
  const f = Math.max(0, frame - delay);

  const opacity = interpolate(f, [0, 10, 68, 90], [0, 0.9, 0.75, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const floatY = interpolate(
    f,
    [0, 90 - delay],
    [0, -110],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const wobbleX = Math.sin((f / 14) * Math.PI) * 12;

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: `0 0 ${size * 1.5}px ${color}88`,
        opacity,
        transform: `translate(${wobbleX}px, ${floatY}px) scale(${scale})`,
      }}
    />
  );
};

const ConfettiLayer: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => (
  <>
    {CONFETTI_DOTS.map((dot, i) => (
      <ConfettiDot key={i} frame={frame} fps={fps} {...dot} />
    ))}
  </>
);

// ── Brand badge (top) ─────────────────────────────────────────────────────────
const BrandBadge: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame,
    fps,
    from: -24,
    to: 0,
    config: { damping: 18, stiffness: 140 },
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: 5,
        textTransform: "uppercase" as const,
        color: TEXT_MUTED,
        marginBottom: 24,
      }}
    >
      {BRAND}
    </div>
  );
};

// ── SALE title ────────────────────────────────────────────────────────────────
const SaleTitle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Overshoots to 1.2 then settles at 1
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 220, mass: 0.7 },
  });

  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle hue-pulse glow after entry
  const glowIntensity = interpolate(
    frame,
    [18, 35, 52, 70],
    [0.3, 1, 0.4, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: 148,
        color: TEXT_WHITE,
        letterSpacing: -6,
        lineHeight: 0.9,
        textShadow: `0 0 60px ${ACCENT_COLOR}${Math.round(glowIntensity * 255)
          .toString(16)
          .padStart(2, "0")}`,
      }}
    >
      SALE
    </div>
  );
};

// ── Discount badge ────────────────────────────────────────────────────────────
const DiscountBadge: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const delayed = Math.max(0, frame - 15);

  // Elastic slide from left
  const translateX = spring({
    frame: delayed,
    fps,
    from: -420,
    to: 0,
    config: { damping: 10, stiffness: 160, mass: 0.8 },
  });

  const opacity = interpolate(delayed, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        marginTop: 18,
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Left accent line */}
      <div
        style={{
          width: 6,
          height: 54,
          backgroundColor: ACCENT_COLOR,
          borderRadius: "4px 0 0 4px",
          marginRight: 16,
          boxShadow: `0 0 16px ${ACCENT_COLOR}`,
        }}
      />
      <div
        style={{
          backgroundColor: ACCENT_COLOR,
          borderRadius: 12,
          padding: "10px 30px",
          boxShadow: `0 8px 40px ${ACCENT_COLOR}55, 0 2px 12px ${ACCENT_COLOR}44`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 42,
            color: TEXT_WHITE,
            letterSpacing: -1,
          }}
        >
          {DISCOUNT_PCT}
        </span>
      </div>
    </div>
  );
};

// ── Pricing row ───────────────────────────────────────────────────────────────
const PricingRow: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Original price — fade in with strikethrough
  const origDelay = Math.max(0, frame - 24);
  const origOpacity = interpolate(origDelay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // New price — bounces in from above
  const newDelay = Math.max(0, frame - 30);
  const newY = spring({
    frame: newDelay,
    fps,
    from: -50,
    to: 0,
    config: { damping: 10, stiffness: 200, mass: 0.6 },
  });
  const newOpacity = interpolate(newDelay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        marginTop: 28,
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}
    >
      {/* Original price with strikethrough */}
      <div
        style={{
          opacity: origOpacity,
          position: "relative",
          display: "inline-block",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 32,
            color: TEXT_MUTED,
            letterSpacing: -0.5,
          }}
        >
          {ORIGINAL_PRICE}
        </span>
        {/* Strikethrough overlay */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: -4,
            right: -4,
            height: 3,
            backgroundColor: ACCENT_COLOR,
            borderRadius: 2,
            transform: "translateY(-50%) rotate(-6deg)",
            boxShadow: `0 0 8px ${ACCENT_COLOR}`,
          }}
        />
      </div>

      {/* Arrow separator */}
      <div
        style={{
          opacity: newOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 28,
          color: GOLD_COLOR,
          fontWeight: 700,
        }}
      >
        →
      </div>

      {/* New price */}
      <div
        style={{
          opacity: newOpacity,
          transform: `translateY(${newY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: GOLD_COLOR,
            letterSpacing: -1.5,
            textShadow: `0 0 30px ${GOLD_COLOR}88`,
          }}
        >
          {NEW_PRICE}
        </span>
      </div>
    </div>
  );
};

// ── Urgency tagline ───────────────────────────────────────────────────────────
const UrgencyTag: React.FC<{ frame: number }> = ({ frame }) => {
  const delayed = Math.max(0, frame - 44);
  const opacity = interpolate(delayed, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(delayed, [0, 16], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Pulse the dot
  const dotPulse = 0.65 + 0.35 * Math.sin((frame / 12) * Math.PI);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        marginTop: 32,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: ACCENT_COLOR,
          boxShadow: `0 0 ${10 * dotPulse}px ${ACCENT_COLOR}`,
          opacity: dotPulse,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          letterSpacing: 3,
          textTransform: "uppercase" as const,
          color: TEXT_MUTED,
        }}
      >
        Limited time offer
      </span>
    </div>
  );
};

// ── Decorative corner rings ───────────────────────────────────────────────────
const CornerRings: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const scale = spring({
    frame,
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 20, stiffness: 80 },
  });
  const opacity = interpolate(frame, [0, 20], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringStyle = (top: number, left: number): React.CSSProperties => ({
    position: "absolute",
    top,
    left,
    width: 200,
    height: 200,
    borderRadius: "50%",
    border: `2px solid ${ACCENT_COLOR}`,
    opacity,
    transform: `scale(${scale})`,
  });

  return (
    <>
      <div style={ringStyle(-60, -60)} />
      <div
        style={{
          ...ringStyle(-60, -60),
          width: 140,
          height: 140,
          top: -30,
          left: -30,
          opacity: opacity * 1.5,
        }}
      />
      <div style={ringStyle(580, 1140)} />
      <div
        style={{
          ...ringStyle(580, 1140),
          width: 140,
          height: 140,
          top: 610,
          left: 1170,
          opacity: opacity * 1.5,
        }}
      />
    </>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const SaleAnnouncementSpot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        opacity: globalOpacity,
        overflow: "hidden",
      }}
    >
      <Background />
      <CornerRings frame={frame} fps={fps} />
      <ConfettiLayer frame={frame} fps={fps} />

      {/* Centre stack */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrandBadge frame={frame} fps={fps} />
        <SaleTitle frame={frame} fps={fps} />
        <DiscountBadge frame={frame} fps={fps} />
        <PricingRow frame={frame} fps={fps} />
        <UrgencyTag frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Remotion root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="SaleAnnouncementSpot"
    component={SaleAnnouncementSpot}
    durationInFrames={90}
    fps={30}
    width={1280}
    height={720}
  />
);
