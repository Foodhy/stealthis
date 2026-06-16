import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const DURATION = 450; // 15 s at 30 fps

// Phases (in frames)
const PHASE_QUESTION_END = 60;
const PHASE_OPTIONS_START = 60;
const PHASE_OPTIONS_END = 240;
const PHASE_COUNTDOWN_START = 240;
const PHASE_COUNTDOWN_END = 300;
const PHASE_REVEAL_START = 300;
const PHASE_REVEAL_END = 420;

// Content
const QUESTION = "What does 'typeof null' return in JavaScript?";
const OPTIONS: { label: string; text: string; correct: boolean }[] = [
  { label: "A", text: '"null"', correct: false },
  { label: "B", text: '"undefined"', correct: false },
  { label: "C", text: '"object"', correct: true },
  { label: "D", text: '"string"', correct: false },
];
const CORRECT_INDEX = 2; // C

// Colours
const BG_TOP = "#1a0a2e";
const BG_BOTTOM = "#0d0620";
const ACCENT_PURPLE = "#a855f7";
const ACCENT_GREEN = "#22c55e";
const PILL_BORDER = "rgba(255,255,255,0.35)";
const PILL_BG = "rgba(255,255,255,0.06)";
const PILL_CORRECT_BG = "rgba(34,197,94,0.18)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.55)";

const FONT = "system-ui, -apple-system, 'Helvetica Neue', sans-serif";

// Confetti dot colours
const CONFETTI_COLORS = [
  "#f472b6",
  "#a855f7",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#f87171",
  "#38bdf8",
  "#4ade80",
  "#e879f9",
];

// ── Dot-grid overlay ──────────────────────────────────────────────────────────
const DotGrid: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "radial-gradient(circle, rgba(168,85,247,0.10) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
      pointerEvents: "none",
    }}
  />
);

// ── Timer bar at top ──────────────────────────────────────────────────────────
const TimerBar: React.FC<{ frame: number }> = ({ frame }) => {
  // Only visible during options phase
  const opacity = interpolate(
    frame,
    [PHASE_OPTIONS_START, PHASE_OPTIONS_START + 10, PHASE_OPTIONS_END - 10, PHASE_OPTIONS_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const progress = interpolate(
    frame,
    [PHASE_OPTIONS_START, PHASE_OPTIONS_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Color transitions from purple → yellow → red as timer runs down
  const r = Math.round(interpolate(progress, [0, 0.4, 1], [239, 251, 168], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const g = Math.round(interpolate(progress, [0, 0.4, 1], [68, 191, 85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const b = Math.round(interpolate(progress, [0, 0.4, 1], [68, 36, 247], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: "rgba(255,255,255,0.10)",
        opacity,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: `rgb(${r},${g},${b})`,
          boxShadow: `0 0 12px rgb(${r},${g},${b})`,
          transition: "none",
        }}
      />
    </div>
  );
};

// ── Question card ─────────────────────────────────────────────────────────────
const QuestionCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const translateY = spring({
    frame,
    fps,
    from: -120,
    to: 0,
    config: { damping: 18, stiffness: 140, mass: 0.8 },
  });
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 48,
        right: 48,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Quiz label */}
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 4,
          textTransform: "uppercase" as const,
          color: ACCENT_PURPLE,
          marginBottom: 24,
          textShadow: `0 0 20px ${ACCENT_PURPLE}`,
        }}
      >
        ⚡ JS Quiz
      </div>

      {/* Question */}
      <div
        style={{
          backgroundColor: "rgba(168,85,247,0.10)",
          border: "1.5px solid rgba(168,85,247,0.35)",
          borderRadius: 24,
          padding: "36px 40px",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: 1.2,
            color: TEXT_PRIMARY,
            letterSpacing: -0.5,
          }}
        >
          {QUESTION}
        </div>
      </div>
    </div>
  );
};

// ── Single answer option pill ─────────────────────────────────────────────────
const OptionPill: React.FC<{
  frame: number;
  fps: number;
  index: number;
  label: string;
  text: string;
  isCorrect: boolean;
  revealCorrect: boolean;
}> = ({ frame, fps, index, label, text, isCorrect, revealCorrect }) => {
  // Stagger each option 30 frames apart starting at PHASE_OPTIONS_START
  const startFrame = PHASE_OPTIONS_START + index * 30;
  const f = Math.max(0, frame - startFrame);

  const translateX = spring({
    frame: f,
    fps,
    from: -160,
    to: 0,
    config: { damping: 16, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(f, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Correct answer highlight after reveal phase starts
  const highlightProgress = interpolate(
    frame,
    [PHASE_COUNTDOWN_END, PHASE_COUNTDOWN_END + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const showHighlight = revealCorrect && isCorrect;
  const dimWrong = revealCorrect && !isCorrect;

  const dimOpacity = dimWrong
    ? interpolate(frame, [PHASE_COUNTDOWN_END, PHASE_COUNTDOWN_END + 15], [1, 0.25], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const borderColor = showHighlight
    ? `rgba(34,197,94,${highlightProgress})`
    : PILL_BORDER;

  const bgColor = showHighlight ? PILL_CORRECT_BG : PILL_BG;

  return (
    <div
      style={{
        opacity: opacity * dimOpacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 60,
        paddingTop: 22,
        paddingBottom: 22,
        paddingLeft: 28,
        paddingRight: 36,
        boxShadow: showHighlight
          ? `0 0 30px rgba(34,197,94,${highlightProgress * 0.5})`
          : "none",
      }}
    >
      {/* Letter badge */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          backgroundColor: showHighlight
            ? `rgba(34,197,94,${0.3 * highlightProgress})`
            : "rgba(168,85,247,0.20)",
          border: `2px solid ${showHighlight ? `rgba(34,197,94,${highlightProgress})` : ACCENT_PURPLE}`,
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
            fontSize: 22,
            color: showHighlight ? ACCENT_GREEN : ACCENT_PURPLE,
          }}
        >
          {label}
        </span>
      </div>

      {/* Answer text */}
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 36,
          color: TEXT_PRIMARY,
          letterSpacing: 0.2,
        }}
      >
        {text}
      </span>

      {/* Checkmark for correct */}
      {showHighlight && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 38,
            opacity: highlightProgress,
          }}
        >
          ✓
        </span>
      )}
    </div>
  );
};

// ── Options list ──────────────────────────────────────────────────────────────
const OptionsList: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const revealCorrect = frame >= PHASE_COUNTDOWN_END;

  return (
    <div
      style={{
        position: "absolute",
        top: 580,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {OPTIONS.map((opt, i) => (
        <OptionPill
          key={opt.label}
          frame={frame}
          fps={fps}
          index={i}
          label={opt.label}
          text={opt.text}
          isCorrect={opt.correct}
          revealCorrect={revealCorrect}
        />
      ))}
    </div>
  );
};

// ── Countdown ring (SVG) ──────────────────────────────────────────────────────
const CountdownRing: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < PHASE_COUNTDOWN_START || frame > PHASE_COUNTDOWN_END) return null;

  const opacity = interpolate(
    frame,
    [PHASE_COUNTDOWN_START, PHASE_COUNTDOWN_START + 8, PHASE_COUNTDOWN_END - 6, PHASE_COUNTDOWN_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const progress = interpolate(
    frame,
    [PHASE_COUNTDOWN_START, PHASE_COUNTDOWN_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // Position the ring over option C (index 2)
  // Options start at top:580, each ~98px tall + 24px gap
  // Option C is at index 2 → 580 + 2*(98+24) = 580 + 244 = 824, center ~873
  const ringCenterY = 873;
  const ringCenterX = 540; // horizontal center of 1080px

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    >
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Track */}
        <circle
          cx={ringCenterX}
          cy={ringCenterY}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={8}
        />
        {/* Progress arc */}
        <circle
          cx={ringCenterX}
          cy={ringCenterY}
          r={radius}
          fill="none"
          stroke={ACCENT_PURPLE}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${ringCenterX} ${ringCenterY})`}
          style={{ filter: `drop-shadow(0 0 10px ${ACCENT_PURPLE})` }}
        />
      </svg>
    </div>
  );
};

// ── Green flash overlay ───────────────────────────────────────────────────────
const GreenFlash: React.FC<{ frame: number }> = ({ frame }) => {
  const flashOpacity = interpolate(
    frame,
    [PHASE_COUNTDOWN_END - 4, PHASE_COUNTDOWN_END, PHASE_COUNTDOWN_END + 12, PHASE_COUNTDOWN_END + 24],
    [0, 0.45, 0.45, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (flashOpacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: ACCENT_GREEN,
        opacity: flashOpacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ── Correct banner ────────────────────────────────────────────────────────────
const CorrectBanner: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = Math.max(0, frame - PHASE_REVEAL_START);
  const translateY = spring({
    frame: f,
    fps,
    from: 200,
    to: 0,
    config: { damping: 16, stiffness: 140, mass: 0.8 },
  });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < PHASE_REVEAL_START) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: 48,
        right: 48,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: ACCENT_GREEN,
          borderRadius: 28,
          paddingTop: 32,
          paddingBottom: 32,
          paddingLeft: 44,
          paddingRight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          boxShadow: `0 0 60px rgba(34,197,94,0.55)`,
        }}
      >
        <span style={{ fontSize: 52 }}>✓</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 22,
              color: "rgba(0,0,0,0.65)",
              textTransform: "uppercase" as const,
              letterSpacing: 2,
            }}
          >
            Correct!
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 42,
              color: "#000000",
              letterSpacing: -0.5,
            }}
          >
            typeof null === "object"
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Confetti dots ─────────────────────────────────────────────────────────────
interface ConfettiDot {
  id: number;
  color: string;
  angle: number; // radians
  distance: number; // max px from center
  size: number;
  delay: number;
}

// Pre-generate 20 dots deterministically (no Math.random at render time)
const CONFETTI_DOTS: ConfettiDot[] = Array.from({ length: 20 }, (_, i) => {
  const golden = 2.399963; // golden angle in radians
  return {
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    angle: i * golden,
    distance: 200 + (i % 5) * 80,
    size: 16 + (i % 4) * 8,
    delay: Math.floor(i * 2.5), // stagger 0-47 frames
  };
});

const ConfettiBurst: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < PHASE_REVEAL_START) return null;

  // Center of composition
  const cx = 540;
  const cy = 960;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {CONFETTI_DOTS.map((dot) => {
        const f = Math.max(0, frame - PHASE_REVEAL_START - dot.delay);

        const dist = spring({
          frame: f,
          fps,
          from: 0,
          to: dot.distance,
          config: { damping: 12, stiffness: 100, mass: 0.6 },
        });

        const opacity = interpolate(f, [0, 6, 50, 80], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const x = cx + Math.cos(dot.angle) * dist - dot.size / 2;
        const y = cy + Math.sin(dot.angle) * dist - dot.size / 2;

        const rotate = interpolate(f, [0, 80], [0, 360 * (dot.id % 2 === 0 ? 1 : -1)], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={dot.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.id % 3 === 0 ? "50%" : 4,
              backgroundColor: dot.color,
              opacity,
              transform: `rotate(${rotate}deg)`,
              boxShadow: `0 0 8px ${dot.color}`,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Phase label (bottom hint) ─────────────────────────────────────────────────
const PhaseHint: React.FC<{ frame: number }> = ({ frame }) => {
  const inOptions =
    frame >= PHASE_OPTIONS_START && frame < PHASE_COUNTDOWN_START;
  const inCountdown =
    frame >= PHASE_COUNTDOWN_START && frame < PHASE_COUNTDOWN_END;

  let label = "";
  if (inOptions) {
    const secondsLeft = Math.ceil(
      ((PHASE_COUNTDOWN_START - frame) / 30)
    );
    label = `⏱ Think fast… ${secondsLeft}s`;
  } else if (inCountdown) {
    label = "🔍 Revealing answer…";
  }

  if (!label) return null;

  const opacity = interpolate(frame, [PHASE_OPTIONS_START, PHASE_OPTIONS_START + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: "center" as const,
        opacity,
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 28,
        color: TEXT_MUTED,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const QuizShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 30%, #2d1050 0%, ${BG_TOP} 45%, ${BG_BOTTOM} 100%)`,
        overflow: "hidden",
      }}
    >
      <DotGrid />

      {/* Timer bar (top) */}
      <TimerBar frame={frame} />

      {/* Question */}
      <QuestionCard frame={frame} fps={fps} />

      {/* Answer options */}
      <OptionsList frame={frame} fps={fps} />

      {/* Countdown ring over option C */}
      <CountdownRing frame={frame} />

      {/* Green flash */}
      <GreenFlash frame={frame} />

      {/* Confetti */}
      <ConfettiBurst frame={frame} fps={fps} />

      {/* Correct banner */}
      <CorrectBanner frame={frame} fps={fps} />

      {/* Phase hint */}
      <PhaseHint frame={frame} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="QuizShort"
    component={QuizShort}
    durationInFrames={DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
