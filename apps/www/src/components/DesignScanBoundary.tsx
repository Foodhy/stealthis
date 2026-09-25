/**
 * Red de seguridad de la isla.
 *
 * Sin esto, cualquier excepción al renderizar deja la página en blanco: React
 * desmonta el árbol entero y no queda nada, ni una pista. Y el sospechoso
 * habitual es el escaneo guardado en localStorage, que puede venir de una
 * versión anterior de la herramienta — justo lo que uno no puede adivinar
 * mirando un hueco vacío.
 *
 * Así que se enseña el error y se ofrece la salida: borrar el escaneo guardado.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null; stack: string };

export default class DesignScanBoundary extends Component<Props, State> {
  state: State = { error: null, stack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A la consola también: quien tenga las herramientas abiertas ya lo vería,
    // pero el que no las tiene abiertas es justo quien necesita verlo en pantalla.
    console.error("[design-scan] la isla falló al renderizar", error, info.componentStack);
    this.setState({ stack: info.componentStack ?? "" });
  }

  private clearStorage = () => {
    for (const key of [
      "design-scan-run-v1",
      "design-scan-capture-v1",
      "design-scan-ai-provider-v1",
      "design-scan-proxy-v1",
    ]) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* nada que hacer */
      }
    }
    location.reload();
  };

  render() {
    const { error, stack } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/[0.06] p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-rose-300">
          Design Scan crashed while rendering
        </h2>

        <p className="mt-2 font-mono text-xs text-rose-200">{error.message}</p>

        {stack && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[11px] text-slate-400">
              Where it happened
            </summary>
            <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-black/40 p-2 font-mono text-[10px] leading-relaxed text-slate-400">
              {stack.trim()}
            </pre>
          </details>
        )}

        <p className="mt-3 text-xs text-slate-400">
          The usual cause is a saved scan from an older version of this page. Clearing it starts
          over from scratch — the capture, the DESIGN.md, the model settings and the worker URL all
          go.
        </p>

        <button
          type="button"
          onClick={this.clearStorage}
          className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 transition-colors hover:border-rose-400/60"
        >
          Clear the saved scan and reload
        </button>
      </div>
    );
  }
}
