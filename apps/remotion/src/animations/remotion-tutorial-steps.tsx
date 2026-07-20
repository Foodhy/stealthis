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

// ─── Data ───────────────────────────────────────────────────────────────────

const STEPS: {
  number: number;
  title: string;
  description: string;
}[] = [
  {
    number: 1,
    title: "Install CLI",
    description: "Run npm install -g @myplatform/cli to get the deploy tools globally.",
  },
  {
    number: 2,
    title: "Login with API Key",
    description: "Run myplatform login and paste your API key from the dashboard.",
  },
  {
    number: 3,
    title: "Create Project",
    description: "Use myplatform init my-app to scaffold a new project directory.",
  },
  {
    number: 4,
    title: "Add Environment Variables",
    description: "Create a .env file and define DATABASE_URL, SECRET_KEY, and PORT.",
  },
  {
    number: 5,
    title: "Run Deploy Command",
    description: "Execute myplatform deploy --prod to push your build to production.",
  },
  {
    number: 6,
    title: "Open Dashboard",
    description: "Visit app.myplatform.io to monitor logs, metrics, and domain settings.",
  },
];

// ─── Constants ──────────────────────────────────────────────────────────────

const BG = "#0a0a0f";
const ACCENT = "#6366f1";
const ACCENT_LIGHT = "#818cf8";
const ACCENT_DARK = "#4338ca";
const EMERALD = "#10b981";
const CARD_BG = "#13131c";
const CARD_BORDER = "rgba(99,102,241,0.18)";
const MUTED = "rgba(255,255,255,0.45)";
const STEP_STAGGER = 25; // frames between each step card entrance
const HEADER_DURATION = 40; // frames for header to settle
const CHECKMARK_DELAY = 30; // frames after card enter before checkmark stamps

// ─── Sub-component: Background ──────────────────────────────────────────────

const Background: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow top-center */}
      <div
        style={{
          position: "absolute",
          top: -180,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Subtle bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(16,185,129,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Sub-component: Header ───────────────────────────────────────────────────

const Header: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90, mass: 0.8 },
  });

  const subtitleProgress = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });

  const tagProgress = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 16, stiffness: 70, mass: 0.8 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [28, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  const tagOpacity = interpolate(tagProgress, [0, 1], [0, 1]);
  const tagScale = interpolate(tagProgress, [0, 1], [0.85, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 46,
        paddingBottom: 28,
        gap: 8,
      }}
    >
      {/* Tag */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `scale(${tagScale})`,
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 100,
          padding: "4px 14px",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: ACCENT_LIGHT,
            boxShadow: `0 0 8px ${ACCENT}`,
          }}
        />
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: ACCENT_LIGHT,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Getting Started
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "system-ui, sans-serif",
          fontSize: 42,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Deploy Your First App
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontFamily: "system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: MUTED,
          textAlign: "center",
          maxWidth: 480,
        }}
      >
        Follow these 6 steps to ship your project in minutes — no experience needed.
      </div>
    </div>
  );
};

// ─── Sub-component: Checkmark ────────────────────────────────────────────────

const Checkmark: React.FC<{ frame: number; fps: number; startFrame: number }> = ({
  frame,
  fps,
  startFrame,
}) => {
  const localFrame = frame - startFrame;
  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.5 },
  });

  const scale = interpolate(progress, [0, 1], [0, 1]);
  const opacity = interpolate(progress, [0, 0.1, 1], [0, 1, 1]);
  // Brief overshoot "stamp" feel via an additional bounce
  const rotate = interpolate(progress, [0, 0.4, 0.7, 1], [-20, 8, -4, 0]);

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: EMERALD,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 16px rgba(16,185,129,0.5)`,
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline
          points="3,8 7,12 13,4"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// ─── Sub-component: StepCard ─────────────────────────────────────────────────

const StepCard: React.FC<{
  step: (typeof STEPS)[number];
  frame: number;
  fps: number;
  enterFrame: number;
}> = ({ step, frame, fps, enterFrame }) => {
  const localFrame = frame - enterFrame;
  const cardProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 100, mass: 0.9 },
  });

  const opacity = interpolate(cardProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(cardProgress, [0, 1], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(cardProgress, [0, 1], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const checkmarkStartFrame = enterFrame + CHECKMARK_DELAY;

  if (localFrame < 0) return <div style={{ flex: "0 0 calc(50% - 10px)" }} />;

  return (
    <div
      style={{
        flex: "0 0 calc(50% - 10px)",
        position: "relative",
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 18,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Inner glow top-left accent */}
      <div
        style={{
          position: "absolute",
          top: -30,
          left: -20,
          width: 120,
          height: 90,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Number badge */}
      <div
        style={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
          boxShadow: `0 0 20px rgba(99,102,241,0.4)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          {step.number}
        </span>
      </div>

      {/* Text content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 2 }}>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 17,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: MUTED,
            lineHeight: 1.55,
            maxWidth: 330,
          }}
        >
          {step.description}
        </div>
      </div>

      {/* Animated checkmark stamp */}
      <Checkmark frame={frame} fps={fps} startFrame={checkmarkStartFrame} />
    </div>
  );
};

// ─── Sub-component: ProgressBar ──────────────────────────────────────────────

const ProgressBar: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  const progress = interpolate(frame, [0, totalFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const barOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: 200,
        opacity: barOpacity,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 3,
          borderRadius: 100,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            borderRadius: 100,
            background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 100%)`,
            boxShadow: `0 0 8px ${ACCENT}`,
          }}
        />
      </div>
    </div>
  );
};

// ─── Main Composition ────────────────────────────────────────────────────────

export const TutorialSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "system-ui, sans-serif" }}>
      <Background />

      <AbsoluteFill>
        {/* Header */}
        <Sequence from={0}>
          <Header frame={frame} fps={fps} />
        </Sequence>

        {/* Steps grid */}
        <div
          style={{
            position: "absolute",
            top: 168,
            left: 60,
            right: 60,
            bottom: 56,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignContent: "flex-start",
          }}
        >
          {STEPS.map((step, i) => {
            const enterFrame = HEADER_DURATION + i * STEP_STAGGER;
            return (
              <StepCard
                key={step.number}
                step={step}
                frame={frame}
                fps={fps}
                enterFrame={enterFrame}
              />
            );
          })}
        </div>

        {/* Progress bar */}
        <ProgressBar frame={frame} totalFrames={durationInFrames} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── RemotionRoot ────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TutorialSteps"
      component={TutorialSteps}
      durationInFrames={240}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
