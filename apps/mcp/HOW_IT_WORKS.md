# How `apps/mcp` works (quick guide)

This service has **2 usage modes**:

1. **Real MCP** for AI clients (Claude, Cursor, etc): `POST /mcp`
2. **Direct REST** for scripts/humans: `GET /tools/*`

If it looked like "there are no endpoints", it's usually because the main MCP endpoint is not `GET` — it's **JSON-RPC over `POST /mcp`**.

## What it is for

`apps/mcp` exposes the StealThis resource catalog so an AI agent can:

- discover resources (`list_resources`)
- read metadata (`get_resource`)
- fetch ready-to-copy code (`get_snippet`)
- search by keywords (`search`)
- open a lab demo (`get_lab`)

## Main endpoint (MCP)

- URL: `https://mcp.stealthis.dev/mcp` (prod) or `http://localhost:8787/mcp` (local)
- Protocol: JSON-RPC 2.0 over HTTP
- Implemented methods:
  - `initialize`
  - `tools/list`
  - `tools/call`
  - `ping`
  - `notifications/initialized` (no response, 204)

### Minimal example: list tools via MCP

```bash
curl -sS https://mcp.stealthis.dev/mcp \
  -H 'content-type: application/json' \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/list"
  }'
```

### Minimal example: call a tool via MCP

```bash
curl -sS https://mcp.stealthis.dev/mcp \
  -H 'content-type: application/json' \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"get_snippet",
      "arguments":{"slug":"scroll-fade","target":"react"}
    }
  }'
```

## REST endpoints (direct)

These endpoints are useful for quick tests, scripts, and debugging:

- `GET /`
- `GET /tools/list_resources?category=&difficulty=&tech=`
- `GET /tools/get_resource/:slug`
- `GET /tools/get_snippet/:slug/:target`
- `GET /tools/search?q=...`
- `GET /tools/get_lab/:slug`

Examples:

```bash
curl https://mcp.stealthis.dev/tools/list_resources?category=web-animations&difficulty=easy
curl https://mcp.stealthis.dev/tools/get_resource/scroll-fade
curl https://mcp.stealthis.dev/tools/get_snippet/scroll-fade/react
curl "https://mcp.stealthis.dev/tools/search?q=parallax"
curl https://mcp.stealthis.dev/tools/get_lab/glass-card
```

## Internal data flow

1. The canonical content lives in `packages/content/resources/*`.
2. `bun run --filter @stealthis/mcp catalog` runs `scripts/generate-catalog.ts`.
3. That script generates `apps/mcp/src/catalog.json` (metadata + embedded snippets).
4. The Worker (`src/index.ts`) loads that JSON and serves tools/endpoints without reading disk at runtime.

## Real use cases

1. **Code assistant**: "Give me a React hero with animation" -> `search` tool + `get_snippet`.
2. **Internal playground**: your own UI querying `/tools/list_resources` and displaying snippets.
3. **Automation**: CI script that validates a `slug` exists via `/tools/get_resource/:slug`.
4. **Demo links**: an app using `get_lab` to open full-screen demos on `lab.stealthis.dev`.

## Example questions and answers it delivers

### 1) Discover resources by filters

Question:

```txt
Show me easy web-animations resources built with css
```

Tool used:

```txt
list_resources(category: "web-animations", difficulty: "easy", tech: "css")
```

Expected response (summary):

```json
[
  {
    "slug": "scroll-fade",
    "title": "Scroll Fade",
    "category": "web-animations",
    "difficulty": "easy",
    "targets": ["html", "css", "js", "react"],
    "resourceUrl": "https://stealthis.dev/r/scroll-fade"
  }
]
```

### 2) View full metadata for a resource

Question:

```txt
What does the scroll-fade resource include?
```

Tool used:

```txt
get_resource(slug: "scroll-fade")
```

Expected response (summary):

```json
{
  "slug": "scroll-fade",
  "title": "Scroll Fade",
  "description": "...",
  "category": "web-animations",
  "availableSnippets": ["html", "css", "js", "react"],
  "resourceUrl": "https://stealthis.dev/r/scroll-fade",
  "labUrl": "https://lab.stealthis.dev/web-animations/scroll-fade"
}
```

### 3) Ask for ready-to-use code

Question:

```txt
Give me the react snippet for scroll-fade
```

Tool used:

```txt
get_snippet(slug: "scroll-fade", target: "react")
```

Expected response:

```txt
// Scroll Fade — react
// Source: https://stealthis.dev/r/scroll-fade

import ...
```

### 4) Search by keyword

Question:

```txt
Search for parallax resources
```

Tool used:

```txt
search(query: "parallax")
```

Expected response (summary):

```txt
Found N result(s) for "parallax":
[
  { "slug": "...", "title": "...", "targets": [...], "resourceUrl": "..." }
]
```

### 5) Get a lab demo URL

Question:

```txt
Is there a demo for glass-card?
```

Tool used:

```txt
get_lab(slug: "glass-card")
```

Expected response:

```json
{
  "slug": "glass-card",
  "title": "Glass Card",
  "labUrl": "https://lab.stealthis.dev/ui-components/glass-card",
  "resourceUrl": "https://stealthis.dev/r/glass-card"
}
```

### 6) Common errors (and messages)

- If the `slug` does not exist: `Resource 'slug-x' not found.`
- If you request an unavailable target: `Target 'vue' not available for 'scroll-fade'. Available: html, css, js, react`
- If a search has no results: `No resources found for query: "..."`.

## FAQ

### Why doesn't `apps/www` use this MCP endpoint?

Because `apps/www` consumes content directly from the Astro collection (`getCollection("resources")`) pointing at `packages/content/resources/*` as the canonical source.

That avoids:

- a network dependency between internal services
- extra latency from HTTP-fetching its own backend
- coupling the `www` build to `mcp` availability

In this repo, both `www` and `mcp` read from the same source (`packages/content`), but with different strategies:

- `www`: reads the content collection directly
- `mcp`: generates `src/catalog.json` and serves it via tools/endpoints

### So when should I use `POST /mcp`?

When the consumer is external to the monorepo or is an AI client (Claude/Cursor) that needs standard MCP tools.

### Which endpoint should I use for simple scripts?

Use REST (`/tools/*`) — more direct for `curl`/`fetch` and manual debugging.

### Which endpoint should I use for real MCP compatibility?

Use `POST /mcp`, with `initialize`, `tools/list`, and `tools/call`.

### Why did I add a resource and it doesn't show up in MCP?

Because the MCP catalog is generated at build time. If you change content in `packages/content`, you must run:

```bash
bun run --filter @stealthis/mcp catalog
```

Then restart `dev:mcp` or build/deploy again.

## Local development

```bash
bun run --filter @stealthis/mcp catalog
bun run dev:mcp
# local server: http://localhost:8787
```

Note: if you change content in `packages/content`, regenerate the catalog before testing.
