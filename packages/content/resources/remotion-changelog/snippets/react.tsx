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

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE = "#12121a";
const CARD = "#1a1a2e";
const BRAND = "#6366f1";
const BRAND_2 = "#8b5cf6";
const ACCENT = "#06b6d4";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";
const SUCCESS = "#10b981";
const DANGER = "#ef4444";

// ─── Changelog data ────────────────────────────────────────────────────────────
type ChangeKind = "new" | "improvement" | "fix";

interface ChangeItem {
  kind: ChangeKind;
  title: string;
  description: string;
}

const ITEMS: ChangeItem[] = [
  {
    kind: "new",
    title: "AI-Powered Onboarding Flow",
    description:
      "New users are guided by an adaptive wizard that tailors the setup to their team size and use case.",
  },
  {
    kind: "improvement",
    title: "Dashboard Load Time −62%",
    description:
      "Aggressive query batching and edge-cached metrics cut cold-load time from 2.1 s down to 0.8 s.",
  },
  {
    kind: "fix",
    title: "Webhook Retry Storm Fixed",
    description:
      "An exponential back-off bug caused burst retries on 5xx responses. Queue now caps at 3 attempts.",
  },
];

const KIND_META: Record<ChangeKind, { label: string; color: string; bg: string }> = {
  new: { label: "New Feature", color: SUCCESS, bg: "rgba(16,185,129,0.12)" },
  improvement: { label: "Improvement", color: ACCENT, bg: "rgba(6,182,212,0.12)" },
  fix: { label: "Bug Fix", color: DANGER, bg: "rgba(239,68,68,0.12)" },
};

// ─── Logo mark SVG ─────────────────────────────────────────────────────────────
const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill={BRAND} />
    <path
      d="M10 28 L20 12 L30 28"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="20" cy="12" r="3" fill="white" />
  </svg>
);

// ─── Header: logo + product name + version badge ──────────────────────────────
const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 140 }, durationInFrames: 25 });
  const nameSpring = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 120 }, durationInFrames: 25 });
  const badgeSpring = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 130 }, durationInFrames: 25 });
  const dateOpacity = interpolate(frame, [28, 42], [0, 1], { extrapolateRight: "clamp" });
  const dateY = interpolate(frame, [28, 42], [10, 0], { extrapolateRight: "clamp" });

  const logoScale = interpolate(logoSpring, [0, 1], [0.4, 1]);
  const logoOpacity = logoSpring;
  const nameX = interpolate(nameSpring, [0, 1], [-24, 0]);
  const nameOpacity = nameSpring;
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.6, 1]);
  const badgeOpacity = badgeSpring;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Logo row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Logo mark */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <LogoMark size={52} />
        </div>

        {/* Product name */}
        <div
          style={{
            transform: `translateX(${nameX}px)`,
            opacity: nameOpacity,
            fontSize: 36,
            fontWeight: 800,
            color: TEXT,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          Launchpad
        </div>

        {/* Version badge */}
        <div
          style={{
            transform: `scale(${badgeScale})`,
            opacity: badgeOpacity,
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "5px 14px",
            borderRadius: 999,
            letterSpacing: "0.5px",
            boxShadow: `0 0 20px ${BRAND}66`,
            alignSelf: "center",
            marginTop: 4,
          }}
        >
          v2.4.0
        </div>
      </div>

      {/* Date stamp */}
      <div
        style={{
          opacity: dateOpacity,
          transform: `translateY(${dateY}px)`,
          color: TEXT_MUTED,
          fontSize: 14,
          fontWeight: 400,
          fontFamily: "system-ui, -apple-system, sans-serif",
          marginTop: 8,
          letterSpacing: "0.3px",
        }}
      >
        Released June 13, 2026
      </div>
    </div>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider: React.FC<{ delayFrames: number }> = ({ delayFrames }) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [delayFrames, delayFrames + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        width: "100%",
        height: 1,
        background: `linear-gradient(90deg, ${BRAND}88 0%, ${BRAND_2}44 50%, transparent 100%)`,
        transform: `scaleX(${width})`,
        transformOrigin: "left center",
        margin: "24px 0",
      }}
    />
  );
};

// ─── Changelog row ────────────────────────────────────────────────────────────
const ChangeRow: React.FC<{ item: ChangeItem; delayFrames: number }> = ({ item, delayFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 20, stiffness: 110 },
    durationInFrames: 30,
  });

  const x = interpolate(sp, [0, 1], [-40, 0]);
  const opacity = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  const meta = KIND_META[item.kind];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        opacity,
        transform: `translateX(${x}px)`,
        padding: "16px 20px",
        borderRadius: 12,
        background: CARD,
        borderLeft: `3px solid ${meta.color}`,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.04)`,
      }}
    >
      {/* Category pill */}
      <div
        style={{
          flexShrink: 0,
          background: meta.bg,
          color: meta.color,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "4px 10px",
          borderRadius: 999,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          marginTop: 2,
          border: `1px solid ${meta.color}33`,
          minWidth: 96,
          textAlign: "center",
        }}
      >
        {meta.label}
      </div>

      {/* Text block */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: TEXT,
            fontFamily: "system-ui, -apple-system, sans-serif",
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: TEXT_MUTED,
            fontFamily: "system-ui, -apple-system, sans-serif",
            lineHeight: 1.55,
          }}
        >
          {item.description}
        </div>
      </div>
    </div>
  );
};

// ─── CTA footer ───────────────────────────────────────────────────────────────
const CTAFooter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = spring({
    frame: frame - 180,
    fps,
    config: { damping: 18, stiffness: 100 },
    durationInFrames: 35,
  });

  const y = interpolate(sp, [0, 1], [20, 0]);
  const opacity = interpolate(sp, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: TEXT_MUTED,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "0.2px",
        }}
      >
        See the full changelog at
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: `linear-gradient(90deg, ${BRAND}, ${BRAND_2})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.2px",
        }}
      >
        docs.launchpad.io/changelog
      </div>
    </div>
  );
};

// ─── Background glow ──────────────────────────────────────────────────────────
const BackgroundGlow: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: -160,
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 400,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${BRAND}1a 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: -100,
        right: -80,
        width: 400,
        height: 300,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${BRAND_2}12 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  </>
);

// ─── Main composition ─────────────────────────────────────────────────────────
export const ChangelogVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Global fade-out last 15 frames (0.5 s)
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Item stagger: item 0 at frame 55, item 1 at 90, item 2 at 125
  const itemDelays = [55, 90, 125];

  return (
    <AbsoluteFill
      style={{
        background: BG,
        opacity: globalOpacity,
        overflow: "hidden",
      }}
    >
      <BackgroundGlow />

      {/* Content column */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
          gap: 0,
        }}
      >
        {/* Header */}
        <Header />

        {/* Divider */}
        <Divider delayFrames={44} />

        {/* Changelog rows */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {ITEMS.map((item, i) => (
            <ChangeRow key={item.title} item={item} delayFrames={itemDelays[i]} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 28 }}>
          <CTAFooter />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── RemotionRoot ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ChangelogVideo"
    component={ChangelogVideo}
    durationInFrames={240}
    fps={30}
    width={1280}
    height={720}
  />
);
