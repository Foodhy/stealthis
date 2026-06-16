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

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  topText: "WHEN THE DEPLOY",
  bottomText: "ACTUALLY WORKS ON FRIDAY",
  placeholderBg: "#2a2a2a",
  placeholderWidth: 960,
  placeholderHeight: 960,
  backgroundColor: "#ffffff",
  textColor: "#ffffff",
  textOutlineColor: "#000000",
  fontSize: 88,
  fontFamily: "'Impact', 'Arial Black', 'Arial Bold', sans-serif",
  shakeAmplitude: 3,
  shakeFrequency: 0.8,
  emoji1: "😂",
  emoji1Frame: 90,
  emoji2: "💀",
  emoji2Frame: 120,
  reactionBarFrame: 200,
  reactionBar: "😂😂😂",
  emojiSize: 120,
  reactionBarSize: 96,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const impactShadow = (size: number): string => {
  const s = Math.max(2, Math.round(size * 0.045));
  const offsets: string[] = [];
  for (let dx = -s; dx <= s; dx++) {
    for (let dy = -s; dy <= s; dy++) {
      if (dx === 0 && dy === 0) continue;
      offsets.push(`${dx}px ${dy}px 0 ${CONFIG.textOutlineColor}`);
    }
  }
  return offsets.join(", ");
};

// ─── Background ───────────────────────────────────────────────────────────────
const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CONFIG.backgroundColor }} />
);

// ─── Image Placeholder ────────────────────────────────────────────────────────
const ImagePlaceholder: React.FC = () => {
  const { width, height } = useVideoConfig();
  const cx = (width - CONFIG.placeholderWidth) / 2;
  const cy = (height - CONFIG.placeholderHeight) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: cy,
        width: CONFIG.placeholderWidth,
        height: CONFIG.placeholderHeight,
        backgroundColor: CONFIG.placeholderBg,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Camera icon built from divs */}
      <div
        style={{
          width: 120,
          height: 90,
          border: "6px solid rgba(255,255,255,0.35)",
          borderRadius: 18,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Lens */}
        <div
          style={{
            width: 52,
            height: 52,
            border: "5px solid rgba(255,255,255,0.35)",
            borderRadius: "50%",
          }}
        />
        {/* Shutter bump */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: 16,
            width: 34,
            height: 16,
            backgroundColor: "rgba(255,255,255,0.35)",
            borderRadius: "6px 6px 0 0",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 36,
          color: "rgba(255,255,255,0.3)",
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Your Meme Here
      </span>
    </div>
  );
};

// ─── Top Caption ──────────────────────────────────────────────────────────────
const TopCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideY = spring({
    frame,
    fps,
    from: -200,
    to: 0,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 80,
        paddingLeft: 40,
        paddingRight: 40,
        transform: `translateY(${slideY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: CONFIG.fontFamily,
          fontWeight: 900,
          fontSize: CONFIG.fontSize,
          color: CONFIG.textColor,
          textShadow: impactShadow(CONFIG.fontSize),
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: 2,
        }}
      >
        {CONFIG.topText}
      </span>
    </div>
  );
};

// ─── Bottom Caption ───────────────────────────────────────────────────────────
const BottomCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideY = spring({
    frame,
    fps,
    from: 200,
    to: 0,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 80,
        paddingLeft: 40,
        paddingRight: 40,
        transform: `translateY(${slideY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: CONFIG.fontFamily,
          fontWeight: 900,
          fontSize: CONFIG.fontSize,
          color: CONFIG.textColor,
          textShadow: impactShadow(CONFIG.fontSize),
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.1,
          letterSpacing: 2,
        }}
      >
        {CONFIG.bottomText}
      </span>
    </div>
  );
};

// ─── Dropped Emoji ────────────────────────────────────────────────────────────
interface DroppedEmojiProps {
  emoji: string;
  triggerFrame: number;
  offsetX: number;
  offsetY: number;
}

const DroppedEmoji: React.FC<DroppedEmojiProps> = ({
  emoji,
  triggerFrame,
  offsetX,
  offsetY,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const f = Math.max(0, frame - triggerFrame);

  const dropY = spring({
    frame: f,
    fps,
    from: -200,
    to: height / 2 + offsetY,
    config: { damping: 8, stiffness: 140, mass: 0.8 },
  });

  const opacity = interpolate(f, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cx = width / 2 + offsetX - CONFIG.emojiSize / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: dropY - CONFIG.emojiSize / 2,
        fontSize: CONFIG.emojiSize,
        lineHeight: 1,
        opacity,
        userSelect: "none",
      }}
    >
      {emoji}
    </div>
  );
};

// ─── Reaction Bar ─────────────────────────────────────────────────────────────
const ReactionBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const DELAY = CONFIG.reactionBarFrame;
  const f = Math.max(0, frame - DELAY);

  const slideX = spring({
    frame: f,
    fps,
    from: width + 100,
    to: 0,
    config: { damping: 16, stiffness: 100 },
  });

  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: height / 2 - CONFIG.reactionBarSize / 2 + 200,
        transform: `translateX(${slideX}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: CONFIG.reactionBarSize,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {CONFIG.reactionBar}
      </div>
    </div>
  );
};

// ─── Shaking Container ────────────────────────────────────────────────────────
const MemeFrame: React.FC = () => {
  const frame = useCurrentFrame();

  const shakeX = Math.sin(frame * CONFIG.shakeFrequency) * CONFIG.shakeAmplitude;
  const shakeY =
    Math.sin(frame * CONFIG.shakeFrequency * 1.3 + 1.2) *
    CONFIG.shakeAmplitude *
    0.6;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <Background />
      <ImagePlaceholder />
      <TopCaption />
      <BottomCaption />
      <DroppedEmoji
        emoji={CONFIG.emoji1}
        triggerFrame={CONFIG.emoji1Frame}
        offsetX={-80}
        offsetY={-60}
      />
      <DroppedEmoji
        emoji={CONFIG.emoji2}
        triggerFrame={CONFIG.emoji2Frame}
        offsetX={100}
        offsetY={80}
      />
      <ReactionBar />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="MemeFrame"
    component={MemeFrame}
    durationInFrames={270}
    fps={30}
    width={1080}
    height={1920}
  />
);
