import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SQL } from "bun";

type CommandMode = "check" | "pull";

type SupabaseImportConfig = {
  dbUrl: string;
  schema: string;
  outputDir: string;
  draftSlug: string | null;
  draftTitle: string;
  draftDescription: string;
  draftOverwrite: boolean;
};

type ConnectionRow = {
  current_database: string;
  current_user: string;
  version: string;
};

type TableRow = {
  table_name: string;
};

type ColumnRow = {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
  ordinal_position: number;
};

type ConstraintColumnRow = {
  constraint_name: string;
  table_name: string;
  column_name: string;
};

type ForeignKeyRow = {
  constraint_name: string;
  table_name: string;
  column_name: string;
  referenced_table: string;
  referenced_column: string;
};

type IndexRow = {
  table_name: string;
  index_name: string;
  index_def: string;
};

type SnapshotTable = {
  name: string;
  columns: ColumnRow[];
  primaryKeyColumns: string[];
  uniqueColumns: string[];
};

type Snapshot = {
  schema: string;
  generatedAtISO: string;
  tables: SnapshotTable[];
  foreignKeys: ForeignKeyRow[];
  indexes: IndexRow[];
};

type PullArtifacts = {
  snapshotJson: string;
  schemaSql: string;
  diagramMmd: string;
  seedSql: string;
  queriesSql: string;
};

const IDENTIFIER_PATTERN = /^[a-z_][a-z0-9_]*$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_SCHEMA = "public";
const DEFAULT_OUTPUT_ROOT = path.resolve(import.meta.dir, "../.imports");
const RESOURCE_ROOT = path.resolve(import.meta.dir, "../../../packages/content/resources");

function printUsage() {
  console.log("Usage:");
  console.log("  bun scripts/supabase-import.ts check");
  console.log("  bun scripts/supabase-import.ts pull [--draft] [--draft-slug my-schema]");
  console.log("");
  console.log("Required env vars:");
  console.log("  DBVIZ_SUPABASE_DB_URL");
  console.log("");
  console.log("Optional env vars:");
  console.log("  DBVIZ_SUPABASE_SCHEMA (default: public)");
  console.log("  DBVIZ_SUPABASE_OUTPUT_DIR (default: apps/dbviz/.imports)");
  console.log("  DBVIZ_SUPABASE_DRAFT_SLUG (optional, creates resource draft)");
  console.log("  DBVIZ_SUPABASE_DRAFT_TITLE (optional)");
  console.log("  DBVIZ_SUPABASE_DRAFT_DESCRIPTION (optional)");
  console.log("  DBVIZ_SUPABASE_DRAFT_OVERWRITE (default: false)");
}

function parseMode(args: string[]): CommandMode {
  const modeArg =
    args
      .slice(2)
      .find((token) => token.trim().length > 0 && !token.startsWith("--"))
      ?.trim()
      .toLowerCase() ?? "check";
  if (modeArg === "check" || modeArg === "pull") return modeArg;

  throw new Error(`Invalid mode "${modeArg}". Use "check" or "pull".`);
}

function readArgValue(args: string[], key: string): string | null {
  const prefixed = `${key}=`;
  const fromEquals = args.find((token) => token.startsWith(prefixed));
  if (fromEquals) {
    return fromEquals.slice(prefixed.length).trim();
  }

  const index = args.indexOf(key);
  if (index === -1) return null;
  const next = args[index + 1];
  if (!next || next.startsWith("--")) return null;
  return next.trim();
}

function hasArg(args: string[], key: string): boolean {
  return args.includes(key);
}

function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function assertSafeIdentifier(value: string, fieldName: string): void {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`${fieldName} must be a simple SQL identifier (letters, numbers, underscore).`);
  }
}

function assertSafeSlug(value: string, fieldName: string): void {
  if (!SLUG_PATTERN.test(value)) {
    throw new Error(`${fieldName} must be kebab-case (letters, numbers, hyphen).`);
  }
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function resolveOutputDir(value: string): string {
  if (path.isAbsolute(value)) return value;
  return path.resolve(process.cwd(), value);
}

function readConfig(args: string[]): SupabaseImportConfig {
  const dbUrl = process.env.DBVIZ_SUPABASE_DB_URL?.trim() ?? "";
  if (!dbUrl) {
    throw new Error("Missing DBVIZ_SUPABASE_DB_URL.");
  }

  const schema = process.env.DBVIZ_SUPABASE_SCHEMA?.trim() || DEFAULT_SCHEMA;
  assertSafeIdentifier(schema, "DBVIZ_SUPABASE_SCHEMA");

  const outputDirRaw = process.env.DBVIZ_SUPABASE_OUTPUT_DIR?.trim() || DEFAULT_OUTPUT_ROOT;
  const outputDir = resolveOutputDir(outputDirRaw);

  const draftEnabled = hasArg(args, "--draft");
  const draftSlugArg = readArgValue(args, "--draft-slug");
  const draftSlugEnv = process.env.DBVIZ_SUPABASE_DRAFT_SLUG?.trim() ?? "";
  const draftSlugRaw = draftSlugArg || draftSlugEnv;
  const draftSlug = draftEnabled || draftSlugRaw ? draftSlugRaw || `supabase-${schema}-import` : "";
  if (draftSlug) {
    assertSafeSlug(draftSlug, "Draft slug");
  }

  const draftTitleArg = readArgValue(args, "--draft-title");
  const draftTitleEnv = process.env.DBVIZ_SUPABASE_DRAFT_TITLE?.trim() ?? "";
  const draftTitle =
    draftTitleArg || draftTitleEnv || slugToTitle(draftSlug || `supabase-${schema}`);

  const draftDescriptionArg = readArgValue(args, "--draft-description");
  const draftDescriptionEnv = process.env.DBVIZ_SUPABASE_DRAFT_DESCRIPTION?.trim() ?? "";
  const draftDescription =
    draftDescriptionArg ||
    draftDescriptionEnv ||
    `Imported relational schema scaffold from Supabase (${schema}).`;

  const draftOverwrite =
    hasArg(args, "--draft-overwrite") ||
    parseBooleanFlag(process.env.DBVIZ_SUPABASE_DRAFT_OVERWRITE);

  return {
    dbUrl,
    schema,
    outputDir,
    draftSlug: draftSlug || null,
    draftTitle,
    draftDescription,
    draftOverwrite,
  };
}

function maskDbUrl(value: string): string {
  return value.replace(/\/\/([^:/?#]+):([^@/]+)@/g, "//$1:***@");
}

function quoteIdent(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function mapDataTypeForMermaid(dataType: string): string {
  return dataType.toLowerCase().replace(/\s+/g, "_");
}

function mapDataTypeForSql(dataType: string): string {
  return dataType;
}

function toSqlArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

async function checkConnection(sql: ReturnType<typeof SQL>): Promise<ConnectionRow> {
  const rows = toSqlArray<ConnectionRow>(
    await sql.unsafe(
      "select current_database() as current_database, current_user as current_user, version() as version;"
    )
  );
  const row = rows.at(0);
  if (!row) {
    throw new Error("Connection check returned no rows.");
  }

  return row;
}

async function buildSnapshot(sql: ReturnType<typeof SQL>, schema: string): Promise<Snapshot> {
  const tables = toSqlArray<TableRow>(
    await sql.unsafe(
      `select table_name
       from information_schema.tables
       where table_schema = '${schema}' and table_type = 'BASE TABLE'
       order by table_name;`
    )
  );

  const columns = toSqlArray<ColumnRow>(
    await sql.unsafe(
      `select
         table_name,
         column_name,
         case
           when data_type = 'USER-DEFINED' then udt_name
           else data_type
         end as data_type,
         is_nullable,
         column_default,
         ordinal_position
       from information_schema.columns
       where table_schema = '${schema}'
       order by table_name, ordinal_position;`
    )
  );

  const primaryKeyColumns = toSqlArray<ConstraintColumnRow>(
    await sql.unsafe(
      `select
         tc.constraint_name,
         tc.table_name,
         kcu.column_name
       from information_schema.table_constraints tc
       join information_schema.key_column_usage kcu
         on tc.constraint_name = kcu.constraint_name
        and tc.table_schema = kcu.table_schema
       where tc.table_schema = '${schema}'
         and tc.constraint_type = 'PRIMARY KEY'
       order by tc.table_name, kcu.ordinal_position;`
    )
  );

  const uniqueColumns = toSqlArray<ConstraintColumnRow>(
    await sql.unsafe(
      `select
         tc.constraint_name,
         tc.table_name,
         kcu.column_name
       from information_schema.table_constraints tc
       join information_schema.key_column_usage kcu
         on tc.constraint_name = kcu.constraint_name
        and tc.table_schema = kcu.table_schema
       where tc.table_schema = '${schema}'
         and tc.constraint_type = 'UNIQUE'
       order by tc.table_name, tc.constraint_name, kcu.ordinal_position;`
    )
  );

  const foreignKeys = toSqlArray<ForeignKeyRow>(
    await sql.unsafe(
      `select
         tc.constraint_name,
         tc.table_name,
         kcu.column_name,
         ccu.table_name as referenced_table,
         ccu.column_name as referenced_column
       from information_schema.table_constraints tc
       join information_schema.key_column_usage kcu
         on tc.constraint_name = kcu.constraint_name
        and tc.table_schema = kcu.table_schema
       join information_schema.constraint_column_usage ccu
         on tc.constraint_name = ccu.constraint_name
        and tc.table_schema = ccu.table_schema
       where tc.table_schema = '${schema}'
         and tc.constraint_type = 'FOREIGN KEY'
       order by tc.table_name, tc.constraint_name, kcu.ordinal_position;`
    )
  );

  const indexes = toSqlArray<IndexRow>(
    await sql.unsafe(
      `select
         tablename as table_name,
         indexname as index_name,
         indexdef as index_def
       from pg_indexes
       where schemaname = '${schema}'
         and indexname not like '%_pkey'
       order by tablename, indexname;`
    )
  );

  const tablesByName = new Map<string, SnapshotTable>();

  for (const table of tables) {
    tablesByName.set(table.table_name, {
      name: table.table_name,
      columns: [],
      primaryKeyColumns: [],
      uniqueColumns: [],
    });
  }

  for (const column of columns) {
    const entry = tablesByName.get(column.table_name);
    if (!entry) continue;
    entry.columns.push(column);
  }

  for (const pkColumn of primaryKeyColumns) {
    const entry = tablesByName.get(pkColumn.table_name);
    if (!entry) continue;
    entry.primaryKeyColumns.push(pkColumn.column_name);
  }

  for (const uniqueColumn of uniqueColumns) {
    const entry = tablesByName.get(uniqueColumn.table_name);
    if (!entry) continue;
    if (!entry.uniqueColumns.includes(uniqueColumn.column_name)) {
      entry.uniqueColumns.push(uniqueColumn.column_name);
    }
  }

  return {
    schema,
    generatedAtISO: new Date().toISOString(),
    tables: [...tablesByName.values()],
    foreignKeys,
    indexes,
  };
}

function generateSchemaSql(snapshot: Snapshot): string {
  const lines: string[] = [
    "-- Generated by apps/dbviz/scripts/supabase-import.ts",
    "-- This is a scaffolded approximation. Review before production use.",
    "",
  ];

  for (const table of snapshot.tables) {
    lines.push(`create table ${quoteIdent(table.name)} (`);

    const columnLines = table.columns.map((column) => {
      const defaultSql = column.column_default ? ` default ${column.column_default}` : "";
      const nullableSql = column.is_nullable === "NO" ? " not null" : "";
      return `  ${quoteIdent(column.column_name)} ${mapDataTypeForSql(column.data_type)}${nullableSql}${defaultSql}`;
    });

    if (table.primaryKeyColumns.length > 0) {
      columnLines.push(
        `  primary key (${table.primaryKeyColumns.map((column) => quoteIdent(column)).join(", ")})`
      );
    }

    lines.push(columnLines.join(",\n"));
    lines.push(");");
    lines.push("");
  }

  if (snapshot.foreignKeys.length > 0) {
    for (const foreignKey of snapshot.foreignKeys) {
      lines.push(
        `alter table ${quoteIdent(foreignKey.table_name)} add constraint ${quoteIdent(
          foreignKey.constraint_name
        )} foreign key (${quoteIdent(foreignKey.column_name)}) references ${quoteIdent(
          foreignKey.referenced_table
        )} (${quoteIdent(foreignKey.referenced_column)});`
      );
    }
    lines.push("");
  }

  if (snapshot.indexes.length > 0) {
    lines.push("-- Non-primary indexes from source");
    for (const index of snapshot.indexes) {
      const normalized = index.index_def.trim().endsWith(";")
        ? index.index_def.trim()
        : `${index.index_def.trim()};`;
      lines.push(normalized);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function generateDiagramMmd(snapshot: Snapshot): string {
  const lines: string[] = ["erDiagram"];

  for (const table of snapshot.tables) {
    lines.push(`  ${table.name} {`);
    for (const column of table.columns) {
      const markers: string[] = [];
      if (table.primaryKeyColumns.includes(column.column_name)) markers.push("PK");
      if (table.uniqueColumns.includes(column.column_name)) markers.push("UK");
      if (
        snapshot.foreignKeys.some(
          (foreignKey) =>
            foreignKey.table_name === table.name && foreignKey.column_name === column.column_name
        )
      ) {
        markers.push("FK");
      }
      const markerSql = markers.length > 0 ? ` ${markers.join(",")}` : "";
      lines.push(
        `    ${mapDataTypeForMermaid(column.data_type)} ${column.column_name}${markerSql}`
      );
    }
    lines.push("  }");
  }

  const relationKeys = new Set<string>();
  for (const foreignKey of snapshot.foreignKeys) {
    const relationKey = `${foreignKey.referenced_table}|${foreignKey.table_name}|${foreignKey.constraint_name}`;
    if (relationKeys.has(relationKey)) continue;
    relationKeys.add(relationKey);
    lines.push(
      `  ${foreignKey.referenced_table} ||--o{ ${foreignKey.table_name} : "${foreignKey.column_name}"`
    );
  }

  return `${lines.join("\n")}\n`;
}

function generateQueriesSql(snapshot: Snapshot): string {
  const lines: string[] = [
    "-- Typical queries scaffolded from imported tables",
    "-- Edit and expand based on product requirements.",
    "",
  ];

  for (const table of snapshot.tables.slice(0, 5)) {
    lines.push(`select count(*) as ${table.name}_count from ${quoteIdent(table.name)};`);
  }

  if (snapshot.tables.length > 0) {
    lines.push("");
    lines.push(`select * from ${quoteIdent(snapshot.tables[0].name)} limit 20;`);
  }

  return `${lines.join("\n")}\n`;
}

function generateSeedSql(snapshot: Snapshot): string {
  const lines: string[] = [
    "-- Seed scaffold generated by apps/dbviz/scripts/supabase-import.ts",
    "-- Add deterministic fake data per domain.",
    "",
  ];

  for (const table of snapshot.tables.slice(0, 5)) {
    lines.push(`-- insert into ${quoteIdent(table.name)} (...) values (...);`);
  }

  return `${lines.join("\n")}\n`;
}

function buildPullArtifacts(snapshot: Snapshot): PullArtifacts {
  return {
    snapshotJson: `${JSON.stringify(snapshot, null, 2)}\n`,
    schemaSql: generateSchemaSql(snapshot),
    diagramMmd: generateDiagramMmd(snapshot),
    seedSql: generateSeedSql(snapshot),
    queriesSql: generateQueriesSql(snapshot),
  };
}

function writePullArtifacts(
  config: SupabaseImportConfig,
  snapshot: Snapshot
): {
  outputDir: string;
  artifacts: PullArtifacts;
} {
  const runId = new Date().toISOString().replaceAll(":", "-");
  const outputDir = path.join(config.outputDir, `supabase-${runId}`);
  mkdirSync(outputDir, { recursive: true });

  const artifacts = buildPullArtifacts(snapshot);
  const snapshotJsonPath = path.join(outputDir, "snapshot.json");
  const schemaSqlPath = path.join(outputDir, "schema.sql");
  const diagramPath = path.join(outputDir, "diagram.mmd");
  const seedPath = path.join(outputDir, "seed.sql");
  const queriesPath = path.join(outputDir, "queries.sql");

  writeFileSync(snapshotJsonPath, artifacts.snapshotJson, "utf-8");
  writeFileSync(schemaSqlPath, artifacts.schemaSql, "utf-8");
  writeFileSync(diagramPath, artifacts.diagramMmd, "utf-8");
  writeFileSync(seedPath, artifacts.seedSql, "utf-8");
  writeFileSync(queriesPath, artifacts.queriesSql, "utf-8");

  return { outputDir, artifacts };
}

function buildResourceDraftIndex(config: SupabaseImportConfig, snapshot: Snapshot): string {
  const slug = config.draftSlug;
  if (!slug) {
    throw new Error("Draft slug is required to build resource draft.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const description = `${config.draftDescription} Tables detected: ${snapshot.tables.length}.`;

  return `---
slug: ${slug}
title: ${config.draftTitle}
description: ${description}
category: database-schemas
type: schema
tags: [database, sql, erd, supabase, imported]
tech: [postgresql, sql, mermaid, supabase]
difficulty: med
targets: [sql, mermaid]
labRoute: /database-schemas/${slug}
license: MIT
createdAt: ${today}
updatedAt: ${today}
---

Scaffold imported from Supabase for local review and iteration.

Includes:
- schema.sql
- diagram.mmd
- seed.sql (placeholder scaffold)
- queries.sql
`;
}

function writeResourceDraft(
  config: SupabaseImportConfig,
  snapshot: Snapshot,
  artifacts: PullArtifacts
): string | null {
  if (!config.draftSlug) return null;

  const resourceDir = path.join(RESOURCE_ROOT, config.draftSlug);
  if (existsSync(resourceDir) && !config.draftOverwrite) {
    throw new Error(
      `Draft resource already exists at ${resourceDir}. Use DBVIZ_SUPABASE_DRAFT_OVERWRITE=true or --draft-overwrite.`
    );
  }

  const snippetsDir = path.join(resourceDir, "snippets");
  mkdirSync(snippetsDir, { recursive: true });

  writeFileSync(
    path.join(resourceDir, "index.mdx"),
    buildResourceDraftIndex(config, snapshot),
    "utf-8"
  );
  writeFileSync(path.join(snippetsDir, "schema.sql"), artifacts.schemaSql, "utf-8");
  writeFileSync(path.join(snippetsDir, "diagram.mmd"), artifacts.diagramMmd, "utf-8");
  writeFileSync(path.join(snippetsDir, "seed.sql"), artifacts.seedSql, "utf-8");
  writeFileSync(path.join(snippetsDir, "queries.sql"), artifacts.queriesSql, "utf-8");

  return resourceDir;
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printUsage();
    return;
  }

  const mode = parseMode(process.argv);
  const config = readConfig(process.argv);

  console.log(`[dbviz:supabase] mode=${mode}`);
  console.log(`[dbviz:supabase] db=${maskDbUrl(config.dbUrl)}`);
  console.log(`[dbviz:supabase] schema=${config.schema}`);

  const sql = new SQL(config.dbUrl);

  try {
    const connection = await checkConnection(sql);
    console.log(
      `[dbviz:supabase] Connected: db=${connection.current_database} user=${connection.current_user}`
    );

    if (mode === "check") {
      return;
    }

    const snapshot = await buildSnapshot(sql, config.schema);
    const { outputDir, artifacts } = writePullArtifacts(config, snapshot);
    console.log(`[dbviz:supabase] Imported ${snapshot.tables.length} table(s).`);
    console.log(`[dbviz:supabase] Artifacts written to: ${outputDir}`);

    const draftDir = writeResourceDraft(config, snapshot, artifacts);
    if (draftDir) {
      console.log(`[dbviz:supabase] Draft resource created at: ${draftDir}`);
      console.log(
        `[dbviz:supabase] Next: run bun run build:www to verify /library and /r/${config.draftSlug}`
      );
    }
  } finally {
    await sql.close();
  }
}

void main();
