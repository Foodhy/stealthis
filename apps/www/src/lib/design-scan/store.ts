/**
 * Persistencia del escaneo.
 *
 * Se guarda entero en una sola clave versionada. La alternativa —una clave por
 * fase— parecía más granular, pero deja la puerta abierta a un estado a medias
 * si la escritura se interrumpe entre dos claves; y como el escaneo se lee y se
 * escribe siempre completo, no gana nada.
 *
 * Lo grande (el HTML capturado) vive aquí también: es justo lo que no queremos
 * volver a pedir tras una recarga.
 */

import { PHASE_ORDER, type PhaseState, RUN_VERSION, type RunState, emptyPhase } from "./types";

export const RUN_STORAGE_KEY = "design-scan-run-v1";

/** localStorage no existe en SSR ni en un test de Node sin simularlo. */
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Migra un escaneo guardado a la versión actual.
 *
 * Hoy solo hay v1, así que esto es un pasaplatos — y ese es exactamente el
 * punto: existe antes de hacer falta, para que el primer cambio de forma tenga
 * dónde caerse en vez de romper en silencio.
 */
function migrate(raw: unknown): RunState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const version = typeof o.version === "number" ? o.version : 0;
  // Guardado por una versión más nueva de la página: no lo interpretamos.
  if (version > RUN_VERSION) return null;
  if (version < 1) return null; // no hubo formatos previos; nada que migrar

  if (typeof o.url !== "string" || !o.url) return null;

  const phasesRaw = (o.phases ?? {}) as Record<string, unknown>;
  const phases = {} as RunState["phases"];

  for (const id of PHASE_ORDER) {
    const p = phasesRaw[id];
    phases[id] = isPhase(p) ? normalizePhase(p) : emptyPhase();
  }

  const now = new Date().toISOString();
  return {
    version: RUN_VERSION,
    url: o.url,
    startedAt: typeof o.startedAt === "string" ? o.startedAt : now,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : now,
    phases,
  };
}

function isPhase(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object";
}

/**
 * Una fase guardada como `running` viene de una pestaña que se cerró a mitad.
 * Nadie la está ejecutando ya, así que se degrada a `pending` para que el motor
 * la vuelva a tomar en vez de esperar eternamente a algo que murió.
 */
function normalizePhase(p: Record<string, unknown>): PhaseState {
  const statuses = ["pending", "running", "done", "error", "unavailable"];
  const raw = typeof p.status === "string" && statuses.includes(p.status) ? p.status : "pending";
  const status = raw === "running" ? "pending" : (raw as PhaseState["status"]);

  return {
    status,
    attempts: typeof p.attempts === "number" && p.attempts >= 0 ? p.attempts : 0,
    ...(typeof p.startedAt === "string" ? { startedAt: p.startedAt } : {}),
    ...(typeof p.finishedAt === "string" ? { finishedAt: p.finishedAt } : {}),
    ...(typeof p.error === "string" ? { error: p.error } : {}),
    ...(p.output !== undefined ? { output: p.output } : {}),
  };
}

export function loadRun(): RunState | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(RUN_STORAGE_KEY);
    return raw ? migrate(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveRun(run: RunState): { ok: true } | { ok: false; reason: string } {
  const s = storage();
  if (!s) return { ok: false, reason: "Sin almacenamiento disponible." };
  try {
    s.setItem(RUN_STORAGE_KEY, JSON.stringify(run));
    return { ok: true };
  } catch (err) {
    // Lo más probable: cuota llena por una captura grande. Hay que decirlo, no
    // tragárselo: el usuario debe saber que su escaneo no sobrevive a recargar.
    const quota = err instanceof Error && /quota|exceeded/i.test(err.message);
    return {
      ok: false,
      reason: quota
        ? "El escaneo no cabe en el almacenamiento del navegador."
        : "No se pudo guardar el escaneo.",
    };
  }
}

export function clearRun(): void {
  try {
    storage()?.removeItem(RUN_STORAGE_KEY);
  } catch {
    /* nada que hacer */
  }
}
