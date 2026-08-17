import { describe, expect, test } from "bun:test";
import { __testing } from "./client";

const { readNDJsonStream, readSSEStream, readClaudeSSEStream, readGeminiSSEStream } = __testing;

/**
 * Construye una Response cuyo cuerpo llega en los trozos exactos que se le
 * pasen. Es el corazón de estos tests: el bug solo aparece cuando el corte cae
 * en mitad de una línea, cosa que un cuerpo entregado de una vez nunca provoca.
 */
function streamOf(chunks: string[]): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const c of chunks) controller.enqueue(encoder.encode(c));
        controller.close();
      },
    })
  );
}

/** Trocea un texto en fragmentos de tamaño fijo, sin mirar dónde cae el corte. */
function chop(text: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

const sse = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;
const openaiEvent = (t: string) => sse({ choices: [{ delta: { content: t } }] });
const claudeEvent = (t: string) => sse({ type: "content_block_delta", delta: { text: t } });
const geminiEvent = (t: string) => sse({ candidates: [{ content: { parts: [{ text: t }] } }] });

describe("readSSEStream — OpenAI", () => {
  test("un evento partido entre dos chunks no pierde su token", async () => {
    const evento = openaiEvent("hola");
    const corte = Math.floor(evento.length / 2);
    // El corte cae dentro del JSON: es justo el caso que se descartaba.
    const res = streamOf([evento.slice(0, corte), evento.slice(corte)]);

    expect(await readSSEStream(res)).toBe("hola");
  });

  test("troceado byte a byte devuelve el texto completo", async () => {
    const cuerpo = `${["Uno", " dos", " tres"].map(openaiEvent).join("")}data: [DONE]\n\n`;
    const res = streamOf(chop(cuerpo, 1));

    expect(await readSSEStream(res)).toBe("Uno dos tres");
  });

  test("mismo resultado troceando de mil maneras distintas", async () => {
    const cuerpo = Array.from({ length: 40 }, (_, i) => openaiEvent(`t${i} `)).join("");
    const esperado = Array.from({ length: 40 }, (_, i) => `t${i} `).join("");

    for (const size of [1, 2, 3, 7, 13, 64, 999]) {
      const got = await readSSEStream(streamOf(chop(cuerpo, size)));
      expect(got, `trozos de ${size}`).toBe(esperado);
    }
  });

  test("[DONE] corta la lectura: lo que venga detrás se ignora", async () => {
    const cuerpo = `${openaiEvent("bueno")}data: [DONE]\n\n${openaiEvent("no deberia salir")}`;
    expect(await readSSEStream(streamOf([cuerpo]))).toBe("bueno");
  });

  test("un evento sin salto de línea final tampoco se pierde", async () => {
    const cuerpo = `data: ${JSON.stringify({ choices: [{ delta: { content: "final" } }] })}`;
    expect(await readSSEStream(streamOf([cuerpo]))).toBe("final");
  });

  test("terminadores \\r\\n del servidor", async () => {
    const cuerpo = `data: ${JSON.stringify({ choices: [{ delta: { content: "crlf" } }] })}\r\n\r\n`;
    expect(await readSSEStream(streamOf([cuerpo]))).toBe("crlf");
  });

  test("onToken recibe cada token una sola vez", async () => {
    const cuerpo = ["a", "b", "c"].map(openaiEvent).join("");
    const vistos: string[] = [];
    await readSSEStream(streamOf(chop(cuerpo, 5)), (t) => vistos.push(t));
    expect(vistos).toEqual(["a", "b", "c"]);
  });
});

describe("readClaudeSSEStream", () => {
  test("evento partido", async () => {
    const evento = claudeEvent("respuesta");
    const corte = Math.floor(evento.length / 2);
    expect(await readClaudeSSEStream(streamOf([evento.slice(0, corte), evento.slice(corte)]))).toBe(
      "respuesta"
    );
  });

  test("ignora los eventos que no son content_block_delta", async () => {
    const cuerpo =
      sse({ type: "message_start" }) + claudeEvent("solo esto") + sse({ type: "message_stop" });
    expect(await readClaudeSSEStream(streamOf(chop(cuerpo, 3)))).toBe("solo esto");
  });
});

describe("readGeminiSSEStream", () => {
  test("evento partido", async () => {
    const evento = geminiEvent("gemini");
    const corte = Math.floor(evento.length / 2);
    expect(await readGeminiSSEStream(streamOf([evento.slice(0, corte), evento.slice(corte)]))).toBe(
      "gemini"
    );
  });
});

describe("readNDJsonStream — Ollama", () => {
  const extractor = (p: Record<string, unknown>) =>
    ((p.message as { content?: string } | undefined)?.content ?? "") as string;

  test("una línea NDJSON partida entre chunks", async () => {
    const linea = `${JSON.stringify({ message: { content: "ollama" } })}\n`;
    const corte = Math.floor(linea.length / 2);
    const res = streamOf([linea.slice(0, corte), linea.slice(corte)]);

    expect(await readNDJsonStream(res, extractor)).toBe("ollama");
  });

  test("varias líneas troceadas byte a byte", async () => {
    const cuerpo = ["uno ", "dos ", "tres"]
      .map((c) => `${JSON.stringify({ message: { content: c } })}\n`)
      .join("");
    expect(await readNDJsonStream(streamOf(chop(cuerpo, 1)), extractor)).toBe("uno dos tres");
  });

  test("la última línea sin salto final se procesa", async () => {
    const cuerpo = JSON.stringify({ message: { content: "sin salto" } });
    expect(await readNDJsonStream(streamOf([cuerpo]), extractor)).toBe("sin salto");
  });
});

describe("multibyte", () => {
  test("un carácter UTF-8 partido entre dos chunks no se corrompe", async () => {
    const evento = openaiEvent("café ñandú 🎨");
    const bytes = new TextEncoder().encode(evento);
    // Corte a mitad de los bytes: cae dentro de algún carácter multibyte.
    const mitad = Math.floor(bytes.length / 2);
    const res = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(bytes.slice(0, mitad));
          controller.enqueue(bytes.slice(mitad));
          controller.close();
        },
      })
    );

    expect(await readSSEStream(res)).toBe("café ñandú 🎨");
  });
});
