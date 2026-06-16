import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Design Tokens ─────────────────────────────────────────────────────────────
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
const BORDER = "rgba(248,250,252,0.08)";

const DURATION = 360; // 12 s × 30 fps
const FPS = 30;
const W = 1280;
const H = 720;

// Each panel: 2 s visible = 60 frames, transition ~10 frames
// Panel timing (slide in at from, hold, slide out at from+50, next starts at from+50)
const PANELS = [
  { from: 0, duration: 60 },
  { from: 50, duration: 60 },
  { from: 100, duration: 60 },
  { from: 150, duration: 60 },
  { from: 200, duration: 60 },
  { from: 250, duration: 60 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const seededRand = (seed: number): number => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

// Slide-in from right (local frame), slide-out to left after holdFrames
const panelTransform = (
  localFrame: number,
  fps: number,
  holdFrames: number
): { translateX: number; opacity: number } => {
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.9 },
  });
  const translateXIn = interpolate(enterSpring, [0, 1], [W, 0]);

  // slide-out: after holdFrames, animate out to left
  const exitProgress = interpolate(localFrame, [holdFrames, holdFrames + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const translateXOut = interpolate(exitProgress, [0, 1], [0, -W * 0.8]);

  const translateX = translateXIn + translateXOut;
  const opacity = interpolate(localFrame, [holdFrames + 6, holdFrames + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return { translateX, opacity };
};

// ── Panel 1: Modal Dialog ─────────────────────────────────────────────────────
const ModalDialogPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { translateX, opacity } = panelTransform(frame, fps, 48);

  const overlayOpacity = interpolate(frame, [2, 12], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dialogSpring = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 16, stiffness: 140 },
  });
  const dialogY = interpolate(dialogSpring, [0, 1], [40, 0]);
  const dialogScale = interpolate(dialogSpring, [0, 1], [0.9, 1]);
  const dialogOpacity = interpolate(frame, [4, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const inputOpacity = interpolate(frame, [12, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const btnOpacity = interpolate(frame, [20, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const btnSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const btnScale = interpolate(btnSpring, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: BG,
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Dimmed overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          opacity: overlayOpacity,
        }}
      />

      {/* Mock app behind modal */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          right: 60,
          height: 220,
          borderRadius: 12,
          backgroundColor: SURFACE,
          border: `1px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 20px",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: DANGER }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: WARNING }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: SUCCESS }} />
          <span
            style={{
              marginLeft: 12,
              fontFamily: "system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: TEXT_MUTED,
            }}
          >
            Flowbase — Workspace
          </span>
        </div>
        {/* Blurred content lines */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              margin: "12px 20px 0",
              height: 12,
              borderRadius: 6,
              backgroundColor: "rgba(248,250,252,0.05)",
              width: `${60 + seededRand(i * 13) * 30}%`,
              filter: "blur(2px)",
            }}
          />
        ))}
      </div>

      {/* Modal card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 520,
          transform: `translate(-50%, calc(-50% + ${dialogY}px)) scale(${dialogScale})`,
          backgroundColor: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: "32px 36px",
          opacity: dialogOpacity,
          boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            marginBottom: 18,
          }}
        >
          ✦
        </div>

        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: TEXT,
            marginBottom: 8,
          }}
        >
          Invite Team Member
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            color: TEXT_MUTED,
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Add a colleague to your Flowbase workspace. They'll receive an email invitation.
        </div>

        {/* Input fields */}
        <div style={{ opacity: inputOpacity, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: TEXT_MUTED,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Email address
            </div>
            <div
              style={{
                backgroundColor: SURFACE,
                border: `1px solid ${BRAND}60`,
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                color: TEXT,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: TEXT_MUTED }}>✉</span>
              sarah.chen@company.io
              <span
                style={{
                  marginLeft: "auto",
                  width: 2,
                  height: 16,
                  backgroundColor: BRAND,
                  borderRadius: 1,
                  animation: "blink 1s step-end infinite",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                flex: 1,
                backgroundColor: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                color: TEXT_MUTED,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Role</span>
              <span>Editor ▾</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 24,
            opacity: btnOpacity,
            transform: `scale(${btnScale})`,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 8,
              backgroundColor: SURFACE,
              border: `1px solid ${BORDER}`,
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: TEXT_MUTED,
              cursor: "pointer",
            }}
          >
            Cancel
          </div>
          <div
            style={{
              flex: 2,
              padding: "11px 0",
              borderRadius: 8,
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: TEXT,
              cursor: "pointer",
              boxShadow: `0 4px 16px ${BRAND}50`,
            }}
          >
            Send Invitation
          </div>
        </div>
      </div>

      {/* Panel label */}
      <PanelLabel label="01 / Modal Dialog" frame={frame} />
    </div>
  );
};

// ── Panel 2: Data Table ────────────────────────────────────────────────────────
const TABLE_ROWS = [
  { name: "Sarah Chen", email: "s.chen@co.io", status: "Active", plan: "Pro", mrr: "$249" },
  { name: "Marcus Webb", email: "m.webb@co.io", status: "Trial", plan: "Starter", mrr: "$49" },
  { name: "Priya Sharma", email: "p.sharma@co.io", status: "Active", plan: "Enterprise", mrr: "$899" },
  { name: "Leo Fontaine", email: "l.fontaine@co.io", status: "Churned", plan: "Pro", mrr: "$0" },
  { name: "Aiko Tanaka", email: "a.tanaka@co.io", status: "Active", plan: "Pro", mrr: "$249" },
];

const statusColor = (s: string) => {
  if (s === "Active") return SUCCESS;
  if (s === "Trial") return WARNING;
  if (s === "Churned") return DANGER;
  return ACCENT;
};

const DataTablePanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { translateX, opacity } = panelTransform(frame, fps, 48);

  const headerOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${translateX}px)`,
        opacity,
        backgroundColor: BG,
      }}
    >
      {/* Gradient accent top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${BRAND}, ${ACCENT})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "44px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Heading */}
        <div
          style={{
            opacity: headerOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: TEXT,
                letterSpacing: -0.5,
              }}
            >
              Customers
            </div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                color: TEXT_MUTED,
                marginTop: 4,
              }}
            >
              1,284 total · 42 added this week
            </div>
          </div>
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
              borderRadius: 8,
              padding: "9px 20px",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: TEXT,
            }}
          >
            + Add Customer
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: SURFACE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
              padding: "12px 20px",
              borderBottom: `1px solid ${BORDER}`,
              opacity: headerOpacity,
            }}
          >
            {["Name", "Email", "Status", "Plan", "MRR"].map((col) => (
              <span
                key={col}
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {TABLE_ROWS.map((row, i) => {
            const rowOpacity = interpolate(frame, [12 + i * 5, 22 + i * 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const rowY = interpolate(frame, [12 + i * 5, 24 + i * 5], [12, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
                  padding: "14px 20px",
                  borderBottom: i < TABLE_ROWS.length - 1 ? `1px solid ${BORDER}` : "none",
                  backgroundColor: i === 2 ? `${BRAND}10` : "transparent",
                  opacity: rowOpacity,
                  transform: `translateY(${rowY}px)`,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: TEXT,
                  }}
                >
                  {row.name}
                </span>
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 13,
                    color: TEXT_MUTED,
                  }}
                >
                  {row.email}
                </span>
                <span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: `${statusColor(row.status)}18`,
                      borderRadius: 100,
                      padding: "3px 10px",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: statusColor(row.status),
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusColor(row.status),
                      }}
                    >
                      {row.status}
                    </span>
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 13,
                    color: TEXT_MUTED,
                  }}
                >
                  {row.plan}
                </span>
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: row.mrr === "$0" ? DANGER : TEXT,
                  }}
                >
                  {row.mrr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <PanelLabel label="02 / Data Table" frame={frame} />
    </div>
  );
};

// ── Panel 3: Bar Chart ─────────────────────────────────────────────────────────
const CHART_DATA = [
  { month: "Jan", value: 42, color: BRAND },
  { month: "Feb", value: 58, color: BRAND },
  { month: "Mar", value: 51, color: BRAND },
  { month: "Apr", value: 74, color: BRAND },
  { month: "May", value: 88, color: BRAND_2 },
  { month: "Jun", value: 67, color: BRAND },
  { month: "Jul", value: 95, color: BRAND_2 },
  { month: "Aug", value: 83, color: ACCENT },
  { month: "Sep", value: 76, color: BRAND },
  { month: "Oct", value: 91, color: ACCENT },
  { month: "Nov", value: 105, color: BRAND_2 },
  { month: "Dec", value: 118, color: ACCENT },
];
const MAX_VAL = 130;

const BarChartPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { translateX, opacity } = panelTransform(frame, fps, 48);

  const headerOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${translateX}px)`,
        opacity,
        backgroundColor: BG,
      }}
    >
      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${BRAND_2}, ${ACCENT})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "44px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ opacity: headerOpacity, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: TEXT,
              }}
            >
              Revenue Growth
            </div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                color: TEXT_MUTED,
                marginTop: 4,
              }}
            >
              Monthly recurring revenue · FY 2025
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 32,
                color: TEXT,
                letterSpacing: -1,
              }}
            >
              $118k
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                color: SUCCESS,
                fontWeight: 600,
              }}
            >
              ↑ 30.2% vs last month
            </div>
          </div>
        </div>

        {/* Chart area */}
        <div
          style={{
            flex: 1,
            backgroundColor: SURFACE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px 24px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Horizontal grid lines */}
          <div style={{ position: "relative", flex: 1 }}>
            {[0, 25, 50, 75, 100].map((pct) => (
              <div
                key={pct}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${pct}%`,
                  borderTop: `1px solid ${BORDER}`,
                  opacity: headerOpacity,
                }}
              />
            ))}

            {/* Bars */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                padding: "0 4px",
              }}
            >
              {CHART_DATA.map((bar, i) => {
                const barHeight = interpolate(
                  frame,
                  [8 + i * 2, 22 + i * 2],
                  [0, (bar.value / MAX_VAL) * 100],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.out(Easing.cubic),
                  }
                );
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${barHeight}%`,
                      background:
                        bar.color === ACCENT
                          ? `linear-gradient(to top, ${ACCENT}aa, ${ACCENT})`
                          : bar.color === BRAND_2
                          ? `linear-gradient(to top, ${BRAND_2}aa, ${BRAND_2})`
                          : `linear-gradient(to top, ${BRAND}aa, ${BRAND})`,
                      borderRadius: "4px 4px 0 0",
                      position: "relative",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "8px 4px 0",
              opacity: headerOpacity,
            }}
          >
            {CHART_DATA.map((bar, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 11,
                  color: TEXT_MUTED,
                }}
              >
                {bar.month}
              </div>
            ))}
          </div>
        </div>
      </div>

      <PanelLabel label="03 / Analytics Chart" frame={frame} />
    </div>
  );
};

// ── Panel 4: Kanban Board ─────────────────────────────────────────────────────
const KANBAN_COLS = [
  {
    title: "Backlog",
    color: TEXT_MUTED,
    cards: [
      { title: "API rate limiting", tag: "Backend", prio: "low" },
      { title: "Dark mode refinements", tag: "Design", prio: "med" },
    ],
  },
  {
    title: "In Progress",
    color: WARNING,
    cards: [
      { title: "SSO integration", tag: "Auth", prio: "high" },
      { title: "Billing webhooks", tag: "Payments", prio: "high" },
      { title: "Export to CSV", tag: "Data", prio: "med" },
    ],
  },
  {
    title: "Review",
    color: ACCENT,
    cards: [
      { title: "Onboarding flow v2", tag: "UX", prio: "high" },
      { title: "Email templates", tag: "Marketing", prio: "low" },
    ],
  },
  {
    title: "Done",
    color: SUCCESS,
    cards: [
      { title: "Workspace settings", tag: "Settings", prio: "med" },
      { title: "Team invites", tag: "Collab", prio: "med" },
    ],
  },
];

const prioColor = (p: string) =>
  p === "high" ? DANGER : p === "med" ? WARNING : TEXT_MUTED;

const KanbanPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { translateX, opacity } = panelTransform(frame, fps, 48);

  const headerOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${translateX}px)`,
        opacity,
        backgroundColor: BG,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${WARNING}, ${SUCCESS})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "44px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ opacity: headerOpacity, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: TEXT,
              }}
            >
              Sprint Q3 — Week 24
            </div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                color: TEXT_MUTED,
                marginTop: 4,
              }}
            >
              9 tasks · 3 in progress
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: -8,
            }}
          >
            {["SC", "MW", "AT", "LF"].map((initials, i) => (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: [
                    `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
                    `linear-gradient(135deg, ${ACCENT}, ${SUCCESS})`,
                    `linear-gradient(135deg, ${WARNING}, ${DANGER})`,
                    `linear-gradient(135deg, ${BRAND_2}, ${ACCENT})`,
                  ][i],
                  border: `2px solid ${BG}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: TEXT,
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: 4 - i,
                  position: "relative",
                }}
              >
                {initials}
              </div>
            ))}
          </div>
        </div>

        {/* Columns */}
        <div style={{ flex: 1, display: "flex", gap: 12, overflow: "hidden" }}>
          {KANBAN_COLS.map((col, ci) => {
            const colOpacity = interpolate(frame, [8 + ci * 5, 20 + ci * 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const colY = interpolate(frame, [8 + ci * 5, 20 + ci * 5], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

            return (
              <div
                key={ci}
                style={{
                  flex: 1,
                  opacity: colOpacity,
                  transform: `translateY(${colY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* Column header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: col.color,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: col.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {col.title}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 11,
                      color: TEXT_MUTED,
                      backgroundColor: "rgba(248,250,252,0.06)",
                      borderRadius: 100,
                      padding: "2px 8px",
                    }}
                  >
                    {col.cards.length}
                  </span>
                </div>

                {/* Cards */}
                {col.cards.map((card, ki) => {
                  const cardOpacity = interpolate(
                    frame,
                    [14 + ci * 5 + ki * 4, 26 + ci * 5 + ki * 4],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                  return (
                    <div
                      key={ki}
                      style={{
                        backgroundColor: CARD,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                        opacity: cardOpacity,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "system-ui, sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: TEXT,
                          marginBottom: 8,
                          lineHeight: 1.3,
                        }}
                      >
                        {card.title}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: 10,
                            fontWeight: 600,
                            color: ACCENT,
                            backgroundColor: `${ACCENT}18`,
                            padding: "2px 7px",
                            borderRadius: 4,
                          }}
                        >
                          {card.tag}
                        </span>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: prioColor(card.prio),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <PanelLabel label="04 / Kanban Board" frame={frame} />
    </div>
  );
};

// ── Panel 5: Notification Panel ────────────────────────────────────────────────
const NOTIFS = [
  {
    icon: "⚡",
    title: "Build deployed",
    body: "v2.14.1 is live on production",
    time: "Just now",
    accent: SUCCESS,
    read: false,
  },
  {
    icon: "💬",
    title: "New comment",
    body: "Sarah Chen left a comment on API docs",
    time: "2 min ago",
    accent: BRAND,
    read: false,
  },
  {
    icon: "💳",
    title: "Payment received",
    body: "Veritas Inc upgraded to Enterprise",
    time: "18 min ago",
    accent: ACCENT,
    read: false,
  },
  {
    icon: "⚠️",
    title: "High error rate",
    body: "API endpoint /auth/token — 12% failure",
    time: "34 min ago",
    accent: WARNING,
    read: true,
  },
  {
    icon: "🎉",
    title: "Milestone reached",
    body: "You hit 1,000 active workspaces",
    time: "1 h ago",
    accent: BRAND_2,
    read: true,
  },
];

const NotificationPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { translateX, opacity } = panelTransform(frame, fps, 48);

  const headerOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight/ping animation on first item
  const pingOpacity = interpolate(
    Math.sin(((frame - 20) / fps) * Math.PI * 4),
    [-1, 1],
    [0, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${translateX}px)`,
        opacity,
        backgroundColor: BG,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${SUCCESS}, ${BRAND})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "44px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ opacity: headerOpacity, display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: TEXT,
              }}
            >
              Notifications
            </div>
          </div>
          <div
            style={{
              backgroundColor: DANGER,
              color: TEXT,
              fontFamily: "system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 100,
              padding: "3px 10px",
            }}
          >
            3 new
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: "system-ui, sans-serif",
              fontSize: 13,
              color: BRAND,
              fontWeight: 600,
            }}
          >
            Mark all read
          </div>
        </div>

        {/* Notification items */}
        <div
          style={{
            backgroundColor: SURFACE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            overflow: "hidden",
          }}
        >
          {NOTIFS.map((notif, i) => {
            const itemOpacity = interpolate(frame, [8 + i * 5, 20 + i * 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemX = interpolate(frame, [8 + i * 5, 20 + i * 5], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < NOTIFS.length - 1 ? `1px solid ${BORDER}` : "none",
                  backgroundColor: notif.read ? "transparent" : `${notif.accent}08`,
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                  position: "relative",
                }}
              >
                {/* Unread indicator */}
                {!notif.read && (
                  <div
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: notif.accent,
                      opacity: i === 0 ? 0.6 + pingOpacity : 1,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: `${notif.accent}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {notif.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: notif.read ? 500 : 700,
                      color: notif.read ? TEXT_MUTED : TEXT,
                      marginBottom: 3,
                    }}
                  >
                    {notif.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 13,
                      color: TEXT_MUTED,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {notif.body}
                  </div>
                </div>

                {/* Timestamp */}
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 11,
                    color: TEXT_MUTED,
                    flexShrink: 0,
                    paddingTop: 2,
                  }}
                >
                  {notif.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <PanelLabel label="05 / Notifications" frame={frame} />
    </div>
  );
};

// ── Panel 6: Settings Form ─────────────────────────────────────────────────────
const SettingsFormPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { translateX, opacity } = panelTransform(frame, fps, 48);

  const headerOpacity = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const toggleProgress = interpolate(frame, [20, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${translateX}px)`,
        opacity,
        backgroundColor: BG,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${BRAND}, ${BRAND_2})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "44px 60px",
          display: "flex",
          gap: 28,
        }}
      >
        {/* Sidebar nav */}
        <div style={{ width: 180, flexShrink: 0 }}>
          {["General", "Security", "Notifications", "Billing", "API Keys", "Team"].map(
            (item, i) => {
              const itemOpacity = interpolate(frame, [4 + i * 3, 14 + i * 3], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 8,
                    backgroundColor: i === 0 ? `${BRAND}18` : "transparent",
                    border: i === 0 ? `1px solid ${BRAND}40` : "1px solid transparent",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: i === 0 ? 700 : 500,
                    color: i === 0 ? BRAND : TEXT_MUTED,
                    marginBottom: 2,
                    opacity: itemOpacity,
                  }}
                >
                  {item}
                </div>
              );
            }
          )}
        </div>

        {/* Main form area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <div style={{ opacity: headerOpacity }}>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: TEXT,
              }}
            >
              General Settings
            </div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                color: TEXT_MUTED,
                marginTop: 4,
              }}
            >
              Manage your workspace preferences
            </div>
          </div>

          {/* Form card */}
          <div
            style={{
              backgroundColor: SURFACE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Workspace name field */}
            <div
              style={{
                opacity: interpolate(frame, [12, 22], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Workspace name
              </div>
              <div
                style={{
                  backgroundColor: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 14,
                  color: TEXT,
                }}
              >
                Flowbase — Main Workspace
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${BORDER}` }} />

            {/* Toggle rows */}
            {[
              { label: "Two-factor authentication", sub: "Require 2FA for all members", on: true },
              { label: "Activity digest emails", sub: "Daily summary of workspace activity", on: false },
              { label: "Public API access", sub: "Allow third-party integrations", on: true },
            ].map((row, i) => {
              const rowOpacity = interpolate(frame, [18 + i * 5, 28 + i * 5], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const thumbX = row.on
                ? interpolate(toggleProgress, [0, 1], [0, 18])
                : 0;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: rowOpacity,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: TEXT,
                      }}
                    >
                      {row.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 12,
                        color: TEXT_MUTED,
                        marginTop: 2,
                      }}
                    >
                      {row.sub}
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <div
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 100,
                      backgroundColor: row.on ? BRAND : "rgba(248,250,252,0.1)",
                      border: `1px solid ${row.on ? BRAND : BORDER}`,
                      position: "relative",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: row.on ? undefined : 3,
                        right: row.on ? 3 : undefined,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: TEXT,
                        transform: `translateX(${row.on ? thumbX - 18 : 0}px)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <div
            style={{
              opacity: interpolate(frame, [38, 46], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
                borderRadius: 8,
                padding: "10px 28px",
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: TEXT,
                boxShadow: `0 4px 16px ${BRAND}40`,
              }}
            >
              Save changes
            </div>
          </div>
        </div>
      </div>

      <PanelLabel label="06 / Settings" frame={frame} />
    </div>
  );
};

// ── Filmstrip ──────────────────────────────────────────────────────────────────
const FILMSTRIP_LABELS = [
  "Modal",
  "Table",
  "Chart",
  "Kanban",
  "Alerts",
  "Settings",
];

const FILMSTRIP_COLORS = [BRAND, ACCENT, BRAND_2, SUCCESS, WARNING, BRAND];

// Active panel index based on global frame
const activePanel = (globalFrame: number): number => {
  // Each panel occupies 50 frames, panels stagger by 50
  return Math.min(5, Math.floor(globalFrame / 50));
};

const Filmstrip: React.FC<{ frame: number }> = ({ frame }) => {
  const active = activePanel(frame);

  const stripOpacity = interpolate(frame, [4, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        opacity: stripOpacity,
        zIndex: 50,
      }}
    >
      {FILMSTRIP_LABELS.map((label, i) => {
        const isActive = i === active;
        const scaleSpring = spring({
          frame: Math.max(0, frame - i * 50),
          fps: FPS,
          config: { damping: 14, stiffness: 200 },
        });
        const thumbScale = interpolate(scaleSpring, [0, 1], [0.6, 1]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              transform: `scale(${thumbScale})`,
              transformOrigin: "bottom center",
            }}
          >
            {/* Thumbnail box */}
            <div
              style={{
                width: 120,
                height: 68,
                borderRadius: 6,
                backgroundColor: isActive ? `${FILMSTRIP_COLORS[i]}20` : CARD,
                border: isActive
                  ? `2px solid ${FILMSTRIP_COLORS[i]}`
                  : `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                transition: "border 0.1s",
                boxShadow: isActive ? `0 0 12px ${FILMSTRIP_COLORS[i]}40` : "none",
              }}
            >
              {/* Mini content inside thumbnail */}
              {[0, 1, 2, 3].map((line) => (
                <div
                  key={line}
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 10 + line * 12,
                    height: 4,
                    width: `${50 + seededRand(i * 10 + line) * 35}%`,
                    borderRadius: 2,
                    backgroundColor: isActive
                      ? `${FILMSTRIP_COLORS[i]}50`
                      : "rgba(248,250,252,0.07)",
                  }}
                />
              ))}
              {/* Number badge */}
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  right: 6,
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  color: isActive ? FILMSTRIP_COLORS[i] : TEXT_MUTED,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>

            {/* Label */}
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? FILMSTRIP_COLORS[i] : TEXT_MUTED,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Panel Label ───────────────────────────────────────────────────────────────
const PanelLabel: React.FC<{ label: string; frame: number }> = ({ label, frame }) => {
  const labelOpacity = interpolate(frame, [8, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 60,
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: labelOpacity,
      }}
    >
      <div
        style={{
          width: 3,
          height: 20,
          borderRadius: 2,
          background: `linear-gradient(to bottom, ${BRAND}, ${BRAND_2})`,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: TEXT_MUTED,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── Panel Wrappers (isolated frame via Sequence) ───────────────────────────────
const PanelWrapper: React.FC<{
  PanelComponent: React.FC<{ frame: number; fps: number }>;
  fps: number;
}> = ({ PanelComponent, fps }) => {
  const frame = useCurrentFrame();
  return <PanelComponent frame={frame} fps={fps} />;
};

// ── Main Composition ──────────────────────────────────────────────────────────
export const UIShowcaseReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out last 15 frames
  const globalOpacity = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Intro logo flash
  const introOpacity = interpolate(frame, [0, 8, 14, 20], [1, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: globalOpacity, overflow: "hidden" }}>
      {/* ── Panel Sequences ── */}
      <Sequence from={PANELS[0].from} durationInFrames={PANELS[0].duration}>
        <PanelWrapper PanelComponent={ModalDialogPanel} fps={fps} />
      </Sequence>
      <Sequence from={PANELS[1].from} durationInFrames={PANELS[1].duration}>
        <PanelWrapper PanelComponent={DataTablePanel} fps={fps} />
      </Sequence>
      <Sequence from={PANELS[2].from} durationInFrames={PANELS[2].duration}>
        <PanelWrapper PanelComponent={BarChartPanel} fps={fps} />
      </Sequence>
      <Sequence from={PANELS[3].from} durationInFrames={PANELS[3].duration}>
        <PanelWrapper PanelComponent={KanbanPanel} fps={fps} />
      </Sequence>
      <Sequence from={PANELS[4].from} durationInFrames={PANELS[4].duration}>
        <PanelWrapper PanelComponent={NotificationPanel} fps={fps} />
      </Sequence>
      <Sequence from={PANELS[5].from} durationInFrames={PANELS[5].duration}>
        <PanelWrapper PanelComponent={SettingsFormPanel} fps={fps} />
      </Sequence>

      {/* ── Filmstrip (always visible) ── */}
      <Filmstrip frame={frame} />

      {/* ── Intro flash ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: introOpacity,
          pointerEvents: "none",
          zIndex: 100,
          background: BG,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: `0 0 30px ${BRAND}60`,
            }}
          >
            ✦
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: TEXT,
              letterSpacing: -0.5,
            }}
          >
            Flowbase
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: TEXT_MUTED,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            UI Component Library
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="UIShowcaseReel"
    component={UIShowcaseReel}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
