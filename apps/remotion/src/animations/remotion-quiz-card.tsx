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

// ── CONFIG ────────────────────────────────────────────────────────────────────
const DURATION = 180; // 6 s @ 30 fps

// Phase boundaries
const PHASE_QUESTION_END = 60;    // Question types in: 0–60
const PHASE_ANSWERS_START = 50;   // Answers slide in: 50–110 (overlap slightly)
const PHASE_ANSWERS_END = 110;
const PHASE_REVEAL_START = 100;   // Reveal: 100–180
const SCORE_ANIM_START = 108;

// Content
const QUESTION = "Which hook manages side effects in React?";
const OPTIONS: { label: string; text: string; correct: boolean }[] = [
  { label: "A", text: "useState",   correct: false },
  { label: "B", text: "useEffect",  correct: true  },
  { label: "C", text: "useReducer", correct: false },
  { label: "D", text: "useRef",     correct: false },
];
const CORRECT_INDEX = 1; // B

// Score
const SCORE_FROM = 80;
const SCORE_TO   = 90;

// Colours
const BG_COLOR   = "#0a0a0f";
const ACCENT     = "#6366f1"; // indigo-500
const ACCENT_LT  = "#818cf8"; // indigo-400
const GREEN      = "#10b981"; // emerald-500
const GREEN_GLOW = "rgba(16,185,129,0.40)";
const WHITE      = "#ffffff";
const MUTED      = "rgba(255,255,255,0.45)";
const FONT       = "system-ui, -apple-system, 'Helvetica Neue', sans-serif";

// ── Helpers ───────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
  interpolate(v, [lo, hi], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ── Background + grid ─────────────────────────────────────────────────────────
const Background: React.FC = () => (
  <>
    {/* Base gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.18) 0%, ${BG_COLOR} 55%)`,
      }}
    />
    {/* Dot grid */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        pointerEvents: "none",
      }}
    />
    {/* Horizontal accent line */}
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 0,
        right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${ACCENT}44 30%, ${ACCENT}88 50%, ${ACCENT}44 70%, transparent 100%)`,
      }}
    />
  </>
);

// ── Header bar ────────────────────────────────────────────────────────────────
const HeaderBar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const slideDown = spring({
    frame,
    fps,
    from: -80,
    to: 0,
    config: { damping: 20, stiffness: 160, mass: 0.7 },
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Score counter: animate from SCORE_FROM → SCORE_TO
  const scoreProgress = interpolate(
    frame,
    [SCORE_ANIM_START, SCORE_ANIM_START + 30],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  const score = Math.round(SCORE_FROM + scoreProgress * (SCORE_TO - SCORE_FROM));
  const scoreChanged = frame >= SCORE_ANIM_START;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 56,
        paddingRight: 56,
        opacity,
        transform: `translateY(${slideDown}px)`,
        borderBottom: "1px solid rgba(99,102,241,0.20)",
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(10,10,15,0.70)",
      }}
    >
      {/* Brand / category label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_LT} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 18 }}>⚡</span>
        </div>
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
            color: ACCENT_LT,
          }}
        >
          React Quiz
        </span>
      </div>

      {/* Score display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: scoreChanged
            ? `rgba(16,185,129,0.14)`
            : "rgba(99,102,241,0.12)",
          border: `1.5px solid ${scoreChanged ? "rgba(16,185,129,0.50)" : "rgba(99,102,241,0.35)"}`,
          borderRadius: 40,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 20,
          paddingRight: 20,
          transition: "none",
          boxShadow: scoreChanged
            ? `0 0 20px rgba(16,185,129,0.25)`
            : "none",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 15,
            color: scoreChanged ? GREEN : MUTED,
            letterSpacing: 0.5,
          }}
        >
          Score
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 22,
            color: scoreChanged ? GREEN : WHITE,
            letterSpacing: -0.5,
            minWidth: 36,
            textAlign: "right" as const,
          }}
        >
          {score}
        </span>
      </div>
    </div>
  );
};

// ── Question text (types on) ───────────────────────────────────────────────────
const QuestionText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const slideUp = spring({
    frame,
    fps,
    from: 40,
    to: 0,
    config: { damping: 18, stiffness: 140, mass: 0.8 },
  });
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Typewriter: full question by frame 55
  const CHARS_PER_FRAME = QUESTION.length / 55;
  const charCount = Math.min(
    QUESTION.length,
    Math.floor(frame * CHARS_PER_FRAME)
  );
  const visibleText = QUESTION.slice(0, charCount);
  const cursor = charCount < QUESTION.length ? "|" : "";

  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 56,
        right: 56,
        opacity,
        transform: `translateY(${slideUp}px)`,
      }}
    >
      {/* Q label */}
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: 4,
          textTransform: "uppercase" as const,
          color: ACCENT_LT,
          marginBottom: 16,
        }}
      >
        Question 3 of 10
      </div>

      {/* Question card */}
      <div
        style={{
          backgroundColor: "rgba(99,102,241,0.08)",
          border: "1.5px solid rgba(99,102,241,0.30)",
          borderRadius: 20,
          padding: "32px 40px",
          minHeight: 120,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 36,
            lineHeight: 1.3,
            color: WHITE,
            letterSpacing: -0.3,
          }}
        >
          {visibleText}
          <span
            style={{
              color: ACCENT_LT,
              opacity: 0.9,
              marginLeft: 1,
            }}
          >
            {cursor}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Single answer card ─────────────────────────────────────────────────────────
interface AnswerCardProps {
  frame: number;
  fps: number;
  index: number;
  label: string;
  text: string;
  isCorrect: boolean;
  revealed: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  frame,
  fps,
  index,
  label,
  text,
  isCorrect,
  revealed,
}) => {
  // Stagger: each card starts 15 frames after the previous
  const startFrame = PHASE_ANSWERS_START + index * 15;
  const localF = Math.max(0, frame - startFrame);

  const slideX = spring({
    frame: localF,
    fps,
    from: 140,
    to: 0,
    config: { damping: 20, stiffness: 170, mass: 0.75 },
  });
  const entryOpacity = interpolate(localF, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Reveal phase: correct → green, wrong → dimmed
  const revealProgress = interpolate(
    frame,
    [PHASE_REVEAL_START, PHASE_REVEAL_START + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const dimOpacity = revealed && !isCorrect
    ? interpolate(
        frame,
        [PHASE_REVEAL_START, PHASE_REVEAL_START + 18],
        [1, 0.3],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  const isHighlighted = revealed && isCorrect;
  const highlightScale = isHighlighted
    ? spring({
        frame: Math.max(0, frame - PHASE_REVEAL_START),
        fps,
        from: 1,
        to: 1.04,
        config: { damping: 14, stiffness: 200, mass: 0.6 },
      })
    : 1;

  // Background and border colours
  const cardBg = isHighlighted
    ? `rgba(16,185,129,${0.18 * revealProgress})`
    : "rgba(255,255,255,0.05)";
  const cardBorder = isHighlighted
    ? `rgba(16,185,129,${0.70 * revealProgress})`
    : "rgba(255,255,255,0.14)";
  const badgeBg = isHighlighted
    ? `rgba(16,185,129,${0.28 * revealProgress})`
    : "rgba(99,102,241,0.18)";
  const badgeColor = isHighlighted ? GREEN : ACCENT_LT;
  const cardShadow = isHighlighted
    ? `0 0 40px rgba(16,185,129,${0.35 * revealProgress})`
    : "none";

  return (
    <div
      style={{
        opacity: entryOpacity * dimOpacity,
        transform: `translateX(${slideX}px) scale(${highlightScale})`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        backgroundColor: cardBg,
        border: `2px solid ${cardBorder}`,
        borderRadius: 16,
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: 24,
        paddingRight: 28,
        boxShadow: cardShadow,
      }}
    >
      {/* Letter badge */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          backgroundColor: badgeBg,
          border: `2px solid ${badgeColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 20,
            color: badgeColor,
          }}
        >
          {label}
        </span>
      </div>

      {/* Answer text */}
      <span
        style={{
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          fontWeight: 600,
          fontSize: 26,
          color: isHighlighted ? WHITE : "rgba(255,255,255,0.88)",
          letterSpacing: 0.3,
          flex: 1,
        }}
      >
        {text}
      </span>

      {/* Correct tick */}
      {isHighlighted && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: GREEN,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: revealProgress,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, color: WHITE, fontWeight: 800 }}>✓</span>
        </div>
      )}
    </div>
  );
};

// ── Answers grid (2×2) ────────────────────────────────────────────────────────
const AnswersGrid: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const revealed = frame >= PHASE_REVEAL_START;

  // 2 columns × 2 rows
  const rows = [
    [OPTIONS[0], OPTIONS[1]],
    [OPTIONS[2], OPTIONS[3]],
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 320,
        left: 56,
        right: 56,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: "flex",
            gap: 20,
          }}
        >
          {row.map((opt, colIdx) => {
            const globalIndex = rowIdx * 2 + colIdx;
            return (
              <div key={opt.label} style={{ flex: 1 }}>
                <AnswerCard
                  frame={frame}
                  fps={fps}
                  index={globalIndex}
                  label={opt.label}
                  text={opt.text}
                  isCorrect={opt.correct}
                  revealed={revealed}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── "+10 pts" result banner ────────────────────────────────────────────────────
const ResultBanner: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < PHASE_REVEAL_START) return null;

  const localF = Math.max(0, frame - PHASE_REVEAL_START);
  const slideUp = spring({
    frame: localF,
    fps,
    from: 80,
    to: 0,
    config: { damping: 16, stiffness: 160, mass: 0.7 },
  });
  const opacity = interpolate(localF, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse glow
  const glowPulse = interpolate(
    frame,
    [PHASE_REVEAL_START + 20, PHASE_REVEAL_START + 40, PHASE_REVEAL_START + 60],
    [1, 1.6, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        left: 56,
        right: 56,
        opacity,
        transform: `translateY(${slideUp}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(16,185,129,0.12)",
          border: "2px solid rgba(16,185,129,0.55)",
          borderRadius: 20,
          paddingTop: 22,
          paddingBottom: 22,
          paddingLeft: 36,
          paddingRight: 36,
          boxShadow: `0 0 ${40 * glowPulse}px ${GREEN_GLOW}, inset 0 1px 0 rgba(16,185,129,0.20)`,
        }}
      >
        {/* Left: correct label */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px rgba(16,185,129,0.60)`,
            }}
          >
            <span style={{ fontSize: 22, color: WHITE }}>✓</span>
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 22,
                color: GREEN,
                letterSpacing: -0.2,
              }}
            >
              Correct!
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 15,
                color: MUTED,
                marginTop: 2,
              }}
            >
              useEffect runs after each render
            </div>
          </div>
        </div>

        {/* Right: points awarded */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 42,
              color: GREEN,
              letterSpacing: -1,
              lineHeight: 1,
            }}
          >
            +10
          </span>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 20,
              color: "rgba(16,185,129,0.75)",
              letterSpacing: 1,
            }}
          >
            pts
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Progress dots (question tracker) ─────────────────────────────────────────
const ProgressDots: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 252,
        left: 56,
        right: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity,
      }}
    >
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const isActive = i === 2; // current question is #3 (index 2)
          const isDone = i < 2;
          return (
            <div
              key={i}
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isDone
                  ? GREEN
                  : isActive
                  ? ACCENT_LT
                  : "rgba(255,255,255,0.15)",
                transition: "none",
              }}
            />
          );
        })}
      </div>

      {/* Time hint */}
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 13,
          color: MUTED,
          letterSpacing: 0.5,
        }}
      >
        React Hooks · Intermediate
      </span>
    </div>
  );
};

// ── Radial glow (background accent for reveal) ────────────────────────────────
const RevealGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const glowOpacity = interpolate(
    frame,
    [PHASE_REVEAL_START, PHASE_REVEAL_START + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (glowOpacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.12) 0%, transparent 60%)`,
        opacity: glowOpacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Main composition ───────────────────────────────────────────────────────────
export const QuizCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      <Background />
      <RevealGlow frame={frame} />
      <HeaderBar frame={frame} fps={fps} />
      <QuestionText frame={frame} fps={fps} />
      <ProgressDots frame={frame} />
      <AnswersGrid frame={frame} fps={fps} />
      <ResultBanner frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="QuizCard"
    component={QuizCard}
    durationInFrames={DURATION}
    fps={30}
    width={1280}
    height={720}
  />
);
