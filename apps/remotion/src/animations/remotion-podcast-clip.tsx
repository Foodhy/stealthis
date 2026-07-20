import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  // Podcast identity
  PODCAST_NAME: "The Dev Dispatch",
  EPISODE_LABEL: "Ep. 142 · Building in Public",
  SPEAKER_NAME: "Marcus Webb",
  SPEAKER_TITLE: "Senior Engineer @ Vercel",
  // Layout accent color
  ACCENT: "#3b82f6",
  ACCENT_SECONDARY: "#8b5cf6",
  // Waveform
  BAR_COUNT: 20,
  // Quote — space-delimited for word-by-word reveal
  QUOTE:
    "The best time to ship was yesterday. The second best time is now.",
  // Total clip duration shown in timestamp (not the actual Remotion duration)
  CLIP_TOTAL: "1:02:34",
  CLIP_START_OFFSET_SECONDS: 12, // playhead starts at 0:12 in the source
  // Background
  BG_FROM: "#0d1117",
  BG_TO: "#161b22",
  // Dimensions
  WIDTH: 1920,
  HEIGHT: 1080,
  FPS: 30,
  DURATION_FRAMES: 1800,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 0.3) * 43758.5453;
  return x - Math.floor(x);
}

function formatTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────

const TopBar: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
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
        height: 72,
        background: "rgba(13,17,23,0.92)",
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 48,
        paddingRight: 48,
        gap: 20,
        opacity,
      }}
    >
      {/* Logo pill */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${CONFIG.ACCENT}, ${CONFIG.ACCENT_SECONDARY})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 16,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {CONFIG.PODCAST_NAME[0]}
      </div>

      {/* Podcast name */}
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          color: "#ffffff",
          letterSpacing: "-0.01em",
        }}
      >
        {CONFIG.PODCAST_NAME}
      </span>

      {/* Separator */}
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 18,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        ·
      </span>

      {/* Episode label */}
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 400,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.01em",
        }}
      >
        {CONFIG.EPISODE_LABEL}
      </span>
    </div>
  );
};

// ─── BOTTOM BAR ───────────────────────────────────────────────────────────────

const BottomBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const elapsedSeconds =
    CONFIG.CLIP_START_OFFSET_SECONDS + Math.floor(frame / CONFIG.FPS);
  const elapsed = formatTimestamp(elapsedSeconds);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: "rgba(13,17,23,0.92)",
        borderTop: `1px solid rgba(255,255,255,0.06)`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 48,
        paddingRight: 48,
        gap: 20,
        opacity,
      }}
    >
      {/* Elapsed */}
      <span
        style={{
          fontFamily: "system-ui, monospace",
          fontSize: 16,
          color: "rgba(255,255,255,0.45)",
          minWidth: 56,
          flexShrink: 0,
        }}
      >
        {elapsed}
      </span>

      {/* Track */}
      <div
        style={{
          flex: 1,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.12)",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${CONFIG.ACCENT}, ${CONFIG.ACCENT_SECONDARY})`,
            borderRadius: 2,
          }}
        />
        {/* Playhead dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${progress * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: `0 0 8px ${CONFIG.ACCENT}`,
          }}
        />
      </div>

      {/* Total */}
      <span
        style={{
          fontFamily: "system-ui, monospace",
          fontSize: 16,
          color: "rgba(255,255,255,0.45)",
          minWidth: 64,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {CONFIG.CLIP_TOTAL}
      </span>
    </div>
  );
};

// ─── AVATAR RING GLOW ─────────────────────────────────────────────────────────

const AvatarPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 14, stiffness: 90 },
  });

  // Pulsing ring opacity
  const ringOpacity = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.2),
    [-1, 1],
    [0.25, 0.75],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulsing ring scale
  const ringScale = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.2),
    [-1, 1],
    [1.0, 1.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const nameOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nameY = spring({
    frame: Math.max(0, frame - 20),
    fps,
    from: 16,
    to: 0,
    config: { damping: 16, stiffness: 80 },
  });

  const AVATAR_SIZE = 220;

  return (
    <div
      style={{
        width: "40%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        paddingTop: 72,
        paddingBottom: 72,
      }}
    >
      {/* Podcast logo above */}
      <div
        style={{
          opacity: nameOpacity,
          transform: `translateY(${-nameY}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${CONFIG.ACCENT}, ${CONFIG.ACCENT_SECONDARY})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: "#fff",
            margin: "0 auto",
          }}
        >
          {CONFIG.PODCAST_NAME[0]}D
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {CONFIG.PODCAST_NAME}
        </div>
      </div>

      {/* Avatar with glow ring */}
      <div
        style={{
          position: "relative",
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          transform: `scale(${scale})`,
        }}
      >
        {/* Outer glow ring */}
        <div
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${CONFIG.ACCENT}60 0%, transparent 70%)`,
            opacity: ringOpacity,
            transform: `scale(${ringScale})`,
          }}
        />
        {/* Animated border ring */}
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: `3px solid ${CONFIG.ACCENT}`,
            opacity: ringOpacity * 0.9,
            transform: `scale(${ringScale * 0.98})`,
          }}
        />
        {/* Avatar circle */}
        <div
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: "50%",
            background: `linear-gradient(145deg, #1f2937, #374151)`,
            border: `3px solid rgba(255,255,255,0.08)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Initials */}
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 80,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "-0.02em",
              userSelect: "none",
            }}
          >
            {CONFIG.SPEAKER_NAME.split(" ")
              .map((w) => w[0])
              .join("")}
          </span>
        </div>
      </div>

      {/* Speaker name + title */}
      <div
        style={{
          textAlign: "center",
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}
        >
          {CONFIG.SPEAKER_NAME}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 18,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {CONFIG.SPEAKER_TITLE}
        </div>
      </div>
    </div>
  );
};

// ─── WAVEFORM ─────────────────────────────────────────────────────────────────

const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const WAVEFORM_HEIGHT = 100;
  const BAR_WIDTH = 14;
  const BAR_GAP = 6;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: WAVEFORM_HEIGHT,
        gap: BAR_GAP,
        opacity,
      }}
    >
      {Array.from({ length: CONFIG.BAR_COUNT }).map((_, i) => {
        // Each bar oscillates with sin wave + unique phase offset per bar
        const phaseOffset = pseudoRandom(i * 13 + 7) * Math.PI * 2;
        const speedFactor = 0.6 + pseudoRandom(i * 5) * 1.2;
        const sinVal =
          Math.sin((frame / fps) * Math.PI * 2 * speedFactor + phaseOffset) *
          0.5 +
          0.5;
        const baseHeight = 0.1 + pseudoRandom(i * 3 + 1) * 0.3;
        const heightPct = baseHeight + sinVal * (1 - baseHeight);
        const barHeight = Math.max(6, heightPct * WAVEFORM_HEIGHT);

        // Color: taller bars get full accent, shorter bars are dimmer
        const barOpacity = 0.35 + heightPct * 0.65;

        return (
          <div
            key={i}
            style={{
              width: BAR_WIDTH,
              height: barHeight,
              borderRadius: 3,
              background: `linear-gradient(180deg, ${CONFIG.ACCENT} 0%, ${CONFIG.ACCENT_SECONDARY} 100%)`,
              opacity: barOpacity,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
};

// ─── QUOTE REVEAL ─────────────────────────────────────────────────────────────

const QuoteReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = CONFIG.QUOTE.split(" ");
  // Reveal one word every ~0.4 s, starting at frame 60 (2 s)
  const REVEAL_START = fps * 2;
  const FRAMES_PER_WORD = fps * 0.38;

  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 30,
        fontStyle: "italic",
        lineHeight: 1.5,
        color: "rgba(255,255,255,0.88)",
        letterSpacing: "0.01em",
      }}
    >
      {/* Opening quote mark */}
      <span
        style={{
          color: CONFIG.ACCENT,
          fontSize: 44,
          fontStyle: "normal",
          marginRight: 2,
          verticalAlign: "sub",
          lineHeight: 0,
        }}
      >
        "
      </span>
      {words.map((word, i) => {
        const startFrame = REVEAL_START + i * FRAMES_PER_WORD;
        const wordOpacity = interpolate(
          frame,
          [startFrame, startFrame + 10],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const wordY = interpolate(
          frame,
          [startFrame, startFrame + 14],
          [6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <span
            key={i}
            style={{
              opacity: wordOpacity,
              transform: `translateY(${wordY}px)`,
              display: "inline-block",
              marginRight: "0.28em",
            }}
          >
            {word}
          </span>
        );
      })}
      {/* Closing quote mark */}
      <span
        style={{
          color: CONFIG.ACCENT,
          fontSize: 44,
          fontStyle: "normal",
          marginLeft: 2,
          verticalAlign: "sub",
          lineHeight: 0,
          opacity: interpolate(
            frame,
            [
              REVEAL_START + (words.length - 1) * FRAMES_PER_WORD,
              REVEAL_START + words.length * FRAMES_PER_WORD,
            ],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        "
      </span>
    </div>
  );
};

// ─── CONTENT PANEL (right 60%) ────────────────────────────────────────────────

const ContentPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [5, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleX = spring({
    frame,
    fps,
    from: 40,
    to: 0,
    config: { damping: 16, stiffness: 80 },
  });

  return (
    <div
      style={{
        width: "60%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: 72,
        paddingBottom: 72,
        paddingRight: 72,
        gap: 40,
        borderLeft: `1px solid rgba(255,255,255,0.05)`,
        paddingLeft: 60,
      }}
    >
      {/* Episode title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: CONFIG.ACCENT,
              boxShadow: `0 0 10px ${CONFIG.ACCENT}`,
            }}
          />
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: CONFIG.ACCENT,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Now Playing
          </span>
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 38,
            color: "#ffffff",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {CONFIG.EPISODE_LABEL}
        </div>
      </div>

      {/* Waveform section */}
      <div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}
        >
          Live Audio
        </div>
        <Waveform />
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 80%)",
        }}
      />

      {/* Quote */}
      <div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 18,
          }}
        >
          Key Moment
        </div>
        <QuoteReveal />
      </div>
    </div>
  );
};

// ─── BACKGROUND ───────────────────────────────────────────────────────────────

const Background: React.FC = () => (
  <>
    {/* Base gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(160deg, ${CONFIG.BG_FROM} 0%, ${CONFIG.BG_TO} 100%)`,
      }}
    />
    {/* Left panel ambient glow */}
    <div
      style={{
        position: "absolute",
        top: "20%",
        left: "0%",
        width: "45%",
        height: "60%",
        background: `radial-gradient(ellipse at 30% 50%, ${CONFIG.ACCENT}18 0%, transparent 70%)`,
      }}
    />
    {/* Right panel ambient glow */}
    <div
      style={{
        position: "absolute",
        top: "30%",
        right: "0%",
        width: "50%",
        height: "50%",
        background: `radial-gradient(ellipse at 70% 50%, ${CONFIG.ACCENT_SECONDARY}10 0%, transparent 70%)`,
      }}
    />
  </>
);

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────

export const PodcastClip: React.FC = () => {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />

      {/* Top bar */}
      <TopBar />

      {/* Two-column layout */}
      <div
        style={{
          position: "absolute",
          top: 72,
          bottom: 72,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <AvatarPanel />
        <ContentPanel />
      </div>

      {/* Bottom bar */}
      <BottomBar />
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PodcastClip"
    component={PodcastClip}
    durationInFrames={CONFIG.DURATION_FRAMES}
    fps={CONFIG.FPS}
    width={CONFIG.WIDTH}
    height={CONFIG.HEIGHT}
  />
);
