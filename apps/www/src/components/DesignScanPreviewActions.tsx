import { combinedHtmlCssCopy, openCodePenPrefill } from "@lib/codepen-prefill";
import { SITE_URLS } from "@lib/urls";

type Props = {
  copiedId: string;
  copyKey: string;
  html: string;
  css: string;
  tokensCss?: string;
  codepenTitle: string;
  codepenDescription?: string;
  resourceSlug?: string;
  onCopied: (id: string) => void;
  showSwaps?: { count: number; onToggle: () => void };
};

const btn =
  "rounded-lg border border-white/15 px-2.5 py-1 text-[11px] text-slate-200 transition-colors hover:border-white/30";

export default function DesignScanPreviewActions({
  copiedId,
  copyKey,
  html,
  css,
  tokensCss = "",
  codepenTitle,
  codepenDescription,
  resourceSlug,
  onCopied,
  showSwaps,
}: Props) {
  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopied(id);
    } catch {
      /* sin portapapeles */
    }
  };

  const fullCss = [tokensCss, css].filter(Boolean).join("\n\n");
  const copyAllId = `${copyKey}-all`;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showSwaps && showSwaps.count > 0 && (
        <button type="button" onClick={showSwaps.onToggle} className={btn}>
          {showSwaps.count} swaps
        </button>
      )}
      {resourceSlug && (
        <a
          href={`${SITE_URLS.www}/r/${resourceSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Catalog resource used here: ${resourceSlug}`}
          className={btn}
        >
          Original source
        </a>
      )}
      <button
        type="button"
        onClick={() => copy(copyAllId, combinedHtmlCssCopy(html, fullCss))}
        className={btn}
      >
        {copiedId === copyAllId ? "Copied" : "Copy HTML + CSS"}
      </button>
      <button
        type="button"
        onClick={() =>
          openCodePenPrefill({
            title: codepenTitle,
            description: codepenDescription,
            html,
            css: fullCss,
          })
        }
        className={btn}
      >
        CodePen
      </button>
    </div>
  );
}
