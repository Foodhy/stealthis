import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from "remotion";

// ── Config ─────────────────────────────────────────────────────────────────────
const DURATION = 150; // 5 s × 30 fps
const FPS = 30;
const W = 1080;
const H = 1920;

const USERNAME = "@alex.adventures";
const CTA = "Follow for more content";

// Clip data – each panel represents a moment in the highlight reel
const CLIPS: { color: string; accent: string; location: string; caption: string }[] = [
  {
    color: "#FF3D5A",
    accent: "#FFD700",
    location: "📍 Santorini, Greece",
    caption: "Golden hour magic",
  },
  {
    color: "#00C9B1",
    accent: "#FFFFFF",
    location: "📍 Tokyo, Japan",
    caption: "Neon nights & ramen",
  },
  {
    color: "#A855F7",
    accent: "#F0ABFC",
    location: "📍 Patagonia, Argentina",
    caption: "Edge of the world",
  },
  {
    color: "#F97316",
    accent: "#FEF3C7",
    location: "📍 Marrakech, Morocco",
    caption: "Spice & color",
  },
];

// Glitch palette – R, G, B channel offset divs
const GLITCH_COLORS = ["#FF003C", "#00FFF0", "#FFFFFF"];

// ── Utility ───────────────────────────────────────────────────────────────────
const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

const seededRand = (seed: number): number => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = interpolate(frame, [0, DURATION], [0, 1], {
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
        height: 6,
        backgroundColor: "rgba(255,255,255,0.2)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: "linear-gradient(90deg, #FF3D5A, #FFD700, #00C9B1, #A855F7)",
          transition: "width 0s",
          boxShadow: "0 0 8px rgba(255,61,90,0.6)",
        }}
      />
    </div>
  );
};

// ── Glitch Title ──────────────────────────────────────────────────────────────
const GlitchTitle: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const scaleY = interpolate(titleSpring, [0, 1], [0.3, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glitch intensity oscillates over time, peaks at certain frames
  const glitchIntensity = interpolate(
    (frame % 8) / 8,
    [0, 0.5, 1],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const offsets = [
    { x: -4 * glitchIntensity, color: GLITCH_COLORS[0], opacity: 0.7 },
    { x: 4 * glitchIntensity, color: GLITCH_COLORS[1], opacity: 0.7 },
    { x: 0, color: GLITCH_COLORS[2], opacity: 1 },
  ];

  const textStyle: React.CSSProperties = {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: 148,
    fontWeight: 900,
    letterSpacing: 12,
    textTransform: "uppercase" as const,
    lineHeight: 1,
    userSelect: "none",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scaleY(${scaleY})`,
      }}
    >
      {/* Stacked glitch layers */}
      <div style={{ position: "relative", display: "inline-block" }}>
        {offsets.map((off, i) => (
          <div
            key={i}
            style={{
              ...textStyle,
              position: i === 0 ? "relative" : "absolute",
              top: i === 0 ? undefined : 0,
              left: i === 0 ? undefined : 0,
              right: i === 0 ? undefined : 0,
              color: off.color,
              opacity: off.opacity,
              transform: `translateX(${off.x}px)`,
              mixBlendMode: i === 2 ? "normal" : ("screen" as React.CSSProperties["mixBlendMode"]),
            }}
          >
            HIGHLIGHTS
          </div>
        ))}
      </div>
      {/* Subtitle */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 38,
          fontWeight: 300,
          letterSpacing: 18,
          textTransform: "uppercase" as const,
          color: "rgba(255,255,255,0.55)",
          marginTop: 18,
          opacity: interpolate(frame, [8, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        2024 RECAP
      </div>
    </div>
  );
};

// ── Noise Overlay (film grain) ────────────────────────────────────────────────
const FilmGrain: React.FC<{ frame: number }> = ({ frame }) => {
  // We simulate grain with a radial/linear gradient that shifts per frame
  const shift = seededRand(frame * 7.3) * 100;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: `${200 + shift}px`,
        zIndex: 200,
      }}
    />
  );
};

// ── Clip Panel ────────────────────────────────────────────────────────────────
const ClipPanel: React.FC<{
  frame: number;
  fps: number;
  color: string;
  accent: string;
  location: string;
  caption: string;
  clipIndex: number;
  totalFrames: number;
}> = ({ frame, fps, color, accent, location, caption, clipIndex, totalFrames }) => {
  // Slide in from right with spring
  const slideSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.8 },
  });
  const translateX = interpolate(slideSpring, [0, 1], [W * 0.6, 0]);

  // Scale punch on entry
  const scale = interpolate(frame, [0, 8], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Text overlay fades in after panel arrives
  const textOpacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textSlide = interpolate(frame, [6, 20], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Flash on entry
  const flashOpacity = interpolate(frame, [0, 3], [0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Visual pattern tiles for the panel background
  const dots: { x: number; y: number; size: number; alpha: number }[] = [];
  for (let i = 0; i < 30; i++) {
    dots.push({
      x: seededRand(clipIndex * 100 + i * 3) * 100,
      y: seededRand(clipIndex * 100 + i * 3 + 1) * 100,
      size: 4 + seededRand(clipIndex * 100 + i * 3 + 2) * 14,
      alpha: 0.08 + seededRand(clipIndex * 100 + i * 3 + 3) * 0.15,
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${translateX}px) scale(${scale})`,
        backgroundColor: color,
        overflow: "hidden",
      }}
    >
      {/* Background texture dots */}
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            backgroundColor: accent,
            opacity: d.alpha,
          }}
        />
      ))}

      {/* Diagonal stripe pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 60px,
            rgba(255,255,255,0.03) 60px,
            rgba(255,255,255,0.03) 62px
          )`,
        }}
      />

      {/* Large clip number watermark */}
      <div
        style={{
          position: "absolute",
          right: -20,
          bottom: -40,
          fontSize: 400,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          color: "rgba(0,0,0,0.12)",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {clipIndex + 1}
      </div>

      {/* Cut flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ffffff",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Bottom gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55%",
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      />

      {/* Text content */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          paddingLeft: 56,
          paddingRight: 56,
          opacity: textOpacity,
          transform: `translateY(${textSlide}px)`,
        }}
      >
        {/* Location tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            borderRadius: 100,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 8,
            paddingBottom: 8,
            marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 28,
              color: "#ffffff",
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            {location}
          </span>
        </div>

        {/* Caption */}
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 68,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: -1,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {caption}
        </div>
      </div>

      {/* Clip counter top-right */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 24,
          fontWeight: 700,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: 2,
          opacity: textOpacity,
        }}
      >
        {clipIndex + 1}/{CLIPS.length}
      </div>
    </div>
  );
};

// ── Clip Wrapper (gives each Sequence its own useCurrentFrame hook) ───────────
const ClipWrapper: React.FC<{ clipIndex: number; fps: number }> = ({ clipIndex, fps }) => {
  const frame = useCurrentFrame();
  const clip = CLIPS[clipIndex];
  return (
    <ClipPanel
      frame={frame}
      fps={fps}
      color={clip.color}
      accent={clip.accent}
      location={clip.location}
      caption={clip.caption}
      clipIndex={clipIndex}
      totalFrames={30}
    />
  );
};

// ── Ending Card Wrapper ───────────────────────────────────────────────────────
const EndingCardWrapper: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  return <EndingCard frame={frame} fps={fps} />;
};

// ── Ending Card ───────────────────────────────────────────────────────────────
const EndingCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const bgSpring = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const bgScale = interpolate(bgSpring, [0, 1], [1.08, 1]);

  const avatarSpring = spring({
    frame: clamp(frame - 4, 0, 999),
    fps,
    config: { damping: 12, stiffness: 160 },
  });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0, 1]);

  const usernameOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const usernameSlide = interpolate(frame, [10, 22], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const ctaSpring = spring({
    frame: clamp(frame - 18, 0, 999),
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  // Confetti particles
  const confetti: {
    x: number;
    startY: number;
    color: string;
    size: number;
    delay: number;
    drift: number;
    rot: number;
  }[] = [];
  const confettiColors = ["#FF3D5A", "#FFD700", "#00C9B1", "#A855F7", "#F97316", "#FFFFFF"];
  for (let i = 0; i < 28; i++) {
    confetti.push({
      x: seededRand(i * 13) * 100,
      startY: -8 - seededRand(i * 13 + 1) * 12,
      color: confettiColors[i % confettiColors.length],
      size: 12 + seededRand(i * 13 + 2) * 16,
      delay: seededRand(i * 13 + 3) * 10,
      drift: (seededRand(i * 13 + 4) - 0.5) * 60,
      rot: seededRand(i * 13 + 5) * 360,
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        transform: `scale(${bgScale})`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Stars background */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${seededRand(i * 7 + 99) * 100}%`,
            top: `${seededRand(i * 7 + 100) * 100}%`,
            width: 2 + seededRand(i * 7 + 101) * 3,
            height: 2 + seededRand(i * 7 + 101) * 3,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            opacity: 0.1 + seededRand(i * 7 + 102) * 0.4,
          }}
        />
      ))}

      {/* Confetti */}
      {confetti.map((c, i) => {
        const maxFrames = 35;
        const localFrame = clamp(frame - c.delay, 0, maxFrames);
        const progress = interpolate(localFrame, [0, maxFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.quad),
        });
        const yPos = c.startY + progress * 115;
        const xDrift = c.drift * progress;
        const rot = c.rot + progress * 720;
        const confettiOpacity = interpolate(progress, [0, 0.7, 1], [1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${c.x}%`,
              top: `${yPos}%`,
              transform: `translateX(${xDrift}px) rotate(${rot}deg)`,
              width: c.size,
              height: c.size * 0.6,
              backgroundColor: c.color,
              borderRadius: 2,
              opacity: confettiOpacity,
            }}
          />
        );
      })}

      {/* Glow ring behind avatar */}
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0) 70%)",
          transform: `scale(${avatarScale * 1.4})`,
        }}
      />

      {/* Avatar */}
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF3D5A 0%, #A855F7 50%, #00C9B1 100%)",
          border: "5px solid rgba(255,255,255,0.9)",
          transform: `scale(${avatarScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 72,
          boxShadow: "0 0 60px rgba(168,85,247,0.6), 0 20px 40px rgba(0,0,0,0.5)",
          marginBottom: 36,
        }}
      >
        <span style={{ userSelect: "none" }}>✦</span>
      </div>

      {/* Username */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 58,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: -1,
          opacity: usernameOpacity,
          transform: `translateY(${usernameSlide}px)`,
          marginBottom: 14,
          textShadow: "0 2px 20px rgba(168,85,247,0.5)",
        }}
      >
        {USERNAME}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 80,
          height: 3,
          background: "linear-gradient(90deg, #FF3D5A, #A855F7)",
          borderRadius: 2,
          opacity: usernameOpacity,
          marginBottom: 36,
        }}
      />

      {/* CTA Button */}
      <div
        style={{
          background: "linear-gradient(90deg, #FF3D5A, #A855F7)",
          borderRadius: 100,
          paddingLeft: 60,
          paddingRight: 60,
          paddingTop: 26,
          paddingBottom: 26,
          transform: `scale(${ctaScale})`,
          opacity: ctaOpacity,
          boxShadow: "0 8px 32px rgba(168,85,247,0.45)",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 36,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: 1,
            textTransform: "uppercase" as const,
          }}
        >
          {CTA}
        </span>
      </div>
    </div>
  );
};

// ── Opening Background ────────────────────────────────────────────────────────
const OpeningBackground: React.FC<{ frame: number }> = ({ frame }) => {
  // Pulsing radial glow
  const pulse = interpolate(Math.sin((frame / FPS) * Math.PI * 2), [-1, 1], [0.8, 1.2]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Center radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          transform: `translate(-50%, -50%) scale(${pulse})`,
          background:
            "radial-gradient(circle, rgba(255,61,90,0.18) 0%, rgba(168,85,247,0.1) 40%, transparent 70%)",
        }}
      />
      {/* Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const RemotionRecapReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing layout:
  // 0-28   : Opening title (glitch "HIGHLIGHTS")
  // 28-58  : Clip 1
  // 58-88  : Clip 2
  // 88-115 : Clip 3
  // 115-135: Clip 4
  // 128-150: Ending card

  const clipTimings = [
    { from: 28, duration: 30 },
    { from: 58, duration: 30 },
    { from: 88, duration: 27 },
    { from: 115, duration: 22 },
  ];

  // Fade out title before first clip
  const titleOpacity = interpolate(frame, [22, 28], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* ── Opening title section ── */}
      <Sequence from={0} durationInFrames={30}>
        <div style={{ position: "absolute", inset: 0, opacity: titleOpacity }}>
          <OpeningBackground frame={frame} />
          <GlitchTitle frame={frame} fps={fps} />
        </div>
      </Sequence>

      {/* ── Clip panels ── */}
      <Sequence from={clipTimings[0].from} durationInFrames={clipTimings[0].duration}>
        <ClipWrapper clipIndex={0} fps={fps} />
      </Sequence>
      <Sequence from={clipTimings[1].from} durationInFrames={clipTimings[1].duration}>
        <ClipWrapper clipIndex={1} fps={fps} />
      </Sequence>
      <Sequence from={clipTimings[2].from} durationInFrames={clipTimings[2].duration}>
        <ClipWrapper clipIndex={2} fps={fps} />
      </Sequence>
      <Sequence from={clipTimings[3].from} durationInFrames={clipTimings[3].duration}>
        <ClipWrapper clipIndex={3} fps={fps} />
      </Sequence>

      {/* ── Ending card ── */}
      <Sequence from={128} durationInFrames={22}>
        <EndingCardWrapper fps={fps} />
      </Sequence>

      {/* ── Film grain overlay ── */}
      <FilmGrain frame={frame} />

      {/* ── Progress bar (always on top) ── */}
      <ProgressBar frame={frame} />
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionRecapReel"
    component={RemotionRecapReel}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
