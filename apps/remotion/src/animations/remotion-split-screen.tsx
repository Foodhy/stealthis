import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const BEFORE_LABEL = "Before";
const AFTER_LABEL = "After";
const TITLE = "Design Refresh";
const ACCENT = "#10b981";

const MockCard: React.FC<{ modern: boolean }> = ({ modern }) => {
  if (!modern) {
    return (
      <div
        style={{
          width: 280,
          padding: 24,
          backgroundColor: "#d4d4d4",
          border: "2px solid #999",
          fontFamily: "serif",
        }}
      >
        <div style={{ width: 240, height: 120, backgroundColor: "#bbb", marginBottom: 12 }} />
        <div
          style={{
            fontFamily: "Times New Roman, serif",
            fontSize: 18,
            color: "#333",
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Old Design
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            backgroundColor: "#ccc",
            marginBottom: 6,
            borderRadius: 0,
          }}
        />
        <div
          style={{
            width: "80%",
            height: 8,
            backgroundColor: "#ccc",
            marginBottom: 6,
            borderRadius: 0,
          }}
        />
        <div style={{ width: "60%", height: 8, backgroundColor: "#ccc", borderRadius: 0 }} />
        <div
          style={{
            marginTop: 16,
            padding: "8px 16px",
            backgroundColor: "#666",
            color: "#fff",
            fontFamily: "serif",
            fontSize: 14,
            display: "inline-block",
          }}
        >
          Click Here
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 280,
        padding: 24,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          width: 240,
          height: 120,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${ACCENT}40, #6366f140)`,
          marginBottom: 16,
        }}
      />
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 18,
          color: "#ffffff",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        New Design
      </div>
      <div
        style={{
          width: "100%",
          height: 6,
          backgroundColor: "rgba(255,255,255,0.1)",
          marginBottom: 6,
          borderRadius: 3,
        }}
      />
      <div
        style={{
          width: "80%",
          height: 6,
          backgroundColor: "rgba(255,255,255,0.1)",
          marginBottom: 6,
          borderRadius: 3,
        }}
      />
      <div
        style={{
          width: "60%",
          height: 6,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 3,
        }}
      />
      <div
        style={{
          marginTop: 16,
          padding: "10px 20px",
          backgroundColor: ACCENT,
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 8,
          display: "inline-block",
        }}
      >
        Get Started
      </div>
    </div>
  );
};

export const SplitScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Split line animates from left to center
  const splitPos = spring({
    frame: Math.max(0, frame - 15),
    fps,
    from: 0,
    to: 0.5,
    config: { damping: 20, stiffness: 60 },
  });

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = spring({
    frame,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 14, stiffness: 100 },
  });

  const labelOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const beforeOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const afterOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f", opacity: fadeOut }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 40,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          {TITLE}
        </span>
      </div>

      {/* Before side */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${splitPos * 100}%`,
          height: "100%",
          backgroundColor: "#e8e8e8",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ opacity: beforeOpacity }}>
          <MockCard modern={false} />
        </div>
        <div style={{ position: "absolute", top: 100, left: 20, opacity: labelOpacity }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {BEFORE_LABEL}
          </span>
        </div>
      </div>

      {/* After side */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${(1 - splitPos) * 100}%`,
          height: "100%",
          backgroundColor: "#0a0a0f",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ opacity: afterOpacity }}>
          <MockCard modern />
        </div>
        <div style={{ position: "absolute", top: 100, right: 20, opacity: labelOpacity }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: ACCENT,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {AFTER_LABEL}
          </span>
        </div>
      </div>

      {/* Split line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${splitPos * 100}%`,
          width: 3,
          backgroundColor: ACCENT,
          zIndex: 10,
          boxShadow: `0 0 20px ${ACCENT}80`,
        }}
      >
        {/* Handle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 20px ${ACCENT}60`,
          }}
        >
          <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 16, color: "#fff" }}>
            ↔
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
