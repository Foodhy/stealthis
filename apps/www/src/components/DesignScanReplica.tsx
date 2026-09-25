/**
 * La página reconstruida.
 *
 * Va en un iframe con `sandbox=""` por lo mismo que la recreación de snippets:
 * sin scripts, y sin que el CSS de la réplica se escape a repintar la
 * herramienta que la muestra.
 *
 * Se enseña también lo que se limpió de la respuesta del modelo. El HTML y el
 * CSS son para copiar y pegar en un proyecto de verdad, y ahí ya no hay sandbox
 * que los contenga: quien se los lleve merece saber qué se quitó.
 */

import DesignScanFontToggle from "@components/DesignScanFontToggle";
import DesignScanPreviewActions from "@components/DesignScanPreviewActions";
import { type FontMode, fontStack, googleFontsUrl } from "@lib/design-scan/fonts";
import { buildPreviewDocument } from "@lib/design-scan/recreate";
import type { Replica } from "@lib/design-scan/replica";
import { useMemo, useState } from "react";

export default function DesignScanReplica({
  replica,
  tokensCss,
  siteName,
  fontFamily,
}: {
  replica: Replica;
  /** Se recibe ya construido por modo de fuente: las variables --font-* cambian. */
  tokensCss: string;
  siteName: string;
  fontFamily: string | undefined;
}) {
  const [copied, setCopied] = useState("");
  const [tall, setTall] = useState(false);
  const [fontMode, setFontMode] = useState<FontMode>("system");
  const [loadWebfont, setLoadWebfont] = useState(false);

  const doc = useMemo(
    () =>
      buildPreviewDocument({
        html: replica.html,
        css: replica.css,
        tokensCss,
        baseFont: fontStack(fontFamily, fontMode),
        ...(fontMode === "extracted" && loadWebfont && fontFamily
          ? { fontHref: googleFontsUrl(fontFamily) }
          : {}),
      }),
    [replica, tokensCss, fontFamily, fontMode, loadWebfont]
  );

  const copy = (id: string) => {
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
            The page, rebuilt
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {siteName}'s structure with {siteName}'s tokens. Simplified on purpose — structure and
            hierarchy, not a pixel-perfect clone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <DesignScanFontToggle
            family={fontFamily}
            mode={fontMode}
            onMode={setFontMode}
            loadWebfont={loadWebfont}
            onLoadWebfont={setLoadWebfont}
          />
          <button
            type="button"
            onClick={() => setTall(!tall)}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-white/25"
          >
            {tall ? "Shrink" : "Expand"}
          </button>
          <DesignScanPreviewActions
            copiedId={copied}
            copyKey="replica"
            html={replica.html}
            css={replica.css}
            tokensCss={tokensCss}
            codepenTitle={`${siteName} — page rebuilt`}
            codepenDescription={`Design Scan replica · ${siteName}`}
            onCopied={copy}
          />
        </div>
      </div>

      {replica.stripped.length > 0 && (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-300/80">
            Stripped from the model's answer
          </p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-amber-200/70">
            {replica.stripped.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      )}

      <iframe
        title={`${siteName} rebuilt from its design system`}
        srcDoc={doc}
        sandbox=""
        className={`w-full rounded-lg border border-white/[0.06] bg-white transition-[height] ${
          tall ? "h-[80vh]" : "h-96"
        }`}
      />
    </section>
  );
}
