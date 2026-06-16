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

// ── Config ────────────────────────────────────────────────────────────────────
const BG = "#09090f";
const SURFACE = "#111118";
const SIDEBAR_W = 220;
const PANEL_PAD = 24;

// Each spotlight phase: which region to highlight and for how long
const SPOTLIGHTS = [
  {
    id: "sidebar",
    startFrame: 40,
    duration: 50,
    color: "#6366f1", // indigo
    label: "Smart Navigation",
    desc: "Jump to any section instantly. Keyboard-first, always.",
  },
  {
    id: "chart",
    startFrame: 100,
    duration: 50,
    color: "#06b6d4", // cyan
    label: "Real-time Charts",
    desc: "Live data streams update every second, zero reload.",
  },
  {
    id: "kpis",
    startFrame: 160,
    duration: 50,
    color: "#10b981", // emerald
    label: "Live KPIs",
    desc: "Track revenue, users, and churn at a glance.",
  },
] as const;

type SpotlightId = (typeof SPOTLIGHTS)[number]["id"];

// ── Stat card data ────────────────────────────────────────────────────────────
const KPI_CARDS = [
  { label: "MRR", value: "$42,810", delta: "+12.4%", up: true },
  { label: "Active Users", value: "18,392", delta: "+7.1%", up: true },
  { label: "Churn Rate", value: "1.8%", delta: "-0.3%", up: false },
];

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: "▦", label: "Overview", active: true },
  { icon: "↗", label: "Revenue", active: false },
  { icon: "◎", label: "Users", active: false },
  { icon: "⊟", label: "Reports", active: false },
  { icon: "⚙", label: "Settings", active: false },
];

// ── Sub-component: subtle dot-grid background ─────────────────────────────────
const DotGrid: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      pointerEvents: "none",
    }}
  />
);

// ── Sub-component: radial ambient glow ───────────────────────────────────────
const AmbientGlow: React.FC<{ color: string; x: number; y: number; size: number; opacity: number }> = ({
  color,
  x,
  y,
  size,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")} 0%, transparent 70%)`,
      pointerEvents: "none",
    }}
  />
);

// ── Sub-component: pulsing spotlight ring ─────────────────────────────────────
const SpotlightRing: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  frame: number; // local frame within spotlight sequence
  fps: number;
}> = ({ x, y, w, h, color, frame, fps }) => {
  const expand = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const opacity = interpolate(frame, [0, 8, 40, 50], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse scale oscillation
  const pulse = 1 + 0.012 * Math.sin((frame / fps) * Math.PI * 4);

  const scale = interpolate(expand, [0, 1], [0.88, 1]) * pulse;
  const pad = 10;

  return (
    <div
      style={{
        position: "absolute",
        left: x - pad,
        top: y - pad,
        width: w + pad * 2,
        height: h + pad * 2,
        borderRadius: 14,
        border: `2.5px solid ${color}`,
        boxShadow: `0 0 24px 6px ${color}55, 0 0 60px 12px ${color}22`,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        pointerEvents: "none",
      }}
    />
  );
};

// ── Sub-component: callout bubble ─────────────────────────────────────────────
const CalloutBubble: React.FC<{
  label: string;
  desc: string;
  color: string;
  frame: number;
  fps: number;
  side: "left" | "right";
  anchorX: number;
  anchorY: number;
}> = ({ label, desc, color, frame, fps, side, anchorX, anchorY }) => {
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const opacity = interpolate(frame, [0, 6, 42, 50], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tx = interpolate(enter, [0, 1], [side === "right" ? 30 : -30, 0]);
  const ty = interpolate(enter, [0, 1], [8, 0]);

  const BUBBLE_W = 240;
  const left = side === "right" ? anchorX + 20 : anchorX - BUBBLE_W - 20;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: anchorY - 36,
        width: BUBBLE_W,
        opacity,
        transform: `translate(${tx}px, ${ty}px)`,
      }}
    >
      {/* Connector dot */}
      <div
        style={{
          position: "absolute",
          top: 38,
          left: side === "right" ? -8 : BUBBLE_W + 2,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px 3px ${color}88`,
        }}
      />
      {/* Bubble card */}
      <div
        style={{
          background: "rgba(10,10,20,0.92)",
          border: `1.5px solid ${color}66`,
          borderRadius: 12,
          padding: "12px 16px",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "system-ui",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        </div>
        <p
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: 12.5,
            fontFamily: "system-ui",
            fontWeight: 400,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
};

// ── Sub-component: the mock SaaS dashboard UI ─────────────────────────────────
const MockDashboard: React.FC<{
  activeSpotlight: SpotlightId | null;
}> = ({ activeSpotlight }) => {
  const dimOther = (id: SpotlightId) =>
    activeSpotlight !== null && activeSpotlight !== id ? 0.28 : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 80,
        right: 80,
        bottom: 80,
        borderRadius: 16,
        background: SURFACE,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        id="sidebar"
        style={{
          width: SIDEBAR_W,
          background: "#0d0d15",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
          opacity: dimOther("sidebar"),
          transition: "opacity 0.2s",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "0 20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>D</span>
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.9)",
                fontFamily: "system-ui",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.01em",
              }}
            >
              DataFlow
            </span>
          </div>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 20px",
              marginBottom: 2,
              borderRadius: 8,
              marginLeft: 8,
              marginRight: 8,
              background: item.active ? "rgba(99,102,241,0.18)" : "transparent",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                color: item.active ? "#818cf8" : "rgba(255,255,255,0.35)",
                fontSize: 14,
                width: 18,
                textAlign: "center",
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                color: item.active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
                fontFamily: "system-ui",
                fontWeight: item.active ? 600 : 400,
                fontSize: 13,
              }}
            >
              {item.label}
            </span>
            {item.active && (
              <div
                style={{
                  marginLeft: "auto",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#818cf8",
                }}
              />
            )}
          </div>
        ))}

        {/* Spacer + workspace badge */}
        <div style={{ marginTop: "auto", padding: "0 12px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              }}
            />
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "system-ui",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Alex Rivera
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "system-ui",
                  fontSize: 10,
                }}
              >
                Admin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Title bar */}
        <div
          style={{
            height: 52,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.88)",
              fontFamily: "system-ui",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Overview
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "system-ui",
              fontSize: 13,
            }}
          >
            / June 2026
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {/* Notification bell */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>🔔</span>
            </div>
            {/* Date range picker mock */}
            <div
              style={{
                height: 32,
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                gap: 6,
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: "system-ui",
                  fontSize: 11,
                }}
              >
                Last 30 days
              </span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>▾</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: PANEL_PAD, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Chart area */}
          <div
            id="chart"
            style={{
              flex: 1,
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexDirection: "column",
              padding: 18,
              opacity: dimOther("chart"),
              transition: "opacity 0.2s",
              minHeight: 0,
            }}
          >
            {/* Chart header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "system-ui",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Monthly Recurring Revenue
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {["1W", "1M", "3M", "1Y"].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      padding: "3px 9px",
                      borderRadius: 6,
                      background: i === 1 ? "rgba(6,182,212,0.18)" : "transparent",
                      border: i === 1 ? "1px solid rgba(6,182,212,0.35)" : "1px solid transparent",
                    }}
                  >
                    <span
                      style={{
                        color: i === 1 ? "#22d3ee" : "rgba(255,255,255,0.35)",
                        fontFamily: "system-ui",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake chart bars */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                position: "relative",
              }}
            >
              {/* Y-axis grid lines */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <div
                  key={pct}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: `${pct}%`,
                    height: 1,
                    background: "rgba(255,255,255,0.05)",
                  }}
                />
              ))}

              {/* Bars */}
              {[38, 52, 45, 61, 58, 74, 68, 82, 79, 88, 84, 95].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: "4px 4px 0 0",
                    background:
                      i === 11
                        ? "linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)"
                        : i >= 9
                        ? "rgba(6,182,212,0.45)"
                        : "rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                />
              ))}
            </div>

            {/* X labels */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 8,
              }}
            >
              {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                (m) => (
                  <div
                    key={m}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "system-ui",
                        fontSize: 10,
                      }}
                    >
                      {m}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* KPI stat cards */}
          <div
            id="kpis"
            style={{
              display: "flex",
              gap: 12,
              opacity: dimOther("kpis"),
              transition: "opacity 0.2s",
              flexShrink: 0,
            }}
          >
            {KPI_CARDS.map((card) => (
              <div
                key={card.label}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "system-ui",
                    fontSize: 11,
                    fontWeight: 500,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    fontFamily: "system-ui",
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    color: card.up ? "#10b981" : "#f43f5e",
                    fontFamily: "system-ui",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {card.delta} vs last month
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sub-component: closing title card ─────────────────────────────────────────
const ClosingTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(enter, [0, 1], [40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${ty}px)`,
      }}
    >
      {/* Glow behind title */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 200,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>D</span>
        </div>
        <span
          style={{
            color: "#fff",
            fontFamily: "system-ui",
            fontWeight: 800,
            fontSize: 38,
            letterSpacing: "-0.02em",
          }}
        >
          DataFlow Analytics
        </span>
      </div>
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontFamily: "system-ui",
          fontWeight: 400,
          fontSize: 18,
          margin: 0,
          letterSpacing: "0.01em",
        }}
      >
        Understand your business. In real time.
      </p>
      <div
        style={{
          marginTop: 28,
          padding: "10px 28px",
          borderRadius: 40,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          boxShadow: "0 0 32px rgba(99,102,241,0.45)",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontFamily: "system-ui",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.04em",
          }}
        >
          Start Free Trial →
        </span>
      </div>
    </div>
  );
};

// ── Main composition ───────────────────────────────────────────────────────────
export const ProductDemoWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dashboard entrance
  const dashboardEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 90 },
    from: 0,
    to: 1,
  });
  const dashboardOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashboardScale = interpolate(dashboardEnter, [0, 1], [0.94, 1]);

  // Determine active spotlight
  let activeSpotlight: SpotlightId | null = null;
  for (const sp of SPOTLIGHTS) {
    if (frame >= sp.startFrame && frame < sp.startFrame + sp.duration) {
      activeSpotlight = sp.id;
      break;
    }
  }

  // Show closing title from frame 218
  const showClosing = frame >= 218;

  // Dim overlay when spotlight is active
  const dimFrame = activeSpotlight !== null ? Math.min(frame - (SPOTLIGHTS.find(s => s.id === activeSpotlight)!.startFrame), 15) : 0;
  const dimOpacity = interpolate(dimFrame, [0, 10], [0, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Background decoration */}
      <DotGrid />
      <AmbientGlow color="#6366f1" x={300} y={200} size={600} opacity={0.12} />
      <AmbientGlow color="#06b6d4" x={980} y={520} size={500} opacity={0.10} />

      {/* Dashboard (hidden during closing) */}
      {!showClosing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: dashboardOpacity,
            transform: `scale(${dashboardScale})`,
            transformOrigin: "center",
          }}
        >
          <MockDashboard activeSpotlight={activeSpotlight} />

          {/* Dim overlay on non-spotlighted areas */}
          {activeSpotlight !== null && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(9,9,15,${dimOpacity})`,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Spotlight rings and callouts */}
          {SPOTLIGHTS.map((sp) => {
            const localFrame = frame - sp.startFrame;
            if (localFrame < 0 || localFrame >= sp.duration) return null;

            // Region coordinates relative to the AbsoluteFill (1280×720)
            // Dashboard outer box: left=80, top=80, right=80, bottom=80 → 1120×560
            // Sidebar: left=80..300, full height of dashboard inner (80..640)
            // Chart: left=300+24, top=80+52+24=156, right=1280-80-24=1176, bottom=640-80-16=544 (approx)
            // KPI row: below chart

            const regions: Record<SpotlightId, { x: number; y: number; w: number; h: number; bubbleSide: "left" | "right"; bubbleAnchorX: number; bubbleAnchorY: number }> = {
              sidebar: { x: 80, y: 80, w: SIDEBAR_W, h: 560, bubbleSide: "right", bubbleAnchorX: 80 + SIDEBAR_W, bubbleAnchorY: 360 },
              chart: { x: 80 + SIDEBAR_W + PANEL_PAD, y: 80 + 52 + PANEL_PAD, w: 1120 - SIDEBAR_W - PANEL_PAD * 2, h: 320, bubbleSide: "left", bubbleAnchorX: 80 + SIDEBAR_W + PANEL_PAD, bubbleAnchorY: 260 },
              kpis: { x: 80 + SIDEBAR_W + PANEL_PAD, y: 80 + 52 + PANEL_PAD + 336, w: 1120 - SIDEBAR_W - PANEL_PAD * 2, h: 100, bubbleSide: "left", bubbleAnchorX: 80 + SIDEBAR_W + PANEL_PAD, bubbleAnchorY: 590 },
            };

            const region = regions[sp.id];

            return (
              <React.Fragment key={sp.id}>
                <SpotlightRing
                  x={region.x}
                  y={region.y}
                  w={region.w}
                  h={region.h}
                  color={sp.color}
                  frame={localFrame}
                  fps={fps}
                />
                <CalloutBubble
                  label={sp.label}
                  desc={sp.desc}
                  color={sp.color}
                  frame={localFrame}
                  fps={fps}
                  side={region.bubbleSide}
                  anchorX={region.bubbleAnchorX}
                  anchorY={region.bubbleAnchorY}
                />
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Closing title */}
      {showClosing && (
        <ClosingTitle frame={frame - 218} fps={fps} />
      )}

      {/* Watermark */}
      {!showClosing && (
        <div
          style={{
            position: "absolute",
            bottom: 22,
            right: 32,
            color: "rgba(255,255,255,0.18)",
            fontFamily: "system-ui",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.06em",
          }}
        >
          DataFlow Analytics · Product Demo
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Remotion root export ───────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ProductDemoWalkthrough"
    component={ProductDemoWalkthrough}
    durationInFrames={240}
    fps={30}
    width={1280}
    height={720}
  />
);
