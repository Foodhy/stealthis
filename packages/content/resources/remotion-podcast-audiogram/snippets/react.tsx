import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const SHOW_NAME = "The Dev Show";
const EPISODE = "EP 42 · Building in Public";
const GUEST = "Jane Smith";
const BAR_COUNT = 40;
const ACCENT = "#8b5cf6";

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const WaveformBar: React.FC<{
  index: number;
  frame: number;
  total: number;
}> = ({ index, frame, total }) => {
  const noise = pseudoRandom(index * 7 + frame * 0.4);
  const base = 0.15 + noise * 0.85;
  const center = Math.abs(index - total / 2) / (total / 2);
  const heightPct = base * (1 - center * 0.4);
  const barWidth = 8;
  const gap = 4;

  return (
    <div
      style={{
        width: barWidth,
        height: `${heightPct * 100}%`,
        backgroundColor: ACCENT,
        borderRadius: 4,
        opacity: 0.6 + heightPct * 0.4,
        marginRight: gap,
        transition: "height 0.05s",
      }}
    />
  );
};

const ProgressBar: React.FC<{ frame: number; total: number }> = ({ frame, total }) => {
  const progress = interpolate(frame, [0, total], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const elapsed = Math.floor((frame / 30) * 1);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div style={{ position: "absolute", bottom: 80, left: 100, right: 100 }}>
      <div
        style={{
          height: 4,
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: ACCENT,
            borderRadius: 2,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {timeStr}
        </span>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          42:18
        </span>
      </div>
    </div>
  );
};

export const PodcastAudiogram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({
    frame,
    fps,
    from: -20,
    to: 0,
    config: { damping: 16, stiffness: 80 },
  });

  const waveOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const avatarScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* Subtle gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${ACCENT}12 0%, transparent 60%)`,
        }}
      />

      {/* Avatar */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: `translateX(-50%) scale(${avatarScale})`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${ACCENT}, #ec4899)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              color: "#fff",
            }}
          >
            {GUEST[0]}
          </span>
        </div>
      </div>

      {/* Show info */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 36,
            color: "#ffffff",
            marginBottom: 8,
          }}
        >
          {SHOW_NAME}
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {EPISODE}
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 18,
            color: ACCENT,
            marginTop: 6,
          }}
        >
          with {GUEST}
        </div>
      </div>

      {/* Waveform */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 100,
          right: 100,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: waveOpacity,
        }}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <WaveformBar key={i} index={i} frame={frame} total={BAR_COUNT} />
        ))}
      </div>

      <ProgressBar frame={frame} total={durationInFrames} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PodcastAudiogram"
    component={PodcastAudiogram}
    durationInFrames={300}
    fps={30}
    width={1280}
    height={720}
  />
);
