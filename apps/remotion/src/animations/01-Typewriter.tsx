/**
 * TECHNIQUE: Typewriter Effect
 *
 * How it works:
 * - `useCurrentFrame()` gives us the current frame number (starts at 0)
 * - We figure out how many characters to show based on the frame
 * - We slice the string to that length → letters appear one by one
 * - A separate Cursor component blinks using `frame % blinkInterval`
 *
 * Key rule: Always use string slicing for typewriter effects.
 * NEVER animate per-character opacity — it's much more expensive.
 *
 * To recreate this pattern:
 *   1. Pick a speed in frames-per-character (e.g. CHAR_FRAMES = 2)
 *   2. Compute typedCount = Math.floor(frame / CHAR_FRAMES)
 *   3. Render text.slice(0, typedCount)
 *   4. Optionally pause mid-text by checking a milestone index
 */

import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// --- Constants (tweak these to change the feel) ---
const FULL_TEXT = "Remotion makes video creation fun.";
const PAUSE_AFTER = "Remotion makes video"; // Text to pause at
const CHAR_FRAMES = 2; // Frames per character — lower = faster typing
const CURSOR_BLINK = 16; // Frames per blink cycle
const PAUSE_SECONDS = 0.8; // How long to pause mid-sentence

// --- Helper: compute how many characters to show at a given frame ---
const getTypedText = (
  frame: number,
  fullText: string,
  pauseAfter: string,
  charFrames: number,
  pauseFrames: number
): string => {
  // Find where the mid-pause happens (end of first sentence)
  const pauseIndex = fullText.indexOf(pauseAfter);
  const preLen = pauseIndex >= 0 ? pauseIndex + pauseAfter.length : fullText.length;

  let count = 0;
  if (frame < preLen * charFrames) {
    // Phase 1: typing up to the pause point
    count = Math.floor(frame / charFrames);
  } else if (frame < preLen * charFrames + pauseFrames) {
    // Phase 2: holding the pause (cursor still blinks)
    count = preLen;
  } else {
    // Phase 3: typing the remainder
    const postFrame = frame - preLen * charFrames - pauseFrames;
    count = Math.min(fullText.length, preLen + Math.floor(postFrame / charFrames));
  }

  return fullText.slice(0, count);
};

// --- Cursor: blinks by oscillating opacity with frame % blinkFrames ---
const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  // `frame % CURSOR_BLINK` resets to 0 every blink cycle
  // interpolate maps 0→half→full to opacity 1→0→1
  const opacity = interpolate(
    frame % CURSOR_BLINK,
    [0, CURSOR_BLINK / 2, CURSOR_BLINK],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <span style={{ opacity }}>▌</span>;
};

// --- Main composition ---
export const TypewriterAnimation: React.FC = () => {
  const frame = useCurrentFrame(); // Current frame from Remotion's timeline
  const { fps } = useVideoConfig(); // FPS from composition settings

  const pauseFrames = Math.round(fps * PAUSE_SECONDS);

  const typedText = getTypedText(frame, FULL_TEXT, PAUSE_AFTER, CHAR_FRAMES, pauseFrames);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f0f",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <p
        style={{
          color: "#e2e8f0",
          fontSize: 64,
          fontFamily: "monospace",
          fontWeight: 600,
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {typedText}
        <Cursor frame={frame} />
      </p>
    </AbsoluteFill>
  );
};
