import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const CONFIG = {
  bg: "#000000",
  heroText: "WAIT FOR IT",
  subText: "Part 1 of 3",
  heroFontSize: 196,
  subFontSize: 56,
  heroColor: "#ffffff",
  subColor: "#cccccc",
  burstColor: "#ff3d00",
  glitchColors: ["#00e5ff", "#e040fb", "#ffea00"],
  glitchHeight: 8,
  flashFrames: 5,
  burstStartFrame: 10,
  glitchFrame: 15,
  subFadeFrame: 40,
};

// ─── WHITE FLASH ────────────────────────────────────────────────────────────
const WhiteFlash: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, CONFIG.flashFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#ffffff",
        opacity,
        zIndex: 10,
      }}
    />
  );
};

// ─── COLOR BURST ─────────────────────────────────────────────────────────────
const ColorBurst: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = Math.max(0, frame - CONFIG.burstStartFrame);
  const scale = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 80 },
  });
  const opacity = interpolate(localFrame, [0, 8, 40, 60], [0, 0.55, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 1400,
        height: 1400,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${CONFIG.burstColor}cc 0%, ${CONFIG.burstColor}33 40%, transparent 70%)`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        zIndex: 1,
      }}
    />
  );
};

// ─── GLITCH BARS ─────────────────────────────────────────────────────────────
const GlitchBars: React.FC<{ frame: number }> = ({ frame }) => {
  const offsets = [340, 520, 680]; // vertical positions (px from top of 1920)
  const widths = [900, 640, 780];
  const leftOffsets = [80, 200, 60];

  const localFrame = frame - CONFIG.glitchFrame;
  const opacity = interpolate(localFrame, [0, 1, 4, 8], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;

  return (
    <>
      {CONFIG.glitchColors.map((color, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: offsets[i],
            left: leftOffsets[i],
            width: widths[i],
            height: CONFIG.glitchHeight,
            backgroundColor: color,
            opacity: opacity * 0.85,
            zIndex: 8,
            mixBlendMode: "screen",
          }}
        />
      ))}
    </>
  );
};

// ─── HERO TEXT ───────────────────────────────────────────────────────────────
const HeroText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1.05,
    config: { damping: 10, stiffness: 180 },
  });

  // Subtle rotation wiggle — decays to 0
  const rotationAmplitude = interpolate(frame, [0, 30], [3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotation = Math.sin((frame / 2) * Math.PI) * rotationAmplitude;

  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        zIndex: 5,
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 900,
          fontSize: CONFIG.heroFontSize,
          color: CONFIG.heroColor,
          letterSpacing: -4,
          lineHeight: 1,
          textTransform: "uppercase",
          textShadow: "0 0 60px rgba(255,61,0,0.6), 0 4px 32px rgba(0,0,0,0.8)",
        }}
      >
        {CONFIG.heroText}
      </span>
    </div>
  );
};

// ─── SUB TEXT ────────────────────────────────────────────────────────────────
const SubText: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = Math.max(0, frame - CONFIG.subFadeFrame);
  const opacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, 12], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 5,
      }}
    >
      <span
        style={{
          fontFamily: "system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 600,
          fontSize: CONFIG.subFontSize,
          color: CONFIG.subColor,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        {CONFIG.subText}
      </span>
    </div>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
export const ShortsHookIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.bg, overflow: "hidden" }}>
      <ColorBurst frame={frame} fps={fps} />
      <HeroText frame={frame} fps={fps} />
      <GlitchBars frame={frame} />
      <SubText frame={frame} />
      <WhiteFlash frame={frame} />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="ShortsHookIntro"
    component={ShortsHookIntro}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
  />
);
