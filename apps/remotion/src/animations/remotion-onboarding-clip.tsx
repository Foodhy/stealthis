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
const BG = "#09090f";
const INDIGO = "#6366f1";
const INDIGO_LIGHT = "#818cf8";
const INDIGO_DARK = "#4338ca";
const EMERALD = "#10b981";
const EMERALD_LIGHT = "#34d399";
const WHITE = "#ffffff";
const GRAY_400 = "#9ca3af";
const GRAY_700 = "#374151";
const GRAY_800 = "#1f2937";
const GRAY_900 = "#111827";

// Confetti dot colors — vibrant mix
const DOT_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#22c55e", // green
  "#eab308", // yellow
  "#8b5cf6", // violet
];

// Action cards data
const ACTION_CARDS = [
  { icon: "🔗", label: "Connect your tools", cta: "→", startFrame: 40 },
  { icon: "⚙️", label: "Set up workspace", cta: "→", startFrame: 55 },
  { icon: "👥", label: "Invite your team", cta: "→", startFrame: 70 },
];

// ─── Seeded pseudo-random ─────────────────────────────────────────────────────
function seededRand(seed: number, offset: number = 0): number {
  const s = Math.sin(seed * 9301.0 + offset * 49297.0 + 233.0) * 93458.0;
  return s - Math.floor(s);
}

// ─── Dot config ───────────────────────────────────────────────────────────────
interface DotConfig {
  id: number;
  color: string;
  size: number;
  angle: number;
  radius: number;
  delay: number;
}

const NUM_DOTS = 12;

const DOTS: DotConfig[] = Array.from({ length: NUM_DOTS }, (_, i) => ({
  id: i,
  color: DOT_COLORS[i % DOT_COLORS.length],
  size: 8 + seededRand(i, 0) * 6, // 8–14px
  angle: (i / NUM_DOTS) * Math.PI * 2 + seededRand(i, 1) * 0.4,
  radius: 120 + seededRand(i, 2) * 140, // spread outward to 120-260px
  delay: Math.floor(seededRand(i, 3) * 6),
}));

// ─── Sub-component: ConfettiDots ──────────────────────────────────────────────
const ConfettiDots: React.FC<{ frame: number }> = ({ frame }) => {
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
      {DOTS.map((dot) => {
        const localFrame = Math.max(0, frame - dot.delay);
        const dist = interpolate(localFrame, [0, 30], [0, dot.radius], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const opacity = interpolate(localFrame, [0, 4, 20, 35], [0, 1, 0.85, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const x = Math.cos(dot.angle) * dist;
        const y = Math.sin(dot.angle) * dist;
        return (
          <div
            key={dot.id}
            style={{
              position: "absolute",
              left: x - dot.size / 2,
              top: y - dot.size / 2,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: dot.color,
              opacity,
              boxShadow: `0 0 ${dot.size * 2}px ${dot.color}cc`,
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Sub-component: RadialGlow ────────────────────────────────────────────────
const RadialGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 60, mass: 1.2 },
  });
  const scale = interpolate(prog, [0, 1], [0.3, 1]);
  const opacity = interpolate(prog, [0, 0.2, 1], [0, 0.25, 0.08], {
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
        width: 680,
        height: 680,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${INDIGO}88 0%, ${EMERALD}44 50%, transparent 75%)`,
        filter: "blur(48px)",
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Sub-component: GridOverlay ───────────────────────────────────────────────
const GridOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
      pointerEvents: "none",
    }}
  />
);

// ─── Sub-component: WelcomeTitle ──────────────────────────────────────────────
const WelcomeTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.8 },
  });

  const scale = interpolate(prog, [0, 1], [0.7, 1]);
  const opacity = interpolate(prog, [0, 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(prog, [0, 1], [24, 0]);

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 72,
          fontWeight: 800,
          color: WHITE,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textShadow: `0 0 60px ${INDIGO}88, 0 4px 24px rgba(0,0,0,0.6)`,
        }}
      >
        Welcome aboard! 🎉
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 22,
          fontWeight: 400,
          color: GRAY_400,
          marginTop: 10,
          letterSpacing: "0.01em",
        }}
      >
        Let's get you set up in just a few steps
      </div>
    </div>
  );
};

// ─── Sub-component: AvatarBadge ───────────────────────────────────────────────
const AvatarBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 30,
    fps,
    config: { damping: 8, stiffness: 220, mass: 0.6 },
  });

  const scale = interpolate(prog, [0, 1], [0.4, 1]);
  const opacity = interpolate(prog, [0, 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bounceY = Math.sin(frame * 0.08) * 4;

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${bounceY}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Avatar circle */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${INDIGO_DARK} 0%, ${INDIGO} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 0 3px ${INDIGO}66, 0 8px 32px ${INDIGO}55`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: WHITE,
            letterSpacing: "-0.02em",
          }}
        >
          JD
        </span>
      </div>
      {/* Name label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 16,
          fontWeight: 500,
          color: GRAY_400,
          letterSpacing: "0.03em",
        }}
      >
        Jordan Davis • New member
      </div>
    </div>
  );
};

// ─── Sub-component: ActionCard ────────────────────────────────────────────────
interface ActionCardProps {
  icon: string;
  label: string;
  cta: string;
  startFrame: number;
  frame: number;
  index: number;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  label,
  cta,
  startFrame,
  frame,
  index,
}) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.7 },
  });

  const scale = interpolate(prog, [0, 1], [0.85, 1]);
  const opacity = interpolate(prog, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(prog, [0, 1], [-24, 0]);

  // Subtle pulse on the CTA arrow
  const arrowPulse = 0.85 + Math.sin(frame * 0.12 + index * 1.2) * 0.15;

  return (
    <div
      style={{
        transform: `scale(${scale}) translateX(${translateX}px)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: `linear-gradient(135deg, ${GRAY_900} 0%, ${GRAY_800} 100%)`,
        border: `1px solid rgba(99,102,241,0.25)`,
        borderRadius: 14,
        padding: "16px 24px",
        width: 380,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Step number */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${INDIGO} 0%, ${INDIGO_DARK} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 12px ${INDIGO}66`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: WHITE,
          }}
        >
          {index + 1}
        </span>
      </div>
      {/* Icon */}
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      {/* Label */}
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: WHITE,
          flex: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
      {/* CTA Arrow */}
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: EMERALD_LIGHT,
          transform: `scale(${arrowPulse})`,
          display: "inline-block",
        }}
      >
        {cta}
      </span>
    </div>
  );
};

// ─── Sub-component: ActionCards ───────────────────────────────────────────────
const ActionCards: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      alignItems: "center",
    }}
  >
    {ACTION_CARDS.map((card, i) => (
      <ActionCard
        key={i}
        icon={card.icon}
        label={card.label}
        cta={card.cta}
        startFrame={card.startFrame}
        frame={frame}
        index={i}
      />
    ))}
  </div>
);

// ─── Sub-component: ClosingLine ───────────────────────────────────────────────
const ClosingLine: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [110, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const translateY = interpolate(frame, [110, 130], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* Emerald accent line */}
      <div
        style={{
          width: 40,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${INDIGO}, ${EMERALD})`,
          marginBottom: 4,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: WHITE,
          letterSpacing: "-0.01em",
        }}
      >
        You're all set! ✓
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: EMERALD_LIGHT,
          letterSpacing: "0.02em",
        }}
      >
        Start exploring your dashboard
      </div>
    </div>
  );
};

// ─── Sub-component: StatusPill ────────────────────────────────────────────────
const StatusPill: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({
    frame: frame - 8,
    fps,
    config: { damping: 16, stiffness: 140 },
  });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const translateY = interpolate(prog, [0, 1], [-12, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: `rgba(16,185,129,0.12)`,
        border: `1px solid ${EMERALD}55`,
        borderRadius: 999,
        padding: "6px 16px",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: EMERALD,
          boxShadow: `0 0 8px ${EMERALD}`,
          animation: "none",
          opacity: 0.7 + Math.sin(frame * 0.15) * 0.3,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: EMERALD_LIGHT,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Account activated
      </span>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const RemotionOnboardingClip: React.FC = () => {
  const frame = useCurrentFrame();

  // Global fade in/out
  const fadeIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [168, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalOpacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      {/* Subtle dot grid overlay */}
      <GridOverlay />

      {/* Radial center glow */}
      <RadialGlow frame={frame} />

      {/* Corner accent glows */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${INDIGO}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${EMERALD}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Confetti dots burst — frames 0-35 */}
      <Sequence from={0} durationInFrames={36}>
        <ConfettiDots frame={frame} />
      </Sequence>

      {/* Content column */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "0 80px",
        }}
      >
        {/* Status pill — frame 8 */}
        <Sequence from={8} durationInFrames={172}>
          <StatusPill frame={frame} />
        </Sequence>

        {/* Welcome title — springs in at frame 10 */}
        <Sequence from={10} durationInFrames={170}>
          <WelcomeTitle frame={frame} />
        </Sequence>

        {/* Avatar initials — bounces in below title at frame 25 */}
        <Sequence from={25} durationInFrames={155}>
          <AvatarBadge frame={frame} />
        </Sequence>

        {/* Divider */}
        <Sequence from={38} durationInFrames={142}>
          <div
            style={{
              width: interpolate(frame, [38, 55], [0, 420], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              }),
              height: 1,
              background: `linear-gradient(90deg, transparent, ${INDIGO}66, ${EMERALD}55, transparent)`,
            }}
          />
        </Sequence>

        {/* Action cards — staggered: 40, 55, 70 */}
        <Sequence from={40} durationInFrames={140}>
          <ActionCards frame={frame} />
        </Sequence>

        {/* Closing line — fades in at frame 110 */}
        <Sequence from={110} durationInFrames={70}>
          <ClosingLine frame={frame} />
        </Sequence>
      </div>

      {/* Top-left branding mark */}
      <Sequence from={15} durationInFrames={165}>
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 40,
            opacity: interpolate(frame, [15, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${INDIGO} 0%, ${INDIGO_DARK} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 2px 12px ${INDIGO}66`,
              }}
            >
              <span style={{ fontSize: 16 }}>✦</span>
            </div>
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: GRAY_400,
                letterSpacing: "0.04em",
              }}
            >
              Acme App
            </span>
          </div>
        </div>
      </Sequence>

      {/* Bottom bar */}
      <Sequence from={10} durationInFrames={170}>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${INDIGO_DARK}, ${INDIGO}, ${EMERALD}, ${INDIGO})`,
            opacity: interpolate(frame, [10, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionOnboardingClip"
    component={RemotionOnboardingClip}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
  />
);
