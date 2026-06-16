import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#0a0a12";
const INDIGO = "#6366f1";
const INDIGO_LIGHT = "#a5b4fc";
const INDIGO_MUTED = "rgba(99,102,241,0.18)";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.42)";
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

// ─── Fictional lesson data ──────────────────────────────────────────────────────
const LESSON_BADGE = "Lesson 04";
const COURSE_NAME = "Modern CSS Mastery";
const LESSON_TITLE = "CSS Grid Layout\nDeep Dive";

// ─── DotGrid — subtle animated background ──────────────────────────────────────
const DotGrid: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Generate a grid of dot positions
  const cols = 26;
  const rows = 15;
  const cellW = 1280 / cols;
  const cellH = 720 / rows;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const key = `${row}-${col}`;
          // Stagger each dot's fade-in slightly based on distance from center
          const cx = cols / 2;
          const cy = rows / 2;
          const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
          const dotOpacity = interpolate(
            frame,
            [dist * 0.6, dist * 0.6 + 20],
            [0, 0.28],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: col * cellW + cellW / 2 - 1.5,
                top: row * cellH + cellH / 2 - 1.5,
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: "rgba(163,163,163,0.5)",
                opacity: dotOpacity,
              }}
            />
          );
        })
      )}
    </div>
  );
};

// ─── RadialGlow — indigo ambient glow bottom-left ──────────────────────────────
const RadialGlow: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: -180,
        bottom: -180,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.06) 50%, transparent 75%)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── LessonBadge — pill with lesson number, springs in from left ───────────────
const LessonBadge: React.FC<{ badge: string }> = ({ badge }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const x = spring({
    frame,
    fps,
    from: -60,
    to: 0,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transform: `translateX(${x}px)`,
        opacity,
      }}
    >
      {/* Dot accent */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: INDIGO_LIGHT,
          flexShrink: 0,
        }}
      />
      {/* Pill */}
      <div
        style={{
          backgroundColor: INDIGO,
          borderRadius: 999,
          padding: "7px 18px",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 15,
          color: WHITE,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          boxShadow: `0 0 24px rgba(99,102,241,0.5)`,
        }}
      >
        {badge}
      </div>
    </div>
  );
};

// ─── CourseName — muted subtitle fades in ─────────────────────────────────────
const CourseName: React.FC<{ name: string }> = ({ name }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [18, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const y = interpolate(frame, [18, 40], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 18,
        color: MUTED,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {name}
    </div>
  );
};

// ─── LessonTitle — large 72px bold clip-reveal ────────────────────────────────
const LessonTitle: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = title.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {lines.map((line, i) => {
        const delay = 30 + i * 14;

        const clipProgress = interpolate(frame, [delay, delay + 28], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

        const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const y = spring({
          frame: Math.max(0, frame - delay),
          fps,
          from: 24,
          to: 0,
          config: { damping: 22, stiffness: 130, mass: 0.9 },
        });

        return (
          <div
            key={i}
            style={{
              overflow: "hidden",
              // Clip-path reveal: unmask left-to-right
              clipPath: `inset(0 ${(1 - clipProgress) * 100}% 0 0)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 72,
                color: WHITE,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── AccentLine — indigo 4px line draws left-to-right ─────────────────────────
const AccentLine: React.FC = () => {
  const frame = useCurrentFrame();

  const scaleX = interpolate(frame, [65, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [65, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 420,
        height: 4,
        borderRadius: 2,
        backgroundColor: INDIGO,
        transformOrigin: "left center",
        transform: `scaleX(${scaleX})`,
        opacity,
        boxShadow: `0 0 16px rgba(99,102,241,0.6)`,
        marginTop: 4,
      }}
    />
  );
};

// ─── MetaRow — duration / topic tags ─────────────────────────────────────────
const MetaRow: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [95, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const y = interpolate(frame, [95, 120], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tags = ["18 min", "Grid Tracks", "Auto-placement", "Subgrid"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {tags.map((tag, i) => (
        <React.Fragment key={tag}>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: i === 0 ? 600 : 400,
              fontSize: 14,
              color: i === 0 ? INDIGO_LIGHT : "rgba(255,255,255,0.38)",
              letterSpacing: "0.03em",
            }}
          >
            {tag}
          </span>
          {i < tags.length - 1 && (
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── ProgressBar — thin bar at very bottom, fills in slowly ──────────────────
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const progress = interpolate(frame, [100, durationInFrames - 10], [0, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.06)",
        opacity,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          backgroundColor: INDIGO,
          boxShadow: `0 0 12px rgba(99,102,241,0.7)`,
        }}
      />
    </div>
  );
};

// ─── Watermark ────────────────────────────────────────────────────────────────
const Watermark: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [110, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 56,
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity,
      }}
    >
      {/* Small logo mark */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: INDIGO_MUTED,
          border: `1.5px solid rgba(99,102,241,0.35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 2,
            backgroundColor: INDIGO_LIGHT,
            opacity: 0.9,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 13,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
        }}
      >
        CSS Mastery
      </span>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const LessonIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {/* Background layer */}
      <DotGrid />
      <RadialGlow />

      {/* Content — vertically centred, left-aligned with left margin */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          maxWidth: 820,
        }}
      >
        {/* Course name (muted, above badge) */}
        <CourseName name={COURSE_NAME} />

        {/* Lesson badge */}
        <LessonBadge badge={LESSON_BADGE} />

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <LessonTitle title={LESSON_TITLE} />
          <AccentLine />
        </div>

        {/* Meta tags row */}
        <MetaRow />
      </div>

      {/* Decorative elements */}
      <Watermark />
      <ProgressBar />
    </AbsoluteFill>
  );
};

// ─── RemotionRoot ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="LessonIntro"
    component={LessonIntro}
    durationInFrames={150}
    fps={30}
    width={1280}
    height={720}
  />
);
