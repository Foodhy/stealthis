import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Brand & Network ────────────────────────────────────────────────────────────
const CHANNEL_NAME = "NNX MARKETS";
const MARKET_STATUS = "NYSE OPEN";
const MARKET_LABEL = "MARKETS";
const OUTRO_HEADLINE = "S&P 500 closes at 5,234.18";
const OUTRO_SUB = "Best day in 3 weeks — led by tech & energy sectors";

// ── Color Palette ──────────────────────────────────────────────────────────────
const BG_COLOR = "#0a0e18";
const ACCENT_GREEN = "#22c55e";
const ACCENT_RED = "#e8001e";
const ACCENT_CYAN = "#00d4ff";
const ACCENT_AMBER = "#f5c842";
const TEXT_WHITE = "#ffffff";
const TEXT_DIM = "rgba(255,255,255,0.45)";
const BORDER_COLOR = "rgba(255,255,255,0.08)";

// ── Market Summary (Scene 1) ───────────────────────────────────────────────────
const MARKET_SUMMARY = [
  { index: "S&P 500", change: "+1.24%", positive: true },
  { index: "DOW JONES", change: "+0.87%", positive: true },
  { index: "NASDAQ", change: "+1.56%", positive: true },
];

// ── Stock Grid Data (Scene 2) ──────────────────────────────────────────────────
interface StockEntry {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePct: string;
  positive: boolean;
  sparkline: number[]; // normalized 0–1 values (7 points)
}

const STOCKS: StockEntry[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "189.42",
    change: "+2.31",
    changePct: "+1.24%",
    positive: true,
    sparkline: [0.45, 0.52, 0.48, 0.60, 0.65, 0.72, 0.88],
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: "247.85",
    change: "-4.12",
    changePct: "-1.63%",
    positive: false,
    sparkline: [0.80, 0.76, 0.82, 0.70, 0.65, 0.60, 0.52],
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: "875.20",
    change: "+18.60",
    changePct: "+2.17%",
    positive: true,
    sparkline: [0.40, 0.44, 0.50, 0.58, 0.67, 0.79, 0.95],
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: "415.67",
    change: "+3.89",
    changePct: "+0.94%",
    positive: true,
    sparkline: [0.55, 0.58, 0.54, 0.62, 0.68, 0.72, 0.80],
  },
  {
    symbol: "AMZN",
    name: "Amazon.com",
    price: "182.30",
    change: "+1.54",
    changePct: "+0.85%",
    positive: true,
    sparkline: [0.50, 0.55, 0.52, 0.60, 0.64, 0.70, 0.76],
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: "168.91",
    change: "-0.72",
    changePct: "-0.42%",
    positive: false,
    sparkline: [0.70, 0.72, 0.75, 0.68, 0.65, 0.63, 0.60],
  },
];

// ── Headline Ticker (Scene 3) ──────────────────────────────────────────────────
const HEADLINE_TICKER =
  "FED SIGNALS POTENTIAL RATE CUT  ·  OIL PRICES SURGE 3.2%  ·  GOLD HITS 6-MONTH HIGH  ·  TREASURY YIELDS EASE ON JOBS DATA  ·  TECH SECTOR LEADS BROADER RALLY";

// ── Helpers ────────────────────────────────────────────────────────────────────

function clamp(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
): number {
  return interpolate(value, [inputMin, inputMax], [outputMin, outputMax], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ── Background ─────────────────────────────────────────────────────────────────

const Background: React.FC = () => (
  <>
    {/* Base fill */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: BG_COLOR,
      }}
    />
    {/* Radial blue glow — top center */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(0,90,200,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }}
    />
    {/* Subtle dot grid */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.03,
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }}
    />
    {/* Bottom ambient glow */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 60% 30% at 50% 100%, rgba(0,212,255,0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }}
    />
  </>
);

// ── Pulsing Status Dot ─────────────────────────────────────────────────────────

const PulsingDot: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = Math.sin((frame / 15) * Math.PI) * 0.4 + 0.6;
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: ACCENT_GREEN,
        boxShadow: `0 0 ${6 + pulse * 6}px ${ACCENT_GREEN}`,
        opacity: 0.7 + pulse * 0.3,
        flexShrink: 0,
      }}
    />
  );
};

// ── Scene 1: Header ────────────────────────────────────────────────────────────

interface Scene1Props {
  frame: number;
  fps: number;
}

const Scene1Header: React.FC<Scene1Props> = ({ frame, fps }) => {
  // Header springs down from above
  const headerY = spring({
    frame,
    fps,
    from: -40,
    to: 0,
    config: { damping: 20, stiffness: 130 },
  });
  const headerOpacity = clamp(frame, 0, 18, 0, 1);

  // Market summary row fades/slides in after header
  const summaryOpacity = clamp(frame, 20, 38, 0, 1);
  const summaryY = spring({
    frame: Math.max(0, frame - 18),
    fps,
    from: 14,
    to: 0,
    config: { damping: 22, stiffness: 140 },
  });

  // Divider line
  const dividerScale = clamp(frame, 28, 48, 0, 1);

  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        left: 60,
        right: 60,
      }}
    >
      {/* Channel name + status badge */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        {/* Left: channel name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Logo block */}
          <div
            style={{
              background: `linear-gradient(135deg, ${ACCENT_CYAN} 0%, #0060cc 100%)`,
              borderRadius: 6,
              padding: "4px 12px",
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 20,
              color: TEXT_WHITE,
              letterSpacing: "1px",
            }}
          >
            NNX
          </div>
          <div>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: TEXT_WHITE,
                letterSpacing: "2px",
                lineHeight: 1,
              }}
            >
              MARKETS
            </div>
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: 11,
                color: TEXT_DIM,
                letterSpacing: "2.5px",
                marginTop: 3,
              }}
            >
              FINANCIAL NEWS NETWORK
            </div>
          </div>
        </div>

        {/* Right: LIVE badge + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(232,0,30,0.15)",
              border: `1px solid rgba(232,0,30,0.40)`,
              borderRadius: 6,
              padding: "5px 12px",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: ACCENT_RED,
                boxShadow: `0 0 8px ${ACCENT_RED}`,
              }}
            />
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 12,
                color: ACCENT_RED,
                letterSpacing: "2px",
              }}
            >
              LIVE
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(34,197,94,0.10)",
              border: `1px solid rgba(34,197,94,0.30)`,
              borderRadius: 6,
              padding: "5px 14px",
            }}
          >
            {/* Inline PulsingDot since we need frame here */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: ACCENT_GREEN,
                boxShadow: `0 0 8px ${ACCENT_GREEN}`,
              }}
            />
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: ACCENT_GREEN,
                letterSpacing: "1.5px",
              }}
            >
              {MARKET_STATUS}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal rule */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, ${ACCENT_CYAN}55 0%, rgba(255,255,255,0.12) 50%, transparent 100%)`,
          marginBottom: 16,
          transformOrigin: "left center",
          transform: `scaleX(${dividerScale})`,
        }}
      />

      {/* Market summary row */}
      <div
        style={{
          opacity: summaryOpacity,
          transform: `translateY(${summaryY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {MARKET_SUMMARY.map((item, i) => (
          <React.Fragment key={item.index}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px 8px 0",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: TEXT_DIM,
                  letterSpacing: "0.5px",
                }}
              >
                {item.index}
              </span>
              <span
                style={{
                  fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                  fontWeight: 700,
                  fontSize: 15,
                  color: item.positive ? ACCENT_GREEN : ACCENT_RED,
                  letterSpacing: "0.3px",
                }}
              >
                {item.positive ? "▲" : "▼"} {item.change}
              </span>
            </div>
            {i < MARKET_SUMMARY.length - 1 && (
              <div
                style={{
                  width: 1,
                  height: 18,
                  background: "rgba(255,255,255,0.12)",
                  marginRight: 20,
                  flexShrink: 0,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ── Sparkline SVG ──────────────────────────────────────────────────────────────

interface SparklineProps {
  points: number[];
  positive: boolean;
  width: number;
  height: number;
  progress: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  points,
  positive,
  width,
  height,
  progress,
}) => {
  const color = positive ? ACCENT_GREEN : ACCENT_RED;
  const visibleCount = Math.max(2, Math.ceil(points.length * progress));
  const visible = points.slice(0, visibleCount);

  const xs = visible.map((_, i) => (i / (points.length - 1)) * width);
  const ys = visible.map((v) => height - v * height * 0.75 - height * 0.1);

  const d = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");

  const fillD =
    d +
    ` L${xs[xs.length - 1].toFixed(1)},${height} L${xs[0].toFixed(1)},${height} Z`;

  const gradId = `sg-${positive ? "g" : "r"}`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {xs.length > 1 && (
        <circle
          cx={xs[xs.length - 1]}
          cy={ys[ys.length - 1]}
          r={2.5}
          fill={color}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
      )}
    </svg>
  );
};

// ── Stock Card ─────────────────────────────────────────────────────────────────

interface StockCardProps {
  stock: StockEntry;
  frame: number;
  fps: number;
  delay: number;
}

const StockCard: React.FC<StockCardProps> = ({ stock, frame, fps, delay }) => {
  const f = Math.max(0, frame - delay);

  const cardOpacity = clamp(f, 0, 16, 0, 1);
  const cardY = spring({
    frame: f,
    fps,
    from: 20,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });

  const sparkProgress = interpolate(f, [10, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const badgeOpacity = clamp(f, 22, 36, 0, 1);
  const color = stock.positive ? ACCENT_GREEN : ACCENT_RED;

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 10,
        padding: "14px 16px 12px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        flex: 1,
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
          background: `linear-gradient(90deg, ${color} 0%, ${color}44 100%)`,
        }}
      />

      {/* Symbol + badge row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 16,
            color: TEXT_WHITE,
            letterSpacing: "0.5px",
            lineHeight: 1,
          }}
        >
          {stock.symbol}
        </div>
        <div
          style={{
            opacity: badgeOpacity,
            background: stock.positive
              ? "rgba(34,197,94,0.15)"
              : "rgba(232,0,30,0.15)",
            border: `1px solid ${color}44`,
            borderRadius: 5,
            padding: "2px 7px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            color,
            letterSpacing: "0.3px",
          }}
        >
          {stock.changePct}
        </div>
      </div>

      {/* Company name */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          color: TEXT_DIM,
          marginBottom: 8,
          letterSpacing: "0.2px",
        }}
      >
        {stock.name}
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          fontWeight: 700,
          fontSize: 22,
          color: TEXT_WHITE,
          letterSpacing: "-0.5px",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        ${stock.price}
      </div>

      {/* Change */}
      <div
        style={{
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          fontWeight: 500,
          fontSize: 11,
          color,
          marginBottom: 10,
          letterSpacing: "0.2px",
        }}
      >
        {stock.change} today
      </div>

      {/* Sparkline */}
      <Sparkline
        points={stock.sparkline}
        positive={stock.positive}
        width={160}
        height={36}
        progress={sparkProgress}
      />
    </div>
  );
};

// ── Scene 2: Stock Grid ────────────────────────────────────────────────────────

interface Scene2Props {
  frame: number;
  fps: number;
}

const Scene2Grid: React.FC<Scene2Props> = ({ frame, fps }) => {
  // Section label fade
  const labelOpacity = clamp(frame - 48, 0, 18, 0, 1);

  const row1 = STOCKS.slice(0, 3);
  const row2 = STOCKS.slice(3, 6);

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 60,
        right: 60,
        bottom: 90,
      }}
    >
      {/* Section label */}
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 10,
          color: TEXT_DIM,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        LIVE QUOTES · NYSE
      </div>

      {/* Row 1 */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {row1.map((stock, i) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            frame={frame}
            fps={fps}
            delay={50 + i * 12}
          />
        ))}
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "flex",
          gap: 14,
        }}
      >
        {row2.map((stock, i) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            frame={frame}
            fps={fps}
            delay={86 + i * 12}
          />
        ))}
      </div>
    </div>
  );
};

// ── Scene 3: Headline Ticker Bar ───────────────────────────────────────────────

interface Scene3Props {
  frame: number;
}

const Scene3HeadlineTicker: React.FC<Scene3Props> = ({ frame }) => {
  // Bar slides up from bottom between frames 200–220
  const barY = interpolate(frame, [200, 220], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const barOpacity = clamp(frame, 200, 220, 0, 1);

  // Scrolling text — translate from right to left
  // Total text content width estimate: ~3200px at font size 14
  const CONTENT_WIDTH = 3400;
  const scrollOffset = interpolate(
    frame,
    [210, 300],
    [0, CONTENT_WIDTH * 0.35],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.linear,
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        opacity: barOpacity,
        transform: `translateY(${barY}px)`,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      {/* Label badge */}
      <div
        style={{
          background: ACCENT_RED,
          width: 130,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 12,
            color: TEXT_WHITE,
            letterSpacing: "2.5px",
          }}
        >
          {MARKET_LABEL}
        </span>
      </div>

      {/* Dark ticker background */}
      <div
        style={{
          flex: 1,
          background: "rgba(6, 8, 18, 0.94)",
          borderTop: `1px solid rgba(232,0,30,0.30)`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fade edge left */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background:
              "linear-gradient(90deg, rgba(6,8,18,0.95) 0%, transparent 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Scrolling text */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 20,
            display: "flex",
            alignItems: "center",
            transform: `translateX(-${scrollOffset}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {/* Repeat 3x to avoid gap */}
          {[0, 1, 2].map((pass) => (
            <span
              key={pass}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.8px",
                paddingRight: 80,
              }}
            >
              {HEADLINE_TICKER}
            </span>
          ))}
        </div>

        {/* Fade edge right */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 60,
            background:
              "linear-gradient(270deg, rgba(6,8,18,0.95) 0%, transparent 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

// ── Scene 4: Outro Summary ─────────────────────────────────────────────────────

interface Scene4Props {
  frame: number;
  fps: number;
}

const Scene4Outro: React.FC<Scene4Props> = ({ frame, fps }) => {
  const relFrame = Math.max(0, frame - 260);

  const containerOpacity = clamp(relFrame, 0, 20, 0, 1);
  const headlineY = spring({
    frame: relFrame,
    fps,
    from: 24,
    to: 0,
    config: { damping: 20, stiffness: 110 },
  });

  const subOpacity = clamp(relFrame, 14, 30, 0, 1);
  const subY = spring({
    frame: Math.max(0, relFrame - 12),
    fps,
    from: 12,
    to: 0,
    config: { damping: 22, stiffness: 130 },
  });

  const accentScale = spring({
    frame: Math.max(0, relFrame - 6),
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 16, stiffness: 160 },
  });

  // Exit — fade out near end
  const exitOpacity = clamp(frame, 290, 300, 1, 0);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: containerOpacity * exitOpacity,
        paddingBottom: 60,
      }}
    >
      {/* Cyan top accent line */}
      <div
        style={{
          width: 48,
          height: 3,
          background: ACCENT_CYAN,
          borderRadius: 2,
          marginBottom: 22,
          transform: `scaleX(${accentScale})`,
          boxShadow: `0 0 14px ${ACCENT_CYAN}`,
        }}
      />

      {/* Main headline */}
      <div
        style={{
          opacity: 1,
          transform: `translateY(${headlineY}px)`,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 38,
          color: TEXT_WHITE,
          textAlign: "center",
          letterSpacing: "-0.5px",
          lineHeight: 1.15,
          marginBottom: 14,
        }}
      >
        {OUTRO_HEADLINE}
      </div>

      {/* Sub-headline */}
      <div
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          color: TEXT_DIM,
          textAlign: "center",
          letterSpacing: "0.3px",
        }}
      >
        {OUTRO_SUB}
      </div>

      {/* Channel watermark */}
      <div
        style={{
          marginTop: 28,
          opacity: subOpacity * 0.5,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 11,
          color: ACCENT_CYAN,
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        {CHANNEL_NAME}
      </div>
    </div>
  );
};

// ── Transition Overlay ─────────────────────────────────────────────────────────

const TransitionOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  // Fade to black between scenes 2→3 (195–205) and for outro transition (255–265)
  const fadeScene3 = clamp(frame, 192, 205, 0, 1) * clamp(frame, 205, 215, 1, 0);

  const fadeOutro = clamp(frame, 255, 265, 0, 1) * clamp(frame, 265, 272, 1, 0);

  const opacity = Math.max(fadeScene3, fadeOutro);

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: BG_COLOR,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Main Composition ───────────────────────────────────────────────────────────

export default function MarketWatchTicker() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene visibility windows:
  // Scene 1: 0–200   (header + summary persistent)
  // Scene 2: 50–200  (stock grid)
  // Scene 3: 200–260 (news ticker bar)
  // Scene 4: 260–300 (outro)

  const showScenes123 = frame < 265;
  const showScene4 = frame >= 255;

  // Fade scenes 1+2 out as outro begins
  const mainContentOpacity = clamp(frame, 255, 270, 1, 0);

  // Pulsing dot for OPEN status – animate independently
  const pulsingDotScale = 1 + Math.sin((frame / 12) * Math.PI) * 0.15;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />

      {/* ── SCENE 1 + 2 + 3 content group ─────────────────────────────────── */}
      {showScenes123 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: mainContentOpacity,
          }}
        >
          {/* Scene 1: Header (frames 0–50) */}
          {/* Header persists visually until fade-out */}
          <Scene1Header frame={frame} fps={fps} />

          {/* Pulsing open status dot (Scene 1 only, decorative) */}
          {frame < 200 && (
            <div
              style={{
                position: "absolute",
                top: 50,
                right: 62,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: ACCENT_GREEN,
                boxShadow: `0 0 8px ${ACCENT_GREEN}`,
                transform: `scale(${pulsingDotScale})`,
                opacity: clamp(frame, 0, 12, 0, 1),
              }}
            />
          )}

          {/* Scene 2: Stock grid (frames 50–200) */}
          {frame >= 44 && frame < 265 && (
            <Scene2Grid frame={frame} fps={fps} />
          )}

          {/* Scene 3: Scrolling headline ticker (frames 200–260) */}
          <Scene3HeadlineTicker frame={frame} />
        </div>
      )}

      {/* ── SCENE 4: Outro (frames 260–300) ────────────────────────────────── */}
      {showScene4 && <Scene4Outro frame={frame} fps={fps} />}

      {/* ── Transition overlay flashes ──────────────────────────────────────── */}
      <TransitionOverlay frame={frame} />

      {/* ── Persistent corner watermark ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          right: 60,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          color: "rgba(255,255,255,0.10)",
          letterSpacing: "1px",
          opacity: clamp(frame, 10, 30, 0, 1) * clamp(frame, 255, 270, 1, 0),
        }}
      >
        FICTIONAL DATA · NNX MARKETS
      </div>
    </AbsoluteFill>
  );
}
