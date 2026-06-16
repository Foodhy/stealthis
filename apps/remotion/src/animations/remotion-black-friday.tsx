import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BG = "#000000";
const ACCENT = "#facc15"; // neon yellow
const ACCENT_DIM = "#ca8a04"; // darker yellow for shadows / badges
const WHITE = "#ffffff";
const CARD_BG = "#111111";
const CARD_BORDER = "#2a2a2a";
const GLOW_COLOR = "rgba(250,204,21,0.18)";

const HEADLINE = "BLACK FRIDAY";
const SUBLINE = "STARTS NOW";
const COUNTDOWN_LABEL = "ENDS IN";
const COUNTDOWN_TIME = "24:00:00";

const DEALS = [
  {
    product: "AirPods Pro 2",
    category: "AUDIO",
    original: "$249",
    sale: "$149",
    pctOff: 40,
  },
  {
    product: 'MacBook Air 15"',
    category: "LAPTOPS",
    original: "$1,299",
    sale: "$899",
    pctOff: 31,
  },
  {
    product: "Apple Watch S9",
    category: "WEARABLES",
    original: "$399",
    sale: "$249",
    pctOff: 38,
  },
];

// Spring config presets
const SLAM_SPRING = { damping: 14, stiffness: 180, mass: 0.8 };
const CARD_SPRING = { damping: 18, stiffness: 130, mass: 0.9 };
const SUBTLE_SPRING = { damping: 22, stiffness: 90 };

// ─── BACKGROUND GLOW ─────────────────────────────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = spring({ frame, fps, from: 0, to: 1, config: SUBTLE_SPRING });

  return (
    <>
      {/* Central radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 900px 500px at 50% 55%, ${GLOW_COLOR} 0%, transparent 70%)`,
          opacity,
        }}
      />
      {/* Top-left corner streak */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(250,204,21,0.06) 0%, transparent 65%)`,
          opacity,
        }}
      />
      {/* Bottom-right streak */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -60,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%)`,
          opacity,
        }}
      />
      {/* Thin horizontal scanline accent */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${ACCENT}22 30%, ${ACCENT}44 50%, ${ACCENT}22 70%, transparent 100%)`,
          opacity: interpolate(frame, [10, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </>
  );
};

// ─── HEADLINE ────────────────────────────────────────────────────────────────
const Headline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const translateY = spring({ frame, fps, from: -220, to: 0, config: SLAM_SPRING });
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle scale overshoot feel via spring
  const scale = spring({ frame, fps, from: 1.12, to: 1, config: SLAM_SPRING });

  return (
    <div
      style={{
        position: "absolute",
        top: 58,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Decorative top bar */}
      <div
        style={{
          width: 72,
          height: 3,
          backgroundColor: ACCENT,
          marginBottom: 18,
          borderRadius: 2,
          boxShadow: `0 0 16px ${ACCENT}cc`,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 128,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: WHITE,
          textTransform: "uppercase",
          textShadow: `0 0 60px ${ACCENT}66, 0 8px 32px rgba(0,0,0,0.9), 0 0 120px ${ACCENT}33`,
        }}
      >
        {HEADLINE}
      </div>
      {/* Yellow underline slash */}
      <div
        style={{
          width: "82%",
          height: 5,
          marginTop: 12,
          background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 20%, ${ACCENT} 80%, transparent 100%)`,
          boxShadow: `0 0 24px ${ACCENT}99`,
        }}
      />
    </div>
  );
};

// ─── SUBTITLE ("STARTS NOW") ─────────────────────────────────────────────────
const Subtitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const DELAY = 18;
  const f = Math.max(0, frame - DELAY);

  const opacity = spring({ frame: f, fps, from: 0, to: 1, config: SUBTLE_SPRING });
  const translateY = spring({ frame: f, fps, from: 20, to: 0, config: SUBTLE_SPRING });

  // Pulse effect: cycles opacity between 0.7 and 1.0
  const pulseOpacity = interpolate(
    Math.sin((frame / 8) * Math.PI),
    [-1, 1],
    [0.72, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 248,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        opacity: opacity * (f > 6 ? pulseOpacity : 1),
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${ACCENT})`,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: "0.38em",
          color: ACCENT,
          textTransform: "uppercase",
          textShadow: `0 0 20px ${ACCENT}aa`,
        }}
      >
        {SUBLINE}
      </div>
      <div
        style={{
          width: 40,
          height: 2,
          background: `linear-gradient(90deg, ${ACCENT}, transparent)`,
        }}
      />
    </div>
  );
};

// ─── DEAL CARD ───────────────────────────────────────────────────────────────
const DealCard: React.FC<{
  deal: (typeof DEALS)[number];
  index: number;
  frame: number;
  fps: number;
}> = ({ deal, index, frame, fps }) => {
  const DELAY = 28 + index * 14;
  const f = Math.max(0, frame - DELAY);

  // Alternate entrance: odd from right, even from left
  const fromX = index % 2 === 0 ? -480 : 480;
  const translateX = spring({ frame: f, fps, from: fromX, to: 0, config: CARD_SPRING });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle card hover-like scale on arrival
  const scaleIn = spring({ frame: f, fps, from: 0.88, to: 1, config: CARD_SPRING });

  const CARD_WIDTH = 340;

  return (
    <div
      style={{
        transform: `translateX(${translateX}px) scale(${scaleIn})`,
        opacity,
        position: "relative",
      }}
    >
      {/* Card glow halo */}
      <div
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${ACCENT}33 0%, transparent 60%)`,
          filter: "blur(8px)",
        }}
      />

      {/* Card body */}
      <div
        style={{
          width: CARD_WIDTH,
          borderRadius: 16,
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          padding: "24px 24px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inner top-left glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 180,
            height: 80,
            background: `radial-gradient(ellipse at top left, ${ACCENT}14 0%, transparent 70%)`,
          }}
        />

        {/* Category label */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.3em",
            color: ACCENT_DIM,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {deal.category}
        </div>

        {/* Product name */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: WHITE,
            lineHeight: 1.2,
            marginBottom: 18,
          }}
        >
          {deal.product}
        </div>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          {/* Original price crossed out */}
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              fontSize: 16,
              color: "rgba(255,255,255,0.35)",
              textDecoration: "line-through",
            }}
          >
            {deal.original}
          </div>
          {/* Sale price */}
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: 36,
              color: ACCENT,
              lineHeight: 1,
              textShadow: `0 0 16px ${ACCENT}77`,
            }}
          >
            {deal.sale}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${ACCENT}55 0%, transparent 80%)`,
            marginTop: 16,
            marginBottom: 0,
          }}
        />

        {/* Percentage badge — top-right */}
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: ACCENT,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 20px ${ACCENT}99, 0 0 40px ${ACCENT}44`,
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: 15,
              color: "#000",
              lineHeight: 1,
            }}
          >
            -{deal.pctOff}%
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 9,
              color: "#000",
              letterSpacing: "0.05em",
              marginTop: 1,
            }}
          >
            OFF
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DEAL GRID ───────────────────────────────────────────────────────────────
const DealGrid: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 28,
        alignItems: "stretch",
      }}
    >
      {DEALS.map((deal, i) => (
        <DealCard key={i} deal={deal} index={i} frame={frame} fps={fps} />
      ))}
    </div>
  );
};

// ─── COUNTDOWN TIMER ─────────────────────────────────────────────────────────
const CountdownTimer: React.FC<{ frame: number; fps: number; durationInFrames: number }> = ({
  frame,
  fps,
  durationInFrames,
}) => {
  const DELAY = 44;
  const f = Math.max(0, frame - DELAY);

  const opacity = spring({ frame: f, fps, from: 0, to: 1, config: SUBTLE_SPRING });
  const translateY = spring({ frame: f, fps, from: 30, to: 0, config: SUBTLE_SPRING });

  // Tick pulse: every 30 frames (1 second at 30fps) a brief brightness spike
  const tickPhase = frame % 30;
  const tickGlow = interpolate(tickPhase, [0, 4, 8], [1.0, 1.6, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Top line */}
      <div
        style={{
          width: 420,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${ACCENT}55 25%, ${ACCENT}55 75%, transparent 100%)`,
          marginBottom: 14,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Label */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.35em",
            color: "rgba(255,255,255,0.45)",
            textTransform: "uppercase",
          }}
        >
          {COUNTDOWN_LABEL}
        </div>
        {/* Time display */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: "0.12em",
            color: ACCENT,
            textShadow: `0 0 ${10 * tickGlow}px ${ACCENT}cc, 0 0 ${28 * tickGlow}px ${ACCENT}66`,
            lineHeight: 1,
          }}
        >
          {COUNTDOWN_TIME}
        </div>
      </div>
      {/* Bottom line */}
      <div
        style={{
          width: 420,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${ACCENT}33 25%, ${ACCENT}33 75%, transparent 100%)`,
          marginTop: 14,
        }}
      />
    </div>
  );
};

// ─── MAIN COMPOSITION ────────────────────────────────────────────────────────
export const BlackFridayDeal: React.FC = () => {
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
    <AbsoluteFill style={{ backgroundColor: BG, opacity: globalOpacity }}>
      {/* Layer 0: Background glow effects */}
      <BackgroundGlow frame={frame} fps={fps} />

      {/* Layer 1: Headline */}
      <Headline frame={frame} fps={fps} />

      {/* Layer 2: Subtitle pulse */}
      <Subtitle frame={frame} fps={fps} />

      {/* Layer 3: Deal cards grid */}
      <DealGrid frame={frame} fps={fps} />

      {/* Layer 4: Countdown timer */}
      <CountdownTimer frame={frame} fps={fps} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ───────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BlackFridayDeal"
      component={BlackFridayDeal}
      durationInFrames={120}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
