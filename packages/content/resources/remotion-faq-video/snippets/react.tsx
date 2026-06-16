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

// ─── Types ───────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
  startFrame: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is there a free plan?",
    answer: "Yes — free forever for up to 3 users and 500 contacts.",
    startFrame: 0,
  },
  {
    question: "What integrations are supported?",
    answer: "Over 300 tools including Slack, Stripe, Zapier, and HubSpot.",
    startFrame: 55,
  },
  {
    question: "Is my data secure?",
    answer:
      "All data is encrypted at rest and in transit. SOC 2 Type II certified.",
    startFrame: 110,
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely — no contracts, cancel with one click.",
    startFrame: 165,
  },
];

const CTA_FRAME = 220;
const ANSWER_DELAY = 25;

// ─── Design tokens ────────────────────────────────────────────────────────────

const BG = "#0d0d12";
const ACCENT = "#f59e0b";
const ACCENT_DIM = "#92400e";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";
const CARD_BG = "#16161f";
const BORDER_COLOR = "#1e1e2e";

// ─── Sub-component: Background ────────────────────────────────────────────────

const Background: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow top-left */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Radial glow bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Sub-component: Header ────────────────────────────────────────────────────

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: 20,
  });

  const translateY = interpolate(opacity, [0, 1], [-20, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "36px 64px 0",
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Brand mark */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${ACCENT} 0%, #d97706 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#0d0d12",
              fontSize: 18,
              fontFamily: "system-ui",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            N
          </span>
        </div>
        <span
          style={{
            color: TEXT_PRIMARY,
            fontSize: 18,
            fontFamily: "system-ui",
            fontWeight: 700,
            letterSpacing: "-0.3px",
          }}
        >
          Nexus CRM
        </span>
      </div>

      {/* Label pill */}
      <div
        style={{
          background: "rgba(245,158,11,0.12)",
          border: `1px solid rgba(245,158,11,0.25)`,
          borderRadius: 999,
          padding: "6px 16px",
        }}
      >
        <span
          style={{
            color: ACCENT,
            fontSize: 13,
            fontFamily: "system-ui",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          FAQ
        </span>
      </div>
    </div>
  );
};

// ─── Sub-component: Question Badge ────────────────────────────────────────────

interface QuestionBadgeProps {
  index: number;
  startFrame: number;
}

const QuestionBadge: React.FC<QuestionBadgeProps> = ({ index, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
    durationInFrames: 18,
  });

  // Subtle pulse after entrance
  const pulse = Math.sin(localFrame * 0.18) * 0.04 + 1;
  const finalScale = localFrame > 18 ? pulse : scale;

  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${ACCENT} 0%, #d97706 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        opacity,
        transform: `scale(${finalScale})`,
        boxShadow: `0 0 20px rgba(245,158,11,0.4)`,
      }}
    >
      <span
        style={{
          color: "#0d0d12",
          fontSize: 20,
          lineHeight: 1,
          fontFamily: "system-ui",
          fontWeight: 800,
        }}
      >
        ?
      </span>
    </div>
  );
};

// ─── Sub-component: Typed Answer ──────────────────────────────────────────────

interface TypedAnswerProps {
  text: string;
  startFrame: number;
}

const TypedAnswer: React.FC<TypedAnswerProps> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();

  const localFrame = Math.max(0, frame - startFrame);

  // Reveal characters over ANSWER_DELAY frames
  const charsToShow = Math.floor(
    interpolate(localFrame, [0, ANSWER_DELAY], [0, text.length], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    })
  );

  const opacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const visibleText = text.slice(0, charsToShow);

  // Cursor blink — only while typing
  const isTyping = charsToShow < text.length;
  const cursorVisible = isTyping ? Math.floor(localFrame / 8) % 2 === 0 : false;

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          color: TEXT_SECONDARY,
          fontSize: 17,
          fontFamily: "system-ui",
          fontWeight: 400,
          lineHeight: 1.55,
        }}
      >
        {visibleText}
      </span>
      {cursorVisible && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 18,
            background: ACCENT,
            marginLeft: 2,
            borderRadius: 1,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </div>
  );
};

// ─── Sub-component: Separator Line ────────────────────────────────────────────

interface SeparatorProps {
  startFrame: number;
}

const Separator: React.FC<SeparatorProps> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const DRAW_START = startFrame + ANSWER_DELAY + 8;
  const localFrame = Math.max(0, frame - DRAW_START);

  const width = interpolate(localFrame, [0, 18], [0, 100], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        marginTop: 16,
        height: 1,
        background: BORDER_COLOR,
        position: "relative",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${width}%`,
          background: `linear-gradient(90deg, ${ACCENT} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
};

// ─── Sub-component: FAQ Card ──────────────────────────────────────────────────

interface FAQCardProps {
  item: FAQItem;
  index: number;
}

const FAQCard: React.FC<FAQCardProps> = ({ item, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - item.startFrame);

  // Card slides in from left
  const cardProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 120 },
    durationInFrames: 22,
  });

  const translateX = interpolate(cardProgress, [0, 1], [-60, 0]);
  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Question text slides in slightly after card
  const questionProgress = spring({
    frame: Math.max(0, localFrame - 5),
    fps,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 20,
  });

  const questionX = interpolate(questionProgress, [0, 1], [-30, 0]);
  const questionOpacity = interpolate(
    Math.max(0, localFrame - 5),
    [0, 10],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const isLast = index === FAQ_ITEMS.length - 1;

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          padding: "18px 20px",
          background: CARD_BG,
          borderRadius: 12,
          border: `1px solid ${BORDER_COLOR}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Left: badge */}
        <QuestionBadge index={index} startFrame={item.startFrame} />

        {/* Right: Q + A */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Question */}
          <div
            style={{
              opacity: questionOpacity,
              transform: `translateX(${questionX}px)`,
            }}
          >
            <span
              style={{
                color: TEXT_PRIMARY,
                fontSize: 19,
                fontFamily: "system-ui",
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "-0.3px",
              }}
            >
              {item.question}
            </span>
          </div>

          {/* Answer types in */}
          <div style={{ marginTop: 8 }}>
            <TypedAnswer
              text={item.answer}
              startFrame={item.startFrame + ANSWER_DELAY - 5}
            />
          </div>
        </div>

        {/* Accent side stripe */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT_DIM} 100%)`,
            borderRadius: "12px 0 0 12px",
            opacity: interpolate(localFrame, [8, 20], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        />
      </div>

      {/* Separator between items */}
      {!isLast && <Separator startFrame={item.startFrame} />}
    </div>
  );
};

// ─── Sub-component: CTA ───────────────────────────────────────────────────────

const CTABanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - CTA_FRAME);

  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 90 },
    durationInFrames: 28,
  });

  const translateY = interpolate(progress, [0, 1], [30, 0]);
  const opacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        marginTop: 20,
        padding: "20px 28px",
        background: `linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)`,
        border: `1px solid rgba(245,158,11,0.3)`,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            color: TEXT_PRIMARY,
            fontSize: 18,
            fontFamily: "system-ui",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Still have questions?
        </div>
        <div
          style={{
            color: TEXT_SECONDARY,
            fontSize: 14,
            fontFamily: "system-ui",
            fontWeight: 400,
          }}
        >
          Our team typically replies within 2 hours.
        </div>
      </div>

      {/* Email CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: ACCENT,
          borderRadius: 999,
          padding: "12px 24px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "#0d0d12",
            fontSize: 15,
            fontFamily: "system-ui",
            fontWeight: 700,
            letterSpacing: "-0.2px",
          }}
        >
          hello@nexuscrm.io
        </span>
        <span
          style={{
            color: "#0d0d12",
            fontSize: 16,
            fontFamily: "system-ui",
            fontWeight: 800,
          }}
        >
          →
        </span>
      </div>
    </div>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

const FAQVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title block fades in
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: 18,
  });

  const titleY = interpolate(titleOpacity, [0, 1], [-16, 0]);

  return (
    <AbsoluteFill>
      <Background />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "96px 80px 48px",
        }}
      >
        {/* Page title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              color: TEXT_PRIMARY,
              fontSize: 28,
              fontFamily: "system-ui",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Frequently Asked Questions
          </h1>
          <div
            style={{
              width: 48,
              height: 3,
              background: `linear-gradient(90deg, ${ACCENT} 0%, transparent 100%)`,
              borderRadius: 2,
              marginTop: 8,
            }}
          />
        </div>

        {/* FAQ list — stacks up as each item animates in */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            position: "relative",
          }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <Sequence key={item.question} from={item.startFrame} layout="none">
              <div style={{ position: "relative", marginBottom: i < FAQ_ITEMS.length - 1 ? 0 : 0 }}>
                <FAQCard item={item} index={i} />
              </div>
            </Sequence>
          ))}
        </div>

        {/* CTA Banner */}
        <Sequence from={CTA_FRAME} layout="none">
          <CTABanner />
        </Sequence>
      </div>

      <Header />
    </AbsoluteFill>
  );
};

// ─── RemotionRoot ─────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FAQVideo"
      component={FAQVideo}
      durationInFrames={270}
      fps={30}
      width={1280}
      height={720}
    />
  );
};

export default FAQVideo;
