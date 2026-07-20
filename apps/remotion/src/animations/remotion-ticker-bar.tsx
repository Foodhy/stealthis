import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Customizable Constants ────────────────────────────────────────────────────

const NETWORK_NAME = "NNX";
const SHOW_NAME = "NNX NIGHTLY NEWS";
const CURRENT_TIME = "14:32 EST";
const TICKER_SPEED = 2.8; // pixels per frame — increase to scroll faster
const MARKET_SPEED = 1.4; // pixels per frame for secondary market bar

const TICKER_ITEMS: string[] = [
  "BREAKING: Senate passes landmark infrastructure bill with bipartisan support",
  "◆ MARKETS: Federal Reserve signals interest rate decision next Tuesday",
  "◆ WEATHER ALERT: Category 3 hurricane approaching Gulf Coast — evacuation orders issued",
  "◆ SPORTS: Eagles defeat Cowboys 28–17 in Monday Night Football showdown",
  "◆ TECH: Major cybersecurity breach exposes 40 million user records at FinCorp",
  "◆ WORLD: G7 leaders convene emergency summit over escalating energy crisis",
  "◆ HEALTH: CDC issues advisory on rising flu cases across 12 states",
  "◆ ECONOMY: US unemployment rate falls to 3.7% — lowest in two decades",
  "◆ SPORTS: World Series Game 5 tonight — Yankees vs. Dodgers — first pitch at 8 PM",
  "◆ POLITICS: Governor announces emergency budget cuts amid fiscal shortfall",
  "◆ SCIENCE: NASA confirms successful Mars mission communication window",
  "◆ LOCAL: City council votes to expand public transit infrastructure by 2026",
];

const MARKET_ITEMS: string[] = [
  "S&P 500 ▲ 1.24%",
  "·",
  "DOW ▲ 0.87%",
  "·",
  "NASDAQ ▲ 2.11%",
  "·",
  "CRUDE OIL $78.42 ▼ 0.32%",
  "·",
  "GOLD $1,923.40 ▲ 0.14%",
  "·",
  "BTC $43,820 ▲ 3.87%",
  "·",
  "EUR/USD 1.0842 ▼ 0.06%",
  "·",
  "10Y TREASURY 4.38% ▲ 0.05",
  "·",
  "AAPL $189.32 ▲ 1.44%",
  "·",
  "TSLA $248.71 ▼ 2.10%",
  "·",
  "NVDA $492.18 ▲ 4.31%",
  "·",
  "AMZN $178.25 ▲ 0.92%",
  "·",
];

// ─── Color Palette ─────────────────────────────────────────────────────────────

const BG = "#0a0e1a";
const TICKER_BG = "#0f0f0f";
const TICKER_LABEL_BG = "#cc0000";
const TICKER_LABEL_RED_DEEP = "#8b0000";
const MARKET_BAR_BG = "#1a1a2e";
const ACCENT_RED = "#e8001e";
const MARKET_CYAN = "#00d4ff";
const MARKET_GREEN = "#00c853";
const MARKET_RED = "#ff3b30";
const WHITE = "#ffffff";
const OFF_WHITE = "rgba(255,255,255,0.88)";
const SUBTLE = "rgba(255,255,255,0.4)";
const GRID_LINE = "rgba(255,255,255,0.035)";
const SEPARATOR = "rgba(255,255,255,0.12)";

// ─── Dimensions ────────────────────────────────────────────────────────────────

const TICKER_HEIGHT = 58;
const MARKET_BAR_HEIGHT = 28;
const TICKER_LABEL_WIDTH = 188;
const MARKET_LABEL_WIDTH = 130;
const TOTAL_BOTTOM = TICKER_HEIGHT + MARKET_BAR_HEIGHT;

// ─── Helper: colored market token ─────────────────────────────────────────────

function tokenColor(item: string): string {
  if (item === "·") return "rgba(255,255,255,0.25)";
  if (item.includes("▲")) return MARKET_GREEN;
  if (item.includes("▼")) return MARKET_RED;
  return "rgba(255,255,255,0.65)";
}

// ─── Sub-component: Background ────────────────────────────────────────────────

const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Base dark navy */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: BG }} />

      {/* Radial ambient glows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          background: [
            "radial-gradient(ellipse at 15% 20%, rgba(232,0,30,0.06) 0%, transparent 40%)",
            "radial-gradient(ellipse at 85% 25%, rgba(0,212,255,0.05) 0%, transparent 38%)",
            "radial-gradient(ellipse at 50% 80%, rgba(0,212,255,0.03) 0%, transparent 30%)",
          ].join(", "),
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={`col-${i}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: TOTAL_BOTTOM,
            left: `${(i / 14) * 100}%`,
            width: 1,
            backgroundColor: GRID_LINE,
          }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`row-${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${(i / 8) * 100}%`,
            height: 1,
            backgroundColor: GRID_LINE,
          }}
        />
      ))}
    </>
  );
};

// ─── Sub-component: BroadcastOverlay ──────────────────────────────────────────

const BroadcastOverlay: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const logoOpacity = interpolate(frame, [8, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoY = spring({
    frame,
    fps,
    from: -14,
    to: 0,
    config: { damping: 20, stiffness: 130 },
  });

  const infoOpacity = interpolate(frame, [18, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const infoY = spring({
    frame: Math.max(0, frame - 12),
    fps,
    from: -10,
    to: 0,
    config: { damping: 22, stiffness: 140 },
  });

  // Blinking live dot
  const liveBlink = Math.floor(frame / 18) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: TOTAL_BOTTOM,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 52px 28px",
        pointerEvents: "none",
      }}
    >
      {/* Top row: NNX logo left, time right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Network logo block */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `translateY(${logoY}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Logo bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                width: 6,
                height: 42,
                backgroundColor: ACCENT_RED,
                marginRight: 10,
                borderRadius: 1,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: 34,
                  color: WHITE,
                  letterSpacing: "-1px",
                  lineHeight: 1,
                }}
              >
                {NETWORK_NAME}
              </div>
              <div
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 9,
                  color: ACCENT_RED,
                  letterSpacing: "3.5px",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                NEWS NETWORK
              </div>
            </div>
          </div>
        </div>

        {/* Top-right: time + live badge */}
        <div
          style={{
            opacity: infoOpacity,
            transform: `translateY(${infoY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {/* Clock */}
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 26,
              color: WHITE,
              letterSpacing: "2px",
              lineHeight: 1,
            }}
          >
            {CURRENT_TIME}
          </div>
          {/* Live badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(232,0,30,0.15)",
              border: `1px solid rgba(232,0,30,0.4)`,
              borderRadius: 4,
              padding: "4px 12px",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: ACCENT_RED,
                boxShadow: `0 0 8px ${ACCENT_RED}`,
                opacity: liveBlink ? 1 : 0.25,
              }}
            />
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 11,
                color: ACCENT_RED,
                letterSpacing: "2.5px",
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Center: Show name */}
      <div
        style={{
          opacity: infoOpacity,
          transform: `translateY(${infoY}px)`,
          textAlign: "center",
          paddingBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 13,
            color: SUBTLE,
            letterSpacing: "5px",
            textTransform: "uppercase",
          }}
        >
          {SHOW_NAME}
        </div>
      </div>
    </div>
  );
};

// ─── Sub-component: MarketBar ──────────────────────────────────────────────────
// Thin secondary bar sitting above the main ticker. Scrolls market data.

const MarketBar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ITEM_GAP = 22; // px between tokens

  // Measure approximate widths per token (monospace estimation)
  const AVG_CHAR_WIDTH = 8.5;
  const FONT_SIZE = 12;
  const itemWidths = MARKET_ITEMS.map((t) =>
    t === "·" ? 14 : t.length * AVG_CHAR_WIDTH * (FONT_SIZE / 12) + ITEM_GAP
  );
  const totalWidth = itemWidths.reduce((a, b) => a + b, 0);
  // Duplicate for seamless loop
  const offset = (frame * MARKET_SPEED) % totalWidth;

  const barOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barSlide = spring({
    frame: Math.max(0, frame - 18),
    fps,
    from: MARKET_BAR_HEIGHT,
    to: 0,
    config: { damping: 22, stiffness: 160 },
  });

  const allItems = [...MARKET_ITEMS, ...MARKET_ITEMS, ...MARKET_ITEMS];

  return (
    <div
      style={{
        position: "absolute",
        bottom: TICKER_HEIGHT,
        left: 0,
        right: 0,
        height: MARKET_BAR_HEIGHT,
        backgroundColor: MARKET_BAR_BG,
        borderTop: `1px solid rgba(0,212,255,0.18)`,
        overflow: "hidden",
        opacity: barOpacity,
        transform: `translateY(${barSlide}px)`,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* MARKETS label */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: MARKET_LABEL_WIDTH,
          background: `linear-gradient(90deg, #0a1628 0%, #0d1e3a 100%)`,
          borderRight: `1px solid rgba(0,212,255,0.25)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 10,
            color: MARKET_CYAN,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
          }}
        >
          MARKETS
        </span>
      </div>

      {/* Fade left */}
      <div
        style={{
          position: "absolute",
          left: MARKET_LABEL_WIDTH,
          top: 0,
          bottom: 0,
          width: 32,
          background: `linear-gradient(90deg, ${MARKET_BAR_BG} 0%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Scrolling market tokens */}
      <div
        style={{
          position: "absolute",
          left: MARKET_LABEL_WIDTH,
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
            gap: 0,
          }}
        >
          {allItems.map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: item === "·" ? 400 : 600,
                fontSize: 11,
                color: tokenColor(item),
                whiteSpace: "nowrap",
                paddingRight: item === "·" ? 14 : ITEM_GAP,
                paddingLeft: item === "·" ? 0 : 0,
                flexShrink: 0,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Fade right */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: `linear-gradient(270deg, ${MARKET_BAR_BG} 0%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ─── Sub-component: TickerBar ──────────────────────────────────────────────────
// The main bottom news crawl. Scrolls TICKER_ITEMS continuously.

const TickerBar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Approximate character widths at fontSize=15 Inter
  const CHAR_WIDTH = 8.6;
  const ITEM_FONT_SIZE = 15;
  const SEPARATOR_WIDTH = 32; // px for "◆" separator
  const ITEM_PADDING = 28; // right padding per item

  // Compute widths per item
  const itemWidths = TICKER_ITEMS.map((t) => {
    const text = t.startsWith("◆ ") ? t.slice(2) : t;
    const hasSep = t.startsWith("◆ ");
    return text.length * CHAR_WIDTH * (ITEM_FONT_SIZE / 15) + ITEM_PADDING + (hasSep ? SEPARATOR_WIDTH : 0);
  });
  const totalWidth = itemWidths.reduce((a, b) => a + b, 0);
  // Loop by duplicating twice
  const offset = (frame * TICKER_SPEED) % totalWidth;

  const barOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barSlide = spring({
    frame: Math.max(0, frame - 28),
    fps,
    from: TICKER_HEIGHT + 10,
    to: 0,
    config: { damping: 20, stiffness: 150 },
  });

  const allItems = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: TICKER_HEIGHT,
        backgroundColor: TICKER_BG,
        borderTop: `2px solid ${ACCENT_RED}`,
        overflow: "hidden",
        opacity: barOpacity,
        transform: `translateY(${barSlide}px)`,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* BREAKING label — left anchor */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: TICKER_LABEL_WIDTH,
          background: `linear-gradient(90deg, ${TICKER_LABEL_RED_DEEP} 0%, ${TICKER_LABEL_BG} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 4,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 15,
              color: WHITE,
              letterSpacing: "3px",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            BREAKING
          </span>
          <div
            style={{
              width: 36,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.35)",
              borderRadius: 1,
            }}
          />
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 9,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
            }}
          >
            NEWS
          </span>
        </div>
        {/* Right edge divider */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 2,
            background: "rgba(255,255,255,0.2)",
          }}
        />
      </div>

      {/* Left fade gradient after label */}
      <div
        style={{
          position: "absolute",
          left: TICKER_LABEL_WIDTH,
          top: 0,
          bottom: 0,
          width: 40,
          background: `linear-gradient(90deg, ${TICKER_BG} 0%, transparent 100%)`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Scrolling news items */}
      <div
        style={{
          position: "absolute",
          left: TICKER_LABEL_WIDTH,
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
          {allItems.map((item, i) => {
            const hasSep = item.startsWith("◆ ");
            const text = hasSep ? item.slice(2) : item;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  height: "100%",
                  paddingRight: ITEM_PADDING,
                }}
              >
                {hasSep && (
                  <span
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontWeight: 900,
                      fontSize: 13,
                      color: ACCENT_RED,
                      marginRight: 18,
                      flexShrink: 0,
                    }}
                  >
                    ◆
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: ITEM_FONT_SIZE,
                    color: OFF_WHITE,
                    whiteSpace: "nowrap",
                    letterSpacing: "0.2px",
                  }}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right fade gradient */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(270deg, ${TICKER_BG} 0%, transparent 100%)`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ─── Sub-component: MainContentArea ───────────────────────────────────────────
// The main broadcast visual above the tickers: a simulated live news desk frame.

const MainContentArea: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const contentOpacity = interpolate(frame, [12, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // ── Scene 1 (0–120): Main broadcast area wipes in
  // Lower-third chyron entrance
  const chyronDelay = 55;
  const chyronOpacity = interpolate(frame, [chyronDelay, chyronDelay + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chyronX = spring({
    frame: Math.max(0, frame - chyronDelay),
    fps,
    from: -60,
    to: 0,
    config: { damping: 18, stiffness: 110 },
  });

  // ── Scene 2 (120–270): Secondary info cards appear
  const scene2Start = 120;
  const infoCardOpacity = interpolate(frame, [scene2Start, scene2Start + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const infoCardY = spring({
    frame: Math.max(0, frame - scene2Start),
    fps,
    from: 20,
    to: 0,
    config: { damping: 22, stiffness: 130 },
  });

  // ── Scene 3 (270–390): Spotlight on ticker scrolling — dim content overlay
  const scene3Start = 270;
  const spotlightDimOpacity = interpolate(frame, [scene3Start, scene3Start + 40], [0, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spotlightLabelOpacity = interpolate(frame, [scene3Start + 20, scene3Start + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spotlightLabelY = spring({
    frame: Math.max(0, frame - (scene3Start + 20)),
    fps,
    from: 12,
    to: 0,
    config: { damping: 20, stiffness: 140 },
  });

  // ── Scene 4 (390–450): Outro — network stamp
  const scene4Start = 390;
  const outroOpacity = interpolate(frame, [scene4Start, scene4Start + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outroScale = spring({
    frame: Math.max(0, frame - scene4Start),
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 16, stiffness: 120 },
  });

  // Blinking LIVE dot for chyron
  const livePulse = Math.floor(frame / 16) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: TOTAL_BOTTOM,
        opacity: contentOpacity,
        overflow: "hidden",
      }}
    >
      {/* ── Simulated broadcast frame area ─────────────────────────────────── */}

      {/* Central visual: widescreen "live feed" placeholder frame */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 52,
          right: 52,
          bottom: 80,
          border: `1px solid rgba(255,255,255,0.06)`,
          borderRadius: 4,
          overflow: "hidden",
          background: "linear-gradient(160deg, #0f1520 0%, #080b13 60%, #0a0d17 100%)",
        }}
      >
        {/* Horizontal scan-line texture */}
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={`scan-${i}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${(i / 28) * 100}%`,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.012)",
            }}
          />
        ))}

        {/* Subtle vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.6) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Corner brackets — broadcast frame markers */}
        {[
          { top: 10, left: 10 },
          { top: 10, right: 10 },
          { bottom: 10, left: 10 },
          { bottom: 10, right: 10 },
        ].map((pos, i) => (
          <div
            key={`bracket-${i}`}
            style={{
              position: "absolute",
              ...pos,
              width: 20,
              height: 20,
              borderTop: i < 2 ? `2px solid rgba(232,0,30,0.5)` : "none",
              borderBottom: i >= 2 ? `2px solid rgba(232,0,30,0.5)` : "none",
              borderLeft: i % 2 === 0 ? `2px solid rgba(232,0,30,0.5)` : "none",
              borderRight: i % 2 === 1 ? `2px solid rgba(232,0,30,0.5)` : "none",
            }}
          />
        ))}

        {/* Center NNX watermark on live feed */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: 0.08,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 90,
              color: WHITE,
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            {NETWORK_NAME}
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 14,
              color: WHITE,
              letterSpacing: "8px",
              textTransform: "uppercase",
            }}
          >
            LIVE BROADCAST
          </div>
        </div>

        {/* Scene 2: Info cards (frames 120+) */}
        <div
          style={{
            position: "absolute",
            top: 32,
            right: 32,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: infoCardOpacity,
            transform: `translateY(${infoCardY}px)`,
          }}
        >
          {[
            { label: "VIEWERS", value: "4.2M", color: MARKET_CYAN },
            { label: "ON-AIR", value: "3:42:17", color: MARKET_GREEN },
            { label: "FEEDS", value: "12 ACTIVE", color: "rgba(255,255,255,0.6)" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(0,0,0,0.55)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 4,
                padding: "8px 14px",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 9,
                  color: SUBTLE,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: stat.color,
                  letterSpacing: "0.5px",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Scene 3: spotlight dim */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(0,0,0,${spotlightDimOpacity})`,
            pointerEvents: "none",
          }}
        />

        {/* Scene 3: TICKER SPOTLIGHT label */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, calc(-50% + ${spotlightLabelY}px))`,
            opacity: spotlightLabelOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 12,
              color: MARKET_CYAN,
              letterSpacing: "5px",
              textTransform: "uppercase",
            }}
          >
            LIVE TICKER
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: WHITE,
              letterSpacing: "0px",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            CONTINUOUS
            <br />
            NEWS CRAWL
          </div>
          <div
            style={{
              width: 60,
              height: 2,
              backgroundColor: ACCENT_RED,
              borderRadius: 1,
            }}
          />
        </div>

        {/* Scene 4: Outro NNX stamp */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: outroOpacity,
            transform: `scale(${outroScale})`,
            background: "rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 72,
              color: WHITE,
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            {NETWORK_NAME}
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 13,
              color: ACCENT_RED,
              letterSpacing: "7px",
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            NIGHTLY NEWS
          </div>
          <div
            style={{
              width: 80,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${ACCENT_RED}, transparent)`,
              marginTop: 16,
            }}
          />
        </div>
      </div>

      {/* ── Lower-third chyron (frames 55+) ────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 92,
          left: 52,
          right: 52,
          opacity: chyronOpacity,
          transform: `translateX(${chyronX}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            height: 54,
            overflow: "hidden",
          }}
        >
          {/* Red accent block */}
          <div
            style={{
              width: 8,
              backgroundColor: ACCENT_RED,
              flexShrink: 0,
            }}
          />
          {/* BREAKING label */}
          <div
            style={{
              backgroundColor: ACCENT_RED,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 18px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 11,
                color: WHITE,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              BREAKING NEWS
            </span>
          </div>
          {/* Headline text */}
          <div
            style={{
              flex: 1,
              background: "rgba(0,0,0,0.88)",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              borderRight: `1px solid ${SEPARATOR}`,
            }}
          >
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 17,
                color: WHITE,
                letterSpacing: "0.1px",
                lineHeight: 1.2,
              }}
            >
              Senate passes landmark infrastructure bill with bipartisan support
            </span>
          </div>
          {/* Live indicator block */}
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.88)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 16px",
              gap: 6,
              flexShrink: 0,
              borderLeft: `1px solid ${SEPARATOR}`,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: ACCENT_RED,
                boxShadow: `0 0 6px ${ACCENT_RED}`,
                opacity: livePulse ? 1 : 0.2,
              }}
            />
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 10,
                color: ACCENT_RED,
                letterSpacing: "2px",
              }}
            >
              LIVE
            </span>
          </div>
        </div>

        {/* Thin accent line below chyron */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${ACCENT_RED} 0%, rgba(232,0,30,0.3) 60%, transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
// ── Scene breakdown ────────────────────────────────────────────────────────────
// Scene 0 –  0–30:   Background + overlay fade in. Ticker starts scrolling.
// Scene 1 – 30–120:  Broadcast frame + chyron entrance (frame 55). Market bar slides up.
// Scene 2 – 120–270: Info cards appear top-right. Main crawl at full speed.
// Scene 3 – 270–390: Spotlight dim on broadcast area. "CONTINUOUS NEWS CRAWL" label.
// Scene 4 – 390–450: NNX outro stamp fades in. Ticker keeps rolling.

export default function TickerBarVideo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {/* Background */}
      <Background frame={frame} />

      {/* Main broadcast content area */}
      <MainContentArea frame={frame} fps={fps} />

      {/* Broadcast overlay (logo, time, live badge) */}
      <BroadcastOverlay frame={frame} fps={fps} />

      {/* Secondary market bar */}
      <MarketBar frame={frame} fps={fps} />

      {/* Primary news ticker */}
      <TickerBar frame={frame} fps={fps} />

      {/* Bottom-right watermark */}
      <div
        style={{
          position: "absolute",
          bottom: TOTAL_BOTTOM + 10,
          right: 52,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          color: "rgba(255,255,255,0.1)",
          letterSpacing: "2px",
          textTransform: "uppercase",
          opacity: interpolate(frame, [60, 90], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        FICTIONAL DATA · STEALTHIS
      </div>
    </AbsoluteFill>
  );
}
