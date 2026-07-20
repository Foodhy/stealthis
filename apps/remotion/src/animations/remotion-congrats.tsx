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

// ─── Customizable constants ──────────────────────────────────────────────────
const PERSON_NAME = "Alex Johnson";
const CONGRATS_LINE = "You did it!";

// Vibrant multicolor palette
const BG_TOP = "#fffbf0";
const BG_BOT = "#fff0f8";
const YELLOW = "#fbbf24";
const ORANGE = "#f97316";
const PINK = "#ec4899";
const PURPLE = "#a855f7";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const RED = "#ef4444";
const CYAN = "#06b6d4";
const CONFETTI_COLORS = [YELLOW, ORANGE, PINK, PURPLE, BLUE, GREEN, RED, CYAN, "#f59e0b", "#10b981"];

// ─── Deterministic pseudo-random using index as seed ─────────────────────────
function seededRand(seed: number, offset: number = 0): number {
  const s = Math.sin(seed * 9301.0 + offset * 49297.0 + 233.0) * 93458.0;
  return s - Math.floor(s);
}

// ─── Confetti piece data ─────────────────────────────────────────────────────
interface ConfettiPiece {
  id: number;
  color: string;
  shape: "square" | "circle" | "rect";
  angle: number;        // launch angle in radians
  speed: number;        // pixels per frame base
  rotSpeed: number;     // rotation degrees per frame
  initRot: number;      // initial rotation
  size: number;
  gravity: number;
  delay: number;        // frames before launch
}

const NUM_CONFETTI = 60;

const CONFETTI: ConfettiPiece[] = Array.from({ length: NUM_CONFETTI }, (_, i) => {
  const r = seededRand(i);
  const r2 = seededRand(i, 1);
  const r3 = seededRand(i, 2);
  const r4 = seededRand(i, 3);
  const r5 = seededRand(i, 4);
  const r6 = seededRand(i, 5);
  const r7 = seededRand(i, 6);
  const shapeIdx = Math.floor(r7 * 3);
  return {
    id: i,
    color: CONFETTI_COLORS[Math.floor(r * CONFETTI_COLORS.length)],
    shape: (["square", "circle", "rect"] as const)[shapeIdx],
    angle: r2 * Math.PI * 2,
    speed: 8 + r3 * 18,
    rotSpeed: (r4 - 0.5) * 12,
    initRot: r5 * 360,
    size: 10 + r6 * 22,
    gravity: 0.28 + seededRand(i, 7) * 0.18,
    delay: Math.floor(seededRand(i, 8) * 8),
  };
});

// ─── Single confetti particle ─────────────────────────────────────────────────
const ConfettiParticle: React.FC<{ piece: ConfettiPiece; frame: number }> = ({
  piece,
  frame,
}) => {
  const localFrame = Math.max(0, frame - piece.delay);
  if (localFrame <= 0) return null;

  const t = localFrame;
  const vx = Math.cos(piece.angle) * piece.speed;
  const vy = Math.sin(piece.angle) * piece.speed;
  // Physics: x = vx*t, y = vy*t + 0.5*gravity*t^2
  const x = vx * t * 0.6;
  const y = vy * t * 0.6 + 0.5 * piece.gravity * t * t;
  const rot = piece.initRot + piece.rotSpeed * t;

  const opacity = interpolate(localFrame, [0, 4, 80, 115], [0, 1, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const w = piece.shape === "rect" ? piece.size * 0.45 : piece.size;
  const h = piece.shape === "rect" ? piece.size * 1.3 : piece.size;
  const borderRadius =
    piece.shape === "circle" ? "50%" : piece.shape === "rect" ? "2px" : "3px";

  return (
    <div
      style={{
        position: "absolute",
        left: 540 + x - w / 2,
        top: 540 + y - h / 2,
        width: w,
        height: h,
        background: piece.color,
        borderRadius,
        transform: `rotate(${rot}deg)`,
        opacity,
      }}
    />
  );
};

// ─── Sparkle (SVG star) ───────────────────────────────────────────────────────
const SparkleStar: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  startFrame: number;
  frame: number;
  delay?: number;
}> = ({ x, y, size, color, startFrame, frame, delay = 0 }) => {
  const { fps } = useVideoConfig();
  const lf = frame - startFrame - delay;

  const prog = spring({
    frame: lf,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.6 },
  });
  const scale = interpolate(prog, [0, 1], [0, 1]);
  const twinkle = 1 + Math.sin(lf * 0.25) * 0.18;
  const opacity = interpolate(lf, [0, 3, 60, 90], [0, 1, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        transform: `scale(${scale * twinkle})`,
        opacity,
        filter: `drop-shadow(0 0 ${size * 0.4}px ${color})`,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

// Sparkle positions around the main text zone
const SPARKLES: { x: number; y: number; size: number; color: string; delay: number }[] = [
  { x: 160, y: 340, size: 28, color: YELLOW, delay: 0 },
  { x: 920, y: 320, size: 24, color: ORANGE, delay: 3 },
  { x: 100, y: 560, size: 20, color: PINK, delay: 6 },
  { x: 980, y: 560, size: 30, color: PURPLE, delay: 2 },
  { x: 300, y: 250, size: 18, color: BLUE, delay: 5 },
  { x: 780, y: 255, size: 22, color: GREEN, delay: 1 },
  { x: 200, y: 720, size: 26, color: RED, delay: 8 },
  { x: 870, y: 720, size: 20, color: CYAN, delay: 4 },
  { x: 470, y: 200, size: 16, color: YELLOW, delay: 7 },
  { x: 610, y: 200, size: 18, color: PINK, delay: 3 },
  { x: 130, y: 440, size: 14, color: GREEN, delay: 9 },
  { x: 950, y: 440, size: 16, color: BLUE, delay: 5 },
];

// ─── Background confetti ring burst (decorative circles/dots) ────────────────
const BackgroundBurst: React.FC<{ frame: number }> = ({ frame }) => {
  const rings = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = interpolate(frame, [0, 30], [0, 420], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const opacity = interpolate(frame, [0, 5, 25, 50], [0, 0.35, 0.25, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const x = 540 + Math.cos(angle) * dist;
    const y = 540 + Math.sin(angle) * dist;
    return { x, y, opacity, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] };
  });

  return (
    <>
      {rings.map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: r.x - 12,
            top: r.y - 12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: r.color,
            opacity: r.opacity,
            boxShadow: `0 0 20px ${r.color}`,
          }}
        />
      ))}
    </>
  );
};

// ─── Trophy SVG ───────────────────────────────────────────────────────────────
const TrophyIcon: React.FC<{ size: number; frame: number }> = ({ size, frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 20,
    fps,
    config: { damping: 11, stiffness: 160, mass: 1 },
  });
  const scale = interpolate(prog, [0, 1], [0, 1]);
  const opacity = interpolate(prog, [0, 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Subtle continuous float
  const floatY = Math.sin(frame * 0.07) * 6;
  const floatRot = Math.sin(frame * 0.045) * 4;

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${floatY}px) rotate(${floatRot}deg)`,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 8px 24px rgba(251,191,36,0.5))",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
      >
        {/* Cup body */}
        <path
          d="M28 8 H72 L68 55 C68 68 58 76 50 76 C42 76 32 68 32 55 Z"
          fill={YELLOW}
          stroke="#f59e0b"
          strokeWidth="2"
        />
        {/* Cup handles */}
        <path
          d="M28 14 C16 14 12 22 12 32 C12 42 18 48 28 48"
          fill="none"
          stroke={YELLOW}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M72 14 C84 14 88 22 88 32 C88 42 82 48 72 48"
          fill="none"
          stroke={YELLOW}
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Stem */}
        <rect x="44" y="76" width="12" height="12" fill="#f59e0b" rx="1" />
        {/* Base */}
        <rect x="34" y="88" width="32" height="6" fill={YELLOW} rx="3" />
        {/* Star on cup */}
        <path
          d="M50 22 L52.5 29 L60 29 L54 33.5 L56.5 41 L50 36.5 L43.5 41 L46 33.5 L40 29 L47.5 29 Z"
          fill="white"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};

// ─── "CONGRATULATIONS!" main text with letter-stagger bounce ─────────────────
const CongratsText: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const letters = "CONGRATULATIONS!".split("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "nowrap",
        gap: 2,
      }}
    >
      {letters.map((char, i) => {
        const startF = 35 + i * 3;
        const prog = spring({
          frame: frame - startF,
          fps,
          config: { damping: 10, stiffness: 200, mass: 0.7 },
        });
        const scale = interpolate(prog, [0, 1], [0, 1]);
        const opacity = interpolate(prog, [0, 0.15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateY = interpolate(prog, [0, 1], [60, 0]);

        // Cycle through bright colors
        const letterColors = [YELLOW, ORANGE, PINK, PURPLE, BLUE, GREEN, RED, CYAN];
        const color = char === "!" ? ORANGE : letterColors[i % letterColors.length];

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: char === "!" ? 110 : 96,
              fontWeight: 900,
              color,
              transform: `scale(${scale}) translateY(${translateY}px)`,
              opacity,
              lineHeight: 1,
              textShadow: `0 4px 20px ${color}88, 0 0 40px ${color}44`,
              WebkitTextStroke: `2px ${color}dd`,
              letterSpacing: "-1px",
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

// ─── Subtitle line ("You did it!") ───────────────────────────────────────────
const SubtitleLine: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 75,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const translateY = interpolate(prog, [0, 1], [30, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 44,
        fontWeight: 600,
        color: PURPLE,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        textShadow: `0 2px 12px ${PURPLE}55`,
      }}
    >
      {CONGRATS_LINE}
    </div>
  );
};

// ─── Name badge (slides in from bottom) ──────────────────────────────────────
const NameBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 85,
    fps,
    config: { damping: 15, stiffness: 130 },
  });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const translateY = interpolate(prog, [0, 1], [50, 0]);
  const scale = interpolate(prog, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Divider line */}
      <div
        style={{
          width: interpolate(prog, [0, 1], [0, 380], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 3,
          background: `linear-gradient(90deg, transparent, ${PINK}, ${PURPLE}, transparent)`,
          borderRadius: 2,
        }}
      />
      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          color: "#9ca3af",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        Awarded to
      </div>
      {/* Name */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 58,
          fontWeight: 800,
          background: `linear-gradient(135deg, ${PINK}, ${PURPLE}, ${BLUE})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.03em",
          lineHeight: 1.1,
          filter: "drop-shadow(0 2px 8px rgba(168,85,247,0.3))",
        }}
      >
        {PERSON_NAME}
      </div>
    </div>
  );
};

// ─── Confetti burst layer ────────────────────────────────────────────────────
const ConfettiBurst: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {CONFETTI.map((piece) => (
      <ConfettiParticle key={piece.id} piece={piece} frame={frame} />
    ))}
  </>
);

// ─── Rainbow arc / glow ring ─────────────────────────────────────────────────
const GlowRing: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 30,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const scale = interpolate(prog, [0, 1], [0.3, 1]);
  const opacity = interpolate(prog, [0, 0.3, 1], [0, 0.6, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: `conic-gradient(${YELLOW}, ${ORANGE}, ${PINK}, ${PURPLE}, ${BLUE}, ${GREEN}, ${CYAN}, ${YELLOW})`,
        filter: "blur(40px)",
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Radial burst lines ────────────────────────────────────────────────────────
const BurstLines: React.FC<{ frame: number }> = ({ frame }) => {
  const lines = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const length = interpolate(frame, [5, 25], [0, 280], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(2)),
    });
    const opacity = interpolate(frame, [5, 20, 40, 70], [0, 0.7, 0.5, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    return { angle, length, opacity, color };
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: line.length,
            height: 4,
            background: `linear-gradient(90deg, ${line.color}, transparent)`,
            borderRadius: 2,
            transform: `rotate(${line.angle}deg)`,
            transformOrigin: "0 50%",
            opacity: line.opacity,
            boxShadow: `0 0 8px ${line.color}`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const RemotionCongrats: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [108, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalOpacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, #fffef0 0%, #fff8fb 55%, #f0f4ff 100%)`,
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      {/* Soft pastel background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 25% 25%, ${YELLOW}18 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, ${PINK}18 0%, transparent 50%),
                       radial-gradient(circle at 75% 25%, ${BLUE}12 0%, transparent 50%),
                       radial-gradient(circle at 25% 75%, ${GREEN}12 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Glow ring behind center */}
      <GlowRing frame={frame} />

      {/* Burst lines from center */}
      <Sequence from={0} durationInFrames={70}>
        <BurstLines frame={frame} />
      </Sequence>

      {/* Confetti explosion */}
      <Sequence from={0} durationInFrames={120}>
        <ConfettiBurst frame={frame} />
      </Sequence>

      {/* Background burst dots */}
      <Sequence from={0} durationInFrames={55}>
        <BackgroundBurst frame={frame} />
      </Sequence>

      {/* Center content stack */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          paddingTop: 0,
        }}
      >
        {/* Trophy icon */}
        <Sequence from={15} durationInFrames={105}>
          <TrophyIcon size={120} frame={frame} />
        </Sequence>

        {/* CONGRATULATIONS! letters */}
        <Sequence from={30} durationInFrames={90}>
          <CongratsText frame={frame} />
        </Sequence>

        {/* Subtitle */}
        <Sequence from={70} durationInFrames={50}>
          <SubtitleLine frame={frame} />
        </Sequence>

        {/* Name badge */}
        <Sequence from={80} durationInFrames={40}>
          <NameBadge frame={frame} />
        </Sequence>
      </div>

      {/* Sparkles around the text zone */}
      {SPARKLES.map((sp, i) => (
        <SparkleStar
          key={i}
          x={sp.x}
          y={sp.y}
          size={sp.size}
          color={sp.color}
          startFrame={55}
          frame={frame}
          delay={sp.delay}
        />
      ))}

      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(255,255,255,0.25) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-congrats"
    component={RemotionCongrats}
    durationInFrames={120}
    fps={30}
    width={1080}
    height={1080}
  />
);
