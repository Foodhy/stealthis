import { beforeEach, describe, expect, test } from "bun:test";
import { newRun } from "./types";
import {
  ARCHIVE_STORAGE_KEY,
  activateScan,
  beginNewScan,
  deleteScan,
  exportScanJson,
  importScanJson,
  listSavedScans,
  loadActiveScan,
  loadRun,
  saveRun,
} from "./store";

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

describe("biblioteca de escaneos", () => {
  test("un escaneo nuevo no borra los anteriores", () => {
    const a = beginNewScan("https://google.com/");
    saveRun({ ...a.run, phases: { ...a.run.phases, capture: { status: "done", attempts: 1 } } });

    const b = beginNewScan("https://disneyplus.com/");
    expect(listSavedScans()).toHaveLength(2);
    expect(loadActiveScan()?.id).toBe(b.id);
    expect(loadActiveScan()?.run.url).toBe("https://disneyplus.com/");

    const reopened = activateScan(a.id);
    expect(reopened?.url).toBe("https://google.com/");
    expect(loadActiveScan()?.id).toBe(a.id);
  });

  test("borrar deja activo el siguiente si existía", () => {
    const a = beginNewScan("https://a.test/");
    beginNewScan("https://b.test/");
    deleteScan(loadActiveScan()!.id);
    expect(loadActiveScan()?.id).toBe(a.id);
    expect(listSavedScans()).toHaveLength(1);
  });

  test("saveRun actualiza el activo sin duplicar entradas", () => {
    const { id, run } = beginNewScan("https://x.test/");
    const updated = newRun("https://x.test/", "t1");
    updated.phases.capture = { status: "done", attempts: 1, output: "ok" };
    saveRun(updated);
    expect(listSavedScans()).toHaveLength(1);
    expect(loadRun()?.phases.capture.output).toBe("ok");
    expect(loadActiveScan()?.id).toBe(id);
  });

  test("persiste en ARCHIVE_STORAGE_KEY", () => {
    beginNewScan("https://persist.test/");
    expect(store.has(ARCHIVE_STORAGE_KEY)).toBe(true);
  });

  test("exportar e importar conserva la URL y las fases", () => {
    const { id, run } = beginNewScan("https://share.test/");
    run.phases.capture = { status: "done", attempts: 1, output: { html: "<p>x</p>" } };
    saveRun(run);

    const json = exportScanJson(id);
    expect(json).toBeTruthy();

    deleteScan(id);
    expect(listSavedScans()).toHaveLength(0);

    const imported = importScanJson(json!);
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.url).toBe("https://share.test/");
      expect(imported.run.phases.capture.output).toEqual({ html: "<p>x</p>" });
      expect(listSavedScans()).toHaveLength(1);
    }
  });
});
