import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── Config constants (easy to customize) ───────────────────────────────────
const EVENT_NAME = "DEVCONF 2026";
const EVENT_TAGLINE = "The Future of Developer Tools";
const EVENT_DATES = "June 20–22";
const EVENT_LOCATION = "San Francisco, CA";
const CTA_TEXT = "Register Now";
const CTA_URL = "devconf2026.io";

const COLOR_BG = "#0f172a";
const COLOR_BLUE = "#3b82f6";
const COLOR_PURPLE = "#a855f7";
const COLOR_BLUE_DIM = "#1d4ed8";
const COLOR_PURPLE_DIM = "#7e22ce";

const SPEAKERS = [
  { initials: "AK", name: "Aditi Kumar", role: "Keynote", from: COLOR_BLUE, to: "#6366f1" },
  { initials: "MR", name: "Marco Russo", role: "DevTools", from: COLOR_PURPLE, to: "#ec4899" },
  { initials: "SJ", name: "Sara Jensen", role: "AI Track", from: "#06b6d4", to: COLOR_BLUE },
];

const PARTICLES = [
  { x: 0.08, y: 0.18, r: 4, speed: 0.9, phase: 0.0 },
  { x: 0.18, y: 0.72, r: 3, speed: 1.1, phase: 0.8 },
  { x: 0.32, y: 0.12, r: 5, speed: 0.7, phase: 1.6 },
  { x: 0.55, y: 0.85, r: 3.5, speed: 1.3, phase: 0.4 },
  { x: 0.72, y: 0.08, r: 4, speed: 0.8, phase: 2.1 },
  { x: 0.85, y: 0.65, r: 5, speed: 1.0, phase: 1.2 },
  { x: 0.92, y: 0.30, r: 3, speed: 1.2, phase: 0.6 },
  { x: 0.45, y: 0.93, r: 4.5, speed: 0.6, phase: 1.9 },
];

// ─── Particle background ─────────────────────────────────────────────────────
const ParticleField: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const globalReveal = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {PARTICLES.map((p, i) => {
        // Slow sinusoidal arc
        const t = frame / fps;
        const arcX = Math.sin(t * p.speed + p.phase) * 28;
        const arcY = Math.cos(t * p.speed * 0.7 + p.phase) * 20;
        const pulse = 0.55 + 0.45 * Math.sin(t * p.speed * 1.5 + p.phase);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(${p.x * 100}% + ${arcX}px)`,
              top: `calc(${p.y * 100}% + ${arcY}px)`,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? COLOR_BLUE : COLOR_PURPLE,
              opacity: globalReveal * pulse * 0.75,
              boxShadow: `0 0 ${p.r * 4}px ${p.r * 2}px ${i % 2 === 0 ? COLOR_BLUE + "55" : COLOR_PURPLE + "55"}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Background glow layers ──────────────────────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const glowOpacity = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // Slow breathing pulse
  const breathe = 0.85 + 0.15 * Math.sin((frame / 30) * 0.6);

  return (
    <>
      {/* Blue left glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "-10%",
          width: 700,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${COLOR_BLUE}22 0%, transparent 68%)`,
          opacity: glowOpacity * breathe,
          filter: "blur(2px)",
        }}
      />
      {/* Purple right glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-15%",
          width: 750,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${COLOR_PURPLE}20 0%, transparent 68%)`,
          opacity: glowOpacity * breathe,
          filter: "blur(2px)",
        }}
      />
      {/* Center vignette overlay for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 35%, ${COLOR_BG}99 100%)`,
        }}
      />
    </>
  );
};

// ─── Gradient divider line ────────────────────────────────────────────────────
const GradientLine: React.FC<{ frame: number; fps: number; delay: number; y: number }> = ({
  frame,
  fps,
  delay,
  y,
}) => {
  const f = Math.max(0, frame - delay);
  const scaleX = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 18, stiffness: 90 } });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        width: 560,
        height: 1,
        transform: `translateX(-50%) scaleX(${scaleX})`,
        transformOrigin: "center",
        background: `linear-gradient(90deg, transparent, ${COLOR_BLUE}80, ${COLOR_PURPLE}80, transparent)`,
      }}
    />
  );
};

// ─── Event logo / name ────────────────────────────────────────────────────────
const EventLogo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({ frame, fps, from: 0.4, to: 1, config: { damping: 14, stiffness: 90 } });
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle shimmer sweep across the text
  const shimmerX = interpolate(frame, [10, 55], [-120, 620], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 148,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Badge */}
      <div
        style={{
          marginBottom: 18,
          padding: "6px 18px",
          borderRadius: 100,
          background: `linear-gradient(135deg, ${COLOR_BLUE}25, ${COLOR_PURPLE}25)`,
          border: `1px solid ${COLOR_BLUE}50`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 12,
          color: COLOR_BLUE,
          letterSpacing: 3,
          textTransform: "uppercase" as const,
        }}
      >
        Developer Conference
      </div>

      {/* Main title with gradient + shimmer */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: 96,
            letterSpacing: -3,
            background: `linear-gradient(135deg, #ffffff 30%, ${COLOR_BLUE} 60%, ${COLOR_PURPLE} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
          }}
        >
          {EVENT_NAME}
        </div>
        {/* Shimmer overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${shimmerX - 80}px, rgba(255,255,255,0.18) ${shimmerX}px, transparent ${shimmerX + 80}px)`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 12,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 300,
          fontSize: 20,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: 1,
        }}
      >
        {EVENT_TAGLINE}
      </div>
    </div>
  );
};

// ─── Date + location strip ────────────────────────────────────────────────────
const DateLocation: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 35;
  const f = Math.max(0, frame - delay);

  const y = spring({ frame: f, fps, from: 40, to: 0, config: { damping: 14, stiffness: 80 } });
  const opacity = interpolate(f, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 218,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 40,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* Date pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px",
          borderRadius: 50,
          background: "rgba(59,130,246,0.12)",
          border: `1px solid ${COLOR_BLUE}40`,
        }}
      >
        {/* Calendar icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="3" stroke={COLOR_BLUE} strokeWidth="2" />
          <line x1="3" y1="9" x2="21" y2="9" stroke={COLOR_BLUE} strokeWidth="2" />
          <line x1="8" y1="2" x2="8" y2="6" stroke={COLOR_BLUE} strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="2" x2="16" y2="6" stroke={COLOR_BLUE} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 17,
            color: "#ffffff",
          }}
        >
          {EVENT_DATES}
        </span>
      </div>

      {/* Separator dot */}
      <div
        style={{
          alignSelf: "center",
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.25)",
        }}
      />

      {/* Location pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px",
          borderRadius: 50,
          background: "rgba(168,85,247,0.12)",
          border: `1px solid ${COLOR_PURPLE}40`,
        }}
      >
        {/* Pin icon */}
        <svg width="14" height="16" viewBox="0 0 24 28" fill="none">
          <path
            d="M12 2C7.58 2 4 5.58 4 10c0 6 8 16 8 16s8-10 8-16c0-4.42-3.58-8-8-8z"
            stroke={COLOR_PURPLE}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="10" r="3" stroke={COLOR_PURPLE} strokeWidth="2" />
        </svg>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 17,
            color: "#ffffff",
          }}
        >
          {EVENT_LOCATION}
        </span>
      </div>
    </div>
  );
};

// ─── Speaker avatars ──────────────────────────────────────────────────────────
const SpeakerAvatars: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 112,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 28,
        alignItems: "flex-end",
      }}
    >
      {SPEAKERS.map((speaker, i) => {
        const delay = 55 + i * 14;
        const f = Math.max(0, frame - delay);
        const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 12, stiffness: 130 } });
        const opacity = interpolate(f, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = spring({ frame: f, fps, from: 30, to: 0, config: { damping: 14, stiffness: 100 } });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity,
              transform: `translateY(${y}px) scale(${scale})`,
            }}
          >
            {/* Avatar circle with gradient */}
            <div
              style={{
                position: "relative",
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${speaker.from}, ${speaker.to})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 22px 6px ${speaker.from}45, 0 0 0 2px rgba(255,255,255,0.08)`,
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "#ffffff",
                  letterSpacing: -0.5,
                }}
              >
                {speaker.initials}
              </span>
            </div>
            {/* Name */}
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: 0.3,
              }}
            >
              {speaker.name}
            </span>
            {/* Role badge */}
            <span
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 500,
                fontSize: 10,
                color: speaker.from,
                letterSpacing: 1.5,
                textTransform: "uppercase" as const,
              }}
            >
              {speaker.role}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── CTA button (pulsing) ─────────────────────────────────────────────────────
const CTAButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 80;
  const f = Math.max(0, frame - delay);

  const scale = spring({ frame: f, fps, from: 0.6, to: 1, config: { damping: 12, stiffness: 150 } });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow after entrance
  const pulseProgress = Math.max(0, frame - delay - 20);
  const pulseCycle = (pulseProgress % 40) / 40;
  const pulseGlow = 0.65 + 0.35 * Math.sin(pulseCycle * Math.PI * 2);
  const pulseScale = 1 + 0.015 * Math.sin(pulseCycle * Math.PI * 2);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* CTA pill */}
      <div
        style={{
          padding: "14px 44px",
          borderRadius: 100,
          background: `linear-gradient(135deg, ${COLOR_BLUE}, ${COLOR_PURPLE})`,
          boxShadow: `0 0 ${32 * pulseGlow}px ${14 * pulseGlow}px ${COLOR_BLUE}50, 0 0 ${56 * pulseGlow}px ${24 * pulseGlow}px ${COLOR_PURPLE}30`,
          transform: `scale(${pulseScale})`,
          cursor: "default",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "#ffffff",
            letterSpacing: 0.5,
          }}
        >
          {CTA_TEXT}
        </span>
      </div>

      {/* URL hint */}
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: "rgba(255,255,255,0.28)",
          letterSpacing: 1,
        }}
      >
        {CTA_URL}
      </span>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const EventPromo: React.FC = () => {
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
    <AbsoluteFill style={{ backgroundColor: COLOR_BG, opacity: globalOpacity }}>
      {/* Layer 0: background glows */}
      <BackgroundGlow frame={frame} />

      {/* Layer 1: particles */}
      <ParticleField frame={frame} fps={fps} />

      {/* Layer 2: event logo */}
      <EventLogo frame={frame} fps={fps} />

      {/* Divider under title */}
      <GradientLine frame={frame} fps={fps} delay={28} y={310} />

      {/* Layer 3: date + location */}
      <DateLocation frame={frame} fps={fps} />

      {/* Layer 4: speaker avatars */}
      <SpeakerAvatars frame={frame} fps={fps} />

      {/* Divider above CTA */}
      <GradientLine frame={frame} fps={fps} delay={75} y={600} />

      {/* Layer 5: CTA */}
      <CTAButton frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ─── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="EventPromo"
    component={EventPromo}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
