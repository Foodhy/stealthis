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
const BRAND = "#6366f1";
const BRAND_2 = "#8b5cf6";
const ACCENT = "#06b6d4";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";

// ── Integration data ──────────────────────────────────────────────────
interface Integration {
  id: string;
  name: string;
  bg: string;
  color: string;
  symbol: string;
  angle: number; // degrees, 0 = right
}

const INTEGRATIONS: Integration[] = [
  { id: "slack",      name: "Slack",      bg: "#4A154B", color: "#E01E5A", symbol: "S",  angle: 0   },
  { id: "github",     name: "GitHub",     bg: "#161B22", color: "#f0f6ff", symbol: "GH", angle: 45  },
  { id: "salesforce", name: "Salesforce", bg: "#0070D2", color: "#ffffff", symbol: "SF", angle: 90  },
  { id: "stripe",     name: "Stripe",     bg: "#0A2540", color: "#635BFF", symbol: "St", angle: 135 },
  { id: "notion",     name: "Notion",     bg: "#ffffff", color: "#000000", symbol: "N",  angle: 180 },
  { id: "jira",       name: "Jira",       bg: "#0052CC", color: "#ffffff", symbol: "Ji", angle: 225 },
  { id: "figma",      name: "Figma",      bg: "#1E1E1E", color: "#F24E1E", symbol: "Fi", angle: 270 },
  { id: "zapier",     name: "Zapier",     bg: "#FF4A00", color: "#ffffff", symbol: "Za", angle: 315 },
];

// Orbit radius (pixels from center)
const ORBIT_RADIUS = 260;
// Center of the scene
const CX = 640;
const CY = 360;

// Each integration enters in sequence, 18 frames apart, starting at frame 30
const INTEGRATION_START = 30;
const INTEGRATION_STAGGER = 18;

// Connection lines start drawing after all integrations land (~30 + 8*18 + 20 = 194)
const LINES_START = 194;
const LINES_DURATION = 40;

// Counter + CTA start at frame 230
const COUNTER_START = 230;
const CTA_START = 258;

// Total duration
const DURATION = 300;

// ── Helpers ───────────────────────────────────────────────────────────
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function orbitPos(angle: number): { x: number; y: number } {
  const rad = degToRad(angle - 90); // -90 so 0 degrees = top
  return {
    x: CX + ORBIT_RADIUS * Math.cos(rad),
    y: CY + ORBIT_RADIUS * Math.sin(rad),
  };
}

// ── Background grid + glow ────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = interpolate(
    Math.sin((frame / 200) * Math.PI * 2),
    [-1, 1],
    [0.7, 1.0]
  );

  return (
    <>
      {/* Dark base */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: BG }} />

      {/* Subtle dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Center brand glow */}
      <div
        style={{
          position: "absolute",
          left: CX - 300,
          top: CY - 300,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)`,
          filter: "blur(30px)",
          opacity: pulse,
          pointerEvents: "none",
        }}
      />

      {/* Outer ambient glow (cyan) */}
      <div
        style={{
          position: "absolute",
          left: CX - 400,
          top: CY - 400,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 60%)`,
          filter: "blur(60px)",
          opacity: pulse * 0.8,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Orbit ring (faint dashed circle) ─────────────────────────────────
const OrbitRing: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [10, 40], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: CX - ORBIT_RADIUS,
        top: CY - ORBIT_RADIUS,
        width: ORBIT_RADIUS * 2,
        height: ORBIT_RADIUS * 2,
        borderRadius: "50%",
        border: `1px dashed rgba(255,255,255,${opacity})`,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Product logo (center) ─────────────────────────────────────────────
const ProductLogo: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const enterProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
  });

  const scale = interpolate(enterProgress, [0, 1], [0.4, 1]);
  const opacity = interpolate(enterProgress, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse ring
  const ringScale = interpolate(
    Math.sin((frame / 60) * Math.PI * 2),
    [-1, 1],
    [1.0, 1.1]
  );
  const ringOpacity = interpolate(
    Math.sin((frame / 60) * Math.PI * 2),
    [-1, 1],
    [0.25, 0.55]
  );

  const LOGO_SIZE = 100;

  return (
    <div
      style={{
        position: "absolute",
        left: CX - LOGO_SIZE / 2,
        top: CY - LOGO_SIZE / 2,
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pulsing glow ring */}
      <div
        style={{
          position: "absolute",
          width: LOGO_SIZE * ringScale,
          height: LOGO_SIZE * ringScale,
          borderRadius: "50%",
          border: `2px solid ${BRAND}`,
          opacity: ringOpacity,
          pointerEvents: "none",
          boxShadow: `0 0 24px 8px rgba(99,102,241,0.3)`,
        }}
      />

      {/* Second ring, offset phase */}
      <div
        style={{
          position: "absolute",
          width: LOGO_SIZE * 1.45,
          height: LOGO_SIZE * 1.45,
          borderRadius: "50%",
          border: `1px solid rgba(139,92,246,0.3)`,
          opacity: interpolate(
            Math.sin((frame / 60 + 0.5) * Math.PI * 2),
            [-1, 1],
            [0.1, 0.35]
          ),
          pointerEvents: "none",
        }}
      />

      {/* Logo card */}
      <div
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          borderRadius: 24,
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          boxShadow: `0 0 40px rgba(99,102,241,0.5), 0 8px 32px rgba(0,0,0,0.6)`,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: "#ffffff",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          FW
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 9,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: 3,
          }}
        >
          Flowbase
        </span>
      </div>
    </div>
  );
};

// ── Connection line (product → integration) ───────────────────────────
const ConnectionLine: React.FC<{
  angle: number;
  frame: number;
  startFrame: number;
}> = ({ angle, frame, startFrame }) => {
  const localFrame = frame - startFrame;
  const progress = interpolate(
    localFrame,
    [0, LINES_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  if (progress <= 0) return null;

  const rad = degToRad(angle - 90);
  const LOGO_HALF = 50; // half of product logo size
  const INT_HALF = 30;  // approx half of integration card

  const x1 = CX + LOGO_HALF * Math.cos(rad);
  const y1 = CY + LOGO_HALF * Math.sin(rad);
  const x2 = CX + (ORBIT_RADIUS - INT_HALF) * Math.cos(rad);
  const y2 = CY + (ORBIT_RADIUS - INT_HALF) * Math.sin(rad);

  const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  const currentLength = lineLength * progress;

  return (
    <div
      style={{
        position: "absolute",
        left: x1,
        top: y1 - 1,
        width: currentLength,
        height: 1.5,
        background: `linear-gradient(90deg, rgba(99,102,241,0.6), rgba(6,182,212,0.4))`,
        transformOrigin: "0 50%",
        transform: `rotate(${angleDeg}deg)`,
        pointerEvents: "none",
        boxShadow: `0 0 6px rgba(99,102,241,0.4)`,
      }}
    />
  );
};

// ── Integration card ──────────────────────────────────────────────────
const IntegrationCard: React.FC<{
  integration: Integration;
  index: number;
  frame: number;
  fps: number;
}> = ({ integration, index, frame, fps }) => {
  const startFrame = INTEGRATION_START + index * INTEGRATION_STAGGER;
  const localFrame = Math.max(0, frame - startFrame);

  const enterProgress = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 130, mass: 0.75 },
  });

  const target = orbitPos(integration.angle);
  const rad = degToRad(integration.angle - 90);

  // Fly in from far off-screen in the card's direction
  const FLY_DISTANCE = 500;
  const startX = CX + (ORBIT_RADIUS + FLY_DISTANCE) * Math.cos(rad);
  const startY = CY + (ORBIT_RADIUS + FLY_DISTANCE) * Math.sin(rad);

  const cx = interpolate(enterProgress, [0, 1], [startX, target.x]);
  const cy = interpolate(enterProgress, [0, 1], [startY, target.y]);
  const opacity = interpolate(enterProgress, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(enterProgress, [0, 1], [0.6, 1]);

  const CARD_SIZE = 62;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - CARD_SIZE / 2,
        top: cy - CARD_SIZE / 2,
        width: CARD_SIZE,
        height: CARD_SIZE,
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 14,
        backgroundColor: integration.bg,
        border: `1.5px solid rgba(255,255,255,0.1)`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${integration.color}40`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      {/* Symbol */}
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: integration.symbol.length > 1 ? 14 : 20,
          color: integration.color,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {integration.symbol}
      </span>
      {/* Name */}
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 8,
          color:
            integration.bg === "#ffffff"
              ? "rgba(0,0,0,0.5)"
              : "rgba(255,255,255,0.55)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {integration.name}
      </span>
    </div>
  );
};

// ── Counter + CTA ─────────────────────────────────────────────────────
const CounterAndCta: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localCounter = Math.max(0, frame - COUNTER_START);
  const counterProgress = spring({
    frame: localCounter,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 70, mass: 1.2 },
  });

  const count = Math.floor(interpolate(counterProgress, [0, 1], [0, 500]));

  const counterOpacity = interpolate(
    frame,
    [COUNTER_START, COUNTER_START + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
  );
  const counterY = interpolate(
    frame,
    [COUNTER_START, COUNTER_START + 25],
    [18, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const ctaOpacity = interpolate(frame, [CTA_START, CTA_START + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const ctaY = interpolate(frame, [CTA_START, CTA_START + 22], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 44,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Counter */}
      <div
        style={{
          opacity: counterOpacity,
          transform: `translateY(${counterY}px)`,
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 52,
            color: TEXT,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {count}+
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 20,
            color: TEXT_MUTED,
            letterSpacing: "0.02em",
          }}
        >
          integrations
        </span>
      </div>

      {/* CTA pill */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          backgroundColor: BRAND,
          borderRadius: 50,
          padding: "10px 28px",
          boxShadow: `0 4px 20px rgba(99,102,241,0.45)`,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "#ffffff",
            letterSpacing: "0.01em",
          }}
        >
          Explore integrations →
        </span>
      </div>
    </div>
  );
};

// ── Header label (top-center) ─────────────────────────────────────────
const HeaderLabel: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const y = interpolate(frame, [0, 28], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 46,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          backgroundColor: "rgba(99,102,241,0.15)",
          borderRadius: 50,
          padding: "4px 14px",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: BRAND,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Ecosystem
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: TEXT,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Connect your entire stack
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const IntegrationShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out last 15 frames
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
        opacity: globalOpacity,
      }}
    >
      <Background frame={frame} />

      {/* Orbit ring */}
      <OrbitRing frame={frame} />

      {/* Connection lines — appear after all cards land */}
      {INTEGRATIONS.map((intg, i) => (
        <ConnectionLine
          key={`line-${intg.id}`}
          angle={intg.angle}
          frame={frame}
          startFrame={LINES_START + i * 4}
        />
      ))}

      {/* Integration cards */}
      {INTEGRATIONS.map((intg, i) => (
        <IntegrationCard
          key={intg.id}
          integration={intg}
          index={i}
          frame={frame}
          fps={fps}
        />
      ))}

      {/* Product logo (renders on top) */}
      <ProductLogo frame={frame} fps={fps} />

      {/* Header */}
      <HeaderLabel frame={frame} />

      {/* Counter + CTA */}
      <Sequence from={COUNTER_START}>
        <CounterAndCta frame={frame} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Remotion root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="IntegrationShowcase"
    component={IntegrationShowcase}
    durationInFrames={300}
    fps={30}
    width={1280}
    height={720}
  />
);
