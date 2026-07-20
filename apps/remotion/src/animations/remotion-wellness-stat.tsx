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
const STAT_VALUE = 94; // integer 1–100
const STAT_LABEL = "of patients reported improved health";
const STAT_SUBLABEL = "after 3 months of care";
const ATTRIBUTION = `${CLINIC_NAME} · 2025 Patient Satisfaction Survey`;
const DURATION_FRAMES = 150;

// Color palette
const BG = "#0a1a18";
const TEAL = "#12b5a8";
const TEAL_SOFT = "#e7f5f3";
const WHITE = "#ffffff";
const CORAL = "#ff7a66";
const MUTED = "#6b9e99";

// Ring geometry
const RING_RADIUS = 210;
const RING_STROKE = 14;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Spring config helpers ────────────────────────────────────────────────────
const SPRING_STD = { damping: 14, stiffness: 120 };
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ─── Ambient background particles ────────────────────────────────────────────
const PARTICLES: [number, number, number, number, number][] = [
  [5,  10, 3, 0.9, 0],
  [18, 72, 2, 1.2, 7],
  [28, 45, 4, 0.7, 3],
  [40, 88, 2, 1.4, 15],
  [55, 20, 3, 1.0, 5],
  [66, 62, 5, 0.6, 12],
  [74, 7,  2, 1.1, 20],
  [82, 80, 3, 0.85, 2],
  [90, 50, 4, 1.3, 9],
  [93, 30, 2, 0.95, 18],
  [12, 56, 3, 1.05, 22],
  [48, 94, 2, 1.15, 11],
];

const AmbientParticle: React.FC<{
  xPct: number; yPct: number; size: number; speed: number; phase: number; frame: number;
}> = ({ xPct, yPct, size, speed, phase, frame }) => {
  const f = frame + phase * 4;
  const floatY = Math.sin((f * 0.03 * speed) % (Math.PI * 2)) * 14;
  const floatX = Math.cos((f * 0.02 * speed) % (Math.PI * 2)) * 8;
  const opacity =
    interpolate(frame, [0, 20], [0, 0.3], clamp) *
    interpolate(frame, [130, 150], [1, 0], clamp);
  const color = (xPct + yPct) % 3 === 0 ? CORAL : TEAL;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: `translate(${floatX}px, ${floatY}px)`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity,
        boxShadow: `0 0 ${size * 4}px ${color}`,
      }}
    />
  );
};

// ─── Ambient glow orb ────────────────────────────────────────────────────────
const GlowOrb: React.FC<{
  x: number; y: number; radius: number; color: string; frame: number; startFrame: number;
}> = ({ x, y, radius, color, frame, startFrame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 40 } });
  const pulse = 1 + Math.sin((frame * 0.035) % (Math.PI * 2)) * 0.05;

  return (
    <div
      style={{
        position: "absolute",
        left: x - radius * pulse,
        top: y - radius * pulse,
        width: radius * 2 * pulse,
        height: radius * 2 * pulse,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}2e 0%, transparent 68%)`,
        opacity: prog * 0.85,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Clinic brand mark ────────────────────────────────────────────────────────
const BrandMark: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 2, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [-18, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 76,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {/* Medical cross */}
      <div style={{ position: "relative", width: 44, height: 44 }}>
        <div
          style={{
            position: "absolute",
            top: "38%",
            left: 0,
            right: 0,
            height: "24%",
            background: TEAL,
            borderRadius: 4,
            boxShadow: `0 0 12px ${TEAL}88`,
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
            borderRadius: 4,
            boxShadow: `0 0 12px ${TEAL}88`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: TEAL_SOFT,
          textTransform: "uppercase",
        }}
      >
        {CLINIC_NAME}
      </div>
    </div>
  );
};

// ─── SVG progress ring ────────────────────────────────────────────────────────
const ProgressRing: React.FC<{ frame: number }> = ({ frame }) => {
  // Raw progress 0 → STAT_VALUE over frames [0, 90]
  const rawPct = interpolate(frame, [0, 90], [0, STAT_VALUE], clamp);

  // strokeDashoffset: 0 = full ring, CIRCUMFERENCE = empty ring
  const dashOffset = RING_CIRCUMFERENCE * (1 - rawPct / 100);

  // Track + arc fade in over first 10 frames
  const ringOpacity = interpolate(frame, [5, 20], [0, 1], clamp);

  const svgSize = (RING_RADIUS + RING_STROKE) * 2 + 20;
  const center = svgSize / 2;

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: ringOpacity,
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{ overflow: "visible" }}
      >
        {/* Glow filter */}
        <defs>
          <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="none"
          stroke={`${TEAL}1a`}
          strokeWidth={RING_STROKE}
        />

        {/* Tick marks at 25% increments */}
        {[0, 25, 50, 75].map((pct) => {
          const angle = (pct / 100) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const outerR = RING_RADIUS + RING_STROKE / 2 + 8;
          const innerR = RING_RADIUS - RING_STROKE / 2 - 8;
          return (
            <line
              key={pct}
              x1={center + innerR * Math.cos(rad)}
              y1={center + innerR * Math.sin(rad)}
              x2={center + outerR * Math.cos(rad)}
              y2={center + outerR * Math.sin(rad)}
              stroke={`${TEAL}44`}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="none"
          stroke={TEAL}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90, ${center}, ${center})`}
          filter="url(#ringGlow)"
        />

        {/* Bright leading dot at arc tip */}
        {rawPct > 1 && (() => {
          const tipAngle = ((rawPct / 100) * 360 - 90) * (Math.PI / 180);
          return (
            <circle
              cx={center + RING_RADIUS * Math.cos(tipAngle)}
              cy={center + RING_RADIUS * Math.sin(tipAngle)}
              r={RING_STROKE / 2 + 2}
              fill={TEAL}
              filter="url(#ringGlow)"
            />
          );
        })()}
      </svg>
    </div>
  );
};

// ─── Animated counter  ────────────────────────────────────────────────────────
const StatCounter: React.FC<{ frame: number }> = ({ frame }) => {
  const displayed = Math.round(interpolate(frame, [0, 90], [0, STAT_VALUE], clamp));

  const fadeIn = interpolate(frame, [8, 22], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Ring SVG is (RING_RADIUS + RING_STROKE) * 2 + 20 tall; center the number inside it
        height: (RING_RADIUS + RING_STROKE) * 2 + 20,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 128,
          fontWeight: 800,
          color: TEAL,
          letterSpacing: "-0.04em",
          textShadow: `0 0 80px ${TEAL}88, 0 0 30px ${TEAL}55`,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {displayed}
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginLeft: 4,
          }}
        >
          %
        </span>
      </div>
    </div>
  );
};

// ─── Subtitle lines ───────────────────────────────────────────────────────────
const SubtitleLine: React.FC<{
  text: string;
  startFrame: number;
  frame: number;
  fontSize?: number;
  color?: string;
}> = ({ text, startFrame, frame, fontSize = 38, color = WHITE }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - startFrame, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [22, 0]);

  return (
    <div
      style={{
        transform: `translateY(${y}px)`,
        opacity,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize,
        fontWeight: 500,
        color,
        textAlign: "center",
        lineHeight: 1.3,
        letterSpacing: "0.01em",
      }}
    >
      {text}
    </div>
  );
};

// ─── Decorative divider rule ──────────────────────────────────────────────────
const DividerRule: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - startFrame, fps, config: SPRING_STD });
  const scaleX = interpolate(prog, [0, 1], [0, 1]);

  return (
    <div
      style={{
        marginTop: 12,
        height: 2,
        width: "60%",
        background: `linear-gradient(90deg, transparent, ${TEAL}88, transparent)`,
        borderRadius: 1,
        transform: `scaleX(${scaleX})`,
      }}
    />
  );
};

// ─── Subtitle block (label + sublabel) ───────────────────────────────────────
const SubtitleBlock: React.FC<{ frame: number }> = ({ frame }) => {
  // Ring SVG top=220, height=(RING_RADIUS+RING_STROKE)*2+20 = (210+14)*2+20 = 468
  // So ring bottom = 220 + 468 = 688; add 44px gap
  const blockTop = 220 + (RING_RADIUS + RING_STROKE) * 2 + 20 + 44;

  return (
    <div
      style={{
        position: "absolute",
        top: blockTop,
        left: 60,
        right: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <SubtitleLine
        text={STAT_LABEL}
        startFrame={60}
        frame={frame}
        fontSize={42}
        color={TEAL_SOFT}
      />
      <SubtitleLine
        text={STAT_SUBLABEL}
        startFrame={64}
        frame={frame}
        fontSize={32}
        color={MUTED}
      />

      {/* Decorative rule under subtitle */}
      <DividerRule frame={frame} startFrame={68} />
    </div>
  );
};

// ─── Attribution footer ───────────────────────────────────────────────────────
const AttributionFooter: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - 80, fps, config: SPRING_STD });
  const opacity = interpolate(prog, [0, 1], [0, 1]);
  const y = interpolate(prog, [0, 1], [14, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 88,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      {/* Small teal pill bar */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 40,
          background: `${TEAL}14`,
          border: `1.5px solid ${TEAL}33`,
        }}
      >
        {/* Small chart-bar icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="12" width="3" height="6" rx="1" fill={MUTED} />
          <rect x="7" y="7" width="3" height="11" rx="1" fill={TEAL} />
          <rect x="12" y="4" width="3" height="14" rx="1" fill={TEAL} />
          <rect x="17" y="9" width="3" height="9" rx="1" fill={MUTED} />
        </svg>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 24,
            fontWeight: 500,
            color: MUTED,
            letterSpacing: "0.03em",
            textAlign: "center",
          }}
        >
          {ATTRIBUTION}
        </span>
      </div>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const WellnessStat: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  const fadeOut = interpolate(frame, [135, 150], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        background: BG,
        overflow: "hidden",
        opacity: fadeIn * fadeOut,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Teal glow centred on the stat ring */}
      <GlowOrb x={540} y={500} radius={460} color={TEAL} frame={frame} startFrame={0} />
      <GlowOrb x={180} y={1600} radius={340} color={CORAL} frame={frame} startFrame={6} />

      {/* Ambient particles */}
      {PARTICLES.map(([xPct, yPct, size, speed, phase], i) => (
        <AmbientParticle
          key={i}
          xPct={xPct}
          yPct={yPct}
          size={size}
          speed={speed}
          phase={phase}
          frame={frame}
        />
      ))}

      {/* Edge/top vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, transparent 15%, transparent 78%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Clinic brand mark */}
      <Sequence from={0} durationInFrames={DURATION_FRAMES}>
        <BrandMark frame={frame} />
      </Sequence>

      {/* SVG progress ring */}
      <Sequence from={5} durationInFrames={DURATION_FRAMES - 5}>
        <ProgressRing frame={frame} />
      </Sequence>

      {/* Animated counter inside ring */}
      <Sequence from={8} durationInFrames={DURATION_FRAMES - 8}>
        <StatCounter frame={frame} />
      </Sequence>

      {/* Subtitle label + sublabel */}
      <Sequence from={56} durationInFrames={DURATION_FRAMES - 56}>
        <SubtitleBlock frame={frame} />
      </Sequence>

      {/* Attribution footer */}
      <Sequence from={76} durationInFrames={DURATION_FRAMES - 76}>
        <AttributionFooter frame={frame} />
      </Sequence>

      {/* Radial edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.38) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="WellnessStat"
    component={WellnessStat}
    durationInFrames={DURATION_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
