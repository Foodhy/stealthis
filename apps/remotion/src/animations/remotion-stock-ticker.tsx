import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Palette & Config ──────────────────────────────────────────────────────────
const BG_COLOR = "#080b10";

const GREEN = "#10b981";
const RED = "#ef4444";
const INDIGO = "#6366f1";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const VIOLET = "#8b5cf6";
const SKY = "#38bdf8";
const ORANGE = "#f97316";

// ── Index Data ────────────────────────────────────────────────────────────────
interface IndexEntry {
  symbol: string;
  value: number;
  delta: number; // percentage
}

const INDICES: IndexEntry[] = [
  { symbol: "SX500", value: 4892, delta: 0.8 },
  { symbol: "TECH-X", value: 14220, delta: -0.3 },
  { symbol: "GLOBAL", value: 2108, delta: 1.2 },
];

// ── Ticker Stocks ─────────────────────────────────────────────────────────────
interface TickerStock {
  symbol: string;
  price: number;
  delta: number;
  color: string;
}

const TICKER_STOCKS: TickerStock[] = [
  { symbol: "NVXA",  price: 487.32, delta: 2.14,  color: INDIGO },
  { symbol: "QNTM",  price: 221.08, delta: -1.07, color: RED },
  { symbol: "AERO",  price: 1043.5, delta: 0.56,  color: CYAN },
  { symbol: "ZOID",  price: 34.71,  delta: 3.81,  color: GREEN },
  { symbol: "MRPH",  price: 156.44, delta: -2.39, color: AMBER },
  { symbol: "PLEX",  price: 72.19,  delta: 1.22,  color: VIOLET },
  { symbol: "FLXO",  price: 318.9,  delta: -0.88, color: SKY },
  { symbol: "VYRN",  price: 95.63,  delta: 4.07,  color: ORANGE },
  { symbol: "KRYP",  price: 2204.0, delta: -1.53, color: RED },
  { symbol: "SOLV",  price: 67.55,  delta: 0.99,  color: GREEN },
];

// ── Featured Stocks with sparkline data ───────────────────────────────────────
interface FeaturedStock {
  symbol: string;
  name: string;
  price: number;
  delta: number;
  color: string;
  sparkline: number[]; // normalized 0–1 values
}

const FEATURED: FeaturedStock[] = [
  {
    symbol: "NVXA",
    name: "Novex Analytics",
    price: 487.32,
    delta: 2.14,
    color: INDIGO,
    sparkline: [0.42, 0.38, 0.45, 0.41, 0.50, 0.55, 0.48, 0.60, 0.65, 0.58, 0.71, 0.80, 0.75, 0.82, 0.90, 0.88, 0.95, 1.0],
  },
  {
    symbol: "MRPH",
    name: "Morphex Systems",
    price: 156.44,
    delta: -2.39,
    color: AMBER,
    sparkline: [0.9, 0.88, 0.92, 0.85, 0.80, 0.84, 0.78, 0.74, 0.70, 0.75, 0.68, 0.65, 0.60, 0.63, 0.58, 0.52, 0.49, 0.44],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return p.toFixed(2);
}

function fmtDelta(d: number): string {
  return `${d >= 0 ? "+" : ""}${d.toFixed(2)}%`;
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

interface SparklineProps {
  points: number[];
  color: string;
  width: number;
  height: number;
  progress: number; // 0–1, how much of the line to reveal
}

const Sparkline: React.FC<SparklineProps> = ({ points, color, width, height, progress }) => {
  const visibleCount = Math.max(2, Math.ceil(points.length * progress));
  const visible = points.slice(0, visibleCount);

  const xs = visible.map((_, i) => (i / (points.length - 1)) * width);
  const ys = visible.map((v) => height - v * height * 0.8 - height * 0.1);

  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");

  // Fill area path
  const fillD =
    d +
    ` L${xs[xs.length - 1].toFixed(1)},${height} L${xs[0].toFixed(1)},${height} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      {/* Fill */}
      <path
        d={fillD}
        fill={`url(#fill-${color.replace("#", "")})`}
      />
      {/* Line */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot at latest point */}
      {xs.length > 1 && (
        <circle
          cx={xs[xs.length - 1]}
          cy={ys[ys.length - 1]}
          r={3.5}
          fill={color}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      )}
    </svg>
  );
};

// ── Featured Stock Card ───────────────────────────────────────────────────────

interface FeaturedCardProps {
  stock: FeaturedStock;
  frame: number;
  fps: number;
  delay: number;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ stock, frame, fps, delay }) => {
  const f = Math.max(0, frame - delay);

  const cardOpacity = interpolate(f, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = spring({
    frame: f,
    fps,
    from: 24,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });

  // Count-up price
  const priceProgress = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 60 },
  });
  const displayPrice = stock.price * priceProgress;

  // Sparkline draw progress
  const sparkProgress = interpolate(f, [15, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Delta fade-in
  const deltaOpacity = interpolate(f, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isPositive = stock.delta >= 0;
  const deltaColor = isPositive ? GREEN : RED;

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        background: "rgba(255,255,255,0.035)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 12,
        padding: "18px 20px 14px",
        width: 280,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: stock.color,
          borderRadius: "12px 12px 0 0",
          boxShadow: `0 0 12px ${stock.color}`,
        }}
      />

      {/* Symbol + Name row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "#ffffff",
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}
          >
            {stock.symbol}
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginTop: 3,
              letterSpacing: "0.2px",
            }}
          >
            {stock.name}
          </div>
        </div>
        <div
          style={{
            opacity: deltaOpacity,
            background: isPositive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${isPositive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 6,
            padding: "3px 8px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: deltaColor,
            letterSpacing: "0.3px",
          }}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(stock.delta).toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          fontWeight: 700,
          fontSize: 28,
          color: "#ffffff",
          letterSpacing: "-0.5px",
          lineHeight: 1,
          marginBottom: 14,
        }}
      >
        ${fmtPrice(displayPrice)}
      </div>

      {/* Sparkline */}
      <Sparkline
        points={stock.sparkline}
        color={stock.color}
        width={238}
        height={52}
        progress={sparkProgress}
      />
    </div>
  );
};

// ── Market Index Card ─────────────────────────────────────────────────────────

interface IndexCardProps {
  entry: IndexEntry;
  frame: number;
  fps: number;
  delay: number;
}

const IndexCard: React.FC<IndexCardProps> = ({ entry, frame, fps, delay }) => {
  const f = Math.max(0, frame - delay);

  const cardOpacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardScale = spring({
    frame: f,
    fps,
    from: 0.88,
    to: 1,
    config: { damping: 16, stiffness: 140 },
  });

  // Count-up value
  const valueProgress = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 24, stiffness: 55, mass: 1.2 },
  });
  const displayValue = Math.round(entry.value * valueProgress);

  // Delta slide-in
  const deltaF = Math.max(0, f - 20);
  const deltaOpacity = interpolate(deltaF, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const deltaX = spring({
    frame: deltaF,
    fps,
    from: -12,
    to: 0,
    config: { damping: 20, stiffness: 150 },
  });

  const isPositive = entry.delta >= 0;
  const deltaColor = isPositive ? GREEN : RED;

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        textAlign: "center",
        flex: 1,
        padding: "20px 24px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${isPositive ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)"} 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Symbol */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {entry.symbol}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          fontWeight: 700,
          fontSize: 42,
          color: "#ffffff",
          letterSpacing: "-1.5px",
          lineHeight: 1,
          marginBottom: 10,
        }}
      >
        {displayValue.toLocaleString("en-US")}
      </div>

      {/* Delta */}
      <div
        style={{
          opacity: deltaOpacity,
          transform: `translateX(${deltaX}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: isPositive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
          border: `1px solid ${isPositive ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          borderRadius: 8,
          padding: "5px 12px",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: deltaColor,
          }}
        >
          {isPositive ? "▲" : "▼"}
        </span>
        <span
          style={{
            fontFamily: "ui-monospace, 'Cascadia Code', monospace",
            fontWeight: 700,
            fontSize: 18,
            color: deltaColor,
            letterSpacing: "0.3px",
          }}
        >
          {fmtDelta(entry.delta)}
        </span>
      </div>
    </div>
  );
};

// ── Scrolling Ticker Bar ──────────────────────────────────────────────────────

interface TickerBarProps {
  frame: number;
  opacity: number;
}

const TickerBar: React.FC<TickerBarProps> = ({ frame, opacity }) => {
  const ITEM_WIDTH = 180;
  const totalWidth = TICKER_STOCKS.length * ITEM_WIDTH;
  const speed = 1.6;
  const offset = (frame * speed) % totalWidth;

  // Render 3× to ensure seamless loop
  const stocksTripled = [...TICKER_STOCKS, ...TICKER_STOCKS, ...TICKER_STOCKS];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 52,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        opacity,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Left badge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 130,
          background: `linear-gradient(135deg, ${INDIGO} 0%, ${VIOLET} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: "#ffffff",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          LIVE
        </span>
        <div
          style={{
            position: "absolute",
            right: -1,
            top: 0,
            bottom: 0,
            width: 1,
            background: "rgba(255,255,255,0.2)",
          }}
        />
      </div>

      {/* Fade gradient left */}
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 0,
          bottom: 0,
          width: 40,
          background: "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Scrolling items */}
      <div
        style={{
          position: "absolute",
          left: 130,
          right: 0,
          top: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            transform: `translateX(-${offset}px)`,
            willChange: "transform",
          }}
        >
          {stocksTripled.map((s, i) => {
            const isPos = s.delta >= 0;
            const dColor = isPos ? GREEN : RED;
            return (
              <div
                key={i}
                style={{
                  width: ITEM_WIDTH,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingLeft: 16,
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  height: "100%",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                      fontWeight: 700,
                      fontSize: 13,
                      color: s.color,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {s.symbol}
                  </div>
                  <div
                    style={{
                      fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                      fontWeight: 500,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.75)",
                      marginTop: 1,
                    }}
                  >
                    ${fmtPrice(s.price)}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                    fontWeight: 700,
                    fontSize: 11,
                    color: dColor,
                    letterSpacing: "0.2px",
                  }}
                >
                  {isPos ? "▲" : "▼"} {Math.abs(s.delta).toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fade gradient right */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(270deg, rgba(8,11,16,0.9) 0%, transparent 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ── Title Header ──────────────────────────────────────────────────────────────

const TitleHeader: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = spring({
    frame,
    fps,
    from: -18,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });

  // Blinking cursor blink state
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: "#ffffff",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          Market Close
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontWeight: 400,
              marginLeft: 10,
            }}
          >
            –
          </span>
          <span
            style={{
              color: CYAN,
              marginLeft: 10,
            }}
          >
            June 2024
          </span>
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            marginTop: 5,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          Fictional Markets · End-of-Day Summary
        </div>
      </div>

      {/* Terminal-style status indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 8,
          padding: "6px 14px",
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: GREEN,
            boxShadow: `0 0 6px ${GREEN}`,
            opacity: cursorVisible ? 1 : 0.3,
          }}
        />
        <span
          style={{
            fontFamily: "ui-monospace, 'Cascadia Code', monospace",
            fontWeight: 600,
            fontSize: 12,
            color: GREEN,
            letterSpacing: "1px",
          }}
        >
          MARKET CLOSED
        </span>
      </div>
    </div>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────

export const StockTicker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tickerOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background ambient glow
  const bgGlowOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Divider line
  const dividerOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>

      {/* Background ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgGlowOpacity,
          background: [
            "radial-gradient(ellipse at 20% 30%, rgba(99,102,241,0.10) 0%, transparent 45%)",
            "radial-gradient(ellipse at 80% 60%, rgba(6,182,212,0.07) 0%, transparent 40%)",
            "radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.05) 0%, transparent 35%)",
          ].join(", "),
          pointerEvents: "none",
        }}
      />

      {/* Subtle dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* Main layout */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 56,
          right: 56,
          bottom: 52, // above ticker bar
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Title row */}
        <div style={{ marginBottom: 22 }}>
          <TitleHeader frame={frame} fps={fps} />
        </div>

        {/* Indices row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {INDICES.map((idx, i) => (
            <IndexCard
              key={idx.symbol}
              entry={idx}
              frame={frame}
              fps={fps}
              delay={12 + i * 14}
            />
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            marginBottom: 20,
            opacity: dividerOpacity,
          }}
        />

        {/* Featured stocks row */}
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              alignSelf: "center",
              marginRight: 4,
              opacity: dividerOpacity,
            }}
          >
            Featured
          </div>

          {FEATURED.map((stock, i) => (
            <FeaturedCard
              key={stock.symbol}
              stock={stock}
              frame={frame}
              fps={fps}
              delay={40 + i * 18}
            />
          ))}

          {/* Right side: chart label */}
          <div
            style={{
              flex: 1,
              alignSelf: "center",
              paddingLeft: 24,
              opacity: interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "rgba(255,255,255,0.18)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Day Range
            </div>
            {FEATURED.map((stock) => (
              <div
                key={stock.symbol}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: stock.color,
                    boxShadow: `0 0 6px ${stock.color}`,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.3px",
                  }}
                >
                  {stock.symbol}
                </div>
                <div
                  style={{
                    height: 2,
                    flex: 1,
                    background: `linear-gradient(90deg, ${stock.color}40 0%, ${stock.color} 60%, ${stock.color}40 100%)`,
                    borderRadius: 1,
                  }}
                />
                <div
                  style={{
                    fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                    fontSize: 11,
                    color: stock.delta >= 0 ? GREEN : RED,
                    fontWeight: 700,
                  }}
                >
                  {fmtDelta(stock.delta)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ticker bar */}
      <TickerBar frame={frame} opacity={tickerOpacity} />

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 56,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 11,
          color: "rgba(255,255,255,0.12)",
          letterSpacing: "1px",
          opacity: bgGlowOpacity,
        }}
      >
        FICTIONAL DATA · STEALTHIS
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <Composition
    id="StockTicker"
    component={StockTicker}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
  />
);
