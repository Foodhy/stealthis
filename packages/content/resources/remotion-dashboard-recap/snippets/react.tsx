import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Brand / theme ──────────────────────────────────────────────────────
const BG_COLOR = "#0a0a0f";
const COMPANY = "Novarift";
const MONTH = "November Recap";

// ── Hero metrics ───────────────────────────────────────────────────────
interface Metric {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  color: string;
}

const METRICS: Metric[] = [
  { label: "Revenue", value: 2_380_000, prefix: "$", suffix: "", color: "#6366f1" },
  { label: "Orders", value: 14_820, prefix: "", suffix: "", color: "#06b6d4" },
  { label: "New Users", value: 8_940, prefix: "", suffix: "", color: "#10b981" },
];

// ── Top products bar chart ─────────────────────────────────────────────
interface ProductDatum {
  name: string;
  revenue: number;
  color: string;
}

const PRODUCTS: ProductDatum[] = [
  { name: "Hyperion Pro Suite", revenue: 680_000, color: "#6366f1" },
  { name: "Astra Cloud Starter", revenue: 510_000, color: "#8b5cf6" },
  { name: "Vega Analytics Pack", revenue: 425_000, color: "#06b6d4" },
  { name: "Orbit Team License", revenue: 380_000, color: "#10b981" },
  { name: "Pulsar Dev Edition", revenue: 245_000, color: "#f59e0b" },
];

const MAX_PRODUCT_REVENUE = Math.max(...PRODUCTS.map((p) => p.revenue));

// ── Confetti squares ───────────────────────────────────────────────────
interface ConfettiPiece {
  x: number;        // % of width
  startY: number;   // % of height (start above)
  size: number;
  color: string;
  delay: number;    // frames
  speed: number;    // px per frame equivalent
  rotation: number; // initial rotation degrees
}

const CONFETTI_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#38bdf8", "#f97316"];

// Deterministic "random" using a seeded approach
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const CONFETTI: ConfettiPiece[] = Array.from({ length: 36 }, (_, i) => ({
  x: seededRand(i * 7) * 100,
  startY: -8 - seededRand(i * 13) * 15,
  size: 7 + seededRand(i * 3) * 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: Math.floor(seededRand(i * 17) * 25),
  speed: 0.28 + seededRand(i * 5) * 0.22,
  rotation: seededRand(i * 11) * 360,
}));

// ── Helpers ────────────────────────────────────────────────────────────
function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function sectionOpacity(frame: number, inStart: number, inEnd: number, outStart: number, outEnd: number): number {
  return interpolate(frame, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
}

// ── Section 1: Hero slide (frames 0-80) ───────────────────────────────
const HeroSection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = sectionOpacity(frame, 0, 18, 68, 80);

  // Title slide-down
  const titleY = interpolate(frame, [0, 22], [-28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle fade
  const subtitleOpacity = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Divider line width
  const lineWidth = interpolate(frame, [14, 38], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* BG glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 900,
          height: 500,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 50%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      {/* Company name */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          transform: `translateY(${titleY}px)`,
          opacity: subtitleOpacity,
          marginBottom: 12,
        }}
      >
        {COMPANY}
      </div>

      {/* Main title */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 72,
          color: "#ffffff",
          transform: `translateY(${titleY}px)`,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {MONTH}
      </div>

      {/* Divider */}
      <div
        style={{
          width: `${lineWidth}%`,
          height: 2,
          background: "linear-gradient(90deg, #6366f1, #06b6d4)",
          borderRadius: 2,
          marginTop: 24,
          marginBottom: 40,
          opacity: subtitleOpacity,
        }}
      />

      {/* Metric cards */}
      <div
        style={{
          display: "flex",
          gap: 32,
          opacity: subtitleOpacity,
        }}
      >
        {METRICS.map((m, i) => {
          const mDelay = 28 + i * 10;
          const mFrame = Math.max(0, frame - mDelay);

          const countProgress = spring({
            frame: mFrame,
            fps,
            from: 0,
            to: 1,
            config: { damping: 16, stiffness: 80, mass: 0.8 },
          });

          const displayVal = Math.round(countProgress * m.value);
          const formatted =
            m.label === "Revenue"
              ? formatMoney(displayVal)
              : formatNumber(displayVal);

          const cardOpacity = interpolate(mFrame, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const cardY = interpolate(mFrame, [0, 14], [16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });

          return (
            <div
              key={m.label}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 16,
                padding: "24px 36px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                minWidth: 200,
                boxShadow: `0 0 32px ${m.color}22`,
              }}
            >
              <div
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 700,
                  fontSize: 38,
                  color: m.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {formatted}
              </div>
              <div
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Section 2: Top Products bar chart (frames 80-180) ─────────────────
const ProductBar: React.FC<{
  datum: ProductDatum;
  index: number;
  frame: number;
  fps: number;
  maxWidth: number;
}> = ({ datum, index, frame, fps, maxWidth }) => {
  const STAGGER = 12;
  const delay = 10 + index * STAGGER;
  const f = Math.max(0, frame - delay);

  const widthRatio = spring({
    frame: f,
    fps,
    from: 0,
    to: datum.revenue / MAX_PRODUCT_REVENUE,
    config: { damping: 18, stiffness: 90, mass: 0.7 },
  });

  const barWidth = widthRatio * maxWidth;

  const countProgress = spring({
    frame: f,
    fps,
    from: 0,
    to: datum.revenue,
    config: { damping: 18, stiffness: 70, mass: 0.9 },
  });

  const labelOpacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowY = interpolate(f, [0, 16], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        opacity: labelOpacity,
        transform: `translateY(${rowY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: "100%",
      }}
    >
      {/* Product name */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          color: "rgba(255,255,255,0.75)",
          width: 230,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {datum.name}
      </div>

      {/* Bar track */}
      <div
        style={{
          flex: 1,
          height: 36,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Filled bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: barWidth,
            background: `linear-gradient(90deg, ${datum.color}cc, ${datum.color})`,
            borderRadius: 6,
            boxShadow: `0 0 18px ${datum.color}55`,
          }}
        />
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: datum.color,
          width: 90,
          flexShrink: 0,
        }}
      >
        {formatMoney(Math.round(countProgress))}
      </div>
    </div>
  );
};

const ProductsSection: React.FC<{ frame: number; fps: number; width: number }> = ({
  frame,
  fps,
  width,
}) => {
  const localFrame = frame - 80;
  const opacity = sectionOpacity(frame, 80, 96, 168, 180);

  const titleOpacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(localFrame, [0, 18], [-16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // maxWidth = chart track area
  const SIDE_PADDING = 100;
  const NAME_COL = 230 + 16;
  const VALUE_COL = 90 + 16;
  const maxWidth = width - SIDE_PADDING * 2 - NAME_COL - VALUE_COL;

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `0 ${SIDE_PADDING}px`,
        gap: 0,
      }}
    >
      {/* BG glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "40%",
          width: 700,
          height: 500,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Section title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 36,
          color: "#ffffff",
          alignSelf: "flex-start",
          marginBottom: 36,
          letterSpacing: "-0.01em",
        }}
      >
        Top Products by Revenue
      </div>

      {/* Bars */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
        }}
      >
        {PRODUCTS.map((p, i) => (
          <ProductBar
            key={p.name}
            datum={p}
            index={i}
            frame={localFrame}
            fps={fps}
            maxWidth={maxWidth}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Section 3: Closing hero stat + confetti (frames 180-270) ──────────
const ConfettiPieceEl: React.FC<{
  piece: ConfettiPiece;
  frame: number;
  height: number;
  width: number;
}> = ({ piece, frame, height, width }) => {
  const f = Math.max(0, frame - piece.delay);
  if (f <= 0) return null;

  const TRAVEL = height * 1.1;
  const travelFrames = Math.round(TRAVEL / (piece.speed * 30));

  const y = interpolate(f, [0, travelFrames], [piece.startY * (height / 100), height * 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });

  const rotation = interpolate(f, [0, travelFrames], [piece.rotation, piece.rotation + 280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(f, [0, 6, travelFrames - 8, travelFrames], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const xDrift = interpolate(f, [0, travelFrames], [0, (seededRand(piece.delay * 7) - 0.5) * 40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${piece.x}%`,
        top: 0,
        width: piece.size,
        height: piece.size,
        background: piece.color,
        borderRadius: piece.size > 12 ? 3 : 1,
        opacity,
        transform: `translate(${xDrift}px, ${y}px) rotate(${rotation}deg)`,
        boxShadow: `0 0 6px ${piece.color}88`,
      }}
    />
  );
};

const ClosingSection: React.FC<{ frame: number; fps: number; width: number; height: number }> = ({
  frame,
  fps,
  width,
  height,
}) => {
  const localFrame = frame - 180;
  const opacity = sectionOpacity(frame, 180, 196, 258, 270);

  // Hero stat count-up
  const TARGET = 2_400_000;
  const countProgress = spring({
    frame: Math.max(0, localFrame - 14),
    fps,
    from: 0,
    to: TARGET,
    config: { damping: 20, stiffness: 60, mass: 1.1 },
  });

  // Headline
  const headlineOpacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineY = interpolate(localFrame, [0, 20], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Stat reveal
  const statOpacity = interpolate(localFrame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statScale = interpolate(localFrame, [8, 28], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  // Sub-label
  const subOpacity = interpolate(localFrame, [20, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowScale = interpolate(localFrame, [0, 45, 90], [0.8, 1.15, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sine),
  });

  const displayVal = Math.round(countProgress);

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Confetti */}
      {CONFETTI.map((p, i) => (
        <ConfettiPieceEl
          key={i}
          piece={p}
          frame={localFrame}
          height={height}
          width={width}
        />
      ))}

      {/* Background glow orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.12) 40%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      {/* "Best month ever" headline */}
      <div
        style={{
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 26,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Best Month Ever
      </div>

      {/* Giant count-up stat */}
      <div
        style={{
          opacity: statOpacity,
          transform: `scale(${statScale})`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 120,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 24,
        }}
      >
        {formatMoney(displayVal)}
      </div>

      {/* Month + sub-label */}
      <div
        style={{
          opacity: subOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 20,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.06em",
        }}
      >
        {MONTH} · {COMPANY}
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ───────────────────────────────────────────────────
export const DashboardRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>
      {/* Persistent subtle noise / vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Section 1: Hero */}
      {frame < 82 && <HeroSection frame={frame} fps={fps} />}

      {/* Section 2: Top Products */}
      {frame >= 78 && frame < 182 && (
        <ProductsSection frame={frame} fps={fps} width={width} />
      )}

      {/* Section 3: Closing */}
      {frame >= 178 && (
        <ClosingSection frame={frame} fps={fps} width={width} height={height} />
      )}
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="DashboardRecap"
    component={DashboardRecap}
    durationInFrames={270}
    fps={30}
    width={1280}
    height={720}
  />
);
