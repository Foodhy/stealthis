import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const NOTIFICATIONS = [
  {
    type: "success",
    icon: "✅",
    title: "Payment received",
    desc: "Invoice #1042 — $2,450.00",
    time: "Just now",
  },
  {
    type: "info",
    icon: "💬",
    title: "New comment",
    desc: "Sarah left a comment on your PR",
    time: "2m ago",
  },
  {
    type: "warning",
    icon: "⚠️",
    title: "Storage almost full",
    desc: "You've used 92% of your quota",
    time: "5m ago",
  },
  {
    type: "error",
    icon: "🔴",
    title: "Build failed",
    desc: "Pipeline #847 failed at deploy step",
    time: "8m ago",
  },
  {
    type: "success",
    icon: "🚀",
    title: "Deployed to production",
    desc: "v2.4.1 is now live",
    time: "12m ago",
  },
];

const TYPE_COLORS: Record<string, string> = {
  success: "#10b981",
  info: "#6366f1",
  warning: "#f59e0b",
  error: "#ef4444",
};

const Toast: React.FC<{
  notif: (typeof NOTIFICATIONS)[number];
  index: number;
  frame: number;
  fps: number;
}> = ({ notif, index, frame, fps }) => {
  const enterDelay = 15 + index * 20;
  const exitDelay = enterDelay + 60;
  const f = Math.max(0, frame - enterDelay);

  const x = spring({ frame: f, fps, from: 400, to: 0, config: { damping: 16, stiffness: 100 } });
  const opacity = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit slide
  const exitF = Math.max(0, frame - exitDelay);
  const exitX =
    exitF > 0
      ? spring({ frame: exitF, fps, from: 0, to: 400, config: { damping: 20, stiffness: 120 } })
      : 0;
  const exitOpacity =
    exitF > 0
      ? interpolate(exitF, [0, 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;

  const color = TYPE_COLORS[notif.type] || "#6366f1";

  // Progress bar shrinks over life
  const lifeProgress = interpolate(frame, [enterDelay, exitDelay], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translateX(${x + exitX}px)`,
        opacity: opacity * exitOpacity,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 380,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
            {notif.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#ffffff",
                }}
              >
                {notif.title}
              </span>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {notif.time}
              </span>
            </div>
            <div style={{ marginTop: 4 }}>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {notif.desc}
              </span>
            </div>
          </div>
        </div>
        <div style={{ height: 2, backgroundColor: "rgba(255,255,255,0.05)" }}>
          <div
            style={{
              width: `${lifeProgress * 100}%`,
              height: "100%",
              backgroundColor: color,
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const NotificationStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)",
        }}
      />

      <div style={{ position: "absolute", top: 40, left: 80, opacity: titleOpacity }}>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: "#ffffff",
          }}
        >
          Notifications
        </span>
        <div style={{ marginTop: 4 }}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Real-time toast system
          </span>
        </div>
      </div>

      {/* Stacked toasts */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 80,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {NOTIFICATIONS.map((notif, i) => (
          <Toast key={i} notif={notif} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NotificationStack"
      component={NotificationStack}
      durationInFrames={210}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
