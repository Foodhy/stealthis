import type { BlankInteraction, CompleteChallenge } from "@schema";

export type ResolvedBlankInteraction = {
  key: string;
  mode: "select" | "type" | "bank" | "drag";
  options: string[];
  answer: string;
  size: number;
};

const CSS_DISTRACTORS = [
  "box-sizing",
  "display",
  "margin",
  "padding",
  "width",
  "height",
  "overflow",
  "flex",
  "grid",
  "position",
  "font-size",
  "color",
  "background",
  "border",
];

function isIdentifierAnswer(answer: string): boolean {
  return answer.length <= 24 && /^[a-zA-Z][a-zA-Z0-9-]*$/.test(answer);
}

function autoOptions(correct: string): string[] {
  const pool = CSS_DISTRACTORS.filter((p) => p !== correct);
  const picks = pool.slice(0, 3);
  return [correct, ...picks].sort(() => (correct.charCodeAt(0) % 3) - 1);
}

export function resolveBlankInteraction(
  key: string,
  answer: string,
  configured?: BlankInteraction
): ResolvedBlankInteraction {
  const size = Math.max(answer.length, 4);
  if (configured?.mode) {
    const options =
      configured.options && configured.options.length > 0
        ? configured.options.includes(answer)
          ? configured.options
          : [answer, ...configured.options]
        : autoOptions(answer);
    return { key, mode: configured.mode, options, answer, size };
  }

  if (isIdentifierAnswer(answer)) {
    return { key, mode: "select", options: autoOptions(answer), answer, size };
  }

  return { key, mode: "type", options: [], answer, size };
}

export function resolveAllBlanks(challenge: CompleteChallenge): ResolvedBlankInteraction[] {
  return Object.entries(challenge.answers).map(([key, answer]) =>
    resolveBlankInteraction(key, answer, challenge.interaction?.[key])
  );
}

export function hintForMode(mode: ResolvedBlankInteraction["mode"]): string {
  switch (mode) {
    case "select":
      return "Pick the missing value from the dropdown";
    case "bank":
      return "Tap a chip below to fill the blank";
    case "drag":
      return "Drag a chip into the blank slot";
    default:
      return "Type the missing value";
  }
}

export function usesWordBank(blanks: ResolvedBlankInteraction[]): boolean {
  return blanks.some((b) => b.mode === "bank" || b.mode === "drag");
}
