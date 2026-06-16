import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Customizable constants ────────────────────────────────────────────────
const NETWORK_NAME = "NNX";
const HEADLINE = "MAJOR EARTHQUAKE STRIKES PACIFIC COAST";
const SUBHEAD = "Rescue efforts underway — 3.2M affected";
const LOCATION_TEXT = "PACIFIC COAST, USA  ·  MAGNITUDE 7.8  ·  LOCAL TIME 14:32";
const MAGNITUDE = "7.8";
const LOCAL_TIME = "14:32";

const ACCENT_RED = "#e8001e";
const BG = "#0d1117";
const DARK_RED = "#8b0010";
const CHYRON_BG = "#12060a";
const WHITE = "#ffffff";
const OFF_WHITE = "rgba(255,255,255,0.85)";
const SUBTEXT = "rgba(255,255,255,0.6)";
const GRID_LINE = "rgba(255,255,255,0.04)";

// ─── Scene boundaries ──────────────────────────────────────────────────────
// Scene 1:  0–20   — diagonal red band wipe "BREAKING NEWS"
// Scene 2: 20–80   — main card: headline + subhead + NNX logo
// Scene 3: 80–120  — bottom chyron bar + LIVE badge
// Scene 4: 120–150 — outro wipe + NNX stamp

// ─── Sub-components ────────────────────────────────────────────────────────

/** Subtle grid lines for broadcast texture */
const BackgroundGrid: React.FC = () => (
  <>
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={`col-${i}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${(i / 12) * 100}%`,
          width: 1,
          backgroundColor: GRID_LINE,
        }}
      />
    ))}
    {Array.from({ length: 7 }).map((_, i) => (
      <div
        key={`row-${i}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${(i / 7) * 100}%`,
          height: 1,
          backgroundColor: GRID_LINE,
        }}
      />
    ))}
  </>
);

/** Radial vignette overlay for cinematic depth */
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
      pointerEvents: "none",
    }}
  />
);

// ─── Scene 1: Diagonal red wipe "BREAKING NEWS" (frames 0–20) ─────────────

const Scene1DiagonalWipe: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // The red band sweeps in from left, holds briefly, then exits right
  const SCENE_END = 20;

  // Sweep-in: frames 0→12
  const sweepIn = interpolate(frame, [0, 12], [-1440, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Sweep-out: frames 14→22
  const sweepOut = interpolate(frame, [14, 22], [0, 1440], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const translateX = frame < 14 ? sweepIn : sweepOut;

  // Text opacity — appears as band arrives, disappears with exit
  const textOpacity = interpolate(frame, [8, 14, 18, 22], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Skew for diagonal effect
  const SKEW = -8;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Main red diagonal band */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: -200,
          right: -200,
          height: 140,
          transform: `translateX(${translateX}px) translateY(-50%) skewX(${SKEW}deg)`,
          background: `linear-gradient(90deg, ${DARK_RED} 0%, ${ACCENT_RED} 30%, ${ACCENT_RED} 70%, ${DARK_RED} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 60px rgba(232,0,30,0.5), 0 0 120px rgba(232,0,30,0.2)`,
        }}
      >
        {/* Inner dark stripe for depth */}
        <div
          style={{
            position: "absolute",
            top: 10,
            bottom: 10,
            left: 0,
            right: 0,
            borderTop: "2px solid rgba(255,255,255,0.15)",
            borderBottom: "2px solid rgba(255,255,255,0.15)",
          }}
        />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 56,
            color: WHITE,
            letterSpacing: 10,
            textTransform: "uppercase",
            opacity: textOpacity,
            transform: `skewX(${-SKEW}deg)`,
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
          }}
        >
          BREAKING NEWS
        </span>
      </div>

      {/* Flash effect on entry */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: WHITE,
          opacity: interpolate(frame, [0, 4], [0.15, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </div>
  );
};

// ─── Scene 2: Main card — headline + NNX logo (frames 20–80) ──────────────

const NetworkLogo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 22;
  const f = Math.max(0, frame - delay);

  const scale = spring({ frame: f, fps, config: { damping: 18, stiffness: 200 } });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Outro fade at scene 4
  const outroOpacity = interpolate(frame, [120, 132], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        right: 44,
        opacity: opacity * outroOpacity,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Red circle badge */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: ACCENT_RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 20px rgba(232,0,30,0.4)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 20,
            color: WHITE,
            letterSpacing: 1,
          }}
        >
          {NETWORK_NAME}
        </span>
      </div>
      <div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: WHITE,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          News Network
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 11,
            color: SUBTEXT,
            letterSpacing: 1,
            marginTop: 2,
          }}
        >
          {LOCAL_TIME} LOCAL
        </div>
      </div>
    </div>
  );
};

const RedBorderBar: React.FC<{ frame: number }> = ({ frame }) => {
  const scaleY = interpolate(frame, [20, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Outro
  const outroScaleY = interpolate(frame, [120, 130], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 130,
        width: 12,
        height: 200,
        backgroundColor: ACCENT_RED,
        transformOrigin: "top center",
        transform: `scaleY(${scaleY * outroScaleY})`,
        boxShadow: `0 0 24px rgba(232,0,30,0.6)`,
        borderRadius: 2,
      }}
    />
  );
};

const HeadlineText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 28;
  const f = Math.max(0, frame - delay);

  const x = spring({ frame: f, fps, config: { damping: 22, stiffness: 160 } });
  const translateX = interpolate(x, [0, 1], [-80, 0]);
  const opacity = interpolate(f, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Outro
  const outroOpacity = interpolate(frame, [122, 136], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 130,
        left: 90,
        right: 160,
        opacity: opacity * outroOpacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* "BREAKING NEWS" label above headline */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: ACCENT_RED,
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        ● BREAKING NEWS
      </div>

      {/* Main headline */}
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 48,
          color: WHITE,
          lineHeight: 1.12,
          letterSpacing: -1,
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          maxWidth: 960,
        }}
      >
        {HEADLINE}
      </div>
    </div>
  );
};

const SubheadText: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 40;
  const f = Math.max(0, frame - delay);

  const opacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(f, [0, 20], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Outro
  const outroOpacity = interpolate(frame, [124, 136], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 330,
        left: 90,
        right: 160,
        opacity: opacity * outroOpacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 26,
          color: OFF_WHITE,
          letterSpacing: 0.3,
        }}
      >
        {SUBHEAD}
      </div>

      {/* Divider line */}
      <div
        style={{
          marginTop: 22,
          width: interpolate(f, [10, 40], [0, 220], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 2,
          backgroundColor: ACCENT_RED,
          borderRadius: 1,
          opacity: 0.7,
        }}
      />
    </div>
  );
};

// ─── Scene 3: Bottom chyron bar (frames 80–120) ────────────────────────────

const LiveBadge: React.FC<{ frame: number }> = ({ frame }) => {
  // Blink: alternates every 20 frames (roughly 0.67s at 30fps)
  const blinkCycle = Math.floor(frame / 20) % 2;
  const dotOpacity = blinkCycle === 0 ? 1 : 0.3;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 20,
        paddingRight: 20,
        height: "100%",
        borderRight: "1px solid rgba(255,255,255,0.15)",
        flexShrink: 0,
      }}
    >
      {/* Pulsing dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: ACCENT_RED,
          opacity: dotOpacity,
          boxShadow: `0 0 10px ${ACCENT_RED}`,
          transition: "opacity 0.1s",
        }}
      />
      <span
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 15,
          color: WHITE,
          letterSpacing: 3,
        }}
      >
        LIVE
      </span>
    </div>
  );
};

const ChyronBar: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const SCENE_START = 80;
  const SCENE_END = 120;
  const f = Math.max(0, frame - SCENE_START);

  // Slide up from bottom
  const slideUp = spring({ frame: f, fps, config: { damping: 24, stiffness: 200 } });
  const translateY = interpolate(slideUp, [0, 1], [80, 0]);

  // Outro: slide down
  const slideDown = interpolate(frame, [SCENE_END, SCENE_END + 14], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const finalY = frame < SCENE_END ? translateY : slideDown;

  // Scrolling ticker text inside chyron
  const tickerSpeed = 1.6;
  const offset = (frame - SCENE_START) * tickerSpeed;
  const repeatedText = `${LOCATION_TEXT}     ●     ${LOCATION_TEXT}     ●     ${LOCATION_TEXT}`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,
        transform: `translateY(${finalY}px)`,
        overflow: "hidden",
      }}
    >
      {/* Chyron background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${ACCENT_RED} 0%, ${DARK_RED} 8%, ${CHYRON_BG} 20%, ${CHYRON_BG} 100%)`,
          borderTop: `3px solid ${ACCENT_RED}`,
        }}
      />

      {/* Content row */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* LIVE badge */}
        <LiveBadge frame={frame} />

        {/* Magnitude badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingLeft: 16,
            paddingRight: 16,
            height: "100%",
            borderRight: "1px solid rgba(255,255,255,0.15)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            MAG
          </span>
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 22,
              color: WHITE,
            }}
          >
            {MAGNITUDE}
          </span>
        </div>

        {/* Scrolling location text */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            height: "100%",
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              transform: `translateX(-${offset}px)`,
            }}
          >
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 18,
                color: OFF_WHITE,
                letterSpacing: 0.8,
              }}
            >
              {repeatedText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Scene 4: Outro — vertical wipe + NNX stamp (frames 120–150) ──────────

const OutroWipe: React.FC<{ frame: number }> = ({ frame }) => {
  // White vertical wipe sweeps right across the frame
  const wipeProgress = interpolate(frame, [122, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Dark cover sweeping from left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: `${wipeProgress * 100}%`,
          backgroundColor: BG,
          boxShadow: `4px 0 30px rgba(0,0,0,0.8)`,
        }}
      />
    </div>
  );
};

const OutroStamp: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 132;
  const f = Math.max(0, frame - delay);

  const scale = spring({ frame: f, fps, config: { damping: 12, stiffness: 180 } });
  const scaleMapped = interpolate(scale, [0, 1], [0.4, 1.1]);

  const opacity = interpolate(frame, [132, 140, 144, 150], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        opacity,
        transform: `scale(${scaleMapped})`,
      }}
    >
      {/* Large NNX circle */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          backgroundColor: ACCENT_RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 60px rgba(232,0,30,0.6), 0 0 120px rgba(232,0,30,0.25)`,
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: WHITE,
            letterSpacing: 2,
          }}
        >
          {NETWORK_NAME}
        </span>
      </div>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 300,
          fontSize: 16,
          color: SUBTEXT,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        News Network
      </div>
    </div>
  );
};

// ─── Ambient red glow accent ───────────────────────────────────────────────

const AmbientGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 8% 60%, rgba(232,0,30,0.08) 0%, transparent 45%)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Main composition component ────────────────────────────────────────────

export default function BreakingNewsBumper() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {/* Background layer */}
      <BackgroundGrid />
      <AmbientGlow frame={frame} />
      <Vignette />

      {/* Scene 2: Main card elements (visible 20–120) */}
      <RedBorderBar frame={frame} />
      <HeadlineText frame={frame} fps={fps} />
      <SubheadText frame={frame} fps={fps} />
      <NetworkLogo frame={frame} fps={fps} />

      {/* Scene 1: Diagonal wipe (frames 0–22) */}
      <Scene1DiagonalWipe frame={frame} fps={fps} />

      {/* Scene 3: Bottom chyron (frames 80–120) */}
      <ChyronBar frame={frame} fps={fps} />

      {/* Scene 4: Outro wipe + stamp (frames 120–150) */}
      <OutroWipe frame={frame} />
      <OutroStamp frame={frame} fps={fps} />
    </AbsoluteFill>
  );
}
