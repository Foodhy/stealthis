# Nuevas Categorias Propuestas

## Objetivo
Expandir el catalogo con categorias nuevas, sin duplicar las que ya existen en el schema/home actual.

## Categorias actuales (no repetir)
- `web-animations`
- `web-pages`
- `ui-components`
- `patterns`
- `components`
- `pages`
- `prompts`
- `skills`
- `mcp-servers`
- `architectures`
- `boilerplates`
- `remotion`
- `music` (actualmente visible como coming soon en home)

## 50 categorias nuevas agrupadas

### 1) 3D y experiencias inmersivas
- `3d-models`
- `3d-interactions`
- `shader-lab`
- `webxr-ar-vr`
- `product-viewers`

### 2) Audio y media interactiva
- `audio-visualizers`
- `web-audio-processing`
- `midi-music-tech`
- `voice-interfaces`
- `podcast-tools`

### 3) Data UI y visualizacion
- `data-visualization`
- `realtime-analytics`
- `geospatial-maps`
- `network-graphs`
- `dashboard-kits`

### 4) Backend y APIs
- `api-backend-patterns`
- `graphql-patterns`
- `event-driven-systems`
- `queue-workers`
- `webhooks-integrations`

### 5) Data layer y persistencia
- `database-schemas`
- `data-modeling-ddd`
- `migrations-seeding`
- `search-indexing`
- `caching-strategies`

### 6) Confiabilidad y seguridad
- `auth-identity`
- `security-hardening`
- `observability-monitoring`
- `logging-tracing`
- `reliability-sre`

### 7) Software best practices (con ejemplos)
- `software-best-practices`
- `refactoring-katas`
- `clean-code-patterns`
- `code-review-playbooks`
- `architecture-decision-records`

### 8) Calidad y experiencia final
- `testing-qa`
- `contract-testing`
- `performance-engineering`
- `accessibility-a11y`
- `seo-content-systems`

### 9) Plataforma y entrega
- `ci-cd-devops`
- `infra-as-code`
- `container-orchestration`
- `serverless-edge`
- `release-engineering`

### 10) AI aplicada y formatos de producto
- `ai-agent-workflows`
- `llm-rag-systems`
- `browser-extensions`
- `mobile-webapps`
- `desktop-crossplatform`

## Prioridad sugerida (primer batch para activar)
1. `software-best-practices`
2. `api-backend-patterns`
3. `database-schemas`
4. `data-visualization`
5. `auth-identity`
6. `testing-qa`
7. `performance-engineering`
8. `3d-models`
9. `3d-interactions`
10. `audio-visualizers`
11. `observability-monitoring`
12. `ai-agent-workflows`

## Notas de implementacion en este repo
Si se agrega una categoria nueva al sistema, actualizar:
- `packages/schema/src/schema.ts`
- `packages/schema/src/types.ts`
- `apps/www/src/content/config.ts`
- `apps/www/src/i18n/index.ts`
