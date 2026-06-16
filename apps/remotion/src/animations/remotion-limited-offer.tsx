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

// ── Config constants (customize here) ─────────────────────────────────────────
const PRODUCT_NAME = "Artisan Coffee Bundle";
const PRODUCT_SUBTITLE = "Single-origin blend · 500 g bag";
const ORIGINAL_PRICE = "$89.99";
const SALE_PRICE = "$49.99";
const SAVINGS_LABEL = "Save 44% today";
const STAMP_TEXT = "LIMITED OFFER";
const CTA_TEXT = "Claim This Offer";
const STOCK_FILLED = 3;
const STOCK_TOTAL = 10;
const STOCK_LABEL = "Only 8 left in stock";
const COUNTDOWN_START_HOURS = 2;
const COUNTDOWN_START_MINUTES = 0;
const COUNTDOWN_START_SECONDS = 0;

// Color palette
const BG = "#0a0a0f";
const GREEN = "#15803d";
const GREEN_LIGHT = "#22c55e";
const GREEN_GLOW = "#16a34a";
const AMBER = "#d97706";
const AMBER_LIGHT = "#f59e0b";
const SURFACE = "rgba(255,255,255,0.05)";
const BORDER = "rgba(255,255,255,0.08)";
const BORDER_GREEN = "rgba(21,128,61,0.35)";

// ── Helpers ────────────────────────────────────────────────────────────────────
function padTwo(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function getCountdown(frame: number, fps: number) {
  const totalStart =
    COUNTDOWN_START_HOURS * 3600 +
    COUNTDOWN_START_MINUTES * 60 +
    COUNTDOWN_START_SECONDS;
  const elapsed = frame / fps;
  const remaining = Math.max(0, totalStart - elapsed);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = Math.floor(remaining % 60);
  return { h, m, s };
}

// ── BackgroundLayer ────────────────────────────────────────────────────────────
const BackgroundLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const greenGlowOpacity = interpolate(frame, [0, 25], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const amberGlowOpacity = interpolate(frame, [8, 40], [0, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const gridOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow ambient float
  const drift = interpolate(frame, [0, 150], [0, 22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Center-left green glow — behind product card */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "35%",
          width: 820,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${GREEN}66 0%, transparent 65%)`,
          transform: `translate(-50%, -50%) translateY(${drift * 0.3}px)`,
          opacity: greenGlowOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Bottom-right amber glow — beneath CTA */}
      <div
        style={{
          position: "absolute",
          bottom: -60,
          right: -40,
          width: 700,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${AMBER}40 0%, transparent 65%)`,
          transform: `translateY(${-drift * 0.2}px)`,
          opacity: amberGlowOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: gridOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.62) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── StampBadge — "LIMITED OFFER" rotated stamp ────────────────────────────────
const StampBadge: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const f = Math.max(0, frame - 8);

  const rotate = spring({
    frame: f,
    fps,
    from: -20,
    to: 2,
    config: { damping: 10, stiffness: 120, mass: 0.75 },
  });

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 130, mass: 0.7 },
  });

  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle ink-stamp texture via box-shadow layers
  return (
    <div
      style={{
        opacity,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Outer border ring */}
      <div
        style={{
          border: `3px solid ${GREEN}`,
          borderRadius: 6,
          padding: "10px 28px",
          boxShadow: `0 0 0 2px ${GREEN}22, 0 0 28px ${GREEN}55, inset 0 0 12px ${GREEN}18`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inner top highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${GREEN}66, transparent)`,
          }}
        />
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 28,
            letterSpacing: 6,
            color: GREEN_LIGHT,
            textTransform: "uppercase",
            textShadow: `0 0 20px ${GREEN}cc`,
            lineHeight: 1,
          }}
        >
          {STAMP_TEXT}
        </div>
      </div>
      {/* Stamp shadow/blur for texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ── ProductCard — slides up with price info ────────────────────────────────────
const ProductCard: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const f = Math.max(0, frame - 15);

  const y = spring({
    frame: f,
    fps,
    from: 80,
    to: 0,
    config: { damping: 14, stiffness: 110, mass: 0.8 },
  });

  const opacity = interpolate(f, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Image placeholder glint sweep
  const glintX = interpolate(f % 90, [0, 90], [-100, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Price elements stagger
  const fOrigPrice = Math.max(0, frame - 30);
  const origPriceOpacity = interpolate(fOrigPrice, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const origPriceX = spring({
    frame: fOrigPrice,
    fps,
    from: -24,
    to: 0,
    config: { damping: 16, stiffness: 120 },
  });

  const fSalePrice = Math.max(0, frame - 40);
  const salePriceScale = spring({
    frame: fSalePrice,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 12, stiffness: 140, mass: 0.65 },
  });
  const salePriceOpacity = interpolate(fSalePrice, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fSavings = Math.max(0, frame - 50);
  const savingsOpacity = interpolate(fSavings, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        width: 500,
        borderRadius: 20,
        background: SURFACE,
        border: `1px solid ${BORDER_GREEN}`,
        backdropFilter: "blur(16px)",
        boxShadow: `0 8px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(21,128,61,0.12), inset 0 1px 0 rgba(255,255,255,0.06)`,
        overflow: "hidden",
      }}
    >
      {/* Image Placeholder */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 220,
          background: `linear-gradient(135deg, rgba(21,128,61,0.25) 0%, rgba(217,119,6,0.18) 50%, rgba(21,128,61,0.12) 100%)`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Coffee cup icon rendered as simple shapes */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: `3px solid ${GREEN}88`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 32px ${GREEN}44`,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${AMBER_LIGHT}cc 0%, ${AMBER}88 100%)`,
              boxShadow: `0 0 16px ${AMBER}88`,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Product Image
        </div>

        {/* Glint sweep */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: glintX,
            width: 80,
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            transform: "skewX(-18deg)",
            pointerEvents: "none",
          }}
        />
        {/* Bottom gradient fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: `linear-gradient(to bottom, transparent, ${BG}cc)`,
          }}
        />
      </div>

      {/* Product info */}
      <div
        style={{
          padding: "20px 28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Name */}
        <div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: "#fff",
              letterSpacing: -0.5,
              lineHeight: 1.2,
            }}
          >
            {PRODUCT_NAME}
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
              letterSpacing: 0.3,
            }}
          >
            {PRODUCT_SUBTITLE}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${GREEN}44, transparent)`,
          }}
        />

        {/* Pricing row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
          }}
        >
          {/* Original price struck-through */}
          <div
            style={{
              opacity: origPriceOpacity,
              transform: `translateX(${origPriceX}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 400,
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Was
            </span>
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 600,
                fontSize: 20,
                color: "rgba(239,68,68,0.65)",
                textDecoration: "line-through",
                textDecorationColor: "rgba(239,68,68,0.5)",
                textDecorationThickness: 2,
              }}
            >
              {ORIGINAL_PRICE}
            </span>
          </div>

          {/* Sale price */}
          <div
            style={{
              opacity: salePriceOpacity,
              transform: `scale(${salePriceScale})`,
              transformOrigin: "left bottom",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 400,
                fontSize: 11,
                color: GREEN_LIGHT,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Now
            </span>
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 900,
                fontSize: 46,
                color: GREEN_LIGHT,
                lineHeight: 1,
                textShadow: `0 0 32px ${GREEN}cc`,
                letterSpacing: -2,
              }}
            >
              {SALE_PRICE}
            </span>
          </div>

          {/* Savings badge */}
          <div
            style={{
              opacity: savingsOpacity,
              marginLeft: "auto",
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_GLOW} 100%)`,
              borderRadius: 8,
              padding: "6px 12px",
              boxShadow: `0 0 18px ${GREEN}66`,
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              {SAVINGS_LABEL}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── StockDots — animated scarcity indicator ────────────────────────────────────
const StockDots: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const containerF = Math.max(0, frame - 45);
  const containerOpacity = interpolate(containerF, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const containerY = spring({
    frame: containerF,
    fps,
    from: 20,
    to: 0,
    config: { damping: 14, stiffness: 120 },
  });

  const dots = Array.from({ length: STOCK_TOTAL }, (_, i) => {
    const isFilled = i < STOCK_FILLED;
    const dotDelay = 45 + i * 5;
    const f = Math.max(0, frame - dotDelay);
    const dotScale = spring({
      frame: f,
      fps,
      from: 0,
      to: 1,
      config: { damping: 11, stiffness: 160, mass: 0.55 },
    });
    return { isFilled, dotScale };
  });

  return (
    <div
      style={{
        opacity: containerOpacity,
        transform: `translateY(${containerY}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: 500,
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: 2.5,
          }}
        >
          Availability
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: AMBER_LIGHT,
            textShadow: `0 0 14px ${AMBER}88`,
          }}
        >
          ⚠ {STOCK_LABEL}
        </span>
      </div>

      {/* Dots row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {dots.map(({ isFilled, dotScale }, i) => (
          <div
            key={i}
            style={{
              transform: `scale(${dotScale})`,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: isFilled
                ? `radial-gradient(circle, ${AMBER_LIGHT} 30%, ${AMBER} 100%)`
                : "rgba(255,255,255,0.06)",
              border: isFilled
                ? `2px solid ${AMBER_LIGHT}88`
                : `2px solid rgba(255,255,255,0.1)`,
              boxShadow: isFilled
                ? `0 0 14px ${AMBER}88, inset 0 1px 0 rgba(255,255,255,0.2)`
                : "none",
              flexShrink: 0,
            }}
          />
        ))}

        {/* Legend labels */}
        <div
          style={{
            marginLeft: 8,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: AMBER_LIGHT,
              }}
            />
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: 1,
              }}
            >
              Sold
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: 1,
              }}
            >
              Avail
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── CountdownClock — live HH:MM:SS from frame math ────────────────────────────
const CountdownClock: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const { h, m, s } = getCountdown(frame, fps);

  const containerF = Math.max(0, frame - 58);
  const containerScale = spring({
    frame: containerF,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 13, stiffness: 130, mass: 0.7 },
  });
  const containerOpacity = interpolate(containerF, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blink colon every second
  const colonBlink = interpolate(frame % 30, [0, 5, 25, 30], [0.28, 1, 1, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const segments = [
    { value: h, label: "HRS" },
    { value: m, label: "MIN" },
    { value: s, label: "SEC" },
  ];

  return (
    <div
      style={{
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          letterSpacing: 3,
        }}
      >
        Offer Ends In
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: SURFACE,
          border: `1px solid ${BORDER_GREEN}`,
          borderRadius: 14,
          padding: "12px 20px",
          boxShadow: `0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {segments.map(({ value, label }, idx) => (
          <React.Fragment key={label}>
            {idx > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  alignItems: "center",
                  paddingBottom: 18,
                  opacity: colonBlink,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: GREEN_LIGHT,
                    boxShadow: `0 0 8px ${GREEN}cc`,
                  }}
                />
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: GREEN_LIGHT,
                    boxShadow: `0 0 8px ${GREEN}cc`,
                  }}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "ui-monospace, 'Courier New', monospace",
                  fontWeight: 800,
                  fontSize: 40,
                  color: GREEN_LIGHT,
                  lineHeight: 1,
                  letterSpacing: -1,
                  textShadow: `0 0 20px ${GREEN}99`,
                  minWidth: 56,
                  textAlign: "center",
                }}
              >
                {padTwo(value)}
              </span>
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 600,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ── CTAButton — spring entrance + shake every 2 s ─────────────────────────────
const CTAButton: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const f = Math.max(0, frame - 90);

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 11, stiffness: 140, mass: 0.65 },
  });
  const opacity = interpolate(f, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shake every 2 seconds (60 frames) — 4-frame micro-shake
  const shakeCycle = (frame - 90) % 60;
  const shakeX =
    f > 10
      ? interpolate(shakeCycle, [0, 2, 4, 6, 8, 60], [0, 6, -6, 4, 0, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Shimmer sweep on button
  const shimmerX = interpolate(f % 70, [0, 70], [-120, 620], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateX(${shakeX}px)`,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_GLOW} 55%, #166534 100%)`,
        borderRadius: 14,
        padding: "18px 52px",
        boxShadow: `0 0 36px ${GREEN}77, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`,
        cursor: "pointer",
      }}
    >
      {/* Shimmer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: shimmerX,
          width: 100,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          transform: "skewX(-16deg)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: "#fff",
          letterSpacing: 0.5,
          textShadow: "0 1px 3px rgba(0,0,0,0.3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {CTA_TEXT}
      </span>
      {/* Arrow accent */}
      <span
        style={{
          marginLeft: 10,
          fontSize: 22,
          color: "rgba(255,255,255,0.75)",
          position: "relative",
          zIndex: 1,
        }}
      >
        →
      </span>
    </div>
  );
};

// ── Main Composition ───────────────────────────────────────────────────────────
export const LimitedOffer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out in last 20 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: globalOpacity,
        overflow: "hidden",
      }}
    >
      {/* Layer 0: Background ambience */}
      <BackgroundLayer frame={frame} />

      {/* Layer 1: Top — Stamp badge */}
      <div
        style={{
          position: "absolute",
          top: 42,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <StampBadge frame={frame} fps={fps} />
      </div>

      {/* Layer 2: Center-left — Product card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-62%, -50%)",
        }}
      >
        <ProductCard frame={frame} fps={fps} />
      </div>

      {/* Layer 3: Right column — Countdown clock */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 80,
          transform: "translateY(-60%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <CountdownClock frame={frame} fps={fps} />

        {/* Stock dots below clock */}
        <StockDots frame={frame} fps={fps} />
      </div>

      {/* Layer 4: Bottom-center — CTA button */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CTAButton frame={frame} fps={fps} />
      </div>

      {/* Final top vignette stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="LimitedOffer"
    component={LimitedOffer}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
