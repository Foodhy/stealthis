import React from "react";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Customizable constants ──────────────────────────────────────────────────
const CLINIC_NAME = "Greenfield Medical Center";
const DURATION_FRAMES = 240;
const FRAMES_PER_SERVICE = 80;
const CROSSFADE_FRAMES = 10;

// Color palette
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";
const OK = "#2f9e6f";

// Per-service configuration
const SERVICES = [
  {
    id: 0,
    icon: "🩺",
    title: "General Checkups",
    description: "Comprehensive wellness exams tailored to your health goals.",
    accent: TEAL,
    accentSoft: "#e7f5f3",
    cardGradientFrom: "#0d2e2a",
    cardGradientTo: "#071510",
    radialColor: "#12b5a8",
    dotColor: TEAL,
  },
  {
    id: 1,
    icon: "🧪",
    title: "Lab & Diagnostics",
    description: "Fast, accurate blood panels and imaging results in 24 hours.",
    accent: CORAL,
    accentSoft: "#fff0ee",
    cardGradientFrom: "#2e1810",
    cardGradientTo: "#130a07",
    radialColor: "#ff7a66",
    dotColor: CORAL,
  },
  {
    id: 2,
    icon: "💉",
    title: "Vaccinations & Preventive Care",
    description: "Stay protected with personalized immunization schedules.",
    accent: OK,
    accentSoft: "#e5f5ee",
    cardGradientFrom: "#0e2a1e",
    cardGradientTo: "#071510",
    radialColor: "#2f9e6f",
    dotColor: OK,
  },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// ─── Background radial glow ───────────────────────────────────────────────────
const ServiceBackground: React.FC<{
  service: (typeof SERVICES)[number];
  opacity: number;
}> = ({ service, opacity }) => (
  <AbsoluteFill
    style={{
      background: BG,
      opacity,
    }}
  >
    {/* Large radial glow centered behind the card */}
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 900,
        height: 900,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${service.radialColor}28 0%, ${service.radialColor}0a 45%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
    {/* Secondary smaller ambient orb */}
    <div
      style={{
        position: "absolute",
        bottom: "18%",
        right: "-10%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${service.radialColor}14 0%, transparent 65%)`,
        pointerEvents: "none",
      }}
    />
  </AbsoluteFill>
);

// ─── Floating ambient particles ───────────────────────────────────────────────
type ParticleDef = [number, number, number, number, number]; // x%, y%, size, speed, phase
const PARTICLES: ParticleDef[] = [
  [8, 12, 3, 0.7, 0],
  [18, 78, 2, 1.1, 9],
  [28, 42, 4, 0.9, 4],
  [45, 88, 2, 1.3, 16],
  [62, 22, 3, 0.8, 7],
  [72, 68, 4, 1.0, 2],
  [85, 35, 2, 1.2, 20],
  [92, 82, 3, 0.75, 12],
];

const Particle: React.FC<{
  xPct: number;
  yPct: number;
  size: number;
  speed: number;
  phase: number;
  frame: number;
  color: string;
}> = ({ xPct, yPct, size, speed, phase, frame, color }) => {
  const t = frame + phase * 4;
  const floatY = Math.sin(((t * 0.035 * speed) % (Math.PI * 2)) * 1) * 16;
  const floatX = Math.cos(((t * 0.022 * speed) % (Math.PI * 2)) * 1) * 9;
  const opacity = interpolate(frame, [0, 15], [0, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity,
        transform: `translate(${floatX}px, ${floatY}px)`,
        boxShadow: `0 0 ${size * 4}px ${color}`,
      }}
    />
  );
};

// ─── Service icon ─────────────────────────────────────────────────────────────
const ServiceIcon: React.FC<{
  icon: string;
  accent: string;
  localFrame: number;
}> = ({ icon, accent, localFrame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: localFrame - 4,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const scale = interpolate(prog, [0, 1], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(prog, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 140,
        height: 140,
        borderRadius: 40,
        background: `${accent}1a`,
        border: `2px solid ${accent}55`,
        boxShadow: `0 0 50px ${accent}33, inset 0 1px 0 ${accent}22`,
        marginBottom: 36,
      }}
    >
      <span style={{ fontSize: 72, lineHeight: 1 }}>{icon}</span>
    </div>
  );
};

// ─── Service title ────────────────────────────────────────────────────────────
const ServiceTitle: React.FC<{
  title: string;
  accent: string;
  localFrame: number;
}> = ({ title, accent, localFrame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const slideX = interpolate(prog, [0, 1], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(prog, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translateX(${slideX}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Accent rule */}
      <div
        style={{
          width: 56,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
      <h2
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: 62,
          fontWeight: 800,
          color: WHITE,
          margin: 0,
          textAlign: "center",
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          textShadow: `0 0 60px ${accent}55`,
        }}
      >
        {title}
      </h2>
    </div>
  );
};

// ─── Service description ──────────────────────────────────────────────────────
const ServiceDescription: React.FC<{
  description: string;
  accent: string;
  localFrame: number;
}> = ({ description, accent, localFrame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: localFrame - 18,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const slideX = interpolate(prog, [0, 1], [140, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(prog, [0, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <p
      style={{
        transform: `translateX(${slideX}px)`,
        opacity,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        fontSize: 34,
        fontWeight: 400,
        color: MUTED,
        margin: "24px 0 0",
        textAlign: "center",
        lineHeight: 1.5,
        maxWidth: 700,
        letterSpacing: "0.01em",
      }}
    >
      {description}
    </p>
  );
};

// ─── Service card wrapper ─────────────────────────────────────────────────────
const ServiceCard: React.FC<{
  service: (typeof SERVICES)[number];
  localFrame: number;
}> = ({ service, localFrame }) => {
  const { fps } = useVideoConfig();

  // Card slides up and fades in as a whole
  const cardProg = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const cardY = interpolate(cardProg, [0, 1], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(cardProg, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, calc(-50% + ${cardY}px))`,
        opacity: cardOpacity,
        width: 860,
        padding: "72px 64px",
        borderRadius: 48,
        background: `linear-gradient(160deg, ${service.cardGradientFrom} 0%, ${service.cardGradientTo} 100%)`,
        border: `1.5px solid ${service.accent}33`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 60px ${service.accent}18, inset 0 1px 0 ${service.accent}22`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Subtle inner top glow band */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: 1,
          background: `linear-gradient(90deg, transparent, ${service.accent}66, transparent)`,
          borderRadius: 1,
        }}
      />

      <ServiceIcon
        icon={service.icon}
        accent={service.accent}
        localFrame={localFrame}
      />
      <ServiceTitle
        title={service.title}
        accent={service.accent}
        localFrame={localFrame}
      />
      <ServiceDescription
        description={service.description}
        accent={service.accent}
        localFrame={localFrame}
      />
    </div>
  );
};

// ─── Bottom bar with clinic name ──────────────────────────────────────────────
const ClinicBar: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 90 },
  });
  const barY = interpolate(prog, [0, 1], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barOpacity = interpolate(prog, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        transform: `translateY(${barY}px)`,
        opacity: barOpacity,
      }}
    >
      {/* Separator line */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${TEAL}44, transparent)`,
          marginBottom: 0,
        }}
      />
      {/* Bar body */}
      <div
        style={{
          background: `${BG}ee`,
          backdropFilter: "blur(12px)",
          padding: "40px 72px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Logo dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: TEAL,
            boxShadow: `0 0 12px ${TEAL}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            fontSize: 30,
            fontWeight: 600,
            color: TEAL_SOFT,
            letterSpacing: "0.02em",
            opacity: 0.9,
          }}
        >
          {CLINIC_NAME}
        </span>
      </div>
    </div>
  );
};

// ─── Dot indicator ────────────────────────────────────────────────────────────
const DotIndicator: React.FC<{
  activeIndex: number;
  frame: number;
  services: typeof SERVICES;
}> = ({ activeIndex, frame, services }) => {
  const { fps } = useVideoConfig();

  const prog = spring({
    frame: frame - 8,
    fps,
    config: { damping: 18, stiffness: 90 },
  });
  const opacity = interpolate(prog, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 178,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 20,
        opacity,
      }}
    >
      {services.map((svc, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={svc.id}
            style={{
              width: isActive ? 36 : 10,
              height: 10,
              borderRadius: 5,
              background: isActive ? svc.dotColor : `${WHITE}33`,
              boxShadow: isActive ? `0 0 12px ${svc.dotColor}` : "none",
              transition: "width 0.3s ease",
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Cross-fade overlay between services ─────────────────────────────────────
// We render two services simultaneously and cross-fade with interpolate on opacity.
const ServiceSlide: React.FC<{
  service: (typeof SERVICES)[number];
  globalFrame: number;
  slideStart: number;
  slideEnd: number;
}> = ({ service, globalFrame, slideStart, slideEnd }) => {
  const fadeInEnd = slideStart + CROSSFADE_FRAMES;
  const fadeOutStart = slideEnd - CROSSFADE_FRAMES;

  const opacity = interpolate(
    globalFrame,
    [
      clamp(slideStart, 0, DURATION_FRAMES),
      clamp(fadeInEnd, 0, DURATION_FRAMES),
      clamp(fadeOutStart, 0, DURATION_FRAMES),
      clamp(slideEnd, 0, DURATION_FRAMES),
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // For the last slide don't fade out
  const finalOpacity =
    service.id === SERVICES.length - 1
      ? interpolate(globalFrame, [slideStart, fadeInEnd], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : opacity;

  const localFrame = clamp(globalFrame - slideStart, 0, FRAMES_PER_SERVICE);

  if (finalOpacity < 0.01) return null;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: finalOpacity }}>
      <ServiceBackground service={service} opacity={1} />
      {/* Animated particles with per-service accent */}
      {PARTICLES.map(([xPct, yPct, size, speed, phase], idx) => (
        <Particle
          key={idx}
          xPct={xPct}
          yPct={yPct}
          size={size}
          speed={speed}
          phase={phase}
          frame={localFrame}
          color={service.accent}
        />
      ))}
      <ServiceCard service={service} localFrame={localFrame} />
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const ServiceHighlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine which service is "active" for the dot indicator
  // Active = whichever slide has its midpoint closest to current frame
  const activeIndex =
    frame < FRAMES_PER_SERVICE * 1.5
      ? frame < FRAMES_PER_SERVICE * 0.5
        ? 0
        : 1
      : 2;

  // Global fade-in
  const globalFadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global fade-out
  const globalFadeOut = interpolate(
    frame,
    [DURATION_FRAMES - 10, DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const globalOpacity = globalFadeIn * globalFadeOut;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        overflow: "hidden",
        opacity: globalOpacity,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      {/* Service 0: frames 0 – 89 */}
      <ServiceSlide
        service={SERVICES[0]}
        globalFrame={frame}
        slideStart={0}
        slideEnd={89}
      />

      {/* Service 1: frames 70 – 169 (10-frame crossfade at both ends) */}
      <ServiceSlide
        service={SERVICES[1]}
        globalFrame={frame}
        slideStart={70}
        slideEnd={169}
      />

      {/* Service 2: frames 150 – 240 */}
      <ServiceSlide
        service={SERVICES[2]}
        globalFrame={frame}
        slideStart={150}
        slideEnd={240}
      />

      {/* Always-visible bottom bar */}
      <ClinicBar frame={frame} />

      {/* Dot indicator */}
      <DotIndicator
        activeIndex={activeIndex}
        frame={frame}
        services={SERVICES}
      />

      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background:
            "linear-gradient(180deg, rgba(10,26,24,0.85) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom vignette (above bar) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ServiceHighlight"
    component={ServiceHighlight}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
