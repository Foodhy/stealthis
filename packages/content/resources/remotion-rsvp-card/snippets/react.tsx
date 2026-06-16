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

// ─── Palette ────────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#F0F4F8",
  card: "#FFFFFF",
  green: "#22C55E",
  greenDark: "#16A34A",
  greenLight: "#DCFCE7",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  shadow: "rgba(0,0,0,0.12)",
  buttonPrimary: "#22C55E",
  buttonSecondary: "#F3F4F6",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useSpring(frame: number, delay: number, config?: { damping?: number; stiffness?: number; mass?: number }) {
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: {
      damping: config?.damping ?? 14,
      stiffness: config?.stiffness ?? 120,
      mass: config?.mass ?? 1,
    },
  });
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

// ─── Background with subtle grid ─────────────────────────────────────────────
const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #EFF6FF 0%, #F0FDF4 50%, #F0F4F8 100%)",
      }}
    >
      {/* Subtle dot grid */}
      {Array.from({ length: 12 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <div
            key={`${row}-${col}`}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: "rgba(34,197,94,0.15)",
              left: col * 98 + 40,
              top: row * 98 + 40,
            }}
          />
        ))
      )}
      {/* Large decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          top: -80,
          right: -60,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          bottom: -60,
          left: -40,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Animated Checkmark ───────────────────────────────────────────────────────
const CheckmarkCircle: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const circleScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 11, stiffness: 100, mass: 0.8 },
  });

  const checkProgress = interpolate(frame, [20, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const ringOpacity = interpolate(frame, [5, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SVG check path length ~ 65
  const pathLength = 65;
  const strokeDashoffset = pathLength * (1 - checkProgress);

  const pulseScale = interpolate(
    frame,
    [40, 52, 60],
    [1, 1.08, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          transform: `scale(${circleScale * pulseScale})`,
          position: "relative",
        }}
      >
        {/* Outer glow ring */}
        <div
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: "50%",
            border: `3px solid ${COLORS.green}`,
            opacity: ringOpacity * 0.25,
          }}
        />
        {/* Green circle */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenDark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 30px rgba(34,197,94,0.35)`,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ overflow: "visible" }}
          >
            <path
              d="M10 25 L20 35 L38 14"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              strokeDashoffset={strokeDashoffset}
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Calendar Icon ────────────────────────────────────────────────────────────
const CalendarIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = COLORS.green,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M2 8h16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 2v4M14 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="5.5" y="11" width="3" height="3" rx="0.5" fill={color} opacity="0.7" />
    <rect x="10.5" y="11" width="3" height="3" rx="0.5" fill={color} opacity="0.4" />
  </svg>
);

// ─── Location Icon ────────────────────────────────────────────────────────────
const LocationIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = COLORS.textSecondary,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M10 2C7.24 2 5 4.24 5 7C5 11 10 17 10 17C10 17 15 11 15 7C15 4.24 12.76 2 10 2Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="10" cy="7" r="1.8" fill={color} opacity="0.7" />
  </svg>
);

// ─── Clock Icon ───────────────────────────────────────────────────────────────
const ClockIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = COLORS.textSecondary,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M10 6v4l2.5 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Users Icon ───────────────────────────────────────────────────────────────
const UsersIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = COLORS.textSecondary,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="8" cy="7" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M2 17c0-3.31 2.69-6 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="15" cy="8" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
    <path d="M13 17c0-2.76 2.24-5 5-5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ─── Detail Row ───────────────────────────────────────────────────────────────
interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  frame: number;
  delay: number;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, subValue, frame, delay }) => {
  const opacity = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [delay, delay + 14], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "12px 0",
        opacity,
        transform: `translateY(${translateY}px)`,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: COLORS.greenLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: COLORS.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 17,
            fontWeight: 600,
            color: COLORS.textPrimary,
            lineHeight: 1.3,
          }}
        >
          {value}
        </div>
        {subValue && (
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 14,
              color: COLORS.textSecondary,
              marginTop: 1,
            }}
          >
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Action Button ────────────────────────────────────────────────────────────
interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  primary?: boolean;
  frame: number;
  delay: number;
  offsetX?: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  primary = false,
  frame,
  delay,
  offsetX = 0,
}) => {
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 130, mass: 0.9 },
  });

  const translateY = interpolate(progress, [0, 1], [18, 0]);
  const opacity = interpolate(progress, [0, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: primary ? COLORS.buttonPrimary : COLORS.buttonSecondary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity,
        transform: `translateY(${translateY}px) translateX(${offsetX}px)`,
        boxShadow: primary ? "0 4px 16px rgba(34,197,94,0.3)" : "none",
        border: primary ? "none" : `1.5px solid ${COLORS.border}`,
      }}
    >
      {icon && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {icon}
        </div>
      )}
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 15,
          fontWeight: 700,
          color: primary ? "#FFFFFF" : COLORS.textPrimary,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Confetti Particle ────────────────────────────────────────────────────────
const ConfettiParticle: React.FC<{
  frame: number;
  seed: number;
  startFrame: number;
}> = ({ frame, seed, startFrame }) => {
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const pseudoRandom = (n: number) => ((Math.sin(seed * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;

  const x = pseudoRandom(1) * 1080;
  const startY = pseudoRandom(2) * 200 + 50;
  const hue = pseudoRandom(3) * 360;
  const size = pseudoRandom(4) * 8 + 5;
  const speed = pseudoRandom(5) * 2 + 1.5;
  const rotSpeed = (pseudoRandom(6) - 0.5) * 8;
  const drift = (pseudoRandom(7) - 0.5) * 120;

  const y = startY + localFrame * speed;
  const rot = localFrame * rotSpeed;
  const curX = x + drift * (localFrame / 60);
  const opacity = interpolate(localFrame, [0, 8, 45, 70], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: curX,
        top: y,
        width: size,
        height: size * 0.5,
        backgroundColor: `hsl(${hue}, 80%, 60%)`,
        borderRadius: 2,
        transform: `rotate(${rot}deg)`,
        opacity,
      }}
    />
  );
};

// ─── Main Card ────────────────────────────────────────────────────────────────
const RSVPCard: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const cardScale = spring({
    frame: frame - 0,
    fps,
    config: { damping: 13, stiffness: 110, mass: 0.85 },
  });

  const cardOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const subtitleOpacity = interpolate(frame, [35, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [35, 48], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const dividerWidth = interpolate(frame, [38, 58], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const titleY = interpolate(titleSpring, [0, 1], [16, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Badge pulse
  const badgePulse = interpolate(
    frame,
    [55, 65, 75],
    [1, 1.05, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: 640,
        backgroundColor: COLORS.card,
        borderRadius: 28,
        padding: "44px 48px 40px",
        boxShadow: `0 20px 60px ${COLORS.shadow}, 0 4px 16px rgba(0,0,0,0.06)`,
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top badge */}
      <div
        style={{
          alignSelf: "flex-start",
          backgroundColor: COLORS.greenLight,
          borderRadius: 100,
          padding: "5px 14px",
          marginBottom: 22,
          transform: `scale(${badgePulse})`,
          opacity: interpolate(frame, [8, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.greenDark,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          ✓ Registration Confirmed
        </span>
      </div>

      {/* Checkmark */}
      <CheckmarkCircle frame={frame} />

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 6,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h1
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 34,
            fontWeight: 800,
            color: COLORS.textPrimary,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          You're Confirmed!
        </h1>
      </div>

      {/* Subtitle */}
      <div
        style={{
          textAlign: "center",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 16,
            color: COLORS.textSecondary,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          We're excited to see you there. A confirmation email has been sent to{" "}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>alex@example.com</span>
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 2,
          backgroundColor: COLORS.greenLight,
          borderRadius: 2,
          marginBottom: 4,
          width: `${dividerWidth}%`,
        }}
      />

      {/* Detail rows */}
      <div style={{ marginBottom: 28 }}>
        <DetailRow
          icon={<CalendarIcon size={18} color={COLORS.greenDark} />}
          label="Event"
          value="Design Systems Summit 2026"
          subValue="Annual design & engineering conference"
          frame={frame}
          delay={52}
        />
        <DetailRow
          icon={<ClockIcon size={18} color={COLORS.greenDark} />}
          label="Date & Time"
          value="Saturday, July 19, 2026"
          subValue="9:00 AM – 6:00 PM PDT"
          frame={frame}
          delay={60}
        />
        <DetailRow
          icon={<LocationIcon size={18} color={COLORS.greenDark} />}
          label="Location"
          value="Moscone Center West"
          subValue="747 Howard St, San Francisco, CA"
          frame={frame}
          delay={68}
        />
        <DetailRow
          icon={<UsersIcon size={18} color={COLORS.greenDark} />}
          label="Ticket"
          value="General Admission — 1 Attendee"
          subValue="Seat #G-142 · Order #DSS-2026-08841"
          frame={frame}
          delay={76}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <ActionButton
          label="Add to Calendar"
          icon={<CalendarIcon size={16} color="#FFFFFF" />}
          primary
          frame={frame}
          delay={90}
        />
        <ActionButton
          label="View Details"
          frame={frame}
          delay={96}
        />
      </div>
    </div>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────
export const RemotionRsvpCard: React.FC = () => {
  const frame = useCurrentFrame();

  const confettiSeeds = Array.from({ length: 18 }, (_, i) => i);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background />

      {/* Confetti burst on confirmation */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {confettiSeeds.map((seed) => (
          <ConfettiParticle
            key={seed}
            frame={frame}
            seed={seed}
            startFrame={40}
          />
        ))}
      </AbsoluteFill>

      {/* Centered card */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RSVPCard frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionRsvpCard"
    component={RemotionRsvpCard}
    durationInFrames={120}
    fps={30}
    width={1080}
    height={1080}
  />
);
