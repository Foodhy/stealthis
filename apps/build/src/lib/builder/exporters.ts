import type { BuilderExecutionPlanV1, BuilderNodeKind, BuilderProjectV1 } from "./contracts";

const SECTION_LABELS: Partial<Record<BuilderNodeKind, string>> = {
  stack: "Tech Stack",
  tool: "Tools",
  mcp: "MCP Servers",
  auth: "Authentication",
  db: "Database",
  infra: "Infrastructure",
  deploy: "Deployment",
  skill: "Skills & Features",
};

export function createImplementationMarkdown(
  project: BuilderProjectV1,
  plan: BuilderExecutionPlanV1
): string {
  const lines: string[] = [
    `# ${project.title}`,
    "",
    project.description ? `> ${project.description}` : "",
    "",
    "## Project Configuration",
    "",
    `- Stack: ${project.stack}`,
    `- Backend (BaaS): ${project.baas}`,
    `- Nodes: ${project.nodes.length}`,
    `- Edges: ${project.edges.length}`,
    "",
    "## Node Breakdown",
    "",
  ];

  const grouped = new Map<BuilderNodeKind, string[]>();
  for (const node of project.nodes) {
    const current = grouped.get(node.kind) ?? [];
    current.push(node.label);
    grouped.set(node.kind, current);
  }

  for (const [kind, labels] of grouped.entries()) {
    lines.push(`### ${SECTION_LABELS[kind] ?? kind}`);
    for (const label of labels) {
      lines.push(`- [ ] ${label}`);
    }
    lines.push("");
  }

  lines.push("## Dependencies", "");
  for (const dep of plan.dependencies) {
    lines.push(`- ${dep.name}@${dep.version}${dep.dev ? " (dev)" : ""}`);
  }
  lines.push("");

  lines.push("## Scripts", "");
  for (const script of plan.scripts) {
    lines.push(`- \`${script.name}\`: \`${script.command}\``);
  }
  lines.push("");

  lines.push("## File Plan", "");
  for (const file of plan.filePlan) {
    lines.push(`- \`${file.path}\` — ${file.purpose}`);
  }
  lines.push("");

  if (plan.warnings.length > 0) {
    lines.push("## Warnings", "");
    for (const warning of plan.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function createMcpMarkdown(project: BuilderProjectV1): string {
  const mcpNodes = project.nodes.filter((node) => node.kind === "mcp");
  const skillNodes = project.nodes.filter((node) => node.kind === "skill");

  const lines = [
    "# MCP Manifest",
    "",
    `Project: **${project.title}**`,
    "",
    "## MCP Servers",
    "",
    ...(mcpNodes.length > 0
      ? mcpNodes.map((node) => `- ${node.label}`)
      : ["_No MCP servers defined_"]),
    "",
    "## Skills",
    "",
    ...(skillNodes.length > 0
      ? skillNodes.map((node) => `- ${node.label}`)
      : ["_No skills defined_"]),
    "",
  ];

  return lines.join("\n");
}
