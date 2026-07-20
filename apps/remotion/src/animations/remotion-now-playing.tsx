import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── Track metadata ───────────────────────────────────────────────────────────
const TRACK_TITLE = "Neon Horizon";
const ARTIST_NAME = "Synthwave Collective";
const ALBUM_NAME = "Electric Dreams, Vol. 3";
const TOTAL_TIME = "3:47";
const CURRENT_TIME_START = "1:22";
const CURRENT_TIME_END = "1:42";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE = "#1e1e2e";
const ACCENT = "#a855f7";
const ACCENT_2 = "#06b6d4";
const ACCENT_3 = "#ec4899";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";
const BORDER = "rgba(255,255,255,0.08)";

const BAR_COUNT = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function simAudio(frame: number, barIndex: number): number {
  // Layer three sine waves per bar for an organic feel
  const f = frame;
  const i = barIndex;
  const w1 = Math.sin(f * 0.18 + i * 0.55) * 0.45;
  const w2 = Math.sin(f * 0.09 + i * 1.1 + 1.3) * 0.30;
  const w3 = Math.sin(f * 0.31 + i * 0.28 + 2.7) * 0.15;
  return Math.max(0.08, 0.5 + w1 + w2 + w3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function formatTime(startSec: number, endSec: number, progress: number): string {
  const sec = Math.round(lerp(startSec, endSec, progress));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
const IconPrev: React.FC<{ color: string }> = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M19 20 L9 12 L19 4V20Z" fill={color} />
    <rect x="5" y="4" width="2" height="16" rx="1" fill={color} />
  </svg>
);

const IconNext: React.FC<{ color: string }> = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M5 4 L15 12 L5 20V4Z" fill={color} />
    <rect x="17" y="4" width="2" height="16" rx="1" fill={color} />
  </svg>
);

const IconPlay: React.FC<{ color: string; scale: number }> = ({ color, scale }) => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 52 52"
    fill="none"
    style={{ transform: `scale(${scale})` }}
  >
    <circle cx="26" cy="26" r="25" fill={ACCENT} opacity={0.18} />
    <circle cx="26" cy="26" r="22" fill={ACCENT} opacity={0.28} />
    <circle cx="26" cy="26" r="18" fill={ACCENT} />
    <path d="M22 17 L36 26 L22 35V17Z" fill={color} />
  </svg>
);

const IconHeart: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill={ACCENT_3}
    style={{
      transform: `scale(${scale})`,
      opacity,
      filter: `drop-shadow(0 0 6px ${ACCENT_3})`,
    }}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// ─── Album Art with vinyl overlay ────────────────────────────────────────────
const AlbumArt: React.FC<{ frame: number; size: number }> = ({ frame, size }) => {
  const rotationDeg = frame * 0.5;
  const vinylRingOpacity = 0.35 + Math.sin(frame * 0.08) * 0.08;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        boxShadow: `0 8px 40px rgba(168,85,247,0.45), 0 2px 12px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Gradient album art base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%)`,
        }}
      />

      {/* Inner pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 55%),
            radial-gradient(circle at 70% 70%, rgba(6,182,212,0.3) 0%, transparent 55%)
          `,
        }}
      />

      {/* Vinyl record overlay (rotating) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: size * 0.78,
            height: size * 0.78,
            borderRadius: "50%",
            background: `radial-gradient(circle, #1a1a2e 18%, transparent 18%),
              repeating-radial-gradient(circle, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1.5px, transparent 1.5px, transparent 5px)`,
            transform: `rotate(${rotationDeg}deg)`,
            opacity: vinylRingOpacity,
          }}
        />
      </div>

      {/* Center label dot */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: ACCENT,
            boxShadow: `0 0 10px ${ACCENT}`,
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
};

// ─── Mini visualizer bars ─────────────────────────────────────────────────────
const Visualizer: React.FC<{ frame: number }> = ({ frame }) => {
  const BAR_W = 5;
  const BAR_GAP = 3;
  const MAX_H = 48;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: BAR_GAP,
        height: MAX_H,
      }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const amp = simAudio(frame, i);
        const barH = Math.round(amp * MAX_H);
        const hue = 270 + i * 4; // purple → pink sweep
        return (
          <div
            key={i}
            style={{
              width: BAR_W,
              height: barH,
              borderRadius: 3,
              background: `hsl(${hue}, 90%, 65%)`,
              boxShadow: `0 0 6px hsl(${hue}, 90%, 65%)`,
              transition: "height 0.05s linear",
            }}
          />
        );
      })}
    </div>
  );
};

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{
  progress: number;
  currentTime: string;
}> = ({ progress, currentTime }) => (
  <div style={{ width: "100%" }}>
    <div
      style={{
        width: "100%",
        height: 4,
        borderRadius: 2,
        background: "rgba(255,255,255,0.12)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_3})`,
          borderRadius: 2,
          boxShadow: `0 0 10px ${ACCENT}`,
        }}
      />
      {/* Scrubber dot */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${progress * 100}%`,
          transform: "translate(-50%, -50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: TEXT,
          boxShadow: `0 0 8px rgba(255,255,255,0.8)`,
        }}
      />
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 6,
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        color: MUTED,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span>{currentTime}</span>
      <span>{TOTAL_TIME}</span>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const NowPlayingCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Card slide-up entrance spring
  const cardY = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.9 },
    durationInFrames: 24,
    from: 120,
    to: 0,
  });

  // Card opacity
  const cardOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Progress bar: 15% → 45% over the clip
  const progressRaw = interpolate(
    frame,
    [0, durationInFrames - 1],
    [0.15, 0.45],
    { extrapolateRight: "clamp" }
  );

  // Current time: 1:22 → 1:42 (82s → 102s)
  const currentTimeSec = Math.round(lerp(82, 102, (frame / (durationInFrames - 1))));
  const currentTimeStr = formatTime(82, 102, frame / (durationInFrames - 1));

  // Play button pulse
  const playPulse =
    1 + Math.sin(frame * 0.18) * 0.06;

  // Heart animation at frame 90
  const heartScale = spring({
    frame: frame - 90,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
    durationInFrames: 20,
    from: 0,
    to: 1,
  });
  const heartOpacity = interpolate(frame, [90, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const CARD_W = 700;
  const CARD_H = 210;
  const ART_SIZE = 160;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 60%, rgba(168,85,247,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 75% 35%, rgba(6,182,212,0.08) 0%, transparent 50%),
          ${BG}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Ambient glow behind card */}
      <div
        style={{
          position: "absolute",
          width: CARD_W + 120,
          height: CARD_H + 120,
          borderRadius: 40,
          background: `radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%)`,
          filter: "blur(28px)",
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
        }}
      />

      {/* Card */}
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          borderRadius: 20,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          backdropFilter: "blur(16px)",
          boxShadow: `
            0 32px 80px rgba(0,0,0,0.7),
            0 0 0 1px rgba(168,85,247,0.18),
            inset 0 1px 0 rgba(255,255,255,0.06)
          `,
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          display: "flex",
          flexDirection: "column",
          padding: "22px 26px 18px 22px",
          gap: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle top-left gradient sheen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 220,
            height: 110,
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(168,85,247,0.12), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Main row: album art + info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flex: 1,
          }}
        >
          {/* Album art */}
          <AlbumArt frame={frame} size={ART_SIZE} />

          {/* Track info + visualizer */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              minWidth: 0,
            }}
          >
            {/* Playing label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: ACCENT,
                  boxShadow: `0 0 8px ${ACCENT}`,
                  animation: "none",
                  opacity: 0.5 + 0.5 * Math.sin(frame * 0.22),
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: ACCENT,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Now Playing
              </span>
            </div>

            {/* Track title */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: TEXT,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {TRACK_TITLE}
            </div>

            {/* Artist */}
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: ACCENT_2,
                letterSpacing: "0.01em",
              }}
            >
              {ARTIST_NAME}
            </div>

            {/* Album */}
            <div
              style={{
                fontSize: 12,
                color: MUTED,
                letterSpacing: "0.01em",
              }}
            >
              {ALBUM_NAME}
            </div>

            {/* Visualizer */}
            <div style={{ marginTop: 6 }}>
              <Visualizer frame={frame} />
            </div>
          </div>

          {/* Heart */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              paddingTop: 4,
            }}
          >
            <IconHeart scale={heartScale} opacity={heartOpacity} />
          </div>
        </div>

        {/* Progress bar row */}
        <ProgressBar progress={progressRaw} currentTime={currentTimeStr} />

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconPrev color={MUTED} />
          </button>

          <div style={{ display: "flex", alignItems: "center" }}>
            <IconPlay color={TEXT} scale={playPulse} />
          </div>

          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconNext color={MUTED} />
          </button>
        </div>
      </div>

      {/* Floating particles */}
      {[0, 1, 2, 3, 4].map((i) => {
        const px =
          width * 0.2 + i * (width * 0.15) + Math.sin(frame * 0.04 + i * 1.3) * 30;
        const py =
          height * 0.15 +
          Math.sin(frame * 0.06 + i * 0.9) * 60 +
          i * (height * 0.12);
        const pop = interpolate(frame, [i * 10, i * 10 + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const colors = [ACCENT, ACCENT_2, ACCENT_3, "#f59e0b", "#10b981"];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: 5 + i * 1.5,
              height: 5 + i * 1.5,
              borderRadius: "50%",
              background: colors[i % colors.length],
              opacity: pop * (0.3 + Math.sin(frame * 0.07 + i) * 0.15),
              boxShadow: `0 0 12px ${colors[i % colors.length]}`,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Composition config ───────────────────────────────────────────────────────
export const compositionConfig = {
  id: "remotion-now-playing",
  component: NowPlayingCard,
  durationInFrames: 120,
  fps: 30,
  width: 1920,
  height: 1080,
};
