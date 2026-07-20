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
const PATIENT_NAME = "Sarah M.";
const DOCTOR_NAME = "Dr. Elena Reyes";
const SPECIALTY = "Cardiology";
const APPT_DATE = "Friday, June 20";
const APPT_TIME = "10:30 AM";
const CLINIC_NAME = "Greenfield Medical Center";
const CTA_LABEL = "Confirm Appointment";
const DURATION_FRAMES = 180;

// Color palette
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";
const OK = "#2f9e6f";

// ─── Spring config helpers ────────────────────────────────────────────────────
const SPRING_STD = { damping: 14, stiffness: 120 };
const SPRING_STIFF = { damping: 11, stiffness: 180 };
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ─── Ambient background particles ────────────────────────────────────────────
const PARTICLES: [number, number, number, number, number][] = [
  [8, 12, 3, 0.9, 0],
  [18, 78, 2, 1.2, 7],
  [25, 42, 4, 0.7, 3],
  [38, 88, 2, 1.4, 15],
  [50, 18, 3, 1.0, 5],
  [62, 65, 5, 0.6, 12],
  [72, 8, 2, 1.1, 20],
  [80, 82, 3, 0.85, 2],
  [88, 48, 4, 1.3, 9],
  [94, 28, 2, 0.95, 18],
  [15, 55, 3, 1.05, 22],
  [45, 95, 2, 1.15, 11],
  [58, 35, 3, 0.8, 25],
  [76, 60, 4, 1.2, 4],
];

const AmbientParticle: React.FC<{
  xPct: number; yPct: number; size: number; speed: number; phase: number; frame: number;
}> = ({ xPct, yPct, size, speed, phase, frame }) => {
  const f = frame + phase * 4;
  const floatY = Math.sin((f * 0.03 * speed) % (Math.PI * 2)) * 14;
  const floatX = Math.cos((f * 0.02 * speed) % (Math.PI * 2)) * 8;
  const opacity = interpolate(frame, [0, 20], [0, 0.35], clamp) *
    interpolate(frame, [160, 180], [1, 0], clamp);
  const color = (xPct + yPct) % 3 === 0 ? CORAL : TEAL;

  return (
    <div style={{
      position: "absolute",
      left: `${xPct}%`,
      top: `${yPct}%`,
      transform: `translate(${floatX}px, ${floatY}px)`,
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      opacity,
      boxShadow: `0 0 ${size * 4}px ${color}`,
    }} />
  );
};

// ─── Clinic logo / brand mark ─────────────────────────────────────────────────
const BrandMark: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 2, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [-16, 0]);

  return (
    <div style={{
      position: "absolute",
      top: 72,
      left: 0, right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      transform: `translateY(${y}px)`,
      opacity,
    }}>
      {/* Cross / medical icon */}
      <div style={{ position: "relative", width: 44, height: 44 }}>
        {/* Horizontal bar */}
        <div style={{
          position: "absolute",
          top: "38%", left: 0, right: 0,
          height: "24%",
          background: TEAL,
          borderRadius: 4,
          boxShadow: `0 0 12px ${TEAL}88`,
        }} />
        {/* Vertical bar */}
        <div style={{
          position: "absolute",
          left: "38%", top: 0, bottom: 0,
          width: "24%",
          background: TEAL,
          borderRadius: 4,
          boxShadow: `0 0 12px ${TEAL}88`,
        }} />
      </div>
      <div style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: TEAL_SOFT,
        textTransform: "uppercase",
      }}>
        {CLINIC_NAME}
      </div>
    </div>
  );
};

// ─── Patient greeting ─────────────────────────────────────────────────────────
const PatientGreeting: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 14, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [20, 0]);

  return (
    <div style={{
      position: "absolute",
      top: 200,
      left: 60, right: 60,
      transform: `translateY(${y}px)`,
      opacity,
    }}>
      <div style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 32,
        fontWeight: 400,
        color: MUTED,
        letterSpacing: "0.03em",
        marginBottom: 4,
      }}>
        Reminder for
      </div>
      <div style={{
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 62,
        fontWeight: 700,
        color: WHITE,
        letterSpacing: "-0.01em",
        textShadow: `0 0 40px ${TEAL}55`,
        lineHeight: 1.1,
      }}>
        {PATIENT_NAME}
      </div>
    </div>
  );
};

// ─── Inline SVG calendar icon ─────────────────────────────────────────────────
const CalendarSvg: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Body */}
    <rect x="4" y="12" width="56" height="48" rx="7" fill={BG} stroke={TEAL} strokeWidth="3" />
    {/* Header band */}
    <rect x="4" y="12" width="56" height="16" rx="7" fill={TEAL} />
    <rect x="4" y="20" width="56" height="8" fill={TEAL} />
    {/* Ring left */}
    <rect x="18" y="6" width="5" height="14" rx="2.5" fill={TEAL_SOFT} />
    {/* Ring right */}
    <rect x="41" y="6" width="5" height="14" rx="2.5" fill={TEAL_SOFT} />
    {/* Grid dots */}
    {[0, 1, 2, 3].map(col =>
      [0, 1, 2].map(row => (
        <rect
          key={`${col}-${row}`}
          x={15 + col * 12}
          y={36 + row * 10}
          width={6}
          height={6}
          rx={1.5}
          fill={row === 0 && col === 0 ? CORAL : `${TEAL_SOFT}55`}
        />
      ))
    )}
    {/* Highlighted "20" day */}
    <rect x="14" y="35" width="8" height="8" rx="2" fill={`${TEAL}33`} />
    <text x="18" y="42" textAnchor="middle" fill={TEAL} fontSize="7" fontWeight="700">20</text>
  </svg>
);

// ─── Pulsing notification dot ─────────────────────────────────────────────────
const NotifDot: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 38, fps, config: SPRING_STIFF });
  const scale = interpolate(prog, [0, 1], [0, 1]);
  const opacity = interpolate(prog, [0, 0.2], [0, 1], clamp);

  // Continuous pulse loop after spring settles
  const pulse = frame > 50
    ? 1 + Math.sin(((frame - 50) * 0.15) % (Math.PI * 2)) * 0.22
    : 1;

  return (
    <div style={{
      position: "absolute",
      width: 22,
      height: 22,
      top: -5,
      right: -5,
      transform: `scale(${scale * pulse})`,
      opacity,
    }}>
      {/* Outer glow ring */}
      <div style={{
        position: "absolute",
        inset: -4,
        borderRadius: "50%",
        background: `${CORAL}22`,
        boxShadow: `0 0 10px ${CORAL}66`,
      }} />
      {/* Dot */}
      <div style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: CORAL,
        boxShadow: `0 0 14px ${CORAL}`,
        border: `2px solid ${BG}`,
      }} />
    </div>
  );
};

// ─── Calendar icon with bounce ────────────────────────────────────────────────
const CalendarBounce: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 22, fps, config: SPRING_STIFF });
  const scale = interpolate(prog, [0, 1], [0, 1]);
  const opacity = interpolate(prog, [0, 0.15], [0, 1], clamp);

  return (
    <div style={{
      position: "absolute",
      top: 296,
      left: "50%",
      transform: `translateX(-50%) scale(${scale})`,
      opacity,
    }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <CalendarSvg size={120} />
        <NotifDot frame={frame} />
      </div>
    </div>
  );
};

// ─── Individual card field row ────────────────────────────────────────────────
const CardField: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  frame: number;
  startFrame: number;
  accent?: string;
}> = ({ label, value, icon, frame, startFrame, accent }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - startFrame, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [28, 0]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 20,
      transform: `translateY(${y}px)`,
      opacity,
    }}>
      {/* Icon bubble */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: `${TEAL}18`,
        border: `1.5px solid ${TEAL}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 0 14px ${TEAL}22`,
      }}>
        {icon}
      </div>
      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 20,
          fontWeight: 400,
          color: MUTED,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 30,
          fontWeight: 700,
          color: accent || WHITE,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          textShadow: accent ? `0 0 20px ${accent}55` : undefined,
        }}>
          {value}
        </div>
      </div>
    </div>
  );
};

// ─── SVG icons for card fields ────────────────────────────────────────────────
const IconDoctor: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7" r="4" stroke={TEAL} strokeWidth="2" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconSpecialty: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.8l-4.9 2.4.9-5.5L4 7.8l5.5-.8z"
      stroke={TEAL} strokeWidth="2" strokeLinejoin="round" fill={`${TEAL}22`} />
  </svg>
);

const IconClock: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={TEAL} strokeWidth="2" />
    <path d="M12 7v5l3 3" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconPin: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6z"
      stroke={TEAL} strokeWidth="2" fill={`${TEAL}22`} />
    <circle cx="12" cy="8" r="2.5" stroke={TEAL} strokeWidth="1.5" />
  </svg>
);

// ─── Appointment card with staggered fields ───────────────────────────────────
const AppointmentCard: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Card slides up as a whole
  const cardProg = spring({ frame: frame - 50, fps, config: SPRING_STD });
  const cardY = interpolate(cardProg, [0, 1], [80, 0]);
  const cardOpacity = interpolate(cardProg, [0, 0.15], [0, 1], clamp);

  const FIELDS = [
    { label: "Doctor", value: DOCTOR_NAME, icon: <IconDoctor />, startFrame: 62, accent: TEAL_SOFT },
    { label: "Specialty", value: SPECIALTY, icon: <IconSpecialty />, startFrame: 74, accent: undefined },
    { label: "Date & Time", value: `${APPT_DATE} · ${APPT_TIME}`, icon: <IconClock />, startFrame: 86, accent: TEAL },
    { label: "Location", value: CLINIC_NAME, icon: <IconPin />, startFrame: 98, accent: undefined },
  ];

  return (
    <div style={{
      position: "absolute",
      top: 456,
      left: 48, right: 48,
      transform: `translateY(${cardY}px)`,
      opacity: cardOpacity,
    }}>
      {/* Card shell */}
      <div style={{
        background: `linear-gradient(160deg, #0f2825 0%, #091a18 100%)`,
        borderRadius: 28,
        border: `1.5px solid ${TEAL}33`,
        boxShadow: `0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px ${TEAL}11, inset 0 1px 0 ${TEAL}22`,
        padding: "44px 40px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}>
        {/* Card header rule */}
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${TEAL}88, transparent)`,
          borderRadius: 1,
          marginBottom: 4,
        }} />

        {FIELDS.map((f) => (
          <CardField
            key={f.label}
            label={f.label}
            value={f.value}
            icon={f.icon}
            frame={frame}
            startFrame={f.startFrame}
            accent={f.accent}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Status badge (small "Upcoming" pill) ─────────────────────────────────────
const StatusBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 56, fps, config: SPRING_STD });
  const scale = interpolate(prog, [0, 1], [0.7, 1]);
  const opacity = interpolate(prog, [0, 0.3], [0, 1], clamp);

  return (
    <div style={{
      position: "absolute",
      top: 408,
      left: 60,
      transform: `scale(${scale})`,
      transformOrigin: "left center",
      opacity,
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 14, paddingRight: 18,
        paddingTop: 7, paddingBottom: 7,
        borderRadius: 40,
        background: `${OK}22`,
        border: `1.5px solid ${OK}66`,
      }}>
        <div style={{
          width: 8, height: 8,
          borderRadius: "50%",
          background: OK,
          boxShadow: `0 0 8px ${OK}`,
        }} />
        <span style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 22,
          fontWeight: 600,
          color: OK,
          letterSpacing: "0.05em",
        }}>
          Upcoming
        </span>
      </div>
    </div>
  );
};

// ─── CTA button ───────────────────────────────────────────────────────────────
const CTAButton: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 122, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [24, 0]);

  // Subtle shimmer pulse on the button
  const shimmer = 1 + Math.sin(((frame - 130) * 0.12) % (Math.PI * 2)) * 0.04;

  return (
    <div style={{
      position: "absolute",
      bottom: 90,
      left: 48, right: 48,
      transform: `translateY(${y}px)`,
      opacity,
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${TEAL} 0%, #0d9d91 100%)`,
        borderRadius: 22,
        paddingTop: 30, paddingBottom: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        boxShadow: `0 0 ${40 * shimmer}px ${TEAL}55, 0 16px 40px rgba(18,181,168,0.3)`,
        transform: `scale(${shimmer})`,
      }}>
        {/* Checkmark icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.18)" />
          <path d="M7 12l3.5 3.5L17 9" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 34,
          fontWeight: 700,
          color: WHITE,
          letterSpacing: "0.01em",
        }}>
          {CTA_LABEL}
        </span>
      </div>
    </div>
  );
};

// ─── Background ambient glow orbs ────────────────────────────────────────────
const GlowOrb: React.FC<{
  x: number; y: number; radius: number; color: string; frame: number; startFrame: number;
}> = ({ x, y, radius, color, frame, startFrame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 40 } });
  const pulse = 1 + Math.sin((frame * 0.04) % (Math.PI * 2)) * 0.05;

  return (
    <div style={{
      position: "absolute",
      left: x - radius * pulse,
      top: y - radius * pulse,
      width: radius * 2 * pulse,
      height: radius * 2 * pulse,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}33 0%, transparent 68%)`,
      opacity: prog * 0.7,
      pointerEvents: "none",
    }} />
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const AppointmentReminder: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  const fadeOut = interpolate(frame, [165, 180], [1, 0], clamp);

  return (
    <AbsoluteFill style={{
      background: BG,
      overflow: "hidden",
      opacity: fadeIn * fadeOut,
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    }}>
      {/* Ambient glow orbs */}
      <GlowOrb x={540} y={300} radius={420} color={TEAL} frame={frame} startFrame={0} />
      <GlowOrb x={900} y={1400} radius={320} color={CORAL} frame={frame} startFrame={8} />
      <GlowOrb x={100} y={900} radius={260} color={TEAL} frame={frame} startFrame={4} />

      {/* Ambient particles */}
      {PARTICLES.map(([xPct, yPct, size, speed, phase], i) => (
        <AmbientParticle
          key={i}
          xPct={xPct} yPct={yPct}
          size={size} speed={speed} phase={phase}
          frame={frame}
        />
      ))}

      {/* Top vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 18%, transparent 80%, rgba(0,0,0,0.45) 100%)",
        pointerEvents: "none",
      }} />

      {/* Clinic brand mark */}
      <Sequence from={0} durationInFrames={DURATION_FRAMES}>
        <BrandMark frame={frame} />
      </Sequence>

      {/* Patient name greeting */}
      <Sequence from={10} durationInFrames={DURATION_FRAMES - 10}>
        <PatientGreeting frame={frame} />
      </Sequence>

      {/* Calendar icon bounces in */}
      <Sequence from={18} durationInFrames={DURATION_FRAMES - 18}>
        <CalendarBounce frame={frame} />
      </Sequence>

      {/* "Upcoming" status badge */}
      <Sequence from={48} durationInFrames={DURATION_FRAMES - 48}>
        <StatusBadge frame={frame} />
      </Sequence>

      {/* Appointment card slides up + fields stagger */}
      <Sequence from={44} durationInFrames={DURATION_FRAMES - 44}>
        <AppointmentCard frame={frame} />
      </Sequence>

      {/* CTA button fades in last */}
      <Sequence from={116} durationInFrames={DURATION_FRAMES - 116}>
        <CTAButton frame={frame} />
      </Sequence>

      {/* Edge vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="AppointmentReminder"
    component={AppointmentReminder}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
