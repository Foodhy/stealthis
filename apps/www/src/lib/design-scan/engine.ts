/**
 * El motor de fases.
 *
 * Reglas que lo definen:
 *
 *  · Sale del estado guardado, no de cero. Reanudar es el caso normal, no una
 *    excepción: recargar la página a mitad de un escaneo tiene que seguir donde
 *    iba, y una fase ya hecha no se repite nunca.
 *  · Una fase que falla reintenta sola hasta MAX_ATTEMPTS. Si aun así falla, se
 *    para ahí y las fases anteriores quedan intactas.
 *  · Cada transición se persiste. Si el navegador muere en cualquier punto, lo
 *    que ya estaba hecho sigue hecho.
 *  · Una fase sin implementar se marca `unavailable` y detiene la cadena sin
 *    fingir que hizo algo. Las construyen STL-027 a STL-031.
 */

import { beginNewScan, loadActiveScan, saveRun } from "./store";
import {
  type Brief,
  PHASE_ORDER,
  type PhaseId,
  type PhaseState,
  type RunState,
  newRun,
} from "./types";

export const MAX_ATTEMPTS = 2;

/** Lo que recibe una fase: la salida de las anteriores y lo que dijo el usuario. */
export type PhaseContext = {
  url: string;
  outputs: Partial<Record<PhaseId, unknown>>;
  /** Lo aportado en la pausa. Las fases posteriores a `brief` lo tienen lleno. */
  brief: Brief;
  signal?: AbortSignal;
};

export type PhaseRunner = (ctx: PhaseContext) => Promise<unknown>;

/** Las fases implementadas. Lo que no esté aquí queda `unavailable`. */
export type PhaseRegistry = Partial<Record<PhaseId, PhaseRunner>>;

/**
 * Fases que no calculan nada: paran el pipeline y esperan a una persona.
 *
 * Se declaran aparte del registro porque no son código que se ejecuta, son un
 * punto de control. La condición de salida la decide `isAnswered`.
 */
export type Gate = {
  id: PhaseId;
  /** ¿Ya contestó el usuario? Si no, el escaneo se queda en `waiting`. */
  isAnswered: (run: RunState) => boolean;
};

export type EngineHooks = {
  /** Puntos donde el pipeline se detiene a esperar a una persona. */
  gates?: Gate[];
  /**
   * Intentos por fase, cuando MAX_ATTEMPTS no vale. Las fases que llaman a un
   * modelo se configuran a 1: reintentar sola una llamada que el usuario paga
   * duplica su factura sin preguntarle. Si falla, el botón Retry sigue ahí.
   */
  maxAttempts?: Partial<Record<PhaseId, number>>;
  /** Se llama en cada cambio de estado, para que la UI repinte y persista. */
  onChange?: (run: RunState) => void;
  /** Aviso de que no se pudo guardar; el escaneo sigue, pero no sobrevivirá. */
  onStorageProblem?: (reason: string) => void;
  /** Para cancelar desde fuera; se pasa tal cual a cada fase. */
  signal?: AbortSignal;
  now?: () => string;
};

const nowIso = () => new Date().toISOString();

function setPhase(run: RunState, id: PhaseId, patch: Partial<PhaseState>, now: string): RunState {
  return {
    ...run,
    updatedAt: now,
    phases: { ...run.phases, [id]: { ...run.phases[id], ...patch } },
  };
}

/**
 * Recupera el escaneo guardado si es del mismo sitio; si no, empieza uno nuevo.
 * Cambiar de URL no debe arrastrar la captura de la anterior.
 */
export function resumeOrStart(url: string, now = nowIso()): RunState {
  const active = loadActiveScan();
  if (active && active.run.url === url) return active.run;
  return beginNewScan(url, now).run;
}

/**
 * La fase donde el escaneo está esperando al usuario, si está esperando. La UI
 * la usa para saber qué formulario enseñar.
 */
export function waitingPhase(run: RunState): PhaseId | null {
  for (const id of PHASE_ORDER) {
    if (run.phases[id].status === "waiting") return id;
  }
  return null;
}

/** Las salidas ya disponibles, para que una fase lea lo que produjo la anterior. */
export function collectOutputs(run: RunState): Partial<Record<PhaseId, unknown>> {
  const out: Partial<Record<PhaseId, unknown>> = {};
  for (const id of PHASE_ORDER) {
    if (run.phases[id].status === "done") out[id] = run.phases[id].output;
  }
  return out;
}

/** La primera fase que aún no está hecha, o null si el escaneo está completo. */
export function nextPhase(run: RunState): PhaseId | null {
  for (const id of PHASE_ORDER) {
    if (run.phases[id].status !== "done") return id;
  }
  return null;
}

/**
 * Ejecuta desde donde esté hasta donde pueda. Devuelve el estado final.
 *
 * No lanza: un fallo se refleja en el estado de la fase. Quien llama pinta, no
 * gestiona excepciones.
 */
export async function runScan(
  run: RunState,
  registry: PhaseRegistry,
  hooks: EngineHooks = {}
): Promise<RunState> {
  const now = hooks.now ?? nowIso;
  let current = run;

  const commit = (next: RunState) => {
    current = next;
    const saved = saveRun(next);
    if (!saved.ok) hooks.onStorageProblem?.(saved.reason);
    hooks.onChange?.(next);
  };

  for (const id of PHASE_ORDER) {
    if (current.phases[id].status === "done") continue;

    // Una puerta sin contestar detiene el pipeline y lo deja escrito. No es un
    // fallo y no se reintenta: seguir adelante sin lo que el usuario tiene que
    // decir es precisamente lo que hacía que la reconstrucción no valiera.
    const gate = hooks.gates?.find((g) => g.id === id);
    if (gate) {
      if (!gate.isAnswered(current)) {
        commit(setPhase(current, id, { status: "waiting" }, now()));
        return current;
      }
      commit(setPhase(current, id, { status: "done", finishedAt: now() }, now()));
      continue;
    }

    const runner = registry[id];
    if (!runner) {
      // Fase declarada pero sin construir. Se dice y se para: fingir que pasó
      // dejaría a las siguientes leyendo una salida que no existe.
      commit(setPhase(current, id, { status: "unavailable" }, now()));
      return current;
    }

    let lastError = "";
    let succeeded = false;
    let attempts = current.phases[id].attempts;
    const limit = Math.max(1, hooks.maxAttempts?.[id] ?? MAX_ATTEMPTS);

    while (attempts < limit) {
      attempts += 1;
      commit(
        setPhase(
          current,
          id,
          { status: "running", attempts, startedAt: now(), error: undefined },
          now()
        )
      );

      try {
        const output = await runner({
          url: current.url,
          outputs: collectOutputs(current),
          brief: current.brief,
          ...(hooks.signal ? { signal: hooks.signal } : {}),
        });
        commit(setPhase(current, id, { status: "done", output, finishedAt: now() }, now()));
        succeeded = true;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Fallo desconocido.";
      }
    }

    // Se mira una bandera local y no el estado: `commit` reasigna `current` desde
    // un cierre, así que el compilador no ve ese cambio y creía que la
    // comprobación era siempre cierta. Una bandera dice la verdad a los dos.
    if (!succeeded) {
      commit(
        setPhase(current, id, { status: "error", error: lastError, finishedAt: now() }, now())
      );
      return current; // se para aquí; lo anterior sigue intacto
    }
  }

  return current;
}

/**
 * Detiene el escaneo dejándolo reanudable.
 *
 * La fase que estuviera corriendo vuelve a `pending`, no a `error`: pararlo es
 * una decisión de la persona, no un fallo, y el escaneo no debería llevar una
 * cicatriz roja por eso. Los intentos se ponen a cero por lo mismo — nadie
 * debería gastar un reintento de su cuota por haber pulsado Stop.
 *
 * Cancelar la petición en vuelo es cosa de quien llama, con su AbortController.
 */
export function stopRun(run: RunState, now = nowIso()): RunState {
  const phases = { ...run.phases };
  for (const id of PHASE_ORDER) {
    if (phases[id].status === "running")
      phases[id] = { ...phases[id], status: "pending", attempts: 0, error: undefined };
  }
  return { ...run, updatedAt: now, phases };
}

/**
 * Guarda la respuesta del usuario y libera la puerta. Se sella `answeredAt`
 * porque es lo que distingue "no ha contestado" de "contestó y dejó todo vacío".
 */
export function answerBrief(run: RunState, brief: Brief, now = nowIso()): RunState {
  return {
    ...run,
    updatedAt: now,
    brief: { ...brief, answeredAt: now },
    phases: { ...run.phases, brief: { ...run.phases.brief, status: "pending" } },
  };
}

/**
 * Vuelve a poner una fase fallida en cola, conservando lo anterior. La cuenta
 * de intentos se reinicia porque esto es una decisión del usuario, no un
 * reintento automático.
 */
export function retryPhase(run: RunState, id: PhaseId, now = nowIso()): RunState {
  return setPhase(run, id, { status: "pending", attempts: 0, error: undefined }, now);
}
