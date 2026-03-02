import {
  type BuilderExecutionPlanV1,
  type BuilderGeneratedFile,
  type BuilderManifest,
  type BuilderProjectV1,
  BuilderScaffoldSchema,
} from "./contracts";
import { createImplementationMarkdown, createMcpMarkdown } from "./exporters";
import { hashText } from "./hash";
import { createId } from "./ids";

function createReadme(project: BuilderProjectV1, plan: BuilderExecutionPlanV1): string {
  return [
    `# ${project.title}`,
    "",
    project.description || "Generated with StealThis Builder.",
    "",
    "## Stack",
    "",
    `- Frontend: ${project.stack}`,
    `- Backend preset: ${project.baas}`,
    "",
    "## Quick Start",
    "",
    "```bash",
    "bun install",
    "bun run dev",
    "```",
    "",
    "## Generated Scripts",
    "",
    ...plan.scripts.map((script) => `- \`${script.name}\`: \`${script.command}\``),
    "",
    "## Node Summary",
    "",
    ...project.nodes.map((node) => `- [${node.kind}] ${node.label}`),
    "",
    "## Notes",
    "",
    "- This project was generated from a graph plan.",
    "- Re-run builder regeneration per node to iterate safely.",
    "",
  ].join("\n");
}

function createEnvExample(project: BuilderProjectV1): string {
  if (project.baas === "supabase") {
    return ["SUPABASE_URL=", "SUPABASE_ANON_KEY=", ""].join("\n");
  }

  if (project.baas === "firebase") {
    return [
      "NEXT_PUBLIC_FIREBASE_API_KEY=",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID=",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=",
      "NEXT_PUBLIC_FIREBASE_APP_ID=",
      "",
    ].join("\n");
  }

  return "# No backend preset selected for this project.\n";
}

function createBaasClient(project: BuilderProjectV1): string {
  if (project.baas === "supabase") {
    return [
      'import { createClient } from "@supabase/supabase-js";',
      "",
      'const supabaseUrl = process.env.SUPABASE_URL ?? "";',
      'const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";',
      "",
      "export const supabase = createClient(supabaseUrl, supabaseAnonKey);",
      "",
    ].join("\n");
  }

  if (project.baas === "firebase") {
    return [
      'import { initializeApp, getApps, type FirebaseApp } from "firebase/app";',
      "",
      "const firebaseConfig = {",
      "  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,",
      "  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,",
      "  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,",
      "  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,",
      "  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,",
      "  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,",
      "};",
      "",
      "export const firebaseApp: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);",
      "",
    ].join("\n");
  }

  return ["export const baasDisabled = true;", ""].join("\n");
}

function projectFeatureList(project: BuilderProjectV1): string {
  return project.nodes
    .map((node) => `        <li><strong>${node.kind}</strong>: ${node.label}</li>`)
    .join("\n");
}

function createAstroFiles(project: BuilderProjectV1): Array<{ path: string; content: string }> {
  return [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: project.title.toLowerCase().replace(/\s+/g, "-") || "stealthis-project",
          private: true,
          scripts: {
            dev: "astro dev",
            build: "astro build",
            preview: "astro preview",
          },
          dependencies: {
            astro: "^5.0.0",
            tailwindcss: "^3.4.0",
          },
          devDependencies: {
            typescript: "^5.0.0",
          },
        },
        null,
        2
      ),
    },
    {
      path: "astro.config.mjs",
      content: [
        'import { defineConfig } from "astro/config";',
        "",
        "export default defineConfig({});",
        "",
      ].join("\n"),
    },
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          extends: "astro/tsconfigs/strict",
        },
        null,
        2
      ),
    },
    {
      path: "src/styles/global.css",
      content: [
        ":root {",
        "  color-scheme: dark;",
        "  font-family: system-ui, -apple-system, sans-serif;",
        "}",
        "",
        "body {",
        "  margin: 0;",
        "  background: #020617;",
        "  color: #e2e8f0;",
        "}",
        "",
        "main {",
        "  max-width: 60rem;",
        "  margin: 0 auto;",
        "  padding: 3rem 1.25rem;",
        "}",
        "",
        "ul {",
        "  line-height: 1.7;",
        "}",
        "",
      ].join("\n"),
    },
    {
      path: "src/pages/index.astro",
      content: [
        "---",
        `import \"../styles/global.css\";`,
        "---",
        "",
        "<main>",
        `  <h1>${project.title}</h1>`,
        `  <p>${project.description || "Generated with StealThis Builder."}</p>`,
        "  <h2>Selected nodes</h2>",
        "  <ul>",
        projectFeatureList(project),
        "  </ul>",
        "</main>",
        "",
      ].join("\n"),
    },
  ];
}

function createNextFiles(project: BuilderProjectV1): Array<{ path: string; content: string }> {
  return [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: project.title.toLowerCase().replace(/\s+/g, "-") || "stealthis-project",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
          },
          dependencies: {
            next: "^15.0.0",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
            tailwindcss: "^3.4.0",
          },
          devDependencies: {
            typescript: "^5.0.0",
            "@types/react": "^19.0.0",
            "@types/node": "^20.0.0",
          },
        },
        null,
        2
      ),
    },
    {
      path: "next.config.mjs",
      content: [
        "/** @type {import('next').NextConfig} */",
        "const nextConfig = {};",
        "",
        "export default nextConfig;",
        "",
      ].join("\n"),
    },
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            lib: ["dom", "dom.iterable", "esnext"],
            strict: true,
            noEmit: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
          exclude: ["node_modules"],
        },
        null,
        2
      ),
    },
    {
      path: "app/globals.css",
      content: [
        ":root {",
        "  color-scheme: dark;",
        "  font-family: system-ui, -apple-system, sans-serif;",
        "}",
        "",
        "body {",
        "  margin: 0;",
        "  background: #020617;",
        "  color: #e2e8f0;",
        "}",
        "",
      ].join("\n"),
    },
    {
      path: "app/layout.tsx",
      content: [
        'import "./globals.css";',
        "",
        "export default function RootLayout({ children }: { children: React.ReactNode }) {",
        "  return (",
        '    <html lang="en">',
        "      <body>{children}</body>",
        "    </html>",
        "  );",
        "}",
        "",
      ].join("\n"),
    },
    {
      path: "app/page.tsx",
      content: [
        "export default function HomePage() {",
        "  return (",
        '    <main style={{ maxWidth: "60rem", margin: "0 auto", padding: "3rem 1.25rem" }}>',
        `      <h1>${project.title}</h1>`,
        `      <p>${project.description || "Generated with StealThis Builder."}</p>`,
        "      <h2>Selected nodes</h2>",
        "      <ul>",
        ...project.nodes.map(
          (node) => `        <li><strong>${node.kind}</strong>: ${node.label}</li>`
        ),
        "      </ul>",
        "    </main>",
        "  );",
        "}",
        "",
      ].join("\n"),
    },
  ];
}

function createManifest(
  project: BuilderProjectV1,
  files: BuilderGeneratedFile[],
  label: string,
  changedPaths: string[]
): BuilderManifest {
  const now = new Date().toISOString();

  return {
    version: "1.0",
    projectId: project.id,
    projectTitle: project.title,
    generatedAt: now,
    stack: project.stack,
    baas: project.baas,
    files: files.map((file) => ({
      path: file.path,
      hash: file.hash,
      bytes: new TextEncoder().encode(file.content).byteLength,
      updatedAt: now,
    })),
    snapshots: [
      {
        id: createId("snapshot"),
        label,
        createdAt: now,
        changedPaths,
      },
    ],
  };
}

function finalizeFiles(rawFiles: Array<{ path: string; content: string }>): BuilderGeneratedFile[] {
  return rawFiles.map((file) => ({
    path: file.path,
    content: file.content,
    hash: hashText(file.content),
  }));
}

export function createScaffold(
  project: BuilderProjectV1,
  plan: BuilderExecutionPlanV1,
  label = "full-build"
) {
  const stackFiles =
    project.stack === "astro-tailwind" ? createAstroFiles(project) : createNextFiles(project);
  const generatedCore: Array<{ path: string; content: string }> = [
    ...stackFiles,
    { path: ".env.example", content: createEnvExample(project) },
    { path: "README.md", content: createReadme(project, plan) },
    { path: "IMPLEMENTATION.md", content: createImplementationMarkdown(project, plan) },
    { path: "MCP.md", content: createMcpMarkdown(project) },
  ];

  if (project.baas !== "none") {
    generatedCore.push({ path: "src/lib/baas.ts", content: createBaasClient(project) });
  }

  const files = finalizeFiles(generatedCore);
  const manifest = createManifest(
    project,
    files,
    label,
    files.map((file) => file.path)
  );

  const manifestFile: BuilderGeneratedFile = {
    path: ".stealthis/manifest.json",
    content: JSON.stringify(manifest, null, 2),
    hash: hashText(JSON.stringify(manifest)),
  };

  const scaffold = {
    files: [...files, manifestFile],
    manifest,
    warnings: plan.warnings,
  };

  return BuilderScaffoldSchema.parse(scaffold);
}

function matchesNode(kind: BuilderProjectV1["nodes"][number]["kind"], path: string): boolean {
  if (kind === "stack") {
    return ["package.json", "astro.config.mjs", "next.config.mjs", "tsconfig.json"].includes(path);
  }

  if (kind === "auth" || kind === "db") {
    return path === "src/lib/baas.ts" || path === ".env.example";
  }

  if (kind === "mcp") {
    return path === "MCP.md";
  }

  return path === "IMPLEMENTATION.md" || path === "README.md";
}

export function createRegeneratedScaffold(
  project: BuilderProjectV1,
  plan: BuilderExecutionPlanV1,
  targetNodeId: string
) {
  const full = createScaffold(project, plan, `regenerate-${targetNodeId}`);
  const targetNode = project.nodes.find((node) => node.id === targetNodeId);

  if (!targetNode) {
    return {
      ...full,
      files: [],
      warnings: [...full.warnings, `Node ${targetNodeId} not found.`],
      changedPaths: [],
    };
  }

  const filtered = full.files.filter((file) => matchesNode(targetNode.kind, file.path));

  return {
    ...full,
    files: filtered,
    changedPaths: filtered.map((file) => file.path),
  };
}
