import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  type EdgeMouseHandler,
  Handle,
  MarkerType,
  MiniMap,
  type Node,
  type NodeMouseHandler,
  type OnConnect,
  Panel,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  downloadZipFallback,
  pickProjectDirectory,
  supportsFileSystemAccess,
  writeFilesToDirectory,
} from "../lib/builder/client-storage";
import type {
  BuilderBaas,
  BuilderExecutionPlanV1,
  BuilderGeneratedFile,
  BuilderNodeKind,
  BuilderOverwriteStrategy,
  BuilderProjectV1,
  BuilderProvider,
  BuilderStack,
} from "../lib/builder/contracts";
import { createImplementationMarkdown, createMcpMarkdown } from "../lib/builder/exporters";
import { createId } from "../lib/builder/ids";
import { createDeterministicPlan } from "../lib/builder/planner";
import {
  createBuilderProjectFromFlow,
  parseImportedProject,
  toFlowGraph,
} from "../lib/builder/project";

interface ProjectUpdateDetail {
  title?: string;
  description?: string;
}

interface NodeData {
  label: string;
  kind: BuilderNodeKind;
  [key: string]: unknown;
}

interface PlanResponse {
  ok: boolean;
  mode: "deterministic" | "ai";
  plan: BuilderExecutionPlanV1;
}

interface ScaffoldResponse {
  ok: boolean;
  plan: BuilderExecutionPlanV1;
  scaffold: {
    files: BuilderGeneratedFile[];
    warnings: string[];
  };
}

interface RegenerateResponse {
  ok: boolean;
  targetNodeId: string;
  changedPaths: string[];
  scaffold: {
    files: BuilderGeneratedFile[];
    warnings: string[];
  };
}

const DRAG_NODE_MIME = "application/x-stealthis-node";
const MIN_GRAPH_HEIGHT_PX = 360;
const LOW_GRAPH_HEIGHT_WARNING_PX = 420;
const PROJECT_SESSION_KEY = "stealthis:builder:v1:session";

const KIND_COLORS: Record<BuilderNodeKind, { bg: string; border: string; text: string }> = {
  stack: { bg: "#1e3a5f", border: "#38bdf8", text: "#bae6fd" },
  tool: { bg: "#1a2f1a", border: "#4ade80", text: "#bbf7d0" },
  mcp: { bg: "#2d1f4a", border: "#a78bfa", text: "#ede9fe" },
  skill: { bg: "#3a2a12", border: "#fb923c", text: "#fed7aa" },
  infra: { bg: "#1e293b", border: "#94a3b8", text: "#cbd5e1" },
  auth: { bg: "#3b1a1a", border: "#f87171", text: "#fecaca" },
  db: { bg: "#1a2535", border: "#60a5fa", text: "#bfdbfe" },
  deploy: { bg: "#1c2a1a", border: "#34d399", text: "#a7f3d0" },
};

const PALETTE_ITEMS: { kind: BuilderNodeKind; label: string; example: string }[] = [
  { kind: "stack", label: "Stack", example: "Astro / Next.js" },
  { kind: "tool", label: "Tool", example: "Tailwind CSS" },
  { kind: "mcp", label: "MCP", example: "StealThis MCP" },
  { kind: "skill", label: "Skill", example: "Authentication" },
  { kind: "infra", label: "Infra", example: "Cloudflare" },
  { kind: "auth", label: "Auth", example: "GitHub OAuth" },
  { kind: "db", label: "DB", example: "Supabase" },
  { kind: "deploy", label: "Deploy", example: "Pages / Workers" },
];

const INITIAL_NODES: Node<NodeData>[] = [
  {
    id: "1",
    type: "styled",
    position: { x: 200, y: 150 },
    data: { label: "Astro 5", kind: "stack" },
  },
  {
    id: "2",
    type: "styled",
    position: { x: 450, y: 80 },
    data: { label: "Tailwind CSS", kind: "tool" },
  },
  {
    id: "3",
    type: "styled",
    position: { x: 450, y: 220 },
    data: { label: "Supabase", kind: "db" },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
];

function hasExactConnection(connection: Connection, edges: Edge[]) {
  return edges.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      (edge.sourceHandle ?? null) === (connection.sourceHandle ?? null) &&
      (edge.targetHandle ?? null) === (connection.targetHandle ?? null)
  );
}

function StyledNode({ data }: { data: NodeData }) {
  const colors = KIND_COLORS[data.kind] ?? KIND_COLORS.stack;

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "0.625rem",
        padding: "0.5rem 0.875rem",
        color: colors.text,
        fontSize: "0.8125rem",
        fontWeight: 500,
        minWidth: "90px",
        textAlign: "center",
      }}
    >
      <Handle
        id="top"
        style={handleStyle(colors.border)}
        type="source"
        position={Position.Top}
        isConnectableStart
        isConnectableEnd
      />
      <Handle
        id="left"
        style={handleStyle(colors.border)}
        type="source"
        position={Position.Left}
        isConnectableStart
        isConnectableEnd
      />
      <Handle
        id="right"
        style={handleStyle(colors.border)}
        type="source"
        position={Position.Right}
        isConnectableStart
        isConnectableEnd
      />
      <Handle
        id="bottom"
        style={handleStyle(colors.border)}
        type="source"
        position={Position.Bottom}
        isConnectableStart
        isConnectableEnd
      />
      <div
        style={{
          fontSize: "0.65rem",
          opacity: 0.65,
          marginBottom: "0.125rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {data.kind}
      </div>
      {data.label}
    </div>
  );
}

const nodeTypes = { styled: StyledNode };

function downloadTextFile(content: string, fileName: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "project"
  );
}

function defaultModelForProvider(provider: BuilderProvider): string {
  if (provider === "openai") return "gpt-4o-mini";
  if (provider === "anthropic") return "claude-3-5-sonnet-latest";
  if (provider === "google") return "gemini-1.5-flash";
  return "gpt-4o-mini";
}

async function postJson<TResponse>(url: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed with status ${response.status}`);
  }

  return body as TResponse;
}

export default function ProjectGraph({
  title = "My Project",
  description = "",
}: {
  title?: string;
  description?: string;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES);
  const [projectId, setProjectId] = useState(() => createId("project"));
  const [projectMeta, setProjectMeta] = useState({ title, description });
  const [stack, setStack] = useState<BuilderStack>("astro-tailwind");
  const [baas, setBaas] = useState<BuilderBaas>("supabase");
  const [provider, setProvider] = useState<BuilderProvider>("none");
  const [model, setModel] = useState(defaultModelForProvider("openai"));
  const [apiKey, setApiKey] = useState("");
  const [overwrite, setOverwrite] = useState<BuilderOverwriteStrategy>("ask");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [showGraphHelp, setShowGraphHelp] = useState(false);
  const [graphViewportHeight, setGraphViewportHeight] = useState(0);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node<NodeData>, Edge> | null>(
    null
  );
  const [executionPlan, setExecutionPlan] = useState<BuilderExecutionPlanV1 | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<BuilderGeneratedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState("Ready.");
  const [busyAction, setBusyAction] = useState<null | "plan" | "build" | "regen" | "write">(null);
  const [planningMode, setPlanningMode] = useState<"deterministic" | "ai">("deterministic");
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );

  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const selectedNodes = nodes.filter((node) => node.selected);
  const selectedEdges = edges.filter((edge) => edge.selected);
  const selectedNode =
    selectedNodes.find((node) => node.id === selectedNodeId) ??
    (selectedNodeId ? (nodes.find((node) => node.id === selectedNodeId) ?? null) : null) ??
    selectedNodes[0] ??
    null;
  const selectedEdge =
    selectedEdges.find((edge) => edge.id === selectedEdgeId) ??
    (selectedEdgeId ? (edges.find((edge) => edge.id === selectedEdgeId) ?? null) : null) ??
    selectedEdges[0] ??
    null;

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
  const isGraphHeightTight =
    graphViewportHeight > 0 && graphViewportHeight < LOW_GRAPH_HEIGHT_WARNING_PX;

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;
      return !hasExactConnection(connection, edges);
    },
    [edges]
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (!params.source || !params.target) return;
      if (params.source === params.target) return;
      if (hasExactConnection(params, edges)) return;

      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.35)" },
          },
          currentEdges
        )
      );
    },
    [edges, setEdges]
  );

  const addNode = useCallback(
    (kind: BuilderNodeKind, label: string, position?: { x: number; y: number }) => {
      const id = createId("node");

      setNodes((currentNodes) => [
        ...currentNodes.map((node) => (node.selected ? { ...node, selected: false } : node)),
        {
          id,
          type: "styled",
          position: position ?? { x: 140 + Math.random() * 320, y: 120 + Math.random() * 260 },
          data: { label, kind },
          selected: true,
        },
      ]);
      setEdges((currentEdges) =>
        currentEdges.map((edge) => (edge.selected ? { ...edge, selected: false } : edge))
      );
      setSelectedNodeId(id);
      setSelectedEdgeId(null);
    },
    [setEdges, setNodes]
  );

  const applyProjectToCanvas = useCallback(
    (project: BuilderProjectV1) => {
      const flow = toFlowGraph(project);

      setProjectId(project.id);
      setProjectMeta({
        title: project.title,
        description: project.description,
      });
      setStack(project.stack);
      setBaas(project.baas);
      setProvider(project.settings.provider);
      setModel(project.settings.model || defaultModelForProvider(project.settings.provider));
      setOverwrite(project.settings.overwrite);

      setNodes(
        flow.nodes.map((node) => ({
          id: node.id,
          type: "styled",
          position: node.position,
          data: {
            label: node.label,
            kind: node.kind,
          },
        }))
      );

      setEdges(
        flow.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? null,
          targetHandle: edge.targetHandle ?? null,
          animated: edge.animated,
        }))
      );

      setExecutionPlan(null);
      setGeneratedFiles([]);
    },
    [setEdges, setNodes]
  );

  useEffect(() => {
    setProjectMeta({ title, description });
  }, [title, description]);

  useEffect(() => {
    const handleProjectUpdate = (event: Event) => {
      const detail = (event as CustomEvent<ProjectUpdateDetail>).detail ?? {};
      setProjectMeta({
        title: detail.title?.trim() || "My Project",
        description: detail.description?.trim() ?? "",
      });
    };

    window.addEventListener("stealthis:project-update", handleProjectUpdate as EventListener);
    return () => {
      window.removeEventListener("stealthis:project-update", handleProjectUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(PROJECT_SESSION_KEY);
    if (!rawSession) return;

    try {
      const parsed = JSON.parse(rawSession) as unknown;
      const imported = parseImportedProject(parsed, {
        stack: "astro-tailwind",
        baas: "none",
      });
      applyProjectToCanvas(imported.project);
      setStatusMessage("Recovered previous builder session.");
    } catch {
      window.localStorage.removeItem(PROJECT_SESSION_KEY);
    }
  }, [applyProjectToCanvas]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1180px)");
    const syncLayout = () => setIsCompactLayout(mediaQuery.matches);

    syncLayout();
    mediaQuery.addEventListener("change", syncLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncLayout);
    };
  }, []);

  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setGraphViewportHeight(Math.round(container.getBoundingClientRect().height));
    };

    updateHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateHeight());
      resizeObserver.observe(container);
    }

    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  useEffect(() => {
    if (selectedNodeId && !nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    if (selectedEdgeId && !edges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(null);
    }
  }, [edges, selectedEdgeId]);

  const onNodeClick: NodeMouseHandler<Node<NodeData>> = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick: EdgeMouseHandler<Edge> = useCallback((_event, edge) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(edge.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: nextNodes, edges: nextEdges }: { nodes: Node<NodeData>[]; edges: Edge[] }) => {
      setSelectedNodeId((current) => {
        if (current && nextNodes.some((node) => node.id === current)) return current;
        return nextNodes[0]?.id ?? null;
      });

      setSelectedEdgeId((current) => {
        if (current && nextEdges.some((edge) => edge.id === current)) return current;
        return nextEdges[0]?.id ?? null;
      });
    },
    []
  );

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, kind: BuilderNodeKind, label: string) => {
      event.dataTransfer.setData(DRAG_NODE_MIME, JSON.stringify({ kind, label }));
      event.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!flowInstance) return;

      const rawPayload = event.dataTransfer.getData(DRAG_NODE_MIME);
      if (!rawPayload) return;

      let payload: { kind: BuilderNodeKind; label: string } | null = null;
      try {
        payload = JSON.parse(rawPayload) as { kind: BuilderNodeKind; label: string };
      } catch {
        payload = null;
      }

      if (!payload?.kind || !payload.label) return;

      const position = flowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(payload.kind, payload.label, position);
    },
    [addNode, flowInstance]
  );

  function updateSelectedNodeLabel(nextLabel: string) {
    if (!selectedNode) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNode.id ? { ...node, data: { ...node.data, label: nextLabel } } : node
      )
    );
  }

  const clearSelection = useCallback(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => (node.selected ? { ...node, selected: false } : node))
    );
    setEdges((currentEdges) =>
      currentEdges.map((edge) => (edge.selected ? { ...edge, selected: false } : edge))
    );
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setEdges, setNodes]);

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNode) return;

    const duplicatedNodeId = createId("node");
    const duplicatedNode: Node<NodeData> = {
      id: duplicatedNodeId,
      type: selectedNode.type ?? "styled",
      position: {
        x: selectedNode.position.x + 40,
        y: selectedNode.position.y + 40,
      },
      data: { ...selectedNode.data },
      selected: true,
    };

    setNodes((currentNodes) => [
      ...currentNodes.map((node) => (node.selected ? { ...node, selected: false } : node)),
      duplicatedNode,
    ]);
    setEdges((currentEdges) =>
      currentEdges.map((edge) => (edge.selected ? { ...edge, selected: false } : edge))
    );
    setSelectedNodeId(duplicatedNodeId);
    setSelectedEdgeId(null);
  }, [selectedNode, setEdges, setNodes]);

  const removeSelectedEdges = useCallback(() => {
    const edgeIdsToDelete = new Set(selectedEdges.map((edge) => edge.id));
    if (!edgeIdsToDelete.size && selectedEdge) {
      edgeIdsToDelete.add(selectedEdge.id);
    }
    if (!edgeIdsToDelete.size) return;

    setEdges((currentEdges) => currentEdges.filter((edge) => !edgeIdsToDelete.has(edge.id)));
    setSelectedEdgeId(null);
  }, [selectedEdge, selectedEdges, setEdges]);

  const deleteSelection = useCallback(() => {
    const nodeIdsToDelete = new Set(selectedNodes.map((node) => node.id));
    const edgeIdsToDelete = new Set(selectedEdges.map((edge) => edge.id));

    if (!nodeIdsToDelete.size && selectedNode) {
      nodeIdsToDelete.add(selectedNode.id);
    }
    if (!edgeIdsToDelete.size && selectedEdge) {
      edgeIdsToDelete.add(selectedEdge.id);
    }
    if (!nodeIdsToDelete.size && !edgeIdsToDelete.size) return;

    if (nodeIdsToDelete.size) {
      setNodes((currentNodes) => currentNodes.filter((node) => !nodeIdsToDelete.has(node.id)));
    }

    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) =>
          !edgeIdsToDelete.has(edge.id) &&
          !nodeIdsToDelete.has(edge.source) &&
          !nodeIdsToDelete.has(edge.target)
      )
    );

    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [selectedEdge, selectedEdges, selectedNode, selectedNodes, setEdges, setNodes]);

  const resetView = useCallback(() => {
    if (!flowInstance) return;
    void flowInstance.fitView({ padding: 0.2, duration: 250 });
  }, [flowInstance]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      const lowerKey = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && lowerKey === "d") {
        event.preventDefault();
        duplicateSelectedNode();
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        deleteSelection();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [clearSelection, deleteSelection, duplicateSelectedNode]);

  function buildProjectPayload(): BuilderProjectV1 {
    return createBuilderProjectFromFlow({
      id: projectId,
      title: projectMeta.title || "My Project",
      description: projectMeta.description,
      stack,
      baas,
      settings: {
        provider,
        model,
        useAI: provider !== "none",
        overwrite,
      },
      nodes: nodes.map((node) => ({
        id: node.id,
        kind: node.data.kind,
        label: node.data.label,
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        animated: edge.animated,
      })),
    });
  }

  useEffect(() => {
    const snapshot = createBuilderProjectFromFlow({
      id: projectId,
      title: projectMeta.title || "My Project",
      description: projectMeta.description,
      stack,
      baas,
      settings: {
        provider,
        model,
        useAI: provider !== "none",
        overwrite,
      },
      nodes: nodes.map((node) => ({
        id: node.id,
        kind: node.data.kind,
        label: node.data.label,
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        animated: edge.animated,
      })),
    });

    window.localStorage.setItem(PROJECT_SESSION_KEY, JSON.stringify(snapshot));
  }, [nodes, edges, projectId, projectMeta, stack, baas, provider, model, overwrite]);

  function exportLegacyProjectJson(): void {
    const data = {
      title: projectMeta.title,
      description: projectMeta.description,
      exportedAt: new Date().toISOString(),
      graph: {
        nodes: nodes.map((node) => ({
          id: node.id,
          kind: node.data.kind,
          label: node.data.label,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? null,
          targetHandle: edge.targetHandle ?? null,
        })),
      },
    };

    downloadTextFile(JSON.stringify(data, null, 2), "project.json", "application/json");
    setStatusMessage("Legacy project.json exported.");
  }

  function exportBuilderProject(): void {
    const project = buildProjectPayload();
    downloadTextFile(
      JSON.stringify(project, null, 2),
      `${buildSlug(project.title)}.builder.v1.json`,
      "application/json"
    );
    setStatusMessage("BuilderProjectV1 exported.");
  }

  async function importProjectFile(file: File): Promise<void> {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    const imported = parseImportedProject(parsed, { stack, baas });
    applyProjectToCanvas(imported.project);
    setStatusMessage(
      imported.source === "legacy"
        ? "Legacy project imported and migrated to V1."
        : "Builder project imported."
    );
  }

  async function handleImportChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importProjectFile(file);
    } catch (error) {
      setStatusMessage(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      event.target.value = "";
    }
  }

  async function runPlan(): Promise<void> {
    setBusyAction("plan");

    try {
      const project = buildProjectPayload();
      const response = await postJson<PlanResponse>("/api/builder/plan", {
        project,
        llm: {
          provider,
          model,
          apiKey: apiKey || undefined,
        },
      });

      setExecutionPlan(response.plan);
      setPlanningMode(response.mode);
      setStatusMessage(
        response.mode === "ai"
          ? "Execution plan generated via AI provider."
          : "Execution plan generated with deterministic fallback."
      );
    } catch (error) {
      setStatusMessage(
        `Planning failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function runScaffold(): Promise<void> {
    setBusyAction("build");

    try {
      const project = buildProjectPayload();
      const response = await postJson<ScaffoldResponse>("/api/builder/scaffold", {
        project,
        plan: executionPlan,
        llm: {
          provider,
          model,
          apiKey: apiKey || undefined,
        },
      });

      setExecutionPlan(response.plan);
      setGeneratedFiles(response.scaffold.files);
      setStatusMessage(`Scaffold generated: ${response.scaffold.files.length} files ready.`);
    } catch (error) {
      setStatusMessage(
        `Scaffold generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function runRegenerateNode(): Promise<void> {
    if (!selectedNode) {
      setStatusMessage("Select a node to regenerate partial scaffold.");
      return;
    }

    setBusyAction("regen");

    try {
      const project = buildProjectPayload();
      const response = await postJson<RegenerateResponse>("/api/builder/regenerate-node", {
        project,
        plan: executionPlan,
        targetNodeId: selectedNode.id,
        llm: {
          provider,
          model,
          apiKey: apiKey || undefined,
        },
      });

      const mergedByPath = new Map(generatedFiles.map((file) => [file.path, file]));
      for (const file of response.scaffold.files) {
        mergedByPath.set(file.path, file);
      }

      setGeneratedFiles(Array.from(mergedByPath.values()));
      setStatusMessage(
        `Node ${selectedNode.data.label} regenerated. Changed: ${response.changedPaths.join(", ") || "none"}.`
      );
    } catch (error) {
      setStatusMessage(
        `Node regeneration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function selectDirectory(): Promise<void> {
    try {
      const handle = await pickProjectDirectory();
      setSelectedDirectory(handle);
      setStatusMessage(`Directory selected: ${handle.name}`);
    } catch (error) {
      setStatusMessage(
        `Directory selection failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async function writeGeneratedFiles(): Promise<void> {
    if (!generatedFiles.length) {
      setStatusMessage("Generate scaffold files before writing to local directory.");
      return;
    }

    if (!supportsFileSystemAccess()) {
      downloadZipFallback(generatedFiles, `${buildSlug(projectMeta.title)}.zip`);
      setStatusMessage("Browser does not support File System Access API. Downloaded ZIP fallback.");
      return;
    }

    setBusyAction("write");

    try {
      const directory = selectedDirectory ?? (await pickProjectDirectory());
      setSelectedDirectory(directory);

      const summary = await writeFilesToDirectory({
        directory,
        files: generatedFiles,
        overwrite,
      });

      setStatusMessage(
        `Write complete: ${summary.written.length} written, ${summary.replaced.length} replaced, ${summary.skipped.length} skipped.`
      );
    } catch (error) {
      setStatusMessage(`Write failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyAction(null);
    }
  }

  function downloadZip(): void {
    if (!generatedFiles.length) {
      setStatusMessage("Generate scaffold files before downloading ZIP.");
      return;
    }

    downloadZipFallback(generatedFiles, `${buildSlug(projectMeta.title)}.zip`);
    setStatusMessage("ZIP fallback exported.");
  }

  function exportImplementationMarkdown(): void {
    const project = buildProjectPayload();
    const plan = executionPlan ?? createDeterministicPlan(project);
    const markdown = createImplementationMarkdown(project, plan);
    downloadTextFile(markdown, "IMPLEMENTATION.md", "text/markdown");
    setStatusMessage("IMPLEMENTATION.md exported.");
  }

  function exportMcpMarkdown(): void {
    const project = buildProjectPayload();
    const markdown = createMcpMarkdown(project);
    downloadTextFile(markdown, "MCP.md", "text/markdown");
    setStatusMessage("MCP.md exported.");
  }

  const layoutContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isCompactLayout ? "column" : "row",
    height: isCompactLayout ? "auto" : "calc(100vh - 260px)",
    minHeight: isCompactLayout ? "unset" : "560px",
    gap: "1rem",
  };

  const sidebarBaseStyle: React.CSSProperties = {
    flexShrink: 0,
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "1rem",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const paletteSidebarStyle: React.CSSProperties = {
    ...sidebarBaseStyle,
    width: isCompactLayout ? "100%" : "180px",
    maxHeight: isCompactLayout ? "unset" : "100%",
    overflowY: "auto",
  };

  const paletteGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isCompactLayout ? "repeat(2, minmax(0, 1fr))" : "1fr",
    gap: "0.5rem",
  };

  const graphContainerStyle: React.CSSProperties = {
    flex: 1,
    width: "100%",
    height: isCompactLayout ? `clamp(${MIN_GRAPH_HEIGHT_PX}px, 62vh, 560px)` : "100%",
    minHeight: isCompactLayout ? `${MIN_GRAPH_HEIGHT_PX}px` : "100%",
    position: "relative",
    borderRadius: "1rem",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const actionSidebarStyle: React.CSSProperties = {
    ...sidebarBaseStyle,
    width: isCompactLayout ? "100%" : "360px",
    overflowY: "auto",
  };

  return (
    <div style={layoutContainerStyle}>
      <aside style={paletteSidebarStyle}>
        <p style={sectionTitleStyle}>Add Node</p>
        <div style={paletteGridStyle}>
          {PALETTE_ITEMS.map((item) => {
            const colors = KIND_COLORS[item.kind];
            return (
              <button
                key={item.kind}
                type="button"
                draggable
                onDragStart={(event) => onDragStart(event, item.kind, item.example)}
                onClick={() => addNode(item.kind, item.example)}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "0.5rem",
                  padding: "0.4rem 0.625rem",
                  color: colors.text,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "opacity 0.15s ease",
                }}
                title={`Add ${item.example}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div style={hintStyle}>Click to add quickly or drag into the canvas.</div>
      </aside>

      <div
        ref={graphContainerRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={graphContainerStyle}
      >
        {isGraphHeightTight ? (
          <div style={graphSizeWarningStyle}>
            Low graph height detected ({graphViewportHeight}px). Increase viewport to improve node
            linking.
          </div>
        ) : null}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onSelectionChange={onSelectionChange}
          onInit={setFlowInstance}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={28}
          connectionDragThreshold={1}
          isValidConnection={isValidConnection}
          selectionOnDrag
          selectionKeyCode="Shift"
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255,255,255,0.05)"
          />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as NodeData;
              return KIND_COLORS[data.kind]?.border ?? "#94a3b8";
            }}
            maskColor="rgba(3,7,18,0.8)"
          />

          <Panel position="top-right">
            <div style={graphHelpWrapperStyle}>
              <button
                type="button"
                onClick={() => setShowGraphHelp((current) => !current)}
                aria-expanded={showGraphHelp}
                style={graphHelpToggleBtnStyle}
                title={showGraphHelp ? "Hide graph help" : "Show graph help"}
              >
                ?
              </button>
              {showGraphHelp ? (
                <div style={graphHelpPanelStyle}>
                  <p style={graphHelpTitleStyle}>Help</p>
                  <p style={graphHelpTextStyle}>1. Add nodes from the left panel.</p>
                  <p style={graphHelpTextStyle}>2. Connect handles to define dependencies.</p>
                  <p style={graphHelpTextStyle}>3. Use the right panel to plan and generate.</p>
                </div>
              ) : null}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      <aside style={actionSidebarStyle}>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          onChange={(event) => {
            void handleImportChange(event);
          }}
          style={{ display: "none" }}
        />

        <p style={sectionTitleStyle}>Builder</p>

        <label style={fieldLabelStyle} htmlFor="builder-stack">
          Stack
        </label>
        <select
          id="builder-stack"
          value={stack}
          onChange={(event) => setStack(event.target.value as BuilderStack)}
          style={selectStyle}
        >
          <option value="astro-tailwind">Astro + Tailwind</option>
          <option value="next-tailwind">Next + Tailwind</option>
        </select>

        <label style={fieldLabelStyle} htmlFor="builder-baas">
          Backend preset
        </label>
        <select
          id="builder-baas"
          value={baas}
          onChange={(event) => setBaas(event.target.value as BuilderBaas)}
          style={selectStyle}
        >
          <option value="none">No backend</option>
          <option value="supabase">Supabase</option>
          <option value="firebase">Firebase</option>
        </select>

        <label style={fieldLabelStyle} htmlFor="builder-provider">
          AI provider
        </label>
        <select
          id="builder-provider"
          value={provider}
          onChange={(event) => {
            const nextProvider = event.target.value as BuilderProvider;
            setProvider(nextProvider);
            if (!model.trim()) {
              setModel(defaultModelForProvider(nextProvider));
            }
          }}
          style={selectStyle}
        >
          <option value="none">Deterministic only</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Gemini</option>
        </select>

        <label style={fieldLabelStyle} htmlFor="builder-model">
          Model
        </label>
        <input
          id="builder-model"
          type="text"
          value={model}
          onChange={(event) => setModel(event.target.value)}
          style={inputStyle}
        />

        <label style={fieldLabelStyle} htmlFor="builder-api-key">
          API key (BYOK)
        </label>
        <input
          id="builder-api-key"
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Optional when deterministic"
          style={inputStyle}
        />

        <label style={fieldLabelStyle} htmlFor="builder-overwrite">
          Overwrite policy
        </label>
        <select
          id="builder-overwrite"
          value={overwrite}
          onChange={(event) => setOverwrite(event.target.value as BuilderOverwriteStrategy)}
          style={selectStyle}
        >
          <option value="ask">Ask</option>
          <option value="skip">Skip existing</option>
          <option value="replace">Replace existing</option>
        </select>

        <div style={actionsWrapperStyle}>
          <button
            type="button"
            onClick={() => void runPlan()}
            disabled={busyAction !== null}
            style={actionBtnStyle(busyAction === "plan")}
          >
            {busyAction === "plan" ? "Planning..." : "Generate Plan"}
          </button>
          <button
            type="button"
            onClick={() => void runScaffold()}
            disabled={busyAction !== null}
            style={actionBtnStyle(busyAction === "build")}
          >
            {busyAction === "build" ? "Building..." : "Build Scaffold"}
          </button>
          <button
            type="button"
            onClick={() => void runRegenerateNode()}
            disabled={busyAction !== null || !selectedNode}
            style={actionBtnStyle(busyAction === "regen" || !selectedNode)}
          >
            {busyAction === "regen" ? "Regenerating..." : "Regenerate Selected Node"}
          </button>
        </div>

        <div style={dividerStyle} />

        <p style={sectionTitleStyle}>Local output</p>
        <button type="button" onClick={() => void selectDirectory()} style={neutralBtnStyle}>
          {selectedDirectory ? `Folder: ${selectedDirectory.name}` : "Select Folder"}
        </button>
        <button
          type="button"
          onClick={() => void writeGeneratedFiles()}
          disabled={busyAction !== null || generatedFiles.length === 0}
          style={actionBtnStyle(busyAction === "write" || generatedFiles.length === 0)}
        >
          {busyAction === "write" ? "Writing..." : "Write to Local Folder"}
        </button>
        <button
          type="button"
          onClick={downloadZip}
          disabled={generatedFiles.length === 0}
          style={neutralBtnStyle}
        >
          Download ZIP Fallback
        </button>

        <div style={dividerStyle} />

        <p style={sectionTitleStyle}>Project files</p>
        <button type="button" onClick={exportBuilderProject} style={neutralBtnStyle}>
          Export BuilderProjectV1
        </button>
        <button
          type="button"
          onClick={() => {
            importInputRef.current?.click();
          }}
          style={neutralBtnStyle}
        >
          Import V1 or legacy project.json
        </button>
        <button type="button" onClick={exportLegacyProjectJson} style={neutralBtnStyle}>
          Export legacy project.json
        </button>
        <button type="button" onClick={exportImplementationMarkdown} style={neutralBtnStyle}>
          Export IMPLEMENTATION.md
        </button>
        <button type="button" onClick={exportMcpMarkdown} style={neutralBtnStyle}>
          Export MCP.md
        </button>

        <div style={dividerStyle} />

        <p style={sectionTitleStyle}>Selection</p>
        {selectedNode && selectedNodes.length <= 1 ? (
          <>
            <p style={{ ...hintStyle, color: KIND_COLORS[selectedNode.data.kind].text }}>
              {selectedNode.data.kind.toUpperCase()}
            </p>
            <input
              type="text"
              value={selectedNode.data.label}
              onChange={(event) => updateSelectedNodeLabel(event.target.value)}
              style={inputStyle}
            />
            <button type="button" onClick={deleteSelection} style={dangerBtnStyle(false)}>
              Delete node
            </button>
          </>
        ) : null}

        {selectedNodes.length > 1 ? (
          <p style={hintStyle}>{selectedNodes.length} nodes selected.</p>
        ) : null}

        {selectedEdges.length > 0 && selectedNodes.length === 0 ? (
          <>
            <p style={hintStyle}>
              {selectedEdges.length} edge{selectedEdges.length > 1 ? "s" : ""} selected.
            </p>
            <button type="button" onClick={removeSelectedEdges} style={dangerBtnStyle(false)}>
              Delete selected edge{selectedEdges.length > 1 ? "s" : ""}
            </button>
          </>
        ) : null}

        {!hasSelection && !selectedNode && !selectedEdge ? (
          <p style={hintStyle}>No selection yet. Click a node or edge to edit.</p>
        ) : null}

        <div style={dividerStyle} />

        <p style={sectionTitleStyle}>Status</p>
        <p style={statusStyle}>{statusMessage}</p>
        <p style={metaStyle}>Plan mode: {planningMode}</p>
        <p style={metaStyle}>Files staged: {generatedFiles.length}</p>
        <p style={metaStyle}>Project id: {projectId}</p>

        {executionPlan ? (
          <>
            <p style={metaStyle}>Plan files: {executionPlan.filePlan.length}</p>
            {executionPlan.warnings.length > 0 ? (
              <div style={warningBoxStyle}>
                {executionPlan.warnings.map((warning) => (
                  <p key={warning} style={warningTextStyle}>
                    - {warning}
                  </p>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        <div style={dividerStyle} />
        <p style={hintStyle}>Shortcuts: Cmd/Ctrl + D, Delete, Escape</p>
        <button
          type="button"
          onClick={duplicateSelectedNode}
          disabled={!selectedNode}
          style={neutralBtnStyle}
        >
          Duplicate node
        </button>
        <button
          type="button"
          onClick={deleteSelection}
          disabled={!hasSelection && !selectedNode && !selectedEdge}
          style={dangerBtnStyle(!hasSelection && !selectedNode && !selectedEdge)}
        >
          Delete selection
        </button>
        <button type="button" onClick={resetView} style={neutralBtnStyle}>
          Reset view
        </button>
      </aside>
    </div>
  );
}

function handleStyle(color: string): React.CSSProperties {
  return {
    width: "12px",
    height: "12px",
    background: color,
    border: "1px solid #0b1220",
  };
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "0.15rem",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "#94a3b8",
  lineHeight: 1.4,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#94a3b8",
  marginTop: "0.2rem",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.5rem",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "#e2e8f0",
  fontSize: "0.78rem",
  padding: "0.44rem 0.55rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.5rem",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b1220",
  color: "#e2e8f0",
  fontSize: "0.78rem",
  padding: "0.44rem 0.55rem",
};

const actionsWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  marginTop: "0.35rem",
};

function actionBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: "0.5rem",
    border: "1px solid rgba(56,189,248,0.5)",
    background: "rgba(30,58,95,0.75)",
    color: "#e0f2fe",
    fontSize: "0.74rem",
    fontWeight: 500,
    padding: "0.42rem 0.55rem",
    cursor: disabled ? "not-allowed" : "pointer",
    textAlign: "left",
    opacity: disabled ? 0.55 : 1,
  };
}

const neutralBtnStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.5rem",
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(30,41,59,0.65)",
  color: "#cbd5e1",
  fontSize: "0.74rem",
  fontWeight: 500,
  padding: "0.42rem 0.55rem",
  cursor: "pointer",
  textAlign: "left",
  marginBottom: "0.32rem",
};

function dangerBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: "0.5rem",
    border: "1px solid rgba(248,113,113,0.45)",
    background: "rgba(127,29,29,0.3)",
    color: "#fecaca",
    fontSize: "0.74rem",
    fontWeight: 500,
    padding: "0.42rem 0.55rem",
    cursor: disabled ? "not-allowed" : "pointer",
    textAlign: "left",
    opacity: disabled ? 0.55 : 1,
    marginBottom: "0.32rem",
  };
}

const dividerStyle: React.CSSProperties = {
  margin: "0.5rem 0 0.4rem",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const statusStyle: React.CSSProperties = {
  fontSize: "0.74rem",
  color: "#e2e8f0",
  lineHeight: 1.45,
  margin: 0,
};

const metaStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#64748b",
  lineHeight: 1.3,
  margin: "0.2rem 0 0",
};

const warningBoxStyle: React.CSSProperties = {
  marginTop: "0.35rem",
  borderRadius: "0.5rem",
  border: "1px solid rgba(251,191,36,0.4)",
  background: "rgba(120,53,15,0.5)",
  padding: "0.4rem 0.5rem",
};

const warningTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.7rem",
  color: "#fde68a",
  lineHeight: 1.4,
};

const graphHelpPanelStyle: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.9)",
  backdropFilter: "blur(4px)",
  padding: "0.55rem 0.65rem",
  width: "220px",
};

const graphHelpTitleStyle: React.CSSProperties = {
  fontSize: "0.68rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#94a3b8",
  fontWeight: 600,
  marginBottom: "0.3rem",
};

const graphHelpTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.72rem",
  color: "#cbd5e1",
  lineHeight: 1.45,
};

const graphHelpWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.5rem",
};

const graphHelpToggleBtnStyle: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "9999px",
  border: "1px solid rgba(148,163,184,0.45)",
  background: "rgba(15,23,42,0.85)",
  color: "#e2e8f0",
  fontWeight: 700,
  cursor: "pointer",
  lineHeight: 1,
};

const graphSizeWarningStyle: React.CSSProperties = {
  position: "absolute",
  top: "0.6rem",
  left: "0.6rem",
  right: "0.6rem",
  zIndex: 8,
  borderRadius: "0.625rem",
  border: "1px solid rgba(251,191,36,0.45)",
  background: "rgba(120,53,15,0.65)",
  color: "#fde68a",
  fontSize: "0.72rem",
  lineHeight: 1.35,
  padding: "0.45rem 0.55rem",
  pointerEvents: "none",
};
