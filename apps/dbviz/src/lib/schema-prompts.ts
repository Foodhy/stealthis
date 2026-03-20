import type { OllamaChatMessage } from "./ollama";

// ─── System prompt (always first message) ────────────────────────────────────

export const SYSTEM_PROMPT = `You are a PostgreSQL database architect inside DBViz, a browser-based tool powered by PGlite (PostgreSQL in WebAssembly).

OUTPUT RULES:
- Inside ---SCHEMA---, ---SEED---, ---QUERIES--- blocks: output ONLY valid SQL statements. No natural language, no comments explaining placement, no prose. Every line must be valid SQL or a SQL comment (starting with --).
- Outside artifact blocks: use natural language freely.

SQL SYNTAX RULES (PGlite):
- ONLY standard PostgreSQL syntax. NEVER SQL Server, MySQL, or T-SQL.
- Primary keys: BIGSERIAL PRIMARY KEY. Never use identity(1,1) or GENERATED AS IDENTITY.
- Enums: first CREATE TYPE, then CREATE TABLE referencing that type. Example:
  CREATE TYPE order_status AS ENUM ('pending', 'shipped', 'delivered');
  CREATE TABLE orders (id BIGSERIAL PRIMARY KEY, status order_status NOT NULL DEFAULT 'pending');
  Never write ENUM inline like ENUM 'x' | 'y' or ENUM('x','y') inside a column definition.
- Strings: TEXT (not VARCHAR). Timestamps: TIMESTAMPTZ DEFAULT now(). Money: NUMERIC(10,2).
- Identifiers: snake_case, no backticks. Double quotes only if strictly needed.

SCHEMA QUALITY:
- Proper FKs with REFERENCES, NOT NULL, UNIQUE. Indexes on FK columns.
- created_at and updated_at TIMESTAMPTZ DEFAULT now() on every table.
- Order: CREATE TYPE first, then CREATE TABLE in dependency order (referenced tables first), then CREATE INDEX.

GENERAL:
- Be concise and direct.
- Ask max 3 short numbered questions when you need clarification.
- Generate artifacts when you have enough information.`;

// ─── Clarification check ─────────────────────────────────────────────────────

export function buildClarificationMessage(description: string): OllamaChatMessage {
  return {
    role: "user",
    content: `I want to design a database schema for: "${description}"

Evaluate if this description is clear enough to generate a complete schema.

If it IS clear enough (you know the main entities, relationships, and purpose), respond with EXACTLY:
---READY---

If it is NOT clear enough, ask me 2-3 short numbered questions to clarify what I need. Do NOT generate any SQL yet. Just ask questions.`,
  };
}

export function isReadyResponse(text: string): boolean {
  return /---READY---/i.test(text);
}

export function extractQuestions(text: string): string {
  return text.replace(/---READY---/gi, "").trim();
}

// ─── Schema generation ───────────────────────────────────────────────────────

export function buildGenerateMessage(context?: {
  currentSchema?: string;
  currentDiagram?: string;
}): OllamaChatMessage {
  const hasContext = context?.currentSchema?.trim();
  const contextBlock = hasContext
    ? `\n\nCURRENT SCHEMA (build on top of this, do not lose existing tables unless asked):\n\`\`\`sql\n${context?.currentSchema ?? ""}\n\`\`\`\n\nCURRENT DIAGRAM:\n\`\`\`\n${context?.currentDiagram ?? ""}\n\`\`\``
    : "";

  return {
    role: "user",
    content: `Now generate the complete schema artifacts.${contextBlock}

OUTPUT FORMAT — return EXACTLY these four blocks. No markdown fences around the blocks. No extra commentary outside blocks.

---SCHEMA---
(Complete DDL: CREATE TYPE first, then CREATE TABLE in dependency order, then CREATE INDEX. Use BIGSERIAL PRIMARY KEY for IDs.)

---SEED---
(INSERT statements with 3-5 realistic rows per table, in dependency order so FK references exist)

---QUERIES---
(5-8 useful SELECT queries, each with a -- comment. Include JOINs, aggregations, and filters.)

---DIAGRAM---
(Mermaid erDiagram syntax with all tables, columns, types, PK/FK markers, and relationships)

Example schema pattern:
CREATE TYPE order_status AS ENUM ('pending', 'shipped', 'delivered');
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  status order_status NOT NULL DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

Example diagram pattern:
erDiagram
  users {
    bigint id PK
    text email
    text name
    timestamptz created_at
  }
  orders {
    bigint id PK
    bigint user_id FK
    order_status status
    numeric total
    timestamptz created_at
  }
  users ||--o{ orders : "places"

Generate now:`,
  };
}

// ─── Refinement (iterative changes) ──────────────────────────────────────────

export function buildRefinementMessage(
  request: string,
  currentSchema: string,
  currentDiagram: string
): OllamaChatMessage {
  return {
    role: "user",
    content: `${request}

CURRENT SCHEMA:
\`\`\`sql
${currentSchema}
\`\`\`

CURRENT DIAGRAM:
\`\`\`
${currentDiagram}
\`\`\`

If this request is clear, update the schema and output ALL four blocks (---SCHEMA---, ---SEED---, ---QUERIES---, ---DIAGRAM---) with the full updated version.
If you need clarification, ask 1-2 short questions first.`,
  };
}

// ─── Ask mode (question-only) ────────────────────────────────────────────

export function buildAskMessage(question: string, currentSchema?: string): OllamaChatMessage {
  const ctx = currentSchema?.trim()
    ? `\n\nCURRENT SCHEMA for context:\n\`\`\`sql\n${currentSchema}\n\`\`\``
    : "";

  return {
    role: "user",
    content: `[ASK MODE] I have a question. Do NOT generate any SQL or schema artifacts. Just answer concisely and help me think.${ctx}

${question}

If you think I have enough clarity to move forward, suggest: "Ready to plan? Switch to Plan mode." or "Ready to generate? Switch to Execute mode."`,
  };
}

// ─── Plan mode (architecture discussion) ─────────────────────────────────

export function buildPlanMessage(description: string, currentSchema?: string): OllamaChatMessage {
  const ctx = currentSchema?.trim()
    ? `\n\nCURRENT SCHEMA:\n\`\`\`sql\n${currentSchema}\n\`\`\``
    : "";

  return {
    role: "user",
    content: `[PLAN MODE] Help me plan the database architecture. Do NOT generate SQL artifacts yet. Instead, provide:${ctx}

${description}

Respond with a structured plan:
1. **Entities** — list the main tables and their purpose
2. **Relationships** — describe how they connect (1:1, 1:N, N:M)
3. **Key decisions** — data types, constraints, enums, indexes worth noting
4. **Open questions** — anything unclear that could affect the design

Keep it concise. When the plan looks good, I'll switch to Execute mode to generate the actual schema.`,
  };
}

// ─── Execute mode (generate/refine artifacts) ────────────────────────────

export function buildExecuteMessage(instruction: string, currentSchema?: string, currentDiagram?: string): OllamaChatMessage {
  const hasContext = currentSchema?.trim();

  if (hasContext) {
    return buildRefinementMessage(instruction || "Generate/update the schema based on our discussion so far.", currentSchema ?? "", currentDiagram ?? "");
  }

  return {
    role: "user",
    content: `[EXECUTE MODE] ${instruction || "Generate the schema based on our discussion."}

${buildGenerateMessage().content}`,
  };
}

// ─── Name generation ─────────────────────────────────────────────────────────

export function buildNameMessage(schema: string): OllamaChatMessage {
  return {
    role: "user",
    content: `Based on this database schema, generate a SHORT name (2-4 words, lowercase with hyphens) that describes what this database is for. Respond with ONLY the name, nothing else.

Schema:
${schema.slice(0, 500)}`,
  };
}

// ─── Output parsing ──────────────────────────────────────────────────────────

export type ParsedSchemaOutput = {
  schema: string;
  seed: string;
  queries: string;
  diagram: string;
};

export function parseSchemaOutput(raw: string): ParsedSchemaOutput {
  const result: ParsedSchemaOutput = {
    schema: "",
    seed: "",
    queries: "",
    diagram: "",
  };

  const markers = [
    { key: "schema" as const, pattern: /---SCHEMA---/i },
    { key: "seed" as const, pattern: /---SEED---/i },
    { key: "queries" as const, pattern: /---QUERIES---/i },
    { key: "diagram" as const, pattern: /---DIAGRAM---/i },
  ];

  const positions = markers
    .map((m) => {
      const match = m.pattern.exec(raw);
      return match ? { key: m.key, index: match.index, end: match.index + match[0].length } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => a.index - b.index);

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].end;
    const end = i + 1 < positions.length ? positions[i + 1].index : raw.length;
    result[positions[i].key] = cleanBlock(raw.slice(start, end));
  }

  return result;
}

export function hasSchemaMarkers(text: string): boolean {
  return /---SCHEMA---/i.test(text);
}

function cleanBlock(text: string): string {
  return text
    .replace(/^```[\w]*\n?/gm, "")
    .replace(/^```$/gm, "")
    .trim();
}

// ─── Query-focused system prompt ─────────────────────────────────────────────

export const QUERY_SYSTEM_PROMPT = `You are a PostgreSQL query expert inside DBViz, a browser-based schema design tool powered by PGlite.
Your job is to help users write, understand, and optimize SQL queries for their database schema.

RULES FOR ALL RESPONSES:
- Be concise and direct.
- ALWAYS use standard PostgreSQL syntax. NEVER use SQL Server or MySQL syntax.
- Write clear, well-commented queries with -- comments.
- Use meaningful aliases for tables in JOINs (e.g., u for users, o for orders).
- Prefer explicit JOIN syntax (INNER JOIN, LEFT JOIN) over implicit joins.
- Include LIMIT for potentially large result sets.
- Only reference tables and columns that exist in the provided schema.`;

// ─── Query Ask mode ──────────────────────────────────────────────────────────

export function buildQueryAskMessage(question: string, currentSchema: string): OllamaChatMessage {
  return {
    role: "user",
    content: `[ASK MODE] I have a question about querying this database. Do NOT generate SQL. Just explain concisely.

SCHEMA:
\`\`\`sql
${currentSchema}
\`\`\`

${question}

If my question would be better answered with a query, suggest: "Want me to write that query? Switch to Execute mode."`,
  };
}

// ─── Query Plan mode ─────────────────────────────────────────────────────────

export function buildQueryPlanMessage(description: string, currentSchema: string, currentQueries?: string): OllamaChatMessage {
  const qCtx = currentQueries?.trim()
    ? `\n\nEXISTING QUERIES:\n\`\`\`sql\n${currentQueries}\n\`\`\``
    : "";

  return {
    role: "user",
    content: `[PLAN MODE] Help me plan queries for this database. Do NOT write SQL yet. Instead, outline what queries would be useful and why.

SCHEMA:
\`\`\`sql
${currentSchema}
\`\`\`${qCtx}

${description}

Respond with:
1. **Queries to write** — list each query's purpose
2. **Tables involved** — which tables and joins are needed
3. **Considerations** — indexes, performance, edge cases

When the plan looks good, I'll switch to Execute mode to generate the actual SQL.`,
  };
}

// ─── Query Execute mode ──────────────────────────────────────────────────────

export function buildQueryExecuteMessage(instruction: string, currentSchema: string, currentQueries?: string): OllamaChatMessage {
  const qCtx = currentQueries?.trim()
    ? `\n\nEXISTING QUERIES (append to these, do not repeat them):\n\`\`\`sql\n${currentQueries}\n\`\`\``
    : "";

  return {
    role: "user",
    content: `${instruction || "Generate useful queries for this schema."}

SCHEMA:
\`\`\`sql
${currentSchema}
\`\`\`${qCtx}

OUTPUT FORMAT — return EXACTLY this block. No extra commentary outside the block.

---QUERIES---
(SQL queries, each with a -- comment explaining its purpose)

Generate now:`,
  };
}

// ─── Auto-generate queries (one-shot) ────────────────────────────────────────

export function buildAutoGenerateQueriesMessage(currentSchema: string, currentQueries?: string): OllamaChatMessage {
  const qCtx = currentQueries?.trim()
    ? `\n\nEXISTING QUERIES (do not repeat these, generate NEW ones):\n\`\`\`sql\n${currentQueries}\n\`\`\``
    : "";

  return {
    role: "user",
    content: `Generate 6-10 useful SQL queries for this database schema. Include a mix of:
- Basic CRUD reads (list, detail, search)
- JOIN queries across related tables
- Aggregations (counts, sums, averages)
- Filtered/sorted queries for common use cases
- At least one query with a subquery or CTE

SCHEMA:
\`\`\`sql
${currentSchema}
\`\`\`${qCtx}

OUTPUT FORMAT — return EXACTLY this block. No extra commentary outside the block.

---QUERIES---
(SQL queries, each preceded by a -- comment explaining its purpose)

Generate now:`,
  };
}

// ─── Query output parsing ────────────────────────────────────────────────────

export function parseQueryOutput(raw: string): string {
  const match = /---QUERIES---/i.exec(raw);
  if (!match) return "";
  return cleanBlock(raw.slice(match.index + match[0].length));
}

export function hasQueryMarkers(text: string): boolean {
  return /---QUERIES---/i.test(text);
}
