import { describe, expect, test } from "bun:test";
import { resolveComponentNames } from "./resolve-components";

const THIN_SHELL = "<html><body><div id=root></div></body></html>";
const WITH_BUTTON = "<html><body><button>Go</button></body></html>";

describe("resolveComponentNames", () => {
  test("el brief manda cuando trae nombres", () => {
    const r = resolveComponentNames({
      briefComponents: ["hero", "card"],
      html: WITH_BUTTON,
    });
    expect(r.source).toBe("brief");
    expect(r.names).toEqual(["hero", "card"]);
  });

  test("brief vacío usa la estructura deducida", () => {
    const r = resolveComponentNames({
      briefComponents: [],
      html: WITH_BUTTON,
    });
    expect(r.source).toBe("structure");
    expect(r.names).toContain("button-primary");
  });

  test("sin estructura ni prosa, detectComponents rescata botones", () => {
    const r = resolveComponentNames({
      briefComponents: [],
      html: '<html><body><a class="cta" href="/x">Start</a></body></html>',
      structure: { components: [] } as never,
      proseComponents: {},
    });
    expect(["detected", "structure"]).toContain(r.source);
    expect(r.names.length).toBeGreaterThan(0);
  });

  test("cascarón vacío no revienta: defaults mínimos", () => {
    const r = resolveComponentNames({
      briefComponents: [],
      html: THIN_SHELL,
      proseComponents: {},
    });
    expect(r.source).toBe("defaults");
    expect(r.names.length).toBeGreaterThan(0);
    expect(r.note).toBeTruthy();
  });
});
