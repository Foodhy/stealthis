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

// ── Config constants (easy to customise) ─────────────────────────────────────
const APP_NAME = "Habito";
const APP_SUBTITLE = "Daily Habit Tracker";
const APP_TAGLINE = "Build habits that last";
const ACCENT_COLOR = "#7c3aed"; // purple
const ACCENT_LIGHT = "#a78bfa";
const BG_COLOR = "#0a0a0f";
const DOWNLOAD_TARGET = 500_000;
const STAR_COUNT = 5;
const RATING_TEXT = "4.9 · 38k Reviews";

const SCREEN_PANELS = [
  {
    label: "Today",
    bg: "#1e1133",
    accent: "#7c3aed",
    lines: ["Morning Meditation", "Read 20 pages", "10k Steps", "No Sugar"],
    checks: [true, true, false, false],
  },
  {
    label: "Streaks",
    bg: "#0f1a2e",
    accent: "#2563eb",
    lines: ["Meditation  🔥 42", "Reading  🔥 28", "Running  🔥 14"],
    checks: [true, true, true],
  },
  {
    label: "Progress",
    bg: "#0f2318",
    accent: "#16a34a",
    lines: ["Weekly  87%", "Monthly  74%", "All-time  81%"],
    checks: [false, false, false],
  },
];

// Phone dimensions
const PHONE_WIDTH = 280;
const PHONE_HEIGHT = 500;
const PHONE_RADIUS = 36;
const SCREEN_INSET = 14;

// ── Background glow ───────────────────────────────────────────────────────────
const BackgroundGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const scale = interpolate(frame, [0, 60], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <>
      {/* Main glow */}
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: "50%",
          transform: `translateX(-50%) scale(${scale})`,
          width: 780,
          height: 780,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT_COLOR}55 0%, ${ACCENT_COLOR}18 40%, transparent 70%)`,
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* Secondary top-right accent */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT_LIGHT}22 0%, transparent 65%)`,
          opacity: opacity * 0.6,
          pointerEvents: "none",
        }}
      />
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${ACCENT_COLOR}08 1px, transparent 1px), linear-gradient(90deg, ${ACCENT_COLOR}08 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: interpolate(frame, [0, 30], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ── Screenshot carousel (inside phone) ───────────────────────────────────────
const ScreenCarousel: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const panelDuration = 20; // frames each panel holds
  const transitionDuration = 10;
  const totalCycle = panelDuration + transitionDuration;

  const rawIndex = Math.floor(frame / totalCycle) % SCREEN_PANELS.length;
  const withinCycle = frame % totalCycle;

  const slideOut = withinCycle >= panelDuration;
  const exitProgress = slideOut
    ? interpolate(
        withinCycle,
        [panelDuration, panelDuration + transitionDuration],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }
      )
    : 0;

  const currentPanel = SCREEN_PANELS[rawIndex];
  const nextPanel = SCREEN_PANELS[(rawIndex + 1) % SCREEN_PANELS.length];

  const screenW = PHONE_WIDTH - SCREEN_INSET * 2;
  const screenH = PHONE_HEIGHT - SCREEN_INSET * 2 - 30; // subtract notch

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: PHONE_RADIUS - SCREEN_INSET,
      }}
    >
      {/* Current panel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(160deg, ${currentPanel.bg} 0%, #0a0a14 100%)`,
          transform: `translateX(${-exitProgress * 100}%)`,
        }}
      >
        <PanelContent panel={currentPanel} visible screenW={screenW} screenH={screenH} />
      </div>
      {/* Next panel sliding in */}
      {slideOut && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${nextPanel.bg} 0%, #0a0a14 100%)`,
            transform: `translateX(${(1 - exitProgress) * 100}%)`,
          }}
        >
          <PanelContent panel={nextPanel} visible screenW={screenW} screenH={screenH} />
        </div>
      )}
    </div>
  );
};

const PanelContent: React.FC<{
  panel: (typeof SCREEN_PANELS)[number];
  visible: boolean;
  screenW: number;
  screenH: number;
}> = ({ panel, visible, screenW }) => {
  return (
    <div
      style={{
        padding: "20px 16px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: panel.accent,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {panel.label}
      </div>

      {/* Habit rows */}
      {panel.lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            padding: "8px 10px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            borderLeft: panel.checks[i] ? `3px solid ${panel.accent}` : "3px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Checkbox */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: panel.checks[i] ? panel.accent : "transparent",
              border: panel.checks[i] ? "none" : "2px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {panel.checks[i] && (
              <div
                style={{
                  width: 10,
                  height: 6,
                  borderLeft: "2px solid #fff",
                  borderBottom: "2px solid #fff",
                  transform: "rotate(-45deg) translateY(-1px)",
                }}
              />
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: panel.checks[i] ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)",
              textDecoration: panel.checks[i] ? "line-through" : "none",
              flex: 1,
            }}
          >
            {line}
          </div>
        </div>
      ))}

      {/* Progress bar for last panel */}
      {panel.label === "Progress" && (
        <div
          style={{
            marginTop: 10,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "81%",
              height: "100%",
              background: panel.accent,
              borderRadius: 3,
            }}
          />
        </div>
      )}
    </div>
  );
};

// ── Phone mockup ──────────────────────────────────────────────────────────────
const PhoneMockup: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const translateY = spring({
    frame,
    fps,
    from: 360,
    to: 0,
    config: { damping: 20, stiffness: 100 },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle floating bob after entrance
  const bobY = interpolate(
    frame,
    [0, 60, 120, 180],
    [0, 0, -6, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    }
  );

  const finalY = frame < 30 ? translateY : bobY;

  return (
    <div
      style={{
        position: "absolute",
        right: 180,
        top: "50%",
        transform: `translateY(calc(-50% + ${finalY}px))`,
        opacity,
      }}
    >
      {/* Outer phone shell */}
      <div
        style={{
          width: PHONE_WIDTH,
          height: PHONE_HEIGHT,
          borderRadius: PHONE_RADIUS,
          background: "linear-gradient(145deg, #2d2d3d 0%, #1a1a26 50%, #111118 100%)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 60px ${ACCENT_COLOR}40`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Side button (right) */}
        <div
          style={{
            position: "absolute",
            right: -3,
            top: 80,
            width: 3,
            height: 50,
            background: "rgba(255,255,255,0.15)",
            borderRadius: "0 3px 3px 0",
          }}
        />
        {/* Volume buttons (left) */}
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 70,
            width: 3,
            height: 26,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "3px 0 0 3px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 104,
            width: 3,
            height: 26,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "3px 0 0 3px",
          }}
        />

        {/* Screen area */}
        <div
          style={{
            position: "absolute",
            top: SCREEN_INSET,
            left: SCREEN_INSET,
            right: SCREEN_INSET,
            bottom: SCREEN_INSET,
            borderRadius: PHONE_RADIUS - SCREEN_INSET,
            background: "#0d0d1a",
            overflow: "hidden",
          }}
        >
          {/* Dynamic island / notch */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 80,
              height: 22,
              background: "#000",
              borderRadius: 12,
              zIndex: 10,
            }}
          />

          {/* App icon row at top */}
          <div
            style={{
              position: "absolute",
              top: 38,
              left: 14,
              right: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 5,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #4f46e5 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2.5px solid rgba(255,255,255,0.9)",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  lineHeight: 1.1,
                }}
              >
                {APP_NAME}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                Habit Tracker
              </div>
            </div>
          </div>

          {/* Carousel content */}
          <div
            style={{
              position: "absolute",
              top: 78,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <ScreenCarousel frame={frame} fps={fps} />
          </div>
        </div>

        {/* Phone bottom bar reflection */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: PHONE_RADIUS,
            background: "linear-gradient(to top, rgba(255,255,255,0.04), transparent)",
            borderRadius: `0 0 ${PHONE_RADIUS}px ${PHONE_RADIUS}px`,
          }}
        />
      </div>

      {/* Phone shadow on floor */}
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: "50%",
          transform: "translateX(-50%)",
          width: PHONE_WIDTH * 0.8,
          height: 20,
          background: `radial-gradient(ellipse, ${ACCENT_COLOR}40 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
};

// ── App name + tagline ────────────────────────────────────────────────────────
const AppTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delayed = Math.max(0, frame - 25);

  const opacity = interpolate(delayed, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = spring({
    frame: delayed,
    fps,
    from: 20,
    to: 0,
    config: { damping: 16, stiffness: 90 },
  });

  // App icon glow pulse
  const glowOpacity = interpolate(
    frame,
    [30, 60, 90, 120, 150],
    [0.4, 0.9, 0.5, 0.85, 0.4],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: "50%",
        transform: `translateY(calc(-50% + ${translateY}px))`,
        opacity,
        width: 460,
      }}
    >
      {/* App icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #4f46e5 100%)`,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 40px ${ACCENT_COLOR}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}`,
          position: "relative",
        }}
      >
        {/* Icon detail: circular habit ring */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.9)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>

      {/* App name */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 64,
          color: "#ffffff",
          letterSpacing: -2.5,
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {APP_NAME}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 20,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 0.5,
          marginBottom: 20,
        }}
      >
        {APP_SUBTITLE}
      </div>

      {/* Tagline pill */}
      <div
        style={{
          display: "inline-block",
          background: `${ACCENT_COLOR}22`,
          border: `1px solid ${ACCENT_COLOR}55`,
          borderRadius: 100,
          padding: "6px 16px",
          marginBottom: 28,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 13,
            color: ACCENT_LIGHT,
            fontWeight: 500,
            letterSpacing: 0.3,
          }}
        >
          {APP_TAGLINE}
        </span>
      </div>
    </div>
  );
};

// ── Star rating ───────────────────────────────────────────────────────────────
const StarRating: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const containerDelay = 35;
  const delayedFrame = Math.max(0, frame - containerDelay);

  const containerOpacity = interpolate(delayedFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: "calc(50% + 118px)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        opacity: containerOpacity,
      }}
    >
      {/* Stars row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {Array.from({ length: STAR_COUNT }).map((_, i) => {
          const starDelay = containerDelay + i * 6;
          const starFrame = Math.max(0, frame - starDelay);
          const starScale = spring({
            frame: starFrame,
            fps,
            from: 0,
            to: 1,
            config: { damping: 12, stiffness: 200 },
          });
          const starOpacity = interpolate(starFrame, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                transform: `scale(${starScale})`,
                opacity: starOpacity,
                fontSize: 24,
                lineHeight: 1,
                color: "#f59e0b",
                textShadow: "0 0 12px #f59e0b88",
              }}
            >
              ★
            </div>
          );
        })}
      </div>
      {/* Rating text */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          marginTop: 2,
        }}
      >
        {RATING_TEXT}
      </div>
    </div>
  );
};

// ── Download counter ──────────────────────────────────────────────────────────
const DownloadCounter: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const START_FRAME = 75;
  const END_FRAME = 125;

  const containerOpacity = interpolate(frame, [START_FRAME, START_FRAME + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = spring({
    frame: Math.max(0, frame - START_FRAME),
    fps,
    from: 14,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });

  // Ease the counter from 0 to DOWNLOAD_TARGET
  const rawProgress = interpolate(frame, [START_FRAME, END_FRAME], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const count = Math.round(rawProgress * DOWNLOAD_TARGET);

  const formattedCount =
    count >= 1_000
      ? `${(count / 1_000).toFixed(count >= 10_000 ? 0 : 1)}k`
      : count.toString();

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: "calc(50% + 175px)",
        opacity: containerOpacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${ACCENT_COLOR}22`,
          border: `1px solid ${ACCENT_COLOR}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Download arrow */}
        <div style={{ position: "relative", width: 14, height: 14 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 2,
              height: 8,
              background: ACCENT_LIGHT,
              borderRadius: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg) translateY(-2px)",
              width: 6,
              height: 6,
              borderRight: `2px solid ${ACCENT_LIGHT}`,
              borderBottom: `2px solid ${ACCENT_LIGHT}`,
            }}
          />
        </div>
      </div>

      {/* Count */}
      <div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: "#fff",
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {formattedCount}+
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 0.5,
            marginTop: 2,
          }}
        >
          Downloads
        </div>
      </div>
    </div>
  );
};

// ── Store badges ──────────────────────────────────────────────────────────────
const StoreBadge: React.FC<{
  frame: number;
  fps: number;
  delay: number;
  label: string;
  sublabel: string;
  icon: "apple" | "play";
}> = ({ frame, fps, delay, label, sublabel, icon }) => {
  const delayedFrame = Math.max(0, frame - delay);

  const opacity = interpolate(delayedFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = spring({
    frame: delayedFrame,
    fps,
    from: 20,
    to: 0,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        width: 180,
        cursor: "pointer",
      }}
    >
      {/* Icon */}
      <div style={{ width: 26, height: 26, flexShrink: 0 }}>
        {icon === "apple" ? (
          // Apple logo approximation
          <div style={{ position: "relative", width: 22, height: 26 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                position: "absolute",
                bottom: 0,
                left: 2,
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                position: "absolute",
                top: 0,
                right: 0,
              }}
            />
          </div>
        ) : (
          // Play Store triangle
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderLeft: "22px solid rgba(255,255,255,0.85)",
              marginTop: 1,
            }}
          />
        )}
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 9,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {sublabel}
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            letterSpacing: -0.3,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

const StoreBadges: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        bottom: 100,
        display: "flex",
        gap: 14,
      }}
    >
      <StoreBadge
        frame={frame}
        fps={fps}
        delay={105}
        label="App Store"
        sublabel="Download on the"
        icon="apple"
      />
      <StoreBadge
        frame={frame}
        fps={fps}
        delay={118}
        label="Google Play"
        sublabel="Get it on"
        icon="play"
      />
    </div>
  );
};

// ── Decorative particles ──────────────────────────────────────────────────────
const Particles: React.FC<{ frame: number }> = ({ frame }) => {
  const particleData = [
    { x: 80, y: 180, size: 3, speed: 0.4, delay: 10 },
    { x: 200, y: 80, size: 2, speed: 0.6, delay: 5 },
    { x: 950, y: 120, size: 4, speed: 0.3, delay: 20 },
    { x: 1100, y: 280, size: 2, speed: 0.5, delay: 8 },
    { x: 1180, y: 500, size: 3, speed: 0.45, delay: 15 },
    { x: 60, y: 500, size: 2, speed: 0.55, delay: 12 },
    { x: 340, y: 620, size: 3, speed: 0.35, delay: 18 },
  ];

  return (
    <>
      {particleData.map((p, i) => {
        const t = Math.max(0, frame - p.delay);
        const opacity = interpolate(
          t,
          [0, 20, 60, 160, 180],
          [0, 0.6, 0.3, 0.4, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.sin),
          }
        );
        const drift = Math.sin((frame + i * 40) * p.speed * 0.05) * 6;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y + drift,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: ACCENT_LIGHT,
              opacity,
              boxShadow: `0 0 ${p.size * 3}px ${ACCENT_LIGHT}`,
            }}
          />
        );
      })}
    </>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const AppStorePromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Global fade-out in the last 20 frames
  const globalOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        opacity: globalOpacity,
        overflow: "hidden",
      }}
    >
      {/* Layer 1: Background */}
      <BackgroundGlow frame={frame} />
      <Particles frame={frame} />

      {/* Layer 2: Phone mockup (right side) */}
      <PhoneMockup frame={frame} fps={fps} />

      {/* Layer 3: Text content (left side) */}
      <AppTitle frame={frame} fps={fps} />

      <Sequence from={35}>
        <StarRating frame={frame} fps={fps} />
      </Sequence>

      <Sequence from={75}>
        <DownloadCounter frame={frame} fps={fps} />
      </Sequence>

      <Sequence from={105}>
        <StoreBadges frame={frame} fps={fps} />
      </Sequence>

      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="AppStorePromo"
    component={AppStorePromo}
    durationInFrames={180}
    fps={30}
    width={1280}
    height={720}
  />
);
