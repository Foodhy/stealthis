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

// ── Palette ───────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE = "#12121a";
const CARD = "#1a1a2e";
const BRAND = "#6366f1";
const BRAND_2 = "#8b5cf6";
const ACCENT = "#06b6d4";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";
const SUCCESS = "#10b981";
const WARNING = "#f59e0b";
const DANGER = "#ef4444";

// ── Release data ──────────────────────────────────────────────────────
type ItemKind = "new" | "improved" | "fixed";

interface ReleaseItem {
  kind: ItemKind;
  text: string;
}

interface Release {
  version: string;
  date: string;
  accentColor: string;
  glowColor: string;
  items: ReleaseItem[];
}

const RELEASES: Release[] = [
  {
    version: "v3.4.0",
    date: "June 10, 2026",
    accentColor: BRAND,
    glowColor: "rgba(99,102,241,0.14)",
    items: [
      { kind: "new", text: "AI-powered workflow builder with drag-and-drop node editor" },
      { kind: "new", text: "Real-time collaboration: see teammates' cursors live in any view" },
      { kind: "improved", text: "Dashboard load time reduced by 62% via edge-cached queries" },
      { kind: "fixed", text: "Webhook retry queue no longer drops events under high concurrency" },
    ],
  },
  {
    version: "v3.3.2",
    date: "May 22, 2026",
    accentColor: BRAND_2,
    glowColor: "rgba(139,92,246,0.14)",
    items: [
      { kind: "new", text: "CSV export now supports custom column mappings and date formats" },
      { kind: "improved", text: "Notification center redesigned — grouped by project and priority" },
      { kind: "improved", text: "API rate limits raised to 10,000 req/min on Pro and Enterprise" },
      { kind: "fixed", text: "Fixed OAuth token refresh loop on Safari 17.4 private browsing" },
    ],
  },
  {
    version: "v3.3.0",
    date: "May 5, 2026",
    accentColor: ACCENT,
    glowColor: "rgba(6,182,212,0.14)",
    items: [
      { kind: "new", text: "Zapier integration: 40+ native triggers and actions available today" },
      { kind: "new", text: "Multi-region data residency for EU customers (Frankfurt, Dublin)" },
      { kind: "improved", text: "Search indexes rebuilt — full-text results now appear in < 80 ms" },
      { kind: "fixed", text: "Resolved timezone offset bug in scheduled report delivery" },
    ],
  },
];

// Each version block occupies 120 frames (4 s), total = 360 frames
const BLOCK_FRAMES = 120;

// Inside each block:
// 0-30   → card slides up
// 8-18   → version badge enters
// 22-36  → date enters
// items stagger: first at frame 32, +18 per item
// 95-110 → divider fades in (last 25 frames of block)

// ── Icon for item kind ────────────────────────────────────────────────
function kindIcon(kind: ItemKind): string {
  if (kind === "new") return "✦";
  if (kind === "improved") return "↑";
  return "✕";
}

function kindColor(kind: ItemKind): string {
  if (kind === "new") return SUCCESS;
  if (kind === "improved") return WARNING;
  return DANGER;
}

function kindLabel(kind: ItemKind): string {
  if (kind === "new") return "NEW";
  if (kind === "improved") return "IMPROVED";
  return "FIXED";
}

// ── Progress bar ──────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number; durationInFrames: number }> = ({
  frame,
  durationInFrames,
}) => {
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.06)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${BRAND} 0%, ${ACCENT} 100%)`,
          borderRadius: "0 2px 2px 0",
          boxShadow: `0 0 12px ${BRAND}99`,
          transition: "none",
        }}
      />
    </div>
  );
};

// ── Release item bullet ───────────────────────────────────────────────
const BulletItem: React.FC<{
  item: ReleaseItem;
  localFrame: number;
  fps: number;
  delay: number;
}> = ({ item, localFrame, fps, delay }) => {
  const f = Math.max(0, localFrame - delay);

  const enter = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 130, mass: 0.7 },
  });

  const opacity = interpolate(enter, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(enter, [0, 1], [20, 0]);

  const icon = kindIcon(item.kind);
  const color = kindColor(item.kind);
  const label = kindLabel(item.kind);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        opacity,
        transform: `translateX(${translateX}px)`,
        marginBottom: 10,
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: `${color}22`,
          border: `1px solid ${color}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {icon}
        </span>
      </div>

      {/* Text group */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Kind pill */}
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: "0.1em",
            color,
            textTransform: "uppercase" as const,
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        {/* Description */}
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: TEXT,
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
          }}
        >
          {item.text}
        </span>
      </div>
    </div>
  );
};

// ── Divider ───────────────────────────────────────────────────────────
const Divider: React.FC<{ localFrame: number; accentColor: string }> = ({
  localFrame,
  accentColor,
}) => {
  const opacity = interpolate(localFrame, [95, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const scaleX = interpolate(localFrame, [95, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        height: 1,
        opacity,
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
        background: `linear-gradient(90deg, ${accentColor}66 0%, transparent 80%)`,
        marginTop: 12,
      }}
    />
  );
};

// ── Version block ─────────────────────────────────────────────────────
const VersionBlock: React.FC<{
  release: Release;
  blockOffset: number;
  frame: number;
  fps: number;
  isLast: boolean;
}> = ({ release, blockOffset, frame, fps, isLast }) => {
  // Local frame within this block
  const localFrame = Math.max(0, frame - blockOffset);

  // Card slides up from bottom
  const cardEnter = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 16, stiffness: 100, mass: 0.9 },
  });
  const cardTranslateY = interpolate(cardEnter, [0, 1], [80, 0]);
  const cardOpacity = interpolate(cardEnter, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Version badge
  const badgeEnter = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 160, mass: 0.6 },
  });
  const badgeScale = interpolate(badgeEnter, [0, 1], [0.6, 1]);
  const badgeOpacity = interpolate(badgeEnter, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Date
  const dateOpacity = interpolate(localFrame, [22, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardTranslateY}px)`,
        position: "relative",
        backgroundColor: CARD,
        borderRadius: 16,
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `4px solid ${release.accentColor}`,
        padding: "22px 28px 18px",
        overflow: "hidden",
        marginBottom: 0,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          left: -20,
          width: 200,
          height: 200,
          borderRadius: "50%",
          backgroundColor: release.glowColor,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Paper texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          borderRadius: 16,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 16,
          position: "relative",
        }}
      >
        {/* Version badge */}
        <div
          style={{
            opacity: badgeOpacity,
            transform: `scale(${badgeScale})`,
            backgroundColor: `${release.accentColor}22`,
            border: `1.5px solid ${release.accentColor}66`,
            borderRadius: 8,
            padding: "5px 14px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 17,
            color: release.accentColor,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {release.version}
        </div>

        {/* Date */}
        <span
          style={{
            opacity: dateOpacity,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: TEXT_MUTED,
            letterSpacing: "0.03em",
          }}
        >
          {release.date}
        </span>
      </div>

      {/* Bullet items */}
      <div style={{ position: "relative" }}>
        {release.items.map((item, i) => (
          <BulletItem
            key={i}
            item={item}
            localFrame={localFrame}
            fps={fps}
            delay={32 + i * 18}
          />
        ))}
      </div>

      {/* Divider (only between blocks, not after last) */}
      {!isLast && (
        <Divider localFrame={localFrame} accentColor={release.accentColor} />
      )}
    </div>
  );
};

// ── Background decoration ─────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const pulseSin = Math.sin((frame / 180) * Math.PI * 2);
  const glowOpacity = interpolate(pulseSin, [-1, 1], [0.5, 0.85]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -160,
          left: -80,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)`,
          filter: "blur(60px)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          right: -60,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)`,
          filter: "blur(70px)",
          opacity: glowOpacity * 0.8,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Header ────────────────────────────────────────────────────────────
const Header: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleEnter = spring({
    frame: Math.max(0, frame),
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  const titleOpacity = interpolate(titleEnter, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(titleEnter, [0, 1], [-16, 0]);

  const subtitleOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        position: "relative",
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: TEXT,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Release Notes
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: TEXT_MUTED,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            marginTop: 5,
            opacity: subtitleOpacity,
          }}
        >
          Flowbase · 3 recent versions
        </div>
      </div>

      {/* Product logo mark */}
      <div
        style={{
          opacity: titleOpacity,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${BRAND}55`,
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 16,
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
            fontSize: 16,
            color: TEXT,
            letterSpacing: "-0.02em",
          }}
        >
          Flowbase
        </span>
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const ReleaseNotesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade out last 15 frames
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
        overflow: "hidden",
      }}
    >
      {/* Global fade wrapper */}
      <AbsoluteFill style={{ opacity: globalOpacity }}>
        {/* Background glows */}
        <Background frame={frame} />

        {/* Progress bar */}
        <ProgressBar frame={frame} durationInFrames={durationInFrames} />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "36px 56px 32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Header frame={frame} fps={fps} />

          {/* Version blocks stacked vertically */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              flex: 1,
            }}
          >
            {RELEASES.map((release, i) => (
              <Sequence key={release.version} from={i * BLOCK_FRAMES}>
                <VersionBlock
                  release={release}
                  blockOffset={0}
                  frame={frame - i * BLOCK_FRAMES}
                  fps={fps}
                  isLast={i === RELEASES.length - 1}
                />
              </Sequence>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Remotion root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ReleaseNotesReel"
    component={ReleaseNotesReel}
    durationInFrames={360}
    fps={30}
    width={1280}
    height={720}
  />
);
