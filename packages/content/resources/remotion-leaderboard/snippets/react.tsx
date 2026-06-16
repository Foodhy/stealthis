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
const BG_COLOR = "#0a0a0f";

const GOLD   = "#f59e0b";
const SILVER = "#94a3b8";
const BRONZE = "#f97316";

const RANK_COLORS: Record<number, string> = {
  1: GOLD,
  2: SILVER,
  3: BRONZE,
};

const RANK_MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

// ── Data ──────────────────────────────────────────────────────────────────────
interface Player {
  id: string;
  initials: string;
  name: string;
  score: number;
  avatarColor: string;
}

const PLAYERS: Player[] = [
  { id: "p1", initials: "XN", name: "Xera Nova",      score: 98450, avatarColor: "#6366f1" },
  { id: "p2", initials: "KR", name: "Kaito Ryuu",     score: 87320, avatarColor: "#06b6d4" },
  { id: "p3", initials: "ZV", name: "Zara Voss",      score: 75880, avatarColor: "#f97316" },
  { id: "p4", initials: "OB", name: "Orion Black",    score: 64150, avatarColor: "#10b981" },
  { id: "p5", initials: "PM", name: "Petra Malone",   score: 52740, avatarColor: "#8b5cf6" },
  { id: "p6", initials: "DS", name: "Dex Stroud",     score: 44390, avatarColor: "#ef4444" },
  { id: "p7", initials: "YC", name: "Yuna Crane",     score: 33810, avatarColor: "#38bdf8" },
  { id: "p8", initials: "LE", name: "Luca Everett",   score: 21560, avatarColor: "#ec4899" },
];

// Pre-sorted descending by score
const SORTED_PLAYERS = [...PLAYERS].sort((a, b) => b.score - a.score);
const MAX_SCORE = SORTED_PLAYERS[0].score;

// Animation timing constants
const TITLE_IN_END      = 20;  // title fades in
const ROW_STAGGER       = 20;  // frames between each row sliding in
const ROW_SLIDE_DURATION = 22; // frames for one row to complete slide
const FIRST_ROW_START   = 25;  // frame at which first row starts entering
const ALL_ROWS_DONE     = FIRST_ROW_START + ROW_STAGGER * (SORTED_PLAYERS.length - 1) + ROW_SLIDE_DURATION;
// ALL_ROWS_DONE ≈ 25 + 140 + 22 = 187
const SHIMMER_START     = ALL_ROWS_DONE + 5; // shimmer starts after all rows visible
// SHIMMER_START ≈ 192, well within 210 frames

// ── Sub-components ────────────────────────────────────────────────────────────

interface ScoreBarProps {
  score: number;
  maxScore: number;
  color: string;
  rowEnterFrame: number; // frame at which this row started entering
  frame: number;
  fps: number;
  isFirst: boolean;
}

const ScoreBar: React.FC<ScoreBarProps> = ({
  score,
  maxScore,
  color,
  rowEnterFrame,
  frame,
  fps,
  isFirst,
}) => {
  const BAR_MAX_WIDTH = 480;
  const targetFraction = score / maxScore;

  // Bar fills with spring physics once the row has slid in
  const barFrame = Math.max(0, frame - (rowEnterFrame + ROW_SLIDE_DURATION - 4));
  const widthFraction = spring({
    frame: barFrame,
    fps,
    from: 0,
    to: targetFraction,
    config: { damping: 22, stiffness: 100, mass: 0.9 },
  });

  const filledWidth = widthFraction * BAR_MAX_WIDTH;

  // Score count-up: animate from 0 to score over same window
  const countFrame = Math.max(0, frame - rowEnterFrame);
  const countProgress = spring({
    frame: countFrame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 80, mass: 1.0 },
  });
  const displayScore = Math.round(score * countProgress);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
      {/* Bar track */}
      <div
        style={{
          width: BAR_MAX_WIDTH,
          height: 14,
          borderRadius: 7,
          backgroundColor: "rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: filledWidth,
            borderRadius: 7,
            background: isFirst
              ? `linear-gradient(90deg, ${GOLD}aa 0%, ${GOLD} 60%, #fde68a 100%)`
              : `linear-gradient(90deg, ${color}99 0%, ${color} 100%)`,
            boxShadow: isFirst ? `0 0 14px ${GOLD}88` : `0 0 8px ${color}55`,
          }}
        />
        {/* Shine */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            height: "45%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%)",
            borderRadius: "7px 7px 0 0",
          }}
        />
      </div>

      {/* Score label */}
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: isFirst ? GOLD : "rgba(255,255,255,0.75)",
          letterSpacing: "-0.3px",
          minWidth: 64,
          textAlign: "right",
        }}
      >
        {displayScore.toLocaleString()}
      </div>
    </div>
  );
};

// ── Single Row ────────────────────────────────────────────────────────────────

interface LeaderRowProps {
  player: Player;
  rank: number;
  rowIndex: number;
  frame: number;
  fps: number;
  shimmerFrame: number;
}

const LeaderRow: React.FC<LeaderRowProps> = ({
  player,
  rank,
  rowIndex,
  frame,
  fps,
  shimmerFrame,
}) => {
  const rowEnterFrame = FIRST_ROW_START + rowIndex * ROW_STAGGER;
  const localFrame = Math.max(0, frame - rowEnterFrame);

  // Slide in from right
  const slideX = interpolate(
    localFrame,
    [0, ROW_SLIDE_DURATION],
    [320, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const rowOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isTop3 = rank <= 3;
  const rowColor = RANK_COLORS[rank] ?? "rgba(255,255,255,0.55)";
  const isFirst = rank === 1;

  // Gold glow for #1
  const glowOpacity = isFirst
    ? interpolate(localFrame, [ROW_SLIDE_DURATION, ROW_SLIDE_DURATION + 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Shimmer across #1 row (18 frames → finishes at frame 192+18=210, exactly on budget)
  const shimmerProgress = isFirst
    ? interpolate(shimmerFrame, [0, 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 0;
  const shimmerX = interpolate(shimmerProgress, [0, 1], [-300, 960]);

  return (
    <div
      style={{
        transform: `translateX(${slideX}px)`,
        opacity: rowOpacity,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px 0 20px",
        height: 60,
        borderRadius: 12,
        backgroundColor: isFirst
          ? "rgba(245,158,11,0.07)"
          : "rgba(255,255,255,0.03)",
        border: isFirst
          ? "1px solid rgba(245,158,11,0.2)"
          : "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
        boxShadow: isFirst ? `0 0 28px rgba(245,158,11,${glowOpacity * 0.18})` : "none",
      }}
    >
      {/* Gold shimmer sweep for #1 */}
      {isFirst && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: shimmerX,
            width: 120,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(253,230,138,0.18) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Rank + medal */}
      <div
        style={{
          width: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4,
          flexShrink: 0,
        }}
      >
        {isTop3 ? (
          <span style={{ fontSize: 22, lineHeight: 1 }}>{RANK_MEDALS[rank]}</span>
        ) : (
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "-0.5px",
            }}
          >
            #{rank}
          </span>
        )}
      </div>

      {/* Avatar circle */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: player.avatarColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: isFirst
            ? `0 0 12px ${player.avatarColor}88`
            : `0 0 6px ${player.avatarColor}55`,
          border: isFirst
            ? `2px solid ${GOLD}66`
            : "2px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: "#fff",
            letterSpacing: "0.3px",
          }}
        >
          {player.initials}
        </span>
      </div>

      {/* Name */}
      <div
        style={{
          width: 136,
          flexShrink: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: isFirst ? 700 : 600,
          fontSize: 15,
          color: isFirst ? "#fde68a" : isTop3 ? rowColor : "rgba(255,255,255,0.85)",
          letterSpacing: "-0.2px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {player.name}
      </div>

      {/* Score bar + value */}
      <ScoreBar
        score={player.score}
        maxScore={MAX_SCORE}
        color={player.avatarColor}
        rowEnterFrame={rowEnterFrame}
        frame={frame}
        fps={fps}
        isFirst={isFirst}
      />
    </div>
  );
};

// ── Title ─────────────────────────────────────────────────────────────────────

const TitleBlock: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, TITLE_IN_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const translateY = interpolate(frame, [0, TITLE_IN_END], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 34,
          color: "#ffffff",
          letterSpacing: "-0.8px",
          lineHeight: 1,
        }}
      >
        Weekly Leaderboard
      </div>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "rgba(255,255,255,0.4)",
          marginTop: 8,
          letterSpacing: "0.4px",
          textTransform: "uppercase",
        }}
      >
        Global Rankings · Season 7
      </div>
    </div>
  );
};

// ── Column Headers ────────────────────────────────────────────────────────────

const ColumnHeaders: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [TITLE_IN_END, TITLE_IN_END + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px 0 20px",
        marginBottom: 10,
      }}
    >
      <div style={{ width: 44 }} />
      <div style={{ width: 36 }} />
      <div
        style={{
          width: 136,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          fontSize: 11,
          color: "rgba(255,255,255,0.28)",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        Player
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 480,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: "rgba(255,255,255,0.28)",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Score
        </div>
        <div
          style={{
            minWidth: 64,
            textAlign: "right",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            color: "rgba(255,255,255,0.28)",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Points
        </div>
      </div>
    </div>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────

export const Leaderboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global background fade in
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shimmer runs from SHIMMER_START for 30 frames
  const shimmerFrame = Math.max(0, frame - SHIMMER_START);

  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR, overflow: "hidden" }}>
      {/* Background radial glows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(99,102,241,0.07) 0%, rgba(245,158,11,0.04) 50%, transparent 75%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 300,
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)",
          opacity: bgOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Content container */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 120,
          right: 120,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TitleBlock frame={frame} />
        <ColumnHeaders frame={frame} />

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SORTED_PLAYERS.map((player, i) => (
            <LeaderRow
              key={player.id}
              player={player}
              rank={i + 1}
              rowIndex={i}
              frame={frame}
              fps={fps}
              shimmerFrame={shimmerFrame}
            />
          ))}
        </div>
      </div>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 120,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 11,
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.6px",
          opacity: bgOpacity,
        }}
      >
        FICTIONAL DATA · STEALTHIS
      </div>
    </AbsoluteFill>
  );
};

// ── Remotion Root ─────────────────────────────────────────────────────────────
export const RemotionRoot: React.FC = () => (
  <Composition
    id="Leaderboard"
    component={Leaderboard}
    durationInFrames={210}
    fps={30}
    width={1280}
    height={720}
  />
);
