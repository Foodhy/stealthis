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

// ─── Design tokens ────────────────────────────────────────────────────────────
const BIRTHDAY_NAME = "Alex";
const BIRTHDAY_AGE = 30;
const PALETTE = {
  yellow: "#FFD700",
  pink: "#FF69B4",
  purple: "#9B59B6",
  orange: "#FF8C00",
  blue: "#4FC3F7",
  green: "#66BB6A",
  red: "#EF5350",
  white: "#FFFFFF",
  bg: "#FFFDE7",
};

// ─── Confetti particle ────────────────────────────────────────────────────────
type ConfettiShape = "square" | "circle" | "ribbon";

interface ParticleConfig {
  id: number;
  color: string;
  shape: ConfettiShape;
  x: number;          // start x (center fraction, 0-1)
  y: number;          // start y (center fraction, 0-1)
  angle: number;      // launch angle in radians
  speed: number;      // travel speed multiplier
  size: number;       // base size px
  spinRate: number;   // rotation speed
  delay: number;      // frame delay
  wobble: number;     // horizontal wobble frequency
}

// Deterministic pseudo-random seeded by id
const seededRand = (seed: number, offset = 0): number => {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 43758.5453;
  return x - Math.floor(x);
};

const COLORS = [
  PALETTE.yellow,
  PALETTE.pink,
  PALETTE.purple,
  PALETTE.orange,
  PALETTE.blue,
  PALETTE.green,
  PALETTE.red,
];
const SHAPES: ConfettiShape[] = ["square", "circle", "ribbon"];
const PARTICLE_COUNT = 80;

const PARTICLES: ParticleConfig[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + seededRand(i, 1) * 0.4;
  return {
    id: i,
    color: COLORS[i % COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    x: 0.5 + (seededRand(i, 2) - 0.5) * 0.08,
    y: 0.52 + (seededRand(i, 3) - 0.5) * 0.06,
    angle,
    speed: 0.6 + seededRand(i, 4) * 0.9,
    size: 8 + seededRand(i, 5) * 14,
    spinRate: (seededRand(i, 6) - 0.5) * 720,
    delay: Math.floor(seededRand(i, 7) * 12),
    wobble: 1.5 + seededRand(i, 8) * 3,
  };
});

// ─── Confetti particle component ──────────────────────────────────────────────
const ConfettiParticle: React.FC<{ p: ParticleConfig; frame: number; fps: number }> = ({
  p,
  frame,
  fps,
}) => {
  const f = Math.max(0, frame - p.delay);
  const t = f / fps; // seconds elapsed

  const progress = interpolate(f, [0, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const opacity = interpolate(f, [0, 6, 70, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dist = progress * 420 * p.speed;
  const gravity = progress * progress * 180;

  const tx = 1280 * p.x + Math.cos(p.angle) * dist + Math.sin(t * p.wobble * Math.PI) * 30;
  const ty = 720 * p.y + Math.sin(p.angle) * dist * 0.6 - dist * 0.3 + gravity;
  const rotation = t * p.spinRate;

  const shapeStyle: React.CSSProperties =
    p.shape === "circle"
      ? { borderRadius: "50%", width: p.size, height: p.size }
      : p.shape === "ribbon"
      ? { borderRadius: 2, width: p.size * 0.4, height: p.size * 1.6 }
      : { borderRadius: 2, width: p.size, height: p.size };

  return (
    <div
      style={{
        position: "absolute",
        left: tx,
        top: ty,
        opacity,
        backgroundColor: p.color,
        transform: `rotate(${rotation}deg)`,
        ...shapeStyle,
      }}
    />
  );
};

// ─── Confetti burst ───────────────────────────────────────────────────────────
const ConfettiBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {PARTICLES.map((p) => (
        <ConfettiParticle key={p.id} p={p} frame={frame} fps={fps} />
      ))}
    </>
  );
};

// ─── Balloon component ────────────────────────────────────────────────────────
interface BalloonConfig {
  id: number;
  color: string;
  x: number;         // horizontal position fraction
  startY: number;    // start y px (below screen)
  endY: number;      // end y px (above visible)
  delay: number;
  wobblePhase: number;
  size: number;
}

const BALLOONS: BalloonConfig[] = [
  { id: 0, color: PALETTE.pink,   x: 0.08, startY: 780, endY: -120, delay: 5,  wobblePhase: 0,   size: 70 },
  { id: 1, color: PALETTE.yellow, x: 0.15, startY: 820, endY: -140, delay: 10, wobblePhase: 1.2, size: 80 },
  { id: 2, color: PALETTE.purple, x: 0.85, startY: 790, endY: -110, delay: 8,  wobblePhase: 2.4, size: 72 },
  { id: 3, color: PALETTE.orange, x: 0.92, startY: 830, endY: -130, delay: 15, wobblePhase: 0.7, size: 68 },
  { id: 4, color: PALETTE.blue,   x: 0.03, startY: 810, endY: -150, delay: 20, wobblePhase: 3.1, size: 60 },
  { id: 5, color: PALETTE.green,  x: 0.97, startY: 800, endY: -100, delay: 18, wobblePhase: 1.8, size: 65 },
];

const Balloon: React.FC<{ b: BalloonConfig; frame: number; fps: number }> = ({ b, frame, fps }) => {
  const f = Math.max(0, frame - b.delay);
  const t = f / fps;

  const yProgress = interpolate(f, [0, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sine),
  });

  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const currentY = b.startY + (b.endY - b.startY) * yProgress;
  const wobbleX = Math.sin(t * 2 + b.wobblePhase) * 14;

  const bx = 1280 * b.x + wobbleX;
  const bw = b.size;
  const bh = b.size * 1.15;

  // String length proportional to progress
  const stringLen = 40 + yProgress * 10;

  return (
    <div
      style={{
        position: "absolute",
        left: bx - bw / 2,
        top: currentY,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Balloon body (SVG-like with div) */}
      <div
        style={{
          width: bw,
          height: bh,
          borderRadius: "50% 50% 48% 48%",
          backgroundColor: b.color,
          boxShadow: `inset -${bw * 0.15}px -${bh * 0.1}px 0 rgba(0,0,0,0.18), inset ${bw * 0.2}px ${bh * 0.1}px 0 rgba(255,255,255,0.3)`,
          position: "relative",
        }}
      >
        {/* Shine highlight */}
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "22%",
            width: "28%",
            height: "22%",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.45)",
            transform: "rotate(-30deg)",
          }}
        />
        {/* Knot */}
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: b.color,
            filter: "brightness(0.75)",
          }}
        />
      </div>
      {/* String */}
      <div
        style={{
          width: 1.5,
          height: stringLen,
          backgroundColor: "rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
};

const BalloonLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {BALLOONS.map((b) => (
        <Balloon key={b.id} b={b} frame={frame} fps={fps} />
      ))}
    </>
  );
};

// ─── Star sparkle ─────────────────────────────────────────────────────────────
interface SparkleConfig {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
  color: string;
}

const SPARKLES: SparkleConfig[] = [
  { id: 0, x: 320, y: 120, delay: 15, size: 22, color: PALETTE.yellow },
  { id: 1, x: 960, y: 100, delay: 22, size: 18, color: PALETTE.pink },
  { id: 2, x: 180, y: 300, delay: 30, size: 16, color: PALETTE.orange },
  { id: 3, x: 1100, y: 280, delay: 25, size: 20, color: PALETTE.purple },
  { id: 4, x: 640, y: 80,  delay: 35, size: 14, color: PALETTE.blue },
  { id: 5, x: 420, y: 580, delay: 28, size: 16, color: PALETTE.green },
  { id: 6, x: 860, y: 560, delay: 32, size: 18, color: PALETTE.yellow },
];

const Sparkle: React.FC<{ s: SparkleConfig; frame: number; fps: number }> = ({ s, frame, fps }) => {
  const f = Math.max(0, frame - s.delay);
  const t = f / fps;
  const twinkle = 0.5 + 0.5 * Math.sin(t * 6 + s.id);
  const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 10, stiffness: 150 } });
  const pulse = 0.85 + 0.15 * Math.sin(t * 4 + s.id * 1.3);

  return (
    <div
      style={{
        position: "absolute",
        left: s.x,
        top: s.y,
        transform: `scale(${scale * pulse}) rotate(${t * 30}deg)`,
        opacity: twinkle * scale,
      }}
    >
      {/* 4-point star using rotated divs */}
      {[0, 45, 90, 135].map((rot) => (
        <div
          key={rot}
          style={{
            position: "absolute",
            left: -s.size / 2,
            top: -2,
            width: s.size,
            height: 4,
            backgroundColor: s.color,
            borderRadius: 2,
            transform: `rotate(${rot}deg)`,
            transformOrigin: "50% 50%",
          }}
        />
      ))}
    </div>
  );
};

const SparkleLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {SPARKLES.map((s) => (
        <Sparkle key={s.id} s={s} frame={frame} fps={fps} />
      ))}
    </>
  );
};

// ─── Happy Birthday text ───────────────────────────────────────────────────────
const HappyBirthdayText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleIn = spring({ frame, fps, from: 0, to: 1, config: { damping: 11, stiffness: 120 } });

  const letters = "Happy Birthday!".split("");

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        gap: 2,
        transform: `scale(${scaleIn})`,
      }}
    >
      {letters.map((char, i) => {
        const letterDelay = i * 2;
        const lf = Math.max(0, frame - letterDelay);
        const ls = spring({
          frame: lf,
          fps,
          from: 0,
          to: 1,
          config: { damping: 10, stiffness: 160 },
        });
        // Alternate colors for festive feel
        const color = COLORS[i % COLORS.length];

        return (
          <span
            key={i}
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: char === " " ? 24 : 88,
              color: char === " " ? "transparent" : color,
              textShadow:
                char === " "
                  ? "none"
                  : `0 4px 0 rgba(0,0,0,0.12), 0 0 20px ${color}55`,
              display: "inline-block",
              transform: `scaleY(${ls}) translateY(${(1 - ls) * -30}px)`,
              lineHeight: 1,
              letterSpacing: -1,
              WebkitTextStroke: char === " " ? "none" : "1.5px rgba(0,0,0,0.1)",
            }}
          >
            {char === " " ? " " : char}
          </span>
        );
      })}
    </div>
  );
};

// ─── Name slide-in ────────────────────────────────────────────────────────────
const NameLine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DELAY = 18;
  const f = Math.max(0, frame - DELAY);

  const slideX = spring({ frame: f, fps, from: -120, to: 0, config: { damping: 14, stiffness: 90 } });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 310,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        transform: `translateX(${slideX}px)`,
        opacity,
      }}
    >
      <span style={{ fontSize: 32, lineHeight: 1 }}>🎂</span>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 54,
          color: PALETTE.purple,
          textShadow: `0 3px 0 rgba(0,0,0,0.1), 0 0 30px ${PALETTE.purple}44`,
          letterSpacing: -1,
        }}
      >
        {BIRTHDAY_NAME}
      </span>
      <span style={{ fontSize: 32, lineHeight: 1 }}>🎂</span>
    </div>
  );
};

// ─── Age number pop ───────────────────────────────────────────────────────────
const AgeBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DELAY = 30;
  const f = Math.max(0, frame - DELAY);

  const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 8, stiffness: 180 } });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Count-up effect: age springs from 0 to BIRTHDAY_AGE
  const countProgress = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 18, stiffness: 60 } });
  const displayAge = Math.round(countProgress * BIRTHDAY_AGE);

  const t = f / fps;
  const wobble = 1 + 0.04 * Math.sin(t * 5);

  return (
    <div
      style={{
        position: "absolute",
        top: 400,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `scale(${scale * wobble})`,
      }}
    >
      {/* Decorative line left */}
      <div
        style={{
          width: 120,
          height: 3,
          background: `linear-gradient(to right, transparent, ${PALETTE.orange})`,
          borderRadius: 2,
        }}
      />

      {/* Age badge */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PALETTE.orange}, ${PALETTE.pink})`,
          borderRadius: 20,
          padding: "12px 28px",
          boxShadow: "0 8px 32px rgba(255,105,180,0.4)",
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: PALETTE.white,
            lineHeight: 1,
            textShadow: "0 4px 0 rgba(0,0,0,0.15)",
            letterSpacing: -2,
          }}
        >
          {displayAge}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: 1,
            paddingBottom: 10,
          }}
        >
          years
        </span>
      </div>

      {/* Decorative line right */}
      <div
        style={{
          width: 120,
          height: 3,
          background: `linear-gradient(to left, transparent, ${PALETTE.orange})`,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

// ─── Wishes ribbon ────────────────────────────────────────────────────────────
const WishesRibbon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DELAY = 50;
  const f = Math.max(0, frame - DELAY);

  const opacity = interpolate(f, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleY = spring({ frame: f, fps, from: 0.3, to: 1, config: { damping: 16, stiffness: 100 } });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: `translateX(-50%) scaleY(${scaleY})`,
        opacity,
        background: `linear-gradient(135deg, ${PALETTE.purple}CC, ${PALETTE.pink}CC)`,
        borderRadius: 14,
        padding: "16px 48px",
        backdropFilter: "blur(4px)",
        boxShadow: "0 4px 24px rgba(155,89,182,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: PALETTE.white,
          letterSpacing: 1,
          textShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        Wishing you an amazing day! 🥳
      </span>
    </div>
  );
};

// ─── Background ───────────────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  // Slow radial pulse on center glow
  const glowScale = 1 + 0.04 * Math.sin(t * 1.8);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #FFF9E6 0%, #FFF0F5 50%, #F5E6FF 100%)`,
      }}
    >
      {/* Center warm glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(255,215,0,0.18) 0%, rgba(255,105,180,0.1) 40%, transparent 70%)`,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
        }}
      />
      {/* Polka-dot pattern (decorative circles) */}
      {Array.from({ length: 16 }, (_, i) => {
        const px = (i % 4) * 0.25 + 0.12;
        const py = Math.floor(i / 4) * 0.25 + 0.05;
        const dotColor = COLORS[i % COLORS.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 1280 * px,
              top: 720 * py,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: dotColor,
              opacity: 0.12,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const BirthdayGreeting: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <ConfettiBurst />
      </AbsoluteFill>
      <BalloonLayer />
      <SparkleLayer />
      <HappyBirthdayText />
      <NameLine />
      <AgeBadge />
      <WishesRibbon />
    </AbsoluteFill>
  );
};

// ─── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="BirthdayGreeting"
    component={BirthdayGreeting}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
