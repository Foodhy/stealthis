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
const CARD = "#1a1a2e";
const BRAND = "#6366f1";
const TEXT = "#f8fafc";
const TEXT_MUTED = "rgba(248,250,252,0.55)";
const GOLD = "#f59e0b";
const GOLD_GLOW = "rgba(245,158,11,0.35)";
const GOLD_DIM = "#3a2e10";
const STAR_GRAY = "#2a2a3a";

// ── Star distribution data ─────────────────────────────────────────────
interface StarRow {
  stars: number;
  pct: number;
  color: string;
}

const DISTRIBUTION: StarRow[] = [
  { stars: 5, pct: 78, color: GOLD },
  { stars: 4, pct: 14, color: "#a78bfa" },
  { stars: 3, pct: 5, color: "#64748b" },
  { stars: 2, pct: 2, color: "#475569" },
  { stars: 1, pct: 1, color: "#334155" },
];

const TOTAL_REVIEWS = 2847;
const SCORE = 4.9;

// Frame budget
const STARS_START = 8;
const STAR_STAGGER = 14; // frames between stars animating
const SCORE_START = STARS_START + 5 * STAR_STAGGER + 10; // ~87
const TAGLINE_START = SCORE_START + 30; // ~117
const BARS_START = TAGLINE_START + 22; // ~139
const BAR_STAGGER = 10;
const DURATION = 180;
const FADE_OUT_START = DURATION - 15;

// ── Background decoration ─────────────────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = interpolate(
    Math.sin((frame / 120) * Math.PI * 2),
    [-1, 1],
    [0.7, 1.0]
  );
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -160,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
          opacity: pulse,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
          opacity: pulse * 0.8,
          pointerEvents: "none",
        }}
      />
      {/* subtle dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Single animated star ──────────────────────────────────────────────
const AnimatedStar: React.FC<{
  index: number;
  frame: number;
  fps: number;
  filled: boolean; // all 5 are "full" for 4.9 display
}> = ({ index, frame, fps, filled }) => {
  const delay = STARS_START + index * STAR_STAGGER;
  const localFrame = Math.max(0, frame - delay);

  const sp = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 180, mass: 0.7 },
  });

  const scale = interpolate(sp, [0, 1], [0.2, 1]);
  const rotate = interpolate(sp, [0, 1], [-35, 0]);
  const goldProgress = interpolate(sp, [0, 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Star polygon path (5-pointed, centered at 24,24, r_outer=22, r_inner=9)
  const starPath = (() => {
    const cx = 24;
    const cy = 24;
    const outerR = 22;
    const innerR = 9;
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return `M${points.join("L")}Z`;
  })();

  // interpolate fill color from gray to gold
  const r1 = parseInt(STAR_GRAY.slice(1, 3), 16);
  const g1 = parseInt(STAR_GRAY.slice(3, 5), 16);
  const b1 = parseInt(STAR_GRAY.slice(5, 7), 16);
  const r2 = 245;
  const g2 = 158;
  const b2 = 11;
  const r = Math.round(r1 + (r2 - r1) * goldProgress);
  const g = Math.round(g1 + (g2 - g1) * goldProgress);
  const b = Math.round(b1 + (b2 - b1) * goldProgress);
  const fillColor = filled ? `rgb(${r},${g},${b})` : STAR_GRAY;

  const glowOpacity = filled
    ? interpolate(goldProgress, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        position: "relative",
        width: 64,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale}) rotate(${rotate}deg)`,
      }}
    >
      {/* glow halo */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD_GLOW} 0%, transparent 72%)`,
          filter: "blur(6px)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />
      <svg
        width={48}
        height={48}
        viewBox="0 0 48 48"
        style={{ display: "block", position: "relative" }}
      >
        <path d={starPath} fill={fillColor} />
      </svg>
    </div>
  );
};

// ── Score counter ─────────────────────────────────────────────────────
const ScoreCounter: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const localFrame = Math.max(0, frame - SCORE_START);

  const sp = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 70, mass: 1.0 },
  });

  const currentScore = interpolate(sp, [0, 1], [0, SCORE]);
  const display = currentScore.toFixed(1);

  const opacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const translateY = interpolate(localFrame, [0, 18], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        fontSize: 80,
        color: TEXT,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        textAlign: "center",
      }}
    >
      {display}
    </div>
  );
};

// ── Tagline ───────────────────────────────────────────────────────────
const Tagline: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = Math.max(0, frame - TAGLINE_START);
  const opacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const translateY = interpolate(localFrame, [0, 20], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const countLocal = Math.max(0, frame - SCORE_START);
  const sp = spring({
    frame: countLocal,
    fps: 30,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 70, mass: 1.0 },
  });
  const reviewCount = Math.round(interpolate(sp, [0, 1], [0, TOTAL_REVIEWS]));

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 500,
        fontSize: 22,
        color: TEXT_MUTED,
        textAlign: "center",
        letterSpacing: "0.01em",
      }}
    >
      based on{" "}
      <span style={{ color: TEXT, fontWeight: 700 }}>
        {reviewCount.toLocaleString("en-US")}
      </span>{" "}
      reviews
    </div>
  );
};

// ── Distribution bar row ──────────────────────────────────────────────
const BarRow: React.FC<{
  row: StarRow;
  index: number;
  frame: number;
  fps: number;
}> = ({ row, index, frame, fps }) => {
  const delay = BARS_START + index * BAR_STAGGER;
  const localFrame = Math.max(0, frame - delay);

  const rowOpacity = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const rowX = interpolate(localFrame, [0, 14], [-24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const barSp = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 90, mass: 0.9 },
  });
  const barWidth = interpolate(barSp, [0, 1], [0, row.pct]);

  const pctOpacity = interpolate(localFrame, [16, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Tiny star icons as label
  const starStr = "★".repeat(row.stars);

  return (
    <div
      style={{
        opacity: rowOpacity,
        transform: `translateX(${rowX}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
      }}
    >
      {/* star label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: row.color,
          letterSpacing: "0.01em",
          minWidth: 72,
          textAlign: "right",
          lineHeight: 1,
        }}
      >
        {starStr}
      </div>

      {/* bar track */}
      <div
        style={{
          flex: 1,
          height: 10,
          backgroundColor: STAR_GRAY,
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${barWidth}%`,
            backgroundColor: row.color,
            borderRadius: 6,
            boxShadow: `0 0 8px ${row.color}88`,
          }}
        />
      </div>

      {/* percentage */}
      <div
        style={{
          opacity: pctOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: row.stars >= 4 ? row.color : TEXT_MUTED,
          minWidth: 40,
          textAlign: "left",
          lineHeight: 1,
        }}
      >
        {row.pct}%
      </div>
    </div>
  );
};

// ── Divider ───────────────────────────────────────────────────────────
const Divider: React.FC<{ frame: number }> = ({ frame }) => {
  const delay = TAGLINE_START + 10;
  const localFrame = Math.max(0, frame - delay);
  const scaleX = interpolate(localFrame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width: "100%",
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent 100%)`,
        transformOrigin: "center",
        transform: `scaleX(${scaleX})`,
        opacity,
        margin: "28px 0",
      }}
    />
  );
};

// ── Product badge ─────────────────────────────────────────────────────
const ProductBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [STARS_START - 8, STARS_START + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const translateY = interpolate(
    frame,
    [STARS_START - 8, STARS_START + 10],
    [-10, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 20,
          padding: "6px 16px",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: BRAND,
            boxShadow: `0 0 6px ${BRAND}`,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#a5b4fc",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Flowbase
        </span>
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 16,
          color: TEXT_MUTED,
          letterSpacing: "0.02em",
        }}
      >
        Customer Satisfaction
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────
export const RatingStars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out
  const globalOpacity = interpolate(
    frame,
    [FADE_OUT_START, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      <BackgroundGlow frame={frame} />

      {/* Inner card */}
      <div
        style={{
          position: "relative",
          backgroundColor: SURFACE,
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: "44px 56px 48px",
          width: 560,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Top glow accent */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: "50%",
            transform: "translateX(-50%)",
            width: 240,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            borderRadius: 1,
            opacity: interpolate(
              frame,
              [STARS_START + 5 * STAR_STAGGER, STARS_START + 5 * STAR_STAGGER + 20],
              [0, 0.8],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        />

        {/* Product badge */}
        <ProductBadge frame={frame} />

        {/* Stars row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 6,
            marginBottom: 24,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <AnimatedStar
              key={i}
              index={i}
              frame={frame}
              fps={fps}
              filled={true}
            />
          ))}
        </div>

        {/* Score */}
        <ScoreCounter frame={frame} fps={fps} />

        {/* Tagline */}
        <div style={{ marginTop: 10 }}>
          <Tagline frame={frame} />
        </div>

        {/* Divider */}
        <Divider frame={frame} />

        {/* Distribution bars */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
          }}
        >
          {DISTRIBUTION.map((row, i) => (
            <BarRow
              key={row.stars}
              row={row}
              index={i}
              frame={frame}
              fps={fps}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RatingStars"
    component={RatingStars}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
  />
);
