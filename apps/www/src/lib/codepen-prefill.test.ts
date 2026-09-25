import { describe, expect, test } from "bun:test";
import { combinedHtmlCssCopy, stripMcpSnippetHeader } from "./codepen-prefill";

describe("stripMcpSnippetHeader", () => {
  test("quita las líneas // del MCP", () => {
    const raw = `// Filter Search Bar — html
// Source: https://stealthis.dev/r/filter-search-bar

<div class="x"></div>`;
    expect(stripMcpSnippetHeader(raw)).toBe('<div class="x"></div>');
  });
});

describe("combinedHtmlCssCopy", () => {
  test("junta html y css con separadores", () => {
    expect(combinedHtmlCssCopy("<p>a</p>", "p{color:red}")).toContain("<!-- HTML -->");
    expect(combinedHtmlCssCopy("<p>a</p>", "p{color:red}")).toContain("/* CSS */");
  });
});
