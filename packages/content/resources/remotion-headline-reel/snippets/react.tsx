import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Constants ─────────────────────────────────────────────────────────────────
const NETWORK = "NNX";
const NETWORK_FULL = "NNX News Network";
const NETWORK_URL = "NNX.com";
const BROADCAST_TIME = "10:47 AM ET";

const ACCENT_RED = "#e8001e";
const BG_PRIMARY = "#0a0e1a";
const BG_SECONDARY = "#0f1422";
const TEXT_PRIMARY = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.55)";
const TOP_BAR_HEIGHT = 56;
const PROGRESS_BAR_COLOR = ACCENT_RED;

// Each headline occupies ~55 frames; transition out starts at frame 40 within story
const STORY_DURATION = 55; // frames per headline
const STORY_TRANSITION = 40; // frame within story when exit animation starts

const HEADLINES = [
  {
    number: "01",
    category: "POLITICS",
    categoryColor: "#e8001e",
    text: "Senate Passes Historic\nClimate Infrastructure Bill",
  },
  {
    number: "02",
    category: "ECONOMY",
    categoryColor: "#f5a623",
    text: "Fed Signals Rate Cuts\nAs Inflation Cools to 2.1%",
  },
  {
    number: "03",
    category: "WORLD",
    categoryColor: "#00b4d8",
    text: "G20 Summit Reaches\nLandmark Trade Agreement",
  },
  {
    number: "04",
    category: "TECH",
    categoryColor: "#00d4ff",
    text: "AI Chip Breakthrough Cuts\nEnergy Consumption by 60%",
  },
];

// End-card appears after all stories (4 × 55 = 220), runs to frame 240
const END_CARD_START = 220;

// ── Sub-components ────────────────────────────────────────────────────────────

/** Dark background with subtle grid lines and radial glow */
const Background: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: BG_PRIMARY,
      overflow: "hidden",
    }}
  >
    {/* Radial atmospheric glow */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,0,30,0.04) 0%, transparent 70%)`,
      }}
    />

    {/* Horizontal grid lines */}
    {[0.25, 0.5, 0.75].map((pct) => (
      <div
        key={pct}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${pct * 100}%`,
          height: 1,
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      />
    ))}

    {/* Vertical accent line (left) */}
    <div
      style={{
        position: "absolute",
        left: 80,
        top: TOP_BAR_HEIGHT,
        bottom: 0,
        width: 1,
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
    />
  </div>
);

/** Top bar: red strip with NETWORK logo, divider, time */
const TopBar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: TOP_BAR_HEIGHT,
        backgroundColor: "#090c17",
        borderBottom: `3px solid ${ACCENT_RED}`,
        display: "flex",
        alignItems: "center",
        opacity,
        zIndex: 10,
      }}
    >
      {/* Red network badge */}
      <div
        style={{
          backgroundColor: ACCENT_RED,
          height: "100%",
          paddingLeft: 20,
          paddingRight: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Signal icon (SVG) */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="10" width="3" height="7" rx="1" fill="white" opacity="0.6" />
          <rect x="6" y="6" width="3" height="11" rx="1" fill="white" opacity="0.8" />
          <rect x="11" y="2" width="3" height="15" rx="1" fill="white" />
          <circle cx="16" cy="3" r="1.5" fill="white" opacity={frame % 30 < 18 ? 1 : 0.25} />
        </svg>

        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 22,
            color: TEXT_PRIMARY,
            letterSpacing: 1,
          }}
        >
          {NETWORK}
        </span>
      </div>

      {/* Full network name */}
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: TEXT_MUTED,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginLeft: 18,
        }}
      >
        {NETWORK_FULL}
      </span>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Live dot + time */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginRight: 28,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: ACCENT_RED,
            boxShadow: `0 0 6px ${ACCENT_RED}`,
            opacity: frame % 30 < 20 ? 1 : 0.3,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: ACCENT_RED,
            letterSpacing: 2,
          }}
        >
          LIVE
        </span>
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            color: TEXT_MUTED,
            letterSpacing: 0.5,
            marginLeft: 8,
          }}
        >
          {BROADCAST_TIME}
        </span>
      </div>
    </div>
  );
};

/** Category pill badge */
const CategoryPill: React.FC<{
  label: string;
  color: string;
  opacity: number;
  translateY: number;
}> = ({ label, color, opacity, translateY }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      opacity,
      transform: `translateY(${translateY}px)`,
      marginBottom: 14,
    }}
  >
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: color,
      }}
    />
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 11,
        color,
        letterSpacing: 3,
        textTransform: "uppercase",
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: 3,
        padding: "3px 10px 3px 6px",
      }}
    >
      {label}
    </span>
  </div>
);

/** Number badge (e.g. "01") that springs in from the left */
const NumberBadge: React.FC<{
  number: string;
  storyFrame: number;
  fps: number;
  exitProgress: number;
}> = ({ number, storyFrame, fps, exitProgress }) => {
  const enterX = spring({
    frame: storyFrame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const x = interpolate(enterX, [0, 1], [-100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitY = interpolate(exitProgress, [0, 1], [0, -80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity =
    storyFrame < 6
      ? interpolate(storyFrame, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(exitProgress, [0.5, 1], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        top: "50%",
        transform: `translateX(${x}px) translateY(calc(-50% + ${exitY}px))`,
        opacity,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          border: `2px solid ${ACCENT_RED}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            width: 10,
            height: 10,
            borderTop: `2px solid ${ACCENT_RED}`,
            borderLeft: `2px solid ${ACCENT_RED}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: 10,
            height: 10,
            borderBottom: `2px solid ${ACCENT_RED}`,
            borderRight: `2px solid ${ACCENT_RED}`,
          }}
        />

        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontWeight: 700,
            fontSize: 28,
            color: ACCENT_RED,
            letterSpacing: 2,
          }}
        >
          {number}
        </span>
      </div>
    </div>
  );
};

/** Main headline text block — slides in from right, exits upward */
const HeadlineText: React.FC<{
  headline: (typeof HEADLINES)[number];
  storyFrame: number;
  fps: number;
  exitProgress: number;
}> = ({ headline, storyFrame, fps, exitProgress }) => {
  // Slide in from right
  const enterSpring = spring({
    frame: storyFrame,
    fps,
    config: { damping: 22, stiffness: 100 },
  });

  const enterX = interpolate(enterSpring, [0, 1], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit upward
  const exitY = interpolate(exitProgress, [0, 1], [0, -90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  const exitOpacity = interpolate(exitProgress, [0.3, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterOpacity = interpolate(storyFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pillEnterY = interpolate(
    spring({ frame: Math.max(0, storyFrame - 4), fps, config: { damping: 20, stiffness: 130 } }),
    [0, 1],
    [12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pillOpacity = interpolate(Math.max(0, storyFrame - 4), [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative line under headline
  const lineWidth = interpolate(
    spring({ frame: Math.max(0, storyFrame - 10), fps, config: { damping: 20, stiffness: 80 } }),
    [0, 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 210,
        right: 80,
        top: "50%",
        transform: `translateX(${enterX}px) translateY(calc(-50% + ${exitY}px))`,
        opacity: enterOpacity * exitOpacity,
      }}
    >
      <CategoryPill
        label={headline.category}
        color={headline.categoryColor}
        opacity={pillOpacity}
        translateY={pillEnterY}
      />

      {/* Headline text — split into two lines via \n */}
      {headline.text.split("\n").map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 44,
            color: TEXT_PRIMARY,
            lineHeight: 1.15,
            letterSpacing: -1,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          {line}
        </div>
      ))}

      {/* Decorative accent line */}
      <div
        style={{
          marginTop: 18,
          height: 3,
          backgroundColor: ACCENT_RED,
          transformOrigin: "left center",
          transform: `scaleX(${lineWidth})`,
          width: 80,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

/** Progress bar at bottom filling across story duration */
const ProgressBar: React.FC<{
  storyFrame: number;
  totalFrames: number;
  storyIndex: number;
}> = ({ storyFrame, totalFrames, storyIndex }) => {
  const progress = interpolate(storyFrame, [0, totalFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barOpacity = interpolate(storyFrame, [0, 6], [0, 1], {
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
        height: 4,
        backgroundColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Segment dots */}
      {HEADLINES.map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: `${(i / HEADLINES.length) * 100}%`,
            width: 2,
            height: 8,
            backgroundColor: "rgba(255,255,255,0.2)",
            transform: "translateY(-2px)",
          }}
        />
      ))}

      {/* Completed segments */}
      {Array.from({ length: storyIndex }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: `${(i / HEADLINES.length) * 100}%`,
            width: `${(1 / HEADLINES.length) * 100}%`,
            height: 4,
            backgroundColor: PROGRESS_BAR_COLOR,
            opacity: 0.45,
          }}
        />
      ))}

      {/* Current segment fill */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: `${(storyIndex / HEADLINES.length) * 100}%`,
          width: `${(progress / HEADLINES.length) * 100}%`,
          height: 4,
          backgroundColor: PROGRESS_BAR_COLOR,
          opacity: barOpacity,
          boxShadow: `0 0 6px ${PROGRESS_BAR_COLOR}`,
        }}
      />
    </div>
  );
};

/** Story count indicator (e.g. "Story 2 of 4") */
const StoryCounter: React.FC<{
  index: number;
  total: number;
  opacity: number;
}> = ({ index, total, opacity }) => (
  <div
    style={{
      position: "absolute",
      bottom: 16,
      right: 28,
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}
  >
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 11,
        color: TEXT_MUTED,
        letterSpacing: 1.5,
        textTransform: "uppercase",
      }}
    >
      Story {index + 1} of {total}
    </span>
  </div>
);

/** A single headline "scene" — manages its own enter/exit lifecycle */
const HeadlineScene: React.FC<{
  headline: (typeof HEADLINES)[number];
  index: number;
  globalFrame: number;
  fps: number;
}> = ({ headline, index, globalFrame, fps }) => {
  const sceneStart = index * STORY_DURATION;
  const sceneEnd = sceneStart + STORY_DURATION;
  const storyFrame = globalFrame - sceneStart;

  // Only render when this scene is active (with a small overlap buffer)
  if (globalFrame < sceneStart - 5 || globalFrame >= sceneEnd + 5) return null;

  // How far into the exit transition (0 = not exiting, 1 = fully exited)
  const exitProgress = interpolate(
    storyFrame,
    [STORY_TRANSITION, STORY_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );

  const counterOpacity = interpolate(storyFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <NumberBadge
        number={headline.number}
        storyFrame={storyFrame}
        fps={fps}
        exitProgress={exitProgress}
      />
      <HeadlineText
        headline={headline}
        storyFrame={storyFrame}
        fps={fps}
        exitProgress={exitProgress}
      />
      <StoryCounter
        index={index}
        total={HEADLINES.length}
        opacity={counterOpacity * (1 - exitProgress)}
      />
      <ProgressBar
        storyFrame={storyFrame}
        totalFrames={STORY_DURATION}
        storyIndex={index}
      />
    </>
  );
};

/** "More stories at NNX.com" end card */
const EndCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - END_CARD_START;
  if (localFrame < 0) return null;

  const fadeIn = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const logoY = interpolate(logoScale, [0, 1], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textDelay = Math.max(0, localFrame - 12);
  const textOpacity = interpolate(textDelay, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlDelay = Math.max(0, localFrame - 22);
  const urlOpacity = interpolate(urlDelay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Radial glow behind logo
  const glowOpacity = interpolate(localFrame, [0, 30], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: BG_SECONDARY,
        opacity: fadeIn,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(232,0,30,${glowOpacity * 0.12}) 0%, transparent 70%)`,
        }}
      />

      {/* Network icon */}
      <div
        style={{
          transform: `scale(${logoScale}) translateY(${logoY}px)`,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            backgroundColor: ACCENT_RED,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${ACCENT_RED}44`,
          }}
        >
          {/* Signal bars icon */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="28" width="8" height="16" rx="2" fill="white" opacity="0.6" />
            <rect x="16" y="18" width="8" height="26" rx="2" fill="white" opacity="0.8" />
            <rect x="28" y="8" width="8" height="36" rx="2" fill="white" />
            <rect x="40" y="2" width="5" height="42" rx="2" fill="white" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Network name */}
      <div
        style={{
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 48,
            color: TEXT_PRIMARY,
            letterSpacing: 4,
          }}
        >
          {NETWORK}
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 15,
            color: TEXT_MUTED,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          {NETWORK_FULL}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 60,
          height: 2,
          backgroundColor: ACCENT_RED,
          borderRadius: 2,
          marginTop: 24,
          marginBottom: 24,
          opacity: textOpacity,
        }}
      />

      {/* URL */}
      <div style={{ opacity: urlOpacity, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: TEXT_MUTED,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          More stories at
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: ACCENT_RED,
            letterSpacing: 1,
          }}
        >
          {NETWORK_URL}
        </div>
      </div>
    </div>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export default function HeadlineReel() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Determine which story is currently active
  const currentStoryIndex = Math.min(
    Math.floor(frame / STORY_DURATION),
    HEADLINES.length - 1
  );

  // Transition overlay between stories
  const transitionStoryFrame = frame % STORY_DURATION;
  const isTransitioning = transitionStoryFrame >= STORY_TRANSITION && frame < END_CARD_START;
  const transitionOpacity = isTransitioning
    ? interpolate(
        transitionStoryFrame,
        [STORY_TRANSITION, STORY_TRANSITION + 8, STORY_DURATION - 8, STORY_DURATION],
        [0, 0.15, 0.15, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: BG_PRIMARY, overflow: "hidden" }}>
      <Background />

      {/* Render all headline scenes (each manages its own visibility) */}
      {HEADLINES.map((headline, i) => (
        <HeadlineScene
          key={i}
          headline={headline}
          index={i}
          globalFrame={frame}
          fps={fps}
        />
      ))}

      {/* Story-transition flash overlay */}
      {transitionOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: ACCENT_RED,
            opacity: transitionOpacity,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top bar always on top */}
      <TopBar frame={frame} />

      {/* End card fades in over everything */}
      <EndCard frame={frame} fps={fps} />
    </AbsoluteFill>
  );
}
