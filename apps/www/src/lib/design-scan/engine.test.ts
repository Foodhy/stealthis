import { beforeEach, describe, expect, test } from "bun:test";
import {
  MAX_ATTEMPTS,
  type PhaseRegistry,
  answerBrief,
  collectOutputs,
  nextPhase,
  resumeOrStart,
  retryPhase,
  runScan,
  stopRun,
  waitingPhase,
} from "./engine";
import { RUN_STORAGE_KEY, loadRun, saveRun } from "./store";
import { type RunState, emptyBrief, newRun } from "./types";

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
    replica: async () => "<main>…</main>",
    components: async () => ["button"],
    recreate: async () => ["<button>"],
    ...overrides,
  };
}

/** La puerta de la pausa, tal como la declara la página. */
const GATES = [{ id: "brief" as const, isAnswered: (r: RunState) => Boolean(r.brief.answeredAt) }];

/** Un escaneo con la pausa ya contestada, para probar el recorrido completo. */
function answeredRun(url = URL_A) {
  const run = newRun(url, "t0");
  return { ...run, brief: { ...emptyBrief(), answeredAt: "t0" } };
}

describe("un escaneo completo", () => {
  test("recorre las siete fases en orden y guarda cada salida", async () => {
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

    const final = await runScan(answeredRun(), registry, { gates: GATES });

    expect(visitadas).toEqual(["capture", "tokens"]);
    expect(Object.values(final.phases).every((p) => p.status === "done")).toBe(true);
    expect(final.phases.capture.output).toBe("html");
    expect(final.phases.tokens.output).toEqual({ colors: 3 });
  });

  test("cada fase ve la salida de las anteriores", async () => {
    let vistoPorTokens: unknown;
    await runScan(
      answeredRun(),
      fakeRegistry({
        tokens: async (ctx) => {
          vistoPorTokens = ctx.outputs.capture;
          return {};
        },
      }),
      { gates: GATES }
    );

    expect(vistoPorTokens).toBe("html");
  });
});

describe("reanudar — el punto de la tarea", () => {
  test("recargar a mitad continúa donde iba y NO repite lo hecho", async () => {
    // Primera pasada: prose revienta, así que el escaneo se para ahí.
    const primera = await runScan(
      answeredRun(),
      fakeRegistry({
        prose: async () => {
          throw new Error("se cayó la red");
        },
      }),
      { gates: GATES }
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
      }),
      { gates: GATES }
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
    await runScan(answeredRun(), fakeRegistry(), { gates: GATES });
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
      answeredRun(),
      fakeRegistry({
        capture: async () => {
          intentos += 1;
          throw new Error("502");
        },
      }),
      { gates: GATES }
    );

    expect(intentos).toBe(MAX_ATTEMPTS);
    expect(final.phases.capture.status).toBe("error");
    expect(final.phases.capture.error).toBe("502");
  });

  test("si falla al segundo intento, el primero no cuenta como éxito", async () => {
    let intentos = 0;
    const final = await runScan(
      answeredRun(),
      fakeRegistry({
        capture: async () => {
          intentos += 1;
          if (intentos === 1) throw new Error("una vez");
          return "a la segunda";
        },
      }),
      { gates: GATES }
    );

    expect(final.phases.capture.status).toBe("done");
    expect(final.phases.capture.output).toBe("a la segunda");
    expect(final.phases.capture.attempts).toBe(2);
  });

  test("un fallo NO tira el trabajo de las fases anteriores", async () => {
    const final = await runScan(
      answeredRun(),
      fakeRegistry({
        prose: async () => {
          throw new Error("boom");
        },
      }),
      { gates: GATES }
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
    await runScan(answeredRun(), fakeRegistry(), {
      gates: GATES,
      onChange: () => escrituras.push(1),
    });
    // 6 fases con runner × (running + done) + la puerta = 13 como mínimo.
    expect(escrituras.length).toBeGreaterThanOrEqual(13);
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
    await runScan(answeredRun(), fakeRegistry(), {
      gates: GATES,
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
    const run = answeredRun();
    expect(nextPhase(run)).toBe("capture");

    const final = await runScan(run, fakeRegistry(), { gates: GATES });
    expect(nextPhase(final)).toBeNull();
  });

  test("collectOutputs solo devuelve las fases terminadas", () => {
    const run = newRun(URL_A, "t0");
    run.phases.capture = { status: "done", attempts: 1, output: "html" };
    run.phases.tokens = { status: "error", attempts: 2, error: "x" };

    expect(collectOutputs(run)).toEqual({ capture: "html" });
  });
});

describe("la pausa — el punto donde entra el usuario", () => {
  const gates = [
    { id: "brief" as const, isAnswered: (r: RunState) => Boolean(r.brief.answeredAt) },
  ];

  test("el pipeline SE PARA en la puerta y no toca lo que viene después", async () => {
    const final = await runScan(newRun(URL_A, "t0"), fakeRegistry(), { gates });

    expect(final.phases.prose.status).toBe("done");
    expect(final.phases.brief.status).toBe("waiting");
    // Lo importante: no se ejecutó nada de lo que va detrás de la puerta.
    expect(final.phases.replica.status).toBe("pending");
    expect(final.phases.components.status).toBe("pending");
  });

  test("esperar NO es un fallo: no se reintenta ni cuenta intentos", async () => {
    const final = await runScan(newRun(URL_A, "t0"), fakeRegistry(), { gates });

    expect(final.phases.brief.status).not.toBe("error");
    expect(final.phases.brief.attempts).toBe(0);
    expect(final.phases.brief.error).toBeUndefined();
  });

  test("waitingPhase dice dónde está esperando, para saber qué enseñar", async () => {
    const final = await runScan(newRun(URL_A, "t0"), fakeRegistry(), { gates });
    expect(waitingPhase(final)).toBe("brief");
  });

  test("la pausa SOBREVIVE a recargar la página", async () => {
    await runScan(newRun(URL_A, "t0"), fakeRegistry(), { gates });

    // "Recarga": se relee de localStorage como haría la página al montar.
    const recuperado = resumeOrStart(URL_A);
    expect(recuperado.phases.brief.status).toBe("waiting");
    expect(recuperado.phases.prose.status).toBe("done");
    expect(waitingPhase(recuperado)).toBe("brief");
  });

  test("al contestar, el escaneo sigue y las fases posteriores reciben el brief", async () => {
    const parado = await runScan(newRun(URL_A, "t0"), fakeRegistry(), { gates });

    let vistoPorReplica: unknown;
    const final = await runScan(
      answerBrief(parado, {
        notes: "el hero lleva dos botones",
        components: ["button-primary", "card"],
        pinned: { card: "dental-appointment-card" },
        reference: "<section>…</section>",
      }),
      fakeRegistry({
        replica: async (ctx) => {
          vistoPorReplica = ctx.brief;
          return "html";
        },
      }),
      { gates }
    );

    expect(final.phases.brief.status).toBe("done");
    expect(final.phases.replica.status).toBe("done");
    expect(vistoPorReplica).toMatchObject({
      notes: "el hero lleva dos botones",
      components: ["button-primary", "card"],
      pinned: { card: "dental-appointment-card" },
    });
  });

  test("contestar dejándolo todo vacío TAMBIÉN cuenta como contestado", async () => {
    // Sin `answeredAt`, un brief vacío y uno sin contestar serían indistinguibles
    // y el pipeline se quedaría atascado para siempre.
    const parado = await runScan(newRun(URL_A, "t0"), fakeRegistry(), { gates });
    const final = await runScan(answerBrief(parado, emptyBrief()), fakeRegistry(), { gates });

    expect(final.phases.brief.status).toBe("done");
    expect(nextPhase(final)).toBeNull();
  });

  test("si nadie declara la puerta, se comporta como una fase sin construir", async () => {
    // No se salta en silencio: `brief` no tiene runner, así que el motor dice
    // que no está disponible y para. Preferible a continuar sin la pausa.
    const final = await runScan(newRun(URL_A, "t0"), fakeRegistry());

    expect(final.phases.brief.status).toBe("unavailable");
    expect(final.phases.replica.status).toBe("pending");
  });
});

describe("migración de un escaneo guardado en v1", () => {
  test("un escaneo viejo se recupera y pasa por la pausa en vez de saltársela", () => {
    // v1 no tenía ni las fases nuevas ni el brief.
    store.set(
      RUN_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        url: URL_A,
        startedAt: "t0",
        updatedAt: "t0",
        phases: {
          capture: { status: "done", attempts: 1, output: "html" },
          tokens: { status: "done", attempts: 1, output: {} },
          prose: { status: "done", attempts: 1, output: {} },
          components: { status: "pending", attempts: 0 },
          recreate: { status: "pending", attempts: 0 },
        },
      })
    );

    const recuperado = loadRun();
    expect(recuperado?.phases.capture.output).toBe("html");
    expect(recuperado?.phases.brief.status).toBe("pending");
    expect(recuperado?.phases.replica.status).toBe("pending");
    expect(recuperado?.brief.answeredAt).toBeUndefined();
  });
});

describe("parar el escaneo", () => {
  test("la fase que corría vuelve a pendiente, NO a error", async () => {
    // Pararlo es una decisión de la persona; el escaneo no debe quedar marcado
    // como si algo hubiera fallado.
    const run = newRun(URL_A, "t0");
    run.phases.capture = { status: "done", attempts: 1, output: "html" };
    run.phases.tokens = { status: "running", attempts: 1, startedAt: "t1" };

    const parado = stopRun(run);

    expect(parado.phases.tokens.status).toBe("pending");
    expect(parado.phases.tokens.error).toBeUndefined();
    expect(parado.phases.capture.output).toBe("html");
  });

  test("no gasta un reintento por haber pulsado Stop", () => {
    const run = newRun(URL_A, "t0");
    run.phases.prose = { status: "running", attempts: 1 };

    expect(stopRun(run).phases.prose.attempts).toBe(0);
  });

  test("tras parar, el escaneo se puede reanudar y sigue donde iba", async () => {
    const run = newRun(URL_A, "t0");
    run.phases.capture = { status: "done", attempts: 1, output: "html" };
    run.phases.tokens = { status: "running", attempts: 1 };

    const rehechas: string[] = [];
    const final = await runScan(
      { ...stopRun(run), brief: { ...emptyBrief(), answeredAt: "t0" } },
      fakeRegistry({
        capture: async () => {
          rehechas.push("capture");
          return "otra vez";
        },
      }),
      { gates: GATES }
    );

    expect(rehechas).toEqual([]); // lo hecho no se repite
    expect(final.phases.tokens.status).toBe("done");
  });

  test("una parada sobre un escaneo quieto no cambia nada", () => {
    const run = newRun(URL_A, "t0");
    expect(stopRun(run).phases).toEqual(run.phases);
  });
});
