// Normalize an element subtree to a canonical string for equality checks.
// - Lowercases tag names (already done by the DOM)
// - Sorts attributes alphabetically
// - Collapses whitespace in text nodes (trimmed; empty text nodes dropped)
// - Drops comment nodes
//
// This is intentionally strict enough to reject the user's broken HTML and
// lenient enough to ignore irrelevant whitespace/attr-order differences.

function normalize(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    return text;
  }
  if (node.nodeType === Node.COMMENT_NODE) return "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const attrs = Array.from(el.attributes)
    .map((a) => `${a.name}="${a.value}"`)
    .sort()
    .join(" ");
  const children = Array.from(el.childNodes)
    .map(normalize)
    .filter((s) => s !== "")
    .join("");
  return `<${tag}${attrs ? ` ${attrs}` : ""}>${children}</${tag}>`;
}

export function snapshot(root: Document | Element): string {
  const body = root instanceof Document ? root.body : root;
  if (!body) return "";
  return Array.from(body.childNodes)
    .map(normalize)
    .filter((s) => s !== "")
    .join("");
}

export function domEqual(a: Document | Element, b: Document | Element): boolean {
  return snapshot(a) === snapshot(b);
}
