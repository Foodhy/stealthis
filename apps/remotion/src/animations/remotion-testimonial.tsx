import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const QUOTE =
  "This product completely changed how our team works. The results speak for themselves.";
const AUTHOR_NAME = "Sarah Mitchell";
const AUTHOR_ROLE = "Head of Design, Acme Corp";
const STAR_COUNT = 5;
const BRAND_COLOR = "#f59e0b";

export const TestimonialVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const words = QUOTE.split(" ");

  const authorF = Math.max(0, frame - 105);
  const authorTX = spring({
    frame: authorF,
    fps,
    from: -40,
    to: 0,
    config: { damping: 14, stiffness: 100 },
  });
  const authorOpacity = interpolate(authorF, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${BRAND_COLOR}15 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          padding: "48px 56px",
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          opacity: cardOpacity,
        }}
      >
        {/* Stars */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {Array.from({ length: STAR_COUNT }).map((_, i) => {
            const scale = spring({
              frame: Math.max(0, frame - (90 + i * 8)),
              fps,
              from: 0,
              to: 1,
              config: { damping: 9, stiffness: 200, mass: 0.5 },
            });
            return (
              <div
                key={i}
                style={{
                  fontSize: 36,
                  transform: `scale(${scale})`,
                  filter: `drop-shadow(0 0 8px ${BRAND_COLOR})`,
                  color: BRAND_COLOR,
                }}
              >
                ★
              </div>
            );
          })}
        </div>

        {/* Quote */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 10px", marginBottom: 40 }}>
          <div
            style={{
              width: "100%",
              fontFamily: "Georgia, serif",
              fontSize: 80,
              color: BRAND_COLOR,
              opacity: 0.7,
              lineHeight: 0.7,
              marginBottom: 8,
            }}
          >
            "
          </div>
          {words.map((word, i) => {
            const wordOpacity = interpolate(Math.max(0, frame - (15 + i * 5)), [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span
                key={i}
                style={{
                  opacity: wordOpacity,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 30,
                  color: "#ffffff",
                  lineHeight: 1.6,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: authorOpacity,
            transform: `translateX(${authorTX}px)`,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: BRAND_COLOR,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#000000",
            }}
          >
            {AUTHOR_NAME.split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#ffffff",
              }}
            >
              {AUTHOR_NAME}
            </div>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginTop: 2,
              }}
            >
              {AUTHOR_ROLE}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
