import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    features: ["5 projects", "1 GB storage", "Community support"],
    highlighted: false,
    color: "#64748b",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: ["Unlimited projects", "50 GB storage", "Priority support", "API access"],
    highlighted: true,
    color: "#6366f1",
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    features: [
      "Everything in Pro",
      "500 GB storage",
      "Dedicated support",
      "SSO & audit logs",
      "Custom SLA",
    ],
    highlighted: false,
    color: "#64748b",
  },
];

const PlanCard: React.FC<{
  plan: (typeof PLANS)[number];
  index: number;
  frame: number;
  fps: number;
}> = ({ plan, index, frame, fps }) => {
  const delay = 15 + index * 12;
  const f = Math.max(0, frame - delay);
  const y = spring({ frame: f, fps, from: 60, to: 0, config: { damping: 14, stiffness: 100 } });
  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({
    frame: f,
    fps,
    from: 0.85,
    to: plan.highlighted ? 1.05 : 1,
    config: { damping: 14, stiffness: 100 },
  });

  // Features stagger
  const featureBase = delay + 15;

  return (
    <div
      style={{
        flex: 1,
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        borderRadius: 20,
        backgroundColor: plan.highlighted ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${plan.highlighted ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {plan.highlighted && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: -30,
            backgroundColor: plan.color,
            transform: "rotate(45deg)",
            padding: "4px 40px",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Popular
          </span>
        </div>
      )}
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 16,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {plan.name}
      </span>
      <div style={{ marginTop: 16, display: "flex", alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 48,
            color: "#ffffff",
          }}
        >
          {plan.price}
        </span>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 18,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {plan.period}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "rgba(255,255,255,0.06)",
          margin: "20px 0",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        {plan.features.map((feat, fi) => {
          const fOpacity = interpolate(
            Math.max(0, frame - (featureBase + fi * 5)),
            [0, 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={fi}
              style={{ display: "flex", alignItems: "center", gap: 10, opacity: fOpacity }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: `${plan.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 11, color: plan.color }}>✓</span>
              </div>
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {feat}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 24, width: "100%" }}>
        <div
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            backgroundColor: plan.highlighted ? plan.color : "rgba(255,255,255,0.06)",
            textAlign: "center",
            opacity: interpolate(Math.max(0, frame - (delay + 30)), [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: plan.highlighted ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          >
            Get Started
          </span>
        </div>
      </div>
    </div>
  );
};

export const PricingTable: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({ frame, fps, from: -20, to: 0, config: { damping: 14, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
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
          Choose your plan
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 110,
          left: 80,
          right: 80,
          bottom: 40,
          display: "flex",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {PLANS.map((plan, i) => (
          <PlanCard key={i} plan={plan} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
