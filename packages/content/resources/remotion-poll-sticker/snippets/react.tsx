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
  question: "Which framework do you use?",
  questionLabel: "QUESTION 2 of 3",
  totalVotes: "12,847 votes",
  cardWidth: 860,
  cardPaddingX: 56,
  cardPaddingY: 52,
  barHeight: 52,
  barRadius: 26,
  barStartFrame: 30,
  votesAppearFrame: 90,
  bgFrom: "#0d0d2b",
  bgTo: "#1a0533",
  cardBg: "rgba(15,10,40,0.82)",
  cardBorder: "rgba(255,255,255,0.10)",
  accentWinner: "#3b82f6",
  accentLoser: "#22c55e",
};

const OPTIONS: Array<{
  label: string;
  emoji: string;
  pct: number;
  color: string;
  isWinner: boolean;
  barDelay: number;
}> = [
  {
    label: "React",
    emoji: "🔵",
    pct: 68,
    color: "#3b82f6",
    isWinner: true,
    barDelay: CONFIG.barStartFrame,
  },
  {
    label: "Vue",
    emoji: "💚",
    pct: 32,
    color: "#22c55e",
    isWinner: false,
    barDelay: CONFIG.barStartFrame + 20,
  },
];

// ─── ANIMATED BAR ROW ─────────────────────────────────────────────────────────
const OptionRow: React.FC<{
  option: (typeof OPTIONS)[number];
  frame: number;
  fps: number;
  cardWidth: number;
}> = ({ option, frame, fps, cardWidth }) => {
  const barMaxWidth = cardWidth - CONFIG.cardPaddingX * 2;
  const localF = Math.max(0, frame - option.barDelay);

  const barFill = spring({
    frame: localF,
    fps,
    from: 0,
    to: option.pct / 100,
    config: { damping: 18, stiffness: 80 },
  });

  const rowEntrance = spring({
    frame: Math.max(0, frame - (option.barDelay - 10)),
    fps,
    from: 30,
    to: 0,
    config: { damping: 20, stiffness: 120 },
  });

  const rowOpacity = interpolate(
    frame,
    [option.barDelay - 10, option.barDelay + 5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const displayPct = Math.round(barFill * option.pct);

  return (
    <div
      style={{
        transform: `translateY(${rowEntrance}px)`,
        opacity: rowOpacity,
        marginBottom: 28,
      }}
    >
      {/* Row header: emoji + label + percentage */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>{option.emoji}</span>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: option.isWinner ? "#ffffff" : "rgba(255,255,255,0.80)",
              letterSpacing: "-0.01em",
            }}
          >
            {option.label}
          </span>
          {option.isWinner && (
            <div
              style={{
                backgroundColor: "rgba(59,130,246,0.20)",
                border: "1px solid rgba(59,130,246,0.50)",
                borderRadius: 20,
                padding: "3px 12px",
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#93c5fd",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                }}
              >
                Winner
              </span>
            </div>
          )}
        </div>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 30,
            color: option.isWinner ? option.color : "rgba(255,255,255,0.65)",
            minWidth: 60,
            textAlign: "right" as const,
          }}
        >
          {displayPct}%
        </span>
      </div>

      {/* Bar track */}
      <div
        style={{
          width: barMaxWidth,
          height: CONFIG.barHeight,
          borderRadius: CONFIG.barRadius,
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
          boxShadow: option.isWinner
            ? `0 0 0 1.5px ${option.color}66`
            : "none",
        }}
      >
        {/* Filled portion */}
        <div
          style={{
            width: `${barFill * 100}%`,
            height: "100%",
            borderRadius: CONFIG.barRadius,
            background: option.isWinner
              ? `linear-gradient(90deg, ${option.color}cc 0%, ${option.color} 100%)`
              : `linear-gradient(90deg, ${option.color}99 0%, ${option.color}cc 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shine overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)",
              borderRadius: CONFIG.barRadius,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
export const PollSticker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Card entrance
  const cardScale = spring({
    frame,
    fps,
    from: 0.88,
    to: 1,
    config: { damping: 16, stiffness: 100 },
  });
  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Question label entrance
  const labelY = spring({
    frame: Math.max(0, frame - 4),
    fps,
    from: -20,
    to: 0,
    config: { damping: 18, stiffness: 110 },
  });
  const labelOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Total votes fade-in
  const votesOpacity = interpolate(
    frame,
    [CONFIG.votesAppearFrame, CONFIG.votesAppearFrame + 18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const votesY = interpolate(
    frame,
    [CONFIG.votesAppearFrame, CONFIG.votesAppearFrame + 18],
    [10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 30%, #1e1060 0%, #0d0d2b 55%, #0a0012 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        style={{
          position: "absolute",
          top: height * 0.12,
          left: width * 0.1,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: height * 0.08,
          right: width * 0.08,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Question counter label */}
      <div
        style={{
          position: "absolute",
          top: height / 2 - 330,
          left: "50%",
          transform: `translateX(-50%) translateY(${labelY}px)`,
          opacity: labelOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
          }}
        >
          {CONFIG.questionLabel}
        </span>
      </div>

      {/* Poll card */}
      <div
        style={{
          width: CONFIG.cardWidth,
          backgroundColor: CONFIG.cardBg,
          borderRadius: 32,
          border: `1.5px solid ${CONFIG.cardBorder}`,
          padding: `${CONFIG.cardPaddingY}px ${CONFIG.cardPaddingX}px`,
          backdropFilter: "blur(24px)",
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          boxShadow:
            "0 8px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
          position: "relative",
        }}
      >
        {/* Question text */}
        <div style={{ marginBottom: 36 }}>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 34,
              color: "#ffffff",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              display: "block",
            }}
          >
            {CONFIG.question}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
            marginBottom: 32,
          }}
        />

        {/* Option rows */}
        {OPTIONS.map((option) => (
          <OptionRow
            key={option.label}
            option={option}
            frame={frame}
            fps={fps}
            cardWidth={CONFIG.cardWidth}
          />
        ))}

        {/* Total votes */}
        <div
          style={{
            marginTop: 8,
            opacity: votesOpacity,
            transform: `translateY(${votesY}px)`,
            textAlign: "center" as const,
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 22,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "0.01em",
            }}
          >
            {CONFIG.totalVotes}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── REMOTION ROOT ────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PollSticker"
      component={PollSticker}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
