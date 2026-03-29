import {
  STYLEFORGE_VERSION,
  StyleForgeKitManifestSchema,
  StyleForgeKitSchema,
  type StyleForgeDraft,
  type StyleForgeGeneratedFile,
  type StyleForgeKit,
  type StyleForgeReference,
  type StyleForgeSelection,
} from "@stealthis/schema/styleforge";
import { hashText } from "./hash";
import { createId } from "./ids";

interface BuildKitInput {
  draft: StyleForgeDraft;
  selection: StyleForgeSelection;
  sourceReferences: StyleForgeReference[];
}

function toFile(path: string, content: string): StyleForgeGeneratedFile {
  return {
    path,
    content,
    hash: hashText(content),
  };
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "component"
  );
}

function createReadme(input: BuildKitInput, kitId: string): string {
  return [
    "# StyleForge Kit",
    "",
    `Kit ID: ${kitId}`,
    `Draft ID: ${input.draft.id}`,
    "",
    `## ${input.draft.title}`,
    "",
    input.draft.summary,
    "",
    "## Linea grafica",
    "",
    ...input.draft.visualDirection.map((line) => `- ${line}`),
    "",
    "## Source references",
    "",
    ...input.sourceReferences.map((reference) => `- ${reference.title} (${reference.slug})`),
    "",
    "## Output",
    "",
    "- `kit/tokens/style-tokens.css`",
    "- `kit/components/*.html|*.css|*.js`",
    "- `kit/preview/index.html`",
    "- `kit/IMPLEMENTATION.md`",
    "",
    "## Coming soon CLI",
    "",
    `\`bunx stealthis-kit pull ${kitId}\``,
    "",
  ].join("\n");
}

function createImplementationGuide(input: BuildKitInput, kitId: string): string {
  return [
    "# IMPLEMENTATION",
    "",
    `Kit ID: ${kitId}`,
    "",
    "## 1) Add tokens",
    "",
    "Copy `kit/tokens/style-tokens.css` into your project and import it globally.",
    "",
    "```css",
    "@import \"./style-tokens.css\";",
    "```",
    "",
    "## 2) Install components in order",
    "",
    ...input.draft.suggestedComponents.map(
      (component, index) => `${index + 1}. ${component.name} — ${component.rationale}`
    ),
    "",
    "## 3) Apply interaction profile",
    "",
    `- Motion: ${input.selection.constraints.motion}`,
    `- Density: ${input.selection.constraints.density}`,
    `- Radius: ${input.selection.constraints.radius}`,
    `- Contrast: ${input.selection.constraints.contrast}`,
    `- Tone: ${input.selection.constraints.tone}`,
    "",
    "## 4) QA checklist",
    "",
    "- Validate contrast on primary CTA and body text.",
    "- Validate component spacing in 1280px and 390px widths.",
    "- Validate hover/focus states for keyboard navigation.",
    "- Validate reduced motion mode behavior.",
    "",
    "## 5) Future CLI",
    "",
    "The command below is reserved for the upcoming CLI release:",
    "",
    `\`bunx stealthis-kit pull ${kitId}\``,
    "",
  ].join("\n");
}

function createTokensCss(input: BuildKitInput): string {
  const { tokens } = input.draft;

  return [
    ":root {",
    `  --sf-background: ${tokens.background};`,
    `  --sf-surface: ${tokens.surface};`,
    `  --sf-text: ${tokens.text};`,
    `  --sf-accent: ${tokens.accent};`,
    `  --sf-accent-strong: ${tokens.accentStrong};`,
    `  --sf-radius: ${tokens.radiusBase};`,
    `  --sf-shadow: ${tokens.shadow};`,
    `  --sf-font-display: ${tokens.fontDisplay};`,
    `  --sf-font-body: ${tokens.fontBody};`,
    "}",
    "",
    "body {",
    "  margin: 0;",
    "  background: var(--sf-background);",
    "  color: var(--sf-text);",
    "  font-family: var(--sf-font-body);",
    "}",
    "",
    ".sf-card {",
    "  background: var(--sf-surface);",
    "  border-radius: var(--sf-radius);",
    "  box-shadow: var(--sf-shadow);",
    "  border: 1px solid color-mix(in oklab, var(--sf-text), transparent 85%);",
    "}",
    "",
  ].join("\n");
}

function createComponentHtml(componentId: string, componentName: string): string {
  return [
    '<section class="sf-card sf-component" data-component-id="' + componentId + '">',
    `  <h2>${componentName}</h2>`,
    "  <p>Generated from your StyleForge draft.</p>",
    '  <button type="button" class="sf-btn">Primary action</button>',
    "</section>",
    "",
  ].join("\n");
}

function createComponentCss(componentId: string): string {
  return [
    `.sf-component[data-component-id=\"${componentId}\"] {`,
    "  padding: 1.25rem;",
    "  display: grid;",
    "  gap: 0.75rem;",
    "}",
    "",
    `.sf-component[data-component-id=\"${componentId}\"] h2 {`,
    "  margin: 0;",
    "  font-family: var(--sf-font-display);",
    "  font-size: clamp(1.2rem, 2vw, 1.75rem);",
    "}",
    "",
    ".sf-btn {",
    "  width: fit-content;",
    "  padding: 0.65rem 1rem;",
    "  border-radius: var(--sf-radius);",
    "  border: 0;",
    "  color: #fff;",
    "  background: linear-gradient(120deg, var(--sf-accent), var(--sf-accent-strong));",
    "  cursor: pointer;",
    "}",
    "",
  ].join("\n");
}

function createComponentJs(componentName: string): string {
  return [
    "document.querySelectorAll('.sf-btn').forEach((button) => {",
    "  button.addEventListener('click', () => {",
    `    console.log('${componentName} CTA clicked');`,
    "  });",
    "});",
    "",
  ].join("\n");
}

function createPreviewHtml(componentSlugs: string[]): string {
  const componentImports = componentSlugs
    .map(
      (slug) =>
        `<link rel=\"stylesheet\" href=\"../components/${slug}.css\" />\n<script defer src=\"../components/${slug}.js\"></script>`
    )
    .join("\n");

  const componentMarkup = componentSlugs
    .map((slug) => `<article id=\"${slug}\"></article>`)
    .join("\n      ");

  const loaders = componentSlugs
    .map(
      (slug) =>
        `fetch('../components/${slug}.html').then((response) => response.text()).then((html) => { const mount = document.getElementById('${slug}'); if (mount) mount.innerHTML = html; });`
    )
    .join("\n      ");

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "  <title>StyleForge Preview</title>",
    '  <link rel="stylesheet" href="../tokens/style-tokens.css" />',
    componentImports,
    "  <style>",
    "    main {",
    "      max-width: 72rem;",
    "      margin: 0 auto;",
    "      padding: 2.5rem 1rem 4rem;",
    "      display: grid;",
    "      gap: 1rem;",
    "    }",
    "  </style>",
    "</head>",
    "<body>",
    "  <main>",
    "    <h1 style=\"margin:0;font-family:var(--sf-font-display);\">StyleForge Kit Preview</h1>",
    "    <p style=\"margin:0 0 1rem;opacity:.8\">Generated components rendered together.</p>",
    `      ${componentMarkup}`,
    "  </main>",
    "  <script>",
    `      ${loaders}`,
    "  </script>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

export function createStyleForgeKit(input: BuildKitInput): StyleForgeKit {
  const now = new Date().toISOString();
  const kitId = createId("sf-kit");

  const files: StyleForgeGeneratedFile[] = [];
  const componentSlugs = input.draft.suggestedComponents.slice(0, 6).map((component) => slugify(component.id));

  files.push(toFile("kit/README.md", createReadme(input, kitId)));
  files.push(toFile("kit/IMPLEMENTATION.md", createImplementationGuide(input, kitId)));
  files.push(toFile("kit/tokens/style-tokens.css", createTokensCss(input)));

  input.draft.suggestedComponents.slice(0, 6).forEach((component, index) => {
    const componentSlug = componentSlugs[index];
    files.push(toFile(`kit/components/${componentSlug}.html`, createComponentHtml(componentSlug, component.name)));
    files.push(toFile(`kit/components/${componentSlug}.css`, createComponentCss(componentSlug)));
    files.push(toFile(`kit/components/${componentSlug}.js`, createComponentJs(component.name)));
  });

  files.push(toFile("kit/preview/index.html", createPreviewHtml(componentSlugs)));

  const manifest = StyleForgeKitManifestSchema.parse({
    version: STYLEFORGE_VERSION,
    id: kitId,
    createdAt: now,
    draftId: input.draft.id,
    sourceReferences: input.sourceReferences,
    selection: input.selection,
    files: files.map((file) => ({
      path: file.path,
      hash: file.hash,
      bytes: new TextEncoder().encode(file.content).byteLength,
    })),
    warnings: input.draft.warnings,
  });

  const manifestFile = toFile(
    "kit/.stealthis/styleforge-manifest.json",
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  return StyleForgeKitSchema.parse({
    id: kitId,
    files: [...files, manifestFile],
    manifest,
    warnings: input.draft.warnings,
  });
}
