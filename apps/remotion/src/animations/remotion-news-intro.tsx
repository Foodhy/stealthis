import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Constants ──────────────────────────────────────────────────────────────
const NETWORK = "NNX";
const SHOW_NAME = "NIGHTLY NEWS";
const DATE_LINE = "THURSDAY, JUNE 13";
const TAGLINE = "Informed. Accurate. Trusted.";
const ACCENT_RED = "#e8001e";
const GOLD = "#f5c842";
const BG_DARK = "#0a0e1a";
const BG_MID = "#0d1421";
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.55)";
const GRID_LINE_COLOR = "rgba(255,255,255,0.04)";

const LOCATIONS: Array<{ label: string; x: number; y: number; color: string; delay: number }> = [
  { label: "PARIS",    x: 48.5, y: 30.0, color: ACCENT_RED, delay: 115 },
  { label: "TOKYO",   x: 79.0, y: 32.5, color: GOLD,       delay: 128 },
  { label: "NEW YORK", x: 19.5, y: 36.0, color: "#00d4ff",  delay: 141 },
];

// ── Scene 1 helpers ────────────────────────────────────────────────────────
// Horizontal + vertical grid lines
const GRID_H_COUNT = 9;
const GRID_V_COUNT = 16;

const GridLines: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const lines: React.ReactNode[] = [];

  for (let i = 0; i <= GRID_H_COUNT; i++) {
    const y = (i / GRID_H_COUNT) * 720;
    const lineDelay = i * 2;
    const lineOpacity = interpolate(frame - lineDelay, [0, 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    lines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={y}
        x2={1280}
        y2={y}
        stroke={GRID_LINE_COLOR}
        strokeWidth={1}
        opacity={lineOpacity}
      />
    );
  }

  for (let i = 0; i <= GRID_V_COUNT; i++) {
    const x = (i / GRID_V_COUNT) * 1280;
    const lineDelay = i * 1.5;
    const lineOpacity = interpolate(frame - lineDelay, [0, 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    lines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={720}
        stroke={GRID_LINE_COLOR}
        strokeWidth={1}
        opacity={lineOpacity}
      />
    );
  }

  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity }}
      width={1280}
      height={720}
      viewBox="0 0 1280 720"
    >
      {lines}
    </svg>
  );
};

// Globe wireframe: concentric arcs sweeping in
const GlobeWireframe: React.FC<{ frame: number }> = ({ frame }) => {
  const cx = 640;
  const cy = 360;
  const r = 200;
  const ARCS = [0.9, 0.7, 0.5, 0.3, 0.15];

  const masterOpacity = interpolate(frame, [0, 35], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity: masterOpacity }}
      width={1280}
      height={720}
      viewBox="0 0 1280 720"
    >
      {/* Outer glow circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 20}
        fill="none"
        stroke="rgba(232,0,30,0.06)"
        strokeWidth={40}
      />
      {/* Main outline */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1.5}
      />
      {/* Latitude arcs */}
      {ARCS.map((frac, i) => {
        const arcR = r * frac;
        const circumference = Math.PI * 2 * arcR;
        const dashProgress = interpolate(frame - i * 5, [5, 40], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const dashOffset = circumference * (1 - dashProgress);
        return (
          <ellipse
            key={`lat-${i}`}
            cx={cx}
            cy={cy}
            rx={r}
            ry={arcR}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        );
      })}
      {/* Longitude arcs */}
      {[0, 30, 60, 90, 120, 150].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const progress = interpolate(frame - i * 4, [8, 45], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const sweep = progress * Math.PI * 2;
        const x1 = cx + r * Math.cos(rad);
        const y1 = cy + r * Math.sin(rad);
        const x2 = cx + r * Math.cos(rad + sweep);
        const y2 = cy + r * Math.sin(rad + sweep);
        const largeArc = sweep > Math.PI ? 1 : 0;
        return (
          <path
            key={`lon-${i}`}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke="rgba(232,0,30,0.15)"
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
};

// ── Scene 1: Background + Grid + Globe ────────────────────────────────────
const Scene1Background: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {/* Main background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${BG_MID} 0%, ${BG_DARK} 70%)`,
        }}
      />
      {/* Red glow from bottom */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(232,0,30,0.12) 0%, transparent 70%)`,
          opacity: interpolate(frame, [0, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <GridLines frame={frame} />
      <GlobeWireframe frame={frame} />
    </>
  );
};

// ── Scene 2: NNX Logo + Show Name ─────────────────────────────────────────
const LogoScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // NNX springs in from scale 0.2
  const localFrame = Math.max(0, frame - 50);
  const logoScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const scaledLogoScale = interpolate(logoScale, [0, 1], [0.2, 1]);

  const logoOpacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade at frame 100
  const exitOpacity = interpolate(frame, [100, 112], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < 48 || frame > 115) return null;

  const letters = SHOW_NAME.split("");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
      }}
    >
      {/* NNX Large Logo */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 160,
          color: ACCENT_RED,
          letterSpacing: -4,
          lineHeight: 1,
          textShadow: `0 0 80px rgba(232,0,30,0.6), 0 0 160px rgba(232,0,30,0.3), 0 2px 4px rgba(0,0,0,0.8)`,
          transform: `scale(${scaledLogoScale})`,
          opacity: logoOpacity,
          transformOrigin: "center center",
        }}
      >
        {NETWORK}
      </div>

      {/* Red accent bar */}
      <div
        style={{
          width: interpolate(localFrame, [8, 30], [0, 380], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }),
          height: 3,
          backgroundColor: ACCENT_RED,
          marginTop: 8,
          marginBottom: 16,
          boxShadow: `0 0 12px ${ACCENT_RED}`,
        }}
      />

      {/* NIGHTLY NEWS — letter by letter */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 0,
        }}
      >
        {letters.map((char, i) => {
          const charDelay = 18 + i * 3;
          const charOpacity = interpolate(localFrame, [charDelay, charDelay + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const charX = interpolate(localFrame, [charDelay, charDelay + 12], [-20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          return (
            <span
              key={i}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 28,
                color: TEXT_WHITE,
                letterSpacing: 10,
                opacity: charOpacity,
                transform: `translateX(${charX}px)`,
                display: "inline-block",
              }}
            >
              {char === " " ? " " : char}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── Scene 3: World Locations ───────────────────────────────────────────────
const PulseRing: React.FC<{ frame: number; color: string; cx: number; cy: number }> = ({
  frame,
  color,
  cx,
  cy,
}) => {
  // Pulse repeats every 45 frames
  const pulseFrame = frame % 45;
  const pulseRadius = interpolate(pulseFrame, [0, 45], [8, 36], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulseOpacity = interpolate(pulseFrame, [0, 25, 45], [0.8, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <circle
      cx={cx}
      cy={cy}
      r={pulseRadius}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      opacity={pulseOpacity}
    />
  );
};

const LocationDot: React.FC<{
  loc: (typeof LOCATIONS)[number];
  frame: number;
  fps: number;
  width: number;
  height: number;
}> = ({ loc, frame, fps, width, height }) => {
  const localFrame = Math.max(0, frame - loc.delay);
  const dotScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const dotOpacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const px = (loc.x / 100) * width;
  const py = (loc.y / 100) * height;
  const scaledDot = dotScale * 8;

  const labelOpacity = interpolate(localFrame, [12, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < loc.delay - 2) return null;

  return (
    <g>
      <PulseRing frame={localFrame > 0 ? frame - loc.delay : 0} color={loc.color} cx={px} cy={py} />
      <circle cx={px} cy={py} r={scaledDot} fill={loc.color} opacity={dotOpacity} />
      <circle cx={px} cy={py} r={3} fill={TEXT_WHITE} opacity={dotOpacity * 0.9} />
      {/* Label */}
      <text
        x={px}
        y={py - 16}
        textAnchor="middle"
        fill={TEXT_WHITE}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={10}
        fontWeight={700}
        letterSpacing={2}
        opacity={labelOpacity}
      >
        {loc.label}
      </text>
    </g>
  );
};

const LocationsScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [108, 118], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [152, 162], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < 108 || frame > 165) return null;

  const width = 1280;
  const height = 720;

  // Coverage label
  const labelOpacity = interpolate(frame, [112, 126], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{ position: "absolute", inset: 0, opacity: opacity * exitOpacity }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Connecting lines between dots (subtle) */}
        {frame >= 141 && (
          <g opacity={interpolate(frame, [141, 155], [0, 0.2], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}>
            <line
              x1={(48.5 / 100) * width} y1={(30.0 / 100) * height}
              x2={(79.0 / 100) * width} y2={(32.5 / 100) * height}
              stroke={GOLD} strokeWidth={0.8} strokeDasharray="4 6"
            />
            <line
              x1={(48.5 / 100) * width} y1={(30.0 / 100) * height}
              x2={(19.5 / 100) * width} y2={(36.0 / 100) * height}
              stroke={GOLD} strokeWidth={0.8} strokeDasharray="4 6"
            />
          </g>
        )}
        {LOCATIONS.map((loc) => (
          <LocationDot
            key={loc.label}
            loc={loc}
            frame={frame}
            fps={fps}
            width={width}
            height={height}
          />
        ))}
        {/* Coverage label top center */}
        <text
          x={width / 2}
          y={90}
          textAnchor="middle"
          fill={TEXT_MUTED}
          fontFamily="Inter, system-ui, sans-serif"
          fontSize={11}
          fontWeight={600}
          letterSpacing={4}
          opacity={labelOpacity}
        >
          WORLDWIDE COVERAGE
        </text>
      </svg>
    </div>
  );
};

// ── Scene 4: Final Title Card ──────────────────────────────────────────────
const FinalTitleCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < 158) return null;

  const localFrame = frame - 160;

  // Full title slides in from bottom
  const titleY = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 22, stiffness: 140 },
  });
  const titleTranslate = interpolate(titleY, [0, 1], [80, 0]);

  const titleOpacity = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Date line
  const dateOpacity = interpolate(localFrame, [12, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dateY = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 20, stiffness: 130 },
  });
  const dateTranslate = interpolate(dateY, [0, 1], [40, 0]);

  // Tagline fades in last
  const taglineOpacity = interpolate(localFrame, [28, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background overlay
  const bgOpacity = interpolate(frame, [158, 170], [0, 1], {
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
        opacity: bgOpacity,
      }}
    >
      {/* Red accent horizontal bar top */}
      <div
        style={{
          width: interpolate(localFrame, [5, 28], [0, 560], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }),
          height: 2,
          backgroundColor: ACCENT_RED,
          boxShadow: `0 0 16px ${ACCENT_RED}`,
          marginBottom: 28,
        }}
      />

      {/* Network badge */}
      <div
        style={{
          backgroundColor: ACCENT_RED,
          paddingLeft: 18,
          paddingRight: 18,
          paddingTop: 6,
          paddingBottom: 6,
          marginBottom: 18,
          opacity: titleOpacity,
          transform: `translateY(${titleTranslate}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 20,
            color: TEXT_WHITE,
            letterSpacing: 6,
          }}
        >
          {NETWORK}
        </span>
      </div>

      {/* Show name */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 72,
          color: TEXT_WHITE,
          letterSpacing: 8,
          lineHeight: 1,
          textShadow: `0 2px 32px rgba(0,0,0,0.8)`,
          opacity: titleOpacity,
          transform: `translateY(${titleTranslate}px)`,
        }}
      >
        {SHOW_NAME}
      </div>

      {/* Separator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 16,
          marginBottom: 16,
          opacity: dateOpacity,
          transform: `translateY(${dateTranslate}px)`,
        }}
      >
        <div style={{ width: 40, height: 1, backgroundColor: GOLD, opacity: 0.6 }} />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: GOLD,
            letterSpacing: 5,
          }}
        >
          {DATE_LINE}
        </span>
        <div style={{ width: 40, height: 1, backgroundColor: GOLD, opacity: 0.6 }} />
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 300,
          fontSize: 16,
          color: TEXT_MUTED,
          letterSpacing: 4,
          opacity: taglineOpacity,
          marginTop: 8,
        }}
      >
        {TAGLINE}
      </div>

      {/* Red accent horizontal bar bottom */}
      <div
        style={{
          width: interpolate(localFrame, [20, 42], [0, 560], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          }),
          height: 2,
          backgroundColor: ACCENT_RED,
          boxShadow: `0 0 16px ${ACCENT_RED}`,
          marginTop: 28,
          opacity: taglineOpacity,
        }}
      />
    </div>
  );
};

// ── Ambient Light Effects ──────────────────────────────────────────────────
const AmbientLights: React.FC<{ frame: number }> = ({ frame }) => {
  const lightOpacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: lightOpacity, pointerEvents: "none" }}>
      {/* Top-left warm glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(232,0,30,0.07) 0%, transparent 70%)`,
        }}
      />
      {/* Bottom-right cool glow */}
      <div
        style={{
          position: "absolute",
          bottom: -120,
          right: -120,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,100,200,0.06) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

// ── Network Corner Bug ─────────────────────────────────────────────────────
const NetworkBug: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        left: 48,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Red square brand mark */}
      <div
        style={{
          width: 36,
          height: 36,
          backgroundColor: ACCENT_RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 14,
            color: TEXT_WHITE,
            letterSpacing: -0.5,
          }}
        >
          {NETWORK}
        </span>
      </div>
    </div>
  );
};

// ── LIVE Badge (top right) ─────────────────────────────────────────────────
const LiveBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blinkOpacity = frame % 30 < 20 ? 1 : 0.2;
  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        right: 48,
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: ACCENT_RED,
          opacity: blinkOpacity,
          boxShadow: `0 0 8px ${ACCENT_RED}`,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: TEXT_MUTED,
          letterSpacing: 3,
        }}
      >
        LIVE
      </span>
    </div>
  );
};

// ── Bottom Chyron Bar ──────────────────────────────────────────────────────
const ChyronBar: React.FC<{ frame: number }> = ({ frame }) => {
  const slideY = interpolate(frame, [25, 50], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const textOpacity = interpolate(frame, [45, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 52,
        transform: `translateY(${slideY}px)`,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      {/* Left red block */}
      <div
        style={{
          width: 180,
          backgroundColor: ACCENT_RED,
          display: "flex",
          alignItems: "center",
          paddingLeft: 20,
          paddingRight: 20,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: TEXT_WHITE,
            letterSpacing: 2,
            opacity: textOpacity,
          }}
        >
          ON AIR TONIGHT
        </span>
      </div>
      {/* Main bar */}
      <div
        style={{
          flex: 1,
          backgroundColor: "rgba(10,14,26,0.95)",
          borderTop: `2px solid ${ACCENT_RED}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 24,
          gap: 32,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: TEXT_WHITE,
            letterSpacing: 1,
            opacity: textOpacity,
          }}
        >
          {SHOW_NAME}
        </span>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 12,
            color: TEXT_MUTED,
            letterSpacing: 1,
            opacity: textOpacity,
          }}
        >
          {DATE_LINE}
        </span>
      </div>
    </div>
  );
};

// ── Main Export ────────────────────────────────────────────────────────────
export default function NewsShowIntro() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Overall fade-in at start
  const masterFadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade to black at very end
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK, opacity: masterFadeIn }}>
      {/* ── Scene 1: Background (persistent, 0–210) ── */}
      <Scene1Background frame={frame} />

      {/* Ambient glow lights */}
      <AmbientLights frame={frame} />

      {/* Persistent corner bug */}
      <NetworkBug frame={frame} />

      {/* LIVE badge */}
      <LiveBadge frame={frame} />

      {/* Bottom chyron */}
      <ChyronBar frame={frame} />

      {/* ── Scene 2: Logo entrance (50–115) ── */}
      <LogoScene frame={frame} fps={fps} />

      {/* ── Scene 3: World locations (108–165) ── */}
      <LocationsScene frame={frame} fps={fps} />

      {/* ── Scene 4: Final title card (160–210) ── */}
      <FinalTitleCard frame={frame} fps={fps} />

      {/* Final fade to black */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          opacity: fadeOut,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}
