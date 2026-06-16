import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Config ─────────────────────────────────────────────────────────────────
const DOCTOR_NAME = "Dr. Elena Reyes";
const DOCTOR_INITIALS = "ER";
const SPECIALTY = "Cardiologist · MD, PhD";
const CLINIC_NAME = "Greenfield Medical Center";

const CREDENTIALS = [
  { label: "15+ Years Exp.", delay: 100 },
  { label: "Board Certified", delay: 118 },
  { label: "500+ Reviews ⭐", delay: 136 },
];

const CTA_TEXT = "Book a Consultation";

// ── Palette ────────────────────────────────────────────────────────────────
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const MUTED = "#6b9e99";

// ── Spring helper ──────────────────────────────────────────────────────────
const SP_CONFIG = { damping: 14, stiffness: 120 };

// ── Background glow layer ──────────────────────────────────────────────────
const BackgroundGlow: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse 700px 700px at 50% 38%, ${TEAL}22 0%, transparent 70%)`,
    }}
  />
);

// ── Subtle grid pattern overlay ────────────────────────────────────────────
const GridOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 40], [0, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        backgroundImage: `
          linear-gradient(${TEAL}80 1px, transparent 1px),
          linear-gradient(90deg, ${TEAL}80 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />
  );
};

// ── Avatar circle ──────────────────────────────────────────────────────────
const Avatar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: SP_CONFIG,
  });

  const ringOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringScale = spring({
    frame: Math.max(0, frame - 10),
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 12, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: "relative",
        width: 280,
        height: 280,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
      }}
    >
      {/* Outer pulse ring */}
      <div
        style={{
          position: "absolute",
          width: 296,
          height: 296,
          borderRadius: "50%",
          border: `3px solid ${TEAL}`,
          opacity: ringOpacity * 0.4,
          transform: `scale(${ringScale})`,
        }}
      />
      {/* Inner ring */}
      <div
        style={{
          position: "absolute",
          width: 310,
          height: 310,
          borderRadius: "50%",
          border: `1.5px solid ${TEAL}`,
          opacity: ringOpacity * 0.2,
        }}
      />
      {/* Avatar body */}
      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: `linear-gradient(145deg, ${TEAL} 0%, #0d8a80 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 60px ${TEAL}55, 0 0 120px ${TEAL}22`,
          border: `4px solid ${TEAL}66`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: 80,
            color: WHITE,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          {DOCTOR_INITIALS}
        </span>
      </div>
    </div>
  );
};

// ── Clinic badge ───────────────────────────────────────────────────────────
const ClinicBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 25);
  const opacity = interpolate(delayed, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = spring({
    frame: delayed,
    fps,
    from: -12,
    to: 0,
    config: SP_CONFIG,
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: `${TEAL}18`,
        border: `1px solid ${TEAL}44`,
        borderRadius: 100,
        paddingInline: 20,
        paddingBlock: 8,
        marginBottom: 32,
      }}
    >
      {/* Heart-pulse icon (SVG inline) */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12h4l3-7 4 14 3-7h4"
          stroke={TEAL}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 600,
          fontSize: 22,
          color: TEAL,
          letterSpacing: 0.3,
        }}
      >
        {CLINIC_NAME}
      </span>
    </div>
  );
};

// ── Doctor name & specialty ────────────────────────────────────────────────
const DoctorNameBlock: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const nameDelayed = Math.max(0, frame - 38);
  const specialtyDelayed = Math.max(0, frame - 55);

  const nameOpacity = interpolate(nameDelayed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameY = spring({
    frame: nameDelayed,
    fps,
    from: 24,
    to: 0,
    config: SP_CONFIG,
  });

  const specOpacity = interpolate(specialtyDelayed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const specY = spring({
    frame: specialtyDelayed,
    fps,
    from: 20,
    to: 0,
    config: SP_CONFIG,
  });

  return (
    <div style={{ textAlign: "center", marginBottom: 40 }}>
      <div
        style={{
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 800,
          fontSize: 64,
          color: WHITE,
          letterSpacing: -1.5,
          lineHeight: 1.1,
          marginBottom: 10,
        }}
      >
        {DOCTOR_NAME}
      </div>
      <div
        style={{
          opacity: specOpacity,
          transform: `translateY(${specY}px)`,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 500,
          fontSize: 32,
          color: MUTED,
          letterSpacing: 0.5,
        }}
      >
        {SPECIALTY}
      </div>
    </div>
  );
};

// ── Credential pill ────────────────────────────────────────────────────────
const CredentialPill: React.FC<{
  label: string;
  frame: number;
  fps: number;
  delay: number;
}> = ({ label, frame, fps, delay }) => {
  const delayed = Math.max(0, frame - delay);

  const scale = spring({
    frame: delayed,
    fps,
    from: 0,
    to: 1,
    config: { damping: 13, stiffness: 160 },
  });

  const opacity = interpolate(delayed, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        backgroundColor: `${TEAL_SOFT}12`,
        border: `1.5px solid ${TEAL}55`,
        borderRadius: 100,
        paddingInline: 28,
        paddingBlock: 12,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontWeight: 600,
        fontSize: 24,
        color: TEAL_SOFT,
        whiteSpace: "nowrap",
        letterSpacing: 0.2,
      }}
    >
      {label}
    </div>
  );
};

// ── Credential pills row ───────────────────────────────────────────────────
const CredentialPills: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "center",
      marginBottom: 60,
    }}
  >
    {CREDENTIALS.map((cred) => (
      <CredentialPill
        key={cred.label}
        label={cred.label}
        frame={frame}
        fps={fps}
        delay={cred.delay}
      />
    ))}
  </div>
);

// ── Divider line ───────────────────────────────────────────────────────────
const Divider: React.FC<{ frame: number }> = ({ frame }) => {
  const width = interpolate(frame, [70, 110], [0, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [70, 90], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)`,
        opacity,
        marginBottom: 60,
      }}
    />
  );
};

// ── Shimmer sweep across card ──────────────────────────────────────────────
const ShimmerSweep: React.FC<{ frame: number }> = ({ frame }) => {
  // Sweeps between frame 80 and 130
  const rawX = interpolate(frame, [80, 130], [-120, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [80, 88, 122, 130], [0, 0.6, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 200,
          left: "50%",
          transform: `translateX(calc(-50% + ${rawX}%))`,
          background: `linear-gradient(105deg, transparent 20%, ${WHITE}14 50%, transparent 80%)`,
          opacity,
        }}
      />
    </div>
  );
};

// ── CTA button ────────────────────────────────────────────────────────────
const CTAButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 155);

  const scale = spring({
    frame: delayed,
    fps,
    from: 0.7,
    to: 1,
    config: SP_CONFIG,
  });

  const opacity = interpolate(delayed, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        background: `linear-gradient(135deg, ${TEAL} 0%, #0d9e93 100%)`,
        borderRadius: 100,
        paddingInline: 72,
        paddingBlock: 26,
        boxShadow: `0 8px 40px ${TEAL}55`,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Calendar icon */}
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke={WHITE} strokeWidth="2" />
        <path d="M3 9h18" stroke={WHITE} strokeWidth="2" />
        <path d="M8 2v4M16 2v4" stroke={WHITE} strokeWidth="2" strokeLinecap="round" />
        <path d="M7 13h4M7 17h6" stroke={WHITE} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontWeight: 700,
          fontSize: 32,
          color: WHITE,
          letterSpacing: 0.3,
        }}
      >
        {CTA_TEXT}
      </span>
    </div>
  );
};

// ── Main composition ───────────────────────────────────────────────────────
export const DoctorIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Overall card fade-in
  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <BackgroundGlow />
      <GridOverlay frame={frame} />

      {/* Main card */}
      <AbsoluteFill
        style={{
          opacity: cardOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingInline: 80,
          paddingBlock: 60,
          gap: 0,
        }}
      >
        {/* Top clinic badge */}
        <ClinicBadge frame={frame} fps={fps} />

        {/* Avatar */}
        <div style={{ marginBottom: 40 }}>
          <Avatar frame={frame} fps={fps} />
        </div>

        {/* Name + specialty */}
        <DoctorNameBlock frame={frame} fps={fps} />

        {/* Animated divider */}
        <Divider frame={frame} />

        {/* Credential pills */}
        <CredentialPills frame={frame} fps={fps} />

        {/* CTA */}
        <CTAButton frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Shimmer sweep (layered above content) */}
      <ShimmerSweep frame={frame} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ──────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="DoctorIntro"
    component={DoctorIntro}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
  />
);
