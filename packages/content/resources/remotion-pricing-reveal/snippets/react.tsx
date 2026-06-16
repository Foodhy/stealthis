import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";

// ── Design tokens ─────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE = "#12121a";
const CARD_BG = "#1a1a2e";
const BRAND = "#6366f1";
const BRAND_2 = "#8b5cf6";
const ACCENT = "#06b6d4";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";
const SUCCESS = "#10b981";

const DURATION = 300; // 10 s @ 30 fps

// ── Data ──────────────────────────────────────────────────────────────
interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  sub: string;
  cta: string;
  features: PricingFeature[];
  accent: string;
  glow: string;
  highlighted: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    sub: "per month, billed annually",
    cta: "Get started free",
    features: [
      { text: "Up to 3 team members" },
      { text: "5 active projects" },
      { text: "10 GB storage" },
      { text: "Standard analytics" },
    ],
    accent: ACCENT,
    glow: "rgba(6,182,212,0.12)",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    sub: "per month, billed annually",
    cta: "Start Pro trial",
    features: [
      { text: "Unlimited team members" },
      { text: "Unlimited projects" },
      { text: "100 GB storage" },
      { text: "Advanced analytics & reports" },
      { text: "Priority support 24/7" },
    ],
    accent: BRAND,
    glow: "rgba(99,102,241,0.22)",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    sub: "per month, billed annually",
    cta: "Contact sales",
    features: [
      { text: "Everything in Pro" },
      { text: "Unlimited storage" },
      { text: "Custom SSO & SAML" },
      { text: "SLA 99.99% uptime" },
      { text: "Dedicated account manager" },
    ],
    accent: BRAND_2,
    glow: "rgba(139,92,246,0.14)",
    highlighted: false,
  },
];

// ── Helper: clamp interpolate ─────────────────────────────────────────
function lerp(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easing?: (t: number) => number
) {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

// ── Checkmark icon ────────────────────────────────────────────────────
const Check: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ flexShrink: 0, marginTop: 2 }}
  >
    <circle cx="8" cy="8" r="8" fill={color} fillOpacity={0.15} />
    <path
      d="M4.5 8.5L7 11L11.5 6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── "Most Popular" badge ──────────────────────────────────────────────
const PopularBadge: React.FC<{ frame: number; cardStartFrame: number; fps: number }> = ({
  frame,
  cardStartFrame,
  fps,
}) => {
  // Pulse every ~1.5s after card settles
  const localFrame = Math.max(0, frame - cardStartFrame - 20);
  const pulsePhase = (localFrame % 45) / 45;
  const pulseScale = interpolate(
    Math.sin(pulsePhase * Math.PI * 2),
    [-1, 1],
    [0.96, 1.04]
  );
  const glowOpacity = interpolate(
    Math.sin(pulsePhase * Math.PI * 2),
    [-1, 1],
    [0.6, 1.0]
  );

  const badgeReveal = spring({
    frame: Math.max(0, frame - cardStartFrame),
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: -16,
        left: "50%",
        transform: `translateX(-50%) scale(${pulseScale * badgeReveal})`,
        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
        borderRadius: 20,
        padding: "5px 18px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 700,
        fontSize: 12,
        color: "#fff",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        boxShadow: `0 0 20px rgba(99,102,241,${glowOpacity * 0.7})`,
        zIndex: 10,
      }}
    >
      Most Popular
    </div>
  );
};

// ── Feature row ───────────────────────────────────────────────────────
const FeatureRow: React.FC<{
  text: string;
  index: number;
  cardStartFrame: number;
  frame: number;
  fps: number;
  accent: string;
}> = ({ text, index, cardStartFrame, frame, fps, accent }) => {
  // Each feature staggers in 12 frames after the previous
  const featureDelay = cardStartFrame + 18 + index * 12;
  const localFrame = Math.max(0, frame - featureDelay);

  const progress = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 160, mass: 0.7 },
  });

  const opacity = lerp(localFrame, [0, 8], [0, 1], Easing.out(Easing.quad));
  const translateX = interpolate(progress, [0, 1], [-16, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        opacity,
        transform: `translateX(${translateX}px)`,
        marginBottom: 10,
      }}
    >
      <Check color={accent} />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          color: TEXT_MUTED,
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ── Pricing card ──────────────────────────────────────────────────────
const CARD_ENTER_START = 30;
const CARD_STAGGER = 22; // frames between each card's entrance

const PricingCard: React.FC<{
  plan: PricingPlan;
  index: number;
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ plan, index, frame, fps, durationInFrames }) => {
  const cardStartFrame = CARD_ENTER_START + index * CARD_STAGGER;
  const localFrame = Math.max(0, frame - cardStartFrame);

  // Card entrance: spring bounce from below
  const slideProgress = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: plan.highlighted
      ? { damping: 13, stiffness: 130, mass: 0.85 }
      : { damping: 16, stiffness: 120, mass: 0.8 },
  });

  const translateY = interpolate(slideProgress, [0, 1], [80, 0]);
  const cardOpacity = lerp(localFrame, [0, 10], [0, 1], Easing.out(Easing.quad));

  // Pro card scale-pop: at frame 170 (after all cards are in)
  const scalePop =
    plan.highlighted
      ? spring({
          frame: Math.max(0, frame - 170),
          fps,
          from: 1,
          to: 1,
          config: { damping: 10, stiffness: 250, mass: 0.5 },
        })
      : 1;

  // Override: use a specific pop animation for the Pro card
  const proPopFrame = Math.max(0, frame - 175);
  const proScale = plan.highlighted
    ? spring({
        frame: proPopFrame,
        fps,
        from: proPopFrame < 2 ? 1 : undefined,
        to: 1,
        config: { damping: 9, stiffness: 280, mass: 0.45 },
      })
    : 1;

  // Subtle initial pop at frame 175 (after all cards entered)
  const popTrigger = Math.max(0, frame - 175);
  const popScale = plan.highlighted
    ? interpolate(
        spring({
          frame: popTrigger,
          fps,
          from: 0,
          to: 1,
          config: { damping: 8, stiffness: 300, mass: 0.4 },
        }),
        [0, 1],
        [1, 1.035],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  // Glow pulse for Pro card
  const glowPulse = plan.highlighted
    ? lerp(
        Math.sin(((frame - cardStartFrame) / 90) * Math.PI * 2),
        [-1, 1],
        [0.7, 1.0]
      )
    : 1;

  const cardWidth = plan.highlighted ? 310 : 278;
  const cardHeight = plan.highlighted ? 440 : 410;

  return (
    <div
      style={{
        position: "relative",
        opacity: cardOpacity,
        transform: `translateY(${translateY}px) scale(${popScale})`,
        width: cardWidth,
        height: cardHeight,
        backgroundColor: plan.highlighted ? CARD_BG : SURFACE,
        borderRadius: 20,
        border: plan.highlighted
          ? `1.5px solid ${BRAND}`
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: plan.highlighted
          ? `0 0 60px rgba(99,102,241,${0.28 * glowPulse}), 0 8px 32px rgba(0,0,0,0.5)`
          : "0 4px 20px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 28px 28px",
        overflow: "visible",
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 260,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${plan.glow} 0%, transparent 70%)`,
          filter: "blur(30px)",
          opacity: glowPulse,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Most popular badge */}
      {plan.highlighted && (
        <PopularBadge
          frame={frame}
          cardStartFrame={cardStartFrame}
          fps={fps}
        />
      )}

      {/* Plan name */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: plan.accent,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          position: "relative",
          zIndex: 1,
        }}
      >
        {plan.name}
      </div>

      {/* Price */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginTop: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: plan.highlighted ? 56 : 48,
            color: TEXT,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {plan.price}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: TEXT_MUTED,
            lineHeight: 1.4,
            maxWidth: 70,
          }}
        >
          /mo
        </span>
      </div>

      {/* Billed annually */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: TEXT_MUTED,
          marginTop: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        {plan.sub}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.07)",
          margin: "20px 0",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Features */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {plan.features.map((f, i) => (
          <FeatureRow
            key={f.text}
            text={f.text}
            index={i}
            cardStartFrame={cardStartFrame}
            frame={frame}
            fps={fps}
            accent={plan.accent}
          />
        ))}
      </div>

      {/* CTA button */}
      <CtaButton
        label={plan.cta}
        accent={plan.accent}
        highlighted={plan.highlighted}
        cardStartFrame={cardStartFrame}
        frame={frame}
        fps={fps}
      />
    </div>
  );
};

// ── CTA button ────────────────────────────────────────────────────────
const CtaButton: React.FC<{
  label: string;
  accent: string;
  highlighted: boolean;
  cardStartFrame: number;
  frame: number;
  fps: number;
}> = ({ label, accent, highlighted, cardStartFrame, frame, fps }) => {
  // Button fades in after features are done
  const btnDelay = cardStartFrame + 80;
  const localFrame = Math.max(0, frame - btnDelay);

  const progress = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 140, mass: 0.7 },
  });

  const opacity = lerp(localFrame, [0, 10], [0, 1], Easing.out(Easing.quad));
  const translateY = interpolate(progress, [0, 1], [12, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        marginTop: 20,
        borderRadius: 12,
        background: highlighted
          ? `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`
          : "rgba(255,255,255,0.06)",
        border: highlighted ? "none" : `1px solid rgba(255,255,255,0.1)`,
        padding: "13px 0",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: highlighted ? "#fff" : TEXT_MUTED,
        letterSpacing: "0.02em",
        position: "relative",
        zIndex: 1,
        boxShadow: highlighted
          ? `0 4px 20px rgba(99,102,241,0.35)`
          : "none",
      }}
    >
      {label}
    </div>
  );
};

// ── Header ────────────────────────────────────────────────────────────
const Header: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 100, mass: 0.9 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [-20, 0]);
  const titleOpacity = lerp(frame, [0, 15], [0, 1], Easing.out(Easing.quad));

  const subOpacity = lerp(frame, [10, 28], [0, 1], Easing.out(Easing.quad));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 44,
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          opacity: subOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 12,
          color: BRAND,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Flowbase — Simple Pricing
      </div>

      {/* Main heading */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 42,
          color: TEXT,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        Choose your plan
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          color: TEXT_MUTED,
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Scale as you grow. Upgrade or downgrade at any time.
      </div>
    </div>
  );
};

// ── Footer tagline ────────────────────────────────────────────────────
const FooterTagline: React.FC<{ frame: number }> = ({ frame }) => {
  // Appears after all cards + features are done, around frame 240
  const opacity = lerp(frame, [238, 260], [0, 1], Easing.out(Easing.cubic));
  const translateY = lerp(frame, [238, 260], [12, 0], Easing.out(Easing.cubic));

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        marginTop: 36,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 500,
        fontSize: 14,
        color: TEXT_MUTED,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke={SUCCESS} strokeOpacity={0.6} />
        <path
          d="M5 8.5L7 10.5L11 6.5"
          stroke={SUCCESS}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      14-day free trial — no credit card required
    </div>
  );
};

// ── Background decoration ─────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = interpolate(
    Math.sin((frame / 180) * Math.PI * 2),
    [-1, 1],
    [0.7, 1.0]
  );

  return (
    <>
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />
      {/* Top-center hero glow */}
      <div
        style={{
          position: "absolute",
          top: -160,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)`,
          filter: "blur(60px)",
          opacity: pulse,
          pointerEvents: "none",
        }}
      />
      {/* Bottom-right accent */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)`,
          filter: "blur(50px)",
          opacity: pulse * 0.8,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const PricingReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade out in last 0.5s (15 frames)
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
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
      <Background frame={frame} />

      {/* Layout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px 32px",
        }}
      >
        <Header frame={frame} fps={fps} />

        {/* Cards row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 18,
          }}
        >
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={i}
              frame={frame}
              fps={fps}
              durationInFrames={durationInFrames}
            />
          ))}
        </div>

        <FooterTagline frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="PricingReveal"
    component={PricingReveal}
    durationInFrames={DURATION}
    fps={30}
    width={1280}
    height={720}
  />
);
