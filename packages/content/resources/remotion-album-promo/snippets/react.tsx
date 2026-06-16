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

// ─── Constants ─────────────────────────────────────────────────────────────────
const ALBUM_TITLE = "NEON SILENCE";
const ARTIST_NAME = "Aria Soleil";
const TRACKS = [
  "01. Midnight Circuit",
  "02. Neon Silence",
  "03. Glass Frequencies",
  "04. Pulsar Dream",
  "05. Echo Chamber",
  "06. Voltage Kiss",
  "07. Subwave",
  "08. Afterglow",
];
const PLATFORMS = "Spotify · Apple Music · Tidal · YouTube Music";
const VINYL_GROOVES = 14;

// ─── Color palette ─────────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const SURFACE = "#12121a";
const ACCENT = "#a855f7";
const ACCENT_2 = "#06b6d4";
const ACCENT_3 = "#ec4899";
const GOLD = "#f59e0b";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";

// ─── ACT 1 — Letter-by-letter title ───────────────────────────────────────────
const TitleLetter: React.FC<{ char: string; index: number; totalChars: number }> = ({
  char,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each letter starts fading 3 frames after the previous
  const startFrame = index * 3;

  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.ease,
  });

  const y = interpolate(frame, [startFrame, startFrame + 14], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const glowIntensity = interpolate(frame, [startFrame + 10, startFrame + 20], [1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${y}px)`,
        color: TEXT,
        textShadow: `0 0 ${20 * glowIntensity}px ${ACCENT}, 0 0 ${40 * glowIntensity}px ${ACCENT}88`,
        letterSpacing: "0.15em",
      }}
    >
      {char === " " ? " " : char}
    </span>
  );
};

const Act1Title: React.FC = () => {
  const frame = useCurrentFrame();
  const letters = ALBUM_TITLE.split("");
  const totalChars = letters.length;

  // Artist name fades in after all letters (last letter starts at (totalChars-1)*3)
  const artistStartFrame = totalChars * 3 + 4;
  const artistOpacity = interpolate(frame, [artistStartFrame, artistStartFrame + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.ease,
  });
  const artistY = interpolate(frame, [artistStartFrame, artistStartFrame + 14], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #1a0a2e 0%, ${BG} 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Ambient glow orb */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Album title */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 96,
          lineHeight: 1,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {letters.map((char, i) => (
          <TitleLetter key={i} char={char} index={i} totalChars={totalChars} />
        ))}
      </div>

      {/* Artist name */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 300,
          fontSize: 28,
          color: MUTED,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          opacity: artistOpacity,
          transform: `translateY(${artistY}px)`,
        }}
      >
        {ARTIST_NAME}
      </div>
    </AbsoluteFill>
  );
};

// ─── ACT 2 — Album cover + tracklist + vinyl ──────────────────────────────────
const AlbumCoverArt: React.FC<{ scale: number }> = ({ scale }) => {
  const frame = useCurrentFrame();
  // Pulsing glow on the cover
  const pulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <div
      style={{
        width: 400,
        height: 400,
        borderRadius: 8,
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        boxShadow: `0 0 ${40 * pulse}px ${ACCENT}99, 0 0 80px ${ACCENT_3}44, 0 30px 60px rgba(0,0,0,0.8)`,
        position: "relative",
      }}
    >
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `conic-gradient(from 0deg at 50% 50%, #1a0a2e, #2d1055, #a855f7, #ec4899, #f59e0b, #ec4899, #a855f7, #2d1055, #1a0a2e)`,
        }}
      />
      {/* Concentric rings */}
      {[0.9, 0.75, 0.6, 0.45, 0.3, 0.18].map((size, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 400 * size,
            height: 400 * size,
            borderRadius: "50%",
            border: `${i % 2 === 0 ? 2 : 1}px solid rgba(255,255,255,${0.06 + i * 0.02})`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {/* Glowing center orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, #fff 0%, ${GOLD} 30%, ${ACCENT_3} 70%, transparent 100%)`,
          transform: "translate(-50%, -50%)",
          boxShadow: `0 0 30px ${GOLD}cc`,
        }}
      />
      {/* Abstract diagonal shafts */}
      {[0, 60, 120].map((angle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 2,
            height: 300,
            background: `linear-gradient(to bottom, transparent, ${ACCENT_2}44, transparent)`,
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            transformOrigin: "bottom center",
          }}
        />
      ))}
    </div>
  );
};

const VinylRecord: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const rotation = frame * 2; // degrees per frame
  return (
    <div
      style={{
        width: 340,
        height: 340,
        position: "relative",
        transform: `rotate(${rotation}deg)`,
        opacity,
        filter: `drop-shadow(0 0 20px rgba(0,0,0,0.8))`,
      }}
    >
      {/* Main disc */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 50%, #2a2a2a 0%, #111 60%, #0a0a0a 100%)`,
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Groove rings */}
        {Array.from({ length: VINYL_GROOVES }).map((_, i) => {
          const t = (i + 1) / (VINYL_GROOVES + 1);
          const size = 40 + t * 200;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: size,
                height: size,
                borderRadius: "50%",
                border: `0.5px solid rgba(255,255,255,${0.04 + (1 - t) * 0.04})`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
        {/* Shine highlight */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: "30%",
            height: "30%",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)`,
          }}
        />
      </div>
      {/* Center label */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_3})`,
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 12px ${ACCENT}88`,
        }}
      >
        {/* Center spindle hole */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#0a0a0f",
          }}
        />
      </div>
    </div>
  );
};

const TrackItem: React.FC<{ title: string; index: number; frameOffset: number }> = ({
  title,
  index,
  frameOffset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = frameOffset + index * 6;

  const x = interpolate(frame, [delay, delay + 18], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isHighlighted = index === 1; // "Neon Silence" (title track) highlighted

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity,
        transform: `translateX(${x}px)`,
        marginBottom: 10,
        padding: "6px 12px",
        borderRadius: 6,
        background: isHighlighted ? `rgba(168,85,247,0.15)` : "transparent",
        borderLeft: isHighlighted ? `2px solid ${ACCENT}` : "2px solid transparent",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 16,
          color: isHighlighted ? TEXT : MUTED,
          fontWeight: isHighlighted ? 600 : 400,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </span>
    </div>
  );
};

const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relative frame within act 2 (act 2 starts at frame 40 globally, but Sequence handles offset)
  const localFrame = frame;

  const coverScale = spring({
    frame: localFrame,
    fps,
    from: 0.3,
    to: 1.0,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  const vinylOpacity = interpolate(localFrame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(localFrame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #0d0820 0%, ${BG} 40%, #0a1015 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}0a 0%, transparent 70%)`,
          top: "50%",
          left: "30%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Left section: Vinyl + Album cover */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          flex: "0 0 auto",
          paddingLeft: 100,
        }}
      >
        {/* Artist + album header */}
        <div
          style={{
            textAlign: "center",
            opacity: headerOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 300,
              fontSize: 14,
              color: ACCENT,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {ARTIST_NAME}
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 40,
              color: TEXT,
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            {ALBUM_TITLE}
          </div>
        </div>

        {/* Album cover + vinyl side by side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: -60,
            position: "relative",
          }}
        >
          <AlbumCoverArt scale={coverScale} />
          {/* Vinyl behind/beside the cover */}
          <div style={{ marginLeft: -30, zIndex: -1 }}>
            <VinylRecord frame={localFrame} opacity={vinylOpacity} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 500,
          background: `linear-gradient(to bottom, transparent, ${ACCENT}40, transparent)`,
          margin: "0 60px",
          opacity: headerOpacity,
        }}
      />

      {/* Right section: Tracklist */}
      <div
        style={{
          flex: "0 0 360px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: 80,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: MUTED,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginBottom: 20,
            opacity: headerOpacity,
          }}
        >
          Tracklist
        </div>
        {TRACKS.map((track, i) => (
          <TrackItem key={i} title={track} index={i} frameOffset={12} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── ACT 3 — OUT NOW ──────────────────────────────────────────────────────────
const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const outNowScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 120, mass: 0.6 },
  });

  const outNowOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const platformsOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const platformsY = interpolate(frame, [14, 28], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const artistOpacity = interpolate(frame, [20, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow
  const glow = Math.sin(frame * 0.15) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0d0820 0%, #100a2e 40%, #0a0a0f 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Radial glow behind text */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${ACCENT}20 0%, ${ACCENT_3}10 40%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Artist name */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 300,
          fontSize: 22,
          color: MUTED,
          letterSpacing: "0.6em",
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: artistOpacity,
        }}
      >
        {ARTIST_NAME}
      </div>

      {/* Album title */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 52,
          color: TEXT,
          letterSpacing: "0.12em",
          marginBottom: 40,
          opacity: artistOpacity,
          textShadow: `0 0 30px ${ACCENT}66`,
        }}
      >
        {ALBUM_TITLE}
      </div>

      {/* OUT NOW */}
      <div
        style={{
          transform: `scale(${outNowScale})`,
          opacity: outNowOpacity,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 96,
          color: GOLD,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          textShadow: `0 0 ${30 * glow}px ${GOLD}cc, 0 0 ${60 * glow}px ${GOLD}66, 0 0 ${100 * glow}px ${GOLD}33`,
          lineHeight: 1,
        }}
      >
        OUT NOW
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: 400,
          height: 1,
          background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)`,
          marginTop: 28,
          marginBottom: 28,
          opacity: platformsOpacity,
        }}
      />

      {/* Streaming platforms */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          color: MUTED,
          letterSpacing: "0.15em",
          opacity: platformsOpacity,
          transform: `translateY(${platformsY}px)`,
          textAlign: "center",
        }}
      >
        {PLATFORMS}
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ──────────────────────────────────────────────────────────
export const AlbumReleasePromo: React.FC = () => {
  const frame = useCurrentFrame();

  // Transition overlays between acts
  // Act 1 → 2 transition: fade to black at frames 36-40
  const act1FadeOut = interpolate(frame, [34, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Act 2 → 3 transition: fade to black at frames 136-140
  const act2FadeOut = interpolate(frame, [136, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Act 3 comes in: fade in at frames 140-144
  const act3FadeIn = interpolate(frame, [140, 146], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* ACT 1: 0–40 */}
      {frame < 41 && (
        <AbsoluteFill>
          <Act1Title />
          {frame >= 34 && (
            <AbsoluteFill
              style={{ backgroundColor: "#000", opacity: act1FadeOut }}
            />
          )}
        </AbsoluteFill>
      )}

      {/* ACT 2: 40–140 */}
      {frame >= 40 && frame < 141 && (
        <AbsoluteFill>
          {/* We shift local frame so act2 starts at 0 */}
          <Act2LocalWrapper startFrame={40} />
          {frame >= 136 && (
            <AbsoluteFill
              style={{ backgroundColor: "#000", opacity: act2FadeOut }}
            />
          )}
        </AbsoluteFill>
      )}

      {/* ACT 3: 140–180 */}
      {frame >= 140 && (
        <AbsoluteFill>
          <Act3LocalWrapper startFrame={140} />
          {frame < 146 && (
            <AbsoluteFill
              style={{ backgroundColor: "#000", opacity: act3FadeIn }}
            />
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// Wrapper components to shift frame offset for each act
const Act2LocalWrapper: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  return <Act2LocalFrame frame={localFrame} />;
};

const Act2LocalFrame: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const coverScale = spring({
    frame,
    fps,
    from: 0.3,
    to: 1.0,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  const vinylOpacity = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #0d0820 0%, ${BG} 40%, #0a1015 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}0a 0%, transparent 70%)`,
          top: "50%",
          left: "30%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Left section: Album cover + Vinyl */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          flex: "0 0 auto",
          paddingLeft: 100,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", opacity: headerOpacity }}>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 300,
              fontSize: 14,
              color: ACCENT,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {ARTIST_NAME}
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 40,
              color: TEXT,
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            {ALBUM_TITLE}
          </div>
        </div>

        {/* Cover + Vinyl row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <AlbumCoverArt scale={coverScale} />
          <div style={{ marginLeft: -50, zIndex: -1 }}>
            <VinylRecord frame={frame} opacity={vinylOpacity} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 500,
          background: `linear-gradient(to bottom, transparent, ${ACCENT}40, transparent)`,
          margin: "0 60px",
          opacity: headerOpacity,
        }}
      />

      {/* Right section: Tracklist */}
      <div
        style={{
          flex: "0 0 380px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: 80,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: MUTED,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginBottom: 20,
            opacity: headerOpacity,
          }}
        >
          Tracklist
        </div>
        {TRACKS.map((track, i) => (
          <TrackItemLocal key={i} title={track} index={i} frameOffset={12} frame={frame} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Local track item that accepts frame as prop (no useCurrentFrame hook issues in nested contexts)
const TrackItemLocal: React.FC<{
  title: string;
  index: number;
  frameOffset: number;
  frame: number;
}> = ({ title, index, frameOffset, frame }) => {
  const { fps } = useVideoConfig();

  const delay = frameOffset + index * 6;

  const x = interpolate(frame, [delay, delay + 18], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isHighlighted = index === 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity,
        transform: `translateX(${x}px)`,
        marginBottom: 10,
        padding: "6px 12px",
        borderRadius: 6,
        background: isHighlighted ? `rgba(168,85,247,0.15)` : "transparent",
        borderLeft: isHighlighted ? `2px solid ${ACCENT}` : "2px solid transparent",
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 16,
          color: isHighlighted ? TEXT : MUTED,
          fontWeight: isHighlighted ? 600 : 400,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </span>
    </div>
  );
};

const Act3LocalWrapper: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  return <Act3LocalFrame frame={localFrame} />;
};

const Act3LocalFrame: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const outNowScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 120, mass: 0.6 },
  });

  const outNowOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const platformsOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const platformsY = interpolate(frame, [14, 28], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const artistOpacity = interpolate(frame, [20, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glow = Math.sin(frame * 0.15) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0d0820 0%, #100a2e 40%, #0a0a0f 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${ACCENT}20 0%, ${ACCENT_3}10 40%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Artist name */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 300,
          fontSize: 22,
          color: MUTED,
          letterSpacing: "0.6em",
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: artistOpacity,
        }}
      >
        {ARTIST_NAME}
      </div>

      {/* Album title */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 52,
          color: TEXT,
          letterSpacing: "0.12em",
          marginBottom: 40,
          opacity: artistOpacity,
          textShadow: `0 0 30px ${ACCENT}66`,
        }}
      >
        {ALBUM_TITLE}
      </div>

      {/* OUT NOW */}
      <div
        style={{
          transform: `scale(${outNowScale})`,
          opacity: outNowOpacity,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 96,
          color: GOLD,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          textShadow: `0 0 ${30 * glow}px ${GOLD}cc, 0 0 ${60 * glow}px ${GOLD}66, 0 0 ${100 * glow}px ${GOLD}33`,
          lineHeight: 1,
        }}
      >
        OUT NOW
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: 400,
          height: 1,
          background: `linear-gradient(to right, transparent, ${GOLD}80, transparent)`,
          marginTop: 28,
          marginBottom: 28,
          opacity: platformsOpacity,
        }}
      />

      {/* Streaming platforms */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          color: MUTED,
          letterSpacing: "0.15em",
          opacity: platformsOpacity,
          transform: `translateY(${platformsY}px)`,
          textAlign: "center",
        }}
      >
        {PLATFORMS}
      </div>
    </AbsoluteFill>
  );
};

// ─── Remotion root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="remotion-album-promo"
    component={AlbumReleasePromo}
    durationInFrames={180}
    fps={30}
    width={1920}
    height={1080}
  />
);

export const compositionConfig = {
  id: "remotion-album-promo",
  component: AlbumReleasePromo,
  durationInFrames: 180,
  fps: 30,
  width: 1920,
  height: 1080,
};
