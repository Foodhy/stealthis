import React from "react";
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

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const C = {
  // Layout
  W: 1280,
  H: 720,
  FPS: 30,
  TOTAL: 300,

  // Palette
  BG: "#0a0a0f",
  SURFACE: "#12121a",
  CARD: "#1a1a2e",
  BRAND: "#6366f1",
  BRAND_2: "#8b5cf6",
  ACCENT: "#06b6d4",
  TEXT: "#f8fafc",
  MUTED: "rgba(248,250,252,0.55)",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  PLANNED: "rgba(99,102,241,0.35)",

  // Timeline geometry
  LINE_Y: 340,
  LINE_X_START: 100,
  LINE_X_END: 1180,
  MARKER_XS: [220, 480, 740, 1000] as const,

  // Timing (frames)
  LINE_IN_START: 0,
  LINE_IN_END: 60,
  MARKERS_BASE: 70,
  CARDS_BASE: 90,
  CTA_IN: 240,

  FONT: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
type Status = "Done" | "In Progress" | "Planned";

interface Quarter {
  label: string;
  features: string[];
  status: Status;
  isCurrent: boolean;
}

const QUARTERS: Quarter[] = [
  {
    label: "Q1 2025",
    features: ["SSO & SAML", "Audit Logs", "Role Templates"],
    status: "Done",
    isCurrent: false,
  },
  {
    label: "Q2 2025",
    features: ["AI Summaries", "Bulk Actions", "CSV Export"],
    status: "Done",
    isCurrent: false,
  },
  {
    label: "Q3 2025",
    features: ["Workflow Builder", "Webhooks v2"],
    status: "In Progress",
    isCurrent: true,
  },
  {
    label: "Q4 2025",
    features: ["Mobile App", "Analytics 3.0", "API v3"],
    status: "Planned",
    isCurrent: false,
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function sp(
  frame: number,
  fps: number,
  delay: number,
  cfg?: { damping?: number; stiffness?: number; mass?: number }
) {
  return spring({
    frame: frame - delay,
    fps,
    config: {
      damping: cfg?.damping ?? 14,
      stiffness: cfg?.stiffness ?? 180,
      mass: cfg?.mass ?? 0.6,
    },
  });
}

function statusColor(s: Status): string {
  if (s === "Done") return C.SUCCESS;
  if (s === "In Progress") return C.WARNING;
  return C.BRAND;
}

function statusBg(s: Status): string {
  if (s === "Done") return "rgba(16,185,129,0.15)";
  if (s === "In Progress") return "rgba(245,158,11,0.15)";
  return "rgba(99,102,241,0.15)";
}

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / C.FPS;
  const pulse = 0.25 + 0.12 * Math.sin((t * Math.PI * 2) / 5);

  return (
    <AbsoluteFill style={{ background: C.BG, overflow: "hidden" }}>
      {/* Subtle radial brand glow top-left */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -150,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,${pulse}) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Faint grid lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 80 + i * 80,
            width: "100%",
            height: 1,
            background: "rgba(255,255,255,0.025)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(
    sp(frame, fps, 0),
    [0, 1],
    [-40, 0]
  );
  const titleOp = interpolate(sp(frame, fps, 0), [0, 1], [0, 1]);

  const subtitleY = interpolate(sp(frame, fps, 8), [0, 1], [-24, 0]);
  const subtitleOp = interpolate(sp(frame, fps, 8), [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: C.LINE_X_START,
        right: C.W - C.LINE_X_END,
      }}
    >
      {/* Product badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(99,102,241,0.18)",
          border: "1px solid rgba(99,102,241,0.4)",
          borderRadius: 20,
          padding: "4px 14px",
          marginBottom: 14,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.BRAND,
            boxShadow: `0 0 6px ${C.BRAND}`,
          }}
        />
        <span
          style={{
            fontFamily: C.FONT,
            fontSize: 12,
            fontWeight: 600,
            color: C.BRAND,
            letterSpacing: 1.2,
            textTransform: "uppercase" as const,
          }}
        >
          Flowbase · Product Roadmap
        </span>
      </div>

      {/* Main title */}
      <div
        style={{
          fontFamily: C.FONT,
          fontSize: 36,
          fontWeight: 800,
          color: C.TEXT,
          letterSpacing: -0.5,
          lineHeight: 1.1,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        What&apos;s coming in{" "}
        <span
          style={{
            background: `linear-gradient(90deg, ${C.BRAND}, ${C.BRAND_2})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          2025
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: C.FONT,
          fontSize: 15,
          fontWeight: 400,
          color: C.MUTED,
          marginTop: 6,
          opacity: subtitleOp,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        Shipping reliability, intelligence, and scale — one quarter at a time.
      </div>
    </div>
  );
};

// ─── TIMELINE LINE ────────────────────────────────────────────────────────────
const TimelineLine: React.FC = () => {
  const frame = useCurrentFrame();
  const lineProgress = interpolate(
    frame,
    [C.LINE_IN_START, C.LINE_IN_END],
    [0, 1],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const lineWidth = lineProgress * (C.LINE_X_END - C.LINE_X_START);

  // Shimmer position along the line
  const shimmerX = interpolate(
    frame,
    [C.LINE_IN_START, C.LINE_IN_END],
    [C.LINE_X_START, C.LINE_X_END],
    { extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* Track base */}
      <div
        style={{
          position: "absolute",
          top: C.LINE_Y,
          left: C.LINE_X_START,
          width: C.LINE_X_END - C.LINE_X_START,
          height: 2,
          background: "rgba(255,255,255,0.08)",
        }}
      />
      {/* Animated fill */}
      <div
        style={{
          position: "absolute",
          top: C.LINE_Y,
          left: C.LINE_X_START,
          width: lineWidth,
          height: 2,
          background: `linear-gradient(90deg, ${C.BRAND}, ${C.BRAND_2}, ${C.ACCENT})`,
          boxShadow: `0 0 8px rgba(99,102,241,0.6)`,
        }}
      />
      {/* Leading shimmer dot */}
      {lineProgress > 0.02 && lineProgress < 0.99 && (
        <div
          style={{
            position: "absolute",
            top: C.LINE_Y - 4,
            left: shimmerX - 4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 12px #fff, 0 0 6px rgba(99,102,241,0.8)",
          }}
        />
      )}
    </>
  );
};

// ─── STATUS PILL ──────────────────────────────────────────────────────────────
const StatusPill: React.FC<{ status: Status }> = ({ status }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: statusBg(status),
      border: `1px solid ${statusColor(status)}44`,
      borderRadius: 20,
      padding: "3px 10px",
    }}
  >
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: statusColor(status),
      }}
    />
    <span
      style={{
        fontFamily: C.FONT,
        fontSize: 11,
        fontWeight: 700,
        color: statusColor(status),
        letterSpacing: 0.6,
        textTransform: "uppercase" as const,
      }}
    >
      {status}
    </span>
  </div>
);

// ─── QUARTER MARKER ───────────────────────────────────────────────────────────
interface QuarterMarkerProps {
  quarter: Quarter;
  x: number;
  markerDelay: number;
  cardDelay: number;
}

const QuarterMarker: React.FC<QuarterMarkerProps> = ({
  quarter,
  x,
  markerDelay,
  cardDelay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Marker dot spring drop
  const markerY = interpolate(
    sp(frame, fps, markerDelay, { damping: 10, stiffness: 220, mass: 0.5 }),
    [0, 1],
    [-60, 0]
  );
  const markerOp = interpolate(
    sp(frame, fps, markerDelay),
    [0, 1],
    [0, 1]
  );

  // Card slide up
  const cardY = interpolate(
    sp(frame, fps, cardDelay, { damping: 13, stiffness: 160 }),
    [0, 1],
    [30, 0]
  );
  const cardOp = interpolate(
    sp(frame, fps, cardDelay),
    [0, 1],
    [0, 1]
  );

  // Current quarter glow pulse
  const t = frame / fps;
  const glowPulse = quarter.isCurrent
    ? 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 1.2)
    : 0;

  const dotSize = quarter.isCurrent ? 16 : 12;
  const dotColor = quarter.isCurrent ? C.ACCENT : C.BRAND;

  return (
    <div style={{ position: "absolute", left: x, top: 0, width: 0, height: 0 }}>
      {/* Pulsing glow ring (current quarter only) */}
      {quarter.isCurrent && (
        <div
          style={{
            position: "absolute",
            top: C.LINE_Y - 20,
            left: -20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `2px solid ${C.ACCENT}`,
            opacity: glowPulse * 0.6,
            transform: `scale(${1 + glowPulse * 0.4})`,
            boxShadow: `0 0 16px ${C.ACCENT}`,
          }}
        />
      )}

      {/* Vertical stem line */}
      <div
        style={{
          position: "absolute",
          top: C.LINE_Y - dotSize / 2,
          left: -1,
          width: 2,
          height: 50,
          background: quarter.isCurrent
            ? `linear-gradient(180deg, ${C.ACCENT}, transparent)`
            : `linear-gradient(180deg, ${C.BRAND}, transparent)`,
          opacity: markerOp,
          transform: `translateY(${markerY}px)`,
        }}
      />

      {/* Dot */}
      <div
        style={{
          position: "absolute",
          top: C.LINE_Y - dotSize / 2,
          left: -dotSize / 2,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: dotColor,
          boxShadow: quarter.isCurrent
            ? `0 0 ${8 + glowPulse * 12}px ${C.ACCENT}, 0 0 24px rgba(6,182,212,0.4)`
            : `0 0 8px rgba(99,102,241,0.5)`,
          opacity: markerOp,
          transform: `translateY(${markerY}px)`,
        }}
      />

      {/* Quarter label above dot */}
      <div
        style={{
          position: "absolute",
          top: C.LINE_Y - dotSize / 2 - 28,
          left: 0,
          transform: `translateX(-50%) translateY(${markerY}px)`,
          opacity: markerOp,
          fontFamily: C.FONT,
          fontSize: 12,
          fontWeight: 700,
          color: quarter.isCurrent ? C.ACCENT : C.MUTED,
          letterSpacing: 0.8,
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
        }}
      >
        {quarter.label}
      </div>

      {/* Feature card below */}
      <div
        style={{
          position: "absolute",
          top: C.LINE_Y + dotSize / 2 + 28,
          left: 0,
          transform: `translateX(-50%) translateY(${cardY}px)`,
          opacity: cardOp,
          width: 190,
          background: quarter.isCurrent
            ? `linear-gradient(135deg, rgba(6,182,212,0.12), rgba(99,102,241,0.1))`
            : C.CARD,
          border: quarter.isCurrent
            ? `1px solid rgba(6,182,212,0.35)`
            : "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "14px 16px",
          boxShadow: quarter.isCurrent
            ? "0 4px 32px rgba(6,182,212,0.15)"
            : "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* Status pill */}
        <div style={{ marginBottom: 10 }}>
          <StatusPill status={quarter.status} />
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {quarter.features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background:
                    quarter.status === "Done"
                      ? C.SUCCESS
                      : quarter.isCurrent
                      ? C.ACCENT
                      : "rgba(255,255,255,0.25)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: C.FONT,
                  fontSize: 13,
                  fontWeight: 500,
                  color:
                    quarter.status === "Planned"
                      ? "rgba(248,250,252,0.6)"
                      : C.TEXT,
                }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── CTA ──────────────────────────────────────────────────────────────────────
const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaOp = interpolate(
    sp(frame, fps, C.CTA_IN, { damping: 16, stiffness: 140 }),
    [0, 1],
    [0, 1]
  );
  const ctaY = interpolate(
    sp(frame, fps, C.CTA_IN, { damping: 16, stiffness: 140 }),
    [0, 1],
    [20, 0]
  );

  // Shimmer animation on button
  const t = frame / fps;
  const shimmer = 0.7 + 0.3 * Math.sin((t * Math.PI * 2) / 2.5);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 52,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        opacity: ctaOp,
        transform: `translateY(${ctaY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: C.FONT,
          fontSize: 13,
          fontWeight: 500,
          color: C.MUTED,
          letterSpacing: 0.3,
        }}
      >
        Ship faster with Flowbase — trusted by 12,000+ product teams
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Primary CTA */}
        <div
          style={{
            background: `linear-gradient(90deg, ${C.BRAND}, ${C.BRAND_2})`,
            borderRadius: 8,
            padding: "10px 28px",
            boxShadow: `0 0 ${12 + shimmer * 10}px rgba(99,102,241,0.5)`,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontFamily: C.FONT,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: 0.3,
            }}
          >
            Join Early Access
          </span>
        </div>

        {/* Secondary */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontFamily: C.FONT,
              fontSize: 14,
              fontWeight: 600,
              color: C.MUTED,
            }}
          >
            View full roadmap →
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── ROOT COMPOSITION ─────────────────────────────────────────────────────────
export const RoadmapTeaser: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Global fade-out last 15 frames (0.5s)
  const globalOp = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: globalOp }}>
      <Background />
      <Header />
      <TimelineLine />

      {/* Quarter markers — staggered 12-frame intervals */}
      {QUARTERS.map((q, i) => (
        <QuarterMarker
          key={q.label}
          quarter={q}
          x={C.MARKER_XS[i]}
          markerDelay={C.MARKERS_BASE + i * 12}
          cardDelay={C.CARDS_BASE + i * 14}
        />
      ))}

      <CTA />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RoadmapTeaser"
    component={RoadmapTeaser}
    durationInFrames={C.TOTAL}
    fps={C.FPS}
    width={C.W}
    height={C.H}
  />
);
