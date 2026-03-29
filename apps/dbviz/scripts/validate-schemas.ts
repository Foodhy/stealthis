import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { type ResourceMetaOutput, loadResources } from "@stealthis/schema";

type SchemaProvider = "local" | "supabase";
type LocalEngine = "docker" | "pglite";
type ValidationStatus = "pass" | "fail" | "blocked";

type ValidationMetrics = {
  schemaStatements: number;
  seedStatements: number;
  queryStatements: number;
  queryStatementsExecuted: number;
  tableCount: number;
  foreignKeyCount: number;
  nonPrimaryIndexCount: number;
};

type ValidationResult = {
  slug: string;
  title: string;
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
  metrics: ValidationMetrics;
};

const CONTENT_DIR = path.resolve(import.meta.dir, "../../../packages/content");
const REPORT_PATH = path.resolve(import.meta.dir, "../PHASE5_VALIDATION.md");
const DEFAULT_DOCKER_IMAGE = "postgres:16-alpine";
const DEFAULT_DOCKER_PORT = 55432;
const DEFAULT_DOCKER_DB = "dbviz";
const DEFAULT_DOCKER_USER = "postgres";
const DEFAULT_DOCKER_PASSWORD = "postgres";

type CommandResult = {
  ok: boolean;
  code: number;
  stdout: string;
  stderr: string;
};

type DockerContext = {
  containerName: string;
  image: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

function resolveProvider(value: string | undefined): SchemaProvider {
  const normalized = value?.trim().toLowerCase();
  return normalized === "supabase" ? "supabase" : "local";
}

function resolveLocalEngine(value: string | undefined): LocalEngine {
  const normalized = value?.trim().toLowerCase();
  return normalized === "pglite" ? "pglite" : "docker";
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;
  return fallback;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

function countStatements(sql: string): number {
  return sql
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0).length;
}

function readSnippet(slug: string, fileName: string): string {
  const snippetPath = path.join(CONTENT_DIR, "resources", slug, "snippets", fileName);
  return existsSync(snippetPath) ? readFileSync(snippetPath, "utf-8") : "";
}

function runCommand(cmd: string[]): CommandResult {
  const result = Bun.spawnSync({
    cmd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = new TextDecoder().decode(result.stdout).trim();
  const stderr = new TextDecoder().decode(result.stderr).trim();
  const code = result.exitCode ?? 1;

  return {
    ok: code === 0,
    code,
    stdout,
    stderr,
  };
}

function toCommandError(label: string, command: string[], result: CommandResult): string {
  const stderrOrOut = result.stderr || result.stdout || "No output";
  return `${label} failed (code ${result.code}): ${command.join(" ")} -> ${stderrOrOut}`;
}

function runDockerSql(
  docker: DockerContext,
  sql: string,
  options: { quiet?: boolean; tuplesOnly?: boolean } = {}
): CommandResult {
  const command = [
    "docker",
    "exec",
    docker.containerName,
    "psql",
    "-X",
    "-v",
    "ON_ERROR_STOP=1",
    "-U",
    docker.user,
    "-d",
    docker.database,
  ];

  if (options.quiet) command.push("-q");
  if (options.tuplesOnly) command.push("-t", "-A");
  command.push("-c", sql);

  return runCommand(command);
}

async function waitForDockerPostgresReady(docker: DockerContext): Promise<void> {
  const maxAttempts = 30;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const readiness = runCommand([
      "docker",
      "exec",
      docker.containerName,
      "pg_isready",
      "-U",
      docker.user,
      "-d",
      docker.database,
    ]);

    if (readiness.ok) return;
    await Bun.sleep(1000);
  }

  const logs = runCommand(["docker", "logs", docker.containerName]);
  throw new Error(
    `Postgres container was not ready in time. ${logs.stderr || logs.stdout || "No logs"}`
  );
}

async function startDockerPostgres(): Promise<DockerContext> {
  const dockerCheck = runCommand(["docker", "--version"]);
  if (!dockerCheck.ok) {
    throw new Error(
      toCommandError("Docker availability check", ["docker", "--version"], dockerCheck)
    );
  }

  const image = process.env.DBVIZ_DOCKER_IMAGE?.trim() || DEFAULT_DOCKER_IMAGE;
  const port = parsePositiveInt(process.env.DBVIZ_DOCKER_PORT, DEFAULT_DOCKER_PORT);
  const database = process.env.DBVIZ_DOCKER_DB?.trim() || DEFAULT_DOCKER_DB;
  const user = process.env.DBVIZ_DOCKER_USER?.trim() || DEFAULT_DOCKER_USER;
  const password = process.env.DBVIZ_DOCKER_PASSWORD?.trim() || DEFAULT_DOCKER_PASSWORD;
  const containerName = `dbviz-validate-${Date.now()}`;

  const runCmd = [
    "docker",
    "run",
    "-d",
    "--rm",
    "--name",
    containerName,
    "-e",
    `POSTGRES_DB=${database}`,
    "-e",
    `POSTGRES_USER=${user}`,
    "-e",
    `POSTGRES_PASSWORD=${password}`,
    "-p",
    `${port}:5432`,
    image,
  ];
  const started = runCommand(runCmd);
  if (!started.ok) {
    throw new Error(toCommandError("Docker postgres startup", runCmd, started));
  }

  const docker: DockerContext = {
    containerName,
    image,
    port,
    database,
    user,
    password,
  };

  try {
    await waitForDockerPostgresReady(docker);
    return docker;
  } catch (error) {
    runCommand(["docker", "stop", containerName]);
    throw error;
  }
}

function stopDockerPostgres(docker: DockerContext): void {
  runCommand(["docker", "stop", docker.containerName]);
}

async function readDockerScalarInt(docker: DockerContext, sql: string): Promise<number> {
  const result = runDockerSql(docker, sql, { quiet: true, tuplesOnly: true });
  if (!result.ok) {
    throw new Error(
      toCommandError(
        "Docker scalar query",
        ["docker", "exec", docker.containerName, "psql"],
        result
      )
    );
  }

  const firstLine = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const parsed = Number(firstLine ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

async function readScalarInt(db: PGlite, sql: string): Promise<number> {
  const results = await db.exec(sql);
  const first = results.at(0);
  if (!first || first.rows.length === 0) return 0;
  const row = first.rows[0] as Record<string, unknown>;
  const value = Object.values(row)[0];
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

async function validateResourceLocal(resource: ResourceMetaOutput): Promise<ValidationResult> {
  const schemaSql = readSnippet(resource.slug, "schema.sql");
  const seedSql = readSnippet(resource.slug, "seed.sql");
  const queriesSql = readSnippet(resource.slug, "queries.sql");
  const diagramMmd = readSnippet(resource.slug, "diagram.mmd");

  const errors: string[] = [];
  const warnings: string[] = [];

  const metrics: ValidationMetrics = {
    schemaStatements: countStatements(schemaSql),
    seedStatements: countStatements(seedSql),
    queryStatements: countStatements(queriesSql),
    queryStatementsExecuted: 0,
    tableCount: 0,
    foreignKeyCount: 0,
    nonPrimaryIndexCount: 0,
  };

  if (!schemaSql.trim()) errors.push("Missing snippets/schema.sql");
  if (!seedSql.trim()) errors.push("Missing snippets/seed.sql");
  if (!queriesSql.trim()) errors.push("Missing snippets/queries.sql");
  if (!diagramMmd.trim()) errors.push("Missing snippets/diagram.mmd");

  if (errors.length > 0) {
    return {
      slug: resource.slug,
      title: resource.title,
      status: "fail",
      errors,
      warnings,
      metrics,
    };
  }

  let db: PGlite | null = null;

  try {
    db = new PGlite();
    await db.waitReady;

    await db.exec(schemaSql);
    await db.exec(seedSql);

    const queryResults = await db.exec(queriesSql);
    metrics.queryStatementsExecuted = queryResults.length;
    if (metrics.queryStatementsExecuted === 0) {
      warnings.push("queries.sql did not produce executable statements.");
    }

    metrics.tableCount = await readScalarInt(
      db,
      "select count(*)::int as count from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE';"
    );
    metrics.foreignKeyCount = await readScalarInt(
      db,
      "select count(*)::int as count from information_schema.table_constraints where constraint_schema = 'public' and constraint_type = 'FOREIGN KEY';"
    );
    metrics.nonPrimaryIndexCount = await readScalarInt(
      db,
      "select count(*)::int as count from pg_indexes where schemaname = 'public' and indexname not like '%_pkey';"
    );

    if (metrics.foreignKeyCount === 0) {
      warnings.push("No foreign keys detected in schema.");
    }

    return {
      slug: resource.slug,
      title: resource.title,
      status: "pass",
      errors,
      warnings,
      metrics,
    };
  } catch (error) {
    return {
      slug: resource.slug,
      title: resource.title,
      status: "fail",
      errors: [...errors, `Execution failed: ${toErrorMessage(error)}`],
      warnings,
      metrics,
    };
  } finally {
    if (db) {
      await db.close();
    }
  }
}

async function validateResourceDocker(
  resource: ResourceMetaOutput,
  docker: DockerContext
): Promise<ValidationResult> {
  const schemaSql = readSnippet(resource.slug, "schema.sql");
  const seedSql = readSnippet(resource.slug, "seed.sql");
  const queriesSql = readSnippet(resource.slug, "queries.sql");
  const diagramMmd = readSnippet(resource.slug, "diagram.mmd");

  const errors: string[] = [];
  const warnings: string[] = [];

  const metrics: ValidationMetrics = {
    schemaStatements: countStatements(schemaSql),
    seedStatements: countStatements(seedSql),
    queryStatements: countStatements(queriesSql),
    queryStatementsExecuted: 0,
    tableCount: 0,
    foreignKeyCount: 0,
    nonPrimaryIndexCount: 0,
  };

  if (!schemaSql.trim()) errors.push("Missing snippets/schema.sql");
  if (!seedSql.trim()) errors.push("Missing snippets/seed.sql");
  if (!queriesSql.trim()) errors.push("Missing snippets/queries.sql");
  if (!diagramMmd.trim()) errors.push("Missing snippets/diagram.mmd");

  if (errors.length > 0) {
    return {
      slug: resource.slug,
      title: resource.title,
      status: "fail",
      errors,
      warnings,
      metrics,
    };
  }

  try {
    const resetSql = [
      "drop schema if exists public cascade;",
      "create schema public;",
      `grant all on schema public to ${docker.user};`,
      "grant all on schema public to public;",
    ].join("\n");
    const resetResult = runDockerSql(docker, resetSql, { quiet: true });
    if (!resetResult.ok) {
      throw new Error(
        toCommandError(
          "Reset schema",
          ["docker", "exec", docker.containerName, "psql", "-c", "<reset-sql>"],
          resetResult
        )
      );
    }

    const schemaResult = runDockerSql(docker, schemaSql, { quiet: true });
    if (!schemaResult.ok) {
      throw new Error(
        toCommandError(
          "schema.sql execution",
          ["docker", "exec", docker.containerName, "psql", "-c", "schema.sql"],
          schemaResult
        )
      );
    }

    const seedResult = runDockerSql(docker, seedSql, { quiet: true });
    if (!seedResult.ok) {
      throw new Error(
        toCommandError(
          "seed.sql execution",
          ["docker", "exec", docker.containerName, "psql", "-c", "seed.sql"],
          seedResult
        )
      );
    }

    const queriesResult = runDockerSql(docker, queriesSql, { quiet: true });
    if (!queriesResult.ok) {
      throw new Error(
        toCommandError(
          "queries.sql execution",
          ["docker", "exec", docker.containerName, "psql", "-c", "queries.sql"],
          queriesResult
        )
      );
    }

    metrics.queryStatementsExecuted = metrics.queryStatements;
    if (metrics.queryStatementsExecuted === 0) {
      warnings.push("queries.sql did not produce executable statements.");
    }

    metrics.tableCount = await readDockerScalarInt(
      docker,
      "select count(*)::int as count from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE';"
    );
    metrics.foreignKeyCount = await readDockerScalarInt(
      docker,
      "select count(*)::int as count from information_schema.table_constraints where constraint_schema = 'public' and constraint_type = 'FOREIGN KEY';"
    );
    metrics.nonPrimaryIndexCount = await readDockerScalarInt(
      docker,
      "select count(*)::int as count from pg_indexes where schemaname = 'public' and indexname not like '%_pkey';"
    );

    if (metrics.foreignKeyCount === 0) {
      warnings.push("No foreign keys detected in schema.");
    }

    return {
      slug: resource.slug,
      title: resource.title,
      status: "pass",
      errors,
      warnings,
      metrics,
    };
  } catch (error) {
    return {
      slug: resource.slug,
      title: resource.title,
      status: "fail",
      errors: [...errors, `Execution failed: ${toErrorMessage(error)}`],
      warnings,
      metrics,
    };
  }
}

function buildMarkdownReport(
  provider: SchemaProvider,
  localEngine: LocalEngine,
  startedAt: Date,
  finishedAt: Date,
  results: ValidationResult[],
  notes: string[] = []
): string {
  const total = results.length;
  const passed = results.filter((result) => result.status === "pass").length;
  const failed = results.filter((result) => result.status === "fail").length;
  const blocked = results.filter((result) => result.status === "blocked").length;

  const lines: string[] = [
    "# Phase 5 Validation (DB Schemas)",
    "",
    "## Run Info",
    `- Started: ${startedAt.toISOString()}`,
    `- Finished: ${finishedAt.toISOString()}`,
    `- Provider: \`${provider}\` (set with \`DBVIZ_SCHEMA_PROVIDER\`)`,
    `- Local engine: \`${localEngine}\` (set with \`DBVIZ_LOCAL_ENGINE\`)`,
    "",
    "## Summary",
    `- Total resources: ${total}`,
    `- Passed: ${passed}`,
    `- Failed: ${failed}`,
    `- Blocked: ${blocked}`,
    "",
    "## Results",
    "",
    "| Resource | Status | Tables | FK | Non-PK Indexes | Schema stmts | Seed stmts | Query stmts | Executed |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (const result of results) {
    lines.push(
      `| ${result.slug} | ${result.status.toUpperCase()} | ${result.metrics.tableCount} | ${result.metrics.foreignKeyCount} | ${result.metrics.nonPrimaryIndexCount} | ${result.metrics.schemaStatements} | ${result.metrics.seedStatements} | ${result.metrics.queryStatements} | ${result.metrics.queryStatementsExecuted} |`
    );
  }

  lines.push("");

  if (notes.length > 0) {
    lines.push("## Notes");
    for (const note of notes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  const withIssues = results.filter(
    (result) => result.errors.length > 0 || result.warnings.length > 0
  );

  if (withIssues.length > 0) {
    lines.push("## Details");
    lines.push("");
    for (const result of withIssues) {
      lines.push(`### ${result.slug}`);
      if (result.errors.length > 0) {
        for (const error of result.errors) {
          lines.push(`- ERROR: ${error}`);
        }
      }
      if (result.warnings.length > 0) {
        for (const warning of result.warnings) {
          lines.push(`- WARNING: ${warning}`);
        }
      }
      lines.push("");
    }
  }

  lines.push("## Next Steps");
  lines.push("- Keep provider as local for Phase 5 completion.");
  lines.push("- Add Supabase provider implementation for Phase 6 import/inspect.");
  lines.push("- Integrate this validation into CI once global lint baseline is clean.");
  lines.push("");
  lines.push("## How To Run");
  lines.push("```bash");
  lines.push("DBVIZ_SCHEMA_PROVIDER=local DBVIZ_LOCAL_ENGINE=docker bun run dbviz:validate");
  lines.push("DBVIZ_SCHEMA_PROVIDER=local DBVIZ_LOCAL_ENGINE=pglite bun run dbviz:validate");
  lines.push("```");

  return `${lines.join("\n")}\n`;
}

async function main() {
  const startedAt = new Date();
  const provider = resolveProvider(process.env.DBVIZ_SCHEMA_PROVIDER);
  const localEngine = resolveLocalEngine(process.env.DBVIZ_LOCAL_ENGINE);
  const resources = (await loadResources(CONTENT_DIR))
    .filter((resource) => resource.category === "database-schemas")
    .sort((a, b) => a.slug.localeCompare(b.slug));

  if (resources.length === 0) {
    const finishedAt = new Date();
    const report = buildMarkdownReport(
      provider,
      localEngine,
      startedAt,
      finishedAt,
      [],
      ["No database-schemas resources were found."]
    );
    writeFileSync(REPORT_PATH, report, "utf-8");
    console.error("[dbviz:validate] No database-schemas resources found.");
    process.exit(1);
  }

  if (provider === "supabase") {
    const finishedAt = new Date();
    const blockedResults: ValidationResult[] = resources.map((resource) => ({
      slug: resource.slug,
      title: resource.title,
      status: "blocked",
      errors: [
        "Supabase validation provider is not implemented yet. Use DBVIZ_SCHEMA_PROVIDER=local for now.",
      ],
      warnings: [],
      metrics: {
        schemaStatements: 0,
        seedStatements: 0,
        queryStatements: 0,
        queryStatementsExecuted: 0,
        tableCount: 0,
        foreignKeyCount: 0,
        nonPrimaryIndexCount: 0,
      },
    }));

    const report = buildMarkdownReport(
      provider,
      localEngine,
      startedAt,
      finishedAt,
      blockedResults,
      ["Provider selector is in place for Phase 6."]
    );
    writeFileSync(REPORT_PATH, report, "utf-8");
    console.error(
      "[dbviz:validate] Provider 'supabase' is reserved for Phase 6 and not implemented yet."
    );
    process.exit(1);
  }

  const results: ValidationResult[] = [];
  const notes: string[] = ["This report is regenerated by apps/dbviz/scripts/validate-schemas.ts."];

  if (localEngine === "docker") {
    const docker = await startDockerPostgres();
    notes.push(
      `Validation engine: Docker Postgres (${docker.image}) on localhost:${docker.port}, db=${docker.database}.`
    );
    try {
      for (const resource of resources) {
        console.log(`[dbviz:validate] Validating ${resource.slug}...`);
        const result = await validateResourceDocker(resource, docker);
        results.push(result);
      }
    } finally {
      stopDockerPostgres(docker);
    }
  } else {
    notes.push("Validation engine: PGlite in-memory.");
    for (const resource of resources) {
      console.log(`[dbviz:validate] Validating ${resource.slug}...`);
      const result = await validateResourceLocal(resource);
      results.push(result);
    }
  }

  const finishedAt = new Date();
  const report = buildMarkdownReport(provider, localEngine, startedAt, finishedAt, results, notes);
  writeFileSync(REPORT_PATH, report, "utf-8");

  const failed = results.filter((result) => result.status === "fail");
  if (failed.length > 0) {
    console.error(
      `[dbviz:validate] ${failed.length}/${results.length} resources failed validation. Report: ${REPORT_PATH}`
    );
    process.exit(1);
  }

  console.log(
    `[dbviz:validate] Validation passed for ${results.length} resources. Report: ${REPORT_PATH}`
  );
}

void main();
