/**
 * Elegir con qué fuente se pinta la vista previa.
 *
 * Arranca en la del sistema a propósito. La fuente de la página escaneada casi
 * nunca está instalada en la máquina de quien mira, y el iframe no descarga
 * nada por su cuenta, así que pedirla de entrada dejaba el texto en el serif
 * inicial del navegador: apretado, ilegible, y con pinta de fallo nuestro
 * cuando solo era una fuente que falta.
 *
 * Usar la original es una decisión con consecuencias, así que se dice cuáles:
 * si no está instalada, se ofrece cargarla de Google Fonts, y eso es una
 * petición a un tercero desde la vista previa.
 */

import { type FontMode, isFontAvailable } from "@lib/design-scan/fonts";
import { useMemo } from "react";

export default function DesignScanFontToggle({
  family,
  mode,
  onMode,
  loadWebfont,
  onLoadWebfont,
}: {
  family: string | undefined;
  mode: FontMode;
  onMode: (mode: FontMode) => void;
  loadWebfont: boolean;
  onLoadWebfont: (load: boolean) => void;
}) {
  // Se comprueba una vez por familia: preguntarlo en cada repintado no aporta.
  const available = useMemo(() => (family ? isFontAvailable(family) : null), [family]);

  if (!family) return null;

  const missing = available === false;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-lg border border-white/10">
        <button
          type="button"
          onClick={() => onMode("system")}
          className={`px-2.5 py-1 text-[10px] transition-colors ${
            mode === "system" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Readable font
        </button>
        <button
          type="button"
          onClick={() => onMode("extracted")}
          className={`px-2.5 py-1 text-[10px] transition-colors ${
            mode === "extracted" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
          title={`Use ${family}, the font the page uses`}
        >
          {family}
        </button>
      </div>

      {mode === "extracted" && missing && !loadWebfont && (
        <button
          type="button"
          onClick={() => onLoadWebfont(true)}
          className="rounded-lg border border-amber-500/40 bg-amber-500/[0.08] px-2.5 py-1 text-[10px] text-amber-200 transition-colors hover:border-amber-400/60"
          title="This fetches the font from Google Fonts — a request to a third party"
        >
          Not installed — load it from Google Fonts
        </button>
      )}

      {mode === "extracted" && loadWebfont && (
        <button
          type="button"
          onClick={() => onLoadWebfont(false)}
          className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-slate-400 transition-colors hover:border-white/25"
        >
          Stop loading it
        </button>
      )}

      {mode === "extracted" && available === null && (
        <span className="text-[10px] text-slate-600">
          Cannot tell whether {family} is installed.
        </span>
      )}
    </div>
  );
}
