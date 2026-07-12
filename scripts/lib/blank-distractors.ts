const CSS_PROPERTY_POOLS: Record<string, string[]> = {
  box: ["box-sizing", "display", "margin", "padding", "width", "height", "overflow"],
  layout: ["display", "flex", "grid", "position", "top", "left", "gap", "align-items"],
  typography: ["font-size", "font-weight", "line-height", "letter-spacing", "color", "text-align"],
  visual: ["background", "border", "border-radius", "opacity", "box-shadow", "transform"],
};

const ALL_CSS = [...new Set(Object.values(CSS_PROPERTY_POOLS).flat())];

function poolForProperty(prop: string): string[] {
  for (const pool of Object.values(CSS_PROPERTY_POOLS)) {
    if (pool.includes(prop)) return pool;
  }
  return ALL_CSS;
}

export function buildSelectOptions(correct: string, count = 4): string[] {
  const pool = poolForProperty(correct).filter((p) => p !== correct);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, Math.max(1, count - 1));
  const options = [correct, ...distractors];
  return [...options].sort(() => Math.random() - 0.5);
}

export function isIdentifierAnswer(answer: string): boolean {
  return answer.length <= 24 && /^[a-zA-Z][a-zA-Z0-9-]*$/.test(answer);
}
