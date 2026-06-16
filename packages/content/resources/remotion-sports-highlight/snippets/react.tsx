import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Constants ─────────────────────────────────────────────────────────────────
const SHOW_NAME = "SportsPulse TV";
const SHOW_TAGLINE = "MATCH HIGHLIGHTS";
const TEAM_A = "CHICAGO HAWKS";
const TEAM_B = "DALLAS WOLVES";
const FINAL_SCORE_A = 3;
const FINAL_SCORE_B = 1;
const FINAL_SCORE = `${TEAM_A} ${FINAL_SCORE_A} — ${TEAM_B} ${FINAL_SCORE_B}`;
const WEBSITE = "SportsPulse.tv";

const ACCENT_YELLOW = "#f5c842";
const ACCENT_RED = "#e8001e";
const ACCENT_CYAN = "#00d4ff";
const BG_PRIMARY = "#0a0e1a";
const BG_SECONDARY = "#0f1520";
const TEXT_WHITE = "#ffffff";
const TEXT_DIM = "#8899aa";

interface Play {
  type: string;
  time: string;
  name: string;
  number: number;
  position: string;
  stat: string;
  accent: string;
  teamLabel: string;
}

const PLAYS: Play[] = [
  {
    type: "GOAL",
    time: "14'",
    name: "J. MARTINEZ",
    number: 9,
    position: "FORWARD",
    stat: "14G  7A  22SH",
    accent: ACCENT_YELLOW,
    teamLabel: TEAM_A,
  },
  {
    type: "SAVE",
    time: "31'",
    name: "R. OKONKWO",
    number: 1,
    position: "GOALKEEPER",
    stat: "5CS  31SV  72%",
    accent: ACCENT_CYAN,
    teamLabel: TEAM_B,
  },
  {
    type: "RED CARD",
    time: "58'",
    name: "K. BANKS",
    number: 4,
    position: "DEFENDER",
    stat: "3G  1A  8YC",
    accent: ACCENT_RED,
    teamLabel: TEAM_B,
  },
  {
    type: "GOAL",
    time: "87'",
    name: "L. CHEN",
    number: 11,
    position: "MIDFIELDER",
    stat: "8G  12A  19SH",
    accent: ACCENT_YELLOW,
    teamLabel: TEAM_A,
  },
];

// ── Scene boundaries ──────────────────────────────────────────────────────────
const SCENE_INTRO_START = 0;
const SCENE_INTRO_END = 40;
const SCENE_PLAY1_START = 40;
const SCENE_PLAY1_END = 90;
const SCENE_PLAY2_START = 90;
const SCENE_PLAY2_END = 140;
const SCENE_PLAY3_START = 140;
const SCENE_PLAY3_END = 200;
const SCENE_PLAY4_START = 200;
const SCENE_PLAY4_END = 260;
const SCENE_OUTRO_START = 260;

// ── Helpers ───────────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function sceneFrame(frame: number, start: number) {
  return Math.max(0, frame - start);
}

function sceneOpacity(
  frame: number,
  start: number,
  end: number,
  fadeIn = 6,
  fadeOut = 8
): number {
  const f = frame - start;
  const dur = end - start;
  if (f < 0 || frame >= end) return 0;
  if (f < fadeIn) return f / fadeIn;
  if (f > dur - fadeOut) return (dur - f) / fadeOut;
  return 1;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Animated stadium noise-like background with SVG turbulence grid */
const Background: React.FC<{ flashRed?: boolean; flashProgress?: number }> = ({
  flashRed = false,
  flashProgress = 0,
}) => {
  const flashOverlay = flashRed
    ? `rgba(232, 0, 30, ${0.22 * Math.sin(flashProgress * Math.PI)})`
    : "transparent";

  return (
    <AbsoluteFill style={{ background: BG_PRIMARY }}>
      {/* Grid lines for broadcast feel */}
      <svg
        width="1280"
        height="720"
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.07 }}
      >
        <defs>
          <pattern
            id="grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          </pattern>
          {/* Animated noise texture */}
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <rect width="1280" height="720" fill="url(#grid)" />
        {/* Diagonal accent lines */}
        <line
          x1="0"
          y1="720"
          x2="400"
          y2="0"
          stroke={ACCENT_YELLOW}
          strokeWidth="0.4"
          opacity="0.3"
        />
        <line
          x1="880"
          y1="0"
          x2="1280"
          y2="720"
          stroke={ACCENT_YELLOW}
          strokeWidth="0.4"
          opacity="0.3"
        />
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Red flash overlay for red card event */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: flashOverlay,
          pointerEvents: "none",
        }}
      />

      {/* Bottom gradient for lower-third area */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(to top, ${BG_SECONDARY}ee, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Top bar with show branding */
const TopBar: React.FC<{ opacity: number; sceneLabel: string }> = ({
  opacity,
  sceneLabel,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 32,
      paddingRight: 32,
      background: `linear-gradient(to bottom, rgba(10,14,26,0.95), rgba(10,14,26,0.5))`,
      opacity,
    }}
  >
    {/* Show name */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 28,
          height: 28,
          background: ACCENT_YELLOW,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="#0a0e1a" />
          <path
            d="M5 8 L7 10 L11 6"
            stroke="#f5c842"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 15,
          color: TEXT_WHITE,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {SHOW_NAME}
      </span>
    </div>

    {/* Live badge + scene label */}
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 11,
          color: TEXT_DIM,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {sceneLabel}
      </span>
      <div
        style={{
          background: ACCENT_RED,
          borderRadius: 3,
          padding: "2px 8px",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: TEXT_WHITE,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            color: TEXT_WHITE,
            letterSpacing: "0.08em",
          }}
        >
          LIVE
        </span>
      </div>
    </div>
  </div>
);

/** Play counter bar — 4 segments, active one lit in given color */
const PlayCounterBar: React.FC<{
  activeIndex: number;
  accentColor: string;
  barProgress: number;
}> = ({ activeIndex, accentColor, barProgress }) => (
  <div
    style={{
      position: "absolute",
      bottom: 88,
      left: 32,
      display: "flex",
      gap: 6,
      alignItems: "center",
      transform: `translateY(${interpolate(barProgress, [0, 1], [20, 0])})`,
      opacity: barProgress,
    }}
  >
    {PLAYS.map((_, i) => (
      <div
        key={i}
        style={{
          width: 36,
          height: 5,
          borderRadius: 2,
          background:
            i < activeIndex
              ? "#ffffff44"
              : i === activeIndex
                ? accentColor
                : "#ffffff1a",
          transition: "background 0.3s",
        }}
      />
    ))}
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
        color: TEXT_DIM,
        letterSpacing: "0.1em",
        marginLeft: 6,
        textTransform: "uppercase",
      }}
    >
      PLAY {activeIndex + 1} OF {PLAYS.length}
    </span>
  </div>
);

/** Lower-third chyron for play events */
const LowerThird: React.FC<{
  play: Play;
  slideX: number;
  opacity: number;
}> = ({ play, slideX, opacity }) => (
  <div
    style={{
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      gap: 0,
      transform: `translateX(${slideX}px)`,
      opacity,
    }}
  >
    {/* Event type bar */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginLeft: 32,
      }}
    >
      <div
        style={{
          background: play.accent,
          padding: "5px 16px",
          borderRadius: "3px 0 0 3px",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 14,
            color: play.accent === ACCENT_YELLOW ? "#0a0e1a" : TEXT_WHITE,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {play.type}
        </span>
      </div>
      <div
        style={{
          background: "#1a2035",
          padding: "5px 14px",
          borderRadius: "0 3px 3px 0",
          borderLeft: `2px solid ${play.accent}`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: TEXT_DIM,
            letterSpacing: "0.06em",
          }}
        >
          {play.teamLabel} · {play.time}
        </span>
      </div>
    </div>
  </div>
);

/** Player stat card — springs in from the right */
const StatCard: React.FC<{
  play: Play;
  springX: number;
  opacity: number;
}> = ({ play, springX, opacity }) => (
  <div
    style={{
      position: "absolute",
      right: 40,
      top: "50%",
      transform: `translateY(-50%) translateX(${springX}px)`,
      opacity,
      width: 280,
      background: "#10192e",
      border: `1px solid ${play.accent}33`,
      borderRadius: 8,
      overflow: "hidden",
    }}
  >
    {/* Card header accent bar */}
    <div
      style={{
        height: 4,
        background: `linear-gradient(to right, ${play.accent}, ${play.accent}55)`,
      }}
    />

    <div style={{ padding: "16px 20px" }}>
      {/* Jersey number + name */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: `${play.accent}22`,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {play.number}
        </span>
        <div style={{ paddingBottom: 6 }}>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: TEXT_WHITE,
              letterSpacing: "0.04em",
            }}
          >
            {play.name}
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 11,
              color: play.accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            #{play.number} · {play.position}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `${play.accent}22`,
          marginBottom: 12,
        }}
      />

      {/* Season stats */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 10,
          color: TEXT_DIM,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Season Stats
      </div>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: TEXT_WHITE,
          letterSpacing: "0.08em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {play.stat}
      </div>
    </div>
  </div>
);

/** Confetti burst — colored rectangles */
const ConfettiBurst: React.FC<{ progress: number }> = ({ progress }) => {
  const pieces = [
    { x: 640, y: 280, dx: -180, dy: -200, color: ACCENT_YELLOW, r: 0 },
    { x: 640, y: 280, dx: 160, dy: -180, color: ACCENT_RED, r: 45 },
    { x: 640, y: 280, dx: -80, dy: -220, color: TEXT_WHITE, r: -30 },
    { x: 640, y: 280, dx: 200, dy: -140, color: ACCENT_CYAN, r: 60 },
    { x: 640, y: 280, dx: -220, dy: -120, color: ACCENT_YELLOW, r: -20 },
    { x: 640, y: 280, dx: 100, dy: -240, color: ACCENT_RED, r: 15 },
    { x: 640, y: 280, dx: -140, dy: -160, color: ACCENT_CYAN, r: -45 },
    { x: 640, y: 280, dx: 240, dy: -200, color: TEXT_WHITE, r: 30 },
    { x: 640, y: 280, dx: -60, dy: -260, color: ACCENT_YELLOW, r: -60 },
    { x: 640, y: 280, dx: 180, dy: -100, color: ACCENT_RED, r: 20 },
    { x: 640, y: 280, dx: -200, dy: -80, color: ACCENT_CYAN, r: -15 },
    { x: 640, y: 280, dx: 60, dy: -200, color: TEXT_WHITE, r: 50 },
  ];

  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {pieces.map((p, i) => {
        const delay = i * 0.04;
        const adj = clamp((progress - delay) / (1 - delay), 0, 1);
        const easedAdj = adj < 0.5
          ? 2 * adj * adj
          : 1 - Math.pow(-2 * adj + 2, 2) / 2;
        const px = p.x + p.dx * easedAdj;
        const py = p.y + p.dy * easedAdj + 80 * easedAdj * easedAdj;
        const opacity = adj < 0.7 ? adj / 0.7 : (1 - adj) / 0.3;
        const rot = p.r * easedAdj;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - 6,
              top: py - 3,
              width: 12,
              height: 6,
              background: p.color,
              transform: `rotate(${rot}deg)`,
              opacity: clamp(opacity, 0, 1),
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
};

/** Large score display for Play 4 */
const ScoreUpdate: React.FC<{
  scoreScale: number;
  opacity: number;
  currentScore: number;
}> = ({ scoreScale, opacity, currentScore }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: `translate(-50%, -50%) scale(${scoreScale})`,
      opacity,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
        color: TEXT_DIM,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      SCORE UPDATE
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 88,
            color: ACCENT_YELLOW,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          {currentScore}
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            color: TEXT_DIM,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          {TEAM_A}
        </div>
      </div>

      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 300,
          fontSize: 48,
          color: "#ffffff44",
          lineHeight: 1,
        }}
      >
        —
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 88,
            color: TEXT_WHITE,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          {FINAL_SCORE_B}
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            color: TEXT_DIM,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          {TEAM_B}
        </div>
      </div>
    </div>
  </div>
);

// ── SCENE: Intro (0–40) ───────────────────────────────────────────────────────
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scale burst
  const logoScale = spring({
    frame,
    fps,
    from: 0.1,
    to: 1,
    config: { damping: 14, stiffness: 180 },
  });

  // Logo glow opacity
  const glowOpacity = interpolate(frame, [0, 12, 30, 38], [0, 0.8, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade in
  const taglineOpacity = interpolate(frame, [12, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [12, 22], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red line sweep
  const lineWidth = interpolate(frame, [18, 36], [0, 1280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Scene fade out
  const sceneOpacity = interpolate(frame, [32, 40], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneOpacity }}>
      {/* Glow behind logo */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          width: 320,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${ACCENT_YELLOW}55, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      {/* Show name */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          transform: `scale(${logoScale})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo icon */}
          <div
            style={{
              width: 56,
              height: 56,
              background: ACCENT_YELLOW,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 24px ${ACCENT_YELLOW}88`,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#0a0e1a" />
              <path
                d="M10 16 L14 20 L22 12"
                stroke="#f5c842"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 52,
              color: TEXT_WHITE,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {SHOW_NAME}
          </span>
        </div>
      </div>

      {/* Tagline below */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 140,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 22,
            color: ACCENT_YELLOW,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          {SHOW_TAGLINE}
        </span>
      </div>

      {/* Sweeping red accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "calc(50% + 86px)",
          height: 3,
          width: lineWidth,
          background: `linear-gradient(to right, ${ACCENT_RED}, ${ACCENT_YELLOW})`,
        }}
      />
    </div>
  );
};

// ── SCENE: Generic Play Scene (40–260) ────────────────────────────────────────
const ScenePlay: React.FC<{
  playIndex: number;
  sceneStart: number;
  sceneEnd: number;
  flashRed?: boolean;
}> = ({ playIndex, sceneStart, sceneEnd, flashRed = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = sceneFrame(frame, sceneStart);
  const dur = sceneEnd - sceneStart;
  const play = PLAYS[playIndex];

  // Scene-level fade in/out
  const opacity = sceneOpacity(frame, sceneStart, sceneEnd, 8, 10);

  // Lower third slide in from left
  const ltSlideX = spring({
    frame: f,
    fps,
    from: -500,
    to: 0,
    config: { damping: 18, stiffness: 160 },
  });

  // Lower third slide out
  const ltSlideOut =
    f > dur - 14
      ? interpolate(f, [dur - 14, dur], [0, -500], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : 0;

  const ltSlide = f < dur - 14 ? ltSlideX : ltSlideOut;

  // Stat card spring in from right
  const cardSpringX = spring({
    frame: Math.max(0, f - 10),
    fps,
    from: 320,
    to: 0,
    config: { damping: 16, stiffness: 140 },
  });

  // Stat card slide out
  const cardSlideOut =
    f > dur - 14
      ? interpolate(f, [dur - 14, dur], [0, 320], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : 0;

  const cardX = f < dur - 14 ? cardSpringX : cardSlideOut;

  // Play counter bar slide in
  const barProgress = interpolate(f, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red flash for Play 3
  const flashProgress = flashRed
    ? interpolate(f, [0, 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Horizontal accent line above lower-third
  const accentLineWidth = interpolate(f, [4, 20], [0, 640], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Red flash for red card */}
      {flashRed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(232, 0, 30, ${0.3 * Math.max(0, Math.sin(flashProgress * Math.PI * 2))})`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* Scene headline — play type centered */}
      <div
        style={{
          position: "absolute",
          left: 32,
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: 640,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: play.accent,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textShadow: `0 0 40px ${play.accent}55`,
          }}
        >
          {play.type}
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 20,
            color: TEXT_DIM,
            letterSpacing: "0.18em",
            marginTop: 8,
            textTransform: "uppercase",
          }}
        >
          {play.teamLabel} · {play.time}
        </div>

        {/* Accent line */}
        <div
          style={{
            height: 3,
            width: accentLineWidth,
            background: play.accent,
            marginTop: 16,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Stat card */}
      <StatCard play={play} springX={cardX} opacity={clamp(barProgress * 2, 0, 1)} />

      {/* Lower third chyron */}
      <LowerThird play={play} slideX={ltSlide} opacity={1} />

      {/* Play counter bar */}
      <PlayCounterBar
        activeIndex={playIndex}
        accentColor={play.accent}
        barProgress={barProgress}
      />
    </div>
  );
};

// ── SCENE: Play 4 with score & confetti (200–260) ────────────────────────────
const ScenePlay4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = sceneFrame(frame, SCENE_PLAY4_START);
  const dur = SCENE_PLAY4_END - SCENE_PLAY4_START;
  const play = PLAYS[3];

  const opacity = sceneOpacity(frame, SCENE_PLAY4_START, SCENE_PLAY4_END, 8, 10);

  // Score springs in
  const scoreScale = spring({
    frame: Math.max(0, f - 14),
    fps,
    from: 0.1,
    to: 1,
    config: { damping: 12, stiffness: 200 },
  });

  const scoreOpacity = interpolate(f, [14, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Confetti progress
  const confettiProgress = interpolate(f, [20, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lower third
  const ltSlideX = spring({
    frame: f,
    fps,
    from: -500,
    to: 0,
    config: { damping: 18, stiffness: 160 },
  });

  const ltOut =
    f > dur - 14
      ? interpolate(f, [dur - 14, dur], [0, -500], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : 0;

  const barProgress = interpolate(f, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Accent line
  const accentLineWidth = interpolate(f, [4, 20], [0, 640], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* Confetti */}
      <ConfettiBurst progress={confettiProgress} />

      {/* Score display */}
      <ScoreUpdate
        scoreScale={scoreScale}
        opacity={scoreOpacity}
        currentScore={FINAL_SCORE_A}
      />

      {/* Subtle play label top-left */}
      <div
        style={{
          position: "absolute",
          left: 32,
          bottom: 160,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: play.accent,
            letterSpacing: "0.04em",
          }}
        >
          {play.type}
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: TEXT_DIM,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {play.name} #{play.number} · {play.time}
        </div>
        <div
          style={{
            height: 2,
            width: accentLineWidth / 4,
            background: play.accent,
            marginTop: 8,
            borderRadius: 1,
          }}
        />
      </div>

      {/* Lower third */}
      <LowerThird
        play={play}
        slideX={f < dur - 14 ? ltSlideX : ltOut}
        opacity={1}
      />

      {/* Play counter */}
      <PlayCounterBar
        activeIndex={3}
        accentColor={play.accent}
        barProgress={barProgress}
      />
    </div>
  );
};

// ── SCENE: Outro (260–300) ────────────────────────────────────────────────────
const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = sceneFrame(frame, SCENE_OUTRO_START);

  const opacity = interpolate(frame, [SCENE_OUTRO_START, SCENE_OUTRO_START + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Team names slide in from sides
  const teamAX = spring({
    frame: f,
    fps,
    from: -300,
    to: 0,
    config: { damping: 16, stiffness: 150 },
  });
  const teamBX = spring({
    frame: f,
    fps,
    from: 300,
    to: 0,
    config: { damping: 16, stiffness: 150 },
  });

  // Score scale
  const scoreScale = spring({
    frame: Math.max(0, f - 8),
    fps,
    from: 0.3,
    to: 1,
    config: { damping: 14, stiffness: 200 },
  });

  // Yellow accent line scale
  const lineScale = interpolate(f, [6, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Website fade in
  const websiteOpacity = interpolate(f, [20, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "FINAL SCORE" label
  const labelOpacity = interpolate(f, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* "FINAL SCORE" label */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 13,
          color: TEXT_DIM,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: labelOpacity,
        }}
      >
        FINAL SCORE
      </div>

      {/* Teams and score row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Team A */}
        <div
          style={{
            textAlign: "right",
            transform: `translateX(${teamAX}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 28,
              color: TEXT_WHITE,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {TEAM_A}
          </div>
        </div>

        {/* Score */}
        <div
          style={{
            transform: `scale(${scoreScale})`,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 80,
              color: ACCENT_YELLOW,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              textShadow: `0 0 32px ${ACCENT_YELLOW}66`,
            }}
          >
            {FINAL_SCORE_A}
          </span>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 200,
              fontSize: 48,
              color: "#ffffff33",
            }}
          >
            —
          </span>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 80,
              color: TEXT_WHITE,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {FINAL_SCORE_B}
          </span>
        </div>

        {/* Team B */}
        <div
          style={{
            textAlign: "left",
            transform: `translateX(${teamBX}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 28,
              color: TEXT_WHITE,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {TEAM_B}
          </div>
        </div>
      </div>

      {/* Yellow accent line */}
      <div
        style={{
          height: 3,
          width: 480 * lineScale,
          background: `linear-gradient(to right, transparent, ${ACCENT_YELLOW}, transparent)`,
          borderRadius: 2,
          marginTop: 24,
        }}
      />

      {/* Website CTA */}
      <div
        style={{
          marginTop: 28,
          opacity: websiteOpacity,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 14,
          color: TEXT_DIM,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Full match available at{" "}
        <span
          style={{
            color: ACCENT_YELLOW,
            fontWeight: 600,
          }}
        >
          {WEBSITE}
        </span>
      </div>

      {/* Bottom decoration */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 8,
          opacity: websiteOpacity,
        }}
      >
        <div
          style={{
            width: 20,
            height: 2,
            background: ACCENT_YELLOW,
            borderRadius: 1,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            color: TEXT_DIM,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {SHOW_NAME}
        </span>
        <div
          style={{
            width: 20,
            height: 2,
            background: ACCENT_YELLOW,
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  );
};

// ── Root Composition ──────────────────────────────────────────────────────────
export default function SportsHighlightReel() {
  const frame = useCurrentFrame();

  // Determine top-bar scene label
  let sceneLabel = "HIGHLIGHT REEL";
  if (frame >= SCENE_PLAY1_START && frame < SCENE_PLAY1_END) {
    sceneLabel = `PLAY 1 · ${PLAYS[0].type} · ${PLAYS[0].time}`;
  } else if (frame >= SCENE_PLAY2_START && frame < SCENE_PLAY2_END) {
    sceneLabel = `PLAY 2 · ${PLAYS[1].type} · ${PLAYS[1].time}`;
  } else if (frame >= SCENE_PLAY3_START && frame < SCENE_PLAY3_END) {
    sceneLabel = `PLAY 3 · ${PLAYS[2].type} · ${PLAYS[2].time}`;
  } else if (frame >= SCENE_PLAY4_START && frame < SCENE_PLAY4_END) {
    sceneLabel = `PLAY 4 · ${PLAYS[3].type} · ${PLAYS[3].time}`;
  } else if (frame >= SCENE_OUTRO_START) {
    sceneLabel = "FINAL SCORE";
  }

  // Top bar opacity (hides during intro logo burst)
  const topBarOpacity = interpolate(frame, [24, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red card flash (scene play3, frames 0-24 within scene = 140-164 global)
  const flashProgress = interpolate(
    frame,
    [SCENE_PLAY3_START, SCENE_PLAY3_START + 24],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const isPlay3 = frame >= SCENE_PLAY3_START && frame < SCENE_PLAY3_END;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        background: BG_PRIMARY,
        overflow: "hidden",
      }}
    >
      {/* Persistent background */}
      <Background
        flashRed={isPlay3}
        flashProgress={isPlay3 ? flashProgress : 0}
      />

      {/* Persistent top bar */}
      <TopBar opacity={topBarOpacity} sceneLabel={sceneLabel} />

      {/* INTRO — frames 0-40 */}
      {frame < SCENE_INTRO_END + 4 && <SceneIntro />}

      {/* PLAY 1 — frames 40-90 */}
      {frame >= SCENE_PLAY1_START - 2 && frame < SCENE_PLAY1_END + 4 && (
        <ScenePlay
          playIndex={0}
          sceneStart={SCENE_PLAY1_START}
          sceneEnd={SCENE_PLAY1_END}
        />
      )}

      {/* PLAY 2 — frames 90-140 */}
      {frame >= SCENE_PLAY2_START - 2 && frame < SCENE_PLAY2_END + 4 && (
        <ScenePlay
          playIndex={1}
          sceneStart={SCENE_PLAY2_START}
          sceneEnd={SCENE_PLAY2_END}
        />
      )}

      {/* PLAY 3 (red card) — frames 140-200 */}
      {frame >= SCENE_PLAY3_START - 2 && frame < SCENE_PLAY3_END + 4 && (
        <ScenePlay
          playIndex={2}
          sceneStart={SCENE_PLAY3_START}
          sceneEnd={SCENE_PLAY3_END}
          flashRed
        />
      )}

      {/* PLAY 4 (final goal + confetti + score) — frames 200-260 */}
      {frame >= SCENE_PLAY4_START - 2 && frame < SCENE_PLAY4_END + 4 && (
        <ScenePlay4 />
      )}

      {/* OUTRO — frames 260-300 */}
      {frame >= SCENE_OUTRO_START - 2 && <SceneOutro />}
    </AbsoluteFill>
  );
}
