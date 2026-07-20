import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ─── Customizable constants ──────────────────────────────────────────────────
const CLINIC_NAME = "Greenfield Medical Center";
const EMERGENCY_HEADLINE = "Emergency?";
const FOOTER_TEXT =
  "Greenfield Medical Center · For life-threatening emergencies call 911 immediately.";

const EMERGENCY_LINES = [
  { icon: "🏥", label: "Emergency Room", detail: "Open 24 / 7" },
  { icon: "📞", label: "Emergency Line", detail: "(800) 555-9911" },
  { icon: "🚑", label: "Ambulance", detail: "Call 911" },
];

const DURATION_FRAMES = 180;
const STAGGER_FRAMES = 15; // frames between each line reveal
const LINE_START_FRAME = 50; // first line appears at this frame

// Color palette
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";
const DANGER = "#d4503e";

// ─── Spring config helpers ────────────────────────────────────────────────────
const SPRING_STD = { damping: 14, stiffness: 120 };
const SPRING_STIFF = { damping: 11, stiffness: 180 };
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ─── Background — dark BG with danger-tinted radial glow ────────────────────
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  // Very slow pulse on the radial glow to convey urgency
  const pulse = 1 + Math.sin((frame * 0.025) % (Math.PI * 2)) * 0.06;

  return (
    <>
      {/* Base fill */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: BG,
        }}
      />
      {/* Danger glow center-top */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -120,
          width: 860 * pulse,
          height: 860 * pulse,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${DANGER}2a 0%, transparent 66%)`,
          pointerEvents: "none",
        }}
      />
      {/* Secondary coral glow bottom-right */}
      <div
        style={{
          position: "absolute",
          right: -180,
          bottom: 200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CORAL}18 0%, transparent 68%)`,
          pointerEvents: "none",
        }}
      />
      {/* Top-to-bottom subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 14%, transparent 78%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ─── Pulsing alert circle with "!" at center ─────────────────────────────────
const AlertCircle: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Spring scale-in on first appearance
  const springProg = spring({ frame: frame - 0, fps, config: SPRING_STIFF });
  const scaleIn = interpolate(springProg, [0, 1], [0, 1]);

  // Continuous sine pulse between 0.95 and 1.05 once settled
  const sinePhase = frame > 20 ? (frame - 20) * 0.09 : 0;
  const sinePulse = 1 + Math.sin(sinePhase % (Math.PI * 2)) * 0.05;

  const finalScale = scaleIn * sinePulse;

  // Outer ring opacity breathes
  const ringOpacity =
    0.35 + Math.sin((frame * 0.08) % (Math.PI * 2)) * 0.2;

  // "!" fade in slightly delayed
  const bangProg = spring({ frame: frame - 8, fps, config: SPRING_STD });
  const bangOpacity = interpolate(bangProg, [0, 1], [0, 1]);
  const bangScale = interpolate(bangProg, [0, 1], [0.4, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 148,
        left: "50%",
        transform: `translateX(-50%) scale(${finalScale})`,
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: "absolute",
          inset: -28,
          borderRadius: "50%",
          border: `3px solid ${DANGER}`,
          opacity: ringOpacity,
          boxShadow: `0 0 40px ${DANGER}66, 0 0 80px ${DANGER}33`,
        }}
      />
      {/* Second faint ring */}
      <div
        style={{
          position: "absolute",
          inset: -50,
          borderRadius: "50%",
          border: `2px solid ${DANGER}`,
          opacity: ringOpacity * 0.4,
        }}
      />
      {/* Main circle */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 36%, ${DANGER}ee, #8b1c12)`,
          boxShadow: `0 0 50px ${DANGER}88, 0 8px 40px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.12)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Bold "!" */}
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 92,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1,
            textShadow: `0 2px 16px rgba(0,0,0,0.5)`,
            transform: `scale(${bangScale})`,
            opacity: bangOpacity,
            display: "block",
            marginTop: -6,
          }}
        >
          !
        </span>
      </div>
    </div>
  );
};

// ─── "Emergency?" headline ────────────────────────────────────────────────────
const EmergencyHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 16, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [28, 0]);

  // Subtle text glow pulse
  const glowSize = 18 + Math.sin((frame * 0.07) % (Math.PI * 2)) * 6;

  return (
    <div
      style={{
        position: "absolute",
        top: 356,
        left: 60,
        right: 60,
        textAlign: "center",
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 80,
          fontWeight: 900,
          color: DANGER,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textShadow: `0 0 ${glowSize}px ${DANGER}88, 0 4px 24px rgba(0,0,0,0.55)`,
        }}
      >
        {EMERGENCY_HEADLINE}
      </div>
      {/* Underline accent bar */}
      <div
        style={{
          marginTop: 14,
          height: 3,
          background: `linear-gradient(90deg, transparent 0%, ${DANGER} 30%, ${CORAL} 70%, transparent 100%)`,
          borderRadius: 2,
          opacity: 0.85,
        }}
      />
    </div>
  );
};

// ─── Clinic name sub-header ───────────────────────────────────────────────────
const ClinicLabel: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 22, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [16, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {/* Cross icon */}
      <div style={{ position: "relative", width: 24, height: 24, flexShrink: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "38%",
            left: 0,
            right: 0,
            height: "24%",
            background: TEAL,
            borderRadius: 3,
            boxShadow: `0 0 8px ${TEAL}88`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "38%",
            top: 0,
            bottom: 0,
            width: "24%",
            background: TEAL,
            borderRadius: 3,
            boxShadow: `0 0 8px ${TEAL}88`,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: TEAL_SOFT,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {CLINIC_NAME}
      </span>
    </div>
  );
};

// ─── Single emergency info line ───────────────────────────────────────────────
const EmergencyLine: React.FC<{
  icon: string;
  label: string;
  detail: string;
  frame: number;
  startFrame: number;
}> = ({ icon, label, detail, frame, startFrame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - startFrame, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const x = interpolate(prog, [0, 1], [-80, 0]);

  // Pulsing left border brightness
  const borderGlow = 0.7 + Math.sin(((frame - startFrame) * 0.08) % (Math.PI * 2)) * 0.3;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        transform: `translateX(${x}px)`,
        opacity,
      }}
    >
      {/* Coral left border */}
      <div
        style={{
          width: 5,
          alignSelf: "stretch",
          minHeight: 70,
          borderRadius: 3,
          background: `linear-gradient(180deg, ${DANGER}, ${CORAL})`,
          boxShadow: `0 0 ${12 * borderGlow}px ${CORAL}88`,
          flexShrink: 0,
        }}
      />
      {/* Icon bubble */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${DANGER}28 0%, ${CORAL}18 100%)`,
          border: `1.5px solid ${DANGER}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          flexShrink: 0,
          boxShadow: `0 0 18px ${DANGER}22`,
        }}
      >
        {icon}
      </div>
      {/* Text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 19,
            fontWeight: 500,
            color: MUTED,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: WHITE,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            textShadow: `0 0 20px ${CORAL}44`,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
};

// ─── Staggered emergency lines list ──────────────────────────────────────────
const EmergencyLinesList: React.FC<{ frame: number }> = ({ frame }) => {
  // Card container slides down slightly as a whole
  const { fps } = useVideoConfig();
  const cardProg = spring({
    frame: frame - (LINE_START_FRAME - 8),
    fps,
    config: SPRING_STD,
  });
  const cardOpacity = interpolate(cardProg, [0, 0.2], [0, 1], clamp);
  const cardY = interpolate(cardProg, [0, 1], [-12, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 490,
        left: 48,
        right: 48,
        transform: `translateY(${cardY}px)`,
        opacity: cardOpacity,
      }}
    >
      {/* Card shell */}
      <div
        style={{
          background: `linear-gradient(160deg, #0f2520 0%, #091a18 100%)`,
          borderRadius: 28,
          border: `1.5px solid ${DANGER}33`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${DANGER}11, inset 0 1px 0 ${DANGER}22`,
          padding: "44px 40px 44px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 34,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent, ${DANGER}88, ${CORAL}66, transparent)`,
            borderRadius: 1,
            marginBottom: 2,
          }}
        />

        {EMERGENCY_LINES.map((line, i) => (
          <EmergencyLine
            key={line.label}
            icon={line.icon}
            label={line.label}
            detail={line.detail}
            frame={frame}
            startFrame={LINE_START_FRAME + i * STAGGER_FRAMES}
          />
        ))}

        {/* Bottom accent line */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${DANGER}55, transparent)`,
            borderRadius: 1,
            marginTop: 2,
          }}
        />
      </div>
    </div>
  );
};

// ─── Flashing "ACT NOW" urgent pill ──────────────────────────────────────────
const UrgencyPill: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  // Appears after headline
  const prog = spring({ frame: frame - 30, fps, config: SPRING_STIFF });
  const scale = interpolate(prog, [0, 1], [0.6, 1]);
  const opacity = interpolate(prog, [0, 0.25], [0, 1], clamp);

  // Rapid flash for urgency (every ~18 frames)
  const flash = frame > 40
    ? 0.85 + Math.abs(Math.sin((frame - 40) * 0.18)) * 0.15
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 456,
        left: 60,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
        opacity: opacity * flash,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          paddingLeft: 18,
          paddingRight: 22,
          paddingTop: 9,
          paddingBottom: 9,
          borderRadius: 40,
          background: `${DANGER}22`,
          border: `1.5px solid ${DANGER}88`,
          boxShadow: `0 0 16px ${DANGER}44`,
        }}
      >
        {/* Pulsing danger dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: DANGER,
            boxShadow: `0 0 10px ${DANGER}`,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: DANGER,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Act Immediately
        </span>
      </div>
    </div>
  );
};

// ─── Footer bar ───────────────────────────────────────────────────────────────
const Footer: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 100, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [20, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 48,
        right: 48,
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {/* Horizontal rule */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${MUTED}44, transparent)`,
          marginBottom: 18,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 20,
          fontWeight: 400,
          color: MUTED,
          textAlign: "center",
          lineHeight: 1.5,
          letterSpacing: "0.02em",
        }}
      >
        {FOOTER_TEXT}
      </div>
    </div>
  );
};

// ─── Scan-line overlay for high-tension feel ──────────────────────────────────
const ScanLines: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 4px)",
      pointerEvents: "none",
    }}
  />
);

// ─── Edge vignette ────────────────────────────────────────────────────────────
const EdgeVignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)",
      pointerEvents: "none",
    }}
  />
);

// ─── Main composition ─────────────────────────────────────────────────────────
export const EmergencyInfoCard: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  const fadeOut = interpolate(frame, [165, 180], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: fadeIn * fadeOut,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Layered background */}
      <Background frame={frame} />

      {/* Scan lines for urgency texture */}
      <ScanLines />

      {/* Clinic name at top */}
      <Sequence from={0} durationInFrames={DURATION_FRAMES}>
        <ClinicLabel frame={frame} />
      </Sequence>

      {/* Pulsing red alert circle */}
      <Sequence from={0} durationInFrames={DURATION_FRAMES}>
        <AlertCircle frame={frame} />
      </Sequence>

      {/* "Emergency?" headline */}
      <Sequence from={12} durationInFrames={DURATION_FRAMES - 12}>
        <EmergencyHeadline frame={frame} />
      </Sequence>

      {/* Urgency pill badge */}
      <Sequence from={26} durationInFrames={DURATION_FRAMES - 26}>
        <UrgencyPill frame={frame} />
      </Sequence>

      {/* Emergency lines card */}
      <Sequence from={40} durationInFrames={DURATION_FRAMES - 40}>
        <EmergencyLinesList frame={frame} />
      </Sequence>

      {/* Footer */}
      <Sequence from={94} durationInFrames={DURATION_FRAMES - 94}>
        <Footer frame={frame} />
      </Sequence>

      {/* Edge vignette overlay */}
      <EdgeVignette />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="EmergencyInfo"
    component={EmergencyInfoCard}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
