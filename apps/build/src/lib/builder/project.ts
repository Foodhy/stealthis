import {
  BUILDER_PROJECT_VERSION,
  type BuilderBaas,
  BuilderEdgeSchema,
  type BuilderEdgeV1,
  type BuilderNodeKind,
  type BuilderNodeV1,
  BuilderProjectSchema,
  type BuilderProjectV1,
  type BuilderStack,
  type LegacyProjectExport,
  LegacyProjectExportSchema,
} from "./contracts";
import { createId } from "./ids";

type BuilderSettingsInput = Partial<BuilderProjectV1["settings"]>;

export interface FlowNodeSnapshot {
  id: string;
  kind: BuilderNodeKind;
  label: string;
  position: { x: number; y: number };
}

export interface FlowEdgeSnapshot {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  animated?: boolean;
}

function normalizeSettings(settings?: BuilderSettingsInput): BuilderProjectV1["settings"] {
  return {
    provider: settings?.provider ?? "none",
    model: settings?.model ?? "",
    useAI: settings?.useAI ?? false,
    overwrite: settings?.overwrite ?? "ask",
  };
}

export function createBuilderProjectFromFlow(input: {
  id?: string;
  title: string;
  description?: string;
  stack: BuilderStack;
  baas?: BuilderBaas;
  nodes: FlowNodeSnapshot[];
  edges: FlowEdgeSnapshot[];
  settings?: BuilderSettingsInput;
}): BuilderProjectV1 {
  const project: BuilderProjectV1 = {
    version: BUILDER_PROJECT_VERSION,
    id: input.id ?? createId("project"),
    title: input.title.trim() || "My Project",
    description: input.description?.trim() ?? "",
    stack: input.stack,
    baas: input.baas ?? "none",
    settings: normalizeSettings(input.settings),
    nodes: input.nodes.map((node) => ({
      id: node.id,
      kind: node.kind,
      label: node.label.trim() || node.kind,
      config: {},
      io: { inputs: [], outputs: [] },
      promptHints: [],
      status: "idle",
      position: node.position,
    })),
    edges: input.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      animated: edge.animated ?? false,
    })),
  };

  return BuilderProjectSchema.parse(project);
}

export function toFlowGraph(project: BuilderProjectV1): {
  nodes: FlowNodeSnapshot[];
  edges: FlowEdgeSnapshot[];
} {
  return {
    nodes: project.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      kind: node.kind,
      position: node.position ?? { x: 180, y: 140 },
    })),
    edges: project.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      animated: edge.animated ?? false,
    })),
  };
}

function mapLegacyNodeToV1(
  node: LegacyProjectExport["graph"]["nodes"][number],
  index: number
): BuilderNodeV1 {
  return {
    id: node.id,
    kind: node.kind,
    label: node.label,
    config: {},
    io: { inputs: [], outputs: [] },
    promptHints: [],
    status: "idle",
    position: {
      x: 180 + (index % 3) * 220,
      y: 120 + Math.floor(index / 3) * 160,
    },
  };
}

function mapLegacyEdgeToV1(
  edge: LegacyProjectExport["graph"]["edges"][number],
  index: number
): BuilderEdgeV1 {
  return BuilderEdgeSchema.parse({
    id: edge.id ?? `edge-${index + 1}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
    animated: true,
  });
}

function migrateLegacyProject(
  input: LegacyProjectExport,
  defaults: {
    stack: BuilderStack;
    baas: BuilderBaas;
  }
): BuilderProjectV1 {
  return BuilderProjectSchema.parse({
    version: BUILDER_PROJECT_VERSION,
    id: createId("project"),
    title: input.title?.trim() || "Migrated Project",
    description: input.description?.trim() || "Imported from legacy project.json",
    stack: defaults.stack,
    baas: defaults.baas,
    settings: normalizeSettings(),
    nodes: input.graph.nodes.map(mapLegacyNodeToV1),
    edges: input.graph.edges.map(mapLegacyEdgeToV1),
  });
}

export type ImportedProjectSource = "v1" | "legacy";

export function parseImportedProject(
  raw: unknown,
  defaults: { stack: BuilderStack; baas: BuilderBaas }
): { project: BuilderProjectV1; source: ImportedProjectSource } {
  const v1Result = BuilderProjectSchema.safeParse(raw);
  if (v1Result.success) {
    return {
      project: v1Result.data,
      source: "v1",
    };
  }

  const legacyResult = LegacyProjectExportSchema.safeParse(raw);
  if (!legacyResult.success) {
    throw new Error("The imported file is not a valid BuilderProjectV1 or legacy project.json.");
  }

  return {
    project: migrateLegacyProject(legacyResult.data, defaults),
    source: "legacy",
  };
}
