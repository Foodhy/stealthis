/**
 * Design Scan — el pipeline por fases.
 *
 * Un escaneo no es una llamada: son cinco pasos encadenados donde cada uno
 * cuesta tiempo o dinero (los que usan modelo). Perder el trabajo de los
 * cuatro primeros porque el quinto falló, o porque alguien recargó la página,
 * sería el fallo más caro de la herramienta. De ahí que cada fase guarde su
 * estado y su salida por separado.
 */

export type PhaseId =
  | "capture"
  | "tokens"
  | "prose"
  | "brief"
  | "replica"
  | "components"
  | "recreate";

/**
 * El orden importa y no es casual. `brief` va DESPUÉS de la prosa y ANTES de la
 * réplica: cuando el usuario interviene ya tiene delante el DESIGN.md completo,
 * y lo que escriba llega a tiempo de decidir cómo se reconstruye la página.
 */
export const PHASE_ORDER: PhaseId[] = [
  "capture",
  "tokens",
  "prose",
  "brief",
  "components",
  "recreate",
  "replica",
];

export type PhaseStatus =
  /** Aún no le ha tocado. */
  | "pending"
  /** Corriendo ahora mismo. */
  | "running"
  /** Terminada, con su salida guardada. */
  | "done"
  /** Falló y se agotaron los reintentos. Las fases anteriores siguen intactas. */
  | "error"
  /**
   * Parada a propósito, esperando al usuario. No es un fallo y no se reintenta:
   * el pipeline se queda aquí hasta que alguien conteste. Sobrevive a recargar
   * la página, que es justo para lo que existe.
   */
  | "waiting"
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
 * Lo que el usuario aporta en la pausa. Es la diferencia entre reconstruir la
 * página a ciegas y reconstruirla sabiendo qué le importa a quien la pidió.
 */
export type Brief = {
  /** Instrucciones en texto libre para el modelo. */
  notes: string;
  /** Los componentes que SÍ se van a generar. Manda sobre lo detectado. */
  components: string[];
  /** Componente → slug del catálogo fijado a mano, sin pasar por el ranking. */
  pinned: Record<string, string>;
  /** HTML o markup de referencia pegado por el usuario. */
  reference: string;
  /** Cuándo se contestó. Sin esto, la fase sigue esperando. */
  answeredAt?: string;
};

export function emptyBrief(): Brief {
  return { notes: "", components: [], pinned: {}, reference: "" };
}

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
  /** Lo que contestó el usuario en la pausa. Vacío hasta que contesta. */
  brief: Brief;
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
  brief: {
    title: "Your turn",
    blurb: "Say what matters before the page is rebuilt: notes, components, pinned resources.",
  },
  replica: {
    title: "Replica",
    blurb: "Compose the full page using catalog snippets and extracted tokens.",
  },
  components: {
    title: "Components",
    blurb: "Match the detected components against the stealthis catalog.",
  },
  recreate: {
    title: "Recreate",
    blurb: "Re-skin each matched catalog snippet with the extracted tokens.",
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
      brief: emptyPhase(),
      replica: emptyPhase(),
      components: emptyPhase(),
      recreate: emptyPhase(),
    },
    brief: emptyBrief(),
  };
}

/**
 * Sube cuando cambie la forma de RunState. Ver `migrate` en store.ts.
 *
 * v2: se añaden las fases `brief` y `replica`, y el campo `brief` del escaneo.
 *
 * v3: `components` y `recreate` van antes de `replica` (la página se compone al final).
 */
export const RUN_VERSION = 3;
