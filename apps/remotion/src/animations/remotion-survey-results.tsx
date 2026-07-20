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

// ── Palette & Config ──────────────────────────────────────────────────────────
const BG_COLOR = "#0a0a0f";

const ACCENT_COLORS = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ef4444", // rose
];

const GOLD = "#f59e0b";
const GOLD_GLOW = "rgba(245,158,11,0.35)";

// ── Data ──────────────────────────────────────────────────────────────────────
interface SurveyQuestion {
  icon: string;       // unicode symbol
  category: string;   // short category label
  question: string;   // question text
  answer: string;     // winning answer
  pct: number;        // percentage (0–100)
  respondents: number;
}

const SURVEY_TITLE = "Product Satisfaction Survey — Q3 2024";
const SURVEY_SUBTITLE = "2,400 respondents · Conducted Aug–Sep 2024";

const QUESTIONS: SurveyQuestion[] = [
  {
    icon: "★",
    category: "Overall",
    question: "How satisfied are you overall?",
    answer: "Very Satisfied",
    pct: 82,
    respondents: 1968,
  },
  {
    icon: "⚡",
    category: "Performance",
    question: "Does the app meet your speed expectations?",
    answer: "Yes, always",
    pct: 74,
    respondents: 1776,
  },
  {
    icon: "◈",
    category: "Design",
    question: "How intuitive is the user interface?",
    answer: "Very intuitive",
    pct: 68,
    respondents: 1632,
  },
  {
    icon: "♻",
    category: "Support",
    question: "Was our support team helpful?",
    answer: "Extremely helpful",
    pct: 91,
    respondents: 2184,
  },
  {
    icon: "✦",
    category: "Value",
    question: "Do you consider the pricing fair?",
    answer: "Definitely fair",
    pct: 63,
    respondents: 1512,
  },
  {
    icon: "→",
    category: "Loyalty",
    question: "Would you recommend us to a friend?",
    answer: "Absolutely",
    pct: 87,
    respondents: 2088,
  },
];

// Row reveal: each row starts animating STAGGER frames after the previous
const STAGGER = 25;
// How long each bar spring takes to settle
const BAR_SPRING_DURATION = 40;
// When the header fades in
const HEADER_IN = 0;
// Gold highlight pulse starts after all bars appear
const HIGHLIGHT_START = STAGGER * QUESTIONS.length + BAR_SPRING_DURATION;

// Index of the question with the highest pct
const BEST_IDX = QUESTIONS.reduce(
  (best, q, i) => (q.pct > QUESTIONS[best].pct ? i : best),
  0
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function useSpringValue(frame: number, startFrame: number, fps: number): number {
  return spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface RowProps {
  question: SurveyQuestion;
  index: number;
  color: string;
  isHighlighted: boolean;
  highlightProgress: number;
  frame: number;
  fps: number;
}

const SurveyRow: React.FC<RowProps> = ({
  question,
  index,
  color,
  isHighlighted,
  highlightProgress,
  frame,
  fps,
}) => {
  const startFrame = STAGGER * index;

  // Row entrance: slide in from left + fade
  const rowEntrance = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 20, stiffness: 100, mass: 1 },
  });

  // Bar fill progress
  const barProgress = useSpringValue(frame, startFrame + 5, fps);

  // Percentage counter (integer count-up)
  const displayPct = Math.round(lerp(0, question.pct, barProgress));

  // Respondents count-up
  const displayRespondents = Math.round(lerp(0, question.respondents, barProgress));

  const rowOpacity = interpolate(rowEntrance, [0, 1], [0, 1]);
  const rowX = interpolate(rowEntrance, [0, 1], [-40, 0]);

  // Gold highlight pulse (sinusoidal glow)
  const pulseAlpha = isHighlighted
    ? interpolate(highlightProgress, [0, 1], [0, 1], { extrapolateRight: "clamp" }) *
      (0.5 + 0.5 * Math.sin(highlightProgress * Math.PI * 6))
    : 0;

  // Bar max width in px (out of 1280 total, with left panel ~380px, right gutter 60px)
  const BAR_MAX_W = 720;
  const barWidth = BAR_MAX_W * (question.pct / 100) * barProgress;

  const rowHeight = 88;
  const barH = 28;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: rowHeight,
        opacity: rowOpacity,
        transform: `translateX(${rowX}px)`,
        borderRadius: 12,
        padding: "0 16px",
        background: isHighlighted
          ? `rgba(245,158,11,${0.06 * pulseAlpha + 0.04})`
          : "rgba(255,255,255,0.03)",
        boxShadow: isHighlighted
          ? `0 0 ${28 * pulseAlpha}px ${GOLD_GLOW}`
          : "none",
        border: isHighlighted
          ? `1px solid rgba(245,158,11,${0.4 * pulseAlpha + 0.1})`
          : "1px solid rgba(255,255,255,0.05)",
        marginBottom: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Icon + Category */}
      <div
        style={{
          width: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 22,
            color: isHighlighted ? GOLD : color,
            filter: `drop-shadow(0 0 6px ${isHighlighted ? GOLD_GLOW : color}88)`,
          }}
        >
          {question.icon}
        </span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            color: isHighlighted ? GOLD : color,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {question.category}
        </span>
      </div>

      {/* Question + Bar area */}
      <div style={{ flex: 1, paddingLeft: 16, paddingRight: 8 }}>
        {/* Question text */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {question.question}
        </div>

        {/* Answer label */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: isHighlighted ? GOLD : "rgba(255,255,255,0.90)",
            marginBottom: 8,
          }}
        >
          {question.answer}
        </div>

        {/* Bar */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: barH,
            background: "rgba(255,255,255,0.06)",
            borderRadius: barH / 2,
            overflow: "visible",
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: barH,
              width: barWidth,
              borderRadius: barH / 2,
              background: isHighlighted
                ? `linear-gradient(90deg, ${GOLD}cc, ${GOLD})`
                : `linear-gradient(90deg, ${color}aa, ${color})`,
              boxShadow: `0 0 16px ${isHighlighted ? GOLD_GLOW : color + "66"}`,
            }}
          />

          {/* Percentage badge at bar tip */}
          {barProgress > 0.05 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: barWidth + 8,
                transform: "translateY(-50%)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: isHighlighted ? GOLD : color,
                filter: `drop-shadow(0 0 4px ${isHighlighted ? GOLD_GLOW : color + "99"})`,
                whiteSpace: "nowrap",
              }}
            >
              {displayPct}%
            </div>
          )}
        </div>
      </div>

      {/* n= respondents */}
      <div
        style={{
          width: 90,
          flexShrink: 0,
          textAlign: "right",
          paddingRight: 4,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(255,255,255,0.30)",
            letterSpacing: "0.04em",
          }}
        >
          n =
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 17,
            fontWeight: 700,
            color: isHighlighted ? `rgba(245,158,11,0.85)` : "rgba(255,255,255,0.55)",
          }}
        >
          {displayRespondents.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────
export const SurveyResults: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header entrance
  const headerSpring = spring({
    frame: Math.max(0, frame - HEADER_IN),
    fps,
    config: { damping: 22, stiffness: 90, mass: 1 },
  });
  const headerOpacity = interpolate(headerSpring, [0, 1], [0, 1]);
  const headerY = interpolate(headerSpring, [0, 1], [-24, 0]);

  // Footer/divider line grows in
  const lineProgress = interpolate(frame, [STAGGER * 0.5, STAGGER * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gold highlight progress for the best question
  const highlightProgress = interpolate(
    frame,
    [HIGHLIGHT_START, HIGHLIGHT_START + 60],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: BG_COLOR,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 900px 500px at 50% 40%, rgba(99,102,241,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 600px 300px at 80% 70%, rgba(6,182,212,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Content container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "40px 60px 36px",
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 4,
            }}
          >
            {/* Survey badge */}
            <div
              style={{
                background: "rgba(99,102,241,0.18)",
                border: "1px solid rgba(99,102,241,0.40)",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: "#6366f1",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              Survey
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "0.06em",
              }}
            >
              CONFIDENTIAL · INTERNAL USE ONLY
            </div>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 5,
            }}
          >
            {SURVEY_TITLE}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.02em",
            }}
          >
            {SURVEY_SUBTITLE}
          </div>
        </div>

        {/* Divider line */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, rgba(99,102,241,0.60), rgba(6,182,212,0.40), transparent)`,
            width: `${lineProgress * 100}%`,
            marginBottom: 18,
            borderRadius: 1,
          }}
        />

        {/* Rows */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {QUESTIONS.map((q, i) => (
            <SurveyRow
              key={q.category}
              question={q}
              index={i}
              color={ACCENT_COLORS[i % ACCENT_COLORS.length]}
              isHighlighted={i === BEST_IDX}
              highlightProgress={highlightProgress}
              frame={frame}
              fps={fps}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            opacity: interpolate(frame, [30, 55], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,255,255,0.20)",
              letterSpacing: "0.05em",
            }}
          >
            stealthis.dev · Automated Report · 2024
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            {ACCENT_COLORS.map((c) => (
              <div
                key={c}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="SurveyResults"
    component={SurveyResults}
    durationInFrames={210}
    fps={30}
    width={1280}
    height={720}
  />
);
