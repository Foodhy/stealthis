import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Data ──────────────────────────────────────────────────────────────
interface CardData {
  id: number;
  question: string;
  answer: string;
  tag: string;
  accent: string;
}

const CARDS: CardData[] = [
  {
    id: 1,
    question: "What is a closure?",
    answer: "A function that retains\naccess to its outer scope\neven after the scope has closed.",
    tag: "JavaScript",
    accent: "#818cf8",
  },
  {
    id: 2,
    question: "What does\nasync/await do?",
    answer: "Syntactic sugar over Promises\nfor writing asynchronous code\nin a synchronous style.",
    tag: "JavaScript",
    accent: "#34d399",
  },
  {
    id: 3,
    question: "What is\nTypeScript?",
    answer: "A typed superset of JavaScript\nthat compiles to plain JS,\nadding static type safety.",
    tag: "TypeScript",
    accent: "#60a5fa",
  },
];

// Each card occupies 80 frames: 20 front | 20 flip-in | 20 back | 20 slide-out
const CARD_DURATION = 80;
const FLIP_HALF = 20;
const BACK_SHOW = 20;
const SLIDE_OUT = 20;

// ── Sub-component: Background ─────────────────────────────────────────
const Background: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();

  const glowOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#09090f", overflow: "hidden" }}>
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`,
          opacity: glowOpacity,
        }}
      />
      {/* Corner accents */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 200,
          height: 200,
          background: `radial-gradient(circle at top left, ${accent}10 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 200,
          height: 200,
          background: `radial-gradient(circle at bottom right, ${accent}10 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Sub-component: Header bar ─────────────────────────────────────────
const HeaderBar: React.FC<{ accent: string; cardIndex: number; totalCards: number }> = ({
  accent,
  cardIndex,
  totalCards,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const translateY = interpolate(frame, [0, 20], [-16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          paddingLeft: 16,
          paddingRight: 20,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Flashcard {cardIndex + 1} / {totalCards}
        </span>
      </div>
    </div>
  );
};

// ── Sub-component: Progress Dots ──────────────────────────────────────
const ProgressDots: React.FC<{
  totalCards: number;
  activeIndex: number;
  showBack: boolean;
  accent: string;
}> = ({ totalCards, activeIndex, showBack, accent }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 52,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity,
      }}
    >
      {/* Card progress dots */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {Array.from({ length: totalCards }).map((_, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;

          return (
            <div
              key={i}
              style={{
                width: isActive ? 28 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isActive ? accent : isPast ? `${accent}60` : "rgba(255,255,255,0.15)",
                boxShadow: isActive ? `0 0 10px ${accent}80` : "none",
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </div>

      {/* Flip hint label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: showBack ? `${accent}CC` : "rgba(255,255,255,0.25)",
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {showBack ? "Answer revealed" : "Tap to flip"}
      </div>
    </div>
  );
};

// ── Sub-component: Checkmark (appears on back) ────────────────────────
const CheckmarkBadge: React.FC<{ accent: string; visible: boolean }> = ({ accent, visible }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const scale = visible
    ? spring({
        fps,
        frame,
        config: { damping: 12, stiffness: 200, mass: 0.8 },
      })
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 52,
        height: 52,
        borderRadius: "50%",
        backgroundColor: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        boxShadow: `0 0 20px ${accent}80, 0 4px 16px rgba(0,0,0,0.4)`,
        zIndex: 10,
      }}
    >
      <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
        <path
          d="M5 13L10 18L21 7"
          stroke="#0a0a0f"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// ── Sub-component: Single Flashcard ──────────────────────────────────
interface FlashcardProps {
  card: CardData;
  cardIndex: number;
  totalCards: number;
  isFirst: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ card, cardIndex, totalCards, isFirst }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Phase timing ---
  // 0–19:   front face shown (slide in)
  // 20–39:  flip animation (scaleX 1→0 then 0→1 with color swap at frame 30)
  // 40–59:  back face shown
  // 60–79:  slide out

  const FLIP_START = 20;
  const FLIP_MID = 30;
  const FLIP_END = 40;
  const BACK_END = 60;
  const SLIDE_OUT_END = 80;

  // Slide-in (frames 0 → 12)
  // isFirst can be used to differentiate entry animation per card in the future
  const slideIn = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: isFirst ? 120 : 140, mass: 1 },
  });

  const slideInX = interpolate(slideIn, [0, 1], [120, 0]);

  // Slide-out (frames 60 → 79)
  const slideOutProgress = interpolate(frame, [BACK_END, SLIDE_OUT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const slideOutX = interpolate(slideOutProgress, [0, 1], [0, -120]);

  // Overall card X position
  const cardX = frame < BACK_END ? slideInX : slideOutX;

  // Overall opacity
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flip: scaleX goes 1 → 0 (frames 20–30), then 0 → 1 (frames 30–40)
  const scaleX = frame < FLIP_MID
    ? interpolate(frame, [FLIP_START, FLIP_MID], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      })
    : interpolate(frame, [FLIP_MID, FLIP_END], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });

  // Is back face showing?
  const showBack = frame >= FLIP_MID;
  const showBackContent = frame >= FLIP_END; // content fades in after full flip

  // Back content opacity
  const backContentOpacity = interpolate(frame, [FLIP_END, FLIP_END + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Front content opacity (fades out just before flip)
  const frontContentOpacity = interpolate(frame, [FLIP_START - 4, FLIP_START + 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Card dimensions
  const cardW = 680;
  const cardH = 380;

  // Colors
  const frontBg = "#1e1b4b"; // dark indigo
  const backBg = "#f8fafc"; // near-white
  const frontBorder = `${card.accent}40`;

  return (
    <>
      <Background accent={card.accent} />
      <HeaderBar accent={card.accent} cardIndex={cardIndex} totalCards={totalCards} />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Card wrapper — handles translate + scaleX */}
        <div
          style={{
            position: "relative",
            width: cardW,
            height: cardH,
            transform: `translateX(${cardX}px) scaleX(${scaleX})`,
            opacity: cardOpacity,
          }}
        >
          {/* Card face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              backgroundColor: showBack ? backBg : frontBg,
              border: showBack
                ? `2px solid ${card.accent}30`
                : `2px solid ${frontBorder}`,
              boxShadow: showBack
                ? `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)`
                : `0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px ${card.accent}20`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 48,
            }}
          >
            {/* Decorative top strip on front */}
            {!showBack && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${card.accent}, ${card.accent}40)`,
                }}
              />
            )}

            {/* Decorative top strip on back */}
            {showBack && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${card.accent}, ${card.accent}60)`,
                }}
              />
            )}

            {/* Tag pill */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 24,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 4,
                paddingBottom: 4,
                borderRadius: 8,
                backgroundColor: showBack ? `${card.accent}18` : `${card.accent}25`,
                border: `1px solid ${card.accent}40`,
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  color: showBack ? card.accent : `${card.accent}DD`,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                {card.tag}
              </span>
            </div>

            {/* FRONT content — question */}
            {!showBack && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  opacity: frontContentOpacity,
                }}
              >
                <div
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontWeight: 400,
                    fontSize: 13,
                    color: `${card.accent}BB`,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Question
                </div>
                <div
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontWeight: 700,
                    fontSize: 36,
                    color: "#ffffff",
                    textAlign: "center",
                    lineHeight: 1.3,
                    whiteSpace: "pre-line",
                  }}
                >
                  {card.question}
                </div>

                {/* Question mark decoration */}
                <div
                  style={{
                    marginTop: 8,
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: `${card.accent}18`,
                    border: `1px solid ${card.accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontWeight: 700,
                      fontSize: 22,
                      color: card.accent,
                    }}
                  >
                    ?
                  </span>
                </div>
              </div>
            )}

            {/* BACK content — answer */}
            {showBack && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  opacity: showBackContent ? backContentOpacity : 0,
                }}
              >
                <div
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    color: `${card.accent}`,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Answer
                </div>
                <div
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontWeight: 600,
                    fontSize: 28,
                    color: "#1a1a2e",
                    textAlign: "center",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                    maxWidth: 520,
                  }}
                >
                  {card.answer}
                </div>
              </div>
            )}
          </div>

          {/* Checkmark badge — floats above the card */}
          {showBack && (
            <CheckmarkBadge accent={card.accent} visible={showBackContent} />
          )}
        </div>
      </AbsoluteFill>

      <ProgressDots
        totalCards={totalCards}
        activeIndex={cardIndex}
        showBack={showBack && showBackContent}
        accent={card.accent}
      />
    </>
  );
};

// ── Sub-component: Outro Screen ────────────────────────────────────────
const OutroScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 100, mass: 1 },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineY = interpolate(frame, [10, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const taglineOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const accent = "#818cf8";

  return (
    <AbsoluteFill style={{ backgroundColor: "#09090f", overflow: "hidden" }}>
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${accent}20 0%, transparent 65%)`,
          opacity,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {/* Trophy icon */}
        <div
          style={{
            transform: `scale(${scale})`,
            opacity,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}, #60a5fa)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${accent}60, 0 8px 32px rgba(0,0,0,0.5)`,
            marginBottom: 8,
          }}
        >
          <svg width={44} height={44} viewBox="0 0 44 44" fill="none">
            <path
              d="M22 5L27.5 16.5L40 18.3L31 27L33.1 39.5L22 33.5L10.9 39.5L13 27L4 18.3L16.5 16.5L22 5Z"
              fill="white"
              stroke="none"
            />
          </svg>
        </div>

        <div
          style={{
            transform: `scale(${scale})`,
            opacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 48,
              color: "#ffffff",
              letterSpacing: -1,
              lineHeight: 1.1,
            }}
          >
            All cards reviewed!
          </div>
        </div>

        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 0.3,
            }}
          >
            Keep practicing to master these concepts.
          </div>

          {/* Score dots */}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            {CARDS.map((c) => (
              <div
                key={c.id}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: c.accent,
                  boxShadow: `0 0 8px ${c.accent}`,
                }}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Main Composition ──────────────────────────────────────────────────
export const FlashcardFlip: React.FC = () => {
  // Card 1: frames 0–79
  // Card 2: frames 80–159
  // Card 3: frames 160–239
  // Outro:  frames 240+  (but we cap at 270 total)
  const TOTAL_CARDS = CARDS.length;

  return (
    <AbsoluteFill>
      {CARDS.map((card, idx) => (
        <Sequence key={card.id} from={idx * CARD_DURATION} durationInFrames={CARD_DURATION}>
          <Flashcard
            card={card}
            cardIndex={idx}
            totalCards={TOTAL_CARDS}
            isFirst={idx === 0}
          />
        </Sequence>
      ))}

      {/* Outro screen */}
      <Sequence from={CARDS.length * CARD_DURATION} durationInFrames={30}>
        <OutroScreen />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="FlashcardFlip"
    component={FlashcardFlip}
    durationInFrames={270}
    fps={30}
    width={1280}
    height={720}
  />
);
