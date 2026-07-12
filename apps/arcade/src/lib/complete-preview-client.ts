import { fillTemplate } from "./complete-segments";
import { buildSrcdoc, parseSrcdocFragments } from "./sandbox";
import { collectBlankValues } from "./challenge-wire";

export function refreshCompletePreview(slide: HTMLElement): void {
  const iframe = slide.querySelector<HTMLIFrameElement>("[data-preview-iframe]");
  const template = slide.dataset.template;
  if (!iframe || !template) return;

  const values = collectBlankValues(slide);
  const filled = fillTemplate(template, values, "/* missing */");
  const previewBody = slide.dataset.previewBody ?? "";
  const isHtml = template.trim().startsWith("<") || filled.includes("<");

  if (previewBody) {
    iframe.srcdoc = buildSrcdoc(`<style>${filled}</style>${previewBody}`);
    return;
  }

  if (isHtml) {
    const fragments = parseSrcdocFragments(filled);
    iframe.srcdoc = buildSrcdoc(fragments.html, { css: fragments.css, js: fragments.js });
    return;
  }

  iframe.srcdoc = buildSrcdoc("", { css: filled });
}

export function wireCompletePreview(slide: HTMLElement, onValuesChange: () => void): void {
  slide.addEventListener("arcade:preview-refresh", () => refreshCompletePreview(slide));
  onValuesChange();
}
