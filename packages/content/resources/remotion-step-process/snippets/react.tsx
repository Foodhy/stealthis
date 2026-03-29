import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TITLE = "How it works";
const STEPS = [
  {
    num: 1,
    title: "Sign Up",
    desc: "Create your free account in seconds",
    icon: "📝",
    color: "#6366f1",
  },
  {
    num: 2,
    title: "Configure",
    desc: "Set up your project and preferences",
    icon: "⚙️",
    color: "#8b5cf6",
  },
  {
    num: 3,
    title: "Build",
    desc: "Start building with our powerful tools",
    icon: "🔨",
    color: "#06b6d4",
  },
  {
    num: 4,
    title: "Ship",
    desc: "Deploy to production with one click",
    icon: "🚀",
    color: "#10b981",
  },
];

const Step: React.FC<{
  step: (typeof STEPS)[number];
  index: number;
  frame: number;
  fps: number;
  isLast: boolean;
}> = ({ step, index, frame, fps, isLast }) => {
  const delay = 20 + index * 25;
  const f = Math.max(0, frame - delay);
  const scale = spring({ frame: f, fps, from: 0, to: 1, config: { damping: 12, stiffness: 120 } });
  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = spring({ frame: f, fps, from: 30, to: 0, config: { damping: 14, stiffness: 100 } });

  // Connector line
  const lineProgress = spring({
    frame: Math.max(0, frame - (delay + 15)),
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 60 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        position: "relative",
      }}
    >
      {/* Step card */}
      <div
        style={{
          opacity,
          transform: `translateY(${y}px) scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Circle */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: `${step.color}15`,
            border: `2px solid ${step.color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 30 }}>{step.icon}</span>
          {/* Number badge */}
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: step.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "#fff",
              }}
            >
              {step.num}
            </span>
          </div>
        </div>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#ffffff",
          }}
        >
          {step.title}
        </span>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            maxWidth: 180,
            lineHeight: 1.4,
          }}
        >
          {step.desc}
        </span>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div
          style={{
            position: "absolute",
            top: 36,
            right: -40,
            width: 80,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 2,
              backgroundColor: step.color,
              flex: 1,
              transformOrigin: "left",
              transform: `scaleX(${lineProgress})`,
              opacity: 0.4,
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: `8px solid ${step.color}`,
              opacity: lineProgress * 0.4,
              marginLeft: -1,
            }}
          />
        </div>
      )}
    </div>
  );
};

export const StepProcess: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(99,102,241,0.06) 0%, transparent 60%)",
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
          transform: `scale(${titleScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 44,
            color: "#ffffff",
            letterSpacing: -1,
          }}
        >
          {TITLE}
        </span>
      </div>

      {/* Steps */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 80,
          right: 80,
          transform: "translateY(-10%)",
          display: "flex",
          gap: 16,
        }}
      >
        {STEPS.map((step, i) => (
          <Step
            key={i}
            step={step}
            index={i}
            frame={frame}
            fps={fps}
            isLast={i === STEPS.length - 1}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="StepProcess"
      component={StepProcess}
      durationInFrames={210}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
