export type CodeSegment = { type: "code"; text: string };
export type BlankSegment = { type: "blank"; key: string };
export type TemplateSegment = CodeSegment | BlankSegment;

const BLANK_RE = /\{\{(BLANK_[A-Za-z0-9_]+)\}\}/g;

export function splitTemplate(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  BLANK_RE.lastIndex = 0;
  while ((match = BLANK_RE.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "code", text: template.slice(lastIndex, match.index) });
    }
    segments.push({ type: "blank", key: match[1]! });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < template.length) {
    segments.push({ type: "code", text: template.slice(lastIndex) });
  }

  return segments;
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
  placeholder = "___"
): string {
  return template.replace(BLANK_RE, (_, key: string) => values[key]?.trim() || placeholder);
}
