import { PGlite, type Results } from "@electric-sql/pglite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SchemaDiagramCanvas from "./SchemaDiagramCanvas";

export type DbVizExample = {
  slug: string;
  title: string;
  description: string;
  schemaSql: string;
  seedSql: string;
  queriesSql: string;
  diagramMmd: string;
  migrationsSql: string;
};

type ConsoleEntry = {
  id: number;
  kind: "ok" | "info" | "warn";
  message: string;
};

type MigrationEntry = {
  id: number;
  sql: string;
  createdAtISO: string;
};

type QueryResultRow = {
  id: string;
  row: Record<string, unknown>;
};

type QueryResultEntry = {
  id: string;
  statementNumber: number;
  result: Results;
  rows: QueryResultRow[];
};

type ArtifactTab = "schema" | "seed" | "queries" | "diagram" | "migrations";
type PreviewTab = "diagram" | "migrations";
type EngineStatus = "idle" | "booting" | "ready" | "error";
export type DbVizRuntimeProvider = "local" | "supabase";
export type DbVizLocalEngine = "pglite" | "docker";

export type DbVizRuntimeConfig = {
  provider: DbVizRuntimeProvider;
  localEngine: DbVizLocalEngine;
  supabaseConfigured: boolean;
  supabaseProjectUrl: string;
};

type Props = {
  examples: DbVizExample[];
  runtimeConfig: DbVizRuntimeConfig;
};

const MAX_RESULT_ROWS = 25;

const FALLBACK_EXAMPLE: DbVizExample = {
  slug: "starter-relational-schema",
  title: "Starter Relational Schema",
  description: "Ejemplo base para comenzar cuando aún no existen recursos cargados.",
  schemaSql: `create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  created_at timestamptz not null default now()
);`,
  seedSql: `insert into users (email) values
('demo@stealthis.dev');`,
  queriesSql: "select id, email, created_at from users order by id desc limit 20;",
  diagramMmd: `erDiagram
  users {
    bigint id PK
    text email
    timestamptz created_at
  }`,
  migrationsSql: "",
};

const ARTIFACT_TABS: Array<{ key: ArtifactTab; label: string; fileName: string }> = [
  { key: "schema", label: "Schema", fileName: "schema.sql" },
  { key: "seed", label: "Seed", fileName: "seed.sql" },
  { key: "queries", label: "Queries", fileName: "queries.sql" },
  { key: "diagram", label: "Diagram", fileName: "diagram.mmd" },
  { key: "migrations", label: "Migrations", fileName: "migrations.sql" },
];

const PREVIEW_TABS: Array<{ key: PreviewTab; label: string }> = [
  { key: "diagram", label: "Diagram" },
  { key: "migrations", label: "Migrations" },
];

let runtimeEntityId = 0;

function nextEntryId<T extends { id: number }>(entries: T[]) {
  const lastEntry = entries.at(-1);
  return lastEntry ? lastEntry.id + 1 : 1;
}

function nextRuntimeId(prefix: string) {
  runtimeEntityId += 1;
  return `${prefix}-${runtimeEntityId}`;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Error desconocido";
}

function formatCell(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[object]";
    }
  }
  return String(value);
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildInitialMigrationLog(example: DbVizExample): MigrationEntry[] {
  const sql = example.migrationsSql.trim();
  if (!sql) return [];
  return [{ id: 1, sql, createdAtISO: new Date().toISOString() }];
}

function toMigrationSnapshot(sql: string) {
  return sql.trim() ? sql : "-- no migration SQL yet";
}

export default function DbVizStudio({ examples, runtimeConfig }: Props) {
  const availableExamples = useMemo(
    () => (examples.length > 0 ? examples : [FALLBACK_EXAMPLE]),
    [examples]
  );

  const dbRef = useRef<PGlite | null>(null);
  const bootstrapTokenRef = useRef(0);

  const [selectedSlug, setSelectedSlug] = useState(availableExamples[0].slug);
  const selectedExample = useMemo(
    () =>
      availableExamples.find((example) => example.slug === selectedSlug) ?? availableExamples[0],
    [availableExamples, selectedSlug]
  );

  const [artifactTab, setArtifactTab] = useState<ArtifactTab>("schema");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("diagram");

  const [schemaSql, setSchemaSql] = useState(selectedExample.schemaSql);
  const [seedSql, setSeedSql] = useState(selectedExample.seedSql);
  const [queriesSql, setQueriesSql] = useState(selectedExample.queriesSql);
  const [diagramMmd, setDiagramMmd] = useState(selectedExample.diagramMmd);
  const [migrationsSql, setMigrationsSql] = useState(
    selectedExample.migrationsSql || selectedExample.schemaSql
  );
  const [commandSql, setCommandSql] = useState("");

  const [migrationLog, setMigrationLog] = useState<MigrationEntry[]>(
    buildInitialMigrationLog(selectedExample)
  );
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    { id: 1, kind: "info", message: "DBViz listo. Carga un ejemplo y ejecuta comandos SQL." },
  ]);
  const [lastResults, setLastResults] = useState<QueryResultEntry[]>([]);

  const [engineStatus, setEngineStatus] = useState<EngineStatus>("idle");
  const [engineMessage, setEngineMessage] = useState("Motor SQL no inicializado.");
  const [isRunningCommand, setIsRunningCommand] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<DbVizRuntimeProvider>(
    runtimeConfig.provider
  );
  const [selectedLocalEngine, setSelectedLocalEngine] = useState<DbVizLocalEngine>(
    runtimeConfig.localEngine
  );

  const isInteractiveEngine = useMemo(
    () => selectedProvider === "local" && selectedLocalEngine === "pglite",
    [selectedLocalEngine, selectedProvider]
  );

  const runtimeCommandHint = useMemo(() => {
    if (selectedProvider === "supabase") {
      return "DBVIZ_SCHEMA_PROVIDER=supabase bun run dbviz:supabase:check";
    }
    if (selectedLocalEngine === "docker") {
      return "DBVIZ_SCHEMA_PROVIDER=local DBVIZ_LOCAL_ENGINE=docker bun run dbviz:validate";
    }
    return "DBVIZ_SCHEMA_PROVIDER=local DBVIZ_LOCAL_ENGINE=pglite bun run dbviz:validate";
  }, [selectedLocalEngine, selectedProvider]);

  const runtimeHint = useMemo(() => {
    if (selectedProvider === "supabase") {
      if (runtimeConfig.supabaseConfigured) {
        return "Supabase está configurado. Usa scripts CLI para check/import (Fase 6 scaffold).";
      }
      return "Supabase no está configurado. Define DBVIZ_SUPABASE_DB_URL para habilitar check/import.";
    }

    if (selectedLocalEngine === "docker") {
      return "Docker local ejecuta validaciones por CLI. El editor web queda en modo solo visual.";
    }

    return "PGlite habilita ejecución SQL interactiva dentro del navegador.";
  }, [runtimeConfig.supabaseConfigured, selectedLocalEngine, selectedProvider]);

  const executedCount = useMemo(
    () => entries.filter((entry) => entry.kind === "ok").length,
    [entries]
  );

  const resourceUrl = useMemo(() => {
    if (selectedExample.slug === FALLBACK_EXAMPLE.slug) return "";
    const baseUrl = import.meta.env.DEV ? "http://localhost:4321" : "https://stealthis.dev";
    return `${baseUrl}/r/${selectedExample.slug}`;
  }, [selectedExample.slug]);

  const appendConsole = useCallback((kind: ConsoleEntry["kind"], message: string) => {
    setEntries((current) => [
      ...current,
      {
        id: nextEntryId(current),
        kind,
        message,
      },
    ]);
  }, []);

  const closeDatabase = useCallback(async () => {
    const activeDb = dbRef.current;
    dbRef.current = null;
    if (!activeDb) return;
    try {
      await activeDb.close();
    } catch {
      // Ignore close errors; next bootstrap creates a fresh engine.
    }
  }, []);

  const bootstrapDatabase = useCallback(
    async (payload: { schema: string; seed: string; reason: string }) => {
      const token = bootstrapTokenRef.current + 1;
      bootstrapTokenRef.current = token;
      setIsBootstrapping(true);
      setEngineStatus("booting");
      setEngineMessage(`Inicializando motor (${payload.reason})...`);
      setLastResults([]);

      await closeDatabase();

      try {
        const db = new PGlite();
        await db.waitReady;

        if (token !== bootstrapTokenRef.current) {
          await db.close();
          return;
        }

        if (payload.schema.trim()) {
          await db.exec(payload.schema);
        }
        if (payload.seed.trim()) {
          await db.exec(payload.seed);
        }

        if (token !== bootstrapTokenRef.current) {
          await db.close();
          return;
        }

        dbRef.current = db;
        setEngineStatus("ready");
        setEngineMessage(`Motor listo (${payload.reason}).`);
        appendConsole(
          "ok",
          `Motor inicializado: schema ${payload.schema.trim() ? "aplicado" : "vacío"}${payload.seed.trim() ? " + seed aplicado" : ""}.`
        );
      } catch (error) {
        const message = toErrorMessage(error);
        setEngineStatus("error");
        setEngineMessage(`Error de motor: ${message}`);
        appendConsole("warn", `Fallo al inicializar motor SQL: ${message}`);
      } finally {
        if (token === bootstrapTokenRef.current) {
          setIsBootstrapping(false);
        }
      }
    },
    [appendConsole, closeDatabase]
  );

  const hydrateFromExample = useCallback(
    (example: DbVizExample, message: string) => {
      setSchemaSql(example.schemaSql);
      setSeedSql(example.seedSql);
      setQueriesSql(example.queriesSql);
      setDiagramMmd(example.diagramMmd);
      setMigrationsSql(example.migrationsSql || example.schemaSql);
      setMigrationLog(buildInitialMigrationLog(example));
      setCommandSql("");
      appendConsole("info", message);
    },
    [appendConsole]
  );

  function getCurrentArtifactValue(tab: ArtifactTab) {
    if (tab === "schema") return schemaSql;
    if (tab === "seed") return seedSql;
    if (tab === "queries") return queriesSql;
    if (tab === "diagram") return diagramMmd;
    return migrationsSql;
  }

  function setCurrentArtifactValue(tab: ArtifactTab, value: string) {
    if (tab === "schema") setSchemaSql(value);
    else if (tab === "seed") setSeedSql(value);
    else if (tab === "queries") setQueriesSql(value);
    else if (tab === "diagram") setDiagramMmd(value);
    else setMigrationsSql(value);
  }

  async function applyEditorSqlToEngine() {
    if (!isInteractiveEngine) {
      appendConsole(
        "warn",
        "El runtime activo es externo (docker/supabase). Usa el comando sugerido para validar/importar."
      );
      return;
    }
    await bootstrapDatabase({
      schema: schemaSql,
      seed: seedSql,
      reason: "desde editor",
    });
  }

  async function runCommand() {
    if (!isInteractiveEngine) {
      appendConsole("warn", "Comandos SQL en UI solo están disponibles con runtime local+pglite.");
      return;
    }

    const normalized = commandSql.trim();
    if (!normalized) {
      appendConsole("warn", "No hay SQL para ejecutar. Escribe un comando primero.");
      return;
    }

    const db = dbRef.current;
    if (!db || engineStatus !== "ready") {
      appendConsole("warn", "El motor SQL no está listo. Aplica schema + seed primero.");
      return;
    }

    setIsRunningCommand(true);
    try {
      const results = await db.exec(normalized);
      const statementResults: QueryResultEntry[] = results.map((result, statementIndex) => ({
        id: nextRuntimeId("stmt"),
        statementNumber: statementIndex + 1,
        result,
        rows: result.rows.map((row) => ({
          id: nextRuntimeId("row"),
          row: row && typeof row === "object" ? (row as Record<string, unknown>) : { value: row },
        })),
      }));
      setLastResults(statementResults);

      setMigrationLog((current) => [
        ...current,
        {
          id: nextEntryId(current),
          sql: normalized,
          createdAtISO: new Date().toISOString(),
        },
      ]);

      setMigrationsSql((current) => {
        const chunk = `-- command ${new Date().toISOString()}\n${normalized}`;
        return current.trim() ? `${current.trim()}\n\n${chunk}` : chunk;
      });

      const totalRows = results.reduce((acc, result) => acc + result.rows.length, 0);
      appendConsole(
        "ok",
        `Comando ejecutado (${results.length} sentencia(s), ${totalRows} fila(s) devueltas).`
      );
      setCommandSql("");
      setPreviewTab("migrations");
    } catch (error) {
      appendConsole("warn", `Error ejecutando SQL: ${toErrorMessage(error)}`);
      setLastResults([]);
    } finally {
      setIsRunningCommand(false);
    }
  }

  function exportArtifact(tab: ArtifactTab) {
    const target = ARTIFACT_TABS.find((item) => item.key === tab);
    if (!target) return;

    const content = getCurrentArtifactValue(tab);
    if (!content.trim()) {
      appendConsole("warn", `No hay contenido en ${target.fileName} para exportar.`);
      return;
    }

    downloadTextFile(`${selectedExample.slug}-${target.fileName}`, content);
    appendConsole("ok", `Archivo exportado: ${target.fileName}`);
  }

  function exportAllArtifacts() {
    for (const tab of ARTIFACT_TABS) {
      const content = getCurrentArtifactValue(tab.key);
      if (!content.trim()) continue;
      downloadTextFile(`${selectedExample.slug}-${tab.fileName}`, content);
    }
    appendConsole("ok", "Exportación completa de artifacts.");
  }

  useEffect(() => {
    hydrateFromExample(selectedExample, `Ejemplo cargado: ${selectedExample.title}`);
    setArtifactTab("schema");
    setPreviewTab("diagram");
    if (isInteractiveEngine) {
      void bootstrapDatabase({
        schema: selectedExample.schemaSql,
        seed: selectedExample.seedSql,
        reason: selectedExample.slug,
      });
      return;
    }

    bootstrapTokenRef.current += 1;
    void closeDatabase();
    setLastResults([]);
    setEngineStatus("idle");
    if (selectedProvider === "supabase") {
      setEngineMessage(
        runtimeConfig.supabaseConfigured
          ? "Supabase activo en modo scaffold CLI. Ejecuta check/import desde terminal."
          : "Supabase no configurado. Define DBVIZ_SUPABASE_DB_URL."
      );
    } else if (selectedLocalEngine === "docker") {
      setEngineMessage("Docker activo en modo CLI. Ejecuta `bun run dbviz:validate`.");
    } else {
      setEngineMessage("Motor SQL no inicializado.");
    }
  }, [
    bootstrapDatabase,
    closeDatabase,
    hydrateFromExample,
    isInteractiveEngine,
    runtimeConfig.supabaseConfigured,
    selectedExample,
    selectedLocalEngine,
    selectedProvider,
  ]);

  useEffect(() => {
    return () => {
      bootstrapTokenRef.current += 1;
      void closeDatabase();
    };
  }, [closeDatabase]);



  return (
    <main className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[380px_1fr]">
      <section className="flex min-h-[620px] flex-col rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <header className="mb-4 border-b border-white/10 pb-3">
          <h2 className="text-base font-semibold text-slate-100">Command Workspace</h2>
          <p className="text-xs text-slate-400">
            Fase 4: comandos SQL + artifacts editables + preview de esquema.
          </p>
        </header>

        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            htmlFor="db-example"
          >
            Example
          </label>
          <select
            id="db-example"
            value={selectedSlug}
            onChange={(event) => setSelectedSlug(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-db-400/70"
          >
            {availableExamples.map((example) => (
              <option key={example.slug} value={example.slug}>
                {example.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">{selectedExample.description}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                hydrateFromExample(
                  selectedExample,
                  `Editor restablecido con: ${selectedExample.title}`
                );
                if (isInteractiveEngine) {
                  void bootstrapDatabase({
                    schema: selectedExample.schemaSql,
                    seed: selectedExample.seedSql,
                    reason: `reset ${selectedExample.slug}`,
                  });
                }
              }}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-800"
            >
              Restablecer ejemplo
            </button>
            {resourceUrl ? (
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-100 transition-colors hover:bg-cyan-500/20"
              >
                Ver recurso en www
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Runtime</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500">Provider</span>
              <select
                value={selectedProvider}
                onChange={(event) =>
                  setSelectedProvider(event.target.value as DbVizRuntimeProvider)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-db-400/70"
              >
                <option value="local">local</option>
                <option value="supabase">supabase</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500">
                Local Engine
              </span>
              <select
                value={selectedLocalEngine}
                onChange={(event) => setSelectedLocalEngine(event.target.value as DbVizLocalEngine)}
                disabled={selectedProvider !== "local"}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-db-400/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="docker">docker</option>
                <option value="pglite">pglite</option>
              </select>
            </label>
          </div>

          <p className="mt-2 text-xs text-slate-300">{runtimeHint}</p>
          {selectedProvider === "supabase" && runtimeConfig.supabaseProjectUrl ? (
            <p className="mt-1 text-[11px] text-slate-400">
              Project URL: {runtimeConfig.supabaseProjectUrl}
            </p>
          ) : null}
          <pre className="mt-2 overflow-auto rounded border border-white/10 bg-slate-950 px-2 py-1.5 font-mono text-[11px] text-cyan-100">
            {runtimeCommandHint}
          </pre>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              SQL Engine
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                engineStatus === "ready"
                  ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : engineStatus === "booting"
                    ? "border border-amber-400/40 bg-amber-500/10 text-amber-200"
                    : engineStatus === "error"
                      ? "border border-rose-400/40 bg-rose-500/10 text-rose-200"
                      : "border border-slate-500/40 bg-slate-700/40 text-slate-300"
              }`}
            >
              {engineStatus}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-300">{engineMessage}</p>
          <button
            type="button"
            onClick={() => void applyEditorSqlToEngine()}
            disabled={isBootstrapping || !isInteractiveEngine}
            className="mt-3 w-full rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInteractiveEngine
              ? isBootstrapping
                ? "Aplicando schema + seed..."
                : "Aplicar schema + seed al motor"
              : "Disponible solo en local+pglite"}
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Command SQL
          </p>
          <textarea
            value={commandSql}
            onChange={(event) => setCommandSql(event.target.value)}
            placeholder="select * from users limit 20;"
            className="mt-2 min-h-[120px] w-full resize-y rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-db-400/70"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => void runCommand()}
            disabled={isRunningCommand || engineStatus !== "ready" || !isInteractiveEngine}
            className="mt-2 w-full rounded-lg bg-db-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-db-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInteractiveEngine
              ? isRunningCommand
                ? "Ejecutando..."
                : "Ejecutar comando SQL"
              : "Ejecución solo en local+pglite"}
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Artifacts
            </p>
            <button
              type="button"
              onClick={exportAllArtifacts}
              className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
            >
              Exportar todo
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {ARTIFACT_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setArtifactTab(tab.key)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  artifactTab === tab.key
                    ? "bg-slate-700 text-white"
                    : "border border-white/10 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <textarea
            value={getCurrentArtifactValue(artifactTab)}
            onChange={(event) => setCurrentArtifactValue(artifactTab, event.target.value)}
            className="mt-3 min-h-[170px] w-full resize-y rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-db-400/70"
            spellCheck={false}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => exportArtifact(artifactTab)}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-800"
            >
              Exportar {ARTIFACT_TABS.find((tab) => tab.key === artifactTab)?.fileName}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Consola</p>
          <ul className="mt-2 max-h-[180px] space-y-1.5 overflow-auto pr-1">
            {entries.map((entry) => (
              <li key={entry.id} className="text-xs text-slate-300">
                <span
                  className={
                    entry.kind === "ok"
                      ? "text-emerald-300"
                      : entry.kind === "warn"
                        ? "text-amber-300"
                        : "text-sky-300"
                  }
                >
                  {entry.kind === "ok" ? "[ok]" : entry.kind === "warn" ? "[warn]" : "[info]"}
                </span>{" "}
                {entry.message}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="min-h-[620px] rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            {PREVIEW_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPreviewTab(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  previewTab === tab.key
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">Comandos ejecutados: {executedCount}</span>
        </header>

        {previewTab === "diagram" ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Schema Diagram
              </p>
              <SchemaDiagramCanvas diagramMmd={diagramMmd} />
            </div>
            <details className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-500">
                diagram.mmd source
              </summary>
              <pre className="mt-3 max-h-[220px] overflow-auto rounded-lg border border-white/10 bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-200">
                {diagramMmd}
              </pre>
            </details>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                migrations.sql snapshot
              </p>
              <pre className="max-h-[250px] overflow-auto rounded-lg border border-white/10 bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-200">
                {toMigrationSnapshot(migrationsSql)}
              </pre>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Migration history
              </p>
              {migrationLog.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No hay migraciones ejecutadas aún. Ejecuta un comando para registrarlo.
                </p>
              ) : (
                <ol className="space-y-2">
                  {migrationLog.map((migration) => (
                    <li
                      key={migration.id}
                      className="rounded-lg border border-white/10 bg-slate-950/70 p-2"
                    >
                      <p className="text-[11px] text-slate-400">
                        #{migration.id} · {new Date(migration.createdAtISO).toLocaleString("es-CO")}
                      </p>
                      <pre className="mt-1 max-h-[120px] overflow-auto font-mono text-[11px] leading-5 text-slate-200">
                        {migration.sql}
                      </pre>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Resultados de la última ejecución
          </p>
          {lastResults.length === 0 ? (
            <p className="text-xs text-slate-400">
              Ejecuta un comando SQL para ver filas, campos y filas afectadas.
            </p>
          ) : (
            <div className="space-y-2">
              {lastResults.map((statementResult) => {
                const { result, rows, statementNumber } = statementResult;
                const columns = result.fields.map((field) => field.name);
                const fallbackColumns =
                  columns.length > 0 ? columns : rows.length > 0 ? Object.keys(rows[0].row) : [];
                const previewRows = rows.slice(0, MAX_RESULT_ROWS);
                return (
                  <article
                    key={statementResult.id}
                    className="rounded-lg border border-white/10 bg-slate-950/70 p-2"
                  >
                    <p className="text-[11px] text-slate-400">
                      Sentencia #{statementNumber} · {rows.length} fila(s) ·{" "}
                      {result.affectedRows ?? 0} afectada(s)
                    </p>

                    {fallbackColumns.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">Sin columnas para mostrar.</p>
                    ) : (
                      <div className="mt-2 overflow-auto rounded border border-white/10">
                        <table className="min-w-full border-collapse text-[11px]">
                          <thead className="bg-slate-900">
                            <tr>
                              {fallbackColumns.map((column) => (
                                <th
                                  key={column}
                                  className="border-b border-white/10 px-2 py-1 text-left font-semibold text-slate-300"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.map((previewRow) => {
                              const record = previewRow.row;
                              return (
                                <tr key={previewRow.id}>
                                  {fallbackColumns.map((column) => (
                                    <td
                                      key={`${previewRow.id}-${column}`}
                                      className="border-b border-white/10 px-2 py-1 text-slate-200"
                                    >
                                      {formatCell(record[column])}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {rows.length > MAX_RESULT_ROWS ? (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Mostrando {MAX_RESULT_ROWS} de {rows.length} filas.
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
