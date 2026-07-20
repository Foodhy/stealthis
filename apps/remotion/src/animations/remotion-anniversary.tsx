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
const NAME_LEFT = "Alex";
const NAME_RIGHT = "Jordan";
const YEARS = 5;
const YEARS_LABEL = `${YEARS} Years`;
const DURATION_FRAMES = 150;

// Warm palette
const BG_TOP = "#1a0a00";
const BG_MID = "#3d1a08";
const BG_BOT = "#1a0a00";
const AMBER = "#f59e0b";
const AMBER_LIGHT = "#fde68a";
const AMBER_GLOW = "#fbbf24";
const ROSE = "#f43f5e";
const ROSE_LIGHT = "#fda4af";
const DUSTY_ROSE = "#e87c8d";
const WARM_WHITE = "#fff8f0";
const CREAM = "#fef3c7";

// Particle data: [xPct, yPct, size, speed, phase]
const PARTICLES: [number, number, number, number, number][] = [
  [5, 15, 4, 0.9, 0],
  [12, 70, 3, 1.2, 8],
  [22, 35, 5, 0.7, 3],
  [30, 85, 3, 1.4, 15],
  [42, 20, 4, 1.0, 5],
  [55, 60, 6, 0.6, 12],
  [65, 10, 3, 1.1, 20],
  [73, 80, 4, 0.85, 2],
  [83, 45, 5, 1.3, 9],
  [90, 25, 3, 0.95, 18],
  [95, 65, 4, 0.75, 6],
  [17, 50, 3, 1.05, 22],
  [47, 90, 4, 1.15, 11],
  [60, 30, 3, 0.8, 25],
  [78, 55, 5, 1.2, 4],
];

// Timeline dot data
const TIMELINE_DOTS: { label: string; sub: string; color: string }[] = [
  { label: "Past", sub: "Where we began", color: AMBER },
  { label: "Present", sub: "Where we are", color: ROSE },
  { label: "Future", sub: "Where we'll go", color: DUSTY_ROSE },
];

// ─── Floating particle ───────────────────────────────────────────────────────
const FloatingParticle: React.FC<{
  xPct: number;
  yPct: number;
  size: number;
  speed: number;
  phase: number;
  frame: number;
}> = ({ xPct, yPct, size, speed, phase, frame }) => {
  const f = frame + phase * 3;
  const floatY = Math.sin((f * 0.04 * speed) % (Math.PI * 2)) * 18;
  const floatX = Math.cos((f * 0.025 * speed) % (Math.PI * 2)) * 10;

  const opacity = interpolate(frame, [0, 20], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Alternating warm amber and rose tint
  const color = (xPct + yPct) % 2 === 0 ? AMBER_GLOW : ROSE_LIGHT;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: `translate(${floatX}px, ${floatY}px)`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity: opacity * fadeOut,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
    />
  );
};

// ─── Glowing orb background accent ───────────────────────────────────────────
const GlowOrb: React.FC<{
  x: number;
  y: number;
  radius: number;
  color: string;
  startFrame: number;
  frame: number;
}> = ({ x, y, radius, color, startFrame, frame }) => {
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 40, mass: 1 },
  });
  const pulseScale =
    1 + Math.sin(((frame - startFrame) * 0.05) % (Math.PI * 2)) * 0.06;

  return (
    <div
      style={{
        position: "absolute",
        left: x - radius * pulseScale,
        top: y - radius * pulseScale,
        width: radius * 2 * pulseScale,
        height: radius * 2 * pulseScale,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
        opacity: progress * 0.6,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Title: "Happy Anniversary" sweep-in ─────────────────────────────────────
const TitleScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 120, mass: 1 },
  });
  const titleX = interpolate(titleProgress, [0, 1], [-200, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Subtitle fade in slightly later
  const subProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const subOpacity = interpolate(subProgress, [0, 1], [0, 1]);
  const subY = interpolate(subProgress, [0, 1], [20, 0]);

  // Decorative line expanding
  const lineProgress = spring({
    frame: frame - 22,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 220]);

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Decorative top flourish */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: subOpacity,
        }}
      >
        <div
          style={{
            height: 1,
            width: lineWidth,
            background: `linear-gradient(90deg, transparent, ${AMBER_LIGHT}, transparent)`,
          }}
        />
        <span style={{ color: AMBER_LIGHT, fontSize: 20, lineHeight: 1 }}>
          ✦
        </span>
        <div
          style={{
            height: 1,
            width: lineWidth,
            background: `linear-gradient(90deg, transparent, ${AMBER_LIGHT}, transparent)`,
          }}
        />
      </div>

      {/* Main title */}
      <div
        style={{
          transform: `translateX(${titleX}px)`,
          opacity: titleOpacity,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 78,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: WARM_WHITE,
          textShadow: `0 0 60px ${AMBER}99, 0 2px 20px rgba(0,0,0,0.5)`,
          lineHeight: 1,
        }}
      >
        Happy Anniversary
      </div>

      {/* Subtitle */}
      <div
        style={{
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 22,
          letterSpacing: "0.35em",
          color: AMBER_LIGHT,
          textTransform: "uppercase",
        }}
      >
        A love worth celebrating
      </div>
    </div>
  );
};

// ─── Year badge: scale-in with bounce ────────────────────────────────────────
const YearBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const scaleProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 11, stiffness: 180, mass: 1 },
  });
  const scale = interpolate(scaleProgress, [0, 1], [0, 1]);
  const opacity = interpolate(scaleProgress, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle continuous pulse
  const pulse =
    1 + Math.sin(((frame - 45) * 0.07) % (Math.PI * 2)) * 0.025;

  return (
    <div
      style={{
        position: "absolute",
        top: 280,
        left: "50%",
        transform: `translateX(-50%) scale(${scale * pulse})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Ring */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: `3px solid ${AMBER}`,
          boxShadow: `0 0 30px ${AMBER}66, inset 0 0 40px ${AMBER}22`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle, ${BG_MID}ee 40%, transparent 100%)`,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 58,
            fontWeight: 700,
            color: AMBER_GLOW,
            lineHeight: 1,
            textShadow: `0 0 20px ${AMBER}`,
          }}
        >
          {YEARS}
        </div>
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 16,
            letterSpacing: "0.2em",
            color: CREAM,
            textTransform: "uppercase",
          }}
        >
          Years
        </div>
      </div>
    </div>
  );
};

// ─── SVG Heart ────────────────────────────────────────────────────────────────
const HeartShape: React.FC<{
  size: number;
  color: string;
  opacity: number;
  glowColor?: string;
}> = ({ size, color, opacity, glowColor }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ filter: glowColor ? `drop-shadow(0 0 8px ${glowColor})` : undefined, opacity }}
  >
    <path
      d="M50 85 C50 85 10 58 10 32 C10 18 20 8 35 8 C43 8 50 15 50 15 C50 15 57 8 65 8 C80 8 90 18 90 32 C90 58 50 85 50 85 Z"
      fill={color}
    />
  </svg>
);

// ─── Names + Heart nameplate ──────────────────────────────────────────────────
const NamePlate: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Left name
  const leftProgress = spring({
    frame: frame - 65,
    fps,
    config: { damping: 15, stiffness: 110 },
  });
  const leftX = interpolate(leftProgress, [0, 1], [-120, 0]);
  const leftOpacity = interpolate(leftProgress, [0, 1], [0, 1]);

  // Right name
  const rightProgress = spring({
    frame: frame - 72,
    fps,
    config: { damping: 15, stiffness: 110 },
  });
  const rightX = interpolate(rightProgress, [0, 1], [120, 0]);
  const rightOpacity = interpolate(rightProgress, [0, 1], [0, 1]);

  // Heart
  const heartProgress = spring({
    frame: frame - 80,
    fps,
    config: { damping: 11, stiffness: 160 },
  });
  const heartScale = interpolate(heartProgress, [0, 1], [0, 1]);
  const heartOpacity = interpolate(heartProgress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing heart at the very end (frame > 120)
  const endPulse =
    frame > 120
      ? 1 +
        Math.sin(((frame - 120) * 0.18) % (Math.PI * 2)) * 0.12
      : 1;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {/* Left name */}
      <div
        style={{
          transform: `translateX(${leftX}px)`,
          opacity: leftOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 42,
            fontWeight: 600,
            color: WARM_WHITE,
            textShadow: `0 0 20px ${AMBER}66`,
            letterSpacing: "0.05em",
          }}
        >
          {NAME_LEFT}
        </div>
        <div
          style={{
            height: 2,
            width: "100%",
            background: `linear-gradient(90deg, transparent, ${AMBER_LIGHT})`,
            borderRadius: 1,
          }}
        />
      </div>

      {/* Heart */}
      <div
        style={{
          transform: `scale(${heartScale * endPulse})`,
          opacity: heartOpacity,
          flexShrink: 0,
        }}
      >
        <HeartShape
          size={52}
          color={ROSE}
          opacity={1}
          glowColor={ROSE_LIGHT}
        />
      </div>

      {/* Right name */}
      <div
        style={{
          transform: `translateX(${rightX}px)`,
          opacity: rightOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 42,
            fontWeight: 600,
            color: WARM_WHITE,
            textShadow: `0 0 20px ${AMBER}66`,
            letterSpacing: "0.05em",
          }}
        >
          {NAME_RIGHT}
        </div>
        <div
          style={{
            height: 2,
            width: "100%",
            background: `linear-gradient(90deg, ${AMBER_LIGHT}, transparent)`,
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  );
};

// ─── Timeline dots: Past / Present / Future ───────────────────────────────────
const TimelineScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Track line
  const lineProgress = spring({
    frame: frame - 88,
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 480]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Connector line */}
      <div
        style={{
          position: "relative",
          width: 480,
          height: 2,
          background: `linear-gradient(90deg, ${AMBER}44, ${ROSE}44)`,
          borderRadius: 1,
          overflow: "visible",
        }}
      >
        {/* Animated fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: lineWidth,
            height: "100%",
            background: `linear-gradient(90deg, ${AMBER}, ${ROSE})`,
            borderRadius: 1,
          }}
        />
      </div>

      {/* Dots row */}
      <div
        style={{
          display: "flex",
          gap: 160,
          alignItems: "flex-start",
          marginTop: -38,
        }}
      >
        {TIMELINE_DOTS.map((dot, i) => {
          const dotProgress = spring({
            frame: frame - (90 + i * 12),
            fps,
            config: { damping: 13, stiffness: 130 },
          });
          const dotScale = interpolate(dotProgress, [0, 1], [0, 1]);
          const dotOpacity = interpolate(dotProgress, [0, 0.3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const textOpacity = interpolate(dotProgress, [0.4, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={dot.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: dotOpacity,
                transform: `scale(${dotScale})`,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: dot.color,
                  boxShadow: `0 0 14px ${dot.color}`,
                  border: `2px solid ${WARM_WHITE}33`,
                }}
              />
              {/* Labels */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  opacity: textOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: dot.color,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {dot.label}
                </span>
                <span
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: 12,
                    color: WARM_WHITE,
                    opacity: 0.65,
                    letterSpacing: "0.05em",
                  }}
                >
                  {dot.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Final pulsing hearts burst ───────────────────────────────────────────────
const HeartsBurst: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  if (frame < 115) return null;

  const localFrame = frame - 115;

  // Small orbiting hearts
  const hearts = [
    { angle: 0, dist: 110, size: 22, delay: 0 },
    { angle: 60, dist: 130, size: 16, delay: 4 },
    { angle: 120, dist: 100, size: 20, delay: 8 },
    { angle: 180, dist: 125, size: 18, delay: 2 },
    { angle: 240, dist: 108, size: 14, delay: 6 },
    { angle: 300, dist: 118, size: 24, delay: 3 },
  ];

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
      {hearts.map((h, i) => {
        const prog = spring({
          frame: localFrame - h.delay,
          fps,
          config: { damping: 13, stiffness: 100 },
        });
        const orbitAngle =
          ((h.angle + localFrame * 0.8) * Math.PI) / 180;
        const x = Math.cos(orbitAngle) * h.dist * prog;
        const y = Math.sin(orbitAngle) * h.dist * prog;
        const op = interpolate(prog, [0, 0.3], [0, 0.75], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fadeOut = interpolate(frame, [140, 150], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              transform: `translate(${x - h.size / 2}px, ${y - h.size / 2}px)`,
              opacity: op * fadeOut,
            }}
          >
            <HeartShape
              size={h.size}
              color={i % 2 === 0 ? ROSE : AMBER_GLOW}
              opacity={1}
              glowColor={i % 2 === 0 ? ROSE_LIGHT : AMBER_LIGHT}
            />
          </div>
        );
      })}
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const RemotionAnniversary: React.FC = () => {
  const frame = useCurrentFrame();

  // Global fade-out
  const fadeOut = interpolate(frame, [135, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Overall fade-in
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${BG_MID} 0%, ${BG_TOP} 60%, ${BG_BOT} 100%)`,
        overflow: "hidden",
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Background ambient glows */}
      <GlowOrb x={200} y={180} radius={260} color={AMBER} startFrame={0} frame={frame} />
      <GlowOrb x={1080} y={540} radius={200} color={ROSE} startFrame={10} frame={frame} />
      <GlowOrb x={640} y={360} radius={180} color={AMBER_LIGHT} startFrame={5} frame={frame} />

      {/* Floating particles */}
      {PARTICLES.map(([xPct, yPct, size, speed, phase], i) => (
        <FloatingParticle
          key={i}
          xPct={xPct}
          yPct={yPct}
          size={size}
          speed={speed}
          phase={phase}
          frame={frame}
        />
      ))}

      {/* Title sweep-in (frames 5–40) */}
      <Sequence from={0} durationInFrames={DURATION_FRAMES}>
        <TitleScene frame={frame} />
      </Sequence>

      {/* Year badge bounce-in (frames 45–90) */}
      <Sequence from={40} durationInFrames={DURATION_FRAMES - 40}>
        <YearBadge frame={frame} />
      </Sequence>

      {/* Names + heart (frames 65–120) */}
      <Sequence from={60} durationInFrames={DURATION_FRAMES - 60}>
        <NamePlate frame={frame} />
      </Sequence>

      {/* Timeline dots (frames 88–130) */}
      <Sequence from={85} durationInFrames={DURATION_FRAMES - 85}>
        <TimelineScene frame={frame} />
      </Sequence>

      {/* Hearts burst at the end (frames 115–150) */}
      <Sequence from={115} durationInFrames={35}>
        <HeartsBurst frame={frame} />
      </Sequence>

      {/* Vignette overlay */}
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

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-anniversary"
    component={RemotionAnniversary}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1280}
    height={720}
  />
);
