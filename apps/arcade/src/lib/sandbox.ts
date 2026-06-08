// Build a self-contained HTML document for an iframe srcdoc.
// We assume `body` already contains the user's full HTML fragment.
export function buildSrcdoc(body: string, opts: { css?: string; js?: string } = {}): string {
  const css = opts.css ?? "";
  const js = opts.js ?? "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;font-family:system-ui,sans-serif;color:#0a0a0a;background:#fff;padding:8px}${css}</style></head><body>${body}<script>${js}<\/script></body></html>`;
}

// Recommended sandbox attribute for the preview iframe.
// allow-scripts only — no same-origin, no top navigation, no forms, no popups.
export const IFRAME_SANDBOX = "allow-scripts";
