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

// ─── Palette ────────────────────────────────────────────────────────────────
const PALETTE = {
  peach: "#FDDAB5",
  coral: "#F4845F",
  rose: "#E8687A",
  gold: "#D4A843",
  ivory: "#FFF8F0",
  softPink: "#F9C6C9",
  warmWhite: "#FFFAF5",
  deepRose: "#C0435A",
};

// ─── FloatingParticle ────────────────────────────────────────────────────────
interface ParticleProps {
  x: number;
  startY: number;
  size: number;
  delay: number;
  color: string;
  opacity: number;
}

const FloatingParticle: React.FC<ParticleProps> = ({
  x,
  startY,
  size,
  delay,
  color,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = Math.max(0, (frame - delay) / (durationInFrames - delay));
  const y = startY - progress * 320;
  const wobble = Math.sin((frame + delay * 3) * 0.06) * 18;
  const fade = interpolate(progress, [0, 0.1, 0.8, 1], [0, opacity, opacity, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x + wobble,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity: fade,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── HeartIcon ───────────────────────────────────────────────────────────────
const HeartIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const frame = useCurrentFrame();

  const beatCycle = (frame % 30) / 30;
  const beat =
    beatCycle < 0.15
      ? interpolate(beatCycle, [0, 0.08, 0.15], [1, 1.22, 1.08], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(beatCycle, [0.15, 0.28, 1], [1.08, 0.96, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${beat})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 100 90"
        width={size}
        height={size * 0.9}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 85 C50 85 5 55 5 28 C5 14 16 4 28 4 C36 4 44 9 50 17 C56 9 64 4 72 4 C84 4 95 14 95 28 C95 55 50 85 50 85Z"
          fill={color}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        <path
          d="M30 22 C24 26 20 34 22 42"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// ─── LensFlare ───────────────────────────────────────────────────────────────
const LensFlare: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enterProgress = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const pulse = Math.sin(frame * 0.12) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: enterProgress * pulse * 0.55,
      }}
    >
      {/* primary glow — top-right */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,230,180,0.55) 0%, rgba(244,132,95,0.18) 45%, transparent 70%)",
        }}
      />
      {/* secondary scatter — bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -40,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,200,180,0.35) 0%, rgba(232,104,122,0.1) 55%, transparent 75%)",
        }}
      />
      {/* small specular */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          right: "18%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,240,0.9) 0%, rgba(255,220,160,0.3) 50%, transparent 70%)",
        }}
      />
    </div>
  );
};

// ─── StarSparkle ─────────────────────────────────────────────────────────────
const StarSparkle: React.FC<{ x: number; y: number; delay: number; size: number }> = ({
  x,
  y,
  delay,
  size,
}) => {
  const frame = useCurrentFrame();

  const localFrame = frame - delay;
  const opacity = interpolate(localFrame, [0, 8, 18, 32], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(localFrame, [0, 8, 18, 32], [0.2, 1.2, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotate = interpolate(localFrame, [0, 32], [0, 45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: "center",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z"
          fill={PALETTE.gold}
          stroke="rgba(255,240,200,0.7)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
};

// ─── GratitudeText ───────────────────────────────────────────────────────────
const GratitudeText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 1 },
    delay: 8,
  });

  const titleY = interpolate(titleSpring, [0, 1], [80, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  const subtitleOpacity = interpolate(frame, [38, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const subtitleY = interpolate(frame, [38, 60], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const taglineOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* "Thank You" */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: PALETTE.ivory,
            letterSpacing: "-1px",
            lineHeight: 1,
            textShadow: `0 4px 32px rgba(192,67,90,0.35), 0 2px 8px rgba(0,0,0,0.18)`,
            WebkitTextStroke: "1px rgba(255,220,200,0.25)",
          }}
        >
          Thank You
        </div>
      </div>

      {/* Decorative rule */}
      <div
        style={{
          marginTop: 16,
          marginBottom: 20,
          width: interpolate(frame, [30, 55], [0, 320], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${PALETTE.gold}, rgba(255,200,150,0.6), transparent)`,
          borderRadius: 1,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          transform: `translateY(${subtitleY}px)`,
          opacity: subtitleOpacity,
          fontSize: 32,
          fontWeight: 400,
          fontFamily: "Georgia, serif",
          color: "rgba(255,245,235,0.92)",
          letterSpacing: "3px",
          textTransform: "uppercase",
          textShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        From the Stealthis Team
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 14,
          opacity: taglineOpacity,
          fontSize: 18,
          fontWeight: 300,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "rgba(255,235,210,0.75)",
          letterSpacing: "1.5px",
          fontStyle: "italic",
        }}
      >
        With gratitude &amp; appreciation ✦
      </div>
    </div>
  );
};

// ─── HeartSection ────────────────────────────────────────────────────────────
const HeartSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heartSpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.8 },
    delay: 50,
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: `translateX(-50%) scale(${heartSpring})`,
        opacity: heartSpring,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <HeartIcon size={72} color={PALETTE.rose} />
      <div
        style={{
          fontSize: 13,
          fontFamily: "system-ui, sans-serif",
          color: "rgba(255,230,210,0.65)",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        Made with love
      </div>
    </div>
  );
};

// ─── Background ──────────────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const shiftX = Math.sin(frame * 0.018) * 30;
  const shiftY = Math.cos(frame * 0.013) * 20;

  return (
    <AbsoluteFill>
      {/* Base warm gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(145deg, #FDDAB5 0%, #F4845F 45%, #E8687A 80%, #C0435A 100%)`,
        }}
      />
      {/* Animated overlay blob */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at ${50 + shiftX * 0.05}% ${40 + shiftY * 0.04}%, rgba(255,240,210,0.22) 0%, transparent 70%)`,
        }}
      />
      {/* Warm vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(140,40,55,0.38) 100%)",
        }}
      />
      {/* Subtle noise texture via SVG filter workaround — thin semi-transparent overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          background: `repeating-linear-gradient(
            45deg,
            rgba(255,255,255,0.1) 0px,
            rgba(255,255,255,0.1) 1px,
            transparent 1px,
            transparent 8px
          )`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── ParticleField ───────────────────────────────────────────────────────────
const PARTICLES: ParticleProps[] = [
  { x: 120, startY: 680, size: 10, delay: 0, color: "rgba(255,230,200,0.7)", opacity: 0.7 },
  { x: 280, startY: 720, size: 7, delay: 5, color: "rgba(255,255,220,0.6)", opacity: 0.6 },
  { x: 450, startY: 700, size: 13, delay: 2, color: "rgba(255,200,180,0.5)", opacity: 0.5 },
  { x: 680, startY: 740, size: 8, delay: 8, color: "rgba(255,240,200,0.65)", opacity: 0.65 },
  { x: 820, startY: 710, size: 11, delay: 3, color: "rgba(255,220,190,0.55)", opacity: 0.55 },
  { x: 1050, startY: 730, size: 9, delay: 6, color: "rgba(255,245,215,0.7)", opacity: 0.7 },
  { x: 1180, startY: 690, size: 7, delay: 1, color: "rgba(255,210,180,0.6)", opacity: 0.6 },
  { x: 60, startY: 650, size: 6, delay: 10, color: "rgba(255,255,230,0.5)", opacity: 0.5 },
  { x: 960, startY: 760, size: 12, delay: 4, color: "rgba(255,230,200,0.6)", opacity: 0.6 },
  { x: 370, startY: 760, size: 8, delay: 7, color: "rgba(255,240,210,0.55)", opacity: 0.55 },
  { x: 740, startY: 780, size: 10, delay: 9, color: "rgba(255,220,200,0.65)", opacity: 0.65 },
  { x: 1120, startY: 750, size: 6, delay: 12, color: "rgba(255,245,225,0.5)", opacity: 0.5 },
];

const SPARKLES = [
  { x: 95, y: 95, delay: 20, size: 20 },
  { x: 1145, y: 80, delay: 35, size: 16 },
  { x: 1210, y: 320, delay: 55, size: 14 },
  { x: 65, y: 560, delay: 45, size: 18 },
  { x: 580, y: 40, delay: 28, size: 15 },
  { x: 1080, y: 610, delay: 62, size: 13 },
  { x: 210, y: 160, delay: 40, size: 12 },
  { x: 1020, y: 155, delay: 30, size: 17 },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export const RemotionThankYou: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: "system-ui, sans-serif" }}>
      <Background />

      {/* Floating particles */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {PARTICLES.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </AbsoluteFill>

      {/* Star sparkles */}
      <AbsoluteFill>
        {SPARKLES.map((s, i) => (
          <StarSparkle key={i} {...s} />
        ))}
      </AbsoluteFill>

      {/* Lens flare — enters late */}
      <LensFlare />

      {/* Central text block */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 60,
        }}
      >
        <GratitudeText />
      </AbsoluteFill>

      {/* Heart at bottom */}
      <HeartSection />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-thank-you"
    component={RemotionThankYou}
    durationInFrames={120}
    fps={30}
    width={1280}
    height={720}
  />
);
