import {
  type StyleForgeDraft,
  type StyleForgeJob,
  StyleForgeJobSchema,
  type StyleForgeKit,
  StyleForgeKitSchema,
  type StyleForgeProvider,
  type StyleForgeReference,
  type StyleForgeSelection,
} from "@stealthis/schema/styleforge";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { downloadZip } from "../lib/styleforge/files";
import { createId } from "../lib/styleforge/ids";
import {
  CONSTRAINT_PRESETS,
  type ConstraintPreset,
  defaultModelForProvider,
  modelOptionsForProvider,
} from "../lib/styleforge/presets";

import type { StyleForgeCollectionGroup, CollectionResource } from "../lib/styleforge/collections";
import { CollectionOverview } from "./views/CollectionOverview";
import { CollectionDetail } from "./views/CollectionDetail";
import { SearchDiscovery } from "./views/SearchDiscovery";
import { ComparisonScreen } from "./views/ComparisonScreen";

interface ReferencesResponse {
  generatedAt: string;
  pages: StyleForgeReference[];
  components: StyleForgeReference[];
  constraintPresets: ConstraintPreset[];
}

interface DraftResponse {
  ok: boolean;
  mode: "deterministic" | "ai";
  draft: StyleForgeDraft;
}

interface FinalizeResponse {
  ok: boolean;
  kit: StyleForgeKit;
}

const JOBS_KEY = "stealthis:styleforge:jobs:v1";
const KITS_KEY = "stealthis:styleforge:kits:v1";
const SIDEBAR_COLLAPSED_KEY = "stealthis:styleforge:sidebar:collapsed:v1";
const LAB_BASE_URL = import.meta.env.DEV ? "http://localhost:4323" : "https://lab.stealthis.dev";
const PAGE_SELECTION_LIMIT = 8;
const COMPONENT_SELECTION_LIMIT = 12;
const REFERENCE_BATCH_SIZE = 8;

interface OrbitOption {
  id: string;
  label: string;
  meta: string;
}

function OrbitSelector({
  title,
  subtitle,
  options,
  selected,
  maxSelect,
  onToggle,
}: {
  title: string;
  subtitle: string;
  options: OrbitOption[];
  selected: string[];
  maxSelect: number;
  onToggle: (id: string) => void;
}) {
  const radius = Math.max(108, Math.min(172, 96 + options.length * 4));
  const angleStep = 360 / Math.max(options.length, 1);
  const orbitStyle: CSSProperties = {
    ["--orbit-size" as const]: `${radius * 2 + 120}px`,
  };

  return (
    <section className="sf-orbit-panel">
      <div className="sf-orbit-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="sf-orbit-shell" style={orbitStyle}>
        {options.map((option, index) => {
          const angle = angleStep * index;
          const isActive = selected.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              className={`sf-orbit-node ${isActive ? "is-active" : ""}`}
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`,
              }}
              onClick={() => onToggle(option.id)}
            >
              <span className="sf-orbit-node-title">{option.label}</span>
              <span className="sf-orbit-node-meta">{option.meta}</span>
            </button>
          );
        })}

        <div className="sf-orbit-core">
          <p>Selected</p>
          <strong>
            {selected.length}/{maxSelect}
          </strong>
        </div>
      </div>
    </section>
  );
}

function SidebarIcon({
  id,
}: { id: "pages" | "components" | "constraints" | "draft" | "finalize" }) {
  if (id === "pages") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (id === "components") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    );
  }

  if (id === "constraints") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  if (id === "draft") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 7h18" />
        <path d="M3 12h18" />
        <path d="M3 17h18" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function LazyLabPreview({
  labRoute,
  title,
  variant = "card",
  eager = false,
}: {
  labRoute: string | null;
  title: string;
  variant?: "card" | "stage";
  eager?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    if (eager) {
      setShouldLoad(true);
      return;
    }
    if (!labRoute || shouldLoad) return;

    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [eager, labRoute, shouldLoad]);

  if (!labRoute) {
    return (
      <div
        ref={containerRef}
        className={`sf-ref-preview sf-ref-preview-${variant} sf-ref-preview-fallback`}
      >
        <p>No lab preview available for this reference.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`sf-ref-preview sf-ref-preview-${variant}`}>
      {shouldLoad ? (
        <iframe
          title={`${title} preview`}
          src={`${LAB_BASE_URL}${labRoute}`}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <p>Loading preview...</p>
      )}
    </div>
  );
}

function ReferencePicker({
  title,
  subtitle,
  references,
  selected,
  maxSelect,
  isLoading,
  onToggle,
}: {
  title: string;
  subtitle: string;
  references: StyleForgeReference[];
  selected: string[];
  maxSelect: number;
  isLoading: boolean;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(REFERENCE_BATCH_SIZE);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return references;

    return references.filter((reference) => {
      const haystack = [
        reference.title,
        reference.description,
        reference.category,
        ...reference.tags,
        ...reference.tech,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [references, query]);

  useEffect(() => {
    setVisibleCount(REFERENCE_BATCH_SIZE);
  }, [query, references]);

  useEffect(() => {
    if (filtered.length === 0) {
      setActiveSlug(null);
      return;
    }

    setActiveSlug((current) => {
      if (!current) return null;
      return filtered.some((reference) => reference.slug === current) ? current : null;
    });
  }, [filtered]);

  const visibleReferences = filtered.slice(0, visibleCount);
  const selectedReferences = useMemo(
    () => references.filter((reference) => selectedSet.has(reference.slug)),
    [references, selectedSet]
  );
  const activeReference = useMemo(() => {
    if (!activeSlug) return null;
    return filtered.find((reference) => reference.slug === activeSlug) ?? null;
  }, [activeSlug, filtered]);
  const isActiveSelected = activeReference ? selectedSet.has(activeReference.slug) : false;

  return (
    <section className="sf-orbit-panel sf-reference-panel">
      <div className="sf-orbit-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="sf-ref-toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search references by name, tag, or tech"
          aria-label={`${title} search`}
        />
        <p className="sf-ref-count">
          Selected {selected.length}/{maxSelect} • Showing {visibleReferences.length}/
          {filtered.length}
        </p>
      </div>

      {selectedReferences.length > 0 ? (
        <div className="sf-ref-selected-strip" aria-label={`${title} selected references`}>
          {selectedReferences.map((reference) => (
            <button
              key={`selected-${reference.slug}`}
              type="button"
              className={`sf-ref-selected-chip ${reference.slug === activeReference?.slug ? "is-active" : ""}`}
              onClick={() => setActiveSlug(reference.slug)}
            >
              <span>{reference.title}</span>
              <strong>Selected</strong>
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <p className="sf-muted">Loading references...</p>
      ) : visibleReferences.length === 0 ? (
        <p className="sf-muted">No references found for this search.</p>
      ) : (
        <div className="sf-ref-layout">
          <article className="sf-ref-focus">
            {activeReference ? (
              <>
                <div className="sf-ref-focus-head">
                  <div>
                    <p className="sf-ref-focus-kicker">{activeReference.category}</p>
                    <h3>{activeReference.title}</h3>
                    <p>{activeReference.description}</p>
                  </div>
                  <div className="sf-ref-focus-actions">
                    <button
                      type="button"
                      aria-pressed={isActiveSelected}
                      onClick={() => onToggle(activeReference.slug)}
                    >
                      {isActiveSelected ? "Selected" : "Select"}
                    </button>
                    {activeReference.labRoute ? (
                      <a
                        href={`${LAB_BASE_URL}${activeReference.labRoute}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open lab
                      </a>
                    ) : null}
                  </div>
                </div>

                <LazyLabPreview
                  labRoute={activeReference.labRoute}
                  title={activeReference.title}
                  variant="stage"
                  eager
                />

                <div className="sf-ref-focus-meta">
                  {activeReference.tags.slice(0, 4).map((tag) => (
                    <span key={`${activeReference.slug}-tag-${tag}`}>{tag}</span>
                  ))}
                  {activeReference.tech.slice(0, 3).map((tech) => (
                    <span key={`${activeReference.slug}-tech-${tech}`}>{tech}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="sf-ref-empty">
                <strong>No reference selected yet</strong>
                <p>
                  Pick one from the list to open a large live preview here. This applies to both
                  page references and component references.
                </p>
              </div>
            )}
          </article>

          <div className="sf-ref-grid">
            {visibleReferences.map((reference) => {
              const isSelected = selectedSet.has(reference.slug);
              const isActive = reference.slug === activeReference?.slug;

              return (
                <article
                  key={reference.slug}
                  className={`sf-ref-card ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`}
                >
                  <button
                    type="button"
                    className="sf-ref-card-main"
                    onClick={() => setActiveSlug(reference.slug)}
                    aria-pressed={isActive}
                  >
                    <div className="sf-ref-card-head">
                      <h3>{reference.title}</h3>
                      <p>{reference.category}</p>
                    </div>
                    <p className="sf-ref-description">{reference.description}</p>
                  </button>

                  <div className="sf-ref-card-actions">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setActiveSlug(reference.slug);
                        onToggle(reference.slug);
                      }}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                    <button
                      type="button"
                      className="sf-ref-card-preview"
                      onClick={() => setActiveSlug(reference.slug)}
                    >
                      Preview
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {visibleCount < filtered.length ? (
        <button
          type="button"
          className="sf-load-more"
          onClick={() =>
            setVisibleCount((current) => Math.min(current + REFERENCE_BATCH_SIZE, filtered.length))
          }
        >
          Load more references
        </button>
      ) : null}
    </section>
  );
}

export default function StyleForgeStudio() {
  const [references, setReferences] = useState<ReferencesResponse | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [presetId, setPresetId] = useState(CONSTRAINT_PRESETS[0]?.id ?? "editorial-balance");
  const [constraints, setConstraints] = useState<StyleForgeSelection["constraints"]>(
    CONSTRAINT_PRESETS[0]?.constraints ?? {
      density: "balanced",
      radius: "rounded",
      contrast: "balanced",
      motion: "subtle",
      tone: "editorial",
    }
  );

  const [provider, setProvider] = useState<StyleForgeProvider>("none");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  const [draft, setDraft] = useState<StyleForgeDraft | null>(null);
  const [draftMode, setDraftMode] = useState<"deterministic" | "ai">("deterministic");
  const [jobs, setJobs] = useState<StyleForgeJob[]>([]);
  const [kits, setKits] = useState<StyleForgeKit[]>([]);
  const [statusMessage, setStatusMessage] = useState("Ready.");
  const [isLoadingReferences, setIsLoadingReferences] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);
  const [revealedComponentCount, setRevealedComponentCount] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<
    | "generator"
    | "collections"
    | "collection_detail"
    | "templates"
    | "assets"
    | "comparison"
    | "settings"
  >("generator");

  // Collection views state
  const [explicitCollections, setExplicitCollections] = useState<StyleForgeCollectionGroup[]>([]);
  const [categoryCollections, setCategoryCollections] = useState<StyleForgeCollectionGroup[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<StyleForgeCollectionGroup | null>(
    null
  );
  const [comparisonA, setComparisonA] = useState<CollectionResource | null>(null);
  const [comparisonB, setComparisonB] = useState<CollectionResource | null>(null);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  useEffect(() => {
    try {
      const rawJobs = window.localStorage.getItem(JOBS_KEY);
      if (rawJobs) {
        const parsed = JSON.parse(rawJobs) as unknown[];
        const validated = parsed
          .map((item) => StyleForgeJobSchema.safeParse(item))
          .filter((result) => result.success)
          .map((result) => result.data)
          .map((job) => {
            if (job.status === "queued" || job.status === "generating") {
              return {
                ...job,
                status: "error" as const,
                error: "Interrupted session. Please retry finalize.",
                updatedAt: new Date().toISOString(),
              };
            }
            return job;
          });
        setJobs(validated);
      }

      const rawKits = window.localStorage.getItem(KITS_KEY);
      if (rawKits) {
        const parsed = JSON.parse(rawKits) as unknown[];
        const validated = parsed
          .map((item) => StyleForgeKitSchema.safeParse(item))
          .filter((result) => result.success)
          .map((result) => result.data);
        setKits(validated);
      }
    } catch {
      window.localStorage.removeItem(JOBS_KEY);
      window.localStorage.removeItem(KITS_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (raw === "true") {
        setIsSidebarCollapsed(true);
      }
    } catch {
      // No-op: keep default expanded layout.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    window.localStorage.setItem(KITS_KEY, JSON.stringify(kits));
  }, [kits]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (
      currentView !== "collections" &&
      currentView !== "collection_detail" &&
      currentView !== "assets"
    )
      return;
    if (explicitCollections.length > 0) return; // already loaded

    async function loadCollections() {
      setIsLoadingCollections(true);
      try {
        const resp = await fetch("/api/styleforge/collections");
        if (!resp.ok) throw new Error("Failed to load collections");
        const data = (await resp.json()) as {
          explicit: StyleForgeCollectionGroup[];
          byCategory: StyleForgeCollectionGroup[];
        };
        setExplicitCollections(data.explicit);
        setCategoryCollections(data.byCategory);
      } catch (error) {
        setStatusMessage(
          `Collections loading failed: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        setIsLoadingCollections(false);
      }
    }
    loadCollections();
  }, [currentView]);

  useEffect(() => {
    async function loadReferences() {
      setIsLoadingReferences(true);
      try {
        const response = await fetch("/api/styleforge/references");
        const body = (await response.json()) as ReferencesResponse;

        if (!response.ok) {
          throw new Error("Failed to load reference catalog.");
        }

        setReferences(body);
      } catch (error) {
        setStatusMessage(
          `Reference loading failed: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        setIsLoadingReferences(false);
      }
    }

    void loadReferences();
  }, []);

  useEffect(() => {
    if (!draft) {
      setRevealedComponentCount(0);
      return;
    }

    setRevealedComponentCount(0);

    const interval = window.setInterval(() => {
      setRevealedComponentCount((current) => {
        if (current >= draft.suggestedComponents.length) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 180);

    return () => window.clearInterval(interval);
  }, [draft]);

  const pageReferences = references?.pages ?? [];
  const componentReferences = references?.components ?? [];

  const presetOptions = useMemo<OrbitOption[]>(
    () =>
      CONSTRAINT_PRESETS.map((preset) => ({
        id: preset.id,
        label: preset.label,
        meta: preset.constraints.tone,
      })),
    []
  );
  const providerModelOptions = useMemo(() => modelOptionsForProvider(provider), [provider]);

  const latestKit = kits[0] ?? null;
  const commandKitId = latestKit?.id ?? "<kit-id>";
  const stepDefinitions = [
    {
      id: "pages",
      label: "Page Refs",
      description: "Pick one or more page references.",
    },
    {
      id: "components",
      label: "Component Refs",
      description: "Pick components and interaction references.",
    },
    {
      id: "constraints",
      label: "Constraints",
      description: "Lock density, radius, contrast, motion, and tone.",
    },
    {
      id: "draft",
      label: "Draft",
      description: "Generate and review your visual direction.",
    },
    {
      id: "finalize",
      label: "Finalize",
      description: "Create final kit and download artifacts.",
    },
  ] as const;

  const stepCompletion = [
    selectedPages.length > 0,
    selectedComponents.length > 0,
    Boolean(presetId),
    Boolean(draft),
    kits.length > 0,
  ];
  const selectedCounts = [
    selectedPages.length,
    selectedComponents.length,
    1,
    draft ? 1 : 0,
    kits.length,
  ];

  const firstPendingStep = stepCompletion.findIndex((isComplete) => !isComplete);
  const activeStepIndex = firstPendingStep === -1 ? stepDefinitions.length - 1 : firstPendingStep;
  const activeStep = stepDefinitions[activeStepIndex] ?? stepDefinitions[0];

  function toggleSelection(
    nextId: string,
    maxSelect: number,
    setState: (value: string[] | ((prev: string[]) => string[])) => void
  ) {
    setState((prev) => {
      if (prev.includes(nextId)) {
        return prev.filter((id) => id !== nextId);
      }
      if (prev.length >= maxSelect) {
        return [...prev.slice(1), nextId];
      }
      return [...prev, nextId];
    });
  }

  function selectPreset(nextPresetId: string) {
    const preset = CONSTRAINT_PRESETS.find((item) => item.id === nextPresetId);
    if (!preset) return;

    setPresetId(nextPresetId);
    setConstraints(preset.constraints);
  }

  function buildSelectionPayload(): StyleForgeSelection {
    return {
      pageReferenceSlugs: selectedPages.slice(0, PAGE_SELECTION_LIMIT),
      componentReferenceSlugs: selectedComponents.slice(0, COMPONENT_SELECTION_LIMIT),
      constraints,
      customNotes: customNotes.trim(),
    };
  }

  async function handleGenerateDraft() {
    if (selectedPages.length === 0 || selectedComponents.length === 0) {
      setStatusMessage("Select at least one page and one component reference.");
      return;
    }

    setIsDrafting(true);
    setStatusMessage("Generating draft...");

    try {
      const response = await fetch("/api/styleforge/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selection: buildSelectionPayload(),
          llm: {
            provider,
            model,
            apiKey: apiKey || undefined,
          },
        }),
      });

      const body = (await response.json()) as DraftResponse | { error?: string };

      if (!response.ok || !(body as DraftResponse).ok) {
        throw new Error((body as { error?: string }).error ?? "Draft generation failed.");
      }

      const typed = body as DraftResponse;
      setDraft(typed.draft);
      setDraftMode(typed.mode);
      setStatusMessage(
        typed.mode === "ai"
          ? "Draft generated with AI provider."
          : "Draft generated with deterministic fallback."
      );
    } catch (error) {
      setStatusMessage(
        `Draft generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsDrafting(false);
    }
  }

  async function runFinalizeJob(jobId: string, draftSnapshot: StyleForgeDraft) {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? { ...job, status: "generating", updatedAt: new Date().toISOString(), error: null }
          : job
      )
    );

    try {
      const response = await fetch("/api/styleforge/finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selection: buildSelectionPayload(),
          draft: draftSnapshot,
        }),
      });

      const body = (await response.json()) as FinalizeResponse | { error?: string };

      if (!response.ok || !(body as FinalizeResponse).ok) {
        throw new Error((body as { error?: string }).error ?? "Finalize failed.");
      }

      const typed = body as FinalizeResponse;

      setKits((current) => [typed.kit, ...current]);
      setJobs((current) =>
        current.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "ready",
                kitId: typed.kit.id,
                updatedAt: new Date().toISOString(),
              }
            : job
        )
      );

      setStatusMessage(`Kit ready: ${typed.kit.id}`);

      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("StyleForge kit ready", {
            body: `Your kit ${typed.kit.id} is ready for download.`,
          });
        } else if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            new Notification("StyleForge kit ready", {
              body: `Your kit ${typed.kit.id} is ready for download.`,
            });
          }
        }
      }
    } catch (error) {
      setJobs((current) =>
        current.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "error",
                error: error instanceof Error ? error.message : String(error),
                updatedAt: new Date().toISOString(),
              }
            : job
        )
      );

      setStatusMessage(
        `Finalize failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  function handleGenerateFinalKit() {
    if (!draft) {
      setStatusMessage("Generate a draft before finalizing the kit.");
      return;
    }

    const now = new Date().toISOString();
    const newJob: StyleForgeJob = {
      id: createId("sf-job"),
      selection: buildSelectionPayload(),
      status: "queued",
      draftId: draft.id,
      kitId: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };

    setJobs((current) => [newJob, ...current]);
    setStatusMessage(`Job queued: ${newJob.id}`);

    window.setTimeout(() => {
      void runFinalizeJob(newJob.id, draft);
    }, 420);
  }

  function copyCommand() {
    const command = `bunx stealthis-kit pull ${commandKitId}`;
    void navigator.clipboard.writeText(command);
    setStatusMessage("CLI command copied (coming soon).");
  }

  function downloadKit(kit: StyleForgeKit) {
    downloadZip(kit.files, `styleforge-${kit.id}.zip`);
    setStatusMessage(`Downloading ${kit.id}.zip`);
  }

  return (
    <div className={`sf-app-layout ${isSidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <aside className={`sf-admin-sidebar ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
        <div className="sf-admin-logo">
          <div className="sf-admin-logo-icon">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px", color: "#0a1215", fontVariationSettings: "'FILL' 1" }}
            >
              token
            </span>
          </div>
          <div>
            <p className="sf-admin-logo-title">StyleForge</p>
            <p className="sf-admin-logo-sub">PREMIUM SAAS</p>
          </div>
          <button
            type="button"
            className="sf-admin-toggle"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isSidebarCollapsed}
            onClick={() => setIsSidebarCollapsed((current) => !current)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {isSidebarCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        <nav className="sf-admin-nav" aria-label="StyleForge navigation">
          {/* Top-level nav items matching Collection Detail style */}
          <button
            type="button"
            className={`sf-nav-icon-item ${currentView === "settings" ? "is-active" : ""}`}
            title="Dashboard"
            onClick={() => setCurrentView("generator")}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            className={`sf-nav-icon-item ${currentView === "collections" || currentView === "collection_detail" || currentView === "comparison" ? "is-active" : ""}`}
            title="Collections"
            onClick={() => setCurrentView("collections")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              folder_open
            </span>
            <span>Collections</span>
          </button>
          <button
            type="button"
            className={`sf-nav-icon-item ${currentView === "templates" ? "is-active" : ""}`}
            title="Templates"
            onClick={() => setCurrentView("templates")}
          >
            <span className="material-symbols-outlined">layers</span>
            <span>Templates</span>
          </button>
          <button
            type="button"
            className={`sf-nav-icon-item ${currentView === "assets" ? "is-active" : ""}`}
            title="Assets"
            onClick={() => setCurrentView("assets")}
          >
            <span className="material-symbols-outlined">package_2</span>
            <span>Assets</span>
          </button>

          <div style={{ margin: "0.35rem 0", borderTop: "1px solid rgba(13,185,242,0.08)" }} />

          {/* Workflow steps */}
          {stepDefinitions.map((step, index) => {
            const isActive = index === activeStepIndex;
            const isComplete = stepCompletion[index] && !isActive;
            return (
              <button
                key={step.id}
                type="button"
                className={`sf-nav-icon-item ${isActive && currentView === "generator" ? "is-active" : ""} ${isComplete && currentView === "generator" ? "is-complete" : ""}`}
                title={step.label}
                onClick={() => setCurrentView("generator")}
              >
                <span className="material-symbols-outlined">
                  {step.id === "pages" && "web"}
                  {step.id === "components" && "smart_button"}
                  {step.id === "constraints" && "tune"}
                  {step.id === "draft" && "article"}
                  {step.id === "finalize" && "download"}
                </span>
                <span>{step.label}</span>
                {selectedCounts[index] > 0 && (
                  <span className="sf-admin-nav-meta">{selectedCounts[index]}</span>
                )}
              </button>
            );
          })}

          <div style={{ margin: "0.35rem 0", borderTop: "1px solid rgba(13,185,242,0.08)" }} />

          <button type="button" className="sf-nav-icon-item" title="Settings">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sf-admin-section">
          <p className="sf-admin-section-kicker">Generator Setup</p>
          <h2>{activeStep.label}</h2>
          <p>
            Select references from existing StealThis pages and components, generate a draft style
            direction, and export a complete HTML kit with implementation guidance.
          </p>
        </div>

        <div className="sf-provider-grid sf-provider-grid-sidebar">
          <label>
            AI provider
            <select
              value={provider}
              onChange={(event) => {
                const nextProvider = event.target.value as StyleForgeProvider;
                setProvider(nextProvider);
                const nextOptions = modelOptionsForProvider(nextProvider);
                setModel((current) =>
                  nextOptions.some((option) => option.value === current)
                    ? current
                    : defaultModelForProvider(nextProvider)
                );
              }}
            >
              <option value="none">Deterministic only</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Gemini</option>
            </select>
          </label>

          <label>
            Model
            {provider === "none" ? (
              <input value="Select an AI provider first" disabled />
            ) : (
              <select value={model} onChange={(event) => setModel(event.target.value)}>
                {providerModelOptions.map((option) => (
                  <option key={`${provider}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label>
            API key (BYOK)
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            Custom notes
            <textarea
              value={customNotes}
              onChange={(event) => setCustomNotes(event.target.value)}
              placeholder="Brand adjectives, accessibility notes, tone directions, accessibility constraints..."
              rows={5}
            />
          </label>
        </div>

        <div className="sf-admin-status">
          <p>Draft mode</p>
          <strong>{draftMode}</strong>
          <span>{activeStep.description}</span>
        </div>

        {/* Storage widget + avatar (Collection Overview style) */}
        <div style={{ marginTop: "auto" }}>
          <div className="sf-sidebar-storage">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(203,213,225,0.8)" }}>
                Storage
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--sf-primary)" }}>
                74%
              </span>
            </div>
            <div className="sf-sidebar-storage-bar">
              <div className="sf-sidebar-storage-fill" style={{ width: "74%" }} />
            </div>
          </div>

          <div className="sf-admin-user" title="StyleForge Studio" style={{ marginTop: "0.65rem" }}>
            <div className="sf-admin-user-avatar">SF</div>
            <div>
              <p className="sf-admin-user-name">StyleForge</p>
              <p className="sf-admin-user-role">Visual Generator</p>
            </div>
          </div>

          <div style={{ paddingTop: "0.65rem" }}>
            <button
              type="button"
              className="sf-cta-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => void handleGenerateDraft()}
              disabled={isDrafting || isLoadingReferences}
            >
              <span className="material-symbols-outlined">add</span>
              {isDrafting ? "Generating..." : "New Project"}
            </button>
          </div>
        </div>
      </aside>

      {currentView === "collections" &&
        (isLoadingCollections ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading collections...
          </div>
        ) : (
          <CollectionOverview
            explicit={explicitCollections}
            byCategory={categoryCollections}
            onSelectCollection={(coll) => {
              setSelectedCollection(coll);
              setCurrentView("collection_detail");
            }}
            onNewCollection={() => setCurrentView("generator")}
          />
        ))}
      {currentView === "collection_detail" && selectedCollection && (
        <CollectionDetail
          collection={selectedCollection}
          onBack={() => setCurrentView("collections")}
          onCompare={(a, b) => {
            setComparisonA(a);
            setComparisonB(b);
            setCurrentView("comparison");
          }}
          onPreview={() => {}}
        />
      )}
      {currentView === "comparison" && comparisonA && comparisonB && (
        <ComparisonScreen
          resourceA={comparisonA}
          resourceB={comparisonB}
          onBack={() => setCurrentView("collection_detail")}
        />
      )}
      {currentView === "templates" && comparisonA && comparisonB ? (
        <ComparisonScreen
          resourceA={comparisonA}
          resourceB={comparisonB}
          onBack={() => setCurrentView("collections")}
        />
      ) : (
        currentView === "templates" && (
          <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-3">
            <span className="material-symbols-outlined text-4xl">compare</span>
            <p>Select two resources from a collection to compare them.</p>
            <button
              type="button"
              className="sf-pill-btn"
              onClick={() => setCurrentView("collections")}
            >
              Browse Collections
            </button>
          </div>
        )
      )}
      {currentView === "assets" && (
        <SearchDiscovery
          onSelectResource={(resource) => {
            // Find or create a temporary collection for the resource's category
            const catColl = categoryCollections.find((c) => c.id === `cat-${resource.category}`);
            if (catColl) {
              setSelectedCollection(catColl);
              setCurrentView("collection_detail");
            }
          }}
        />
      )}

      {currentView === "generator" && (
        <div className="sf-shell">
          <section className="sf-card sf-stepper-card">
            <div className="sf-stepper-head">
              <h2>Workflow Progress</h2>
              <p>Move through each step to build your visual system.</p>
            </div>

            <div className="sf-stepper">
              <div className="sf-steps-track">
                {stepDefinitions.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  const isComplete = stepCompletion[index] && !isActive;
                  const shouldFillConnector = index < activeStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`sf-step ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}`}
                    >
                      <div
                        className="sf-step__node"
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`Step ${index + 1}: ${step.label}`}
                      >
                        <span className="sf-step__num" aria-hidden="true">
                          {index + 1}
                        </span>
                        <svg
                          className="sf-step__check"
                          aria-hidden="true"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <polyline
                            points="2.5 7 5.5 10 11.5 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      {index < stepDefinitions.length - 1 ? (
                        <div className="sf-step__connector" aria-hidden="true">
                          <span
                            className={`sf-step__fill ${shouldFillConnector ? "is-filled" : ""}`}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="sf-steps-labels" aria-hidden="true">
                {stepDefinitions.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  const isComplete = stepCompletion[index] && !isActive;
                  return (
                    <span
                      key={step.id}
                      className={`sf-step-label ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}`}
                    >
                      {step.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="sf-reference-stage">
            <ReferencePicker
              title="1) Page references"
              subtitle="Choose one or more from web-pages and pages"
              references={pageReferences}
              selected={selectedPages}
              maxSelect={PAGE_SELECTION_LIMIT}
              isLoading={isLoadingReferences}
              onToggle={(id) => toggleSelection(id, PAGE_SELECTION_LIMIT, setSelectedPages)}
            />

            <ReferencePicker
              title="2) Component references"
              subtitle="Choose one or more from ui-components and patterns"
              references={componentReferences}
              selected={selectedComponents}
              maxSelect={COMPONENT_SELECTION_LIMIT}
              isLoading={isLoadingReferences}
              onToggle={(id) =>
                toggleSelection(id, COMPONENT_SELECTION_LIMIT, setSelectedComponents)
              }
            />
          </section>

          <section className="sf-stage-grid">
            <OrbitSelector
              title="3) Constraint wheel"
              subtitle="Pick one preset (density, radius, contrast, motion, tone)"
              options={presetOptions}
              selected={[presetId]}
              maxSelect={1}
              onToggle={selectPreset}
            />
          </section>

          <section className="sf-card sf-actions">
            <div>
              <h2>4) Generate and review</h2>
              <p>{statusMessage}</p>
            </div>

            <div className="sf-action-buttons">
              <button
                type="button"
                onClick={() => void handleGenerateDraft()}
                disabled={isDrafting || isLoadingReferences}
              >
                {isDrafting ? "Generating draft..." : "Generate Draft"}
              </button>
              <button
                type="button"
                className="sf-btn-secondary"
                onClick={handleGenerateFinalKit}
                disabled={!draft}
                style={draft ? {} : { opacity: 0.4 }}
              >
                Generate Final Kit
              </button>
            </div>
          </section>

          {draft ? (
            <section className="sf-card sf-preview">
              <div className="sf-preview-head">
                <div>
                  <h2>5) Visual direction preview</h2>
                  <p>Editable draft before final kit generation.</p>
                </div>
                <span
                  className={`sf-draft-mode-badge ${draftMode === "ai" ? "is-ai" : "is-deterministic"}`}
                >
                  {draftMode === "ai" ? "✦ AI Draft" : "⚡ Deterministic"}
                </span>
              </div>

              <label className="sf-inline-field">
                Draft title
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, title: event.target.value } : current
                    )
                  }
                />
              </label>

              <label className="sf-inline-field">
                Summary
                <textarea
                  value={draft.summary}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, summary: event.target.value } : current
                    )
                  }
                  rows={3}
                />
              </label>

              <div className="sf-token-grid">
                {Object.entries(draft.tokens).map(([key, value]) => (
                  <div key={key} className="sf-token-item">
                    <span>{key}</span>
                    {key.includes("font") || key.includes("radius") || key.includes("shadow") ? (
                      <strong>{value}</strong>
                    ) : (
                      <>
                        <i style={{ background: value }} />
                        <strong>{value}</strong>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="sf-columns">
                <article>
                  <h3>Visual direction</h3>
                  <ul>
                    {draft.visualDirection.map((line, index) => (
                      <li key={`${line}-${index}`}>
                        <input
                          value={line}
                          onChange={(event) =>
                            setDraft((current) => {
                              if (!current) return current;
                              const nextDirection = [...current.visualDirection];
                              nextDirection[index] = event.target.value;
                              return {
                                ...current,
                                visualDirection: nextDirection,
                              };
                            })
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </article>

                <article>
                  <h3>Suggested components</h3>
                  <p className="sf-suggested-progress">
                    Generated {Math.min(revealedComponentCount, draft.suggestedComponents.length)}/
                    {draft.suggestedComponents.length}
                  </p>
                  <ul>
                    {draft.suggestedComponents.map((component, index) => (
                      <li
                        key={component.id}
                        className={index < revealedComponentCount ? "" : "is-pending"}
                      >
                        {index < revealedComponentCount ? (
                          <>
                            <strong>{component.name}</strong>
                            <p>{component.rationale}</p>
                          </>
                        ) : (
                          <>
                            <strong>Generating component...</strong>
                            <p>Preparing structure, style, and interactions.</p>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              {draft.warnings.length > 0 ? (
                <div className="sf-warnings">
                  {draft.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="sf-card sf-jobs">
            <div className="sf-jobs-head">
              <h2>Jobs and kits</h2>
              <p>{statusMessage}</p>
            </div>

            <div className="sf-cli-box">
              <p className="sf-cli-label">CLI (coming soon)</p>
              <code>bunx stealthis-kit pull {commandKitId}</code>
              <button type="button" onClick={copyCommand}>
                Copy command
              </button>
            </div>

            <div className="sf-columns">
              <article>
                <h3>Job queue</h3>
                {jobs.length === 0 ? <p className="sf-muted">No jobs yet.</p> : null}
                <ul className="sf-job-list">
                  {jobs.map((job) => (
                    <li key={job.id} className={`sf-job-item is-${job.status}`}>
                      <strong>{job.id}</strong>
                      <p>Status: {job.status}</p>
                      {job.kitId ? <p>Kit: {job.kitId}</p> : null}
                      {job.error ? <p>Error: {job.error}</p> : null}
                    </li>
                  ))}
                </ul>
              </article>

              <article>
                <h3>Generated kits</h3>
                {kits.length === 0 ? <p className="sf-muted">No kits available yet.</p> : null}
                <ul className="sf-kit-list">
                  {kits.map((kit) => (
                    <li key={kit.id}>
                      <div>
                        <strong>{kit.id}</strong>
                        <p>
                          {kit.files.length} files • draft {kit.manifest.draftId}
                        </p>
                      </div>
                      <button type="button" onClick={() => downloadKit(kit)}>
                        Download ZIP
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
