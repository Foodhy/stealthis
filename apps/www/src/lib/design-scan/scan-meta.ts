import { PHASE_ORDER, type RunState } from "./types";

/** Resumen legible del progreso de un escaneo guardado. */
export function scanProgressLabel(run: RunState): string {
  for (const id of PHASE_ORDER) {
    if (run.phases[id].status === "waiting") return "Waiting for you";
  }
  for (const id of PHASE_ORDER) {
    if (run.phases[id].status === "error") return "Failed";
  }
  const done = PHASE_ORDER.filter((id) => run.phases[id].status === "done").length;
  if (done === PHASE_ORDER.length) return "Complete";
  return `${done}/${PHASE_ORDER.length} phases`;
}

export function scanHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
