import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Config constants (swap these to rebrand) ───────────────────────────
const CLINIC_NAME = "Greenfield Medical Center";
const DRUG_NAME = "Cardomax";
const DRUG_DOSE = "10 mg";
const DRUG_SCHEDULE = "Once daily";
const DISCLAIMER = "Consult your doctor before making any changes.";

// ── Color palette ──────────────────────────────────────────────────────
const BG = "#f1f7f6";
const INK = "#0d2b27";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const MUTED = "#6b9e99";
const WHITE = "#ffffff";
const TEAL_DARK = "#0a8f85";

// ── Spring config (shared) ─────────────────────────────────────────────
const SP = { damping: 14, stiffness: 120 };

// ── Helpers ────────────────────────────────────────────────────────────
function fadeIn(frame: number, start: number, end: number): number {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideX(frame: number, start: number, end: number, from: number): number {
  return interpolate(frame, [start, end], [from, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ── PillIcon: decorative SVG pill ─────────────────────────────────────
const PillIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    width={size}
    height={size * 0.46}
    viewBox="0 0 120 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Capsule body */}
    <rect x="1" y="1" width="118" height="53" rx="26.5" fill={WHITE} stroke={color} strokeWidth="3" />
    {/* Left half fill */}
    <path d="M1 27.5C1 14.0 13.0 1 26.5 1H60V54H26.5C13.0 54 1 41.0 1 27.5Z" fill={color} />
    {/* Center divider */}
    <line x1="60" y1="3" x2="60" y2="52" stroke={color} strokeWidth="2.5" />
    {/* Shine on left half */}
    <ellipse cx="30" cy="18" rx="12" ry="6" fill="rgba(255,255,255,0.25)" />
  </svg>
);

// ── ClockIcon ─────────────────────────────────────────────────────────
const ClockIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="21" stroke={color} strokeWidth="3" fill={TEAL_SOFT} />
    <line x1="24" y1="12" x2="24" y2="24" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="24" y1="24" x2="33" y2="29" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="24" cy="24" r="2.5" fill={color} />
  </svg>
);

// ── WaterDropIcon ─────────────────────────────────────────────────────
const WaterDropIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path
      d="M24 6C24 6 10 20 10 30C10 38 16.3 44 24 44C31.7 44 38 38 38 30C38 20 24 6 24 6Z"
      fill={TEAL_SOFT}
      stroke={color}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <ellipse cx="19" cy="28" rx="3.5" ry="6" fill="rgba(255,255,255,0.55)" />
  </svg>
);

// ── CalendarCheckIcon ─────────────────────────────────────────────────
const CalendarCheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="5" y="9" width="38" height="34" rx="5" fill={TEAL_SOFT} stroke={color} strokeWidth="3" />
    <line x1="5" y1="20" x2="43" y2="20" stroke={color} strokeWidth="2.5" />
    <line x1="16" y1="5" x2="16" y2="14" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="32" y1="5" x2="32" y2="14" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Check mark */}
    <polyline points="15,30 21,36 33,26" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ── CheckCircle: animating teal check badge ────────────────────────────
const CheckCircle: React.FC<{ frame: number; fps: number; delay: number }> = ({
  frame,
  fps,
  delay,
}) => {
  const f = Math.max(0, frame - delay);
  const scale = spring({ frame: f, fps, from: 0, to: 1, config: SP });
  const opacity = fadeIn(f, 0, 8);

  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: TEAL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        opacity,
        flexShrink: 0,
        boxShadow: `0 0 10px ${TEAL}55`,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline
          points="3,8 6.5,11.5 13,5"
          stroke={WHITE}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

// ── Step data ─────────────────────────────────────────────────────────
interface Step {
  icon: React.FC<{ size: number; color: string }>;
  text: string;
  sub: string;
}

const STEPS: Step[] = [
  {
    icon: ClockIcon,
    text: "Take with food in the morning",
    sub: "Best absorbed with breakfast",
  },
  {
    icon: WaterDropIcon,
    text: "Drink a full glass of water",
    sub: "At least 240 mL (8 fl oz)",
  },
  {
    icon: CalendarCheckIcon,
    text: "Do not skip doses",
    sub: "Same time every day for best results",
  },
];

// ── LeftPanel: pill + drug identity ───────────────────────────────────
const LeftPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const panelX = slideX(frame, 0, 22, -340);
  const opacity = fadeIn(frame, 0, 18);

  // Inner items stagger
  const pillScale = spring({ frame: Math.max(0, frame - 4), fps, from: 0.7, to: 1, config: SP });
  const labelOpacity = fadeIn(Math.max(0, frame - 10), 0, 14);
  const doseOpacity = fadeIn(Math.max(0, frame - 18), 0, 14);
  const tagScale = spring({ frame: Math.max(0, frame - 24), fps, from: 0, to: 1, config: SP });

  return (
    <div
      style={{
        width: 420,
        height: "100%",
        background: `linear-gradient(160deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 40px",
        gap: 0,
        transform: `translateX(${panelX}px)`,
        opacity,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Background circle decoration */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }}
      />

      {/* Clinic name badge */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: labelOpacity,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.65)",
        }}
      >
        {CLINIC_NAME}
      </div>

      {/* Pill icon */}
      <div
        style={{
          transform: `scale(${pillScale})`,
          marginBottom: 32,
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.22))",
        }}
      >
        <PillIcon size={160} color={WHITE} />
      </div>

      {/* Drug name */}
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 700,
          fontSize: 52,
          color: WHITE,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {DRUG_NAME}
      </div>

      {/* Dose line */}
      <div
        style={{
          opacity: doseOpacity,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 400,
          fontSize: 20,
          color: "rgba(255,255,255,0.80)",
          marginTop: 10,
          letterSpacing: "0.04em",
          textAlign: "center",
        }}
      >
        {DRUG_DOSE} · {DRUG_SCHEDULE}
      </div>

      {/* "Rx" tag */}
      <div
        style={{
          marginTop: 28,
          transform: `scale(${tagScale})`,
          background: "rgba(255,255,255,0.15)",
          border: "1.5px solid rgba(255,255,255,0.35)",
          borderRadius: 24,
          padding: "6px 18px",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: "0.1em",
          color: WHITE,
          textTransform: "uppercase",
        }}
      >
        Prescription Only
      </div>
    </div>
  );
};

// ── SingleStep: one animated instruction row ───────────────────────────
const SingleStep: React.FC<{
  step: Step;
  index: number;
  frame: number;
  fps: number;
  baseDelay: number;
}> = ({ step, index, frame, fps, baseDelay }) => {
  const delay = baseDelay + index * 20;
  const f = Math.max(0, frame - delay);

  const rowOpacity = fadeIn(f, 0, 14);
  const rowY = interpolate(f, [0, 18], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const iconScale = spring({ frame: Math.max(0, f - 4), fps, from: 0.6, to: 1, config: SP });

  return (
    <div
      style={{
        opacity: rowOpacity,
        transform: `translateY(${rowY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "18px 22px",
        background: WHITE,
        borderRadius: 16,
        boxShadow: "0 2px 16px rgba(18,181,168,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        border: `1.5px solid ${TEAL_SOFT}`,
      }}
    >
      {/* Step number badge */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: TEAL_SOFT,
          border: `2px solid ${TEAL}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: TEAL_DARK,
        }}
      >
        {index + 1}
      </div>

      {/* Icon */}
      <div style={{ transform: `scale(${iconScale})`, flexShrink: 0 }}>
        <step.icon size={40} color={TEAL} />
      </div>

      {/* Text block */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 600,
            fontSize: 17,
            color: INK,
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {step.text}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: MUTED,
          }}
        >
          {step.sub}
        </div>
      </div>

      {/* Check circle */}
      <CheckCircle frame={f} fps={fps} delay={20} />
    </div>
  );
};

// ── RightPanel: header + three steps + disclaimer ─────────────────────
const RightPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const RIGHT_DELAY = 14;

  const panelOpacity = fadeIn(Math.max(0, frame - RIGHT_DELAY), 0, 18);
  const headingY = interpolate(Math.max(0, frame - RIGHT_DELAY), [0, 20], [-18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headingOpacity = fadeIn(Math.max(0, frame - RIGHT_DELAY), 0, 18);

  // Divider line
  const lineWidth = interpolate(Math.max(0, frame - (RIGHT_DELAY + 8)), [0, 22], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Disclaimer
  const disclaimerOpacity = fadeIn(Math.max(0, frame - 200), 0, 18);

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 52px",
        gap: 0,
        opacity: panelOpacity,
      }}
    >
      {/* Section header */}
      <div
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 500,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: TEAL,
            marginBottom: 6,
          }}
        >
          How to take it
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color: INK,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Your Daily Guide
        </div>
      </div>

      {/* Accent line */}
      <div
        style={{
          height: 3,
          width: `${lineWidth}%`,
          background: `linear-gradient(90deg, ${TEAL} 0%, ${TEAL_SOFT} 100%)`,
          borderRadius: 2,
          marginBottom: 28,
        }}
      />

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {STEPS.map((step, i) => (
          <SingleStep
            key={step.text}
            step={step}
            index={i}
            frame={frame}
            fps={fps}
            baseDelay={30 + i * 20}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: 24,
          opacity: disclaimerOpacity,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: MUTED,
          textAlign: "center",
          letterSpacing: "0.01em",
          lineHeight: 1.5,
        }}
      >
        {DISCLAIMER}
      </div>
    </div>
  );
};

// ── Background decorations ─────────────────────────────────────────────
const BackgroundDecor: React.FC = () => (
  <>
    {/* Subtle top-right blob */}
    <div
      style={{
        position: "absolute",
        top: -120,
        right: -80,
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${TEAL_SOFT} 0%, transparent 70%)`,
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
    {/* Bottom-left faint blob */}
    <div
      style={{
        position: "absolute",
        bottom: -100,
        left: 360,
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${TEAL_SOFT} 0%, transparent 70%)`,
        pointerEvents: "none",
        opacity: 0.45,
      }}
    />
    {/* Fine dot grid pattern via repeating-linear-gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(circle, rgba(18,181,168,0.08) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }}
    />
  </>
);

// ── Main composition ───────────────────────────────────────────────────
export const MedicationGuide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <BackgroundDecor />

      {/* Left panel */}
      <LeftPanel frame={frame} fps={fps} />

      {/* Thin separator */}
      <div
        style={{
          width: 1,
          height: "100%",
          background: `linear-gradient(180deg, transparent 0%, ${TEAL}44 30%, ${TEAL}44 70%, transparent 100%)`,
          flexShrink: 0,
          opacity: interpolate(frame, [16, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Right panel */}
      <RightPanel frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="MedicationGuide"
    component={MedicationGuide}
    durationInFrames={270}
    fps={30}
    width={1280}
    height={720}
  />
);
