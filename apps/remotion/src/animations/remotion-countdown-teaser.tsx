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

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  // Countdown values displayed in the blocks
  days: "07",
  hours: "14",
  minutes: "32",

  // Copy
  titleText: "SOMETHING BIG IS COMING",
  eventName: "STEALTHIS 2.0 LAUNCH",

  // Brand accent color
  accent: "#6366f1",
  accentGlow: "rgba(99,102,241,0.6)",
  accentDim: "rgba(99,102,241,0.15)",

  // Background
  bgColor: "#0a0a12",
  cardBg: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.12)",

  // Typography
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.45)",

  // Flip timing per block (frame at which the flip occurs)
  flipFrames: [40, 60, 80] as const,

  // Duration
  totalFrames: 300,
  fps: 30,
};

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Pulsing glow: opacity cycles 0.3 → 0.8 → 0.3 over ~3 seconds
  const glowOpacity = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 3));

  // Slow scale breath
  const glowScale = 1 + 0.08 * Math.sin((t * Math.PI * 2) / 4);

  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.bgColor, overflow: "hidden" }}>
      {/* Primary radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${CONFIG.accent} 0%, rgba(99,102,241,0.3) 40%, transparent 70%)`,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          opacity: glowOpacity,
          filter: "blur(60px)",
        }}
      />
      {/* Secondary soft top glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 65%)`,
          transform: "translateX(-50%)",
          filter: "blur(80px)",
        }}
      />
      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: -180,
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 65%)`,
          transform: "translateX(-50%)",
          filter: "blur(60px)",
        }}
      />
      {/* Subtle grid overlay */}
      {Array.from({ length: 18 }, (_, i) => (
        <div
          key={`h-${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * (1920 / 17),
            height: 1,
            backgroundColor: "rgba(99,102,241,0.06)",
          }}
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={`v-${i}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: i * (1080 / 9),
            width: 1,
            backgroundColor: "rgba(99,102,241,0.06)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ─── STAGGERED TITLE ──────────────────────────────────────────────────────────
const TitleText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const letters = CONFIG.titleText.split("");

  return (
    <div
      style={{
        position: "absolute",
        top: 180,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0,
        padding: "0 60px",
      }}
    >
      {letters.map((char, i) => {
        const delay = i * 2;
        const f = Math.max(0, frame - delay);

        const slideY = spring({
          frame: f,
          fps,
          from: -80,
          to: 0,
          config: { damping: 14, stiffness: 130 },
        });

        const opacity = interpolate(f, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        if (char === " ") {
          return <span key={i} style={{ width: 16, display: "inline-block" }} />;
        }

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: CONFIG.fontFamily,
              fontWeight: 900,
              fontSize: 68,
              letterSpacing: 4,
              color: CONFIG.white,
              transform: `translateY(${slideY}px)`,
              opacity,
              textShadow: `0 0 30px ${CONFIG.accentGlow}`,
              lineHeight: 1.1,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

// ─── FLIP NUMBER BLOCK ────────────────────────────────────────────────────────
interface NumberBlockProps {
  value: string;
  label: string;
  flipFrame: number;
  delayIn: number;
  pulsingRing?: boolean;
}

const NumberBlock: React.FC<NumberBlockProps> = ({
  value,
  label,
  flipFrame,
  delayIn,
  pulsingRing = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const f = Math.max(0, frame - delayIn);
  const entranceScale = spring({
    frame: f,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 12, stiffness: 140 },
  });
  const entranceOpacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flip animation: scaleY 1 → 0 → 1 centered on flipFrame
  const FLIP_HALF = 6; // frames for each half of the flip
  const scaleY = (() => {
    if (frame < flipFrame - FLIP_HALF) return 1;
    if (frame <= flipFrame) {
      return interpolate(frame, [flipFrame - FLIP_HALF, flipFrame], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.quad),
      });
    }
    if (frame <= flipFrame + FLIP_HALF) {
      return interpolate(frame, [flipFrame, flipFrame + FLIP_HALF], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      });
    }
    return 1;
  })();

  // Pulsing ring
  const t = frame / fps;
  const ringScale = 1 + 0.12 * Math.sin(t * Math.PI * 2 * 1.2);
  const ringOpacity = interpolate(f, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * (0.4 + 0.3 * Math.sin(t * Math.PI * 2 * 1.2));

  const BLOCK_SIZE = 220;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity: entranceOpacity,
        transform: `scale(${entranceScale})`,
      }}
    >
      {/* Ring + card wrapper */}
      <div style={{ position: "relative", width: BLOCK_SIZE, height: BLOCK_SIZE }}>
        {/* Pulsing ring */}
        {pulsingRing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: BLOCK_SIZE + 40,
              height: BLOCK_SIZE + 40,
              borderRadius: 28,
              border: `3px solid ${CONFIG.accent}`,
              transform: `translate(-50%, -50%) scale(${ringScale})`,
              opacity: ringOpacity,
              boxShadow: `0 0 24px ${CONFIG.accentGlow}`,
            }}
          />
        )}

        {/* Second outer ring */}
        {pulsingRing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: BLOCK_SIZE + 80,
              height: BLOCK_SIZE + 80,
              borderRadius: 36,
              border: `1.5px solid ${CONFIG.accent}`,
              transform: `translate(-50%, -50%) scale(${ringScale * 0.92})`,
              opacity: ringOpacity * 0.5,
            }}
          />
        )}

        {/* Number card */}
        <div
          style={{
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            borderRadius: 20,
            backgroundColor: CONFIG.cardBg,
            border: `1px solid ${CONFIG.cardBorder}`,
            backdropFilter: "blur(8px)",
            boxShadow: `0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scaleY(${scaleY})`,
            transformOrigin: "50% 50%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Accent top border highlight */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${CONFIG.accent}, transparent)`,
              borderRadius: "20px 20px 0 0",
            }}
          />

          {/* Center line separator (split-flap feel) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 12,
              right: 12,
              height: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          />

          <span
            style={{
              fontFamily: CONFIG.fontFamily,
              fontWeight: 900,
              fontSize: 120,
              color: CONFIG.white,
              lineHeight: 1,
              letterSpacing: -4,
              textShadow: `0 0 40px ${CONFIG.accentGlow}, 0 4px 0 rgba(0,0,0,0.3)`,
            }}
          >
            {value}
          </span>
        </div>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: CONFIG.fontFamily,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 8,
          color: CONFIG.muted,
          textTransform: "uppercase" as const,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── NUMBER BLOCKS ROW ────────────────────────────────────────────────────────
const CountdownBlocks: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 680,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 32,
      }}
    >
      {/* Separator dots */}
      <NumberBlock
        value={CONFIG.days}
        label="DAYS"
        flipFrame={CONFIG.flipFrames[0]}
        delayIn={20}
        pulsingRing
      />

      {/* Colon separator */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          paddingTop: 70,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: CONFIG.accent,
              boxShadow: `0 0 12px ${CONFIG.accentGlow}`,
            }}
          />
        ))}
      </div>

      <NumberBlock
        value={CONFIG.hours}
        label="HOURS"
        flipFrame={CONFIG.flipFrames[1]}
        delayIn={35}
      />

      {/* Colon separator */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          paddingTop: 70,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: CONFIG.accent,
              boxShadow: `0 0 12px ${CONFIG.accentGlow}`,
            }}
          />
        ))}
      </div>

      <NumberBlock
        value={CONFIG.minutes}
        label="MINUTES"
        flipFrame={CONFIG.flipFrames[2]}
        delayIn={50}
      />
    </div>
  );
};

// ─── EVENT NAME BANNER ────────────────────────────────────────────────────────
const EventBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DELAY = 70;
  const f = Math.max(0, frame - DELAY);

  const ruleWidth = interpolate(f, [0, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const textScale = spring({
    frame: f,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 14, stiffness: 100 },
  });

  const textOpacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 220,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      {/* Glowing horizontal rule */}
      <div
        style={{
          width: `${ruleWidth}%`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${CONFIG.accent}, rgba(139,92,246,0.8), transparent)`,
          boxShadow: `0 0 16px ${CONFIG.accentGlow}, 0 0 32px ${CONFIG.accentDim}`,
          borderRadius: 1,
        }}
      />

      {/* Event name */}
      <div
        style={{
          opacity: textOpacity,
          transform: `scale(${textScale})`,
          textAlign: "center" as const,
          padding: "0 60px",
        }}
      >
        <span
          style={{
            fontFamily: CONFIG.fontFamily,
            fontWeight: 900,
            fontSize: 56,
            letterSpacing: 6,
            color: CONFIG.white,
            textTransform: "uppercase" as const,
            textShadow: `0 0 40px ${CONFIG.accentGlow}, 0 4px 0 rgba(0,0,0,0.4)`,
            lineHeight: 1.2,
          }}
        >
          {CONFIG.eventName}
        </span>
      </div>

      {/* Sub-label */}
      <div style={{ opacity: textOpacity * 0.7 }}>
        <span
          style={{
            fontFamily: CONFIG.fontFamily,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: 12,
            color: CONFIG.muted,
            textTransform: "uppercase" as const,
          }}
        >
          COMING SOON
        </span>
      </div>
    </div>
  );
};

// ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
interface ParticleDef {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

const seeded = (s: number, o = 0): number => {
  const x = Math.sin(s * 9301 + o * 49297 + 233) * 43758.5453;
  return x - Math.floor(x);
};

const PARTICLES: ParticleDef[] = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: seeded(i, 0) * 1080,
  y: seeded(i, 1) * 1920,
  size: 2 + seeded(i, 2) * 4,
  speed: 0.3 + seeded(i, 3) * 0.8,
  phase: seeded(i, 4) * Math.PI * 2,
}));

const FloatingParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <>
      {PARTICLES.map((p) => {
        const drift = Math.sin(t * p.speed + p.phase) * 18;
        const twinkle = 0.3 + 0.35 * Math.sin(t * 2.5 + p.phase);
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x + drift,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: CONFIG.accent,
              opacity: twinkle,
              boxShadow: `0 0 ${p.size * 3}px ${CONFIG.accent}`,
            }}
          />
        );
      })}
    </>
  );
};

// ─── TOP EYEBROW ──────────────────────────────────────────────────────────────
const TopEyebrow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const f = Math.max(0, frame - 5);
  const opacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slideY = spring({
    frame: f,
    fps,
    from: -30,
    to: 0,
    config: { damping: 16, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `translateY(${slideY}px)`,
      }}
    >
      {/* Left line */}
      <div
        style={{
          flex: 1,
          maxWidth: 120,
          height: 1,
          background: `linear-gradient(to right, transparent, ${CONFIG.muted})`,
          marginLeft: 80,
        }}
      />
      <span
        style={{
          fontFamily: CONFIG.fontFamily,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: 10,
          color: CONFIG.muted,
          textTransform: "uppercase" as const,
        }}
      >
        MARK YOUR CALENDAR
      </span>
      {/* Right line */}
      <div
        style={{
          flex: 1,
          maxWidth: 120,
          height: 1,
          background: `linear-gradient(to left, transparent, ${CONFIG.muted})`,
          marginRight: 80,
        }}
      />
    </div>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
export const CountdownTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <FloatingParticles />
      <TopEyebrow />
      <TitleText />
      <CountdownBlocks />
      <EventBanner />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="CountdownTeaser"
    component={CountdownTeaser}
    durationInFrames={CONFIG.totalFrames}
    fps={CONFIG.fps}
    width={1080}
    height={1920}
  />
);
