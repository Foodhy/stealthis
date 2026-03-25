import { Hono } from "hono";
import { cors } from "hono/cors";
import catalogData from "./catalog.json";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

interface ResourceEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  type: string;
  tags: string[];
  tech: string[];
  difficulty: string;
  targets: string[];
  preview?: string;
  labRoute?: string;
  license: string;
  createdAt: string;
  updatedAt: string;
  snippets: Record<string, string>;
}

interface CatalogFile {
  generatedAt: string;
  count: number;
  resources: ResourceEntry[];
}

function parseCatalogImport(raw: unknown): CatalogFile {
  const candidate =
    raw && typeof raw === "object" && "default" in raw
      ? (raw as { default: unknown }).default
      : raw;

  if (typeof candidate === "string") {
    return JSON.parse(candidate) as CatalogFile;
  }

  if (candidate instanceof ArrayBuffer) {
    return JSON.parse(new TextDecoder().decode(candidate)) as CatalogFile;
  }

  if (ArrayBuffer.isView(candidate)) {
    return JSON.parse(new TextDecoder().decode(candidate)) as CatalogFile;
  }

  if (
    candidate &&
    typeof candidate === "object" &&
    "resources" in candidate &&
    Array.isArray((candidate as CatalogFile).resources)
  ) {
    return candidate as CatalogFile;
  }

  throw new Error("Invalid catalog import format.");
}

const catalog = parseCatalogImport(catalogData);

// -----------------------------------------------------------------------
// MCP Tool definitions
// -----------------------------------------------------------------------

const MCP_TOOLS = [
  {
    name: "list_resources",
    description:
      "List all available resources in the StealThis.dev library. Returns metadata for each resource including title, description, category, difficulty, and available code targets.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
            "web-animations",
            "web-pages",
            "ui-components",
            "patterns",
            "components",
            "pages",
            "prompts",
            "skills",
            "mcp-servers",
            "architectures",
            "boilerplates",
            "remotion",
            "database-schemas",
          ],
          description: "Filter by resource category.",
        },
        difficulty: {
          type: "string",
          enum: ["easy", "med", "hard"],
          description: "Filter by difficulty level.",
        },
        tech: {
          type: "string",
          description: "Filter by technology (e.g. 'gsap', 'css', 'react').",
        },
      },
    },
  },
  {
    name: "get_resource",
    description:
      "Get full metadata for a specific resource by its slug, including all available code targets and links.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: {
        slug: {
          type: "string",
          description: "Resource slug (e.g. 'scroll-fade', 'glass-card').",
        },
      },
    },
  },
  {
    name: "get_snippet",
    description:
      "Get the actual code snippet for a resource and a specific target (html/css/js/react/etc.).",
    inputSchema: {
      type: "object",
      required: ["slug", "target"],
      properties: {
        slug: {
          type: "string",
          description: "Resource slug.",
        },
        target: {
          type: "string",
          enum: [
            "html",
            "css",
            "js",
            "react",
            "next",
            "vue",
            "svelte",
            "astro",
            "schema-sql",
            "seed-sql",
            "queries-sql",
            "diagram-mmd",
            "schema-dbml",
          ],
          description: "Code target.",
        },
      },
    },
  },
  {
    name: "search",
    description: "Search resources by keyword across titles, descriptions, tags, and tech stack.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "Search query string.",
        },
      },
    },
  },
  {
    name: "get_lab",
    description: "Get the full-screen demo URL for a resource in the StealThis Lab.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: {
        slug: {
          type: "string",
          description: "Resource slug.",
        },
      },
    },
  },
];

// -----------------------------------------------------------------------
// Tool handlers
// -----------------------------------------------------------------------

function handleListResources(args: Record<string, string>) {
  let resources = [...catalog.resources];

  if (args.category) resources = resources.filter((r) => r.category === args.category);
  if (args.difficulty) resources = resources.filter((r) => r.difficulty === args.difficulty);
  if (args.tech) resources = resources.filter((r) => r.tech.includes(args.tech));

  const items = resources.map((r) => ({
    slug: r.slug,
    title: r.title,
    description: r.description,
    category: r.category,
    difficulty: r.difficulty,
    targets: r.targets,
    tech: r.tech,
    tags: r.tags,
    labRoute: r.labRoute,
    hasCodepenExamples: Array.isArray(r.codepenExamples) && r.codepenExamples.length > 0,
    resourceUrl: `https://stealthis.dev/r/${r.slug}`,
  }));

  return `Found ${items.length} resource(s):\n\n${JSON.stringify(items, null, 2)}`;
}

function handleGetResource(args: Record<string, string>) {
  const resource = catalog.resources.find((r) => r.slug === args.slug);
  if (!resource) return `Resource '${args.slug}' not found.`;

  const { snippets, ...meta } = resource;
  return JSON.stringify(
    {
      ...meta,
      availableSnippets: Object.keys(snippets),
      resourceUrl: `https://stealthis.dev/r/${resource.slug}`,
      labUrl: resource.labRoute ? `https://lab.stealthis.dev${resource.labRoute}` : null,
    },
    null,
    2
  );
}

function handleGetSnippet(args: Record<string, string>) {
  const resource = catalog.resources.find((r) => r.slug === args.slug);
  if (!resource) return `Resource '${args.slug}' not found.`;

  const code = resource.snippets[args.target];
  if (!code) {
    return `Target '${args.target}' not available for '${args.slug}'. Available: ${Object.keys(resource.snippets).join(", ")}`;
  }

  return `// ${resource.title} — ${args.target}\n// Source: https://stealthis.dev/r/${args.slug}\n\n${code}`;
}

function handleSearch(args: Record<string, string>) {
  const query = args.query.toLowerCase().trim();
  const results = catalog.resources.filter(
    (r) =>
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some((t) => t.toLowerCase().includes(query)) ||
      r.tech.some((t) => t.toLowerCase().includes(query)) ||
      r.category.toLowerCase().includes(query)
  );

  if (results.length === 0) return `No resources found for query: "${args.query}"`;

  const items = results.map((r) => ({
    slug: r.slug,
    title: r.title,
    description: r.description,
    category: r.category,
    difficulty: r.difficulty,
    targets: r.targets,
    resourceUrl: `https://stealthis.dev/r/${r.slug}`,
  }));

  return `Found ${items.length} result(s) for "${args.query}":\n\n${JSON.stringify(items, null, 2)}`;
}

function handleGetLab(args: Record<string, string>) {
  const resource = catalog.resources.find((r) => r.slug === args.slug);
  if (!resource) return `Resource '${args.slug}' not found.`;
  if (!resource.labRoute) return `Resource '${args.slug}' has no lab demo.`;

  return JSON.stringify(
    {
      slug: resource.slug,
      title: resource.title,
      labUrl: `https://lab.stealthis.dev${resource.labRoute}`,
      resourceUrl: `https://stealthis.dev/r/${resource.slug}`,
    },
    null,
    2
  );
}

function callTool(name: string, args: Record<string, string>): string {
  switch (name) {
    case "list_resources":
      return handleListResources(args);
    case "get_resource":
      return handleGetResource(args);
    case "get_snippet":
      return handleGetSnippet(args);
    case "search":
      return handleSearch(args);
    case "get_lab":
      return handleGetLab(args);
    default:
      return `Unknown tool: ${name}`;
  }
}

// -----------------------------------------------------------------------
// MCP JSON-RPC handler (Streamable HTTP transport)
// -----------------------------------------------------------------------

function mcpResponse(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function mcpError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

// -----------------------------------------------------------------------
// Hono app
// -----------------------------------------------------------------------

const app = new Hono();

app.use("/*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }));

// -----------------------------------------------------------------------
// MCP Streamable HTTP endpoint
// Spec: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
// -----------------------------------------------------------------------

app.post("/mcp", async (c) => {
  let body: { jsonrpc: string; id: unknown; method: string; params?: Record<string, unknown> };

  try {
    body = await c.req.json();
  } catch {
    return c.json(mcpError(null, -32700, "Parse error"), 400);
  }

  const { id, method, params } = body;

  // Notifications — no response
  if (method === "notifications/initialized") {
    return new Response(null, { status: 204 });
  }

  if (method === "ping") {
    return c.json(mcpResponse(id, {}));
  }

  if (method === "initialize") {
    return c.json(
      mcpResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "stealthis-mcp", version: "1.0.0" },
      })
    );
  }

  if (method === "tools/list") {
    return c.json(mcpResponse(id, { tools: MCP_TOOLS }));
  }

  if (method === "tools/call") {
    const { name, arguments: args = {} } = params as {
      name: string;
      arguments?: Record<string, string>;
    };
    const text = callTool(name, args);
    return c.json(
      mcpResponse(id, {
        content: [{ type: "text", text }],
      })
    );
  }

  return c.json(mcpError(id, -32601, `Method not found: ${method}`), 404);
});

// -----------------------------------------------------------------------
// REST endpoints (legacy / direct HTTP access)
// -----------------------------------------------------------------------

app.get("/", (c) =>
  c.json({
    name: "StealThis MCP Server",
    version: "1.0.0",
    catalogSize: catalog.count,
    catalogGeneratedAt: catalog.generatedAt,
    mcp: "POST /mcp  (MCP Streamable HTTP — for Claude, Cursor, etc.)",
    rest: [
      "GET /tools/list_resources",
      "GET /tools/get_resource/:slug",
      "GET /tools/get_snippet/:slug/:target",
      "GET /tools/search?q=",
      "GET /tools/get_lab/:slug",
    ],
  })
);

app.get("/tools/list_resources", (c) => {
  const { category, difficulty, tech } = c.req.query();
  const result = handleListResources({ category, difficulty, tech });
  return c.json(JSON.parse(result.slice(result.indexOf("["))));
});

app.get("/tools/get_resource/:slug", (c) => {
  const result = handleGetResource({ slug: c.req.param("slug") });
  if (result.startsWith("Resource")) return c.json({ error: result }, 404);
  return c.json(JSON.parse(result));
});

app.get("/tools/get_snippet/:slug/:target", (c) => {
  const result = handleGetSnippet({ slug: c.req.param("slug"), target: c.req.param("target") });
  if (!result.startsWith("//")) return c.json({ error: result }, 404);
  return c.text(result);
});

app.get("/tools/search", (c) => {
  const q = c.req.query("q") ?? "";
  if (!q) return c.json({ error: "Missing ?q=" }, 400);
  const result = handleSearch({ query: q });
  return c.text(result);
});

app.get("/tools/get_lab/:slug", (c) => {
  const result = handleGetLab({ slug: c.req.param("slug") });
  if (result.startsWith("Resource") || result.startsWith("Resource"))
    return c.json({ error: result }, 404);
  return c.json(JSON.parse(result));
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
