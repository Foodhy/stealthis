/**
 * Abrir CodePen con prefill (mismo patrón que ActionMenu en /r/[slug]).
 */

export type CodePenPrefill = {
  title: string;
  description?: string;
  html: string;
  css: string;
  js?: string;
};

/** Quita el encabezado que añade get_snippet del MCP. */
export function stripMcpSnippetHeader(code: string): string {
  return code.replace(/^(\/\/[^\n]*\n)+/u, "").trimStart();
}

export function combinedHtmlCssCopy(html: string, css: string): string {
  return `<!-- HTML -->\n${html.trim()}\n\n/* CSS */\n${css.trim()}`;
}

export function openCodePenPrefill(prefill: CodePenPrefill): void {
  const payload = JSON.stringify({
    title: prefill.title,
    description: prefill.description ?? "",
    html: prefill.html,
    css: prefill.css,
    js: prefill.js ?? "",
    editors: prefill.js ? "111" : "101",
    layout: "top",
  });

  const form = document.createElement("form");
  form.action = "https://codepen.io/pen/define";
  form.method = "POST";
  form.target = "_blank";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "data";
  input.value = payload;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
