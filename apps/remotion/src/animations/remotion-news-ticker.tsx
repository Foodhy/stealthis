import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const HEADLINE = "BREAKING";
const TICKER_ITEMS = [
  "Markets surge 2.4% on tech earnings beat",
  "New AI framework breaks performance records",
  "Global climate summit reaches historic agreement",
  "SpaceX announces Mars mission timeline update",
  "Quantum computing milestone: 1000 qubits achieved",
];
const ACCENT = "#dc2626";
const TICKER_SPEED = 2;

const TickerBar: React.FC<{ frame: number }> = ({ frame }) => {
  const offset = frame * TICKER_SPEED;
  const text = TICKER_ITEMS.join("  ●  ");
  const repeated = `${text}  ●  ${text}  ●  ${text}`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        backgroundColor: "rgba(0,0,0,0.9)",
        borderTop: `3px solid ${ACCENT}`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 140,
          backgroundColor: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 16,
            color: "#ffffff",
            letterSpacing: 2,
          }}
        >
          {HEADLINE}
        </span>
      </div>
      <div style={{ marginLeft: 150, whiteSpace: "nowrap", transform: `translateX(-${offset}px)` }}>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 16,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: 0.5,
          }}
        >
          {repeated}
        </span>
      </div>
    </div>
  );
};

const NewsCard: React.FC<{ index: number; frame: number; fps: number }> = ({
  index,
  frame,
  fps,
}) => {
  const delay = 20 + index * 25;
  const f = Math.max(0, frame - delay);
  const opacity = interpolate(f, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = spring({ frame: f, fps, from: 60, to: 0, config: { damping: 16, stiffness: 100 } });

  const exitStart = delay + 60;
  const exitOpacity = interpolate(frame, [exitStart, exitStart + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const item = TICKER_ITEMS[index];

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 100,
        right: 100,
        opacity: opacity * exitOpacity,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: ACCENT,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 12,
        }}
      >
        Top Story
      </div>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 42,
          color: "#ffffff",
          lineHeight: 1.2,
          letterSpacing: -1,
        }}
      >
        {item}
      </div>
      <div
        style={{ marginTop: 20, width: 60, height: 3, backgroundColor: ACCENT, borderRadius: 2 }}
      />
    </div>
  );
};

const TimeStamp: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const seconds = Math.floor(frame / 30);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div style={{ position: "absolute", top: 30, right: 40, opacity }}>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 14,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        LIVE
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: ACCENT,
            opacity: frame % 30 < 20 ? 1 : 0.3,
          }}
        />
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 16,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

export const NewsTicker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine which card is active
  const activeIndex = Math.min(Math.floor(frame / 85), TICKER_ITEMS.length - 1);

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f18" }}>
      {/* Background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(220,38,38,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Network logo */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 40,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          NEWS<span style={{ color: ACCENT }}>24</span>
        </div>
      </div>

      <TimeStamp frame={frame} />

      {/* Rotating headlines */}
      {TICKER_ITEMS.map((_, i) => (
        <NewsCard key={i} index={i} frame={frame} fps={fps} />
      ))}

      <TickerBar frame={frame} />
    </AbsoluteFill>
  );
};
