/**
 * La página recreada: los recursos del catálogo vestidos con los tokens del
 * sitio escaneado.
 *
 * Cada bloque se pinta dentro de un iframe con `srcdoc` y `sandbox` vacío. Dos
 * motivos, y los dos importan:
 *
 *  · Aislamiento real. El CSS de un recurso del catálogo no puede escaparse y
 *    repintar la herramienta. Con un div normal, un `body { background: … }`
 *    del snippet se llevaría por delante la página entera.
 *  · Sin scripts. `sandbox=""` lo prohíbe todo, y aquí solo traemos HTML y CSS
 *    del catálogo, nunca su JS. Un recurso ajeno ejecutándose en nuestro origen
 *    no aporta nada a una vista previa.
 */

import DesignScanFontToggle from "@components/DesignScanFontToggle";
import DesignScanPreviewActions from "@components/DesignScanPreviewActions";
import { stripMcpSnippetHeader } from "@lib/codepen-prefill";
import { type FontMode, fontStack, googleFontsUrl } from "@lib/design-scan/fonts";
import type { MatchResult } from "@lib/design-scan/mcp";
import { applyTokens, buildPreviewDocument } from "@lib/design-scan/recreate";
import type { Frontmatter } from "@lib/design-scan/tokens";
import { SITE_URLS } from "@lib/urls";
import { useMemo, useState } from "react";

type Block = {
  component: string;
  slug: string;
  html: string;
  css: string;
  swaps: { from: string; to: string; reason: string }[];
  doc: string;
};

export default function DesignScanRecreate({
  front,
  matches,
  tokensCss,
}: {
  front: Frontmatter;
  matches: MatchResult;
  tokensCss: string;
}) {
  const [copied, setCopied] = useState("");
  const [showSwaps, setShowSwaps] = useState("");
  const [fontMode, setFontMode] = useState<FontMode>("system");
  const [loadWebfont, setLoadWebfont] = useState(false);

  const fontFamily = Object.values(front.typography ?? {}).find((t) => t.fontFamily)?.fontFamily;

  const blocks = useMemo<Block[]>(() => {
    const out: Block[] = [];
    const alreadyUsed = new Set<string>();

    for (const match of matches.matches) {
      const slug = match.candidates[0]?.slug;
      if (!slug) continue;
      // Las variantes hover apuntan al mismo recurso: se pinta una vez.
      if (alreadyUsed.has(slug)) continue;
      alreadyUsed.add(slug);

      const snippet = matches.snippets[slug];
      if (!snippet?.html) continue;

      const html = stripMcpSnippetHeader(snippet.html);
      const rawCss = stripMcpSnippetHeader(snippet.css ?? "");
      const { css, swaps } = applyTokens(rawCss, front, fontMode);
      out.push({
        component: match.component,
        slug,
        html,
        css,
        swaps,
        doc: buildPreviewDocument({
          html,
          css,
          tokensCss,
          baseFont: fontStack(fontFamily, fontMode),
          ...(fontMode === "extracted" && loadWebfont && fontFamily
            ? { fontHref: googleFontsUrl(fontFamily) }
            : {}),
        }),
      });
    }
    return out;
  }, [front, matches, tokensCss, fontMode, loadWebfont, fontFamily]);

  const copy = async (id: string) => {
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  if (blocks.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-white/10 p-5 text-xs text-slate-500">
        No catalog resource came back with markup to recreate. That is a result too: this page has
        no equivalent in the library yet.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
            Recreated with the catalog
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {blocks.length} resource{blocks.length === 1 ? "" : "s"} re-skinned with the tokens of{" "}
            {front.name}. Previews are sandboxed: no scripts, no styles escaping.
          </p>
        </div>

        <DesignScanFontToggle
          family={fontFamily}
          mode={fontMode}
          onMode={setFontMode}
          loadWebfont={loadWebfont}
          onLoadWebfont={setLoadWebfont}
        />
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <article key={block.slug} className="rounded-lg border border-white/[0.06] bg-black/20">
            <header className="flex flex-wrap items-center justify-between gap-2 border-white/[0.06] border-b px-3 py-2">
              <div className="min-w-0">
                <span className="font-mono text-[11px] text-slate-300">{block.component}</span>
                <span className="ml-2 font-mono text-[10px] text-slate-600">{block.slug}</span>
              </div>

              <DesignScanPreviewActions
                copiedId={copied}
                copyKey={block.slug}
                html={block.html}
                css={block.css}
                tokensCss={tokensCss}
                codepenTitle={`${block.slug} — ${front.name} tokens`}
                codepenDescription={`Re-skinned from ${front.name} · ${SITE_URLS.www}/r/${block.slug}`}
                resourceSlug={block.slug}
                onCopied={copy}
                showSwaps={
                  block.swaps.length > 0
                    ? {
                        count: block.swaps.length,
                        onToggle: () => setShowSwaps(showSwaps === block.slug ? "" : block.slug),
                      }
                    : undefined
                }
              />
            </header>

            {showSwaps === block.slug && (
              <ul className="space-y-1 border-white/[0.06] border-b px-3 py-2">
                {block.swaps.map((swap) => (
                  <li
                    key={`${swap.from}-${swap.to}`}
                    className="flex items-center gap-2 font-mono text-[10px] text-slate-500"
                  >
                    {swap.from.startsWith("#") && (
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm border border-white/10"
                        style={{ background: swap.from }}
                      />
                    )}
                    <span>{swap.from}</span>
                    <span className="text-slate-700">→</span>
                    {swap.to.startsWith("#") && (
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm border border-white/10"
                        style={{ background: swap.to }}
                      />
                    )}
                    <span>{swap.to}</span>
                    <span className="ml-auto text-slate-600">{swap.reason}</span>
                  </li>
                ))}
              </ul>
            )}

            <iframe
              title={`${block.component} recreated from ${block.slug}`}
              srcDoc={block.doc}
              sandbox=""
              loading="lazy"
              className="h-72 w-full rounded-b-lg bg-white"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
