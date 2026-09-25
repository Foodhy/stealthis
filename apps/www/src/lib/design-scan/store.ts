/**
 * Persistencia del escaneo — biblioteca en localStorage.
 *
 * Antes había un solo escaneo (`design-scan-run-v1`). Ahora guardamos varios
 * (`design-scan-archive-v1`) y cuál está activo, para poder volver a uno
 * terminado, borrarlo, o empezar otro sin perder el resto.
 */

import { scanHostname, scanProgressLabel } from "./scan-meta";
import {
  type Brief,
  PHASE_ORDER,
  type PhaseState,
  RUN_VERSION,
  type RunState,
  emptyBrief,
  emptyPhase,
  newRun,
} from "./types";

/** @deprecated Solo migración desde el formato de un escaneo. */
export const RUN_STORAGE_KEY = "design-scan-run-v1";

export const ARCHIVE_STORAGE_KEY = "design-scan-archive-v1";

const ARCHIVE_VERSION = 1;

export type SavedScan = {
  id: string;
  run: RunState;
};

export type ScanArchive = {
  version: number;
  activeId: string | null;
  scans: SavedScan[];
};

export type ScanListItem = {
  id: string;
  url: string;
  hostname: string;
  updatedAt: string;
  progress: string;
};

function newScanId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** localStorage no existe en SSR ni en un test de Node sin simularlo. */
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Rescata el brief guardado, campo a campo, sin fiarse de su forma. */
function readBrief(raw: unknown): Brief {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const base = emptyBrief();

  return {
    notes: typeof o.notes === "string" ? o.notes : base.notes,
    components: Array.isArray(o.components)
      ? o.components.filter((c): c is string => typeof c === "string")
      : base.components,
    pinned:
      o.pinned && typeof o.pinned === "object"
        ? Object.fromEntries(
            Object.entries(o.pinned as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string"
            )
          )
        : base.pinned,
    reference: typeof o.reference === "string" ? o.reference : base.reference,
    ...(typeof o.answeredAt === "string" ? { answeredAt: o.answeredAt } : {}),
  };
}

function migrateRun(raw: unknown): RunState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const version = typeof o.version === "number" ? o.version : 0;
  if (version > RUN_VERSION) return null;
  if (version < 1) return null;

  if (typeof o.url !== "string" || !o.url) return null;

  const phasesRaw = (o.phases ?? {}) as Record<string, unknown>;
  const phases = {} as RunState["phases"];

  for (const id of PHASE_ORDER) {
    const p = phasesRaw[id];
    phases[id] = isPhase(p) ? normalizePhase(p) : emptyPhase();
  }

  if (version < 3) {
    const componentsDone = phases.components?.status === "done";
    const recreateDone = phases.recreate?.status === "done";
    const replicaDone = phases.replica?.status === "done";
    if (replicaDone && (!componentsDone || !recreateDone)) {
      phases.replica = emptyPhase();
    }
  }

  const now = new Date().toISOString();
  return {
    version: RUN_VERSION,
    url: o.url,
    startedAt: typeof o.startedAt === "string" ? o.startedAt : now,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : now,
    phases,
    brief: readBrief(o.brief),
  };
}

function isPhase(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object";
}

function normalizePhase(p: Record<string, unknown>): PhaseState {
  const statuses = ["pending", "running", "done", "error", "unavailable", "waiting"];
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

function emptyArchive(): ScanArchive {
  return { version: ARCHIVE_VERSION, activeId: null, scans: [] };
}

function readArchiveRaw(): ScanArchive {
  const s = storage();
  if (!s) return emptyArchive();

  try {
    const raw = s.getItem(ARCHIVE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ScanArchive;
      if (parsed?.version === ARCHIVE_VERSION && Array.isArray(parsed.scans)) {
        const scans: SavedScan[] = [];
        for (const item of parsed.scans) {
          if (!item || typeof item !== "object") continue;
          const id = typeof (item as SavedScan).id === "string" ? (item as SavedScan).id : "";
          const run = migrateRun((item as SavedScan).run);
          if (id && run) scans.push({ id, run });
        }
        const activeId =
          typeof parsed.activeId === "string" && scans.some((x) => x.id === parsed.activeId)
            ? parsed.activeId
            : (scans[0]?.id ?? null);
        return { version: ARCHIVE_VERSION, activeId, scans };
      }
    }

    const legacy = s.getItem(RUN_STORAGE_KEY);
    if (legacy) {
      const run = migrateRun(JSON.parse(legacy));
      if (run) {
        const id = newScanId();
        const archive: ScanArchive = {
          version: ARCHIVE_VERSION,
          activeId: id,
          scans: [{ id, run }],
        };
        writeArchive(archive);
        s.removeItem(RUN_STORAGE_KEY);
        return archive;
      }
    }
  } catch {
    /* archivo corrupto: empezar vacío */
  }

  return emptyArchive();
}

function writeArchive(archive: ScanArchive): { ok: true } | { ok: false; reason: string } {
  const s = storage();
  if (!s) return { ok: false, reason: "Sin almacenamiento disponible." };
  try {
    s.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archive));
    return { ok: true };
  } catch (err) {
    const quota = err instanceof Error && /quota|exceeded/i.test(err.message);
    return {
      ok: false,
      reason: quota
        ? "El escaneo no cabe en el almacenamiento del navegador."
        : "No se pudo guardar el escaneo.",
    };
  }
}

export function loadActiveScan(): { id: string; run: RunState } | null {
  const archive = readArchiveRaw();
  if (!archive.activeId) return null;
  const entry = archive.scans.find((s) => s.id === archive.activeId);
  return entry ? { id: entry.id, run: entry.run } : null;
}

/** Compatibilidad con el motor y tests antiguos. */
export function loadRun(): RunState | null {
  return loadActiveScan()?.run ?? null;
}

export function listSavedScans(): ScanListItem[] {
  const archive = readArchiveRaw();
  return [...archive.scans]
    .sort((a, b) => b.run.updatedAt.localeCompare(a.run.updatedAt))
    .map((entry) => ({
      id: entry.id,
      url: entry.run.url,
      hostname: scanHostname(entry.run.url),
      updatedAt: entry.run.updatedAt,
      progress: scanProgressLabel(entry.run),
    }));
}

export function beginNewScan(
  url: string,
  now = new Date().toISOString()
): { id: string; run: RunState } {
  const id = newScanId();
  const run = newRun(url, now);
  const archive = readArchiveRaw();
  archive.scans.unshift({ id, run });
  archive.activeId = id;
  writeArchive(archive);
  return { id, run };
}

export function activateScan(id: string): RunState | null {
  const archive = readArchiveRaw();
  const entry = archive.scans.find((s) => s.id === id);
  if (!entry) return null;
  archive.activeId = id;
  writeArchive(archive);
  return entry.run;
}

export function deleteScan(id: string): { activeId: string | null; run: RunState | null } {
  const archive = readArchiveRaw();
  archive.scans = archive.scans.filter((s) => s.id !== id);
  if (archive.activeId === id) {
    archive.activeId = archive.scans[0]?.id ?? null;
  }
  writeArchive(archive);
  if (!archive.activeId) return { activeId: null, run: null };
  const next = archive.scans.find((s) => s.id === archive.activeId);
  return { activeId: archive.activeId, run: next?.run ?? null };
}

export function saveRun(run: RunState): { ok: true } | { ok: false; reason: string } {
  const archive = readArchiveRaw();
  let id = archive.activeId;

  if (!id) {
    id = newScanId();
    archive.activeId = id;
    archive.scans.unshift({ id, run });
    return writeArchive(archive);
  }

  const index = archive.scans.findIndex((s) => s.id === id);
  if (index >= 0) archive.scans[index] = { id, run };
  else archive.scans.unshift({ id, run });

  return writeArchive(archive);
}

/** Borra todo el archivo (raro; preferir deleteScan). */
export function clearRun(): void {
  try {
    storage()?.removeItem(ARCHIVE_STORAGE_KEY);
    storage()?.removeItem(RUN_STORAGE_KEY);
  } catch {
    /* nada */
  }
}

export const SCAN_EXPORT_FORMAT = "stealthis-design-scan" as const;
export const SCAN_EXPORT_VERSION = 1;

export type ScanExportFile = {
  format: typeof SCAN_EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  url: string;
  run: RunState;
};

export type ImportScanResult =
  | { ok: true; id: string; run: RunState }
  | { ok: false; error: string };

export function exportScanJson(id: string): string | null {
  const archive = readArchiveRaw();
  const entry = archive.scans.find((s) => s.id === id);
  if (!entry) return null;

  const payload: ScanExportFile = {
    format: SCAN_EXPORT_FORMAT,
    version: SCAN_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    url: entry.run.url,
    run: entry.run,
  };
  return JSON.stringify(payload, null, 2);
}

export function exportScanFilename(id: string): string {
  const archive = readArchiveRaw();
  const entry = archive.scans.find((s) => s.id === id);
  const host = entry ? scanHostname(entry.run.url) : "scan";
  const day = new Date().toISOString().slice(0, 10);
  return `design-scan-${host}-${day}.json`;
}

export function importScanJson(text: string): ImportScanResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "Not a design scan export." };
  }
  const file = parsed as Partial<ScanExportFile>;
  if (file.format !== SCAN_EXPORT_FORMAT) {
    return { ok: false, error: "Not a design scan export (wrong format)." };
  }
  if (typeof file.version !== "number" || file.version > SCAN_EXPORT_VERSION) {
    return { ok: false, error: "This export needs a newer version of Design Scan." };
  }

  const run = migrateRun(file.run);
  if (!run) return { ok: false, error: "The run inside the file could not be read." };

  const id = newScanId();
  const archive = readArchiveRaw();
  archive.scans.unshift({ id, run });
  archive.activeId = id;
  const saved = writeArchive(archive);
  if (!saved.ok) return { ok: false, error: saved.reason };

  return { ok: true, id, run };
}

export function downloadScanExport(id: string): boolean {
  const json = exportScanJson(id);
  if (!json || typeof document === "undefined") return false;

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = exportScanFilename(id);
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
