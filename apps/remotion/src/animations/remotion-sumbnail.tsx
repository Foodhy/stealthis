import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const TITLE = "Build in Public";
const TAG = "Tutorial";
const ACCENT_COLOR = "#f59e0b";
const HOLD_START = 42; // all elements settled by this frame

export const Sumbnail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 12, stiffness: 200 } });
  const barScaleX = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle pulse after all elements have entered
  const holdFrame = Math.max(0, frame - HOLD_START);
  const pulse = 1 + Math.sin((holdFrame / fps) * Math.PI * 1.4) * 0.06;
  const glowOpacity = 0.25 + Math.sin((holdFrame / fps) * Math.PI * 1.4) * 0.2;

  const words = TITLE.split(" ");

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
        }}
      />

      {/* Ambient glow pulse */}
      {frame >= HOLD_START && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 30,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${ACCENT_COLOR}${Math.round(glowOpacity * 255)
              .toString(16)
              .padStart(2, "0")} 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tag badge */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 48,
          transform: `scale(${frame >= HOLD_START ? tagScale * pulse : tagScale})`,
          transformOrigin: "left top",
        }}
      >
        <div
          style={{
            backgroundColor: ACCENT_COLOR,
            borderRadius: 6,
            padding: "8px 20px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#000000",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {TAG}
        </div>
      </div>

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 48,
          width: 160,
          height: 5,
          backgroundColor: ACCENT_COLOR,
          borderRadius: 3,
          transformOrigin: "left center",
          transform: `scaleX(${barScaleX})`,
          boxShadow: frame >= HOLD_START ? `0 0 ${8 + glowOpacity * 12}px ${ACCENT_COLOR}` : "none",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 48,
          right: 320,
          display: "flex",
          flexWrap: "wrap",
          gap: "0 12px",
        }}
      >
        {words.map((word, i) => {
          const f = Math.max(0, frame - (5 + i * 6));
          const opacity = interpolate(f, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const translateY = spring({
            frame: f,
            fps,
            from: 20,
            to: 0,
            config: { damping: 14, stiffness: 120 },
          });
          return (
            <span
              key={i}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 88,
                color: "#ffffff",
                lineHeight: 1,
                letterSpacing: -3,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Image slot */}
      <div style={{ position: "absolute", right: 48, bottom: 0, width: 280, height: 520 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(180deg, ${ACCENT_COLOR}40 0%, ${ACCENT_COLOR}10 100%)`,
            borderRadius: "140px 140px 0 0",
            border: `2px solid ${ACCENT_COLOR}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Face / Image
            <br />
            Slot
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
