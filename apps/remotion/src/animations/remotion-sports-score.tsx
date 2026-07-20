import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Configurable constants ────────────────────────────────────────────────────
const TEAM_A = "CHICAGO HAWKS";
const TEAM_A_INITIALS = "CHI";
const TEAM_A_COLOR = "#e8001e";
const TEAM_A_BG = "#1a0005";

const TEAM_B = "DALLAS WOLVES";
const TEAM_B_INITIALS = "DAL";
const TEAM_B_COLOR = "#005cb9";
const TEAM_B_BG = "#001426";

const SCORE_A = 2;
const SCORE_B = 1;
const SCORE_A_FINAL = 3;

const SCORER = "J. MARTINEZ";
const SCORER_NUMBER = "#9";
const CLOCK = "74:23";
const CLOCK_FINAL = "90+2";

const CHANNEL = "SportsPulse TV";

const BG_COLOR = "#0d1117";
const ACCENT_YELLOW = "#ffd700";
const ACCENT_RED = "#e8001e";
const FIELD_GREEN = "#1a3a1a";
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "#8b949e";
const BAR_BG = "rgba(13,17,23,0.95)";

const CONFETTI_COLORS = [
  "#ffd700",
  "#e8001e",
  "#00d4ff",
  "#ffffff",
  "#ff6b35",
  "#c8f542",
  "#ff4fcf",
];

// ── Sub-components ────────────────────────────────────────────────────────────

const StadiumBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const fieldOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG_COLOR }}>
      {/* Subtle field atmosphere at the bottom 20% */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "22%",
          background: `linear-gradient(to top, ${FIELD_GREEN}55 0%, transparent 100%)`,
          opacity: fieldOpacity,
        }}
      />
      {/* Stadium lights vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid lines for broadcast feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Channel watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 32,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: TEXT_MUTED,
          letterSpacing: "0.12em",
          opacity: 0.6,
          textTransform: "uppercase",
        }}
      >
        {CHANNEL}
      </div>
    </AbsoluteFill>
  );
};

// Team logo circle with initials
const TeamLogo: React.FC<{
  initials: string;
  color: string;
  bg: string;
  size?: number;
}> = ({ initials, color, bg, size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      border: `2.5px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: size * 0.35,
      fontWeight: 900,
      color,
      letterSpacing: "0.05em",
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);

// Pulsing LIVE badge
const LiveBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = interpolate(frame % 30, [0, 15, 30], [1, 0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: ACCENT_RED,
        borderRadius: 4,
        padding: "3px 8px",
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: TEXT_WHITE,
          opacity: pulse,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 800,
          color: TEXT_WHITE,
          letterSpacing: "0.15em",
        }}
      >
        LIVE
      </span>
    </div>
  );
};

// Animated score digit
const ScoreDigit: React.FC<{
  value: number;
  prevValue?: number;
  frame: number;
  triggerFrame: number;
  color?: string;
}> = ({ value, prevValue, frame, triggerFrame, color = TEXT_WHITE }) => {
  const isAnimating = prevValue !== undefined && value !== prevValue;
  const relFrame = frame - triggerFrame;

  // Count-up animation
  const displayValue =
    isAnimating && relFrame >= 0
      ? Math.round(
          interpolate(relFrame, [0, 20], [prevValue!, value], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })
        )
      : value;

  // Scale flash on update
  const scaleSpring =
    isAnimating && relFrame >= 0
      ? spring({
          frame: relFrame,
          fps: 30,
          config: { damping: 8, stiffness: 200 },
        })
      : 1;
  const scaleValue = isAnimating
    ? interpolate(scaleSpring, [0, 1], [1.6, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 40,
        fontWeight: 900,
        color,
        lineHeight: 1,
        display: "inline-block",
        transform: `scale(${scaleValue})`,
        transformOrigin: "center center",
        minWidth: 34,
        textAlign: "center",
      }}
    >
      {displayValue}
    </span>
  );
};

// ── Scene 1: Scoreboard bar ───────────────────────────────────────────────────
const ScoreboardBar: React.FC<{
  frame: number;
  scoreA: number;
  scoreB: number;
  clock: string;
  showGoalUpdate: boolean;
}> = ({ frame, scoreA, scoreB, clock, showGoalUpdate }) => {
  const slideDown = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 120 },
  });
  const yOffset = interpolate(slideDown, [0, 1], [-110, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: "50%",
        transform: `translateX(-50%) translateY(${yOffset}px)`,
        opacity,
        width: 780,
        height: 76,
        background: BAR_BG,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        backdropFilter: "blur(10px)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Team A side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
        }}
      >
        <TeamLogo
          initials={TEAM_A_INITIALS}
          color={TEAM_A_COLOR}
          bg={TEAM_A_BG}
        />
        <div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: TEAM_A_COLOR,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {TEAM_A}
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 10,
              color: TEXT_MUTED,
              letterSpacing: "0.06em",
            }}
          >
            HOME
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <ScoreDigit
            value={scoreA}
            prevValue={showGoalUpdate ? SCORE_A : undefined}
            frame={frame}
            triggerFrame={40}
            color={TEXT_WHITE}
          />
        </div>
      </div>

      {/* Center: Clock + LIVE */}
      <div
        style={{
          width: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          padding: "0 16px",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <LiveBadge frame={frame} />
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: TEXT_WHITE,
            letterSpacing: "0.06em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {clock}
        </div>
      </div>

      {/* Team B side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          flexDirection: "row-reverse",
        }}
      >
        <TeamLogo
          initials={TEAM_B_INITIALS}
          color={TEAM_B_COLOR}
          bg={TEAM_B_BG}
        />
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: TEAM_B_COLOR,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {TEAM_B}
          </div>
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 10,
              color: TEXT_MUTED,
              letterSpacing: "0.06em",
            }}
          >
            AWAY
          </div>
        </div>
        <div style={{ marginRight: "auto" }}>
          <ScoreDigit
            value={scoreB}
            frame={frame}
            triggerFrame={40}
            color={TEXT_WHITE}
          />
        </div>
      </div>
    </div>
  );
};

// ── Scene 2: GOAL overlay ─────────────────────────────────────────────────────
const GoalOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  // Frames 40–100 are scene 2; relative frames start at 40
  const relFrame = frame - 40;

  const flashOpacity = interpolate(relFrame, [0, 8, 20, 35], [0, 0.75, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const goalScale = spring({
    frame: relFrame,
    fps: 30,
    config: { damping: 6, stiffness: 260 },
  });
  const goalScaleValue = interpolate(goalScale, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const goalOpacity = interpolate(relFrame, [0, 5, 50, 58], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scorerY = spring({
    frame: relFrame - 10,
    fps: 30,
    config: { damping: 14, stiffness: 160 },
  });
  const scorerYOffset = interpolate(scorerY, [0, 1], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scorerOpacity = interpolate(relFrame, [10, 20, 50, 58], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Team A stripe flash
  const stripeOpacity = interpolate(relFrame, [0, 4, 18, 30], [0, 0.9, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (relFrame < 0) return null;

  return (
    <>
      {/* Yellow flash background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: ACCENT_YELLOW,
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />
      {/* Team color stripe */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: 0,
          right: 0,
          height: 160,
          background: `linear-gradient(to right, ${TEAM_A_COLOR}00, ${TEAM_A_COLOR}44 30%, ${TEAM_A_COLOR}44 70%, ${TEAM_A_COLOR}00)`,
          opacity: stripeOpacity,
        }}
      />
      {/* GOAL! text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -56%) scale(${goalScaleValue})`,
          opacity: goalOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 128,
            fontWeight: 900,
            color: ACCENT_YELLOW,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textShadow: `0 0 60px ${ACCENT_YELLOW}99, 0 4px 20px rgba(0,0,0,0.8)`,
            WebkitTextStroke: `3px rgba(0,0,0,0.4)`,
          }}
        >
          GOAL!
        </div>
      </div>
      {/* Scorer chyron */}
      <div
        style={{
          position: "absolute",
          bottom: "22%",
          left: "50%",
          transform: `translateX(-50%) translateY(${scorerYOffset}px)`,
          opacity: scorerOpacity,
          background: "rgba(13,17,23,0.92)",
          border: `2px solid ${ACCENT_YELLOW}`,
          borderRadius: 8,
          padding: "10px 28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: ACCENT_YELLOW,
            letterSpacing: "0.18em",
            marginBottom: 4,
          }}
        >
          GOAL SCORER • {TEAM_A}
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 26,
            fontWeight: 900,
            color: TEXT_WHITE,
            letterSpacing: "0.06em",
          }}
        >
          {SCORER}{" "}
          <span style={{ color: ACCENT_YELLOW }}>{SCORER_NUMBER}</span>
        </div>
      </div>
    </>
  );
};

// ── Scene 3: Confetti celebration ─────────────────────────────────────────────
interface ConfettiPiece {
  x: number;
  vx: number;
  vy: number;
  color: string;
  w: number;
  h: number;
  rotation: number;
  rotationSpeed: number;
}

const CONFETTI_PIECES: ConfettiPiece[] = Array.from({ length: 14 }, (_, i) => ({
  x: 640 + (Math.sin(i * 2.6) * 120),
  vx: (Math.sin(i * 1.3) * 5 + (i % 2 === 0 ? 3 : -3)),
  vy: -(5 + (i % 5) * 1.5),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: 10 + (i % 4) * 4,
  h: 7 + (i % 3) * 3,
  rotation: i * 27,
  rotationSpeed: (i % 2 === 0 ? 8 : -6) + i * 0.5,
}));

const ConfettiLayer: React.FC<{ frame: number }> = ({ frame }) => {
  // Scene 3 runs frames 100–150; relative
  const relFrame = frame - 100;
  if (relFrame < 0) return null;

  const layerOpacity = interpolate(relFrame, [0, 5, 40, 50], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{ position: "absolute", inset: 0, opacity: layerOpacity, pointerEvents: "none" }}
    >
      {CONFETTI_PIECES.map((piece, i) => {
        const gravity = 0.28;
        const t = relFrame;
        const px = piece.x + piece.vx * t;
        const py = 360 + piece.vy * t + 0.5 * gravity * t * t;
        const rot = piece.rotation + piece.rotationSpeed * t;
        const fade = interpolate(relFrame, [35, 50], [1, 0], {
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
              width: piece.w,
              height: piece.h,
              background: piece.color,
              borderRadius: 2,
              transform: `rotate(${rot}deg)`,
              opacity: fade,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Scene 4: Settled state ─────────────────────────────────────────────────────
const FullTimeStamp: React.FC<{ frame: number }> = ({ frame }) => {
  const relFrame = frame - 150;
  if (relFrame < 0) return null;

  const appear = spring({
    frame: relFrame,
    fps: 30,
    config: { damping: 18, stiffness: 140 },
  });
  const opacity = interpolate(appear, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(appear, [0, 1], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: "16%",
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          background: "rgba(13,17,23,0.9)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6,
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: TEXT_MUTED,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: TEXT_MUTED,
            letterSpacing: "0.14em",
          }}
        >
          ADDED TIME
        </span>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 900,
            color: TEXT_WHITE,
            letterSpacing: "0.06em",
          }}
        >
          {CLOCK_FINAL}
        </span>
      </div>
    </div>
  );
};

// ── Match Stats strip (Scene 1 only) ─────────────────────────────────────────
const MatchStatStrip: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 118,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: appear,
        display: "flex",
        gap: 1,
      }}
    >
      {[
        { label: "POSSESSION", a: "58%", b: "42%" },
        { label: "SHOTS", a: "12", b: "7" },
        { label: "ON TARGET", a: "6", b: "3" },
      ].map((stat, i) => (
        <div
          key={i}
          style={{
            background: "rgba(13,17,23,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "5px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: i === 0 ? "4px 0 0 4px" : i === 2 ? "0 4px 4px 0" : 0,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: TEAM_A_COLOR,
            }}
          >
            {stat.a}
          </span>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 9,
              color: TEXT_MUTED,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {stat.label}
          </span>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: TEAM_B_COLOR,
            }}
          >
            {stat.b}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Root composition ──────────────────────────────────────────────────────────
export default function SportsScoreboad() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Global fade out in final 15 frames
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scene boundaries
  const inScene1 = frame < 40;
  const inScene2 = frame >= 40 && frame < 100;
  const inScene3 = frame >= 100 && frame < 150;
  const inScene4 = frame >= 150;

  // Score state per scene
  const currentScoreA = frame >= 40 ? SCORE_A_FINAL : SCORE_A;
  const showGoalUpdate = frame >= 40 && frame < 80;
  const currentClock = inScene4 ? CLOCK_FINAL : CLOCK;

  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: BG_COLOR }}>
      {/* Always present: background */}
      <StadiumBackground frame={frame} />

      {/* Scoreboard bar — visible all scenes */}
      {(inScene1 || inScene3 || inScene4) && (
        <ScoreboardBar
          frame={frame}
          scoreA={currentScoreA}
          scoreB={SCORE_B}
          clock={currentClock}
          showGoalUpdate={false}
        />
      )}

      {/* During Scene 2 — show scoreboard with live count-up */}
      {inScene2 && (
        <ScoreboardBar
          frame={frame}
          scoreA={currentScoreA}
          scoreB={SCORE_B}
          clock={CLOCK}
          showGoalUpdate={showGoalUpdate}
        />
      )}

      {/* Match stat strip: visible during Scene 1 only */}
      {inScene1 && <MatchStatStrip frame={frame} />}

      {/* Scene 2: Goal overlay */}
      {frame >= 40 && frame < 100 && <GoalOverlay frame={frame} />}

      {/* Scene 3: Confetti */}
      {frame >= 100 && frame < 150 && <ConfettiLayer frame={frame} />}

      {/* Scene 4: Added time stamp */}
      {frame >= 150 && <FullTimeStamp frame={frame} />}

      {/* Broadcast scan-line overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 2px)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}
