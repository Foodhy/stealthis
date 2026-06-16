import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── Design tokens ───────────────────────────────────────────────────────────
const IVORY = "#faf8f4";
const CREAM = "#f5f0e8";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8c97a";
const DARK = "#2c2520";
const MUTED = "#9a8f85";

// ─── Placeholder data ─────────────────────────────────────────────────────────
const NAMES = { partner1: "Olivia", partner2: "James" };
const DATE = { month: "September", day: "14", year: "2026" };
const LOCATION = "Villa Ephrussi de Rothschild · Côte d'Azur, France";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function fadeIn(frame: number, start: number, duration = 18) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

function slideUp(frame: number, fps: number, start: number, distance = 28) {
  const f = Math.max(0, frame - start);
  const y = spring({ frame: f, fps, from: distance, to: 0, config: { damping: 16, stiffness: 120 } });
  return y;
}

// ─── GeometricRings ──────────────────────────────────────────────────────────
const GeometricRings: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const rings = [
    { r: 420, delay: 0, strokeWidth: 0.8, opacity: 0.22 },
    { r: 340, delay: 6, strokeWidth: 0.6, opacity: 0.18 },
    { r: 260, delay: 12, strokeWidth: 1.2, opacity: 0.28 },
    { r: 190, delay: 18, strokeWidth: 0.5, opacity: 0.15 },
  ];

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox="0 0 1080 1080"
    >
      {rings.map((ring, i) => {
        const f = Math.max(0, frame - ring.delay);
        const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 18, stiffness: 80 } });
        const opacity = interpolate(f, [0, 20], [0, ring.opacity], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <circle
            key={i}
            cx={540}
            cy={540}
            r={ring.r * scale}
            fill="none"
            stroke={GOLD}
            strokeWidth={ring.strokeWidth}
            opacity={opacity}
          />
        );
      })}
      {/* Corner accent diamonds */}
      {[
        [200, 200],
        [880, 200],
        [200, 880],
        [880, 880],
      ].map(([cx, cy], i) => {
        const f = Math.max(0, frame - (24 + i * 4));
        const sc = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 14, stiffness: 120 } });
        const op = interpolate(f, [0, 15], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <g key={`d-${i}`} transform={`translate(${cx},${cy}) scale(${sc}) rotate(45)`} opacity={op}>
            <rect x={-6} y={-6} width={12} height={12} fill="none" stroke={GOLD} strokeWidth={0.8} />
          </g>
        );
      })}
    </svg>
  );
};

// ─── SaveTheDateBadge (top label) ────────────────────────────────────────────
const SaveTheDateBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const chars = "SAVE THE DATE".split("");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
      }}
    >
      {/* Left line */}
      <div
        style={{
          width: interpolate(frame, [8, 35], [0, 64], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 0.8,
          background: `linear-gradient(90deg, transparent, ${GOLD})`,
        }}
      />
      {/* Letters */}
      <div style={{ display: "flex", gap: 3 }}>
        {chars.map((ch, i) => {
          const delay = 8 + i * 2.2;
          const opacity = fadeIn(frame, delay, 12);
          const y = slideUp(frame, 30, delay, 14);
          return (
            <span
              key={i}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 400,
                fontSize: ch === " " ? 0 : 13,
                letterSpacing: ch === " " ? 12 : 3.5,
                color: GOLD,
                opacity,
                transform: `translateY(${y}px)`,
                display: "inline-block",
                textTransform: "uppercase",
                width: ch === " " ? 12 : "auto",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      {/* Right line */}
      <div
        style={{
          width: interpolate(frame, [8, 35], [0, 64], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 0.8,
          background: `linear-gradient(90deg, ${GOLD}, transparent)`,
        }}
      />
    </div>
  );
};

// ─── CoupleNames ─────────────────────────────────────────────────────────────
const CoupleNames: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const nameOpacity = fadeIn(frame, 38, 20);
  const nameY = slideUp(frame, fps, 38, 32);

  // Gold underline draw-in
  const lineWidth = interpolate(frame, [52, 80], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const ampOpacity = fadeIn(frame, 46, 16);
  const ampScale = spring({
    frame: Math.max(0, frame - 46),
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 12, stiffness: 140 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Names row */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400,
            fontSize: 86,
            color: DARK,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {NAMES.partner1}
        </span>
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400,
            fontSize: 52,
            color: GOLD,
            opacity: ampOpacity,
            transform: `scale(${ampScale})`,
            display: "inline-block",
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          &amp;
        </span>
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400,
            fontSize: 86,
            color: DARK,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {NAMES.partner2}
        </span>
      </div>

      {/* Gold underline */}
      <div
        style={{
          marginTop: 10,
          height: 1.2,
          width: `${lineWidth}%`,
          background: `linear-gradient(90deg, transparent 0%, ${GOLD_LIGHT} 20%, ${GOLD} 50%, ${GOLD_LIGHT} 80%, transparent 100%)`,
          borderRadius: 1,
        }}
      />
    </div>
  );
};

// ─── DateDisplay ─────────────────────────────────────────────────────────────
const DateDisplay: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const monthOpacity = fadeIn(frame, 72, 16);
  const monthY = slideUp(frame, fps, 72, 20);

  const dayScale = spring({
    frame: Math.max(0, frame - 78),
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 11, stiffness: 100 },
  });
  const dayOpacity = fadeIn(frame, 78, 14);

  const yearOpacity = fadeIn(frame, 88, 16);
  const yearY = slideUp(frame, fps, 88, 20);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        justifyContent: "center",
      }}
    >
      {/* Month + Year column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
          paddingRight: 20,
          borderRight: `1px solid ${GOLD}44`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 300,
            fontSize: 18,
            color: MUTED,
            letterSpacing: 5,
            textTransform: "uppercase",
            opacity: monthOpacity,
            transform: `translateY(${monthY}px)`,
            display: "block",
          }}
        >
          {DATE.month}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 300,
            fontSize: 13,
            color: MUTED,
            letterSpacing: 4,
            opacity: yearOpacity,
            transform: `translateY(${yearY}px)`,
            display: "block",
          }}
        >
          {DATE.year}
        </span>
      </div>

      {/* Big day number */}
      <div
        style={{
          paddingLeft: 20,
          opacity: dayOpacity,
          transform: `scale(${dayScale})`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400,
            fontSize: 120,
            color: DARK,
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          {DATE.day}
        </span>
      </div>
    </div>
  );
};

// ─── LocationLine ─────────────────────────────────────────────────────────────
const LocationLine: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = fadeIn(frame, 100, 18);
  const y = interpolate(frame, [100, 116], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Tiny dot separator */}
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: GOLD,
          opacity: 0.6,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 300,
          fontSize: 15,
          color: MUTED,
          letterSpacing: 2.5,
          textAlign: "center",
        }}
      >
        {LOCATION}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const RemotionSaveTheDate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Overall fade-in at start
  const globalOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle warmth glow pulse at center (slow, organic)
  const glowPulse = interpolate(
    Math.sin((frame / 120) * Math.PI * 2),
    [-1, 1],
    [0.06, 0.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: IVORY,
        opacity: globalOpacity,
      }}
    >
      {/* Subtle textured background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 900px 900px at 50% 50%, ${CREAM} 0%, ${IVORY} 100%)`,
        }}
      />

      {/* Warm center glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 600px 600px at 50% 50%, ${GOLD}18 0%, transparent 70%)`,
          opacity: glowPulse / 0.1,
        }}
      />

      {/* Geometric rings */}
      <GeometricRings frame={frame} fps={fps} />

      {/* Content column */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          padding: "100px 80px",
        }}
      >
        {/* "SAVE THE DATE" badge */}
        <SaveTheDateBadge frame={frame} />

        {/* Couple names + gold underline */}
        <CoupleNames frame={frame} fps={fps} />

        {/* Date typography */}
        <DateDisplay frame={frame} fps={fps} />

        {/* Location */}
        <LocationLine frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

// ─── RemotionRoot ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionSaveTheDate"
    component={RemotionSaveTheDate}
    durationInFrames={120}
    fps={30}
    width={1080}
    height={1080}
  />
);
