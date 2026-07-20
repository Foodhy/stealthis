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

// ── Brand / theme ──────────────────────────────────────────────────────
const YEAR = "2025";
const COMPANY = "Orion Labs";
const TAGLINE = "A Year of Bold Moves";

// ── Color palette ──────────────────────────────────────────────────────
const PALETTE = {
  bg: "#04060f",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  gold: "#f59e0b",
  goldLight: "#fcd34d",
  cyan: "#06b6d4",
  emerald: "#10b981",
  rose: "#f43f5e",
  white: "#ffffff",
  dim: "rgba(255,255,255,0.45)",
  dimmer: "rgba(255,255,255,0.25)",
};

// ── Seeded deterministic "random" ──────────────────────────────────────
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Particle burst data ─────────────────────────────────────────────────
interface Particle {
  angle: number;
  speed: number;
  size: number;
  color: string;
  delay: number;
}

const PARTICLE_COLORS = [
  PALETTE.gold,
  PALETTE.goldLight,
  PALETTE.indigo,
  PALETTE.violet,
  PALETTE.cyan,
  PALETTE.rose,
];

const PARTICLES: Particle[] = Array.from({ length: 48 }, (_, i) => ({
  angle: (i / 48) * Math.PI * 2 + seededRand(i * 3) * 0.4,
  speed: 80 + seededRand(i * 7) * 220,
  size: 3 + seededRand(i * 11) * 9,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  delay: Math.floor(seededRand(i * 17) * 12),
}));

// ── Stats ───────────────────────────────────────────────────────────────
interface Stat {
  label: string;
  value: number;
  formatted: string;
  icon: string;
  color: string;
}

const STATS: Stat[] = [
  { label: "Commits Shipped", value: 4_812, formatted: "4,812", icon: "⬡", color: PALETTE.indigo },
  { label: "Launches", value: 24, formatted: "24", icon: "◈", color: PALETTE.gold },
  { label: "Active Users", value: 186_000, formatted: "186K", icon: "◎", color: PALETTE.emerald },
];

// ── Moments ─────────────────────────────────────────────────────────────
interface Moment {
  month: string;
  title: string;
  caption: string;
  bg: string;
  accent: string;
}

const MOMENTS: Moment[] = [
  {
    month: "March",
    title: "v2 Launch",
    caption: "Shipped the biggest release in company history",
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    accent: PALETTE.indigo,
  },
  {
    month: "July",
    title: "1M Requests / Day",
    caption: "Crossed the million-request milestone",
    bg: "linear-gradient(135deg, #1c1917 0%, #78350f 100%)",
    accent: PALETTE.gold,
  },
  {
    month: "November",
    title: "Team Doubles",
    caption: "Grew from 12 to 24 talented people",
    bg: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
    accent: PALETTE.emerald,
  },
];

// ── Arrow SVG path ───────────────────────────────────────────────────────
// Drawn purely with divs and borders — no SVG import needed

// ── Utility: cross-section opacity ─────────────────────────────────────
function sectionOpacity(
  frame: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number
): number {
  return interpolate(frame, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
}

// ── Shared background layer ─────────────────────────────────────────────
const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 55%),
                   radial-gradient(ellipse at 75% 80%, rgba(245,158,11,0.06) 0%, transparent 50%),
                   ${PALETTE.bg}`,
      overflow: "hidden",
    }}
  >
    {/* Subtle grid lines */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />
    {/* Vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  </AbsoluteFill>
);

// ── Scene 1: Year number + particle burst (frames 0–80) ─────────────────
const ParticleBurstEl: React.FC<{
  particle: Particle;
  frame: number;
}> = ({ particle, frame }) => {
  const f = Math.max(0, frame - particle.delay);
  const progress = spring({
    frame: f,
    fps: 30,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 120, mass: 0.6 },
  });

  const dist = progress * particle.speed;
  const x = Math.cos(particle.angle) * dist;
  const y = Math.sin(particle.angle) * dist;

  const opacity = interpolate(progress, [0, 0.15, 0.7, 1], [0, 1, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        background: particle.color,
        opacity,
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}88`,
      }}
    />
  );
};

const SceneYear: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = sectionOpacity(frame, 0, 20, 68, 80);

  // Year number springs in
  const yearScale = spring({
    frame,
    fps,
    from: 0.3,
    to: 1,
    config: { damping: 13, stiffness: 130, mass: 1 },
  });

  const yearOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Company / tagline stagger
  const tagOpacity = interpolate(frame, [20, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [20, 36], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Gold line width
  const lineW = interpolate(frame, [16, 40], [0, 280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Particle burst layer */}
      {PARTICLES.map((p, i) => (
        <ParticleBurstEl key={i} particle={p} frame={frame} />
      ))}

      {/* Giant year */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 200,
          letterSpacing: "-0.06em",
          lineHeight: 1,
          opacity: yearOpacity,
          transform: `scale(${yearScale})`,
          background: `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.goldLight} 35%, ${PALETTE.indigo} 70%, ${PALETTE.violet} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          userSelect: "none",
          position: "relative",
          zIndex: 2,
        }}
      >
        {YEAR}
      </div>

      {/* Gold divider */}
      <div
        style={{
          width: lineW,
          height: 3,
          background: `linear-gradient(90deg, ${PALETTE.gold}, ${PALETTE.violet})`,
          borderRadius: 3,
          marginTop: 12,
          marginBottom: 20,
          opacity: tagOpacity,
          zIndex: 2,
        }}
      />

      {/* Company + tagline */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: PALETTE.white,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {COMPANY}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 18,
            color: PALETTE.dim,
            letterSpacing: "0.06em",
          }}
        >
          {TAGLINE}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Top Highlights + 3 stat cards (frames 80–175) ─────────────
interface StatCardProps {
  stat: Stat;
  index: number;
  localFrame: number;
  fps: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, index, localFrame, fps }) => {
  const STAGGER = 14;
  const delay = 18 + index * STAGGER;
  const f = Math.max(0, localFrame - delay);

  const cardOpacity = interpolate(f, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(f, [0, 20], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cardScale = spring({
    frame: f,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 14, stiffness: 160, mass: 0.7 },
  });

  // Count-up
  const countProgress = spring({
    frame: f,
    fps,
    from: 0,
    to: stat.value,
    config: { damping: 18, stiffness: 65, mass: 1 },
  });

  // Format count display
  const displayVal = Math.round(countProgress);
  let displayStr: string;
  if (stat.value >= 100_000) {
    displayStr = `${Math.round(displayVal / 1000)}K`;
  } else {
    displayStr = displayVal.toLocaleString("en-US");
  }

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${stat.color}44`,
        borderRadius: 20,
        padding: "32px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        flex: 1,
        minWidth: 0,
        boxShadow: `0 0 40px ${stat.color}18, inset 0 1px 0 rgba(255,255,255,0.07)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow corner */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${stat.color}22 0%, transparent 70%)`,
        }}
      />

      {/* Icon */}
      <div
        style={{
          fontSize: 28,
          color: stat.color,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {stat.icon}
      </div>

      {/* Count */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 58,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: stat.color,
          textShadow: `0 0 40px ${stat.color}66`,
        }}
      >
        {displayStr}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: PALETTE.dim,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          textAlign: "center",
        }}
      >
        {stat.label}
      </div>
    </div>
  );
};

const SceneHighlights: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 80;
  const opacity = sectionOpacity(frame, 80, 96, 163, 175);

  const titleOpacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(localFrame, [0, 20], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 0,
      }}
    >
      {/* BG glow */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          width: 800,
          height: 400,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Section heading */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 38,
          color: PALETTE.white,
          letterSpacing: "-0.01em",
          marginBottom: 12,
          alignSelf: "flex-start",
        }}
      >
        Top Highlights
      </div>

      {/* Accent line */}
      <div
        style={{
          opacity: titleOpacity,
          alignSelf: "flex-start",
          width: interpolate(localFrame, [6, 28], [0, 140], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.exp),
          }),
          height: 3,
          background: `linear-gradient(90deg, ${PALETTE.gold}, ${PALETTE.indigo})`,
          borderRadius: 3,
          marginBottom: 48,
        }}
      />

      {/* Stat cards row */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
        }}
      >
        {STATS.map((stat, i) => (
          <StatCard
            key={stat.label}
            stat={stat}
            index={i}
            localFrame={localFrame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Best moments — 3 image frames slide in (frames 175–255) ───
interface MomentFrameProps {
  moment: Moment;
  index: number;
  localFrame: number;
  fps: number;
}

const MomentCard: React.FC<MomentFrameProps> = ({ moment, index, localFrame, fps }) => {
  const STAGGER = 18;
  const delay = 12 + index * STAGGER;
  const f = Math.max(0, localFrame - delay);

  const cardX = interpolate(f, [0, 22], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cardOpacity = interpolate(f, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const imgReveal = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 16, stiffness: 100, mass: 0.8 },
  });

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateX(${cardX}px)`,
        flex: 1,
        minWidth: 0,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${moment.accent}33`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
        display: "flex",
        flexDirection: "column",
        background: PALETTE.bg,
      }}
    >
      {/* Image placeholder area */}
      <div
        style={{
          width: "100%",
          height: 160,
          background: moment.bg,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Shimmer reveal overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: PALETTE.bg,
            transform: `scaleX(${1 - imgReveal})`,
            transformOrigin: "left center",
          }}
        />

        {/* Decorative shapes inside placeholder */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: `${moment.accent}33`,
            border: `2px solid ${moment.accent}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              color: moment.accent,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {moment.month}
          </div>
        </div>

        {/* Subtle scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
          }}
        />
      </div>

      {/* Caption area */}
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: "rgba(255,255,255,0.03)",
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: PALETTE.white,
            lineHeight: 1.2,
          }}
        >
          {moment.title}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: PALETTE.dim,
            lineHeight: 1.4,
          }}
        >
          {moment.caption}
        </div>
        {/* Accent tag */}
        <div
          style={{
            marginTop: 6,
            display: "inline-flex",
            alignSelf: "flex-start",
            background: `${moment.accent}22`,
            border: `1px solid ${moment.accent}44`,
            borderRadius: 6,
            padding: "3px 10px",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 11,
              color: moment.accent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {moment.month}
          </span>
        </div>
      </div>
    </div>
  );
};

const SceneMoments: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 175;
  const opacity = sectionOpacity(frame, 175, 190, 243, 255);

  const titleOpacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(localFrame, [0, 18], [-18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 0,
      }}
    >
      {/* BG glow */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          right: "20%",
          width: 600,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Section title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 38,
          color: PALETTE.white,
          letterSpacing: "-0.01em",
          marginBottom: 12,
          alignSelf: "flex-start",
        }}
      >
        Best Moments
      </div>

      {/* Accent line */}
      <div
        style={{
          opacity: titleOpacity,
          alignSelf: "flex-start",
          width: interpolate(localFrame, [4, 26], [0, 130], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.exp),
          }),
          height: 3,
          background: `linear-gradient(90deg, ${PALETTE.gold}, ${PALETTE.rose})`,
          borderRadius: 3,
          marginBottom: 40,
        }}
      />

      {/* Moment cards */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        {MOMENTS.map((m, i) => (
          <MomentCard
            key={m.title}
            moment={m}
            index={i}
            localFrame={localFrame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: "What's Next" teaser (frames 255–300) ──────────────────────
const AnimatedArrow: React.FC<{ frame: number }> = ({ frame }) => {
  // Pulsing translate
  const pulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [0, 12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sine) }
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        transform: `translateX(${pulse}px)`,
      }}
    >
      {/* Arrow shaft */}
      <div
        style={{
          width: 80,
          height: 4,
          background: `linear-gradient(90deg, ${PALETTE.gold}00, ${PALETTE.gold})`,
          borderRadius: 2,
        }}
      />
      {/* Arrowhead — right-pointing chevron built with borders */}
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: "14px solid transparent",
          borderBottom: "14px solid transparent",
          borderLeft: `22px solid ${PALETTE.gold}`,
        }}
      />
    </div>
  );
};

const SceneWhatsNext: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 255;
  const opacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const headScale = spring({
    frame: localFrame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 14, stiffness: 150, mass: 0.9 },
  });

  const headOpacity = interpolate(localFrame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(localFrame, [14, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(localFrame, [14, 30], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const arrowOpacity = interpolate(localFrame, [24, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bulletOpacity = interpolate(localFrame, [28, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glowing orb pulsing
  const orbScale = interpolate(
    localFrame % 60,
    [0, 30, 60],
    [1, 1.12, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sine) }
  );

  const NEXT_ITEMS = [
    "Ship 40 new resources",
    "Launch mobile SDK",
    "Open-source the core",
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Gold glow orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 500,
          transform: `translate(-50%, -50%) scale(${orbScale})`,
          background: `radial-gradient(ellipse, ${PALETTE.gold}14 0%, ${PALETTE.indigo}0a 50%, transparent 75%)`,
          pointerEvents: "none",
        }}
      />

      {/* "What's Next" heading */}
      <div
        style={{
          opacity: headOpacity,
          transform: `scale(${headScale})`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 88,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          background: `linear-gradient(135deg, ${PALETTE.white} 0%, ${PALETTE.gold} 50%, ${PALETTE.goldLight} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 24,
        }}
      >
        What&apos;s Next
      </div>

      {/* Tagline + arrow */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 20,
            color: PALETTE.dim,
            letterSpacing: "0.06em",
          }}
        >
          {YEAR + 1} is going to be even bigger
        </div>

        <div style={{ opacity: arrowOpacity }}>
          <AnimatedArrow frame={localFrame} />
        </div>
      </div>

      {/* Bullet list */}
      <div
        style={{
          opacity: bulletOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
        }}
      >
        {NEXT_ITEMS.map((item, i) => {
          const itemOpacity = interpolate(localFrame, [28 + i * 6, 44 + i * 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemX = interpolate(localFrame, [28 + i * 6, 40 + i * 6], [-20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });

          return (
            <div
              key={item}
              style={{
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: PALETTE.gold,
                  boxShadow: `0 0 12px ${PALETTE.gold}88`,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 500,
                  fontSize: 18,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ────────────────────────────────────────────────────
export const RemotionYearReview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.bg, overflow: "hidden" }}>
      <Background />

      {/* Scene 1: Year + particles (0–80) */}
      {frame < 82 && <SceneYear frame={frame} fps={fps} />}

      {/* Scene 2: Highlights + stat cards (78–175) */}
      {frame >= 78 && frame < 177 && (
        <SceneHighlights frame={frame} fps={fps} />
      )}

      {/* Scene 3: Best moments (173–255) */}
      {frame >= 173 && frame < 257 && (
        <SceneMoments frame={frame} fps={fps} />
      )}

      {/* Scene 4: What's next (253–300) */}
      {frame >= 253 && (
        <SceneWhatsNext frame={frame} fps={fps} />
      )}
    </AbsoluteFill>
  );
};

// ── Remotion Root ───────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionYearReview"
    component={RemotionYearReview}
    durationInFrames={300}
    fps={30}
    width={1280}
    height={720}
  />
);
