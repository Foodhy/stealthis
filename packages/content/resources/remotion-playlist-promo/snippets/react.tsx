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

// ── Palette & Config ──────────────────────────────────────────────────────────
const BG        = "#0a0a0f";
const SURFACE   = "#12121a";
const SURFACE_2 = "#1e1e2e";
const ACCENT    = "#a855f7";
const ACCENT_2  = "#06b6d4";
const ACCENT_3  = "#ec4899";
const TEXT      = "#f1f5f9";
const MUTED     = "#94a3b8";

const PLAYLIST_TITLE = "MIDNIGHT VIBES";
const PLAYLIST_META  = "12 tracks · 48 min";
const BAR_COUNT      = 20;

// ── Track Data ────────────────────────────────────────────────────────────────
interface Track {
  num: number;
  title: string;
  artist: string;
  duration: string;
}

const TRACKS: Track[] = [
  { num: 1, title: "After Dark",         artist: "Neon Pulse",      duration: "3:42" },
  { num: 2, title: "Velvet Underground", artist: "Luna Hex",         duration: "4:15" },
  { num: 3, title: "Crimson Hour",       artist: "The Fade",         duration: "3:58" },
  { num: 4, title: "Starfall",           artist: "Aurora Drift",     duration: "5:01" },
  { num: 5, title: "Phantom Circuit",    artist: "Synthwave Rebels", duration: "4:33" },
  { num: 6, title: "Neon Cathedral",     artist: "Echo Bloom",       duration: "3:27" },
];

// Each track slides in 25 frames apart
const TRACK_STAGGER      = 25; // frames between each track card reveal
const FIRST_TRACK_START  = 40; // frame when first track starts sliding in
const SLIDE_DURATION     = 18; // frames to complete the slide animation
const CTA_START_FRAME    = 185; // frame when CTA button pulses in

// ── Simulated Audio Visualizer ────────────────────────────────────────────────
// Multiple stacked sine waves for organic feel
function simulateBarHeight(barIndex: number, frame: number, totalBars: number): number {
  const t = frame * 0.035;
  const normalizedPos = barIndex / totalBars;

  // Layer 1: slow rolling wave across bars
  const wave1 = Math.sin(normalizedPos * Math.PI * 2.8 + t * 1.2) * 0.30;
  // Layer 2: faster secondary oscillation
  const wave2 = Math.sin(normalizedPos * Math.PI * 5.4 + t * 2.1 + 1.3) * 0.18;
  // Layer 3: high-freq shimmer per bar
  const wave3 = Math.sin(barIndex * 3.7 + t * 3.5 + 0.8) * 0.12;
  // Layer 4: slow breathing pulse (global amplitude)
  const pulse  = 0.55 + Math.sin(t * 0.7) * 0.2;

  const raw = (0.25 + wave1 + wave2 + wave3) * pulse;
  // Clamp between 0.08 and 0.92
  return Math.max(0.08, Math.min(0.92, raw));
}

// ── Background Hue Wash ───────────────────────────────────────────────────────
// Slowly shifts HSL hue value over time
function bgHueShift(frame: number): string {
  // Cycles from hue 270 (purple) toward 200 (cyan) and back
  const hue = 270 + Math.sin(frame * 0.012) * 35;
  return `hsl(${hue}, 60%, 8%)`;
}

// ── VU Bars Component ─────────────────────────────────────────────────────────
const VisualizerBars: React.FC<{ frame: number; width: number; height: number }> = ({
  frame,
  width,
  height,
}) => {
  const barW     = Math.floor(width / BAR_COUNT) - 3;
  const maxBarH  = height;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        width,
        height,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const fraction = simulateBarHeight(i, frame, BAR_COUNT);
        const barH     = fraction * maxBarH;

        // Color gradient from accent to accent_2 across bars
        const t     = i / (BAR_COUNT - 1);
        const r1 = 168, g1 = 85, b1 = 247;  // #a855f7
        const r2 = 6,   g2 = 182, b2 = 212; // #06b6d4
        const r  = Math.round(r1 + (r2 - r1) * t);
        const g  = Math.round(g1 + (g2 - g1) * t);
        const b  = Math.round(b1 + (b2 - b1) * t);
        const color = `rgb(${r},${g},${b})`;

        return (
          <div
            key={i}
            style={{
              width: barW,
              height: barH,
              borderRadius: "3px 3px 0 0",
              background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
              boxShadow: `0 0 8px ${color}66`,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Header Block ──────────────────────────────────────────────────────────────
const HeaderBlock: React.FC<{ frame: number; fps: number; width: number }> = ({
  frame,
  fps,
  width,
}) => {
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = spring({
    frame,
    fps,
    from: -30,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });

  const metaOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const vizOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Purple pill badge
  const badgeScale = spring({
    frame: Math.max(0, frame - 5),
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 180 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "32%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 24,
      }}
    >
      {/* "NOW PLAYING" badge */}
      <div
        style={{
          transform: `scale(${badgeScale})`,
          marginBottom: 18,
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
          borderRadius: 100,
          padding: "6px 20px",
          boxShadow: "0 0 24px rgba(168,85,247,0.5)",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
          }}
        >
          NOW PLAYING
        </span>
      </div>

      {/* Playlist title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 72,
          color: TEXT,
          letterSpacing: "-2px",
          lineHeight: 1,
          textAlign: "center",
          background: "linear-gradient(135deg, #f1f5f9 0%, #a855f7 60%, #ec4899 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {PLAYLIST_TITLE}
      </div>

      {/* Metadata row */}
      <div
        style={{
          opacity: metaOpacity,
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 18,
            color: MUTED,
            letterSpacing: "0.5px",
          }}
        >
          {PLAYLIST_META}
        </span>
      </div>

      {/* Visualizer bars */}
      <div
        style={{
          opacity: vizOpacity,
          marginTop: 22,
          width: Math.min(width * 0.5, 600),
          height: 48,
        }}
      >
        <VisualizerBars frame={frame} width={Math.min(width * 0.5, 600)} height={48} />
      </div>
    </div>
  );
};

// ── Track Card ────────────────────────────────────────────────────────────────
interface TrackCardProps {
  track: Track;
  trackIndex: number;
  frame: number;
  fps: number;
  isNewest: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, trackIndex, frame, fps, isNewest }) => {
  const startFrame = FIRST_TRACK_START + trackIndex * TRACK_STAGGER;
  const localFrame = Math.max(0, frame - startFrame);

  // Slide in from left
  const slideX = interpolate(localFrame, [0, SLIDE_DURATION], [-380, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const cardOpacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Newly added" highlight: scale up briefly then settle
  const highlightFrame = Math.max(0, localFrame - SLIDE_DURATION);
  const highlightScale = isNewest
    ? spring({
        frame: highlightFrame,
        fps,
        from: 1.0,
        to: 1.02,
        config: { damping: 10, stiffness: 300 },
      })
    : 1;

  // Brightness boost for the newest card, then settles to 1
  const brightnessBoost = isNewest
    ? interpolate(highlightFrame, [0, 8, 20], [1, 1.35, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Glow on newest card
  const glowOpacity = isNewest
    ? interpolate(highlightFrame, [0, 5, 20], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Don't render before start
  if (localFrame === 0 && frame < startFrame) return null;

  return (
    <div
      style={{
        transform: `translateX(${slideX}px) scale(${highlightScale})`,
        opacity: cardOpacity,
        filter: `brightness(${brightnessBoost})`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 20px",
        borderRadius: 12,
        backgroundColor: SURFACE,
        border: `1px solid ${isNewest ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`,
        borderLeft: "none",
        position: "relative",
        boxShadow: isNewest
          ? `0 0 28px rgba(168,85,247,${glowOpacity * 0.45}), 0 2px 12px rgba(0,0,0,0.4)`
          : "0 2px 8px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}
    >
      {/* Left gradient accent border */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: "linear-gradient(180deg, #a855f7, #ec4899)",
          borderRadius: "12px 0 0 12px",
          boxShadow: `0 0 12px rgba(168,85,247,0.6)`,
        }}
      />

      {/* Track number */}
      <div
        style={{
          width: 28,
          flexShrink: 0,
          marginLeft: 8,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: isNewest ? ACCENT : "rgba(255,255,255,0.25)",
          textAlign: "center",
        }}
      >
        {String(track.num).padStart(2, "0")}
      </div>

      {/* Play icon circle */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: isNewest ? ACCENT : "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: isNewest ? `0 0 16px rgba(168,85,247,0.7)` : "none",
          transition: "background-color 0.1s",
        }}
      >
        {/* SVG play triangle */}
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
          <path
            d="M1.5 1.5L10.5 7L1.5 12.5V1.5Z"
            fill={isNewest ? "#fff" : "rgba(255,255,255,0.4)"}
          />
        </svg>
      </div>

      {/* Title + Artist */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: isNewest ? TEXT : "rgba(255,255,255,0.85)",
            letterSpacing: "-0.3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.title}
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: isNewest ? "rgba(168,85,247,0.9)" : MUTED,
            marginTop: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.artist}
        </div>
      </div>

      {/* Duration */}
      <div
        style={{
          flexShrink: 0,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: isNewest ? MUTED : "rgba(255,255,255,0.3)",
          letterSpacing: "0.5px",
        }}
      >
        {track.duration}
      </div>
    </div>
  );
};

// ── CTA Button ────────────────────────────────────────────────────────────────
const CTAButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = Math.max(0, frame - CTA_START_FRAME);

  const scale = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle pulsing glow after appearing
  const pulseGlow = localFrame > 15
    ? 0.5 + Math.sin((localFrame - 15) * 0.15) * 0.25
    : 0;

  if (frame < CTA_START_FRAME) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 28,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
          borderRadius: 100,
          padding: "16px 52px",
          cursor: "pointer",
          boxShadow: `0 0 ${20 + pulseGlow * 24}px rgba(168,85,247,${0.55 + pulseGlow * 0.3}), 0 4px 20px rgba(0,0,0,0.4)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 3L17 10L3 17V3Z" fill="#fff" />
        </svg>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: "#fff",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          LISTEN NOW
        </span>
      </div>
    </div>
  );
};

// ── Streaming Platforms Row ───────────────────────────────────────────────────
interface Platform {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const PLATFORMS: Platform[] = [
  {
    name: "Spotify",
    color: "#1ed760",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="11" fill="#1ed760" />
        <path d="M7 8.5C9.5 7.5 13 8 15.5 9.5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 11C9.5 10.2 12.5 10.5 14.5 11.7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 13.5C9.8 12.9 12 13.1 13.8 14" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Apple Music",
    color: "#fc3c44",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect width="22" height="22" rx="5" fill="#fc3c44" />
        <path d="M14.5 6.5V13C14.5 14.1 13.6 15 12.5 15C11.4 15 10.5 14.1 10.5 13C10.5 11.9 11.4 11 12.5 11C12.9 11 13.2 11.1 13.5 11.3V8.2L8.5 9.5V15C8.5 16.1 7.6 17 6.5 17" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "YouTube Music",
    color: "#ff0000",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="11" fill="#ff0000" />
        <path d="M8.5 7.5L15.5 11L8.5 14.5V7.5Z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Tidal",
    color: "#06b6d4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect width="22" height="22" rx="5" fill="#06b6d4" />
        <path d="M5 9L8.5 12.5L12 9L15.5 12.5L19 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 13L8.5 16.5L12 13L15.5 16.5L19 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
];

const PlatformRow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [30, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 32,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Available on
      </span>

      {PLATFORMS.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            opacity: 0.8,
          }}
        >
          {p.icon}
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.3px",
            }}
          >
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────
export const PlaylistPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // How many tracks are currently visible
  const visibleTrackCount = TRACKS.reduce((count, _, i) => {
    const startFrame = FIRST_TRACK_START + i * TRACK_STAGGER;
    return frame >= startFrame ? count + 1 : count;
  }, 0);

  // The newest visible track index (for highlight)
  const newestTrackIndex = visibleTrackCount - 1;

  // Background color — slow HSL hue shift
  const bgColor = bgHueShift(frame);

  // Global fade-in
  const globalOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle purple radial glow that breathes with the music
  const glowIntensity = 0.06 + Math.sin(frame * 0.04) * 0.025;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden", opacity: globalOpacity }}>

      {/* Ambient radial glows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 20%, rgba(168,85,247,${glowIntensity * 2}) 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 50% 40% at 80% 75%, rgba(6,182,212,${glowIntensity}) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 40% 35% at 15% 80%, rgba(236,72,153,${glowIntensity * 0.8}) 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle noise grain overlay (CSS pattern simulation) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          background: `repeating-linear-gradient(
            45deg,
            rgba(255,255,255,0.03) 0px,
            rgba(255,255,255,0.03) 1px,
            transparent 1px,
            transparent 4px
          )`,
          pointerEvents: "none",
        }}
      />

      {/* ── Header (top 32%) ── */}
      <HeaderBlock frame={frame} fps={fps} width={width} />

      {/* ── Horizontal divider ── */}
      <div
        style={{
          position: "absolute",
          top: "33%",
          left: "8%",
          right: "8%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.3) 30%, rgba(6,182,212,0.3) 70%, transparent)",
          opacity: interpolate(frame, [35, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* ── Track list (center area) ── */}
      <div
        style={{
          position: "absolute",
          top: "34%",
          left: "16%",
          right: "16%",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 6,
            opacity: interpolate(frame, [38, 50], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Track List
        </div>

        {/* Track cards */}
        {TRACKS.map((track, i) => {
          const startFrame = FIRST_TRACK_START + i * TRACK_STAGGER;
          if (frame < startFrame) return null;

          return (
            <TrackCard
              key={track.num}
              track={track}
              trackIndex={i}
              frame={frame}
              fps={fps}
              isNewest={i === newestTrackIndex}
            />
          );
        })}

        {/* CTA Button — appears after all tracks are visible */}
        <CTAButton frame={frame} fps={fps} />
      </div>

      {/* ── Streaming platforms (bottom) ── */}
      <PlatformRow frame={frame} />

      {/* ── Subtle bottom vignette ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          background: "linear-gradient(0deg, rgba(0,0,0,0.5), transparent)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Remotion Root & Config ────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-playlist-promo"
    component={PlaylistPromo}
    durationInFrames={210}
    fps={30}
    width={1920}
    height={1080}
  />
);

export const compositionConfig = {
  id: "remotion-playlist-promo",
  component: PlaylistPromo,
  durationInFrames: 210,
  fps: 30,
  width: 1920,
  height: 1080,
};
