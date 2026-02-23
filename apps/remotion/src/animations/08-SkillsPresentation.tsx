/**
 * ANIMATION: "Skills.md — Teaching AI to Think"
 *
 * A 6-slide presentation explaining what skill files are and why they matter.
 *
 * TECHNIQUES USED (combined from previous examples):
 *   - <Series> + <Series.Sequence> for slide sequencing (04-Slideshow)
 *   - spring() entrance for titles and cards (02-SpringBounce)
 *   - Staggered word/item reveals (04-Slideshow)
 *   - Typewriter via string slicing (01-Typewriter)
 *   - interpolate() + Easing for progress bar (06-FadeSlide)
 *   - Counter for metrics (05-Counter)
 *
 * WHAT ARE SKILLS?
 *   Skills are markdown knowledge packages stored in .agents/skills/<name>/
 *   They give AI agents domain-specific expertise: rules, patterns, code examples.
 *   Without them, an agent gives generic answers.
 *   With them, it gives precise, project-aware guidance.
 */

import {
  AbsoluteFill,
  Easing,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─────────────────────────────────────────────
// SHARED DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  bg: "#07071a",
  surface: "#0f1035",
  border: "#1e2060",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  cyan: "#22d3ee",
  green: "#34d399",
  amber: "#fbbf24",
  muted: "#64748b",
  subtle: "#334155",
  text: "#f1f5f9",
  dim: "#94a3b8",
};

// ─────────────────────────────────────────────
// SHARED: slide title that springs in from the top
// ─────────────────────────────────────────────
const SlideTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        fontSize: 44,
        fontWeight: 700,
        color: C.text,
        fontFamily: "sans-serif",
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [-30, 0])}px)`,
        marginBottom: 48,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED: progress dots at the bottom
// ─────────────────────────────────────────────
const ProgressDots: React.FC<{ total: number; active: number }> = ({ total, active }) => {
  const dots = Array.from({ length: total }, (_, index) => ({
    id: `dot-${index + 1}`,
    index,
  }));

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {dots.map((dot) => (
        <div
          key={dot.id}
          style={{
            width: dot.index === active ? 28 : 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: dot.index === active ? C.indigo : C.subtle,
            transition: "none", // must NOT use CSS transitions — width is static per slide
          }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED: a full-screen slide wrapper
// ─────────────────────────────────────────────
const Slide: React.FC<{
  children: React.ReactNode;
  slideIndex: number;
  totalSlides: number;
}> = ({ children, slideIndex, totalSlides }) => (
  <AbsoluteFill
    style={{
      backgroundColor: C.bg,
      padding: "60px 100px",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {children}
    <ProgressDots total={totalSlides} active={slideIndex} />
  </AbsoluteFill>
);

const TOTAL = 6;

// ─────────────────────────────────────────────
// SLIDE 1 — Title card
// ─────────────────────────────────────────────
const Slide1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main title: spring scale + fade
  const titleP = spring({ frame, fps, config: { damping: 15, stiffness: 80 } }); // bouncy

  // Subtitle typewriter: reveal character by character
  const subtitle = "Teaching AI agents to think like experts.";
  const charCount = Math.floor(Math.max(0, frame - 20) / 2); // starts at frame 20, 2 frames/char
  const typedSubtitle = subtitle.slice(0, charCount);

  // Glowing badge pops in after the title
  const badgeP = spring({ frame: frame - 15, fps, config: { damping: 200 } });

  return (
    <Slide slideIndex={0} totalSlides={TOTAL}>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32 }}
      >
        {/* Skill badge */}
        <div
          style={{
            backgroundColor: C.surface,
            border: `2px solid ${C.indigo}`,
            borderRadius: 12,
            padding: "10px 24px",
            color: C.indigo,
            fontSize: 20,
            fontFamily: "monospace",
            opacity: badgeP,
            transform: `translateY(${interpolate(badgeP, [0, 1], [-20, 0])}px)`,
          }}
        >
          .agents/skills/
        </div>

        {/* Main title */}
        <h1
          style={{
            color: C.text,
            fontSize: 88,
            fontWeight: 800,
            fontFamily: "sans-serif",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.1,
            transform: `scale(${interpolate(titleP, [0, 1], [0.6, 1])})`,
            opacity: titleP,
          }}
        >
          Skills
          <span style={{ color: C.indigo }}>.md</span>
        </h1>

        {/* Typewriter subtitle */}
        <p
          style={{
            color: C.dim,
            fontSize: 28,
            fontFamily: "monospace",
            margin: 0,
            height: 40,
          }}
        >
          {typedSubtitle}
          <span
            style={{
              opacity: frame % 16 < 8 ? 1 : 0, // blink: manual frame-based toggle
              color: C.violet,
            }}
          >
            ▌
          </span>
        </p>
      </AbsoluteFill>
    </Slide>
  );
};

// ─────────────────────────────────────────────
// SLIDE 2 — What is a Skill?
// ─────────────────────────────────────────────
const WHAT_BULLETS = [
  { icon: "📦", text: "A packaged knowledge module for an AI agent", color: C.cyan },
  { icon: "📖", text: "Contains domain rules, patterns & code examples", color: C.green },
  { icon: "🎯", text: "Loaded on-demand when the task matches", color: C.amber },
  { icon: "🗂️", text: "Organized in .agents/skills/<name>/SKILL.md", color: C.violet },
];

const Slide2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Slide slideIndex={1} totalSlides={TOTAL}>
      <SlideTitle>
        <span style={{ color: C.cyan }}>◈</span> What is a Skill?
      </SlideTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {WHAT_BULLETS.map((b, i) => {
          // Each bullet staggered by 10 frames, slides in from left with spring
          const p = spring({
            frame: frame - i * 10,
            fps,
            config: { damping: 20, stiffness: 200 },
          });

          return (
            <div
              key={b.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "24px 32px",
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-80, 0])}px)`,
              }}
            >
              <span style={{ fontSize: 36 }}>{b.icon}</span>
              <span style={{ color: C.text, fontSize: 26, fontFamily: "sans-serif" }}>
                {b.text}
              </span>
              {/* Accent line grows in with the card */}
              <div
                style={{
                  marginLeft: "auto",
                  width: 4,
                  height: 40,
                  backgroundColor: b.color,
                  borderRadius: 2,
                  transform: `scaleY(${p})`,
                  transformOrigin: "top",
                }}
              />
            </div>
          );
        })}
      </div>
    </Slide>
  );
};

// ─────────────────────────────────────────────
// SLIDE 3 — File Structure (animated file tree)
// ─────────────────────────────────────────────
const FILE_TREE = [
  { indent: 0, name: ".agents/", color: C.dim, delay: 0 },
  { indent: 1, name: "skills/", color: C.dim, delay: 4 },
  { indent: 2, name: "remotion-best-practices/", color: C.amber, delay: 8 },
  { indent: 3, name: "SKILL.md", color: C.green, delay: 12, badge: "entry point" },
  { indent: 3, name: "rules/", color: C.dim, delay: 16 },
  { indent: 4, name: "animations.md", color: C.cyan, delay: 20, badge: "rule" },
  { indent: 4, name: "timing.md", color: C.cyan, delay: 24, badge: "rule" },
  { indent: 4, name: "charts.md", color: C.cyan, delay: 28, badge: "rule" },
  { indent: 4, name: "... 36 more rules", color: C.muted, delay: 32 },
];

const Slide3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Slide slideIndex={2} totalSlides={TOTAL}>
      <SlideTitle>
        <span style={{ color: C.amber }}>◈</span> File Structure
      </SlideTitle>

      <div
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          fontFamily: "monospace",
          fontSize: 24,
        }}
      >
        {FILE_TREE.map((node) => {
          const p = spring({
            frame: frame - node.delay,
            fps,
            config: { damping: 200 },
          });

          return (
            <div
              key={node.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingLeft: node.indent * 32,
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
              }}
            >
              {/* Tree connector */}
              {node.indent > 0 && (
                <span style={{ color: C.subtle }}>
                  {"│  ".repeat(node.indent - 1)}
                  {"└─ "}
                </span>
              )}
              {/* File/folder icon */}
              <span style={{ color: node.color }}>{node.name}</span>
              {/* Optional badge */}
              {"badge" in node && (
                <span
                  style={{
                    backgroundColor: `${node.color}22`,
                    color: node.color,
                    fontSize: 14,
                    padding: "2px 10px",
                    borderRadius: 6,
                    border: `1px solid ${node.color}44`,
                  }}
                >
                  {node.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Slide>
  );
};

// ─────────────────────────────────────────────
// SLIDE 4 — Inside SKILL.md (anatomy)
// ─────────────────────────────────────────────
const CODE_LINES = [
  { text: "---", color: C.muted },
  { text: "name: remotion-best-practices", color: C.cyan },
  { text: "description: Best practices for Remotion", color: C.green },
  { text: "metadata:", color: C.dim },
  { text: "  tags: remotion, video, react, animation", color: C.amber },
  { text: "---", color: C.muted },
  { text: "", color: C.dim },
  { text: "## When to use", color: C.violet },
  { text: "Use whenever working with Remotion code.", color: C.dim },
  { text: "", color: C.dim },
  { text: "## Rules", color: C.violet },
  { text: "- [animations.md] — Frame-driven animations", color: C.text },
  { text: "- [timing.md]     — spring() + Easing", color: C.text },
  { text: "- [charts.md]     — Bar, pie, line charts", color: C.text },
];
const CODE_LINES_WITH_ID = CODE_LINES.map((line, index) => ({ ...line, id: `line-${index}` }));

const Slide4: React.FC = () => {
  const frame = useCurrentFrame();

  // Reveal one line every 4 frames
  const visibleLines = Math.floor(frame / 4);

  return (
    <Slide slideIndex={3} totalSlides={TOTAL}>
      <SlideTitle>
        <span style={{ color: C.green }}>◈</span> Inside SKILL.md
      </SlideTitle>

      <div
        style={{
          backgroundColor: "#050510",
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "36px 48px",
          fontFamily: "monospace",
          fontSize: 22,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Fake editor dots */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: c }}
            />
          ))}
        </div>

        {CODE_LINES_WITH_ID.map((line, i) => {
          // Lines reveal progressively — opacity 0→1 as we reach that line index
          const opacity = interpolate(i, [visibleLines - 1, visibleLines], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const shown = i <= visibleLines;

          return (
            <div
              key={line.id}
              style={{
                color: line.color,
                opacity: shown ? (i === visibleLines ? opacity : 1) : 0,
                whiteSpace: "pre",
                lineHeight: 1.6,
              }}
            >
              {line.text || "\u200b" /* zero-width space to preserve empty line height */}
            </div>
          );
        })}
      </div>
    </Slide>
  );
};

// ─────────────────────────────────────────────
// SLIDE 5 — Without vs. With a Skill
// ─────────────────────────────────────────────
const Slide5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftP = spring({ frame, fps, config: { damping: 200 } });
  const rightP = spring({ frame: frame - 12, fps, config: { damping: 200 } });

  const vsScale = spring({ frame: frame - 6, fps, config: { damping: 8 } }); // bouncy

  return (
    <Slide slideIndex={4} totalSlides={TOTAL}>
      <SlideTitle>
        <span style={{ color: C.violet }}>◈</span> Without vs. With
      </SlideTitle>

      <div style={{ display: "flex", gap: 40, flex: 1 }}>
        {/* Without skill */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#1a0a0a",
            border: "1px solid #4b1515",
            borderRadius: 20,
            padding: "32px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            opacity: leftP,
            transform: `translateX(${interpolate(leftP, [0, 1], [-60, 0])}px)`,
          }}
        >
          <div
            style={{ color: "#f87171", fontSize: 22, fontWeight: 700, fontFamily: "sans-serif" }}
          >
            ✗ No skill loaded
          </div>
          <div style={{ color: C.muted, fontSize: 19, fontFamily: "sans-serif", lineHeight: 1.7 }}>
            "To animate in Remotion, you can use CSS animations or{" "}
            <span style={{ color: "#f87171" }}>transition: all 0.3s</span> on the element..."
          </div>
          <div
            style={{
              backgroundColor: "#2a0a0a",
              borderRadius: 10,
              padding: "12px 16px",
              color: "#fca5a5",
              fontSize: 17,
              fontFamily: "monospace",
            }}
          >
            ⚠ CSS transitions produce
            <br />⚠ flickering in rendered video
          </div>
        </div>

        {/* VS badge */}
        <div
          style={{
            width: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              color: C.dim,
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "sans-serif",
              transform: `scale(${vsScale})`,
            }}
          >
            VS
          </div>
        </div>

        {/* With skill */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#0a1a0a",
            border: "1px solid #154b15",
            borderRadius: 20,
            padding: "32px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            opacity: rightP,
            transform: `translateX(${interpolate(rightP, [0, 1], [60, 0])}px)`,
          }}
        >
          <div
            style={{ color: "#4ade80", fontSize: 22, fontWeight: 700, fontFamily: "sans-serif" }}
          >
            ✓ remotion-best-practices loaded
          </div>
          <div style={{ color: C.dim, fontSize: 19, fontFamily: "sans-serif", lineHeight: 1.7 }}>
            "CSS transitions are <span style={{ color: "#4ade80" }}>FORBIDDEN</span> in Remotion.
            Use <span style={{ color: C.cyan }}>interpolate(frame, ...)</span> driven by
            useCurrentFrame() instead:"
          </div>
          <div
            style={{
              backgroundColor: "#0a2a0a",
              borderRadius: 10,
              padding: "12px 16px",
              color: "#86efac",
              fontSize: 17,
              fontFamily: "monospace",
              lineHeight: 1.6,
            }}
          >
            {"const opacity = interpolate("}
            <br />
            {"  frame, [0, 30], [0, 1],"} <br />
            {"  { extrapolateRight: 'clamp' }"} <br />
            {");"}
          </div>
        </div>
      </div>
    </Slide>
  );
};

// ─────────────────────────────────────────────
// SLIDE 6 — Why It Matters (metrics + benefits)
// ─────────────────────────────────────────────
const BENEFITS = [
  { text: "Domain precision over generic answers", color: C.cyan },
  { text: "Prevents common mistakes before they happen", color: C.green },
  { text: "Modular: load only what the task needs", color: C.amber },
  { text: "Reusable across agents & sessions", color: C.violet },
];

const Slide6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate the rule count from 0 → 39
  const ruleCount = Math.round(
    interpolate(frame, [10, 2 * fps], [0, 39], {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const metricP = spring({ frame, fps, config: { damping: 200 } });

  return (
    <Slide slideIndex={5} totalSlides={TOTAL}>
      <SlideTitle>
        <span style={{ color: C.indigo }}>◈</span> Why It Matters
      </SlideTitle>

      <div style={{ display: "flex", gap: 48, flex: 1 }}>
        {/* Left: metric card */}
        <div
          style={{
            width: 260,
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexShrink: 0,
            opacity: metricP,
            transform: `scale(${interpolate(metricP, [0, 1], [0.8, 1])})`,
          }}
        >
          <span
            style={{
              color: C.indigo,
              fontSize: 80,
              fontFamily: "monospace",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {ruleCount}
          </span>
          <span
            style={{ color: C.dim, fontSize: 20, fontFamily: "sans-serif", textAlign: "center" }}
          >
            specialized rule files
          </span>
          <span style={{ color: C.muted, fontSize: 16, fontFamily: "monospace" }}>
            remotion-best-practices
          </span>
        </div>

        {/* Right: benefits list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          {BENEFITS.map((b, i) => {
            const p = spring({
              frame: frame - i * 8 - 8,
              fps,
              config: { damping: 20, stiffness: 200 },
            });

            return (
              <div
                key={b.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [50, 0])}px)`,
                }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: b.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: C.text, fontSize: 24, fontFamily: "sans-serif" }}>
                  {b.text}
                </span>
              </div>
            );
          })}

          {/* CTA */}
          {(() => {
            const p = spring({ frame: frame - 40, fps, config: { damping: 200 } });
            return (
              <div
                style={{
                  marginTop: 16,
                  backgroundColor: `${C.indigo}22`,
                  border: `1px solid ${C.indigo}`,
                  borderRadius: 14,
                  padding: "18px 28px",
                  color: C.indigo,
                  fontSize: 20,
                  fontFamily: "monospace",
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                }}
              >
                $ ls .agents/skills/remotion-best-practices/rules/
                <br />
                <span style={{ color: C.dim }}>animations.md timing.md charts.md ... +36 more</span>
              </div>
            );
          })()}
        </div>
      </div>
    </Slide>
  );
};

// ─────────────────────────────────────────────
// ROOT EXPORT — assembles all slides with <Series>
// ─────────────────────────────────────────────
export const SkillsPresentationAnimation: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <Series>
      {/* 3s — Title card with bouncy spring + typewriter */}
      <Series.Sequence durationInFrames={3 * fps} premountFor={fps}>
        <Slide1 />
      </Series.Sequence>

      {/* 3.5s — What is a skill? Staggered bullet cards */}
      <Series.Sequence durationInFrames={3.5 * fps} premountFor={fps}>
        <Slide2 />
      </Series.Sequence>

      {/* 4s — File tree reveals node by node */}
      <Series.Sequence durationInFrames={4 * fps} premountFor={fps}>
        <Slide3 />
      </Series.Sequence>

      {/* 4s — Code anatomy reveals line by line */}
      <Series.Sequence durationInFrames={4 * fps} premountFor={fps}>
        <Slide4 />
      </Series.Sequence>

      {/* 3.5s — Without vs With comparison */}
      <Series.Sequence durationInFrames={3.5 * fps} premountFor={fps}>
        <Slide5 />
      </Series.Sequence>

      {/* 4s — Why it matters: counter + benefits */}
      <Series.Sequence durationInFrames={4 * fps} premountFor={fps}>
        <Slide6 />
      </Series.Sequence>
    </Series>
  );
};
