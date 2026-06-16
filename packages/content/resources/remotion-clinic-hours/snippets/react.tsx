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
const SUBTITLE = "Operating Hours";
const TODAY_IS_OPEN = true;
const SHOW_OPEN_BANNER = true;
const DURATION_FRAMES = 150;

const SPRING_CFG = { damping: 14, stiffness: 120, mass: 1 } as const;

// Color palette
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";
const OK = "#2f9e6f";

// Hours schedule: [day label, hours string, dot color, note?]
const HOURS: { day: string; time: string; dot: string; note?: string }[] = [
  { day: "Mon – Fri", time: "8:00 AM – 6:00 PM", dot: TEAL },
  { day: "Saturday", time: "9:00 AM – 2:00 PM", dot: TEAL },
  { day: "Sunday", time: "Closed", dot: CORAL, note: "Emergency only" },
];

// Stagger offset per hours row in frames
const ROW_STAGGER = 8;
const ROWS_START = 24; // frame when first row begins sliding in

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(
  input: number[],
  output: number[],
  value: number
): number {
  return interpolate(value, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ─── Background glow orb ──────────────────────────────────────────────────────
const GlowOrb: React.FC<{
  x: number;
  y: number;
  radius: number;
  color: string;
  frame: number;
  phaseOffset?: number;
}> = ({ x, y, radius, color, frame, phaseOffset = 0 }) => {
  const { fps } = useVideoConfig();
  const appear = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 35 },
  });
  const pulse =
    1 + Math.sin(((frame + phaseOffset) * 0.03) % (Math.PI * 2)) * 0.07;
  const r = radius * pulse;

  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        opacity: appear * 0.8,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── SVG Clock ────────────────────────────────────────────────────────────────
const ClockIcon: React.FC<{ frame: number; size: number }> = ({
  frame,
  size,
}) => {
  // Rotate minute hand 0→360 over frames 0–120
  const minuteDeg = clamp([0, 120], [0, 360], frame);
  // Hour hand moves 1/12 as fast → 0→30 deg over same window
  const hourDeg = clamp([0, 120], [0, 30], frame);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  // Tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const isHour = true;
    const innerR = isHour ? r - 10 : r - 6;
    const x1 = cx + Math.cos(angle - Math.PI / 2) * (r - 2);
    const y1 = cy + Math.sin(angle - Math.PI / 2) * (r - 2);
    const x2 = cx + Math.cos(angle - Math.PI / 2) * (innerR - 2);
    const y2 = cy + Math.sin(angle - Math.PI / 2) * (innerR - 2);
    return { x1, y1, x2, y2 };
  });

  // Hands
  const minRad = ((minuteDeg - 90) * Math.PI) / 180;
  const minLen = r - 14;
  const hourRad = ((hourDeg - 90) * Math.PI) / 180;
  const hourLen = r - 26;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: `drop-shadow(0 0 12px ${TEAL}66)` }}
    >
      {/* Face */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={TEAL}
        strokeWidth={3}
        opacity={0.85}
      />
      {/* Inner soft fill */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 2}
        fill={`${TEAL}0a`}
      />
      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={i % 3 === 0 ? TEAL : `${TEAL}55`}
          strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          strokeLinecap="round"
        />
      ))}
      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(hourRad) * hourLen}
        y2={cy + Math.sin(hourRad) * hourLen}
        stroke={WHITE}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.9}
      />
      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(minRad) * minLen}
        y2={cy + Math.sin(minRad) * minLen}
        stroke={TEAL}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={5} fill={TEAL} />
      <circle cx={cx} cy={cy} r={2.5} fill={WHITE} />
    </svg>
  );
};

// ─── Header: clock + clinic name + subtitle ───────────────────────────────────
const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const nameProgress = spring({
    frame: frame - 6,
    fps,
    config: SPRING_CFG,
  });
  const nameY = interpolate(nameProgress, [0, 1], [40, 0]);
  const nameOpacity = interpolate(nameProgress, [0, 1], [0, 1]);

  const subProgress = spring({
    frame: frame - 14,
    fps,
    config: SPRING_CFG,
  });
  const subY = interpolate(subProgress, [0, 1], [24, 0]);
  const subOpacity = interpolate(subProgress, [0, 1], [0, 1]);

  const clockProgress = spring({
    frame: frame - 2,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const clockScale = interpolate(clockProgress, [0, 1], [0.4, 1]);
  const clockOpacity = interpolate(clockProgress, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Clock icon */}
      <div
        style={{
          transform: `scale(${clockScale})`,
          opacity: clockOpacity,
          marginBottom: 36,
        }}
      >
        <ClockIcon frame={frame} size={120} />
      </div>

      {/* Clinic name */}
      <div
        style={{
          transform: `translateY(${nameY}px)`,
          opacity: nameOpacity,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 48,
          fontWeight: 700,
          color: WHITE,
          letterSpacing: "-0.01em",
          textAlign: "center",
          paddingInline: 60,
          lineHeight: 1.2,
          textShadow: `0 0 40px ${TEAL}44`,
        }}
      >
        {CLINIC_NAME}
      </div>

      {/* Divider */}
      <div
        style={{
          opacity: subOpacity,
          marginTop: 18,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            height: 1,
            width: 80,
            background: `linear-gradient(90deg, transparent, ${TEAL}88)`,
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: TEAL,
            boxShadow: `0 0 8px ${TEAL}`,
          }}
        />
        <div
          style={{
            height: 1,
            width: 80,
            background: `linear-gradient(90deg, ${TEAL}88, transparent)`,
          }}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 26,
          fontWeight: 400,
          color: MUTED,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {SUBTITLE}
      </div>
    </div>
  );
};

// ─── Single hours row ─────────────────────────────────────────────────────────
const HoursRow: React.FC<{
  day: string;
  time: string;
  dot: string;
  note?: string;
  frame: number;
  startFrame: number;
}> = ({ day, time, dot, note, frame, startFrame }) => {
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: SPRING_CFG,
  });
  const translateY = interpolate(progress, [0, 1], [50, 0]);
  const opacity = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isClosed = time === "Closed";

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: 64,
        paddingBlock: 22,
        marginInline: 40,
        borderRadius: 18,
        background: isClosed
          ? `linear-gradient(135deg, ${CORAL}0d 0%, ${BG} 100%)`
          : `linear-gradient(135deg, ${TEAL}0d 0%, ${BG} 100%)`,
        border: `1px solid ${isClosed ? CORAL : TEAL}22`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left: dot + day label */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: dot,
            flexShrink: 0,
            boxShadow: `0 0 10px ${dot}99`,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 30,
            fontWeight: 600,
            color: WHITE,
            letterSpacing: "-0.01em",
          }}
        >
          {day}
        </span>
      </div>

      {/* Right: time + optional note */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 28,
            fontWeight: isClosed ? 700 : 500,
            color: isClosed ? CORAL : TEAL_SOFT,
            letterSpacing: "0.01em",
          }}
        >
          {time}
        </span>
        {note && (
          <span
            style={{
              fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
              fontSize: 18,
              fontWeight: 400,
              color: CORAL,
              opacity: 0.8,
              letterSpacing: "0.04em",
            }}
          >
            {note}
          </span>
        )}
      </div>

      {/* Subtle shimmer line on top edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 10%, ${isClosed ? CORAL : TEAL}44 50%, transparent 90%)`,
        }}
      />
    </div>
  );
};

// ─── Hours list ───────────────────────────────────────────────────────────────
const HoursList: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      position: "absolute",
      top: 580,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      gap: 20,
    }}
  >
    {HOURS.map((row, i) => (
      <HoursRow
        key={row.day}
        day={row.day}
        time={row.time}
        dot={row.dot}
        note={row.note}
        frame={frame}
        startFrame={ROWS_START + i * ROW_STAGGER}
      />
    ))}
  </div>
);

// ─── Pulsing status dot ───────────────────────────────────────────────────────
const PulsingDot: React.FC<{ frame: number; color: string }> = ({
  frame,
  color,
}) => {
  const innerPulse =
    1 + Math.sin((frame * 0.18) % (Math.PI * 2)) * 0.3;
  const outerPulse =
    1 + Math.sin((frame * 0.18) % (Math.PI * 2)) * 0.6;
  const outerOpacity = clamp(
    [0, 1],
    [0.4, 0],
    (Math.sin((frame * 0.18) % (Math.PI * 2)) + 1) / 2
  );

  return (
    <div style={{ position: "relative", width: 22, height: 22, flexShrink: 0 }}>
      {/* Outer ripple */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 22 * outerPulse,
          height: 22 * outerPulse,
          borderRadius: "50%",
          background: color,
          opacity: outerOpacity,
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Inner dot */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 12 * innerPulse,
          height: 12 * innerPulse,
          borderRadius: "50%",
          background: color,
          transform: "translate(-50%, -50%)",
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </div>
  );
};

// ─── "Today is Open" banner ───────────────────────────────────────────────────
const StatusBanner: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const BANNER_START = 90;
  const bannerProgress = spring({
    frame: frame - BANNER_START,
    fps,
    config: { damping: 16, stiffness: 110 },
  });

  const translateY = interpolate(bannerProgress, [0, 1], [140, 0]);
  const opacity = interpolate(bannerProgress, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const label = TODAY_IS_OPEN ? "Today is Open" : "Currently Closed";
  const bannerColor = TODAY_IS_OPEN ? OK : CORAL;
  const bannerBg = TODAY_IS_OPEN ? `${OK}18` : `${CORAL}18`;
  const bannerBorder = TODAY_IS_OPEN ? `${OK}55` : `${CORAL}55`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingInline: 48,
          paddingBlock: 22,
          borderRadius: 50,
          background: bannerBg,
          border: `2px solid ${bannerBorder}`,
          boxShadow: `0 0 40px ${bannerColor}22, inset 0 1px 0 ${bannerColor}33`,
        }}
      >
        <PulsingDot frame={frame} color={bannerColor} />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: bannerColor,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// ─── Decorative bottom address line ──────────────────────────────────────────
const AddressLine: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const opacity = interpolate(progress, [0, 1], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 20,
        color: MUTED,
        letterSpacing: "0.06em",
      }}
    >
      147 Elm Street · Greenfield · (555) 204-8800
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const ClinicHoursCard: React.FC = () => {
  const frame = useCurrentFrame();

  // Global fade-in
  const fadeIn = clamp([0, 10], [0, 1], frame);
  // Global fade-out
  const fadeOut = clamp([135, 150], [1, 0], frame);

  return (
    <AbsoluteFill
      style={{
        background: BG,
        overflow: "hidden",
        opacity: fadeIn * fadeOut,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Background accent: top-left teal glow */}
      <GlowOrb
        x={-60}
        y={300}
        radius={420}
        color={TEAL}
        frame={frame}
        phaseOffset={0}
      />
      {/* Background accent: bottom-right subtle glow */}
      <GlowOrb
        x={1180}
        y={1600}
        radius={340}
        color={TEAL}
        frame={frame}
        phaseOffset={40}
      />

      {/* Subtle grid texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${TEAL}06 1px, transparent 1px),
            linear-gradient(90deg, ${TEAL}06 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Header: clock + clinic name + subtitle */}
      <Sequence from={0} durationInFrames={DURATION_FRAMES}>
        <Header frame={frame} />
      </Sequence>

      {/* Hours rows staggered reveal */}
      <Sequence from={ROWS_START} durationInFrames={DURATION_FRAMES - ROWS_START}>
        <HoursList frame={frame} />
      </Sequence>

      {/* Address footer */}
      <Sequence from={45} durationInFrames={DURATION_FRAMES - 45}>
        <AddressLine frame={frame} />
      </Sequence>

      {/* Status banner slides up at frame 90 */}
      {SHOW_OPEN_BANNER && (
        <Sequence from={90} durationInFrames={DURATION_FRAMES - 90}>
          <StatusBanner frame={frame} />
        </Sequence>
      )}

      {/* Vignette: darken edges for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ClinicHours"
    component={ClinicHoursCard}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
