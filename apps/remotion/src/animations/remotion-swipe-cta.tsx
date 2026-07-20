import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CONFIG = {
  // Colors
  bgOverlay: "rgba(0,0,0,0.55)",
  gradientStart: "rgba(0,0,0,0.85)",
  gradientEnd: "rgba(0,0,0,0)",
  accentColor: "#ffffff",
  secondaryColor: "rgba(255,255,255,0.55)",
  pulseColor: "rgba(255,255,255,0.18)",
  // Typography
  ctaText: "SWIPE UP",
  learnMoreText: "Learn More →",
  // Sizing
  arrowFontSize: 96,
  ctaFontSize: 44,
  learnMoreFontSize: 28,
  handEmojiFontSize: 72,
  pulseSize: 160,
  // Animation
  arrowBounceAmplitude: 22,   // px
  handSlideDistance: 220,     // px upward travel per loop
  pulseMin: 0.88,
  pulseMax: 1.12,
  loopFrames: 60,              // frames per sub-loop (2 s)
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Returns a value that oscillates smoothly between 0 and 1 over `period` frames,
 * peaking at frame period/2, using a sine curve.
 */
function sinePingPong(frame: number, period: number): number {
  const t = (frame % period) / period; // 0..1
  return Math.sin(t * Math.PI); // 0 → 1 → 0
}

// ─── GRADIENT OVERLAY ──────────────────────────────────────────────────────────
const GradientOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "55%",
      background: `linear-gradient(to top, ${CONFIG.gradientStart} 0%, ${CONFIG.gradientEnd} 100%)`,
      pointerEvents: "none",
    }}
  />
);

// ─── BACKGROUND PANEL ──────────────────────────────────────────────────────────
const BackgroundPanel: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      background:
        "radial-gradient(ellipse at 50% 110%, rgba(80,60,180,0.25) 0%, rgba(0,0,0,0) 65%)",
      opacity,
    }}
  />
);

// ─── PULSING RING ──────────────────────────────────────────────────────────────
const PulsingRing: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = interpolate(
    sinePingPong(frame, CONFIG.loopFrames),
    [0, 1],
    [CONFIG.pulseMin, CONFIG.pulseMax],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    sinePingPong(frame, CONFIG.loopFrames),
    [0, 0.5, 1],
    [0.5, 1, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        width: CONFIG.pulseSize,
        height: CONFIG.pulseSize,
        borderRadius: "50%",
        border: `3px solid ${CONFIG.pulseColor}`,
        backgroundColor: "rgba(255,255,255,0.05)",
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
};

// ─── BOUNCING ARROW ────────────────────────────────────────────────────────────
const BouncingArrow: React.FC<{ frame: number }> = ({ frame }) => {
  const bounce = interpolate(
    sinePingPong(frame, CONFIG.loopFrames),
    [0, 1],
    [0, -CONFIG.arrowBounceAmplitude],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        fontSize: CONFIG.arrowFontSize,
        lineHeight: 1,
        color: CONFIG.accentColor,
        transform: `translateY(${bounce}px)`,
        userSelect: "none",
        textShadow: "0 0 40px rgba(255,255,255,0.4)",
      }}
    >
      ↑
    </div>
  );
};

// ─── HAND EMOJI (SLIDING UP LOOP) ──────────────────────────────────────────────
const HandEmoji: React.FC<{ frame: number }> = ({ frame }) => {
  const loopProgress = (frame % CONFIG.loopFrames) / CONFIG.loopFrames; // 0..1

  // Ease in-out for the slide; reset sharply at loop boundary
  const eased = Easing.inOut(Easing.sin)(loopProgress);
  const translateY = interpolate(eased, [0, 1], [0, -CONFIG.handSlideDistance], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out near the end of each loop so the reset is invisible
  const opacity = interpolate(loopProgress, [0, 0.1, 0.8, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontSize: CONFIG.handEmojiFontSize,
        lineHeight: 1,
        transform: `translateY(${translateY}px)`,
        opacity,
        userSelect: "none",
      }}
    >
      ☝️
    </div>
  );
};

// ─── LEARN MORE LABEL ──────────────────────────────────────────────────────────
const LearnMoreLabel: React.FC<{ frame: number }> = ({ frame }) => {
  // Fade in during first 20 frames
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontSize: CONFIG.learnMoreFontSize,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 400,
        color: CONFIG.secondaryColor,
        letterSpacing: 2,
        opacity,
        marginBottom: 18,
      }}
    >
      {CONFIG.learnMoreText}
    </div>
  );
};

// ─── SWIPE UP TEXT ─────────────────────────────────────────────────────────────
const SwipeUpText: React.FC<{ frame: number }> = ({ frame }) => {
  // Slide up + fade in during first 25 frames
  const opacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [5, 25], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        fontSize: CONFIG.ctaFontSize,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        color: CONFIG.accentColor,
        letterSpacing: 10,
        textTransform: "uppercase" as const,
        opacity,
        transform: `translateY(${translateY}px)`,
        marginTop: 16,
        textShadow: "0 2px 20px rgba(0,0,0,0.6)",
      }}
    >
      {CONFIG.ctaText}
    </div>
  );
};

// ─── MAIN COMPOSITION ──────────────────────────────────────────────────────────
export const SwipeCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Background panel fades in over first 30 frames
  const bgOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA group sits at 80% of vertical height
  const ctaTop = height * 0.80;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "rgba(18,12,36,1)",
        width,
        height,
        overflow: "hidden",
      }}
    >
      {/* Ambient background radial glow */}
      <BackgroundPanel opacity={bgOpacity} />

      {/* Bottom gradient overlay */}
      <GradientOverlay />

      {/* CTA group — centered horizontally, anchored to 80% height */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ctaTop,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* "Learn More →" label */}
        <LearnMoreLabel frame={frame} />

        {/* Pulse ring + arrow stacked in same slot */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: CONFIG.pulseSize,
            height: CONFIG.pulseSize,
          }}
        >
          <PulsingRing frame={frame} />
          <BouncingArrow frame={frame} />
        </div>

        {/* "SWIPE UP" text */}
        <SwipeUpText frame={frame} />

        {/* Hand emoji slides up from below text */}
        <div
          style={{
            marginTop: 28,
            height: 80,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <HandEmoji frame={frame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="SwipeCTA"
    component={SwipeCTA}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
  />
);
