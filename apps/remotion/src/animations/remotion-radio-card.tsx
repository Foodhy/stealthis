import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── Station metadata ─────────────────────────────────────────────────────────
const STATION_NAME = "NOVA FM 94.7";
const STATION_ABBR = "NF";
const SHOW_TITLE = "Late Night Frequencies";
const HOST_NAME = "with DJ Solara";
const NEXT_SHOW = "Morning Pulse";
const NEXT_TIME = "6:00 AM";
const SOCIAL_HANDLE = "@novafm947";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE_CARD = "#12121a";
const ACCENT = "#a855f7";
const ACCENT_2 = "#06b6d4";
const ACCENT_3 = "#ec4899";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";

const BAR_COUNT = 30;

// ─── Audio simulation helpers ─────────────────────────────────────────────────
function simWaveBar(frame: number, barIndex: number): number {
  const f = frame;
  const i = barIndex;
  // Layer four sine waves per bar for rich organic feel
  const w1 = Math.sin(f * 0.14 + i * 0.52) * 0.38;
  const w2 = Math.sin(f * 0.08 + i * 1.05 + 1.1) * 0.25;
  const w3 = Math.sin(f * 0.27 + i * 0.33 + 2.4) * 0.18;
  const w4 = Math.sin(f * 0.41 + i * 0.71 + 0.6) * 0.10;
  return Math.max(0.06, 0.45 + w1 + w2 + w3 + w4);
}

// ─── On-Air Badge ─────────────────────────────────────────────────────────────
const OnAirBadge: React.FC<{ frame: number; entranceOpacity: number }> = ({
  frame,
  entranceOpacity,
}) => {
  // Pulse: scale oscillates 1 → 1.05 every ~60 frames (2 seconds)
  const pulseCycle = Math.sin(frame * (Math.PI / 30));
  const scale = 1 + pulseCycle * 0.04;
  // Glow intensity pulsing in sync
  const glowAlpha = 0.55 + pulseCycle * 0.25;

  return (
    <div
      style={{
        opacity: entranceOpacity,
        transform: `scale(${scale})`,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 18px",
        borderRadius: 100,
        background: `linear-gradient(135deg, ${ACCENT_3}, ${ACCENT})`,
        boxShadow: `0 0 20px rgba(236,72,153,${glowAlpha}), 0 0 40px rgba(168,85,247,${glowAlpha * 0.5})`,
      }}
    >
      {/* Live dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 8px rgba(255,255,255,0.9)",
          opacity: 0.85 + Math.sin(frame * 0.25) * 0.15,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 14,
          color: "#fff",
          letterSpacing: "0.18em",
          textTransform: "uppercase" as const,
        }}
      >
        ON AIR
      </span>
    </div>
  );
};

// ─── Radio Tower Icon with signal rings ──────────────────────────────────────
const RadioTower: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => {
  // Three rings animate outward in sequence, each offset by 20 frames
  const ringConfigs = [
    { delay: 0, maxR: 36, strokeW: 2 },
    { delay: 20, maxR: 56, strokeW: 1.5 },
    { delay: 40, maxR: 76, strokeW: 1 },
  ];

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 16,
      }}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={{ overflow: "visible" }}
      >
        {/* Tower base structure */}
        <g transform="translate(60, 60)">
          {/* Main mast */}
          <line
            x1="0"
            y1="10"
            x2="0"
            y2="42"
            stroke={ACCENT}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Left strut */}
          <line
            x1="0"
            y1="42"
            x2="-18"
            y2="58"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Right strut */}
          <line
            x1="0"
            y1="42"
            x2="18"
            y2="58"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Left base */}
          <line
            x1="-18"
            y1="58"
            x2="-26"
            y2="62"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Right base */}
          <line
            x1="18"
            y1="58"
            x2="26"
            y2="62"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Cross brace left */}
          <line
            x1="-8"
            y1="48"
            x2="8"
            y2="54"
            stroke={ACCENT}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* Cross brace right */}
          <line
            x1="8"
            y1="48"
            x2="-8"
            y2="54"
            stroke={ACCENT}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* Antenna tip dot */}
          <circle
            cx="0"
            cy="7"
            r="4"
            fill={ACCENT_3}
            style={{
              filter: `drop-shadow(0 0 6px ${ACCENT_3})`,
            }}
          />
          {/* Tip glow pulse */}
          <circle
            cx="0"
            cy="7"
            r={5 + Math.sin(frame * 0.22) * 2}
            fill="none"
            stroke={ACCENT_3}
            strokeWidth="1.5"
            opacity={0.4 + Math.sin(frame * 0.22) * 0.3}
          />

          {/* Animated signal rings - staggered outward */}
          {ringConfigs.map((cfg, idx) => {
            // Each ring loops on a 60-frame period, offset by delay
            const ringFrame = (frame - cfg.delay + 180) % 60;
            const ringProgress = ringFrame / 60;
            const r = 14 + ringProgress * (cfg.maxR - 14);
            const ringOpacity = interpolate(
              ringProgress,
              [0, 0.3, 0.8, 1.0],
              [0, 0.8, 0.4, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <circle
                key={idx}
                cx="0"
                cy="7"
                r={r}
                fill="none"
                stroke={ACCENT}
                strokeWidth={cfg.strokeW}
                opacity={ringOpacity}
                style={{
                  filter: `drop-shadow(0 0 4px ${ACCENT})`,
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

// ─── Station Logo Circle ──────────────────────────────────────────────────────
const StationLogo: React.FC<{ opacity: number; frame: number }> = ({
  opacity,
  frame,
}) => {
  const glowPulse = 0.5 + Math.sin(frame * 0.15) * 0.25;
  return (
    <div
      style={{
        opacity,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_3})`,
        boxShadow: `0 0 24px rgba(168,85,247,${glowPulse}), 0 0 48px rgba(168,85,247,${glowPulse * 0.4})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative" as const,
        flexShrink: 0,
      }}
    >
      {/* Inner sheen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22) 0%, transparent 65%)",
        }}
      />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 24,
          color: "#fff",
          letterSpacing: "-0.02em",
          position: "relative" as const,
          zIndex: 1,
        }}
      >
        {STATION_ABBR}
      </span>
    </div>
  );
};

// ─── Waveform bars ────────────────────────────────────────────────────────────
const WaveformBars: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => {
  const BAR_W = 7;
  const BAR_GAP = 3;
  const MAX_H = 80;

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "flex-end",
        gap: BAR_GAP,
        height: MAX_H,
      }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const amp = simWaveBar(frame, i);
        const barH = Math.max(4, Math.round(amp * MAX_H));
        // Gradient from purple (left) to pink (center) to cyan (right)
        const t = i / (BAR_COUNT - 1);
        const hue = 270 - t * 80; // 270 (purple) → 190 (cyan-ish)
        const barColor =
          i < BAR_COUNT / 2
            ? `hsl(${270 - t * 60}, 90%, 65%)`
            : `hsl(${210 + (t - 0.5) * 60}, 90%, 65%)`;

        return (
          <div
            key={i}
            style={{
              width: BAR_W,
              height: barH,
              borderRadius: 4,
              background: barColor,
              boxShadow: `0 0 6px ${barColor}`,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Show Progress Bar ────────────────────────────────────────────────────────
const ShowProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const elapsed = Math.round(progress * 60); // 0→60 minutes
  const elapsedStr = `${elapsed}:00`;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          color: MUTED,
          letterSpacing: "0.04em",
        }}
      >
        <span>{elapsedStr}</span>
        <span>60:00</span>
      </div>
      <div
        style={{
          width: "100%",
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.10)",
          position: "relative" as const,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute" as const,
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_3})`,
            borderRadius: 3,
            boxShadow: `0 0 12px rgba(168,85,247,0.7)`,
          }}
        />
        {/* Scrubber dot */}
        <div
          style={{
            position: "absolute" as const,
            top: "50%",
            left: `${progress * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 10px rgba(255,255,255,0.85)",
          }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const RadioCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // ── Card entrance: scale 0.8 → 1 with spring ─────────────────────────────
  const cardScale = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 110, mass: 1.0 },
    durationInFrames: 28,
    from: 0.8,
    to: 1,
  });
  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Staggered section fade-ins (tower @ f15, text @ f30, waveform @ f45) ─
  const towerOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [30, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const waveformOpacity = interpolate(frame, [45, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bottomOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text slide-in from left (staggered)
  const textSlideX = interpolate(frame, [30, 52], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Show progress: 0% → 60% over full clip
  const showProgress = interpolate(
    frame,
    [0, durationInFrames - 1],
    [0, 0.6],
    { extrapolateRight: "clamp" }
  );

  const CARD_W = 920;
  const CARD_H = 500;

  // ── Ambient background particles ─────────────────────────────────────────
  const particleData = [
    { x: 0.12, y: 0.18, size: 3, phase: 0.0, color: ACCENT },
    { x: 0.88, y: 0.22, size: 4, phase: 1.2, color: ACCENT_2 },
    { x: 0.08, y: 0.78, size: 2.5, phase: 2.5, color: ACCENT_3 },
    { x: 0.92, y: 0.72, size: 3.5, phase: 0.8, color: "#f59e0b" },
    { x: 0.5, y: 0.1, size: 2, phase: 1.8, color: ACCENT },
    { x: 0.22, y: 0.88, size: 3, phase: 3.1, color: ACCENT_2 },
    { x: 0.72, y: 0.85, size: 2.5, phase: 0.4, color: ACCENT_3 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.14) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 40%, rgba(6,182,212,0.10) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(236,72,153,0.07) 0%, transparent 45%),
          ${BG}
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Ambient particles in background */}
      {particleData.map((p, i) => {
        const px = p.x * width + Math.sin(frame * 0.04 + p.phase) * 20;
        const py = p.y * height + Math.cos(frame * 0.05 + p.phase) * 15;
        const popIn = interpolate(frame, [i * 8, i * 8 + 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: popIn * (0.25 + Math.sin(frame * 0.07 + p.phase) * 0.12),
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        );
      })}

      {/* Ambient glow halo behind the card */}
      <div
        style={{
          position: "absolute",
          width: CARD_W + 160,
          height: CARD_H + 160,
          borderRadius: 50,
          background: `radial-gradient(ellipse, rgba(168,85,247,0.16) 0%, transparent 70%)`,
          filter: "blur(36px)",
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
        }}
      />

      {/* Card */}
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          borderRadius: 28,
          background: `linear-gradient(145deg, #18182a 0%, ${SURFACE_CARD} 55%, #0d0d1a 100%)`,
          border: "1px solid rgba(168,85,247,0.22)",
          boxShadow: `
            0 40px 100px rgba(0,0,0,0.75),
            0 0 0 1px rgba(168,85,247,0.12),
            inset 0 1px 0 rgba(255,255,255,0.05),
            inset 0 -1px 0 rgba(0,0,0,0.3)
          `,
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          position: "relative" as const,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column" as const,
          padding: "32px 36px 28px 36px",
          gap: 0,
        }}
      >
        {/* Card inner top-left gradient sheen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 280,
            height: 150,
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(168,85,247,0.14), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Card bottom-right accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 200,
            height: 120,
            background:
              "radial-gradient(ellipse at 100% 100%, rgba(6,182,212,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* ── TOP ROW: Left (tower + logo) | Center (text) | Right (waveform) ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 32,
            flex: 1,
          }}
        >
          {/* LEFT COLUMN: Tower + Logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              gap: 20,
              flexShrink: 0,
              width: 120,
            }}
          >
            <RadioTower frame={frame} opacity={towerOpacity} />
            <StationLogo opacity={towerOpacity} frame={frame} />
          </div>

          {/* CENTER COLUMN: Station info + progress */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              justifyContent: "space-between",
              gap: 12,
              paddingTop: 8,
              opacity: textOpacity,
              transform: `translateX(${textSlideX}px)`,
            }}
          >
            {/* ON AIR badge */}
            <div>
              <OnAirBadge frame={frame} entranceOpacity={textOpacity} />
            </div>

            {/* Station name */}
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 42,
                color: TEXT,
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                marginTop: 12,
              }}
            >
              {STATION_NAME}
            </div>

            {/* Show title */}
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: ACCENT_2,
                letterSpacing: "-0.01em",
                marginTop: 4,
              }}
            >
              {SHOW_TITLE}
            </div>

            {/* Host */}
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 15,
                color: MUTED,
                letterSpacing: "0.01em",
              }}
            >
              {HOST_NAME}
            </div>

            {/* Show progress bar */}
            <div style={{ marginTop: 18 }}>
              <ShowProgressBar progress={showProgress} />
            </div>
          </div>

          {/* RIGHT COLUMN: Waveform */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "flex-end",
              justifyContent: "flex-start",
              paddingTop: 24,
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                color: MUTED,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                opacity: waveformOpacity,
              }}
            >
              Live Audio
            </div>
            <WaveformBars frame={frame} opacity={waveformOpacity} />
          </div>
        </div>

        {/* ── BOTTOM ROW: Schedule + social ──────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            opacity: bottomOpacity,
          }}
        >
          {/* Next show */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Small clock icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke={MUTED}
                strokeWidth="1.8"
              />
              <polyline
                points="12,6 12,12 16,14"
                stroke={MUTED}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                color: MUTED,
                letterSpacing: "0.01em",
              }}
            >
              Next:{" "}
              <span
                style={{
                  color: TEXT,
                  fontWeight: 600,
                }}
              >
                {NEXT_SHOW}
              </span>{" "}
              at{" "}
              <span
                style={{
                  color: ACCENT_2,
                  fontWeight: 600,
                }}
              >
                {NEXT_TIME}
              </span>
            </span>
          </div>

          {/* Frequency badge + social handle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Frequency badge */}
            <div
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                background: "rgba(168,85,247,0.14)",
                border: "1px solid rgba(168,85,247,0.28)",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: ACCENT,
                  letterSpacing: "0.06em",
                }}
              >
                94.7 FM
              </span>
            </div>

            {/* Social handle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Stylized @ icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke={ACCENT_3}
                  strokeWidth="2"
                />
                <path
                  d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"
                  stroke={ACCENT_3}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: ACCENT_3,
                  letterSpacing: "0.01em",
                }}
              >
                {SOCIAL_HANDLE}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition config ───────────────────────────────────────────────────────
export const compositionConfig = {
  id: "remotion-radio-card",
  component: RadioCard,
  durationInFrames: 120,
  fps: 30,
  width: 1920,
  height: 1080,
};
