import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Data ────────────────────────────────────────────────────────────────────

const HEADLINE = "How to Set Up a CI/CD Pipeline";
const SUBTITLE = "4 steps to automated deployments";

const STEPS: {
  num: number;
  title: string;
  desc: string;
  startFrame: number;
  accentColor: string;
}[] = [
  {
    num: 1,
    title: "Connect Your Repository",
    desc: "Link your GitHub, GitLab, or Bitbucket repo to your CI provider. Grant read access so the pipeline can listen for new commits.",
    startFrame: 15,
    accentColor: "#6366f1",
  },
  {
    num: 2,
    title: "Write the Pipeline Config",
    desc: "Add a .yml workflow file at the root of your repo. Define jobs for install, lint, test, and build in a sequential or parallel matrix.",
    startFrame: 60,
    accentColor: "#8b5cf6",
  },
  {
    num: 3,
    title: "Add Secrets & Environment Vars",
    desc: "Store API keys, tokens, and credentials as encrypted secrets in your CI dashboard. Reference them in the workflow as ${{ secrets.MY_KEY }}.",
    startFrame: 105,
    accentColor: "#06b6d4",
  },
  {
    num: 4,
    title: "Trigger & Deploy",
    desc: "Push to main or open a pull request to fire the pipeline. On success, the CD stage auto-deploys to staging or production.",
    startFrame: 150,
    accentColor: "#10b981",
  },
];

const DONE_START_FRAME = 185;
const TOTAL_FRAMES = 210;

// ─── GridOverlay ─────────────────────────────────────────────────────────────

const GridOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: "64px 64px",
      pointerEvents: "none",
    }}
  />
);

// ─── RadialGlow ──────────────────────────────────────────────────────────────

const RadialGlow: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse 900px 500px at 50% 110%, rgba(99,102,241,0.12) 0%, transparent 70%)",
      pointerEvents: "none",
    }}
  />
);

// ─── DottedConnector ─────────────────────────────────────────────────────────

interface DottedConnectorProps {
  /** 0–1 fill progress */
  progress: number;
  /** top of first badge → bottom of last badge, in px */
  totalHeight: number;
  left: number;
}

const DottedConnector: React.FC<DottedConnectorProps> = ({
  progress,
  totalHeight,
  left,
}) => {
  const filledHeight = totalHeight * Math.min(1, progress);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left,
        width: 2,
        height: totalHeight,
        overflow: "hidden",
      }}
    >
      {/* Unfilled track */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 4px, transparent 4px, transparent 12px)",
        }}
      />
      {/* Filled portion */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: filledHeight,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(99,102,241,0.9) 0px, rgba(99,102,241,0.9) 4px, transparent 4px, transparent 12px)",
        }}
      />
    </div>
  );
};

// ─── StepBadge ───────────────────────────────────────────────────────────────

interface StepBadgeProps {
  num: number;
  accentColor: string;
  revealed: boolean;
  frame: number;
  fps: number;
  startFrame: number;
}

const StepBadge: React.FC<StepBadgeProps> = ({
  num,
  accentColor,
  frame,
  fps,
  startFrame,
}) => {
  const f = Math.max(0, frame - startFrame);

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 180 },
  });

  const ringOpacity = interpolate(f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        backgroundColor: accentColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        position: "relative",
        flexShrink: 0,
        boxShadow: `0 0 0 8px ${accentColor}22, 0 4px 20px ${accentColor}55`,
      }}
    >
      {/* Outer ring pulse */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          border: `2px solid ${accentColor}`,
          opacity: ringOpacity * 0.4,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: "#ffffff",
          lineHeight: 1,
        }}
      >
        {num}
      </span>
    </div>
  );
};

// ─── StepCard ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: (typeof STEPS)[number];
  frame: number;
  fps: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, frame, fps }) => {
  const f = Math.max(0, frame - step.startFrame);

  const slideX = spring({
    frame: f,
    fps,
    from: -60,
    to: 0,
    config: { damping: 16, stiffness: 120 },
  });

  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const revealed = f > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 24,
        opacity,
        transform: `translateX(${slideX}px)`,
      }}
    >
      {/* Badge column */}
      <StepBadge
        num={step.num}
        accentColor={step.accentColor}
        revealed={revealed}
        frame={frame}
        fps={fps}
        startFrame={step.startFrame}
      />

      {/* Text column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingTop: 6,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#ffffff",
            lineHeight: 1.2,
            letterSpacing: -0.3,
          }}
        >
          {step.title}
        </span>
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            color: "rgba(255,255,255,0.50)",
            lineHeight: 1.55,
            maxWidth: 540,
          }}
        >
          {step.desc}
        </span>
      </div>

      {/* Accent line on the left of text */}
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 4,
          width: 2,
          height: 46,
          backgroundColor: step.accentColor,
          borderRadius: 2,
          opacity: 0.5,
        }}
      />
    </div>
  );
};

// ─── DoneBanner ──────────────────────────────────────────────────────────────

interface DoneBannerProps {
  frame: number;
  fps: number;
}

const DoneBanner: React.FC<DoneBannerProps> = ({ frame, fps }) => {
  const f = Math.max(0, frame - DONE_START_FRAME);

  const scale = spring({
    frame: f,
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  if (frame < DONE_START_FRAME) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 44,
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 12,
        backgroundColor: "rgba(16,185,129,0.12)",
        border: "1.5px solid rgba(16,185,129,0.5)",
        borderRadius: 40,
        padding: "12px 32px",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Check circle */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ display: "block" }}
        >
          <path
            d="M3 8l3.5 3.5L13 4"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#10b981",
          letterSpacing: 0.2,
        }}
      >
        All done! Your CI/CD pipeline is ready.
      </span>
    </div>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const HowToStepVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header entrance
  const headerOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const headerY = spring({
    frame,
    fps,
    from: -24,
    to: 0,
    config: { damping: 18, stiffness: 120 },
  });

  // Dotted line progress — starts drawing when step 1 appears, finishes when step 4 appears
  // Connector covers 3 gaps between 4 steps
  const BADGE_Y_TOP = 178; // y of first badge center
  const BADGE_SPACING = 100; // vertical spacing between step rows
  const connectorTotalHeight = BADGE_SPACING * 3; // 3 gaps
  const connectorStartFrame = STEPS[0].startFrame + 10;
  const connectorEndFrame = STEPS[3].startFrame + 10;
  const connectorProgress = interpolate(
    frame,
    [connectorStartFrame, connectorEndFrame],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d1117" }}>
      <GridOverlay />
      <RadialGlow />

      {/* ── Header ── */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 80,
          right: 80,
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}
      >
        {/* Category pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 20,
            padding: "4px 14px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#6366f1",
            }}
          />
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: 12,
              color: "#818cf8",
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            DevOps Guide
          </span>
        </div>

        <div>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: 38,
              color: "#ffffff",
              letterSpacing: -0.8,
              lineHeight: 1.15,
              display: "block",
            }}
          >
            {HEADLINE}
          </span>
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "rgba(255,255,255,0.42)",
              marginTop: 6,
              display: "block",
            }}
          >
            {SUBTITLE}
          </span>
        </div>
      </div>

      {/* ── Dotted connector (positioned absolutely behind cards) ── */}
      <div
        style={{
          position: "absolute",
          top: BADGE_Y_TOP,
          left: 106, // center of badge column (80 + 26)
        }}
      >
        <DottedConnector
          progress={connectorProgress}
          totalHeight={connectorTotalHeight}
          left={0}
        />
      </div>

      {/* ── Step Cards ── */}
      <div
        style={{
          position: "absolute",
          top: 152,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {STEPS.map((step) => (
          <div key={step.num} style={{ position: "relative" }}>
            <StepCard step={step} frame={frame} fps={fps} />
          </div>
        ))}
      </div>

      {/* ── Done Banner ── */}
      <DoneBanner frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// ─── Remotion Root ────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HowToStepVideo"
    component={HowToStepVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1280}
    height={720}
  />
);
