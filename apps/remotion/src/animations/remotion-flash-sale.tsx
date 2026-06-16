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
const SALE_LABEL = "FLASH SALE";
const DEAL_TEXT = "Up to 70% OFF Electronics";
const DEAL_SUB = "Premium headphones, laptops, smartwatches & more";
const BADGE_TEXT = "LIMITED TIME OFFER";
const STOCK_LEFT = 12;
const STOCK_TOTAL = 60;
const START_HOURS = 1;
const START_MINUTES = 30;
const START_SECONDS = 0;
const RED = "#dc2626";
const RED_LIGHT = "#ef4444";
const AMBER = "#f59e0b";
const AMBER_LIGHT = "#fbbf24";
const BG = "#0a0a0f";
const SURFACE = "rgba(255,255,255,0.05)";
const BORDER = "rgba(255,255,255,0.09)";

// ── Helpers ────────────────────────────────────────────────────────────────────
function padTwo(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function getCountdown(frame: number, fps: number) {
  const totalStartSecs = START_HOURS * 3600 + START_MINUTES * 60 + START_SECONDS;
  const elapsed = frame / fps;
  const remaining = Math.max(0, totalStartSecs - elapsed);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = Math.floor(remaining % 60);
  return { h, m, s };
}

// ── BackgroundLayer ────────────────────────────────────────────────────────────
const BackgroundLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const redGlowOpacity = interpolate(frame, [0, 30], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const amberGlowOpacity = interpolate(frame, [10, 45], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Slow ambient drift
  const drift = interpolate(frame, [0, 150], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Top-center red glow — behind header */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: "50%",
          width: 900,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${RED}55 0%, transparent 65%)`,
          transform: `translateX(-50%) translateY(${drift * 0.4}px)`,
          opacity: redGlowOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Bottom-center amber glow — behind timer */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: "50%",
          width: 1100,
          height: 450,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${AMBER}30 0%, transparent 65%)`,
          transform: `translateX(-50%) translateY(${-drift * 0.3}px)`,
          opacity: amberGlowOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Subtle grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── SaleBadge — pulsing FLASH SALE header ─────────────────────────────────────
const SaleBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const enterY = spring({
    frame,
    fps,
    from: -80,
    to: 0,
    config: { damping: 12, stiffness: 130, mass: 0.7 },
  });
  const enterOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Continuous pulse: scale oscillates 1 → 1.05 → 1
  const pulse = 1 + Math.sin((frame / 18) * Math.PI) * 0.025;

  // Lightning bolt text flicker — subtle
  const flicker = frame % 24 < 2 ? 0.82 : 1;

  return (
    <div
      style={{
        opacity: enterOpacity * flicker,
        transform: `translateY(${enterY}px) scale(${pulse})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Main badge chip */}
      <div
        style={{
          background: `linear-gradient(135deg, ${RED} 0%, #b91c1c 100%)`,
          borderRadius: 6,
          padding: "6px 20px",
          marginBottom: 10,
          boxShadow: `0 0 24px ${RED}88`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 4,
            color: "#fff",
            textTransform: "uppercase",
          }}
        >
          ⚡ {BADGE_TEXT}
        </span>
      </div>

      {/* FLASH SALE headline */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 96,
          letterSpacing: -3,
          lineHeight: 1,
          color: "#ffffff",
          textShadow: `0 0 60px ${RED}99, 0 2px 0 rgba(0,0,0,0.5)`,
        }}
      >
        {SALE_LABEL}
      </div>
    </div>
  );
};

// ── TimerDigit — a single HH / MM / SS block ──────────────────────────────────
const TimerDigit: React.FC<{
  value: number;
  label: string;
  frame: number;
  fps: number;
  delay: number;
  prevValue: number;
}> = ({ value, label, frame, fps, delay, prevValue }) => {
  const f = Math.max(0, frame - delay);

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 13, stiffness: 140, mass: 0.65 },
  });

  // Flash red when the digit just changed (within last 4 frames)
  const digitChanged = value !== prevValue;
  const flashAge = digitChanged ? 0 : 99;
  const flashOpacity = interpolate(flashAge, [0, 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const digitColor = digitChanged
    ? `rgba(${220},${38},${38},${flashOpacity})`
    : "#ffffff";

  const display = padTwo(value);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: `scale(${scale})`,
      }}
    >
      {/* Card */}
      <div
        style={{
          position: "relative",
          width: 148,
          height: 148,
          borderRadius: 18,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)`,
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
            background: "rgba(255,255,255,0.12)",
          }}
        />
        {/* Horizontal flip line */}
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: "50%",
            height: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        />
        <span
          style={{
            fontFamily: "ui-monospace, 'Courier New', monospace",
            fontWeight: 800,
            fontSize: 68,
            color: digitColor,
            letterSpacing: -3,
            lineHeight: 1,
            transition: "color 0.08s",
          }}
        >
          {display}
        </span>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 12,
          color: "rgba(255,255,255,0.38)",
          textTransform: "uppercase",
          letterSpacing: 3,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── TimerColon separator ───────────────────────────────────────────────────────
const TimerColon: React.FC<{ frame: number; delay: number }> = ({ frame, delay }) => {
  const f = Math.max(0, frame - delay);
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blink every second
  const secondTick = Math.floor(frame / 30) % 2;
  const blink = interpolate(frame % 30, [0, 4, 26, 30], [0.3, 1, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        alignItems: "center",
        paddingBottom: 28,
        opacity: opacity * blink,
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          backgroundColor: AMBER,
          boxShadow: `0 0 10px ${AMBER}99`,
        }}
      />
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          backgroundColor: AMBER,
          boxShadow: `0 0 10px ${AMBER}99`,
        }}
      />
    </div>
  );
};

// ── DealText — slide-in offer line ────────────────────────────────────────────
const DealText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 35);

  const x = spring({
    frame: f,
    fps,
    from: -90,
    to: 0,
    config: { damping: 16, stiffness: 110, mass: 0.8 },
  });
  const opacity = interpolate(f, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sub-line delayed slightly more
  const fSub = Math.max(0, frame - 48);
  const xSub = spring({
    frame: fSub,
    fps,
    from: -60,
    to: 0,
    config: { damping: 18, stiffness: 100 },
  });
  const opacitySub = interpolate(fSub, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          opacity,
          transform: `translateX(${x}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 42,
          color: "#ffffff",
          letterSpacing: -1.2,
          lineHeight: 1.1,
        }}
      >
        {DEAL_TEXT}
      </div>
      <div
        style={{
          opacity: opacitySub,
          transform: `translateX(${xSub}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          marginTop: 6,
          letterSpacing: 0.2,
        }}
      >
        {DEAL_SUB}
      </div>
    </div>
  );
};

// ── StockBar — animated width from 100% → 35% ─────────────────────────────────
const StockBar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 55);

  const containerScale = spring({
    frame: f,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 14, stiffness: 120 },
  });
  const containerOpacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stock drains from 100% to ~35% over the full clip (frames 0 → 150)
  const stockPct = interpolate(frame, [0, 150], [100, 35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Remaining stock label count (12 → 7 as visual drama)
  const stockDisplayCount = Math.round(interpolate(frame, [0, 150], [STOCK_TOTAL, STOCK_LEFT], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Color shifts amber → red as stock drops
  const rInterp = interpolate(stockPct, [35, 100], [220, 245], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gInterp = interpolate(stockPct, [35, 100], [38, 158], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barColor = `rgb(${Math.round(rInterp)},${Math.round(gInterp)},11)`;

  // Shimmer on bar
  const shimmerX = interpolate(frame % 45, [0, 45], [-80, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
        width: 680,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header row */}
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
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Stock Level
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: RED_LIGHT,
          }}
        >
          ⚠ Only {stockDisplayCount} left!
        </span>
      </div>

      {/* Track */}
      <div
        style={{
          width: "100%",
          height: 14,
          borderRadius: 7,
          backgroundColor: "rgba(255,255,255,0.06)",
          border: `1px solid rgba(255,255,255,0.08)`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${stockPct}%`,
            borderRadius: 7,
            background: `linear-gradient(90deg, ${barColor} 0%, ${AMBER_LIGHT} 100%)`,
            boxShadow: `0 0 12px ${AMBER}88`,
            overflow: "hidden",
          }}
        >
          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 60,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              transform: "skewX(-15deg)",
            }}
          />
        </div>
      </div>

      {/* Percentage label */}
      <div
        style={{
          textAlign: "right",
          fontFamily: "ui-monospace, monospace",
          fontWeight: 600,
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 1,
        }}
      >
        {Math.round(stockPct)}% remaining
      </div>
    </div>
  );
};

// ── Main Composition ───────────────────────────────────────────────────────────
export const FlashSaleAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Countdown state
  const { h, m, s } = getCountdown(frame, fps);
  // Previous frame countdown for flash-on-change
  const { h: ph, m: pm, s: ps } = getCountdown(Math.max(0, frame - 1), fps);

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
      {/* Layer 0: Background glows + grid */}
      <BackgroundLayer frame={frame} />

      {/* Layer 1: Top — FLASH SALE badge */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SaleBadge frame={frame} fps={fps} />
      </div>

      {/* Layer 2: Center — Countdown timer */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -54%)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <TimerDigit
          value={h}
          prevValue={ph}
          label="Hours"
          frame={frame}
          fps={fps}
          delay={18}
        />
        <TimerColon frame={frame} delay={22} />
        <TimerDigit
          value={m}
          prevValue={pm}
          label="Minutes"
          frame={frame}
          fps={fps}
          delay={26}
        />
        <TimerColon frame={frame} delay={30} />
        <TimerDigit
          value={s}
          prevValue={ps}
          label="Seconds"
          frame={frame}
          fps={fps}
          delay={34}
        />
      </div>

      {/* Layer 3: Deal text block */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <DealText frame={frame} fps={fps} />
      </div>

      {/* Layer 4: Stock indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <StockBar frame={frame} fps={fps} />
      </div>

      {/* Edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="FlashSaleAd"
    component={FlashSaleAd}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
