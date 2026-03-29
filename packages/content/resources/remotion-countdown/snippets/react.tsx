import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const EVENT_NAME = "Product Launch";
const EVENT_DATE = "March 30, 2026";
const ACCENT = "#ef4444";
const TOTAL_SECONDS = 7;

const Digit: React.FC<{
  value: number;
  label: string;
  frame: number;
  fps: number;
  delay: number;
}> = ({ value, label, frame, fps, delay }) => {
  const f = Math.max(0, frame - delay);
  const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 12, stiffness: 100 } });
  const display = String(value).padStart(2, "0");

  // Pulse when value changes
  const pulseFrame = frame % 30;
  const pulse =
    pulseFrame < 5
      ? interpolate(pulseFrame, [0, 3, 5], [1, 1.05, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 140,
          height: 140,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pulse})`,
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontWeight: 800,
            fontSize: 64,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          {display}
        </span>
        {/* Divider line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {label}
      </span>
    </div>
  );
};

const Separator: React.FC<{ frame: number; delay: number }> = ({ frame, delay }) => {
  const opacity = interpolate(Math.max(0, frame - delay), [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blink = frame % 30 < 15 ? 1 : 0.3;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
        opacity: opacity * blink,
        paddingTop: 20,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: ACCENT }} />
      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: ACCENT }} />
    </div>
  );
};

export const CountdownVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const remainingSeconds = Math.max(0, TOTAL_SECONDS - frame / fps);
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = Math.floor(remainingSeconds % 60);

  // Use fixed display values for visual effect
  const displayDays = 12;
  const displayHours = 8;
  const displayMinutes = 45;
  const displaySeconds = Math.max(0, 30 - Math.floor(frame / fps));

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({ frame, fps, from: -30, to: 0, config: { damping: 14, stiffness: 80 } });

  const dateOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowOpacity = interpolate(frame, [0, 40], [0, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 900,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${ACCENT}25 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: glowOpacity,
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
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
            fontWeight: 800,
            fontSize: 48,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          {EVENT_NAME}
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 20,
            color: ACCENT,
            marginTop: 8,
            opacity: dateOpacity,
          }}
        >
          {EVENT_DATE}
        </div>
      </div>

      {/* Countdown digits */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          marginTop: 30,
        }}
      >
        <Digit value={displayDays} label="Days" frame={frame} fps={fps} delay={10} />
        <Separator frame={frame} delay={14} />
        <Digit value={displayHours} label="Hours" frame={frame} fps={fps} delay={16} />
        <Separator frame={frame} delay={20} />
        <Digit value={displayMinutes} label="Minutes" frame={frame} fps={fps} delay={22} />
        <Separator frame={frame} delay={26} />
        <Digit value={displaySeconds} label="Seconds" frame={frame} fps={fps} delay={28} />
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CountdownVideo"
    component={CountdownVideo}
    durationInFrames={210}
    fps={30}
    width={1280}
    height={720}
  />
);
