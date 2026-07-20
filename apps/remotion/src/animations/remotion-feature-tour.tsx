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

// ── Brand / theme ──────────────────────────────────────────────────────────────
const BG       = "#0c0c12";
const SURFACE  = "#13131f";
const CARD     = "#1a1a2a";
const CYAN     = "#06b6d4";
const CYAN_DIM = "#0891b2";
const TEXT     = "#f8fafc";
const MUTED    = "rgba(248,250,252,0.50)";
const SUBTLE   = "rgba(248,250,252,0.08)";

const PRODUCT  = "Nexus CRM";

// ── Feature data ───────────────────────────────────────────────────────────────
interface Feature {
  icon: string;
  title: string;
  tag: string;
  desc: string;
  sub: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: "⚡",
    title: "Instant Sync",
    tag: "Real-time",
    desc: "Your data, everywhere, the moment it changes.",
    sub: "Live updates across all devices — zero lag, zero conflicts.",
    accent: CYAN,
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    tag: "SOC 2 Certified",
    desc: "Bank-grade protection for your entire pipeline.",
    sub: "End-to-end encryption, SSO, audit logs, and role-based access control.",
    accent: "#a78bfa",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    tag: "AI-Powered",
    desc: "Insights that find you — before you even ask.",
    sub: "Custom dashboards, predictive models, and anomaly detection built in.",
    accent: "#f59e0b",
  },
  {
    icon: "🔗",
    title: "300+ Integrations",
    tag: "One-Click",
    desc: "Connect your entire stack without writing a line of code.",
    sub: "Slack, Salesforce, HubSpot, Stripe, Zapier, and 295 more — ready to go.",
    accent: "#34d399",
  },
  {
    icon: "🎯",
    title: "Goal Tracking",
    tag: "Precision",
    desc: "Set it. Track it. Hit it. Every time.",
    sub: "Visual progress rings, milestone alerts, and team accountability boards.",
    accent: "#fb7185",
  },
];

// Each feature card occupies 60 frames. 5 × 60 = 300 total.
const FRAMES_PER_CARD = 60;
const TOTAL_FRAMES    = 300;

// ── Sub-component: Background layer (dot grid + glows) ─────────────────────────
function Background() {
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Subtle dot grid */}
      <svg
        width="1280"
        height="720"
        style={{ position: "absolute", inset: 0, opacity: 0.35 }}
      >
        <defs>
          <pattern
            id="ftgrid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="rgba(248,250,252,0.25)" />
          </pattern>
        </defs>
        <rect width="1280" height="720" fill="url(#ftgrid)" />
      </svg>

      {/* Radial cyan glow — left */}
      <div
        style={{
          position: "absolute",
          left: -160,
          top: "50%",
          transform: "translateY(-50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Radial violet glow — right */}
      <div
        style={{
          position: "absolute",
          right: -200,
          top: "50%",
          transform: "translateY(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}

// ── Sub-component: Top header bar (rendered once in root, always visible) ─────
function HeaderBar() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.7 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 60,
        paddingRight: 60,
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [-20, 0])}px)`,
        zIndex: 20,
      }}
    >
      {/* Logo wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${CYAN}, ${CYAN_DIM})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            boxShadow: `0 0 16px ${CYAN}55`,
          }}
        >
          ◈
        </div>
        <span
          style={{
            fontFamily: "system-ui,-apple-system,sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: "-0.01em",
          }}
        >
          {PRODUCT}
        </span>
      </div>

      {/* Label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: SUBTLE,
          border: "1px solid rgba(248,250,252,0.12)",
          borderRadius: 100,
          padding: "6px 16px",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui,-apple-system,sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: MUTED,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Feature Tour
        </span>
      </div>
    </div>
  );
}

// ── Sub-component: Progress dots (rendered in root, uses global frame) ─────────
function ProgressDots({ globalFrame }: { globalFrame: number }) {
  const { fps } = useVideoConfig();
  const activeIndex = Math.min(
    Math.floor(globalFrame / FRAMES_PER_CARD),
    FEATURES.length - 1
  );

  const enter = spring({
    frame: globalFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: enter,
        zIndex: 20,
      }}
    >
      {FEATURES.map((feat, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            style={{
              width: isActive ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: isActive ? feat.accent : "rgba(248,250,252,0.18)",
              boxShadow: isActive ? `0 0 10px ${feat.accent}99` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Sub-component: Feature number indicator (rendered in root) ─────────────────
function FeatureCounter({ globalFrame }: { globalFrame: number }) {
  const { fps } = useVideoConfig();
  const activeIndex = Math.min(
    Math.floor(globalFrame / FRAMES_PER_CARD),
    FEATURES.length - 1
  );
  const accent = FEATURES[activeIndex].accent;

  // Re-animate on each card change
  const localFrame = globalFrame % FRAMES_PER_CARD;
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 160 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 88,
        left: 60,
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [10, 0])}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${accent}18`,
          border: `1px solid ${accent}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 13,
          fontWeight: 800,
          color: accent,
          boxShadow: `0 0 12px ${accent}33`,
        }}
      >
        {activeIndex + 1}
      </div>
      <span
        style={{
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: MUTED,
          letterSpacing: "0.06em",
        }}
      >
        of {FEATURES.length}
      </span>
    </div>
  );
}

// ── Sub-component: Feature card — reads its own local frame via useCurrentFrame
function FeatureCardInner({ feature }: { feature: Feature }) {
  const localFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in from right over first ~28 frames, then slide out left 44→60
  const HOLD_END      = 44;
  const SLIDE_OUT_END = FRAMES_PER_CARD;

  const slideInProg = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 110, mass: 0.8 },
  });

  const slideOutProg = interpolate(
    localFrame,
    [HOLD_END, SLIDE_OUT_END],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    }
  );

  const translateX = interpolate(slideInProg, [0, 1], [200, 0]) - slideOutProg * 240;
  const opacity    = interpolate(slideInProg, [0, 1], [0, 1]) * (1 - slideOutProg * 0.75);
  const scale      = interpolate(slideInProg, [0, 1], [0.92, 1]);

  // Staggered inner element entrances
  const tagEnter  = spring({ frame: Math.max(0, localFrame - 6),  fps, config: { damping: 22, stiffness: 160 } });
  const iconEnter = spring({ frame: Math.max(0, localFrame - 10), fps, config: { damping: 18, stiffness: 120 } });
  const headEnter = spring({ frame: Math.max(0, localFrame - 14), fps, config: { damping: 20, stiffness: 130 } });
  const descEnter = spring({ frame: Math.max(0, localFrame - 20), fps, config: { damping: 22, stiffness: 140 } });
  const subEnter  = spring({ frame: Math.max(0, localFrame - 25), fps, config: { damping: 22, stiffness: 140 } });
  const linkEnter = spring({ frame: Math.max(0, localFrame - 30), fps, config: { damping: 22, stiffness: 150 } });

  const { accent } = feature;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
        opacity,
        width: 660,
        background: CARD,
        border: `1px solid ${accent}33`,
        borderRadius: 20,
        padding: "48px 56px 44px",
        boxShadow: `0 32px 80px rgba(0,0,0,0.65), 0 0 60px ${accent}18`,
      }}
    >
      {/* Accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 56,
          right: 56,
          height: 2,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
          borderRadius: "0 0 2px 2px",
        }}
      />

      {/* Tag pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: `${accent}15`,
          border: `1px solid ${accent}44`,
          borderRadius: 100,
          padding: "5px 14px",
          marginBottom: 24,
          opacity: tagEnter,
          transform: `translateY(${interpolate(tagEnter, [0, 1], [8, 0])}px)`,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui,-apple-system,sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {feature.tag}
        </span>
      </div>

      {/* Icon */}
      <div
        style={{
          fontSize: 80,
          lineHeight: 1,
          marginBottom: 20,
          opacity: iconEnter,
          transform: `translateY(${interpolate(iconEnter, [0, 1], [16, 0])}px) scale(${interpolate(iconEnter, [0, 1], [0.65, 1])})`,
          filter: `drop-shadow(0 8px 24px ${accent}55)`,
          display: "block",
        }}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h2
        style={{
          margin: "0 0 12px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 48,
          fontWeight: 800,
          color: TEXT,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          opacity: headEnter,
          transform: `translateY(${interpolate(headEnter, [0, 1], [14, 0])}px)`,
        }}
      >
        {feature.title}
      </h2>

      {/* Primary description */}
      <p
        style={{
          margin: "0 0 8px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 22,
          fontWeight: 500,
          color: TEXT,
          lineHeight: 1.4,
          opacity: descEnter,
          transform: `translateY(${interpolate(descEnter, [0, 1], [10, 0])}px)`,
        }}
      >
        {feature.desc}
      </p>

      {/* Sub-description */}
      <p
        style={{
          margin: "0 0 28px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 15,
          fontWeight: 400,
          color: MUTED,
          lineHeight: 1.65,
          opacity: subEnter,
          transform: `translateY(${interpolate(subEnter, [0, 1], [8, 0])}px)`,
        }}
      >
        {feature.sub}
      </p>

      {/* Ghost CTA */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 22px",
          borderRadius: 10,
          border: `1px solid ${accent}55`,
          background: `${accent}0d`,
          opacity: linkEnter,
          transform: `translateY(${interpolate(linkEnter, [0, 1], [8, 0])}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui,-apple-system,sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: accent,
          }}
        >
          Learn more →
        </span>
      </div>
    </div>
  );
}

// ── Sub-component: Right-side stat panel — reads its own local frame ──────────
interface StatItem {
  value: string;
  label: string;
}

const FEATURE_STATS: StatItem[][] = [
  [
    { value: "< 50ms", label: "Sync latency" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "12",     label: "Devices per user" },
  ],
  [
    { value: "SOC 2",  label: "Type II certified" },
    { value: "256-bit",label: "AES encryption" },
    { value: "GDPR",   label: "Compliant" },
  ],
  [
    { value: "40+",    label: "Report templates" },
    { value: "Live",   label: "Data refresh" },
    { value: "AI",     label: "Anomaly alerts" },
  ],
  [
    { value: "300+",   label: "Native connectors" },
    { value: "1-click",label: "OAuth setup" },
    { value: "REST",   label: "Webhook support" },
  ],
  [
    { value: "OKR",    label: "Framework built-in" },
    { value: "Daily",  label: "Check-in reminders" },
    { value: "Team",   label: "Leaderboards" },
  ],
];

function StatPanelInner({ featureIndex }: { featureIndex: number }) {
  const localFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stats = FEATURE_STATS[featureIndex];
  const accent = FEATURES[featureIndex].accent;

  const panelEnter = spring({
    frame: Math.max(0, localFrame - 14),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.8 },
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: "50%",
        transform: `translateY(-50%) translateX(${interpolate(panelEnter, [0, 1], [50, 0])}px)`,
        opacity: interpolate(panelEnter, [0, 1], [0, 1]),
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: 190,
      }}
    >
      {stats.map((stat, i) => {
        const itemEnter = spring({
          frame: Math.max(0, localFrame - 18 - i * 6),
          fps,
          config: { damping: 22, stiffness: 140 },
        });
        return (
          <div
            key={i}
            style={{
              background: SURFACE,
              border: `1px solid ${accent}22`,
              borderLeft: `3px solid ${accent}`,
              borderRadius: 10,
              padding: "12px 16px",
              opacity: interpolate(itemEnter, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(itemEnter, [0, 1], [24, 0])}px)`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
            }}
          >
            <div
              style={{
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: accent,
                lineHeight: 1,
                marginBottom: 4,
                letterSpacing: "-0.01em",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: MUTED,
                letterSpacing: "0.03em",
              }}
            >
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Root composition ───────────────────────────────────────────────────────────
function FeatureTourVideo() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Global fade-in / fade-out
  const globalOpacity = interpolate(
    frame,
    [0, 8, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: globalOpacity }}>
      {/* Persistent background */}
      <Background />

      {/* Persistent header (frame 0 of overall video) */}
      <HeaderBar />

      {/* Feature number indicator — re-animates per card */}
      <FeatureCounter globalFrame={frame} />

      {/* Feature cards — one Sequence per feature */}
      {FEATURES.map((feature, i) => (
        <Sequence
          key={i}
          from={i * FRAMES_PER_CARD}
          durationInFrames={FRAMES_PER_CARD}
        >
          <FeatureCardInner feature={feature} />
          <StatPanelInner featureIndex={i} />
        </Sequence>
      ))}

      {/* Progress dots */}
      <ProgressDots globalFrame={frame} />
    </AbsoluteFill>
  );
}

// ── RemotionRoot (required entry point) ───────────────────────────────────────
export function RemotionRoot() {
  return (
    <Composition
      id="FeatureTourVideo"
      component={FeatureTourVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1280}
      height={720}
    />
  );
}

export default FeatureTourVideo;
