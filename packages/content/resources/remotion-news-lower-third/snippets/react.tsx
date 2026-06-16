import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCENT_RED = "#e8001e";
const ACCENT_GOLD = "#f5c842";
const BG_DARK = "#0d1117";
const BG_NAVY = "#0a0e1a";
const WHITE = "#ffffff";
const GRAY_TEXT = "rgba(255,255,255,0.58)";
const DARK_BAR_BG = "rgba(6,10,22,0.94)";

// Each variant: name, title, badge (optional), style key
const GUESTS: Array<{
  name: string;
  title: string;
  badge?: string;
  org?: string;
}> = [
  {
    name: "Dr. Sarah Chen",
    title: "Chief Medical Officer",
    org: "Apex Health Systems",
  },
  {
    name: "Senator James Holloway",
    title: "R-OHIO",
    badge: "SENATE JUDICIARY",
    org: "District 12 — Columbus Metro",
  },
  {
    name: "Marcus Rivera",
    title: "Tech & Markets Correspondent",
    org: "NNX News Network",
  },
];

// Scene timing (frames)
const SCENE1_START = 0;
const SCENE1_END = 40;
const SCENE2_START = 40;
const SCENE2_END = 80;
const SCENE3_START = 80;
const SCENE3_END = 120;

// Hold duration per variant (frames after entry before exit)
const HOLD_FRAMES = 28;

// Animation config presets
const SPRING_SNAPPY = { damping: 22, stiffness: 180 };
const SPRING_SOFT = { damping: 18, stiffness: 120 };

// ── Sub-components ────────────────────────────────────────────────────────────

/** Simulated "camera feed" background — dark gradient rectangle representing video */
const VideoBg: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `linear-gradient(135deg, ${BG_NAVY} 0%, #111827 45%, #0d1117 100%)`,
    }}
  >
    {/* Subtle vignette overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)",
      }}
    />
    {/* Scanline texture */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
        pointerEvents: "none",
      }}
    />
    {/* Placeholder "face" silhouette area */}
    <div
      style={{
        position: "absolute",
        top: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: 340,
        height: 420,
        borderRadius: "50% 50% 44% 44% / 38% 38% 62% 62%",
        background: "rgba(255,255,255,0.025)",
      }}
    />
    {/* NNX Network watermark top-left */}
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 40,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 900,
        fontSize: 22,
        color: WHITE,
        letterSpacing: -0.5,
        opacity: 0.9,
      }}
    >
      NNX<span style={{ color: ACCENT_RED }}>NEWS</span>
    </div>
    {/* LIVE dot top-right */}
    <LiveBadge />
  </div>
);

/** Pulsing LIVE badge */
const LiveBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin((frame / 30) * Math.PI) * 0.4 + 0.6;

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        right: 40,
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          backgroundColor: ACCENT_RED,
          opacity: pulse,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: WHITE,
          letterSpacing: 3,
          opacity: 0.85,
        }}
      >
        LIVE
      </span>
    </div>
  );
};

// ── VARIANT 1: Classic CNN-style ──────────────────────────────────────────────
// Frames 0–40: red left accent bar, white name, gray title. Spring slide-up from bottom.

const Variant1ClassicLowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - SCENE1_START;

  // Entry: slide up via spring (frames 0–12)
  const slideY = spring({
    frame: localFrame,
    fps,
    from: 60,
    to: 0,
    config: SPRING_SNAPPY,
  });

  // Exit: slide down at frame 32 (= 40-8)
  const EXIT_START = HOLD_FRAMES + 4;
  const exitY =
    localFrame >= EXIT_START
      ? spring({
          frame: localFrame - EXIT_START,
          fps,
          from: 0,
          to: 70,
          config: SPRING_SNAPPY,
        })
      : 0;

  const translateY = localFrame < EXIT_START ? slideY : exitY;

  // Red accent bar width: expands 0→1 in frames 4–16
  const barWidth = interpolate(localFrame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Text opacity: fades in 10–20
  const textOpacity = interpolate(localFrame, [10, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const guest = GUESTS[0];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 52,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Red top accent bar */}
      <div
        style={{
          height: 3,
          width: 320,
          backgroundColor: ACCENT_RED,
          transformOrigin: "left center",
          transform: `scaleX(${barWidth})`,
          marginBottom: 0,
        }}
      />
      {/* Main card */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          overflow: "hidden",
          opacity: textOpacity,
        }}
      >
        {/* Left red pillar */}
        <div
          style={{
            width: 5,
            backgroundColor: ACCENT_RED,
            flexShrink: 0,
          }}
        />
        {/* Content panel */}
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.88)",
            paddingTop: 10,
            paddingBottom: 12,
            paddingLeft: 16,
            paddingRight: 24,
            minWidth: 315,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: WHITE,
              lineHeight: 1.1,
              letterSpacing: -0.3,
            }}
          >
            {guest.name}
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: GRAY_TEXT,
              marginTop: 4,
              letterSpacing: 0.2,
            }}
          >
            {guest.title}
            {guest.org ? `, ${guest.org}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── VARIANT 2: Dark bar political style ──────────────────────────────────────
// Frames 40–80: full-width dark band at bottom, gold name, white italic badge.
// Wipes in from left edge.

const Variant2PoliticalLowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - SCENE2_START;

  // Wipe in: clip-path width 0→1280 via spring frames 0–18
  const wipeWidth = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1280,
    config: SPRING_SOFT,
  });

  // Exit: wipe out right→left at frame EXIT_START
  const EXIT_START = HOLD_FRAMES + 4;
  const wipeOut =
    localFrame >= EXIT_START
      ? spring({
          frame: localFrame - EXIT_START,
          fps,
          from: 1280,
          to: 0,
          config: SPRING_SNAPPY,
        })
      : 1280;

  const clipWidth = localFrame < EXIT_START ? wipeWidth : wipeOut;

  // Gold bar top-edge reveal
  const accentScaleX = interpolate(localFrame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Text opacity
  const textOpacity = interpolate(localFrame, [12, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const guest = GUESTS[1];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        overflow: "hidden",
      }}
    >
      {/* Gold accent line at top of band */}
      <div
        style={{
          height: 3,
          width: 1280,
          backgroundColor: ACCENT_GOLD,
          transformOrigin: "left center",
          transform: `scaleX(${accentScaleX})`,
        }}
      />
      {/* Dark band — clipped width for wipe effect */}
      <div
        style={{
          width: clipWidth,
          height: 80,
          background: `linear-gradient(90deg, ${DARK_BAR_BG} 0%, rgba(8,14,30,0.97) 70%, rgba(10,14,26,0.92) 100%)`,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          opacity: textOpacity,
          gap: 0,
        }}
      >
        {/* Left gold pillar */}
        <div
          style={{
            width: 4,
            alignSelf: "stretch",
            backgroundColor: ACCENT_GOLD,
            flexShrink: 0,
          }}
        />
        {/* Name + badge row */}
        <div
          style={{
            paddingLeft: 22,
            paddingRight: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: ACCENT_GOLD,
                letterSpacing: -0.2,
              }}
            >
              {guest.name}
            </span>
            {/* Party/role badge pill */}
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 13,
                color: WHITE,
                backgroundColor: ACCENT_RED,
                paddingTop: 2,
                paddingBottom: 2,
                paddingLeft: 9,
                paddingRight: 9,
                borderRadius: 3,
                letterSpacing: 0.5,
              }}
            >
              {guest.title}
            </span>
          </div>
          {/* Org/district line */}
          {guest.badge && (
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                marginTop: 3,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              {guest.badge} &nbsp;·&nbsp; {guest.org}
            </div>
          )}
        </div>

        {/* Network logo at right */}
        <div
          style={{
            marginLeft: "auto",
            marginRight: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 1,
              height: 40,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          />
          <div
            style={{
              marginLeft: 16,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 16,
              color: WHITE,
              letterSpacing: 0.5,
              opacity: 0.7,
            }}
          >
            NNX<span style={{ color: ACCENT_RED }}>NEWS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── VARIANT 3: Minimal floating capsule ───────────────────────────────────────
// Frames 80–120: white pill shape, name + title side by side, shadow. Fades + scales in.

const Variant3MinimalCapsule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - SCENE3_START;

  // Entry: spring scale + fade in frames 0–14
  const scaleIn = spring({
    frame: localFrame,
    fps,
    from: 0.82,
    to: 1,
    config: SPRING_SOFT,
  });

  const fadeIn = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Exit: fade out at HOLD_FRAMES
  const EXIT_START = HOLD_FRAMES + 4;
  const fadeOut = interpolate(localFrame, [EXIT_START, EXIT_START + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scaleOut = interpolate(localFrame, [EXIT_START, EXIT_START + 10], [1, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = localFrame < EXIT_START ? fadeIn : fadeIn * fadeOut;
  const scale = localFrame < EXIT_START ? scaleIn : scaleOut;

  // Vertical nudge for floating feel
  const floatY = interpolate(Math.sin((localFrame / 30) * Math.PI * 0.6), [-1, 1], [-2, 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const guest = GUESTS[2];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 52,
        opacity,
        transform: `scale(${scale}) translateY(${floatY}px)`,
        transformOrigin: "left bottom",
      }}
    >
      {/* White capsule pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.96)",
          borderRadius: 40,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 20,
          paddingRight: 26,
          gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        {/* Red accent dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: ACCENT_RED,
            flexShrink: 0,
          }}
        />
        {/* Name */}
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: "#0d1117",
            letterSpacing: -0.2,
            whiteSpace: "nowrap",
          }}
        >
          {guest.name}
        </span>
        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            height: 22,
            backgroundColor: "rgba(0,0,0,0.15)",
          }}
        />
        {/* Title */}
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "rgba(13,17,23,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          {guest.title}
        </span>
        {/* Org tag */}
        {guest.org && (
          <>
            <div
              style={{
                width: 1,
                height: 22,
                backgroundColor: "rgba(0,0,0,0.12)",
              }}
            />
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: ACCENT_RED,
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
              }}
            >
              {guest.org}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// ── Scene Manager ─────────────────────────────────────────────────────────────

const SceneManager: React.FC = () => {
  const frame = useCurrentFrame();

  const inScene1 = frame >= SCENE1_START && frame < SCENE1_END;
  const inScene2 = frame >= SCENE2_START && frame < SCENE2_END;
  const inScene3 = frame >= SCENE3_START && frame < SCENE3_END;

  return (
    <>
      {inScene1 && <Variant1ClassicLowerThird />}
      {inScene2 && <Variant2PoliticalLowerThird />}
      {inScene3 && <Variant3MinimalCapsule />}
    </>
  );
};

// ── Scene Label (for demo context) ───────────────────────────────────────────

const SceneLabel: React.FC = () => {
  const frame = useCurrentFrame();

  const labels: Record<number, string> = {
    0: "Variant 1: Classic CNN-Style",
    40: "Variant 2: Political Dark Bar",
    80: "Variant 3: Minimal Capsule",
  };

  const boundary = [0, 40, 80].filter((b) => frame >= b).pop() ?? 0;
  const label = labels[boundary];

  const localFrame =
    boundary === 0 ? frame : boundary === 40 ? frame - 40 : frame - 80;

  const opacity = interpolate(localFrame, [0, 8, 28, 36], [0, 0.55, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: "50%",
        transform: "translateX(-50%)",
        opacity,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 12,
        color: "rgba(255,255,255,0.55)",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────────────────────

export default function NewsLowerThird() {
  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <VideoBg />
      <SceneManager />
      <SceneLabel />
    </AbsoluteFill>
  );
}
