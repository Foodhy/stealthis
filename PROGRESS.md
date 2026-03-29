# StealThis.dev — Progress Checklist

> Estado actual del proyecto. Marca aquí lo que se va completando.
> Última actualización: 2026-02-21 (sesión 4)

---

## Fase 0 — Fundación del Monorepo ✅

### Raíz del proyecto
- [x] `package.json` — Bun workspaces (`apps/*`, `packages/*`)
- [x] `.gitignore` — node_modules, dist, .wrangler, .astro, etc.
- [x] `biome.json` — linting y formatting (reemplaza ESLint + Prettier)
- [x] `CLAUDE.md` — guía para Claude Code (comandos, arquitectura, gotchas)
- [x] Scripts raíz con `--filter` de Bun workspaces:
  - [x] `bun run dev:www`
  - [x] `bun run dev:docs`
  - [x] `bun run dev:lab`
  - [x] `bun run dev:build`
  - [x] `bun run dev:mcp`
  - [x] `bun run build` (todos los apps en secuencia)

---

### `packages/config` — Configuración compartida ✅
- [x] `package.json` (`@stealthis/config`)
- [x] `tsconfig.base.json` — TypeScript estricto, ESNext
- [x] `tailwind.preset.ts` — tokens de diseño compartidos (colores, tipografía, radios, sombras)

---

### `packages/schema` — Tipos y utilidades compartidos ✅
- [x] `package.json` (`@stealthis/schema`)
- [x] `src/types.ts` — interfaz `ResourceMeta` + union types (category, type, difficulty, target)
- [x] `src/schema.ts` — schema Zod con coerción de fechas (gray-matter devuelve Date objects)
- [x] `src/loader.ts` — `loadResources()`, `getResourceCatalog()`, `readSnippet()`
- [x] `src/index.ts` — re-export de todo
- [x] Extendido con categorías Fase 2: `components`, `prompts`, `skills`, `mcp-servers`, `architectures`, `boilerplates`, `remotion`
- [x] Extendido con tipos Fase 2: `prompt`, `skill`, `mcp-server`, `architecture`, `boilerplate`
- [x] Extendido con targets Fase 2: `typescript`, `python`, `markdown`, `yaml`, `json`

---

### `packages/content` — Contenido fuente ✅
- [x] `package.json` (`@stealthis/content`)
- [x] Estructura de carpetas `resources/<slug>/`
- [x] Estructura de carpetas `docs/`

#### Recursos seed (9)
- [x] `scroll-fade` — Scroll Fade In (web-animations, easy)
  - [x] `index.mdx` (frontmatter + prosa)
  - [x] `snippets/html.html`
  - [x] `snippets/style.css`
  - [x] `snippets/script.js`
  - [x] `snippets/react.tsx`
- [x] `glass-card` — Glassmorphism Card (ui-components, easy)
  - [x] `index.mdx`
  - [x] `snippets/html.html`
  - [x] `snippets/style.css`
  - [x] `snippets/script.js`
  - [x] `snippets/react.tsx`
- [x] `hero-parallax` — Hero Parallax (web-pages, med)
  - [x] `index.mdx`
  - [x] `snippets/html.html`
  - [x] `snippets/style.css`
  - [x] `snippets/script.js`
  - [x] `snippets/react.tsx`
- [x] `dot-loader` — CSS Dot Loader (patterns, easy)
  - [x] `index.mdx`
  - [x] `snippets/html.html`
  - [x] `snippets/style.css`
- [x] `magnetic-button` — Magnetic Button (patterns, med)
  - [x] `index.mdx`
  - [x] `snippets/html.html`
  - [x] `snippets/style.css`
  - [x] `snippets/script.js`
  - [x] `snippets/react.tsx`
- [x] `hero-cta-section` — Hero CTA Section (web-pages, easy)
  - [x] `index.mdx`
  - [x] `snippets/html.html`
  - [x] `snippets/react.tsx`
- [x] `code-review-prompt` — Code Review Prompt (prompts, easy)
  - [x] `index.mdx`
  - [x] `snippets/markdown.md`
- [x] `git-commit-skill` — Git Commit Claude Code Skill (skills, easy)
  - [x] `index.mdx`
  - [x] `snippets/skill.yaml`
- [x] `nextjs-saas-architecture` — Next.js SaaS Architecture (architectures, med)
  - [x] `index.mdx`
  - [x] `snippets/markdown.md` (con diagrama Mermaid)

#### Docs seed
- [x] `docs/getting-started.mdx`
- [x] `docs/resource-format.mdx`
- [x] `docs/llms.txt`
- [x] `docs/AGENTS.mdx`

---

## Fase 1 — apps/www (Showcase principal) ✅

### Setup
- [x] `package.json` (`@stealthis/www`) — Astro 5, Tailwind, Shiki, MDX, Cloudflare adapter
- [x] `astro.config.mjs` — i18n (`en`/`es`), MDX, Tailwind, Shiki, Cloudflare
- [x] `tsconfig.json` — extends `astro/tsconfigs/strict`
- [x] `tailwind.config.mjs` — con opacidades custom (`/6`, `/8`, `/14`)
- [x] `src/styles/global.css` — estilos base dark

### Content Collection
- [x] `src/content/config.ts` — glob loader apuntando a `packages/content/resources`, schema con coerción de fechas

### Internacionalización (i18n)
- [x] `src/i18n/index.ts` — mapa de traducciones en/es, `useTranslations()`, `getLocaleFromUrl()`
- [x] Traducciones para: nav, categorías, dificultad, targets, acciones de recurso, UI general

### Layouts y componentes
- [x] `src/layouts/Base.astro` — layout base con meta tags, nav, footer
- [x] `src/components/Nav.astro` — navegación con links a Docs/Lab/Builder
- [x] `src/components/Footer.astro`
- [x] `src/components/ResourceCard.astro` — card con badge de dificultad, tech chips, botón lab, favorito
- [x] `src/components/FilterBar.astro` — filtros client-side por categoría/dificultad/tech + oculta secciones/grupos vacíos
- [x] `src/components/CodeTabs.astro` — tabs por target (CSS/JS/HTML/React/Markdown/YAML), Shiki highlight, copy button, **Mermaid preview tab**
- [x] `src/components/ActionMenu.astro` — Copy snippet / Copy Markdown / Open in ChatGPT / Open in Claude / **MCP: Add to Claude Code / Add to Cursor**

### Páginas (inglés)
- [x] `src/pages/index.astro` — landing con hero y grid de recursos destacados
- [x] `src/pages/library/index.astro` — catálogo completo con FilterBar, favoritos, **agrupación por categoría** (Visual / AI)
- [x] `src/pages/r/[slug].astro` — página de recurso con CodeTabs + ActionMenu + lab link

### Páginas (español)
- [x] `src/pages/es/index.astro`
- [x] `src/pages/es/library/index.astro`
- [x] `src/pages/es/r/[slug].astro`

### Utilidades
- [x] `src/lib/favorites.ts` — `getFavorites()`, `toggleFavorite()`, `exportFavorites()`, `importFavorites()`

---

## Fase 2 — apps/docs (Starlight) ✅

### Setup
- [x] `package.json` (`@stealthis/docs`) — Astro + Starlight, Cloudflare adapter
- [x] `astro.config.mjs` — Starlight con sidebar autogenerate, logo, social links
- [x] `tsconfig.json`
- [x] `src/styles/custom.css` — overrides de color de marca
- [x] `src/assets/` — logos SVG (dark/light)
- [x] `src/content/config.ts` — `docsLoader()` + `docsSchema()` (Starlight 0.32 + Astro 5)

### Páginas de docs
- [x] `src/content/docs/getting-started.mdx`
- [x] `src/content/docs/resource-format.mdx`
- [x] `src/content/docs/mcp-server.mdx`
- [x] `src/content/docs/agents.mdx`
- [x] `src/content/docs/llm.mdx`

### Endpoints
- [x] `src/pages/llms.txt.ts` — endpoint estático que sirve `packages/content/docs/llms.txt`

---

## Fase 3 — apps/lab (Demos full-screen) ✅

### Setup
- [x] `package.json` (`@stealthis/lab`) — Astro, Tailwind, Cloudflare adapter, fast-glob, gray-matter
- [x] `astro.config.mjs`
- [x] `tsconfig.json`
- [x] `src/styles/global.css`

### Páginas
- [x] `src/pages/index.astro` — índice de todas las demos disponibles (grid de cards)
- [x] `src/pages/[category]/[slug].astro` — demo full-screen en `<iframe srcdoc>` con HTML+CSS+JS inline
  - [x] Genera rutas: `/web-animations/scroll-fade`
  - [x] Genera rutas: `/ui-components/glass-card`
  - [x] Genera rutas: `/web-pages/hero-parallax`
  - [x] Genera rutas: `/patterns/dot-loader`
  - [x] Genera rutas: `/patterns/magnetic-button`
  - [x] Botón "View Code" → link de vuelta a `www/r/[slug]`

---

## Fase 4 — apps/build (Project Graph Builder) ✅

### Setup
- [x] `package.json` (`@stealthis/build`) — Astro + React island, @xyflow/react, Tailwind, Cloudflare adapter
- [x] `astro.config.mjs` — integración React + Tailwind
- [x] `tsconfig.json`
- [x] `src/styles/global.css` — estilos base + React Flow overrides dark

### Páginas y componentes
- [x] `src/pages/index.astro` — formulario de proyecto + isla React
- [x] `src/components/ProjectGraph.tsx` — React Flow con:
  - [x] 8 tipos de nodo: `stack`, `tool`, `mcp`, `skill`, `infra`, `auth`, `db`, `deploy`
  - [x] Palette sidebar — drag & drop al canvas
  - [x] Edges de dependencia entre nodos
  - [x] Export `project.json`
  - [x] Export `IMPLEMENTATION.md` (checklist markdown)
  - [x] Export `MCP.md` (manifiesto de tools/skills)

### Ajustes de usabilidad (sesión 3)
- [x] `src/components/ProjectGraph.tsx` — nodos custom con handles reales (top/left/right/bottom) para crear edges manualmente
- [x] `src/components/ProjectGraph.tsx` — panel de nodo seleccionado (renombrar + borrar) para editar stack/tools/MCP/skills sin rehacer el grafo
- [x] `src/components/ProjectGraph.tsx` — drag & drop funcional desde palette al canvas + click rápido para añadir
- [x] `src/components/ProjectGraph.tsx` — exports usan metadatos vivos del formulario (`Project Title`, `Description`)
- [x] `src/pages/index.astro` — emite estado inicial del formulario para sincronizar el título/descripción desde el primer render

---

## Fase 5 — apps/mcp (MCP Server) ✅

### Setup
- [x] `package.json` (`@stealthis/mcp`) — Hono v4, Cloudflare Workers
- [x] `wrangler.toml` — config del Worker
- [x] `tsconfig.json`

### Build-time
- [x] `scripts/generate-catalog.ts` — genera `src/catalog.json` desde `@stealthis/schema` (incluye contenido de snippets)
- [x] `src/catalog.json` — catálogo pre-generado (9 recursos)

### Endpoints HTTP (REST)
- [x] `GET /tools/list_resources` — filtra por `?category=`, `?difficulty=`, `?tech=`
- [x] `GET /tools/get_resource/:slug` — metadata completa de un recurso
- [x] `GET /tools/get_snippet/:slug/:target` — snippet de código por target
- [x] `GET /tools/search?q=` — búsqueda por título/descripción/tags
- [x] `GET /tools/get_doc/:docpath` — contenido de documentación
- [x] `GET /tools/get_lab/:slug` — URL del lab + targets disponibles
- [x] CORS habilitado para todos los orígenes

### MCP Protocol (Streamable HTTP)
- [x] `POST /mcp` — endpoint MCP Streamable HTTP (JSON-RPC 2.0)
  - [x] `initialize` — handshake con capabilities
  - [x] `tools/list` — lista de 5 tools disponibles
  - [x] `tools/call` — ejecuta `list_resources`, `get_resource`, `get_snippet`, `search`, `get_lab`
  - [x] `ping` — health check
- [x] `README.md` — guía de configuración para Claude Code, Claude Desktop, Cursor

---

## Fixes y Mejoras (sesión 2) ✅

- [x] Bug: `apps/docs` — 404 en `/` → creado `src/content/docs/index.mdx` (Starlight splash)
- [x] Bug: `apps/mcp` — infinite rebuild loop → eliminado `[build]` de `wrangler.toml`
- [x] Bug: `apps/lab` — CSS roto → añadido `@astrojs/tailwind` + `tailwind.config.mjs`
- [x] Bug: `apps/mcp` tsconfig warning → inlineado compiler options (sin `extends @stealthis/config`)
- [x] Library: agrupación de categorías en dos grupos (Visual / AI)
- [x] Library: ocultar secciones y grupos sin resultados en FilterBar
- [x] CodeTabs: Mermaid preview tab para recursos con diagramas
- [x] ActionMenu: botones MCP "Add to Claude Code" y "Add to Cursor"

---

## Fase 2 — Expansión de contenido ✅

- [x] all the demostrations have if typescript add TS in the section, or JS in the section in the library
- [x] Categoría `components` — components visual with simple css or tailwind (`glow-metric-card` seed ✅)
- [x] Categoría `pages` — pages visual with simple css or tailwind (`launch-hero-page` seed ✅)
- [x] Categoría `prompts` — plantillas ChatGPT/Claude (`code-review-prompt` seed ✅)
- [x] Categoría `skills` — plantillas Codex/Claude Code (`git-commit-skill` seed ✅)
- [x] Categoría `mcp-servers` — servers mcp para configurarlos (`stealthis-mcp-config` seed ✅)
- [x] Categoría `architectures` — architectures to explain (`nextjs-saas-architecture` seed ✅)
- [x] Categoría `boilerplates` — Astro/Next/Vite starters (`astro-tailwind-starter` seed ✅)
- [x] Categoría `remotion` — React → video (`animation-via-remotion` seed ✅)
- [x] Búsqueda con Pagefind (cuando el catálogo crezca)
- [x] Colecciones curadas

## Fase 2.5 — mejorar ✅

- [x] Imágenes/GIFs de preview para los recursos seed (`assets/preview.gif`) se realizo con showcase ✅
- [x] Demo embebida en Resource Page (además del lab full-screen) se realizo con showcase ✅
- [x] Detector de idioma automático (`navigator.language`) + selector manual persistente en localStorage
- [x] Agregar soporte de idiomas para países con mayor tráfico: francés (Francia) y, japonés (Japón). Permitir UI multilingüe y detección automática según país/idioma del usuario (ver imagen de tráfico por país).
- [x] `?format=md` endpoint en docs para devolver MDX crudo
- [x] Búsqueda client-side en `/library` (índice JSON, sin backend)

## Fase 3 — Contenido y pulido ❌
- [ ] mejorar en showcase el espacio de las cajas segun la categoria
- [ ] Mejorar exportación de ejemplos: actualmente los ejemplos que utilizan Lenis y otras dependencias internas no pueden copiarse ni funcionan correctamente fuera del entorno del proyecto. Implementar el sistema de importmap usado en `index.html` (líneas 8-24) añadiendo mappings explícitos para dependencias como `gsap`, `lenis`, `three`, etc., de modo que los snippets exportados y vistos por el usuario sean autoincluibles y ejecutables en CodePen, StackBlitz y sandbox externos.
- [ ] Mejorar la vista de librery para poder ver los ejemplos que hay y escoger


## Fase 4 — Login + contribución ❌

- [ ] GitHub OAuth
- [ ] Flujo de subida de recursos (repo o manual)
- [ ] Moderación y flags
- [ ] Versionado de recursos (git tags por slug)

## Infraestructura / Deploy 🚧

- [x] Cloudflare Pages — configurar `www` (`stealthis-www`)
- [x] Cloudflare Pages — configurar `docs` (`stealthis-docs`)
- [x] Cloudflare Pages — configurar `lab` (`stealthis-lab`)
- [x] Cloudflare Pages — configurar `build` (`stealthis-build`)
- [x] Cloudflare Workers — deploy `mcp` (`stealthis-mcp`)
- [ ] DNS — subdominios apuntando a cada deploy (pendiente: mapear dominios `www/docs/lab/build/mcp.stealthis.dev`)
- [x] Variables de entorno en Cloudflare (MVP actual no requiere secrets/vars runtime)

### Deploy activo (2026-02-21)

- `www`: https://4e0e4377.stealthis-www.pages.dev
- `docs`: https://69890abe.stealthis-docs.pages.dev
- `lab`: https://ca2d9f59.stealthis-lab.pages.dev
- `build`: https://6e9ab555.stealthis-build.pages.dev
- `mcp`: https://stealthis-mcp.mediacollabteam.workers.dev


## Long term

### Builder (app build)

- Evolucionar Builder más allá de arrastrar y conectar: aspirar a un clon tipo **Bold.1** o **Lovable**.
- Control total sobre cómo se crea un nuevo software: qué tecnologías usa, qué stack, qué reglas.
- Súper flexible y agnóstico de tecnología: que pueda generar en cualquier stack según lo que se especifique.
- Ejecución en **máquina virtual** o en el **propio computador** del usuario, aplicando los cambios necesarios.
- Visibilidad **paso a paso**: ver cómo se despliega la funcionalidad, qué se está creando o conectando en cada paso.
- **StealThis como fuente de diseño**: a partir de lo que hay en StealThis (recursos, docs, snippets) poder inferir:
  - Qué arquitectura usar
  - Qué componentes, animaciones, buenas prácticas, system prompts, tecnologías
- Generar un **documento de diseño** que explique cómo hacer ese software, cómo pensarlo y construirlo.
- El **diagrama en Builder** debe reflejar: cómo se está construyendo, qué conexiones hace, qué hace en cada nodo, reglas, casos de uso, etc.

### Página principal y búsqueda

- Mejorar la **página inicial** para que explique bien el proyecto y la búsqueda de la librería (hay muchos ejemplos de referencias; definir cómo implementarlo bien).
- En el **documento** de la página: dejar claro el contenido (qué hay, categorías, buenas prácticas, cómo contribuir).

### Librería y preview

- Mejorar el **preview** de los recursos en la librería (y el resto de aspectos de la vista de librería).
- Diferenciar bien los iconos: uno para **abrir en la misma página** (click/ver) y otro para **abrir en nueva pestaña**.
- Mejorar **filtros** en la librería.

### Componentes reutilizables (library npm / paquete)

- Explorar opciones para **publicar y reutilizar componentes** como librería instalable (ej. `npm i stealthis -g` como en la imagen de “Access from your terminal”).
- Objetivo: que los componentes/demos de StealThis se puedan consumir desde terminal o como dependencia; definir formato (paquete npm, CLI, templates, etc.) y documentar las opciones posibles.
