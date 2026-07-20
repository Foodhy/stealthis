import React from "react";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = "#0a0a12";
const INDIGO = "#6366f1";
const INDIGO_LIGHT = "#818cf8";
const INDIGO_DIM = "#312e81";
const GREEN = "#22c55e";
const GREEN_DIM = "#14532d";
const SURFACE = "#13131f";
const SURFACE2 = "#1a1a2e";
const BORDER = "rgba(99,102,241,0.18)";
const TEXT = "#f1f5f9";
const TEXT_MUTED = "#94a3b8";
const TEXT_DIM = "#475569";
const FONT = "system-ui, -apple-system, sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useFadeIn(startFrame: number, duration = 12): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function useSlideUp(
  startFrame: number,
  distance = 24,
  mass = 0.5
): { opacity: number; translateY: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame, fps, config: { mass, stiffness: 120, damping: 18 } });
  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity, translateY: (1 - s) * distance };
}

// ─── Sub-component: GridOverlay ───────────────────────────────────────────────
function GridOverlay() {
  const lines: React.ReactNode[] = [];
  const cols = 12;
  const rows = 8;
  for (let i = 0; i <= cols; i++) {
    lines.push(
      <line
        key={`v${i}`}
        x1={`${(i / cols) * 100}%`}
        y1="0%"
        x2={`${(i / cols) * 100}%`}
        y2="100%"
        stroke="rgba(99,102,241,0.06)"
        strokeWidth="1"
      />
    );
  }
  for (let j = 0; j <= rows; j++) {
    lines.push(
      <line
        key={`h${j}`}
        x1="0%"
        y1={`${(j / rows) * 100}%`}
        x2="100%"
        y2={`${(j / rows) * 100}%`}
        stroke="rgba(99,102,241,0.06)"
        strokeWidth="1"
      />
    );
  }
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      {lines}
    </svg>
  );
}

// ─── Sub-component: RadialGlow ────────────────────────────────────────────────
function RadialGlow({ color = INDIGO, cx = "50%", cy = "50%", r = "55%" }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse ${r} ${r} at ${cx} ${cy}, ${color}14 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Sub-component: StageIndicator ───────────────────────────────────────────
interface StageIndicatorProps {
  currentStage: number; // 1-indexed, 1–4
  opacity: number;
}

const STAGE_LABELS = ["Review Cart", "Shipping Info", "Payment", "Confirmation"];

function StageIndicator({ currentStage, opacity }: StageIndicatorProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 0,
        opacity,
      }}
    >
      {STAGE_LABELS.map((label, i) => {
        const stageNum = i + 1;
        const isDone = stageNum < currentStage;
        const isActive = stageNum === currentStage;
        const isPending = stageNum > currentStage;

        return (
          <React.Fragment key={label}>
            {/* Connector line */}
            {i > 0 && (
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: isDone || isActive ? INDIGO : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }}
              />
            )}
            {/* Pill */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 700,
                  background: isDone
                    ? INDIGO
                    : isActive
                    ? INDIGO
                    : "rgba(255,255,255,0.07)",
                  border: `2px solid ${isDone || isActive ? INDIGO_LIGHT : "rgba(255,255,255,0.12)"}`,
                  color: isDone || isActive ? "#fff" : TEXT_DIM,
                  boxShadow: isActive ? `0 0 18px ${INDIGO}88` : "none",
                }}
              >
                {isDone ? "✓" : stageNum}
              </div>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? INDIGO_LIGHT : isPending ? TEXT_DIM : TEXT_MUTED,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Sub-component: Callout ───────────────────────────────────────────────────
interface CalloutProps {
  label: string;
  x: number;
  y: number;
  arrowDir?: "left" | "right" | "up";
  opacity: number;
  pulse?: boolean;
}

function Callout({ label, x, y, arrowDir = "left", opacity, pulse = false }: CalloutProps) {
  const frame = useCurrentFrame();
  const pulseScale = pulse
    ? 1 + 0.04 * Math.sin((frame / 30) * Math.PI * 2)
    : 1;

  const arrowStyle: React.CSSProperties =
    arrowDir === "left"
      ? { left: -10, top: "50%", transform: "translateY(-50%)", borderRight: "10px solid rgba(99,102,241,0.9)", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }
      : arrowDir === "right"
      ? { right: -10, top: "50%", transform: "translateY(-50%)", borderLeft: "10px solid rgba(99,102,241,0.9)", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }
      : { top: -10, left: "50%", transform: "translateX(-50%)", borderBottom: "10px solid rgba(99,102,241,0.9)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent" };

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `scale(${pulseScale})`,
        transformOrigin: "center",
        zIndex: 30,
      }}
    >
      <div
        style={{
          position: "relative",
          background: "rgba(99,102,241,0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(129,140,248,0.6)",
          borderRadius: 8,
          padding: "8px 14px",
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          whiteSpace: "nowrap",
          boxShadow: `0 4px 24px ${INDIGO}55`,
        }}
      >
        <div style={{ position: "absolute", width: 0, height: 0, ...arrowStyle }} />
        {label}
      </div>
    </div>
  );
}

// ─── Sub-component: PulsingRing ───────────────────────────────────────────────
interface PulsingRingProps {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

function PulsingRing({ x, y, width, height, opacity }: PulsingRingProps) {
  const frame = useCurrentFrame();
  const scale = 1 + 0.06 * Math.abs(Math.sin((frame / 20) * Math.PI));
  const ringOpacity = 0.7 + 0.3 * Math.abs(Math.sin((frame / 20) * Math.PI));

  return (
    <div
      style={{
        position: "absolute",
        left: x - 6,
        top: y - 6,
        width: width + 12,
        height: height + 12,
        borderRadius: 12,
        border: `2px solid ${INDIGO_LIGHT}`,
        opacity: opacity * ringOpacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        boxShadow: `0 0 20px ${INDIGO}88`,
        zIndex: 20,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Stage 1: Review Cart ────────────────────────────────────────────────────
function StageReviewCart() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelSpring = spring({ frame, fps, config: { mass: 0.6, stiffness: 100, damping: 16 } });
  const panelY = (1 - panelSpring) * 40;
  const panelOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const row1 = useSlideUp(8, 20);
  const row2 = useSlideUp(16, 20);
  const total = useSlideUp(24, 20);
  const btn = useSlideUp(32, 20);
  const callout = useFadeIn(38);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, calc(-50% + ${panelY}px))`,
        opacity: panelOpacity,
        width: 520,
      }}
    >
      {/* Panel */}
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: INDIGO }} />
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "0.06em" }}>
            YOUR CART
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: FONT,
              fontSize: 12,
              color: TEXT_MUTED,
              background: SURFACE2,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: "3px 10px",
            }}
          >
            2 items
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />

        {/* Cart row 1 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
            opacity: row1.opacity,
            transform: `translateY(${row1.translateY}px)`,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${INDIGO_DIM}, ${SURFACE2})`,
              border: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🎧
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
              Studio Headphones Pro
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED }}>Midnight Black · Qty 1</div>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT }}>$249.00</div>
        </div>

        {/* Cart row 2 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
            opacity: row2.opacity,
            transform: `translateY(${row2.translateY}px)`,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: `linear-gradient(135deg, #1e3a5f, ${SURFACE2})`,
              border: `1px solid rgba(99,102,241,0.12)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            💻
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
              USB-C Hub 8-in-1
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: TEXT_MUTED }}>Space Grey · Qty 1</div>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT }}>$79.00</div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            opacity: total.opacity,
            transform: `translateY(${total.translateY}px)`,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>Order total</span>
          <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: TEXT }}>$328.00</span>
        </div>

        {/* Button */}
        <div
          style={{
            position: "relative",
            opacity: btn.opacity,
            transform: `translateY(${btn.translateY}px)`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${INDIGO}, #7c3aed)`,
              borderRadius: 10,
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 8px 32px ${INDIGO}44`,
            }}
          >
            Checkout →
          </div>

          {/* Pulsing ring on button */}
          <PulsingRing x={0} y={0} width={520 - 56} height={50} opacity={callout} />
        </div>
      </div>

      {/* Callout */}
      <Callout
        label="Click to proceed"
        x={-140}
        y={355}
        arrowDir="right"
        opacity={callout}
        pulse
      />
    </div>
  );
}

// ─── Stage 2: Shipping Info ───────────────────────────────────────────────────
function StageShippingInfo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelSpring = spring({ frame, fps, config: { mass: 0.6, stiffness: 100, damping: 16 } });
  const panelY = (1 - panelSpring) * 40;
  const panelOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const field1 = useSlideUp(6, 18);
  const field2 = useSlideUp(14, 18);
  const field3 = useSlideUp(22, 18);
  const row = useSlideUp(30, 18);
  const callout = useFadeIn(36);

  const fieldStyle = (active = false): React.CSSProperties => ({
    background: active ? `rgba(99,102,241,0.08)` : SURFACE2,
    border: `1.5px solid ${active ? INDIGO : "rgba(255,255,255,0.08)"}`,
    borderRadius: 8,
    padding: "12px 14px",
    fontFamily: FONT,
    fontSize: 14,
    color: active ? TEXT : TEXT_MUTED,
    boxShadow: active ? `0 0 0 3px ${INDIGO}22` : "none",
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 600,
    color: TEXT_DIM,
    letterSpacing: "0.08em",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, calc(-50% + ${panelY}px))`,
        opacity: panelOpacity,
        width: 520,
      }}
    >
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: INDIGO }} />
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "0.06em" }}>
            SHIPPING INFORMATION
          </span>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

        {/* Full name */}
        <div style={{ marginBottom: 16, opacity: field1.opacity, transform: `translateY(${field1.translateY}px)` }}>
          <div style={labelStyle}>FULL NAME</div>
          <div style={fieldStyle(false)}>Alex Morgan</div>
        </div>

        {/* Address — highlighted */}
        <div style={{ position: "relative", marginBottom: 16, opacity: field2.opacity, transform: `translateY(${field2.translateY}px)` }}>
          <div style={labelStyle}>STREET ADDRESS</div>
          <div style={fieldStyle(true)}>
            <span style={{ color: TEXT_MUTED }}>e.g. 742 Evergreen Terrace…</span>
          </div>
          <PulsingRing x={0} y={24} width={520 - 56} height={46} opacity={callout} />
        </div>

        {/* City / Zip */}
        <div
          style={{
            display: "flex",
            gap: 12,
            opacity: field3.opacity,
            transform: `translateY(${field3.translateY}px)`,
          }}
        >
          <div style={{ flex: 2 }}>
            <div style={labelStyle}>CITY</div>
            <div style={fieldStyle(false)}>Springfield</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>ZIP CODE</div>
            <div style={fieldStyle(false)}>62704</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            opacity: row.opacity,
            transform: `translateY(${row.translateY}px)`,
          }}
        >
          <div
            style={{
              flex: 1,
              background: SURFACE2,
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "13px 20px",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 500,
              color: TEXT_MUTED,
              textAlign: "center",
            }}
          >
            ← Back
          </div>
          <div
            style={{
              flex: 2,
              background: `linear-gradient(135deg, ${INDIGO}, #7c3aed)`,
              borderRadius: 10,
              padding: "13px 20px",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              textAlign: "center",
              boxShadow: `0 6px 24px ${INDIGO}44`,
            }}
          >
            Continue to Payment →
          </div>
        </div>
      </div>

      {/* Callout */}
      <Callout
        label="Fill in address"
        x={-130}
        y={195}
        arrowDir="right"
        opacity={callout}
        pulse
      />
    </div>
  );
}

// ─── Stage 3: Payment ─────────────────────────────────────────────────────────
function StagePayment() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelSpring = spring({ frame, fps, config: { mass: 0.6, stiffness: 100, damping: 16 } });
  const panelY = (1 - panelSpring) * 40;
  const panelOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const cardField = useSlideUp(6, 18);
  const row1 = useSlideUp(14, 18);
  const row2 = useSlideUp(22, 18);
  const btns = useSlideUp(30, 18);
  const callout = useFadeIn(36);

  const labelStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 600,
    color: TEXT_DIM,
    letterSpacing: "0.08em",
    marginBottom: 6,
  };

  const fieldStyle = (active = false): React.CSSProperties => ({
    background: active ? `rgba(99,102,241,0.08)` : SURFACE2,
    border: `1.5px solid ${active ? INDIGO : "rgba(255,255,255,0.08)"}`,
    borderRadius: 8,
    padding: "12px 14px",
    fontFamily: FONT,
    fontSize: 14,
    color: active ? TEXT : TEXT_MUTED,
    boxShadow: active ? `0 0 0 3px ${INDIGO}22` : "none",
    letterSpacing: active ? "0.18em" : "normal",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, calc(-50% + ${panelY}px))`,
        opacity: panelOpacity,
        width: 520,
      }}
    >
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: INDIGO }} />
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "0.06em" }}>
            PAYMENT DETAILS
          </span>
          {/* Card brand icons (mock) */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["VISA", "MC", "AMEX"].map((b) => (
              <div
                key={b}
                style={{
                  background: SURFACE2,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  padding: "2px 6px",
                  fontFamily: FONT,
                  fontSize: 9,
                  fontWeight: 800,
                  color: TEXT_DIM,
                  letterSpacing: "0.05em",
                }}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

        {/* Card number — highlighted */}
        <div
          style={{
            position: "relative",
            marginBottom: 16,
            opacity: cardField.opacity,
            transform: `translateY(${cardField.translateY}px)`,
          }}
        >
          <div style={labelStyle}>CARD NUMBER</div>
          <div style={{ ...fieldStyle(true), display: "flex", alignItems: "center", gap: 8 }}>
            <span>•••• •••• •••• </span>
            <span style={{ color: INDIGO_LIGHT }}>4291</span>
            <span style={{ marginLeft: "auto", fontSize: 18 }}>💳</span>
          </div>
          <PulsingRing x={0} y={24} width={520 - 56} height={46} opacity={callout} />
        </div>

        {/* Expiry + CVV */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            opacity: row1.opacity,
            transform: `translateY(${row1.translateY}px)`,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>EXPIRY DATE</div>
            <div style={fieldStyle(false)}>08 / 27</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>CVV</div>
            <div style={fieldStyle(false)}>•••</div>
          </div>
        </div>

        {/* Cardholder */}
        <div
          style={{
            marginBottom: 20,
            opacity: row2.opacity,
            transform: `translateY(${row2.translateY}px)`,
          }}
        >
          <div style={labelStyle}>CARDHOLDER NAME</div>
          <div style={fieldStyle(false)}>ALEX MORGAN</div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            opacity: btns.opacity,
            transform: `translateY(${btns.translateY}px)`,
          }}
        >
          <div
            style={{
              flex: 1,
              background: SURFACE2,
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "13px 20px",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 500,
              color: TEXT_MUTED,
              textAlign: "center",
            }}
          >
            ← Back
          </div>
          <div
            style={{
              flex: 2,
              background: `linear-gradient(135deg, ${INDIGO}, #7c3aed)`,
              borderRadius: 10,
              padding: "13px 20px",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              textAlign: "center",
              boxShadow: `0 6px 24px ${INDIGO}44`,
            }}
          >
            Place Order →
          </div>
        </div>
      </div>

      {/* Callout */}
      <Callout
        label="Enter card details"
        x={-136}
        y={163}
        arrowDir="right"
        opacity={callout}
        pulse
      />
    </div>
  );
}

// ─── Stage 4: Confirmation ────────────────────────────────────────────────────
function StageConfirmation() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const checkSpring = spring({ frame: frame - 8, fps, config: { mass: 0.4, stiffness: 80, damping: 12 } });
  const panelOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const titleFade = useFadeIn(20);
  const orderFade = useFadeIn(30);
  const detailsFade = useFadeIn(40);
  const btnFade = useFadeIn(50);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        opacity: panelOpacity,
        width: 480,
        textAlign: "center",
      }}
    >
      {/* Checkmark circle */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${GREEN_DIM}, #166534)`,
          border: `3px solid ${GREEN}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 28px",
          transform: `scale(${checkSpring})`,
          boxShadow: `0 0 48px ${GREEN}55`,
        }}
      >
        <span style={{ fontSize: 44, lineHeight: 1 }}>✓</span>
      </div>

      {/* Title */}
      <div style={{ opacity: titleFade }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 32,
            fontWeight: 800,
            color: GREEN,
            marginBottom: 8,
            textShadow: `0 0 32px ${GREEN}66`,
          }}
        >
          Order Confirmed!
        </div>
      </div>

      {/* Order number */}
      <div style={{ opacity: orderFade }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: 600,
            color: TEXT,
            marginBottom: 24,
          }}
        >
          Order <span style={{ color: INDIGO_LIGHT }}>#48291</span> confirmed!
        </div>
      </div>

      {/* Details card */}
      <div style={{ opacity: detailsFade }}>
        <div
          style={{
            background: SURFACE,
            border: `1px solid rgba(34,197,94,0.2)`,
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 20,
            textAlign: "left",
          }}
        >
          {[
            { label: "Items", value: "Studio Headphones Pro, USB-C Hub" },
            { label: "Total charged", value: "$328.00" },
            { label: "Shipping to", value: "Alex Morgan, Springfield" },
            { label: "Estimated delivery", value: "3–5 business days" },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT_DIM }}>{label}</span>
              <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT_MUTED, maxWidth: 240, textAlign: "right" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ opacity: btnFade }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${GREEN_DIM}, #166534)`,
            border: `1.5px solid ${GREEN}`,
            borderRadius: 10,
            padding: "14px 32px",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            display: "inline-block",
            boxShadow: `0 6px 24px ${GREEN}33`,
          }}
        >
          View Order Details →
        </div>
      </div>
    </div>
  );
}

// ─── Main composition ─────────────────────────────────────────────────────────
function WalkthroughCheckout() {
  const frame = useCurrentFrame();

  // Derive current stage (1-indexed) from global frame
  const currentStage =
    frame < 60 ? 1 : frame < 120 ? 2 : frame < 180 ? 3 : 4;

  // Stage indicator fades in immediately
  const indicatorOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Grid + glow */}
      <GridOverlay />
      <RadialGlow color={INDIGO} cx="50%" cy="55%" r="60%" />

      {/* Stage indicator — persists across all stages */}
      <StageIndicator currentStage={currentStage} opacity={indicatorOpacity} />

      {/* Stage title strip */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 500,
          color: TEXT_DIM,
          letterSpacing: "0.08em",
        }}
      >
        CHECKOUT FLOW WALKTHROUGH · REMOTION
      </div>

      {/* Sequences */}
      <Sequence from={0} durationInFrames={60}>
        <StageReviewCart />
      </Sequence>

      <Sequence from={60} durationInFrames={60}>
        <StageShippingInfo />
      </Sequence>

      <Sequence from={120} durationInFrames={60}>
        <StagePayment />
      </Sequence>

      <Sequence from={180} durationInFrames={60}>
        <StageConfirmation />
      </Sequence>
    </AbsoluteFill>
  );
}

// ─── RemotionRoot ─────────────────────────────────────────────────────────────
export function RemotionRoot() {
  return (
    <Composition
      id="WalkthroughCheckout"
      component={WalkthroughCheckout}
      durationInFrames={240}
      fps={30}
      width={1280}
      height={720}
    />
  );
}

export { WalkthroughCheckout };
