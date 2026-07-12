export function buildSrcdoc(
  body: string,
  opts: { css?: string; js?: string; pickMode?: boolean } = {}
): string {
  const css = opts.css ?? "";
  const js = opts.js ?? "";
  const pickScript = opts.pickMode
    ? `
document.addEventListener('click', function(e) {
  var t = e.target;
  if (!t || t === document.body || t === document.documentElement) return;
  e.preventDefault();
  e.stopPropagation();
  parent.postMessage({
    type: 'arcade-pick',
    tag: t.tagName.toLowerCase(),
    id: t.id || '',
    className: typeof t.className === 'string' ? t.className : '',
    text: (t.textContent || '').trim().slice(0, 80)
  }, '*');
}, true);`
    : "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;font-family:system-ui,sans-serif;color:#0a0a0a;background:#fff;padding:8px}${css}</style></head><body>${body}<script>${js}${pickScript}<\/script></body></html>`;
}

export const IFRAME_SANDBOX = "allow-scripts";

export function parseSrcdocFragments(source: string): { html: string; css: string; js: string } {
  let html = source;
  let css = "";
  let js = "";

  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    css = styleMatch[1].trim();
    html = html.replace(styleMatch[0], "");
  }

  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    js = scriptMatch[1].trim();
    html = html.replace(scriptMatch[0], "");
  }

  return { html: html.trim(), css, js };
}
