import { PGlite, type Results } from "@electric-sql/pglite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderMarkdown } from "../lib/markdown";
import SqlEditor from "./SqlEditor";
import HelpChat from "./HelpChat";
import CrowsFootDiagram from "./CrowsFootDiagram";
import { LocaleProvider, useLocale } from "../i18n/LocaleContext";
import type { Locale } from "../i18n";
import {
  type AiProvider,
  type AiProviderConfig,
  type AiModel,
  type ChatMessage,
  PROVIDER_DEFAULTS,
  listModels as listProviderModels,
  chat as providerChat,
} from "../lib/ai-providers";
import {
  SYSTEM_PROMPT,
  QUERY_SYSTEM_PROMPT,
  buildClarificationMessage,
  buildGenerateMessage,
  buildRefinementMessage,
  buildNameMessage,
  buildAskMessage,
  buildPlanMessage,
  buildExecuteMessage,
  buildQueryAskMessage,
  buildQueryPlanMessage,
  buildQueryExecuteMessage,
  buildAutoGenerateQueriesMessage,
  isReadyResponse,
  extractQuestions,
  parseSchemaOutput,
  parseQueryOutput,
  hasSchemaMarkers,
  hasQueryMarkers,
} from "../lib/schema-prompts";
import SchemaDiagramCanvas from "./SchemaDiagramCanvas";
import { useTour, TOUR_THEMES, type TourTheme } from "../lib/useTour";

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

type AiChatEntry = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type WorkspaceTab = "diagram" | "erd" | "schema" | "seed" | "queries" | "migrations" | "results";
type AiMode = "ask" | "plan" | "execute";
type AiContext = "schema" | "queries";
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

const WORKSPACE_TABS: Array<{ key: WorkspaceTab; label: string; fileName?: string; editable?: boolean }> = [
  { key: "diagram", label: "Diagram", fileName: "diagram.mmd" },
  { key: "erd", label: "ERD" },
  { key: "schema", label: "Schema", fileName: "schema.sql", editable: true },
  { key: "seed", label: "Seed", fileName: "seed.sql", editable: true },
  { key: "queries", label: "Queries", fileName: "queries.sql", editable: true },
  { key: "migrations", label: "Migrations", fileName: "migrations.sql" },
  { key: "results", label: "Results" },
];

const TAB_COLORS: Record<WorkspaceTab, { dot: string; active: string }> = {
  diagram: { dot: "bg-violet-400", active: "ring-1 ring-violet-500/30 bg-violet-500/10" },
  erd: { dot: "bg-cyan-400", active: "ring-1 ring-cyan-500/30 bg-cyan-500/10" },
  schema: { dot: "bg-sky-400", active: "ring-1 ring-sky-500/30 bg-sky-500/10" },
  seed: { dot: "bg-amber-400", active: "ring-1 ring-amber-500/30 bg-amber-500/10" },
  queries: { dot: "bg-emerald-400", active: "ring-1 ring-emerald-500/30 bg-emerald-500/10" },
  migrations: { dot: "bg-rose-400", active: "ring-1 ring-rose-500/30 bg-rose-500/10" },
  results: { dot: "bg-slate-400", active: "bg-white/[0.08]" },
};

const STORAGE_KEY = "dbviz-ai-provider";

type StoredProviderConfig = {
  provider: AiProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
};

function loadProviderConfig(): StoredProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredProviderConfig;
  } catch { /* ignore */ }
  return { provider: "ollama", baseUrl: PROVIDER_DEFAULTS.ollama.baseUrl, apiKey: "", model: "" };
}

function saveProviderConfig(config: StoredProviderConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

/* ── Project persistence (localStorage) ─────────────────────── */

const PROJECTS_STORAGE_KEY = "dbviz-projects";

type SavedProject = {
  name: string;
  savedAt: string;
  schemaSql: string;
  seedSql: string;
  queriesSql: string;
  diagramMmd: string;
  migrationsSql: string;
  aiChat: AiChatEntry[];
  aiSessionName: string;
};

function loadSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedProject[];
  } catch { /* ignore */ }
  return [];
}

function persistProjects(projects: SavedProject[]) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch { /* ignore */ }
}

const CHATS_STORAGE_KEY = "dbviz-chat-history";
const MAX_SAVED_CHATS = 20;

type SavedChat = {
  id: string;
  name: string;
  savedAt: string;
  messages: AiChatEntry[];
  context: "schema" | "queries";
};

function loadSavedChats(): SavedChat[] {
  try {
    const raw = localStorage.getItem(CHATS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedChat[];
  } catch { /* ignore */ }
  return [];
}

function persistChats(chats: SavedChat[]) {
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats.slice(0, MAX_SAVED_CHATS)));
  } catch { /* ignore */ }
}

/**
 * Sanitize AI-generated SQL to be PGlite-compatible.
 * - Converts `GENERATED ALWAYS AS IDENTITY` → autoincrement via SERIAL/BIGSERIAL
 * - Converts `GENERATED BY DEFAULT AS IDENTITY` → autoincrement via SERIAL/BIGSERIAL
 * - Extracts inline ENUM references and creates CREATE TYPE statements
 */
function sanitizeSqlForPglite(sql: string): string {
  let result = sql;

  // Replace "bigint ... GENERATED ALWAYS AS IDENTITY" with BIGSERIAL
  result = result.replace(
    /\bbigint\b\s+(PRIMARY\s+KEY\s+)?GENERATED\s+(ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY/gi,
    "BIGSERIAL $1"
  );

  // Replace "integer/int ... GENERATED ALWAYS AS IDENTITY" with SERIAL
  result = result.replace(
    /\b(?:integer|int)\b\s+(PRIMARY\s+KEY\s+)?GENERATED\s+(ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY/gi,
    "SERIAL $1"
  );

  // Generic fallback: any remaining "GENERATED ... AS IDENTITY" → remove it, type stays
  result = result.replace(
    /\bGENERATED\s+(ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY/gi,
    ""
  );

  return result;
}

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
  return "Unknown error";
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

export default function DbVizStudio(props: Props) {
  return (
    <LocaleProvider>
      <DbVizStudioInner {...props} />
    </LocaleProvider>
  );
}

function DbVizStudioInner({ examples, runtimeConfig }: Props) {
  const { locale, setLocale, t } = useLocale();



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

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("diagram");
  const [mobilePanel, setMobilePanel] = useState<"ai" | "workspace">("workspace");

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
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [lastResults, setLastResults] = useState<QueryResultEntry[]>([]);

  const [engineStatus, setEngineStatus] = useState<EngineStatus>("idle");
  const [engineMessage, setEngineMessage] = useState("");
  const [isRunningCommand, setIsRunningCommand] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [selectedProvider] = useState<DbVizRuntimeProvider>("local");
  const [selectedLocalEngine] = useState<DbVizLocalEngine>("pglite");

  const [consoleOpen, setConsoleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDrawerOpen, setLoadDrawerOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(loadSavedProjects);
  const [savedChats, setSavedChats] = useState<SavedChat[]>(loadSavedChats);
  const { startTour, tourTheme, setTourTheme } = useTour(t, setSettingsOpen, setActiveTab);

  // Sync theme to <html> so CSS custom properties apply globally
  useEffect(() => {
    document.documentElement.dataset.theme = tourTheme;
  }, [tourTheme]);

  const [aiInput, setAiInput] = useState("");
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [aiSelectedModel, setAiSelectedModel] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading-models" | "thinking" | "generating" | "done" | "error">("idle");
  const [aiChat, setAiChat] = useState<AiChatEntry[]>([]);
  const [aiSessionName, setAiSessionName] = useState("");
  const [aiPreview, setAiPreview] = useState("");
  const [aiMode, setAiMode] = useState<AiMode>("ask");
  const [aiContext, setAiContext] = useState<AiContext>("schema");
  const [aiDirty, setAiDirty] = useState(false);
  const aiAbortRef = useRef<AbortController | null>(null);
  const aiChatEndRef = useRef<HTMLDivElement | null>(null);
  const aiNextId = useRef(0);

  // Multi-provider state
  const [providerCfg, setProviderCfg] = useState<StoredProviderConfig>(loadProviderConfig);

  const aiProviderConfig = useMemo<AiProviderConfig>(
    () => ({
      provider: providerCfg.provider,
      baseUrl: providerCfg.baseUrl,
      apiKey: providerCfg.apiKey,
      model: aiSelectedModel || providerCfg.model,
    }),
    [providerCfg, aiSelectedModel]
  );

  function updateProviderCfg(patch: Partial<StoredProviderConfig>) {
    setProviderCfg((prev) => {
      const next = { ...prev, ...patch };
      saveProviderConfig(next);
      return next;
    });
  }

  const isInteractiveEngine = useMemo(
    () => selectedProvider === "local" && selectedLocalEngine === "pglite",
    [selectedLocalEngine, selectedProvider]
  );

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

  // Set initial console entry and engine message on mount / locale change
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setEntries([{ id: 1, kind: "info", message: t("engine.ready") }]);
      setEngineMessage(t("engine.notInitialized"));
    }
  }, [t]);

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
      setEngineMessage(t("engine.initializing").replace("{reason}", payload.reason));
      setLastResults([]);

      await closeDatabase();

      try {
        const db = new PGlite();
        await db.waitReady;

        if (token !== bootstrapTokenRef.current) {
          await db.close();
          return;
        }

        // Keep the db reference alive even if schema/seed fails,
        // so users can still run commands manually to fix issues.
        dbRef.current = db;

        let schemaOk = true;
        let seedOk = true;

        if (payload.schema.trim()) {
          try {
            await db.exec(payload.schema);
          } catch (firstError) {
            // Retry with sanitized SQL (fix GENERATED AS IDENTITY, etc.)
            const sanitized = sanitizeSqlForPglite(payload.schema);
            if (sanitized !== payload.schema) {
              try {
                await db.exec(sanitized);
                appendConsole("info", "Schema auto-fixed for PGlite compatibility.");
              } catch (retryError) {
                schemaOk = false;
                const message = toErrorMessage(retryError);
                setEngineStatus("ready");
                setEngineMessage(t("engine.error").replace("{message}", message));
                appendConsole("warn", t("engine.initFailed").replace("{message}", message));
              }
            } else {
              schemaOk = false;
              const message = toErrorMessage(firstError);
              setEngineStatus("ready");
              setEngineMessage(t("engine.error").replace("{message}", message));
              appendConsole("warn", t("engine.initFailed").replace("{message}", message));
            }
          }
        }

        if (token !== bootstrapTokenRef.current) return;

        if (schemaOk && payload.seed.trim()) {
          try {
            await db.exec(payload.seed);
          } catch (error) {
            seedOk = false;
            const message = toErrorMessage(error);
            appendConsole("warn", `Seed error: ${message}`);
          }
        }

        if (token !== bootstrapTokenRef.current) return;

        if (schemaOk) {
          setEngineStatus("ready");
          setEngineMessage(t("engine.initialized").replace("{reason}", payload.reason));
          appendConsole(
            "ok",
            t("engine.schemaApplied").replace("{status}", payload.schema.trim() ? t("engine.applied") : t("engine.empty")) + (seedOk && payload.seed.trim() ? t("engine.seedApplied") : "")
          );
        }
      } catch (error) {
        const message = toErrorMessage(error);
        setEngineStatus("error");
        setEngineMessage(t("engine.error").replace("{message}", message));
        appendConsole("warn", t("engine.initFailed").replace("{message}", message));
      } finally {
        if (token === bootstrapTokenRef.current) {
          setIsBootstrapping(false);
        }
      }
    },
    [appendConsole, closeDatabase, t]
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

  function getTabValue(tab: WorkspaceTab) {
    if (tab === "schema") return schemaSql;
    if (tab === "seed") return seedSql;
    if (tab === "queries") return queriesSql;
    if (tab === "diagram") return diagramMmd;
    if (tab === "migrations") return migrationsSql;
    return "";
  }

  function setTabValue(tab: WorkspaceTab, value: string) {
    if (tab === "schema") setSchemaSql(value);
    else if (tab === "seed") setSeedSql(value);
    else if (tab === "queries") setQueriesSql(value);
    else if (tab === "diagram") setDiagramMmd(value);
    else if (tab === "migrations") setMigrationsSql(value);
  }

  async function applyEditorSqlToEngine() {
    if (!isInteractiveEngine) {
      appendConsole("warn", t("engine.externalRuntime"));
      return;
    }
    await bootstrapDatabase({
      schema: schemaSql,
      seed: seedSql,
      reason: "editor",
    });
  }

  async function runCommand() {
    if (!isInteractiveEngine) {
      appendConsole("warn", t("engine.sqlLocalOnly"));
      return;
    }

    const normalized = commandSql.trim();
    if (!normalized) {
      appendConsole("warn", t("engine.noSql"));
      return;
    }

    const db = dbRef.current;
    if (!db || engineStatus !== "ready") {
      appendConsole("warn", t("engine.notReady"));
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
        t("engine.commandExecuted").replace("{count}", String(results.length)).replace("{rows}", String(totalRows))
      );
      setCommandSql("");
      setActiveTab("results");
    } catch (error) {
      appendConsole("warn", t("engine.sqlError").replace("{message}", toErrorMessage(error)));
      setLastResults([]);
    } finally {
      setIsRunningCommand(false);
    }
  }

  function exportArtifact(tab: WorkspaceTab) {
    const target = WORKSPACE_TABS.find((item) => item.key === tab);
    if (!target?.fileName) return;

    const content = getTabValue(tab);
    if (!content.trim()) {
      appendConsole("warn", t("export.noContent").replace("{file}", target.fileName));
      return;
    }

    const slug = aiSessionName || selectedExample.slug;
    downloadTextFile(`${slug}-${target.fileName}`, content);
    appendConsole("ok", t("export.exported").replace("{file}", target.fileName));
  }

  function exportAllArtifacts() {
    const slug = aiSessionName || selectedExample.slug;
    for (const tab of WORKSPACE_TABS) {
      if (!tab.fileName) continue;
      const content = getTabValue(tab.key);
      if (!content.trim()) continue;
      downloadTextFile(`${slug}-${tab.fileName}`, content);
    }
    appendConsole("ok", t("export.allExported"));
  }

  /* ── Save / Load project ──────────────────────────────────── */

  function openSaveDialog() {
    setSaveName(aiSessionName || selectedExample.title);
    setSaveDialogOpen(true);
  }

  function handleSaveProject() {
    const name = saveName.trim();
    if (!name) return;

    const existing = savedProjects.find((p) => p.name === name);
    if (existing && !window.confirm(t("save.overwrite").replace("{name}", name))) return;

    const project: SavedProject = {
      name,
      savedAt: new Date().toISOString(),
      schemaSql,
      seedSql,
      queriesSql,
      diagramMmd,
      migrationsSql,
      aiChat,
      aiSessionName,
    };

    const updated = existing
      ? savedProjects.map((p) => (p.name === name ? project : p))
      : [...savedProjects, project];

    setSavedProjects(updated);
    persistProjects(updated);
    setSaveDialogOpen(false);
    appendConsole("ok", t("save.saved").replace("{name}", name));
  }

  function handleLoadProject(project: SavedProject) {
    setSchemaSql(project.schemaSql);
    setSeedSql(project.seedSql);
    setQueriesSql(project.queriesSql);
    setDiagramMmd(project.diagramMmd);
    setMigrationsSql(project.migrationsSql);
    setCommandSql("");
    setAiChat(project.aiChat ?? []);
    setAiSessionName(project.aiSessionName ?? "");
    setAiDirty(false);
    setAiPreview("");
    setLoadDrawerOpen(false);
    appendConsole("info", t("load.loaded").replace("{name}", project.name));

    if (isInteractiveEngine) {
      void bootstrapDatabase({
        schema: project.schemaSql,
        seed: project.seedSql,
        reason: `load ${project.name}`,
      });
    }
  }

  function handleDeleteProject(name: string) {
    if (!window.confirm(t("load.confirmDelete").replace("{name}", name))) return;
    const updated = savedProjects.filter((p) => p.name !== name);
    setSavedProjects(updated);
    persistProjects(updated);
    appendConsole("info", t("load.deleted").replace("{name}", name));
  }

  function handleLoadChat(chat: SavedChat) {
    setAiChat(chat.messages);
    setAiSessionName(chat.name);
    setAiContext(chat.context);
    setAiDirty(false);
    setAiPreview("");
    setAiStatus("idle");
  }

  function handleDeleteChat(chatId: string) {
    const updated = savedChats.filter((c) => c.id !== chatId);
    setSavedChats(updated);
    persistChats(updated);
  }

  useEffect(() => {
    hydrateFromExample(selectedExample, t("example.loaded").replace("{title}", selectedExample.title));
    setActiveTab("diagram");
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
          ? t("engine.supabaseScaffold")
          : t("engine.supabaseNotConfigured")
      );
    } else if (selectedLocalEngine === "docker") {
      setEngineMessage(t("engine.dockerCli"));
    } else {
      setEngineMessage(t("engine.notInitialized"));
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

  const fetchAiModels = useCallback(async () => {
    setAiStatus("loading-models");
    try {
      const models = await listProviderModels({
        provider: providerCfg.provider,
        baseUrl: providerCfg.baseUrl,
        apiKey: providerCfg.apiKey,
      });
      setAiModels(models);
      if (models.length > 0 && !aiSelectedModel) {
        setAiSelectedModel(models[0].id);
      }
      setAiStatus("idle");
      appendConsole("ok", t("ai.modelsLoaded").replace("{provider}", PROVIDER_DEFAULTS[providerCfg.provider].label).replace("{count}", String(models.length)));
    } catch (error) {
      setAiStatus("error");
      appendConsole("warn", t("ai.providerError").replace("{provider}", PROVIDER_DEFAULTS[providerCfg.provider].label).replace("{error}", toErrorMessage(error)));
    }
  }, [aiSelectedModel, appendConsole, providerCfg.provider, providerCfg.baseUrl, providerCfg.apiKey, t]);

  function pushChatEntry(role: "user" | "assistant", content: string): AiChatEntry {
    aiNextId.current += 1;
    const entry: AiChatEntry = {
      id: aiNextId.current,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setAiChat((prev) => [...prev, entry]);
    return entry;
  }

  function buildChatMessages(extraMessages: ChatMessage[]): ChatMessage[] {
    const systemContent = aiContext === "queries" ? QUERY_SYSTEM_PROMPT : SYSTEM_PROMPT;
    const system: ChatMessage = { role: "system", content: systemContent };
    const history: ChatMessage[] = aiChat.map((e) => ({
      role: e.role,
      content: e.content,
    }));
    return [system, ...history, ...extraMessages];
  }

  function aiChat_(options: { messages: ChatMessage[]; signal?: AbortSignal; onToken?: (t: string) => void }) {
    return providerChat({ config: aiProviderConfig, ...options });
  }

  async function handleAiSend() {
    const text = aiInput.trim();
    if (!text || !aiSelectedModel) return;

    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;

    pushChatEntry("user", text);
    setAiInput("");
    setAiPreview("");

    const hasExistingSchema = schemaSql.trim().length > 0;

    try {
      if (aiContext === "queries") {
        await handleQuerySend(text, controller, hasExistingSchema);
      } else {
        await handleSchemaSend(text, controller, hasExistingSchema && aiDirty);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setAiStatus("error");
      pushChatEntry("assistant", `Error: ${toErrorMessage(error)}`);
      appendConsole("warn", `AI error: ${toErrorMessage(error)}`);
    }
  }

  async function handleSchemaSend(text: string, controller: AbortController, hasExistingSchema: boolean) {
    if (aiMode === "ask") {
      setAiStatus("thinking");
      const askMsg = buildAskMessage(text, hasExistingSchema ? schemaSql : undefined);
      const raw = await aiChat_({ messages: buildChatMessages([askMsg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
      if (controller.signal.aborted) return;
      pushChatEntry("assistant", raw);
      setAiStatus("idle");
      setAiPreview("");
    } else if (aiMode === "plan") {
      setAiStatus("thinking");
      const planMsg = buildPlanMessage(text, hasExistingSchema ? schemaSql : undefined);
      const raw = await aiChat_({ messages: buildChatMessages([planMsg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
      if (controller.signal.aborted) return;
      pushChatEntry("assistant", raw);
      setAiStatus("idle");
      setAiPreview("");
    } else {
      const isFirstMessage = aiChat.length <= 1;

      if (isFirstMessage && !hasExistingSchema) {
        setAiStatus("thinking");
        const clarifyMsg = buildClarificationMessage(text);
        const clarifyRaw = await aiChat_({ messages: buildChatMessages([clarifyMsg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
        if (controller.signal.aborted) return;

        if (isReadyResponse(clarifyRaw)) {
          pushChatEntry("assistant", t("ai.status.generatingOk"));
          setAiPreview("");
          setAiStatus("generating");
          const genMsg = buildGenerateMessage();
          const genRaw = await aiChat_({ messages: buildChatMessages([clarifyMsg, { role: "assistant", content: "---READY---" }, genMsg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
          if (controller.signal.aborted) return;
          await applyAiOutput(genRaw, controller.signal);
        } else {
          pushChatEntry("assistant", extractQuestions(clarifyRaw));
          setAiStatus("idle");
          setAiPreview("");
        }
      } else if (hasExistingSchema) {
        setAiStatus("generating");
        const execMsg = buildExecuteMessage(text, schemaSql, diagramMmd);
        const raw = await aiChat_({ messages: buildChatMessages([execMsg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
        if (controller.signal.aborted) return;
        if (hasSchemaMarkers(raw)) { await applyAiOutput(raw, controller.signal); } else { pushChatEntry("assistant", raw); setAiStatus("idle"); setAiPreview(""); }
      } else {
        setAiStatus("generating");
        const genMsg = buildGenerateMessage();
        const raw = await aiChat_({ messages: buildChatMessages([genMsg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
        if (controller.signal.aborted) return;
        if (hasSchemaMarkers(raw)) { await applyAiOutput(raw, controller.signal); } else { pushChatEntry("assistant", raw); setAiStatus("idle"); setAiPreview(""); }
      }
    }
  }

  async function handleQuerySend(text: string, controller: AbortController, hasSchema: boolean) {
    if (!hasSchema) {
      pushChatEntry("assistant", t("ai.noSchema"));
      setAiStatus("idle");
      return;
    }

    if (aiMode === "ask") {
      setAiStatus("thinking");
      const msg = buildQueryAskMessage(text, schemaSql);
      const raw = await aiChat_({ messages: buildChatMessages([msg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
      if (controller.signal.aborted) return;
      pushChatEntry("assistant", raw);
      setAiStatus("idle");
      setAiPreview("");
    } else if (aiMode === "plan") {
      setAiStatus("thinking");
      const msg = buildQueryPlanMessage(text, schemaSql, queriesSql);
      const raw = await aiChat_({ messages: buildChatMessages([msg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
      if (controller.signal.aborted) return;
      pushChatEntry("assistant", raw);
      setAiStatus("idle");
      setAiPreview("");
    } else {
      setAiStatus("generating");
      const msg = buildQueryExecuteMessage(text, schemaSql, queriesSql);
      const raw = await aiChat_({ messages: buildChatMessages([msg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
      if (controller.signal.aborted) return;
      if (hasQueryMarkers(raw)) { applyQueryOutput(raw); } else { pushChatEntry("assistant", raw); setAiStatus("idle"); setAiPreview(""); }
    }
  }

  async function handleAutoGenerateQueries() {
    if (!schemaSql.trim() || !aiSelectedModel) return;

    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;

    pushChatEntry("user", t("ai.output.autoGeneratePrompt"));
    setAiPreview("");
    setAiStatus("generating");

    try {
      const msg = buildAutoGenerateQueriesMessage(schemaSql, queriesSql);
      const raw = await aiChat_({ messages: buildChatMessages([msg]), signal: controller.signal, onToken: (t) => setAiPreview((p) => p + t) });
      if (controller.signal.aborted) return;
      if (hasQueryMarkers(raw)) { applyQueryOutput(raw); } else { pushChatEntry("assistant", raw); setAiStatus("idle"); setAiPreview(""); }
    } catch (error) {
      if (controller.signal.aborted) return;
      setAiStatus("error");
      pushChatEntry("assistant", `Error: ${toErrorMessage(error)}`);
    }
  }

  function applyQueryOutput(raw: string) {
    const queries = parseQueryOutput(raw);
    if (!queries) {
      pushChatEntry("assistant", t("ai.output.queriesFailed"));
      setAiStatus("idle");
      setAiPreview("");
      return;
    }

    // Append to existing queries
    setQueriesSql((prev) => {
      const existing = prev.trim();
      return existing ? `${existing}\n\n-- ── AI-generated queries ──────────────────────────\n\n${queries}` : queries;
    });

    // Also set the command bar to the first query for quick execution
    const firstQuery = queries.split(/;\s*\n/).find((q) => q.trim() && !q.trim().startsWith("--"));
    if (firstQuery) {
      setCommandSql(firstQuery.trim().replace(/;?\s*$/, ";"));
    }

    setAiDirty(true);
    pushChatEntry("assistant", t("ai.output.queriesGenerated"));
    appendConsole("ok", `AI generated queries (${aiSelectedModel})`);
    setActiveTab("queries");
    setAiPreview("");
    setAiStatus("done");
  }

  async function applyAiOutput(raw: string, signal: AbortSignal) {
    const parsed = parseSchemaOutput(raw);

    if (!parsed.schema && !parsed.seed && !parsed.queries && !parsed.diagram) {
      pushChatEntry("assistant", raw.length > 300 ? t("ai.output.artifactsFailed") : raw);
      setAiStatus("idle");
      setAiPreview("");
      return;
    }

    if (parsed.schema) setSchemaSql(parsed.schema);
    if (parsed.seed) setSeedSql(parsed.seed);
    if (parsed.queries) setQueriesSql(parsed.queries);
    if (parsed.diagram) setDiagramMmd(parsed.diagram);
    setAiDirty(true);

    const parts = [
      parsed.schema ? "schema" : "",
      parsed.seed ? "seed" : "",
      parsed.queries ? "queries" : "",
      parsed.diagram ? "diagram" : "",
    ].filter(Boolean);
    pushChatEntry("assistant", t("ai.output.generated").replace("{parts}", parts.join(", ")));
    appendConsole("ok", `AI generated artifacts (${aiSelectedModel}): ${parts.join(", ")}`);
    setActiveTab("schema");
    setAiPreview("");

    // Auto-generate session name
    if (!aiSessionName && parsed.schema) {
      try {
        const nameMsg = buildNameMessage(parsed.schema);
        const name = await aiChat_({
          messages: [{ role: "system", content: "Respond with ONLY a short name (2-4 words, lowercase-hyphens). Nothing else." }, nameMsg],
          signal,
        });
        if (!signal.aborted) {
          const cleaned = name.trim().replace(/[^a-z0-9-]/gi, "").toLowerCase().slice(0, 40) || "untitled-schema";
          setAiSessionName(cleaned);
        }
      } catch {
        // Naming is best-effort
      }
    }

    setAiStatus("done");
  }

  function handleAiCancel() {
    aiAbortRef.current?.abort();
    setAiStatus("idle");
    setAiPreview("");
  }

  function handleAiNewSession() {
    if (aiDirty && !window.confirm(t("ai.confirmNewSession"))) {
      return;
    }
    // Auto-save current chat to history before clearing
    if (aiChat.length > 0) {
      const chatToSave: SavedChat = {
        id: `chat-${Date.now()}`,
        name: aiSessionName || aiChat[0].content.slice(0, 50),
        savedAt: new Date().toISOString(),
        messages: aiChat,
        context: aiContext,
      };
      const updated = [chatToSave, ...savedChats].slice(0, MAX_SAVED_CHATS);
      setSavedChats(updated);
      persistChats(updated);
    }
    setAiChat([]);
    setAiSessionName("");
    setAiDirty(false);
    setAiInput("");
    setAiPreview("");
    setAiStatus("idle");
  }

  // Scroll chat to bottom on new messages
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChat, aiPreview]);

  // Warn before reload when there's unsaved AI work
  useEffect(() => {
    if (!aiDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [aiDirty]);

  // Cmd+. to cycle AI modes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === ".") {
        e.preventDefault();
        setAiMode((prev) => {
          const modes: AiMode[] = ["ask", "plan", "execute"];
          return modes[(modes.indexOf(prev) + 1) % modes.length];
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const engineDot = engineStatus === "ready"
    ? "bg-emerald-400"
    : engineStatus === "booting"
      ? "bg-amber-400 animate-pulse"
      : engineStatus === "error"
        ? "bg-rose-400"
        : "bg-slate-500";

  const lastConsoleEntry = entries.at(-1);

  const activeTabMeta = WORKSPACE_TABS.find((t) => t.key === activeTab);
  const isEditableTab = activeTabMeta?.editable === true;

  return (
    <main className="flex h-[calc(100vh-4.5rem)] flex-col gap-3">
      {/* ── TOP TOOLBAR ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
        <select
          id="tour-examples"
          value={selectedSlug}
          onChange={(event) => setSelectedSlug(event.target.value)}
          className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-sm text-slate-100 outline-none transition-colors hover:bg-white/[0.1] focus:ring-1 focus:ring-white/20"
        >
          {availableExamples.map((example) => (
            <option key={example.slug} value={example.slug}>
              {example.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            hydrateFromExample(selectedExample, t("example.reset").replace("{title}", selectedExample.title));
            if (isInteractiveEngine) {
              void bootstrapDatabase({
                schema: selectedExample.schemaSql,
                seed: selectedExample.seedSql,
                reason: `reset ${selectedExample.slug}`,
              });
            }
          }}
          className="rounded-lg px-2 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
          title={t("toolbar.resetExample")}
        >
          {t("toolbar.reset")}
        </button>

        {resourceUrl ? (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-2 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
          >
            {t("toolbar.view")}
          </a>
        ) : null}

        <div className="flex-1" />

        <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-slate-400">
          pglite
        </span>

        <div id="tour-engine" className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${engineDot}`} />
          <span className="text-xs text-slate-400">{engineStatus}</span>
        </div>

        <button
          id="tour-apply"
          type="button"
          onClick={() => void applyEditorSqlToEngine()}
          disabled={isBootstrapping || !isInteractiveEngine}
          className="dbviz-btn-apply rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isBootstrapping ? t("toolbar.applying") : t("toolbar.apply")}
        </button>

        <button
          type="button"
          onClick={openSaveDialog}
          className="dbviz-btn-save rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
        >
          {t("save.button")}
        </button>

        <button
          type="button"
          onClick={() => { setSavedProjects(loadSavedProjects()); setLoadDrawerOpen(true); }}
          className="dbviz-btn-load rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
        >
          {t("load.button")}
        </button>

        {/* Tour button + theme picker */}
        <div className="flex items-center gap-0.5 rounded-md bg-white/[0.04] p-0.5">
          <button
            type="button"
            onClick={startTour}
            className="rounded px-2 py-0.5 text-[11px] font-medium text-slate-400 transition-all hover:bg-white/[0.08] hover:text-slate-200"
            title={t("tour.start")}
          >
            ?
          </button>
          {(TOUR_THEMES as readonly TourTheme[]).map((th) => {
            const dots: Record<TourTheme, string> = {
              dark: "bg-violet-400",
              soft: "bg-amber-300",
            };
            return (
              <button
                key={th}
                type="button"
                onClick={() => setTourTheme(th)}
                className={`flex items-center justify-center rounded px-1.5 py-1 transition-all ${
                  tourTheme === th ? "bg-white/[0.1]" : "hover:bg-white/[0.06]"
                }`}
                title={t(`tour.theme.${th}` as any)}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dots[th]} ${tourTheme === th ? "" : "opacity-40"}`} />
              </button>
            );
          })}
        </div>

        {/* Language toggle */}
        <div id="tour-lang-toggle" className="flex items-center rounded-md bg-white/[0.04] p-0.5">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                locale === l
                  ? "bg-white/[0.1] text-slate-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── MOBILE PANEL SWITCHER (visible < lg) ─────────────────── */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 lg:hidden">
        {(["ai", "workspace"] as const).map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setMobilePanel(panel)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              mobilePanel === panel
                ? "bg-white/[0.1] text-slate-100"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {panel === "ai" ? t("ai.designer") : t("mobile.workspace")}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="grid flex-1 gap-3 overflow-hidden lg:grid-cols-[1fr_1.4fr]">

        {/* ── LEFT: AI CHAT (full height) ─────────────────────────── */}
        <div id="tour-ai-panel" className={`flex flex-col overflow-hidden rounded-xl bg-white/[0.03] ${mobilePanel !== "ai" ? "hidden lg:flex" : ""}`}>
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20 text-[11px] text-violet-300">
              {t("ai.label")}
            </span>
            <span className="text-sm font-medium text-slate-200">
              {aiSessionName || t("ai.designer")}
            </span>

            {/* Context toggle */}
            <div className="flex items-center rounded-md bg-white/[0.04] p-0.5">
              {(["schema", "queries"] as const).map((ctx) => (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => setAiContext(ctx)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                    aiContext === ctx
                      ? "bg-white/[0.1] text-slate-200"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {ctx === "schema" ? t("ai.context.schema") : t("ai.context.queries")}
                </button>
              ))}
            </div>

            <div className="flex-1" />
            {aiDirty ? (
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" title={t("ai.unsavedWork")} />
            ) : null}
            {aiModels.length > 0 ? (
              <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-500">
                {PROVIDER_DEFAULTS[providerCfg.provider].label}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/[0.1] hover:text-slate-200"
              title={t("ai.settingsTitle")}
            >
              {t("ai.settings")}
            </button>
          </div>

          {/* Model toolbar */}
          {aiModels.length > 0 ? (
            <div className="flex items-center gap-2 border-t border-white/[0.04] px-3 py-1.5">
              <select
                value={aiSelectedModel}
                onChange={(event) => setAiSelectedModel(event.target.value)}
                disabled={aiStatus === "generating" || aiStatus === "thinking"}
                className="flex-1 rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-slate-300 outline-none transition-colors hover:bg-white/[0.1] disabled:opacity-40"
              >
                {aiModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void fetchAiModels()}
                disabled={aiStatus === "loading-models" || aiStatus === "generating" || aiStatus === "thinking"}
                className="rounded-md bg-white/[0.06] px-1.5 py-1 text-[11px] text-slate-500 transition-colors hover:bg-white/[0.1] hover:text-slate-300 disabled:opacity-40"
                title={t("ai.refreshModels")}
              >
                ↻
              </button>
              {aiContext === "queries" && schemaSql.trim() ? (
                <button
                  type="button"
                  onClick={() => void handleAutoGenerateQueries()}
                  disabled={aiStatus === "generating" || aiStatus === "thinking"}
                  className="rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
                  title={t("ai.autoGenerateQueries")}
                >
                  {t("ai.autoGenerate")}
                </button>
              ) : null}
              {aiChat.length > 0 ? (
                <button
                  type="button"
                  onClick={handleAiNewSession}
                  className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-white/[0.1] hover:text-slate-300"
                  title={t("ai.newSession")}
                >
                  {t("ai.new")}
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Chat messages */}
          <div className="flex-1 space-y-2.5 overflow-auto px-3 py-3">
            {aiChat.length === 0 && aiStatus !== "thinking" && aiStatus !== "generating" ? (
              <div className="flex h-full flex-col items-center justify-start gap-3 pt-8 text-center">
                {aiContext === "schema" ? (
                  <>
                    <p className="text-sm text-slate-500">{t("ai.empty.describeDb")}</p>
                    <p className="max-w-[280px] text-xs leading-5 text-slate-600">
                      {t("ai.empty.describeDbHint")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500">{t("ai.empty.generateQueries")}</p>
                    <p className="max-w-[280px] text-xs leading-5 text-slate-600">
                      {t("ai.empty.generateQueriesHint")}
                    </p>
                    {schemaSql.trim() && aiSelectedModel ? (
                      <button
                        type="button"
                        onClick={() => void handleAutoGenerateQueries()}
                        disabled={aiStatus === "generating" || aiStatus === "thinking"}
                        className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-40"
                      >
                        {t("ai.autoGenerateQueries")}
                      </button>
                    ) : (
                      <p className="text-[11px] text-slate-600">
                        {!schemaSql.trim() ? t("ai.empty.loadSchemaFirst") : t("ai.empty.connectFirst")}
                      </p>
                    )}
                  </>
                )}

                {/* Previous chats */}
                {savedChats.length > 0 ? (
                  <div className="mt-4 w-full max-w-[320px]">
                    <p className="mb-2 text-[11px] font-medium text-slate-500">{t("chat.previousChats")}</p>
                    <ul className="space-y-1">
                      {savedChats.slice(0, 8).map((chat) => (
                        <li key={chat.id} className="group flex items-center gap-1.5 rounded-lg transition-colors hover:bg-white/[0.04]">
                          <button
                            type="button"
                            onClick={() => handleLoadChat(chat)}
                            className="flex-1 truncate px-2.5 py-2 text-left text-[11px] text-slate-400 transition-colors hover:text-slate-200"
                          >
                            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-violet-400/40" />
                            {chat.name}
                            <span className="ml-1.5 text-[10px] text-slate-600">
                              {new Date(chat.savedAt).toLocaleDateString()}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChat(chat.id)}
                            className="rounded px-1.5 py-1 text-[10px] text-slate-600 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {aiChat.map((entry) => (
              <div
                key={entry.id}
                className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-5 ${
                    entry.role === "user"
                      ? "bg-violet-500/15 text-slate-200"
                      : "bg-white/[0.06] text-slate-300"
                  }`}
                >
                  {entry.role === "assistant" ? (
                    <div
                      className="chat-markdown"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                  )}
                  <p className="mt-1.5 text-[10px] text-slate-600">
                    {new Date(entry.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {(aiStatus === "thinking" || aiStatus === "generating") && aiPreview ? (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-xl bg-white/[0.06] px-3.5 py-2.5">
                  <pre className="max-h-[140px] overflow-auto font-mono text-[11px] leading-4 text-slate-400">
                    {aiPreview}
                  </pre>
                </div>
              </div>
            ) : (aiStatus === "thinking" || aiStatus === "generating") && !aiPreview ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-500">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                  {aiStatus === "thinking" ? t("ai.status.evaluating") : t("ai.status.generating")}
                </div>
              </div>
            ) : null}

            <div ref={aiChatEndRef} />
          </div>

          {/* Input area with mode selector */}
          <div className="border-t border-white/[0.04]">
            {/* Mode tabs */}
            <div id="tour-ai-modes" className="flex items-center gap-1 px-3 pt-2">
              {(["ask", "plan", "execute"] as const).map((mode) => {
                const labels: Record<AiMode, string> = { ask: t("ai.mode.ask"), plan: t("ai.mode.plan"), execute: t("ai.mode.execute") };
                const colors: Record<AiMode, { active: string; inactive: string }> = {
                  ask: { active: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30", inactive: "text-slate-500 hover:text-sky-300 hover:bg-sky-500/10" },
                  plan: { active: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30", inactive: "text-slate-500 hover:text-amber-300 hover:bg-amber-500/10" },
                  execute: { active: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30", inactive: "text-slate-500 hover:text-emerald-300 hover:bg-emerald-500/10" },
                };
                const isActive = aiMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAiMode(mode)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${isActive ? colors[mode].active : colors[mode].inactive}`}
                  >
                    {labels[mode]}
                  </button>
                );
              })}
              <span className="ml-auto text-[10px] text-slate-600">
                {aiContext === "queries"
                  ? aiMode === "ask" ? t("ai.modeDesc.queryAsk") : aiMode === "plan" ? t("ai.modeDesc.queryPlan") : t("ai.modeDesc.queryExecute")
                  : aiMode === "ask" ? t("ai.modeDesc.schemaAsk") : aiMode === "plan" ? t("ai.modeDesc.schemaPlan") : t("ai.modeDesc.schemaExecute")}
              </span>
            </div>

            {/* Textarea + send */}
            <div className="flex items-end gap-2 px-3 pb-2.5 pt-1.5">
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder={
                  aiContext === "queries"
                    ? aiMode === "ask"
                      ? t("ai.ph.queryAsk")
                      : aiMode === "plan"
                        ? t("ai.ph.queryPlan")
                        : t("ai.ph.queryExecute")
                    : aiMode === "ask"
                      ? t("ai.ph.schemaAsk")
                      : aiMode === "plan"
                        ? t("ai.ph.schemaPlan")
                        : aiDirty
                          ? t("ai.ph.schemaRefine")
                          : t("ai.ph.schemaGenerate")
                }
                disabled={aiStatus === "generating" || aiStatus === "thinking" || aiModels.length === 0}
                rows={2}
                className="min-h-[40px] max-h-[100px] flex-1 resize-none rounded-lg bg-white/[0.04] px-3 py-2 text-xs leading-5 text-slate-200 outline-none ring-1 ring-white/[0.06] transition-colors placeholder:text-slate-600 focus:ring-white/[0.12] disabled:opacity-50"
                spellCheck={false}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleAiSend();
                  }
                }}
              />
              {aiStatus === "generating" || aiStatus === "thinking" ? (
                <button
                  type="button"
                  onClick={handleAiCancel}
                  className="rounded-lg bg-rose-500/15 px-3 py-2 text-[11px] font-medium text-rose-300 transition-colors hover:bg-rose-500/25"
                >
                  {t("ai.mode.stop")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleAiSend()}
                  disabled={!aiSelectedModel || !aiInput.trim()}
                  className={`rounded-lg px-3 py-2 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    aiMode === "ask"
                      ? "bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
                      : aiMode === "plan"
                        ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  }`}
                >
                  {aiMode === "ask" ? t("ai.mode.ask") : aiMode === "plan" ? t("ai.mode.plan") : t("ai.mode.execute")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: UNIFIED WORKSPACE ────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden rounded-xl bg-white/[0.03] ${mobilePanel !== "workspace" ? "hidden lg:flex" : ""}`}>
          {/* Tab bar */}
          <div id="tour-tabs" className="flex items-center gap-0.5 border-b border-white/[0.06] px-2 pt-1">
            {WORKSPACE_TABS.map((tab) => {
              const colors = TAB_COLORS[tab.key];
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs transition-all ${
                    isActive
                      ? `${colors.active} text-slate-100`
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} ${isActive ? "" : "opacity-40"}`} />
                  {t(`tab.${tab.key}` as any)}
                  {tab.key === "results" && lastResults.length > 0 ? (
                    <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-db-500/20 px-1 text-[10px] text-db-300">
                      {lastResults.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
            <div className="flex-1" />
            {activeTabMeta?.fileName ? (
              <>
                <button
                  type="button"
                  onClick={() => exportArtifact(activeTab)}
                  className="mb-0.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                >
                  {t("export.button")}
                </button>
                <button
                  type="button"
                  onClick={exportAllArtifacts}
                  className="mb-0.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                >
                  {t("export.all")}
                </button>
              </>
            ) : null}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            {/* Editable code tabs: schema, seed, queries */}
            {isEditableTab ? (
              <SqlEditor
                value={getTabValue(activeTab)}
                onChange={(v) => setTabValue(activeTab, v)}
              />
            ) : activeTab === "diagram" ? (
              <div className="space-y-4 p-4">
                <SchemaDiagramCanvas diagramMmd={diagramMmd} locale={locale} />
                <details className="group">
                  <summary className="cursor-pointer text-[11px] text-slate-500 transition-colors hover:text-slate-300">
                    {t("diagram.viewSource")}
                  </summary>
                  <textarea
                    value={diagramMmd}
                    onChange={(event) => setDiagramMmd(event.target.value)}
                    className="mt-2 min-h-[120px] w-full resize-y rounded-lg bg-black/30 p-3 font-mono text-[11px] leading-5 text-slate-400 outline-none"
                    spellCheck={false}
                  />
                </details>
              </div>
            ) : activeTab === "erd" ? (
              <div id="tour-erd-canvas" className="p-4">
                <CrowsFootDiagram schemaSql={schemaSql} locale={locale} onSchemaChange={(sql) => setSchemaSql(sql)} />
              </div>
            ) : activeTab === "migrations" ? (
              <div className="space-y-4 p-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-400">{t("migrations.snapshot")}</p>
                  <pre className="max-h-[240px] overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[11px] leading-5 text-slate-400">
                    {toMigrationSnapshot(migrationsSql)}
                  </pre>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-400">{t("migrations.history")}</p>
                  {migrationLog.length === 0 ? (
                    <p className="text-xs text-slate-600">{t("migrations.noMigrations")}</p>
                  ) : (
                    <ol className="space-y-2">
                      {migrationLog.map((migration) => (
                        <li key={migration.id} className="rounded-lg bg-black/20 p-2.5">
                          <p className="text-[11px] text-slate-500">
                            #{migration.id} &middot; {new Date(migration.createdAtISO).toLocaleString(locale === "es" ? "es-CO" : "en-US")}
                          </p>
                          <pre className="mt-1 max-h-[100px] overflow-auto font-mono text-[11px] leading-5 text-slate-300">
                            {migration.sql}
                          </pre>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            ) : (
              /* results tab */
              <div className="p-4">
                {lastResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm text-slate-500">{t("results.noResults")}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {t("results.executeHint")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lastResults.map((statementResult) => {
                      const { result, rows, statementNumber } = statementResult;
                      const columns = result.fields.map((field) => field.name);
                      const fallbackColumns =
                        columns.length > 0 ? columns : rows.length > 0 ? Object.keys(rows[0].row) : [];
                      const previewRows = rows.slice(0, MAX_RESULT_ROWS);
                      return (
                        <div key={statementResult.id}>
                          <p className="mb-1.5 text-[11px] text-slate-500">
                            {t("results.statement").replace("{num}", String(statementNumber))} &middot; {t("results.rows").replace("{count}", String(rows.length))} &middot;{" "}
                            {t("results.affected").replace("{count}", String(result.affectedRows ?? 0))}
                          </p>
                          {fallbackColumns.length === 0 ? (
                            <p className="text-xs text-slate-600">{t("results.noColumns")}</p>
                          ) : (
                            <div className="overflow-auto rounded-lg bg-black/20">
                              <table className="min-w-full border-collapse text-[11px]">
                                <thead>
                                  <tr className="border-b border-white/[0.06]">
                                    {fallbackColumns.map((column) => (
                                      <th key={column} className="px-3 py-2 text-left font-medium text-slate-400">
                                        {column}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previewRows.map((previewRow) => {
                                    const record = previewRow.row;
                                    return (
                                      <tr key={previewRow.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                                        {fallbackColumns.map((column) => (
                                          <td key={`${previewRow.id}-${column}`} className="px-3 py-1.5 text-slate-300">
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
                            <p className="mt-1 text-[11px] text-slate-600">
                              {t("results.showing").replace("{shown}", String(MAX_RESULT_ROWS)).replace("{total}", String(rows.length))}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR: Command SQL + Console ────────────────────── */}
      <div id="tour-sql-bar" className={`flex items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ${mobilePanel !== "workspace" ? "hidden lg:flex" : ""}`}>
        <span className="mt-1.5 font-mono text-xs text-slate-600">SQL&gt;</span>
        <textarea
          value={commandSql}
          onChange={(event) => setCommandSql(event.target.value)}
          placeholder="select * from users limit 20;"
          rows={1}
          className="min-h-[32px] max-h-[120px] flex-1 resize-y bg-transparent font-mono text-xs leading-5 text-slate-200 outline-none placeholder:text-slate-600"
          spellCheck={false}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void runCommand();
            }
          }}
        />
        <button
          type="button"
          onClick={() => void runCommand()}
          disabled={isRunningCommand || engineStatus !== "ready" || !isInteractiveEngine}
          className="rounded-lg bg-db-500/20 px-4 py-1.5 text-xs font-medium text-db-300 transition-colors hover:bg-db-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunningCommand ? t("bottom.running") : t("bottom.run")}
        </button>

        <div className="ml-1 border-l border-white/[0.06] pl-3">
          <button
            type="button"
            onClick={() => setConsoleOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          >
            {t("bottom.console")}
            {lastConsoleEntry ? (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  lastConsoleEntry.kind === "ok"
                    ? "bg-emerald-400"
                    : lastConsoleEntry.kind === "warn"
                      ? "bg-amber-400"
                      : "bg-sky-400"
                }`}
              />
            ) : null}
          </button>
        </div>
      </div>

      {/* Console overlay */}
      {consoleOpen ? (
        <div className="rounded-xl bg-black/40 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">{t("bottom.console")}</span>
            <button
              type="button"
              onClick={() => setConsoleOpen(false)}
              className="text-[11px] text-slate-600 transition-colors hover:text-slate-400"
            >
              {t("bottom.close")}
            </button>
          </div>
          <ul className="max-h-[160px] space-y-0.5 overflow-auto">
            {entries.map((entry) => (
              <li key={entry.id} className="font-mono text-[11px] text-slate-400">
                <span
                  className={
                    entry.kind === "ok"
                      ? "text-emerald-400"
                      : entry.kind === "warn"
                        ? "text-amber-400"
                        : "text-slate-500"
                  }
                >
                  {entry.kind === "ok" ? "ok" : entry.kind === "warn" ? "!!" : "--"}
                </span>{" "}
                {entry.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ── AI SETTINGS DRAWER ──────────────────────────────────── */}
      {settingsOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
            onKeyDown={(e) => { if (e.key === "Escape") setSettingsOpen(false); }}
            role="button"
            tabIndex={-1}
            aria-label="Close settings"
          />
          <div id="tour-settings-drawer" className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-slate-900 shadow-2xl shadow-black/40">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-100">{t("settings.title")}</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
              >
                {t("settings.close")}
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 space-y-5 overflow-auto px-5 py-5">
              {/* Provider selector */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-400">{t("settings.provider")}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(PROVIDER_DEFAULTS) as AiProvider[]).map((p) => {
                    const isActive = providerCfg.provider === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          updateProviderCfg({
                            provider: p,
                            baseUrl: PROVIDER_DEFAULTS[p].baseUrl,
                            apiKey: p === "ollama" ? "" : providerCfg.apiKey,
                            model: "",
                          });
                          setAiModels([]);
                          setAiSelectedModel("");
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
                            : "bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] hover:text-slate-300"
                        }`}
                      >
                        {PROVIDER_DEFAULTS[p].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-400">
                  {providerCfg.provider === "ollama" ? t("settings.ollamaUrl") : t("settings.baseUrl")}
                </label>
                <input
                  type="text"
                  value={providerCfg.baseUrl}
                  onChange={(e) => updateProviderCfg({ baseUrl: e.target.value })}
                  className="w-full rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-xs text-slate-200 outline-none ring-1 ring-white/[0.06] transition-colors placeholder:text-slate-600 focus:ring-white/[0.15]"
                  placeholder={PROVIDER_DEFAULTS[providerCfg.provider].baseUrl}
                  spellCheck={false}
                />
              </div>

              {/* API Key */}
              {providerCfg.provider !== "ollama" ? (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-400">{t("settings.apiKey")}</label>
                    {PROVIDER_DEFAULTS[providerCfg.provider].keyUrl ? (
                      <a
                        href={PROVIDER_DEFAULTS[providerCfg.provider].keyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-violet-400 transition-colors hover:text-violet-300"
                      >
                        {t("settings.getKey")}
                      </a>
                    ) : null}
                  </div>
                  <input
                    type="password"
                    value={providerCfg.apiKey}
                    onChange={(e) => updateProviderCfg({ apiKey: e.target.value })}
                    className="w-full rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-xs text-slate-200 outline-none ring-1 ring-white/[0.06] transition-colors placeholder:text-slate-600 focus:ring-white/[0.15]"
                    placeholder="sk-..."
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <p className="mt-1 text-[10px] text-slate-600">
                    {t("settings.apiKeyHint")}
                  </p>
                </div>
              ) : null}

              {/* Load models button */}
              <button
                type="button"
                onClick={() => void fetchAiModels()}
                disabled={aiStatus === "loading-models" || (providerCfg.provider !== "ollama" && !providerCfg.apiKey)}
                className="w-full rounded-lg bg-violet-500/15 py-2.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {aiStatus === "loading-models" ? t("settings.loadingModels") : t("settings.loadModels")}
              </button>

              {/* Model selector */}
              {aiModels.length > 0 ? (
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-400">{t("settings.model")}</label>
                  <select
                    value={aiSelectedModel}
                    onChange={(e) => {
                      setAiSelectedModel(e.target.value);
                      updateProviderCfg({ model: e.target.value });
                    }}
                    className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-slate-200 outline-none ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08]"
                  >
                    {aiModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Status */}
              <div className="rounded-lg bg-white/[0.03] px-3 py-2.5">
                <p className="text-[11px] text-slate-500">
                  {t("settings.status")} {aiModels.length > 0
                    ? t("settings.modelsAvailable").replace("{count}", String(aiModels.length))
                    : aiStatus === "loading-models"
                      ? t("settings.loading")
                      : aiStatus === "error"
                        ? t("settings.connectionFailed")
                        : t("settings.notConnected")}
                </p>
                {aiSelectedModel ? (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {t("settings.active")} <span className="font-mono text-violet-300">{aiSelectedModel}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
      <HelpChat aiConfig={aiProviderConfig} locale={locale} />

      {/* ── SAVE PROJECT DIALOG ──────────────────────────────────── */}
      {saveDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl dbviz-modal-bg p-6 shadow-2xl ring-1 ring-white/[0.08]">
            <h3 className="mb-4 text-sm font-semibold text-slate-100">{t("save.title")}</h3>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400">{t("save.nameLabel")}</label>
            <input
              type="text"
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveProject(); if (e.key === "Escape") setSaveDialogOpen(false); }}
              placeholder={t("save.namePlaceholder")}
              className="mb-4 w-full rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-slate-200 outline-none ring-1 ring-white/[0.08] placeholder:text-slate-600 focus:ring-violet-500/40"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSaveDialogOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
              >
                {t("save.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={!saveName.trim()}
                className="rounded-lg bg-violet-500/20 px-4 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("save.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── LOAD PROJECTS DRAWER ─────────────────────────────────── */}
      {loadDrawerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col rounded-2xl dbviz-modal-bg shadow-2xl ring-1 ring-white/[0.08]" style={{ maxHeight: "70vh" }}>
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-100">{t("load.title")}</h3>
              <button
                type="button"
                onClick={() => setLoadDrawerOpen(false)}
                className="rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
              >
                {t("load.close")}
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 pb-5">
              {savedProjects.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">{t("load.empty")}</p>
              ) : (
                <ul className="space-y-2">
                  {savedProjects.map((project) => (
                    <li
                      key={project.name}
                      className="group flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.08]"
                    >
                      <button
                        type="button"
                        onClick={() => handleLoadProject(project)}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-medium text-slate-200">{project.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {t("load.savedAt").replace("{date}", new Date(project.savedAt).toLocaleString())}
                          {project.aiChat?.length ? (
                            <span className="ml-2 inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-400">
                              {project.aiChat.length} {t("chat.previousChats").toLowerCase()}
                            </span>
                          ) : null}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.name)}
                        className="rounded-md px-2 py-1 text-[11px] text-slate-600 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-400 group-hover:opacity-100"
                      >
                        {t("load.delete")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
