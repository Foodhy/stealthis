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
const CARD = "#1a1a2e";
const BRAND = "#6366f1";
const BRAND_2 = "#8b5cf6";
const ACCENT = "#06b6d4";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";
const SUCCESS = "#10b981";

const DURATION = 300; // 10s @ 30fps

// ── Feature highlights data ───────────────────────────────────────────
interface FeatureItem {
  icon: string;
  label: string;
  desc: string;
  accent: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: "⚡",
    label: "Real-time Insights",
    desc: "Live data streams processed in under 50ms",
    accent: BRAND,
  },
  {
    icon: "◈",
    label: "Custom Dashboards",
    desc: "Drag-and-drop builder with 40+ widget types",
    accent: BRAND_2,
  },
  {
    icon: "◎",
    label: "Smart Alerts",
    desc: "AI-driven anomaly detection on any metric",
    accent: ACCENT,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function fadeIn(
  frame: number,
  start: number,
  end: number,
  ease = Easing.out(Easing.quad)
): number {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}

// ── Radial Glow Burst ─────────────────────────────────────────────────
// Full-screen burst that blazes in and then settles to a soft background glow
const RadialBurst: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Burst scale: explodes then scales back to calm glow
  const burstScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 60, mass: 1.2 },
  });

  // Opacity: full burst at start, settles to a dim ambient glow
  const outerOpacity = interpolate(frame, [0, 20, 60, 120], [0, 1, 0.5, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const innerOpacity = interpolate(frame, [0, 15, 45, 100], [0, 1, 0.6, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const burstSize = interpolate(burstScale, [0, 1], [200, 900]);

  return (
    <>
      {/* Outer radial */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: burstSize * 1.4,
          height: burstSize * 1.4,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)`,
          filter: "blur(60px)",
          opacity: outerOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Inner hot core */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: burstSize * 0.5,
          height: burstSize * 0.5,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(99,102,241,0.3) 50%, transparent 80%)`,
          filter: "blur(30px)",
          opacity: innerOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Accent cyan streak */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -60,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)`,
          filter: "blur(80px)",
          opacity: clamp(outerOpacity * 1.5, 0, 0.4),
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── "NEW" Pill Badge ───────────────────────────────────────────────────
const NewBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 9, stiffness: 220, mass: 0.6 },
  });
  const opacity = fadeIn(frame, 0, 12);

  // Subtle pulsing glow
  const glowPulse = interpolate(
    Math.sin((frame / 45) * Math.PI),
    [-1, 1],
    [0.55, 1.0]
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: `rgba(99,102,241,0.18)`,
        border: `1.5px solid rgba(139,92,246,0.55)`,
        borderRadius: 100,
        padding: "7px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        fontSize: 13,
        color: BRAND_2,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        boxShadow: `0 0 ${24 * glowPulse}px rgba(139,92,246,${0.4 * glowPulse}), 0 0 ${50 * glowPulse}px rgba(99,102,241,${0.18 * glowPulse})`,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: BRAND_2,
          boxShadow: `0 0 8px ${BRAND_2}`,
        }}
      />
      NEW
    </div>
  );
};

// ── Feature Name (flies in from left) ─────────────────────────────────
const FeatureName: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = Math.max(0, frame - 18);

  const slideX = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
  });

  const translateX = interpolate(slideX, [0, 1], [-140, 0]);
  const opacity = interpolate(slideX, [0, 0.25], [0, 1], {
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
        fontSize: 68,
        color: TEXT,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <span>AI-Powered</span>
      <span
        style={{
          background: `linear-gradient(90deg, ${BRAND} 0%, ${BRAND_2} 55%, ${ACCENT} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Analytics
      </span>
    </div>
  );
};

// ── Tagline (slides up from below) ────────────────────────────────────
const Tagline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = Math.max(0, frame - 38);

  const slideY = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 16, stiffness: 120, mass: 0.75 },
  });

  const translateY = interpolate(slideY, [0, 1], [40, 0]);
  const opacity = interpolate(slideY, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 400,
        fontSize: 22,
        color: TEXT_MUTED,
        letterSpacing: "-0.01em",
        lineHeight: 1.5,
        maxWidth: 560,
        marginTop: 12,
      }}
    >
      Turn raw product data into clear decisions — <br />
      shipped directly into your{" "}
      <span style={{ color: TEXT, fontWeight: 600 }}>Flowbase</span> workspace.
    </div>
  );
};

// ── Feature Highlight Card ─────────────────────────────────────────────
const FeatureCard: React.FC<{
  item: FeatureItem;
  index: number;
  frame: number;
  fps: number;
}> = ({ item, index, frame, fps }) => {
  const STAGGER_START = 120; // frame when 3-up section begins
  const delay = STAGGER_START + index * 22;
  const localFrame = Math.max(0, frame - delay);

  const enter = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 130, mass: 0.7 },
  });

  const translateY = interpolate(enter, [0, 1], [50, 0]);
  const opacity = interpolate(enter, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Icon pop
  const iconScale = spring({
    frame: localFrame,
    fps,
    from: 0.3,
    to: 1,
    config: { damping: 10, stiffness: 280, mass: 0.5 },
  });

  return (
    <div
      style={{
        flex: "1 1 0",
        opacity,
        transform: `translateY(${translateY}px)`,
        backgroundColor: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderTop: `3px solid ${item.accent}`,
        borderRadius: 16,
        padding: "28px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Card glow blob */}
      <div
        style={{
          position: "absolute",
          top: -30,
          left: -20,
          width: 160,
          height: 160,
          borderRadius: "50%",
          backgroundColor: item.accent,
          filter: "blur(55px)",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          fontSize: 32,
          transform: `scale(${iconScale})`,
          display: "inline-block",
          lineHeight: 1,
        }}
      >
        {item.icon}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          color: TEXT,
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}
      >
        {item.label}
      </div>

      {/* Description */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          color: TEXT_MUTED,
          lineHeight: 1.5,
        }}
      >
        {item.desc}
      </div>
    </div>
  );
};

// ── Closing CTA (logo + "Available now") ──────────────────────────────
const ClosingCta: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const CTA_START = 215;
  const localFrame = Math.max(0, frame - CTA_START);

  const enter = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 15, stiffness: 100, mass: 0.8 },
  });

  const translateY = interpolate(enter, [0, 1], [30, 0]);
  const opacity = interpolate(enter, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Divider line width
  const lineWidth = interpolate(enter, [0.1, 1], [0, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // CTA pill glow
  const glowPulse = interpolate(
    Math.sin((frame / 40) * Math.PI),
    [-1, 1],
    [0.6, 1.0]
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* Divider */}
      <div
        style={{
          width: lineWidth,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)`,
        }}
      />

      {/* Logo wordmark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 16px rgba(99,102,241,0.45)`,
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            F
          </span>
        </div>

        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: TEXT,
            letterSpacing: "-0.02em",
          }}
        >
          Flowbase
        </span>
      </div>

      {/* "Available now" pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: `rgba(16,185,129,0.12)`,
          border: `1.5px solid rgba(16,185,129,0.45)`,
          borderRadius: 100,
          padding: "10px 26px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: SUCCESS,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          boxShadow: `0 0 ${20 * glowPulse}px rgba(16,185,129,${0.25 * glowPulse})`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: SUCCESS,
            boxShadow: `0 0 8px ${SUCCESS}`,
          }}
        />
        Available Now
      </div>
    </div>
  );
};

// ── Grid overlay ───────────────────────────────────────────────────────
const GridOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
      backgroundSize: "72px 72px",
      pointerEvents: "none",
    }}
  />
);

// ── Main composition ───────────────────────────────────────────────────
export const FeatureAnnounce: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out last 0.5s (15 frames)
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Phase 1 (frames 0–100): hero title section visible
  // Phase 2 (frames 100–215): hero fades to bg, feature cards come in
  // Phase 3 (frames 215–300): CTA
  const heroOpacity = interpolate(frame, [80, 115], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  const featureSectionOpacity = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const ctaSectionOpacity = interpolate(frame, [210, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: globalOpacity,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <GridOverlay />
      <RadialBurst frame={frame} fps={fps} />

      {/* ── PHASE 1: Hero ───────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: heroOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: "0 80px",
        }}
      >
        {/* "NEW" badge */}
        <NewBadge frame={frame} fps={fps} />

        {/* Feature name */}
        <FeatureName frame={frame} fps={fps} />

        {/* Tagline */}
        <Tagline frame={frame} fps={fps} />
      </div>

      {/* ── PHASE 2: 3-up feature highlights ────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: featureSectionOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          padding: "48px 72px",
          gap: 28,
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            opacity: interpolate(frame, [108, 128], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          What's included
        </div>

        {/* Feature cards row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 20,
          }}
        >
          {FEATURES.map((item, i) => (
            <FeatureCard
              key={item.label}
              item={item}
              index={i}
              frame={frame}
              fps={fps}
            />
          ))}
        </div>

        {/* Product name label below cards */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: interpolate(frame, [160, 180], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: TEXT_MUTED,
              letterSpacing: "-0.01em",
            }}
          >
            Part of
          </span>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: TEXT,
            }}
          >
            Flowbase AI Suite
          </span>
          <span
            style={{
              backgroundColor: `rgba(99,102,241,0.15)`,
              border: `1px solid rgba(99,102,241,0.35)`,
              borderRadius: 6,
              padding: "2px 8px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 11,
              color: BRAND,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            v3.0
          </span>
        </div>
      </div>

      {/* ── PHASE 3: Closing CTA ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: ctaSectionOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ClosingCta frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion root ──────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="FeatureAnnounce"
    component={FeatureAnnounce}
    durationInFrames={DURATION}
    fps={30}
    width={1280}
    height={720}
  />
);
