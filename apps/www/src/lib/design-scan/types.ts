/**
 * Design Scan — el pipeline por fases.
 *
 * Un escaneo no es una llamada: son cinco pasos encadenados donde cada uno
 * cuesta tiempo o dinero (los que usan modelo). Perder el trabajo de los
 * cuatro primeros porque el quinto falló, o porque alguien recargó la página,
 * sería el fallo más caro de la herramienta. De ahí que cada fase guarde su
 * estado y su salida por separado.
 */

export type PhaseId = "capture" | "tokens" | "prose" | "components" | "recreate";

export const PHASE_ORDER: PhaseId[] = ["capture", "tokens", "prose", "components", "recreate"];

export type PhaseStatus =
  /** Aún no le ha tocado. */
  | "pending"
  /** Corriendo ahora mismo. */
  | "running"
  /** Terminada, con su salida guardada. */
  | "done"
  /** Falló y se agotaron los reintentos. Las fases anteriores siguen intactas. */
  | "error"
  /** Declarada pero todavía sin implementar: la construye una tarea posterior. */
  | "unavailable";

export type PhaseState<T = unknown> = {
  status: PhaseStatus;
  /** Cuántas veces se ha intentado. Un reintento no reinicia la cuenta. */
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  /** Mensaje legible del último fallo. */
  error?: string;
  output?: T;
};

/**
 * Un escaneo entero. `version` no es decorativo: es lo que permite cambiar
 * esta forma sin dejar tirado a quien tenga un escaneo a medias guardado.
 */
export type RunState = {
  version: number;
  /** URL que se pidió escanear. Cambiarla empieza un escaneo nuevo. */
  url: string;
  startedAt: string;
  updatedAt: string;
  phases: Record<PhaseId, PhaseState>;
};

export const PHASE_LABELS: Record<PhaseId, { title: string; blurb: string }> = {
  capture: {
    title: "Capture",
    blurb: "Fetch the page's HTML and every stylesheet it links.",
  },
  tokens: {
    title: "Tokens",
    blurb: "Read the CSS and fill the DESIGN.md front matter. No model involved.",
  },
  prose: {
    title: "Prose",
    blurb: "Ask the model for the DESIGN.md body — the why behind each decision.",
  },
  components: {
    title: "Components",
    blurb: "Match the detected components against the stealthis catalog.",
  },
  recreate: {
    title: "Recreate",
    blurb: "Assemble the catalog snippets with the extracted tokens applied.",
  },
};

export function emptyPhase(): PhaseState {
  return { status: "pending", attempts: 0 };
}

export function newRun(url: string, now: string): RunState {
  return {
    version: RUN_VERSION,
    url,
    startedAt: now,
    updatedAt: now,
    phases: {
      capture: emptyPhase(),
      tokens: emptyPhase(),
      prose: emptyPhase(),
      components: emptyPhase(),
      recreate: emptyPhase(),
    },
  };
}

/** Sube cuando cambie la forma de RunState. Ver `migrate` en store.ts. */
export const RUN_VERSION = 1;
