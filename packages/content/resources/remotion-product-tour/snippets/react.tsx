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
const BG        = "#0a0a0f";
const SURFACE   = "#12121a";
const CARD      = "#1a1a2e";
const BRAND     = "#6366f1";
const BRAND_2   = "#8b5cf6";
const ACCENT    = "#06b6d4";
const TEXT      = "#f8fafc";
const MUTED     = "rgba(248,250,252,0.55)";
const SUCCESS   = "#10b981";
const WARNING   = "#f59e0b";
const DANGER    = "#ef4444";

const PRODUCT   = "Launchpad";

// ── Screen timing (each screen = 150 frames = 5 s, transition = 20 frames overlap) ──
// Screen 1: frames   0 – 149   (5 s)
// Screen 2: frames 140 – 289   (starts 10 fr into fade of screen 1)
// Screen 3: frames 280 – 449   (starts 10 fr into fade of screen 2)
// Fade-out: last 15 frames (435-449)

const S1_START =   0;
const S2_START = 140;
const S3_START = 280;
const TOTAL    = 450;

// ── Progress dot indicator ────────────────────────────────────────────────────
function ProgressDots({ frame }: { frame: number }) {
  const screenIndex =
    frame < S2_START - 5 ? 0 : frame < S3_START - 5 ? 1 : 2;
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        zIndex: 100,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: i === screenIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === screenIndex ? BRAND : "rgba(248,250,252,0.2)",
            transition: "all 0.3s",
            boxShadow: i === screenIndex ? `0 0 8px ${BRAND}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ── Footer step indicator ─────────────────────────────────────────────────────
function StepFooter({ step }: { step: number }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: MUTED,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {PRODUCT}
      </span>
      <span style={{ color: "rgba(248,250,252,0.15)", fontSize: 13 }}>·</span>
      <span
        style={{
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: TEXT,
        }}
      >
        Step {step} of 3
      </span>
    </div>
  );
}

// ── Callout arrow / label ─────────────────────────────────────────────────────
interface CalloutProps {
  x: number;
  y: number;
  label: string;
  progress: number; // 0→1
  direction?: "left" | "right";
  color?: string;
}

function Callout({ x, y, label, progress, direction = "right", color = BRAND }: CalloutProps) {
  const opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale   = interpolate(progress, [0, 0.5], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse   = interpolate(progress, [0.6, 1], [1, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const arrowW = 60;
  const arrowDir = direction === "right" ? 1 : -1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale * pulse})`,
        transformOrigin: direction === "right" ? "left center" : "right center",
        display: "flex",
        alignItems: "center",
        gap: 6,
        zIndex: 90,
        flexDirection: direction === "right" ? "row" : "row-reverse",
      }}
    >
      {/* Arrow line */}
      <svg width={arrowW} height={20} style={{ overflow: "visible" }}>
        <defs>
          <marker id={`arr-${direction}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path
              d={arrowDir > 0 ? "M0,0 L6,3 L0,6 Z" : "M6,0 L0,3 L6,6 Z"}
              fill={color}
            />
          </marker>
        </defs>
        <line
          x1={arrowDir > 0 ? 0 : arrowW}
          y1={10}
          x2={arrowDir > 0 ? arrowW - 4 : 4}
          y2={10}
          stroke={color}
          strokeWidth={2}
          markerEnd={arrowDir > 0 ? `url(#arr-right)` : undefined}
          markerStart={arrowDir < 0 ? `url(#arr-left)` : undefined}
        />
      </svg>
      {/* Label pill */}
      <div
        style={{
          background: `${color}22`,
          border: `1px solid ${color}66`,
          borderRadius: 6,
          padding: "4px 10px",
          fontFamily: "system-ui,-apple-system,sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color,
          whiteSpace: "nowrap",
          letterSpacing: "0.04em",
          boxShadow: `0 0 12px ${color}33`,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Miniature line chart (SVG path draw-in) ───────────────────────────────────
function ChartDrawIn({ progress }: { progress: number }) {
  const W = 420;
  const H = 120;

  // Monthly revenue sparkline points (relative 0-1 y-axis)
  const data = [0.35, 0.48, 0.42, 0.61, 0.58, 0.75, 0.69, 0.83, 0.79, 0.91, 0.88, 0.97];
  const xs = data.map((_, i) => (i / (data.length - 1)) * W);
  const ys = data.map((v) => H - v * H);

  // Build SVG smooth path
  const pathD = xs
    .map((x, i) => {
      if (i === 0) return `M${x},${ys[i]}`;
      const prevX = xs[i - 1];
      const cpX = (prevX + x) / 2;
      return `C${cpX},${ys[i - 1]} ${cpX},${ys[i]} ${x},${ys[i]}`;
    })
    .join(" ");

  // Fill area path
  const fillD = `${pathD} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  const dashLen = 900;
  const dashOffset = interpolate(progress, [0, 1], [dashLen, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fillOpacity = interpolate(progress, [0.3, 0.9], [0, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Months
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div style={{ position: "relative", width: W, height: H + 28 }}>
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.4" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((v, i) => (
          <line
            key={i}
            x1={0}
            y1={H - v * H}
            x2={W}
            y2={H - v * H}
            stroke="rgba(248,250,252,0.06)"
            strokeWidth={1}
          />
        ))}
        {/* Fill area */}
        <path d={fillD} fill="url(#chartGrad)" opacity={fillOpacity} />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={BRAND}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={dashLen}
          strokeDashoffset={dashOffset}
          style={{ filter: `drop-shadow(0 0 6px ${BRAND}88)` }}
        />
        {/* End dot */}
        {progress > 0.85 && (
          <circle
            cx={xs[xs.length - 1]}
            cy={ys[ys.length - 1]}
            r={5}
            fill={BRAND}
            style={{ filter: `drop-shadow(0 0 8px ${BRAND})` }}
            opacity={interpolate(progress, [0.85, 1], [0, 1])}
          />
        )}
      </svg>
      {/* Month labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 6,
          width: W,
        }}
      >
        {months.map((m, i) => (
          <span
            key={i}
            style={{
              fontFamily: "system-ui,-apple-system,sans-serif",
              fontSize: 10,
              color: MUTED,
              opacity: progress > 0.5 ? 1 : 0,
            }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Screen 1: Dashboard overview ──────────────────────────────────────────────
function Screen1({ localFrame, fps }: { localFrame: number; fps: number }) {
  // Entrance springs
  const browserEnter = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 100, mass: 0.8 } });
  const browserY     = interpolate(browserEnter, [0, 1], [40, 0]);

  const sidebarEnter = spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 20, stiffness: 120 } });

  const kpi1Enter = spring({ frame: Math.max(0, localFrame - 12), fps, config: { damping: 22, stiffness: 140 } });
  const kpi2Enter = spring({ frame: Math.max(0, localFrame - 18), fps, config: { damping: 22, stiffness: 140 } });
  const kpi3Enter = spring({ frame: Math.max(0, localFrame - 24), fps, config: { damping: 22, stiffness: 140 } });

  const chartProgress = interpolate(Math.max(0, localFrame - 35), [0, 60], [0, 1], { extrapolateRight: "clamp" });
  const calloutProg   = interpolate(Math.max(0, localFrame - 90), [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // KPI data
  const kpis = [
    { label: "MRR",       value: "$128,400", change: "+12.4%", color: BRAND,   icon: "◈" },
    { label: "DAU",       value: "24,183",   change: "+8.1%",  color: ACCENT,  icon: "◉" },
    { label: "Churn",     value: "1.8%",     change: "-0.3%",  color: SUCCESS, icon: "◎" },
  ];

  const sideItems = ["Dashboard", "Analytics", "Users", "Revenue", "Settings"];

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Browser chrome */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 52,
          width: 1160,
          height: 620,
          borderRadius: 12,
          background: SURFACE,
          border: "1px solid rgba(248,250,252,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
          opacity: browserEnter,
          transform: `translateY(${browserY}px)`,
        }}
      >
        {/* Browser top bar */}
        <div
          style={{
            height: 36,
            background: CARD,
            borderBottom: "1px solid rgba(248,250,252,0.06)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            gap: 6,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: DANGER }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: WARNING }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: SUCCESS }} />
          {/* URL bar */}
          <div
            style={{
              marginLeft: 16,
              flex: 1,
              maxWidth: 340,
              height: 22,
              background: "rgba(0,0,0,0.35)",
              borderRadius: 4,
              border: "1px solid rgba(248,250,252,0.08)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 8,
            }}
          >
            <span
              style={{
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 11,
                color: MUTED,
              }}
            >
              app.launchpad.io/dashboard
            </span>
          </div>
        </div>

        {/* App layout */}
        <div style={{ display: "flex", height: "calc(100% - 36px)" }}>
          {/* Sidebar */}
          <div
            style={{
              width: 180,
              background: "#0d0d18",
              borderRight: "1px solid rgba(248,250,252,0.06)",
              padding: "20px 0",
              opacity: sidebarEnter,
              transform: `translateX(${interpolate(sidebarEnter, [0, 1], [-20, 0])}px)`,
            }}
          >
            {/* Logo */}
            <div
              style={{
                padding: "0 16px 20px",
                borderBottom: "1px solid rgba(248,250,252,0.06)",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  ◈
                </div>
                <span
                  style={{
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: TEXT,
                  }}
                >
                  {PRODUCT}
                </span>
              </div>
            </div>
            {sideItems.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "9px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: i === 0 ? `${BRAND}18` : "transparent",
                  borderLeft: i === 0 ? `2px solid ${BRAND}` : "2px solid transparent",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: i === 0 ? BRAND : MUTED,
                  }}
                />
                <span
                  style={{
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    fontSize: 12,
                    fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? TEXT : MUTED,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: "20px 24px", overflow: "hidden" }}>
            {/* Page header */}
            <div
              style={{
                marginBottom: 18,
                opacity: kpi1Enter,
                transform: `translateY(${interpolate(kpi1Enter, [0, 1], [10, 0])}px)`,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: TEXT,
                }}
              >
                Dashboard
              </h1>
              <p
                style={{
                  margin: "2px 0 0",
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  fontSize: 12,
                  color: MUTED,
                }}
              >
                Overview · Last 30 days
              </p>
            </div>

            {/* KPI cards */}
            <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
              {kpis.map((k, i) => {
                const enters = [kpi1Enter, kpi2Enter, kpi3Enter];
                const e = enters[i];
                const isPositive = k.change.startsWith("+") || k.change.startsWith("-0");
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: CARD,
                      border: `1px solid rgba(248,250,252,0.07)`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      opacity: e,
                      transform: `translateY(${interpolate(e, [0, 1], [16, 0])}px)`,
                      boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "system-ui,-apple-system,sans-serif",
                          fontSize: 11,
                          color: MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {k.label}
                      </span>
                      <span style={{ fontSize: 14, color: k.color }}>{k.icon}</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "system-ui,-apple-system,sans-serif",
                        fontSize: 20,
                        fontWeight: 800,
                        color: TEXT,
                        marginBottom: 4,
                      }}
                    >
                      {k.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "system-ui,-apple-system,sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: isPositive ? SUCCESS : DANGER,
                      }}
                    >
                      {k.change} vs last month
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart section */}
            <div
              style={{
                background: CARD,
                border: "1px solid rgba(248,250,252,0.07)",
                borderRadius: 8,
                padding: "16px 20px",
                opacity: chartProgress > 0 ? 1 : 0,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "system-ui,-apple-system,sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: TEXT,
                    }}
                  >
                    Monthly Recurring Revenue
                  </span>
                  <span
                    style={{
                      marginLeft: 10,
                      fontFamily: "system-ui,-apple-system,sans-serif",
                      fontSize: 11,
                      color: MUTED,
                    }}
                  >
                    2025
                  </span>
                </div>
                <div
                  style={{
                    background: `${BRAND}18`,
                    border: `1px solid ${BRAND}44`,
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    fontSize: 11,
                    color: BRAND,
                    fontWeight: 600,
                  }}
                >
                  ↑ 32% YoY
                </div>
              </div>
              <ChartDrawIn progress={chartProgress} />

              {/* Callout for MRR peak */}
              <Callout
                x={330}
                y={30}
                label="MRR peak — $128K"
                progress={calloutProg}
                direction="right"
                color={ACCENT}
              />
            </div>
          </div>
        </div>
      </div>

      <ProgressDots frame={localFrame} />
      <StepFooter step={1} />
    </AbsoluteFill>
  );
}

// ── Screen 2: Settings / Automation panel ─────────────────────────────────────
function Screen2({ localFrame, fps }: { localFrame: number; fps: number }) {
  const panelEnter  = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 100, mass: 0.8 } });
  const row1Enter   = spring({ frame: Math.max(0, localFrame - 8),  fps, config: { damping: 22, stiffness: 140 } });
  const row2Enter   = spring({ frame: Math.max(0, localFrame - 16), fps, config: { damping: 22, stiffness: 140 } });
  const row3Enter   = spring({ frame: Math.max(0, localFrame - 24), fps, config: { damping: 22, stiffness: 140 } });
  const row4Enter   = spring({ frame: Math.max(0, localFrame - 32), fps, config: { damping: 22, stiffness: 140 } });
  const toggleEnter = spring({ frame: Math.max(0, localFrame - 44), fps, config: { damping: 20, stiffness: 160 } });
  const calloutProg = interpolate(Math.max(0, localFrame - 72), [0, 30], [0, 1], { extrapolateRight: "clamp" });

  const toggleGlow = interpolate(localFrame, [70, 110, 150], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rows = [
    { label: "Workspace name",       value: "Launchpad HQ",         type: "text" },
    { label: "Primary domain",        value: "app.launchpad.io",     type: "text" },
    { label: "Default timezone",      value: "UTC−5 (Eastern)",      type: "select" },
    { label: "Session timeout",       value: "30 minutes",           type: "select" },
  ];
  const enters = [row1Enter, row2Enter, row3Enter, row4Enter];

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Panel container */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 68,
          width: 880,
          background: SURFACE,
          border: "1px solid rgba(248,250,252,0.08)",
          borderRadius: 14,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
          opacity: panelEnter,
          transform: `scale(${interpolate(panelEnter, [0, 1], [0.94, 1])}) translateY(${interpolate(panelEnter, [0, 1], [30, 0])}px)`,
        }}
      >
        {/* Panel header */}
        <div
          style={{
            background: CARD,
            borderBottom: "1px solid rgba(248,250,252,0.07)",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: TEXT,
              }}
            >
              Workspace Settings
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 12,
                color: MUTED,
              }}
            >
              Manage workspace preferences and integrations
            </p>
          </div>
          {/* Save button */}
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
              borderRadius: 8,
              padding: "8px 20px",
              fontFamily: "system-ui,-apple-system,sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: TEXT,
              boxShadow: `0 4px 16px ${BRAND}44`,
            }}
          >
            Save Changes
          </div>
        </div>

        {/* Settings rows */}
        <div style={{ padding: "24px 28px" }}>
          {rows.map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid rgba(248,250,252,0.05)",
                opacity: enters[i],
                transform: `translateX(${interpolate(enters[i], [0, 1], [-20, 0])}px)`,
              }}
            >
              <label
                style={{
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  fontSize: 13,
                  color: TEXT,
                  fontWeight: 500,
                  width: 220,
                }}
              >
                {row.label}
              </label>
              <div
                style={{
                  flex: 1,
                  maxWidth: 380,
                  height: 38,
                  background: "#0d0d18",
                  border: "1px solid rgba(248,250,252,0.1)",
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                  paddingRight: 12,
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    fontSize: 13,
                    color: TEXT,
                  }}
                >
                  {row.value}
                </span>
                {row.type === "select" && (
                  <span style={{ fontSize: 10, color: MUTED }}>▾</span>
                )}
              </div>
            </div>
          ))}

          {/* Automation toggle row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              opacity: toggleEnter,
              transform: `translateX(${interpolate(toggleEnter, [0, 1], [-20, 0])}px)`,
              position: "relative",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT,
                  marginBottom: 3,
                }}
              >
                Smart Automation
              </div>
              <div
                style={{
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  fontSize: 12,
                  color: MUTED,
                }}
              >
                Auto-assign tasks, trigger workflows, and send notifications
              </div>
            </div>
            {/* Toggle switch */}
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: `linear-gradient(90deg, ${BRAND}, ${BRAND_2})`,
                position: "relative",
                boxShadow: `0 0 ${16 * toggleGlow}px ${BRAND}${Math.round(toggleGlow * 200).toString(16).padStart(2, "0")}`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 3,
                  top: 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </div>

            {/* Callout */}
            <div style={{ position: "absolute", right: -220, top: -14 }}>
              <Callout
                x={0}
                y={18}
                label="Automation ON"
                progress={calloutProg}
                direction="left"
                color={SUCCESS}
              />
            </div>
          </div>
        </div>
      </div>

      <ProgressDots frame={S2_START + localFrame} />
      <StepFooter step={2} />
    </AbsoluteFill>
  );
}

// ── Animated table rows ───────────────────────────────────────────────────────
function TableRows({ localFrame, fps }: { localFrame: number; fps: number }) {
  const rows = [
    { name: "Q1 Growth Report",    date: "Mar 31, 2025", revenue: "$381,200", status: "Published" },
    { name: "User Cohort Analysis", date: "Apr 14, 2025", revenue: "$–",       status: "Draft"     },
    { name: "Revenue Breakdown",   date: "May 02, 2025", revenue: "$422,800", status: "Published" },
    { name: "Churn Deep-Dive",     date: "May 28, 2025", revenue: "$–",       status: "Review"    },
    { name: "H1 Executive Summary",date: "Jun 06, 2025", revenue: "$803,000", status: "Published" },
  ];

  const statusColors: Record<string, string> = {
    Published: SUCCESS,
    Draft: MUTED,
    Review: WARNING,
  };

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          padding: "8px 0",
          borderBottom: "1px solid rgba(248,250,252,0.1)",
          marginBottom: 2,
        }}
      >
        {["Report Name", "Date", "Revenue", "Status"].map((h) => (
          <span
            key={h}
            style={{
              flex: h === "Report Name" ? 2 : 1,
              fontFamily: "system-ui,-apple-system,sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {h}
          </span>
        ))}
      </div>
      {rows.map((row, i) => {
        const e = spring({ frame: Math.max(0, localFrame - i * 8), fps, config: { damping: 22, stiffness: 140 } });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "11px 0",
              borderBottom: "1px solid rgba(248,250,252,0.04)",
              opacity: e,
              transform: `translateX(${interpolate(e, [0, 1], [20, 0])}px)`,
            }}
          >
            <span
              style={{
                flex: 2,
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: TEXT,
              }}
            >
              {row.name}
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 12,
                color: MUTED,
              }}
            >
              {row.date}
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: row.revenue !== "$–" ? TEXT : MUTED,
              }}
            >
              {row.revenue}
            </span>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  background: `${statusColors[row.status]}18`,
                  border: `1px solid ${statusColors[row.status]}44`,
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: statusColors[row.status],
                  letterSpacing: "0.04em",
                }}
              >
                {row.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Screen 3: Reports view ────────────────────────────────────────────────────
function Screen3({ localFrame, fps }: { localFrame: number; fps: number }) {
  const headerEnter  = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 100, mass: 0.8 } });
  const chartEnter   = spring({ frame: Math.max(0, localFrame - 6),  fps, config: { damping: 20, stiffness: 120 } });
  const tableEnter   = spring({ frame: Math.max(0, localFrame - 20), fps, config: { damping: 20, stiffness: 120 } });
  const chartProgress = interpolate(Math.max(0, localFrame - 10), [0, 55], [0, 1], { extrapolateRight: "clamp" });
  const calloutProg  = interpolate(Math.max(0, localFrame - 90), [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // Bar chart data: quarterly revenue
  const quarters = [
    { q: "Q1", rev: 381200, color: BRAND   },
    { q: "Q2", rev: 422800, color: BRAND_2 },
    { q: "Q3", rev: 510600, color: ACCENT  },
    { q: "Q4", rev: 598100, color: SUCCESS },
  ];
  const maxRev = Math.max(...quarters.map((q) => q.rev));
  const barH = 120;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Main container */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 52,
          width: 1160,
          background: SURFACE,
          border: "1px solid rgba(248,250,252,0.08)",
          borderRadius: 14,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
          opacity: headerEnter,
          transform: `translateY(${interpolate(headerEnter, [0, 1], [30, 0])}px)`,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: CARD,
            borderBottom: "1px solid rgba(248,250,252,0.07)",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: TEXT,
              }}
            >
              Reports
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 12,
                color: MUTED,
              }}
            >
              Annual performance · FY 2025
            </p>
          </div>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", position: "relative" }}>
            <div
              style={{
                background: "rgba(248,250,252,0.06)",
                border: "1px solid rgba(248,250,252,0.1)",
                borderRadius: 7,
                padding: "7px 14px",
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 12,
                color: MUTED,
              }}
            >
              Filter ▾
            </div>
            {/* Export button */}
            <div
              id="export-btn"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`,
                borderRadius: 7,
                padding: "7px 16px",
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: TEXT,
                boxShadow: `0 4px 16px ${ACCENT}44`,
                position: "relative",
              }}
            >
              ↑ Export CSV
            </div>
            {/* Callout on export */}
            <div style={{ position: "absolute", right: -200, top: -6 }}>
              <Callout
                x={0}
                y={14}
                label="Export to CSV"
                progress={calloutProg}
                direction="left"
                color={ACCENT}
              />
            </div>
          </div>
        </div>

        {/* Content area: chart + table */}
        <div style={{ padding: "20px 28px" }}>
          {/* Bar chart */}
          <div
            style={{
              background: CARD,
              border: "1px solid rgba(248,250,252,0.07)",
              borderRadius: 10,
              padding: "18px 24px",
              marginBottom: 20,
              opacity: chartEnter,
              transform: `translateY(${interpolate(chartEnter, [0, 1], [20, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: TEXT,
                marginBottom: 16,
              }}
            >
              Revenue by Quarter
            </div>
            <div style={{ display: "flex", gap: 32, alignItems: "flex-end", height: barH + 24 }}>
              {quarters.map((q, i) => {
                const maxBarH = barH;
                const barPct  = q.rev / maxRev;
                const growProg = interpolate(chartProgress, [i * 0.15, i * 0.15 + 0.55], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                });
                const currentH = growProg * maxBarH * barPct;
                const labelOp  = interpolate(chartProgress, [i * 0.15 + 0.4, i * 0.15 + 0.7], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={i}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}
                  >
                    <span
                      style={{
                        fontFamily: "system-ui,-apple-system,sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        color: q.color,
                        opacity: labelOp,
                      }}
                    >
                      ${(q.rev / 1000).toFixed(0)}K
                    </span>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 80,
                        height: currentH,
                        background: `linear-gradient(180deg, ${q.color} 0%, ${q.color}88 100%)`,
                        borderRadius: "4px 4px 0 0",
                        boxShadow: `0 0 16px ${q.color}44`,
                        alignSelf: "flex-end",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "system-ui,-apple-system,sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        color: MUTED,
                      }}
                    >
                      {q.q}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              opacity: tableEnter,
              transform: `translateY(${interpolate(tableEnter, [0, 1], [20, 0])}px)`,
            }}
          >
            <TableRows localFrame={Math.max(0, localFrame - 22)} fps={fps} />
          </div>
        </div>
      </div>

      <ProgressDots frame={S3_START + localFrame} />
      <StepFooter step={3} />
    </AbsoluteFill>
  );
}

// ── Cross-screen fade/zoom transition wrapper ─────────────────────────────────
function FadeZoom({
  children,
  enterAt,
  exitAt,
  totalFrames,
  frame,
}: {
  children: React.ReactNode;
  enterAt: number;
  exitAt: number;
  totalFrames: number;
  frame: number;
}) {
  const FADE = 20;
  const fadeIn  = interpolate(frame, [enterAt, enterAt + FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const fadeOut = interpolate(frame, [exitAt - FADE, exitAt],   [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const scaleIn = interpolate(frame, [enterAt, enterAt + FADE], [0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scaleOut= interpolate(frame, [exitAt - FADE, exitAt],   [1, 1.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const opacity = fadeIn * fadeOut;
  const scale   = scaleIn * (scaleOut / 1); // combine: mostly enter scale dominates

  if (frame < enterAt - FADE || frame > exitAt + FADE) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
}

// ── Root composition ──────────────────────────────────────────────────────────
function ProductTourVideo() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out last 15 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Vignette overlay
  const vignette = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );

  return (
    <AbsoluteFill
      style={{
        background: BG,
        opacity: globalOpacity,
        overflow: "hidden",
      }}
    >
      {/* Screen 1: 0 → 149 + transition tail to 165 */}
      <FadeZoom enterAt={S1_START} exitAt={S2_START + 10} totalFrames={durationInFrames} frame={frame}>
        <Screen1 localFrame={frame - S1_START} fps={fps} />
      </FadeZoom>

      {/* Screen 2: 130 → 289 + transition tail to 305 */}
      <FadeZoom enterAt={S2_START - 10} exitAt={S3_START + 10} totalFrames={durationInFrames} frame={frame}>
        <Screen2 localFrame={Math.max(0, frame - S2_START)} fps={fps} />
      </FadeZoom>

      {/* Screen 3: 270 → end */}
      <FadeZoom enterAt={S3_START - 10} exitAt={durationInFrames} totalFrames={durationInFrames} frame={frame}>
        <Screen3 localFrame={Math.max(0, frame - S3_START)} fps={fps} />
      </FadeZoom>

      {vignette}
    </AbsoluteFill>
  );
}

// ── RemotionRoot (required entry point) ───────────────────────────────────────
export function RemotionRoot() {
  return (
    <Composition
      id="ProductTourVideo"
      component={ProductTourVideo}
      durationInFrames={TOTAL}
      fps={30}
      width={1280}
      height={720}
    />
  );
}

export default ProductTourVideo;
