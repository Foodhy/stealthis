import { describe, expect, test } from "bun:test";
import { SYSTEM_MONO, SYSTEM_SANS, SYSTEM_SERIF, fallbackFor, fontStack } from "./fonts";

describe("elegir el respaldo", () => {
  test("una serif cae en serif, no en sans", () => {
    // Fraunces con respaldo sans cambiaría el carácter de la página entera.
    expect(fallbackFor("Fraunces")).toBe(SYSTEM_SERIF);
    expect(fallbackFor("Playfair Display")).toBe(SYSTEM_SERIF);
  });

  test("una mono cae en mono", () => {
    expect(fallbackFor("Geist Mono")).toBe(SYSTEM_MONO);
  });

  test("lo demás cae en sans", () => {
    expect(fallbackFor("Inter")).toBe(SYSTEM_SANS);
    expect(fallbackFor("Public Sans")).toBe(SYSTEM_SANS);
  });
});

describe("la declaración que se emite", () => {
  test("en modo sistema NO se pide la fuente original", () => {
    // Es lo que garantiza que el texto se vea bien sin descargar nada.
    const stack = fontStack("Fraunces", "system");
    expect(stack).not.toContain("Fraunces");
    expect(stack).toBe(SYSTEM_SERIF);
  });

  test("en modo original va primero, pero SIEMPRE con respaldo", () => {
    const stack = fontStack("Fraunces", "extracted");
    expect(stack.startsWith("Fraunces,")).toBe(true);
    expect(stack).toContain("Georgia");
  });

  test("los nombres con espacios se citan, como exige CSS", () => {
    expect(fontStack("Public Sans", "extracted").startsWith('"Public Sans",')).toBe(true);
  });

  test("un nombre ya citado no se cita dos veces", () => {
    expect(fontStack('"Public Sans"', "extracted")).not.toContain('""');
  });

  test("sin familia, la pila del sistema", () => {
    expect(fontStack(undefined, "extracted")).toBe(SYSTEM_SANS);
  });

  test("nunca se emite una familia sin respaldo — el fallo que motivó esto", () => {
    for (const family of ["Fraunces", "Inter", "Geist Mono", "Cualquiera"]) {
      for (const mode of ["system", "extracted"] as const) {
        expect(fontStack(family, mode).split(",").length).toBeGreaterThan(1);
      }
    }
  });
});
