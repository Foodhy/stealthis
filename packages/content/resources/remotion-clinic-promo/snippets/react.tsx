import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Config constants ─────────────────────────────────────────────────────────
const CLINIC_NAME = "Greenfield Medical Center";
const CLINIC_TAGLINE = "Compassionate Care, Every Step of the Way";
const CLINIC_PHONE = "(555) 847-2200";
const CTA_HEADLINE = "Book Your Appointment Today";

const SERVICES: { icon: string; label: string }[] = [
  { icon: "💊", label: "Primary Care" },
  { icon: "🩺", label: "Specialist" },
  { icon: "🧪", label: "Lab Tests" },
];

// Palette
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";

// Spring preset
const SP = { damping: 14, stiffness: 120 };

// ─── Scene frame boundaries ───────────────────────────────────────────────────
// Scene 1 : 0  – 59   (logo + tagline)
// Scene 2 : 60 – 149  (service pills)
// Scene 3 : 150 – 224 (CTA headline, underline, typewriter phone)
// Scene 4 : 225 – 270 (outro sweep)

// ─── Background ───────────────────────────────────────────────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const glowOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Slow breathe: 0.8 – 1.0 over a ~3-second cycle
  const breathe = 0.8 + 0.2 * Math.sin((frame / 30) * 0.55);

  return (
    <>
      {/* Base background */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: BG }} />

      {/* Central radial teal glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 900,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${TEAL}18 0%, ${TEAL}08 40%, transparent 70%)`,
          opacity: glowOpacity * breathe,
        }}
      />

      {/* Subtle top vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, transparent 30%, ${BG}cc 90%)`,
        }}
      />
    </>
  );
};

// ─── Scene 1 – Logo block ─────────────────────────────────────────────────────
const CrossIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    style={{ display: "block" }}
  >
    {/* Horizontal bar */}
    <rect x="4" y="15" width="32" height="10" rx="5" fill={color} />
    {/* Vertical bar */}
    <rect x="15" y="4" width="10" height="32" rx="5" fill={color} />
  </svg>
);

const LogoBlock: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({ frame, fps, from: 0.4, to: 1, config: SP });
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline enters slightly later
  const tf = Math.max(0, frame - 24);
  const taglineY = spring({ frame: tf, fps, from: 20, to: 0, config: SP });
  const taglineOpacity = interpolate(tf, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glowing ring pulse around cross (breathes after entrance)
  const ringPulse = frame > 20 ? 0.4 + 0.35 * Math.sin((frame / 30) * 1.2) : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Cross icon with glow ring */}
      <div
        style={{
          position: "relative",
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${TEAL}28 0%, transparent 70%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          boxShadow: `0 0 ${40 * ringPulse}px ${16 * ringPulse}px ${TEAL}55`,
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${TEAL}`,
            opacity: 0.35 + ringPulse * 0.45,
          }}
        />
        <CrossIcon color={TEAL} size={44} />
      </div>

      {/* Clinic name */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 800,
          fontSize: 52,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -1,
          padding: "0 60px",
          textShadow: `0 2px 24px ${TEAL}44`,
        }}
      >
        {CLINIC_NAME}
      </div>

      {/* Teal accent bar */}
      <div
        style={{
          width: 64,
          height: 3,
          borderRadius: 2,
          backgroundColor: TEAL,
          marginTop: 20,
          marginBottom: 20,
          boxShadow: `0 0 12px 4px ${TEAL}66`,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 400,
          fontSize: 26,
          color: MUTED,
          textAlign: "center",
          padding: "0 80px",
          lineHeight: 1.4,
          letterSpacing: 0.3,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        {CLINIC_TAGLINE}
      </div>
    </div>
  );
};

// ─── Scene 2 – Service pills ──────────────────────────────────────────────────
const ServicePill: React.FC<{
  frame: number;
  fps: number;
  icon: string;
  label: string;
  delay: number;
  index: number;
}> = ({ frame, fps, icon, label, delay, index }) => {
  const f = Math.max(0, frame - delay);

  const x = spring({ frame: f, fps, from: -320, to: 0, config: SP });
  const opacity = interpolate(f, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle glow breathe after entrance
  const glowPulse = f > 20 ? 0.55 + 0.45 * Math.sin(((frame + index * 18) / 30) * 0.9) : 0;

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "22px 36px",
        borderRadius: 80,
        background: `linear-gradient(135deg, ${TEAL}22 0%, ${TEAL}0f 100%)`,
        border: `1.5px solid ${TEAL}55`,
        boxShadow: `0 0 ${28 * glowPulse}px ${8 * glowPulse}px ${TEAL}30`,
        width: 560,
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: `${TEAL}22`,
          border: `1.5px solid ${TEAL}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 700,
          fontSize: 34,
          color: TEAL_SOFT,
          letterSpacing: -0.5,
        }}
      >
        {label}
      </div>

      {/* Right arrow indicator */}
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6l6 6-6 6"
            stroke={TEAL}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

const ServicesBlock: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Fade in the whole block at scene start (frame 60)
  const blockOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Fade out as scene 3 begins (frame 140–155)
  const blockOut = interpolate(frame, [140, 155], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        opacity: blockOpacity * blockOut,
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 500,
          fontSize: 22,
          color: MUTED,
          letterSpacing: 4,
          textTransform: "uppercase" as const,
          marginBottom: 8,
        }}
      >
        Our Services
      </div>

      {SERVICES.map((s, i) => (
        <ServicePill
          key={i}
          frame={frame}
          fps={fps}
          icon={s.icon}
          label={s.label}
          delay={60 + i * 12}
          index={i}
        />
      ))}
    </div>
  );
};

// ─── Scene 3 – CTA ────────────────────────────────────────────────────────────
const CTAUnderline: React.FC<{ frame: number }> = ({ frame }) => {
  // Underline sweeps from 0 to 660px between frames 168–210
  const width = interpolate(frame, [168, 210], [0, 660], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 660,
        height: 5,
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 14,
      }}
    >
      <div
        style={{
          width,
          height: "100%",
          background: `linear-gradient(90deg, ${CORAL}, #ff4e3a)`,
          borderRadius: 3,
          boxShadow: `0 0 16px 4px ${CORAL}88`,
        }}
      />
    </div>
  );
};

const TypewriterPhone: React.FC<{ frame: number }> = ({ frame }) => {
  // Each character appears one per 3 frames starting at frame 180
  const charsToShow = Math.floor(Math.max(0, frame - 180) / 3);
  const visibleText = CLINIC_PHONE.slice(0, charsToShow);

  // Cursor blink: on/off every 15 frames
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;
  const showCursor = charsToShow < CLINIC_PHONE.length || cursorVisible;

  const opacity = interpolate(frame, [178, 190], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        marginTop: 44,
        opacity,
      }}
    >
      {/* Phone icon */}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
          fill={TEAL}
        />
      </svg>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 700,
          fontSize: 42,
          color: WHITE,
          letterSpacing: 1,
        }}
      >
        {visibleText}
        {showCursor && (
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 42,
              backgroundColor: TEAL,
              marginLeft: 3,
              verticalAlign: "text-bottom",
              borderRadius: 1,
            }}
          />
        )}
      </span>
    </div>
  );
};

const CTABlock: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - 150);

  const scale = spring({ frame: f, fps, from: 0.85, to: 1, config: SP });
  const opacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out as scene 4 starts (frame 220–228)
  const fadeOut = interpolate(frame, [220, 228], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: opacity * fadeOut,
        transform: `scale(${scale})`,
      }}
    >
      {/* "Ready?" label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 500,
          fontSize: 22,
          color: MUTED,
          letterSpacing: 4,
          textTransform: "uppercase" as const,
          marginBottom: 24,
        }}
      >
        Schedule Today
      </div>

      {/* CTA headline */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 900,
          fontSize: 64,
          color: WHITE,
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: -2,
          padding: "0 60px",
          textShadow: `0 2px 32px rgba(255,122,102,0.22)`,
        }}
      >
        {CTA_HEADLINE}
      </div>

      {/* Coral animated underline */}
      <CTAUnderline frame={frame} />

      {/* Divider dots */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 36,
          opacity: interpolate(frame, [172, 185], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === 1 ? CORAL : `${CORAL}55`,
            }}
          />
        ))}
      </div>

      {/* Typewriter phone number */}
      <TypewriterPhone frame={frame} />
    </div>
  );
};

// ─── Scene 4 – Outro ──────────────────────────────────────────────────────────
const OutroSweep: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Teal gradient wipe: starts at frame 225, covers full width by frame 255
  const sweepProgress = interpolate(frame, [225, 255], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Clinic name fades back in from frame 235
  const tf = Math.max(0, frame - 235);
  const nameOpacity = interpolate(tf, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameScale = spring({ frame: tf, fps, from: 0.9, to: 1, config: SP });

  // Whole outro block fades in at frame 225
  const blockIn = interpolate(frame, [225, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: blockIn,
        overflow: "hidden",
      }}
    >
      {/* Teal gradient sweep from left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${TEAL}1a 0%, ${TEAL}12 40%, ${TEAL}08 70%, transparent 100%)`,
          opacity: sweepProgress,
        }}
      />

      {/* Horizontal teal band that sweeps across */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: 0,
          width: `${sweepProgress * 100}%`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${TEAL}88, ${TEAL})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: 0,
          width: `${sweepProgress * 100}%`,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${TEAL}44, ${TEAL}66)`,
        }}
      />

      {/* Clinic name + cross fade back in */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          opacity: nameOpacity,
          transform: `scale(${nameScale})`,
        }}
      >
        {/* Cross icon – smaller for outro */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${TEAL}33 0%, transparent 70%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1.5px solid ${TEAL}55`,
            boxShadow: `0 0 24px 8px ${TEAL}44`,
          }}
        >
          <CrossIcon color={TEAL} size={32} />
        </div>

        {/* Clinic name */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: 46,
            color: WHITE,
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: -1,
            padding: "0 60px",
            textShadow: `0 2px 20px ${TEAL}55`,
          }}
        >
          {CLINIC_NAME}
        </div>

        {/* Tagline in teal */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 400,
            fontSize: 22,
            color: TEAL,
            letterSpacing: 0.5,
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          {CLINIC_TAGLINE}
        </div>
      </div>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const ClinicPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene visibility helpers
  const isScene1 = frame < 60;
  const isScene2 = frame >= 55 && frame < 155;
  const isScene3 = frame >= 148 && frame < 230;
  const isScene4 = frame >= 225;

  // Global fade-in on first 8 frames
  const globalIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out in last 5 frames
  const globalOut = interpolate(
    frame,
    [durationInFrames - 5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: globalIn * globalOut,
        overflow: "hidden",
      }}
    >
      {/* Layer 0: persistent background */}
      <Background frame={frame} />

      {/* Layer 1: Scene 1 – Logo */}
      {isScene1 && <LogoBlock frame={frame} fps={fps} />}

      {/* Layer 2: Scene 2 – Services */}
      {isScene2 && <ServicesBlock frame={frame} fps={fps} />}

      {/* Layer 3: Scene 3 – CTA */}
      {isScene3 && <CTABlock frame={frame} fps={fps} />}

      {/* Layer 4: Scene 4 – Outro */}
      {isScene4 && <OutroSweep frame={frame} fps={fps} />}
    </AbsoluteFill>
  );
};

// ─── Remotion root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ClinicPromo"
    component={ClinicPromo}
    durationInFrames={270}
    fps={30}
    width={1080}
    height={1920}
  />
);
