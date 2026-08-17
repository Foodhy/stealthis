import { beforeEach, describe, expect, test } from "bun:test";
import {
  MAX_ATTEMPTS,
  type PhaseRegistry,
  collectOutputs,
  nextPhase,
  resumeOrStart,
  retryPhase,
  runScan,
} from "./engine";
import { RUN_STORAGE_KEY, loadRun, saveRun } from "./store";
import { newRun } from "./types";

// localStorage simulado: los tests corren en Node.
const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

const URL_A = "https://example.com/";

/** Registro completo de fases falsas que solo devuelven una marca. */
function fakeRegistry(overrides: PhaseRegistry = {}): PhaseRegistry {
  return {
    capture: async () => "html",
    tokens: async () => ({ colors: 3 }),
    prose: async () => "## Overview",
    components: async () => ["button"],
    recreate: async () => ["<button>"],
    ...overrides,
  };
}

describe("un escaneo completo", () => {
  test("recorre las cinco fases en orden y guarda cada salida", async () => {
    const visitadas: string[] = [];
    const registry = fakeRegistry({
      capture: async () => {
        visitadas.push("capture");
        return "html";
      },
      tokens: async () => {
        visitadas.push("tokens");
        return { colors: 3 };
      },
    });

    const final = await runScan(newRun(URL_A, "t0"), registry);

    expect(visitadas).toEqual(["capture", "tokens"]);
    expect(Object.values(final.phases).every((p) => p.status === "done")).toBe(true);
    expect(final.phases.capture.output).toBe("html");
    expect(final.phases.tokens.output).toEqual({ colors: 3 });
  });

  test("cada fase ve la salida de las anteriores", async () => {
    let vistoPorTokens: unknown;
    await runScan(
      newRun(URL_A, "t0"),
      fakeRegistry({
        tokens: async (ctx) => {
          vistoPorTokens = ctx.outputs.capture;
          return {};
        },
      })
    );

    expect(vistoPorTokens).toBe("html");
  });
});

describe("reanudar — el punto de la tarea", () => {
  test("recargar a mitad continúa donde iba y NO repite lo hecho", async () => {
    // Primera pasada: prose revienta, así que el escaneo se para ahí.
    const primera = await runScan(
      newRun(URL_A, "t0"),
      fakeRegistry({
        prose: async () => {
          throw new Error("se cayó la red");
        },
      })
    );
    expect(primera.phases.capture.status).toBe("done");
    expect(primera.phases.prose.status).toBe("error");

    // "Recarga": se relee de localStorage, como haría la página al montar.
    const recuperado = resumeOrStart(URL_A);
    expect(recuperado.phases.capture.status).toBe("done");
    expect(recuperado.phases.capture.output).toBe("html");

    // Segunda pasada con prose arreglada: capture y tokens NO se repiten.
    const rehechas: string[] = [];
    const final = await runScan(
      retryPhase(recuperado, "prose"),
      fakeRegistry({
        capture: async () => {
          rehechas.push("capture");
          return "html otra vez";
        },
        tokens: async () => {
          rehechas.push("tokens");
          return {};
        },
      })
    );

    expect(rehechas).toEqual([]); // ninguna de las dos volvió a ejecutarse
    expect(final.phases.capture.output).toBe("html"); // la salida original intacta
    expect(final.phases.prose.status).toBe("done");
  });

  test("una fase que quedó `running` al cerrar la pestaña vuelve a `pending`", () => {
    const run = newRun(URL_A, "t0");
    run.phases.capture = { status: "running", attempts: 1, startedAt: "t0" };
    saveRun(run);

    // Nadie está ejecutando eso ya: esperar a que termine sería esperar a un muerto.
    expect(loadRun()?.phases.capture.status).toBe("pending");
  });

  test("cambiar de URL empieza un escaneo nuevo, sin arrastrar la captura", async () => {
    await runScan(newRun(URL_A, "t0"), fakeRegistry());
    const otro = resumeOrStart("https://otra-cosa.com/");

    expect(otro.url).toBe("https://otra-cosa.com/");
    expect(otro.phases.capture.status).toBe("pending");
    expect(otro.phases.capture.output).toBeUndefined();
  });
});

describe("fallos", () => {
  test("reintenta sola hasta MAX_ATTEMPTS antes de rendirse", async () => {
    let intentos = 0;
    const final = await runScan(
      newRun(URL_A, "t0"),
      fakeRegistry({
        capture: async () => {
          intentos += 1;
          throw new Error("502");
        },
      })
    );

    expect(intentos).toBe(MAX_ATTEMPTS);
    expect(final.phases.capture.status).toBe("error");
    expect(final.phases.capture.error).toBe("502");
  });

  test("si falla al segundo intento, el primero no cuenta como éxito", async () => {
    let intentos = 0;
    const final = await runScan(
      newRun(URL_A, "t0"),
      fakeRegistry({
        capture: async () => {
          intentos += 1;
          if (intentos === 1) throw new Error("una vez");
          return "a la segunda";
        },
      })
    );

    expect(final.phases.capture.status).toBe("done");
    expect(final.phases.capture.output).toBe("a la segunda");
    expect(final.phases.capture.attempts).toBe(2);
  });

  test("un fallo NO tira el trabajo de las fases anteriores", async () => {
    const final = await runScan(
      newRun(URL_A, "t0"),
      fakeRegistry({
        prose: async () => {
          throw new Error("boom");
        },
      })
    );

    expect(final.phases.capture.output).toBe("html");
    expect(final.phases.tokens.output).toEqual({ colors: 3 });
    expect(final.phases.prose.status).toBe("error");
    // Y no sigue adelante fingiendo que puede.
    expect(final.phases.components.status).toBe("pending");
  });

  test("runScan no lanza: el fallo vive en el estado", async () => {
    const registry = fakeRegistry({
      capture: async () => {
        throw new Error("x");
      },
    });
    await expect(runScan(newRun(URL_A, "t0"), registry)).resolves.toBeDefined();
  });
});

describe("fases sin implementar", () => {
  test("se marcan `unavailable` y paran la cadena en vez de fingir", async () => {
    // Solo capture existe: es exactamente el estado del sprint hoy.
    const final = await runScan(newRun(URL_A, "t0"), { capture: async () => "html" });

    expect(final.phases.capture.status).toBe("done");
    expect(final.phases.tokens.status).toBe("unavailable");
    expect(final.phases.prose.status).toBe("pending");
  });
});

describe("persistencia", () => {
  test("cada transición se escribe, no solo el final", async () => {
    const escrituras: number[] = [];
    await runScan(newRun(URL_A, "t0"), fakeRegistry(), {
      onChange: () => escrituras.push(1),
    });
    // 5 fases × (running + done) = 10 como mínimo.
    expect(escrituras.length).toBeGreaterThanOrEqual(10);
  });

  test("avisa cuando no se puede guardar en vez de tragárselo", async () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError: quota");
      },
      removeItem: () => {},
    };

    const avisos: string[] = [];
    await runScan(newRun(URL_A, "t0"), fakeRegistry(), {
      onStorageProblem: (r) => avisos.push(r),
    });

    expect(avisos.length).toBeGreaterThan(0);
    expect(avisos[0]).toContain("no cabe");
  });

  test("un escaneo guardado por una versión futura se ignora", () => {
    store.set(RUN_STORAGE_KEY, JSON.stringify({ version: 99, url: URL_A, phases: {} }));
    expect(loadRun()).toBeNull();
  });

  test("basura en la clave no revienta", () => {
    store.set(RUN_STORAGE_KEY, "{roto");
    expect(loadRun()).toBeNull();
  });
});

describe("ayudas", () => {
  test("nextPhase señala la primera no terminada", async () => {
    const run = newRun(URL_A, "t0");
    expect(nextPhase(run)).toBe("capture");

    const final = await runScan(run, fakeRegistry());
    expect(nextPhase(final)).toBeNull();
  });

  test("collectOutputs solo devuelve las fases terminadas", () => {
    const run = newRun(URL_A, "t0");
    run.phases.capture = { status: "done", attempts: 1, output: "html" };
    run.phases.tokens = { status: "error", attempts: 2, error: "x" };

    expect(collectOutputs(run)).toEqual({ capture: "html" });
  });
});
