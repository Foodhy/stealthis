# StyleForge Roadmap

> Última actualización: 2026-03-04
> Alcance: `apps/styleforge` + integración mínima en `apps/www` + contratos compartidos en `packages/schema`.

## North Star

StyleForge permite que un usuario defina su línea gráfica a partir de referencias reales de StealThis y exporte un kit implementable en HTML/CSS/JS con trazabilidad de decisiones.

Flujo objetivo del producto:
1. Elegir referencias visuales (páginas y componentes).
2. Elegir constraints de diseño (densidad, radio, contraste, motion, tono).
3. Generar draft (IA con BYOK o fallback deterministic).
4. Confirmar y finalizar kit.
5. Descargar ZIP con archivos listos + guía de implementación.

## Estado Ejecutivo

| Bloque | Estado | Evidencia principal |
|---|---|---|
| App separada `apps/styleforge` | DONE | `apps/styleforge/src/pages/index.astro` |
| Selectores circulares animados (3 ruedas) | DONE | `apps/styleforge/src/components/StyleForgeStudio.tsx` |
| API de referencias/draft/finalize | DONE | `apps/styleforge/src/pages/api/styleforge/*.ts` |
| Draft IA + fallback deterministic | DONE | `apps/styleforge/src/lib/styleforge/generator.ts` |
| Job UX híbrido local (`queued/generating/ready/error`) | DONE | `apps/styleforge/src/components/StyleForgeStudio.tsx` |
| Generación de kit + manifiesto + ZIP | DONE | `apps/styleforge/src/lib/styleforge/kit.ts`, `apps/styleforge/src/lib/styleforge/files.ts` |
| Integración en nav de `www` | DONE | `apps/www/src/components/Nav.astro`, `apps/www/src/lib/urls.ts`, `apps/www/src/i18n/index.ts` |
| Comando CLI (`bunx stealthis-kit pull <kit-id>`) | IN MVP (UI only) | Visible y copyable, no backend/CLI real |
| Jobs durables backend | NEXT | No implementado |
| Target React/Vite | LATER | No implementado |

## Entregado (Hecho)

### 1) Base técnica y app dedicada
- [x] App nueva `apps/styleforge` (Astro + React + Tailwind + adapter Cloudflare).
- [x] Configuración propia (`astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `robots.txt`, `sitemap.xml.ts`).
- [x] Scripts monorepo agregados: `dev:styleforge` y `build:styleforge`, más inclusión en `dev/build/deploy` raíz.

### 2) Contratos y tipos compartidos
- [x] Nuevo módulo `packages/schema/src/styleforge.ts` con Zod y tipos exportados.
- [x] Re-export en `packages/schema/src/index.ts`.
- [x] Alineación de providers en builder (`google` agregado en `packages/schema/src/builder.ts`).
- [x] Subpath exports en `packages/schema/package.json` para consumo seguro desde cliente.

### 3) API pública de StyleForge
- [x] `GET /api/styleforge/references`.
- [x] `POST /api/styleforge/draft`.
- [x] `POST /api/styleforge/finalize`.
- [x] Validación de payload con Zod y helpers JSON compartidos.
- [x] Fuente de referencias curada desde Astro content collections (`packages/content/resources/*` vía `getCollection("resources")`).

### 4) Motor de generación
- [x] Deterministic draft para tokens, visual direction y componentes sugeridos.
- [x] Ruta IA con OpenAI, Anthropic y Google (BYOK en request).
- [x] Fallback robusto a deterministic cuando falta/falla API key.

### 5) UX MVP (flujo extremo a extremo)
- [x] Selector IA provider/model/API key opcional.
- [x] Rueda 1: referencias de estilo de páginas.
- [x] Rueda 2: referencias de estilo de componentes.
- [x] Rueda 3: constraints presets.
- [x] Preview editable de draft (title, summary, visualDirection).
- [x] Cola local de jobs con persistencia en `localStorage`.
- [x] Notificación browser cuando kit queda `ready`.
- [x] Panel de kits + descarga ZIP.
- [x] Comando CLI mostrado como “coming soon”.

### 6) Artefactos del kit (V1 HTML)
- [x] `kit/README.md`
- [x] `kit/IMPLEMENTATION.md`
- [x] `kit/tokens/style-tokens.css`
- [x] `kit/components/*.html`
- [x] `kit/components/*.css`
- [x] `kit/components/*.js`
- [x] `kit/preview/index.html`
- [x] `kit/.stealthis/styleforge-manifest.json`

### 7) Integración en sitio principal
- [x] `StyleForge` visible en nav desktop/mobile de `www`.
- [x] `nav.styleforge` agregado en i18n (`en/es/fr/ja`).
- [x] URL de app `styleforge` añadida a `SITE_URLS`.

## En Curso Ahora

### Sprint de hardening MVP
- [ ] Revisión de smoke checks de rutas en entorno dev (`4321`, `4324`, `4326`).
- [ ] Ajustes de robustez en parsing/sanitización de salida generada.
- [ ] Consolidar pruebas mínimas (unit + API contract) para congelar v1.

## Próximos Sprints (Qué Sigue)

### Sprint 1 (MVP estable)
- [ ] Rate limiting básico para endpoints de IA.
- [ ] Sanitización server-side de nombres/rutas de componentes.
- [ ] Validación más estricta de archivos generados antes de devolver kit.
- [ ] Pruebas unitarias de `createDeterministicDraft` y manifiesto del kit.

### Sprint 2 (Operación real)
- [ ] Pasar de cola local a jobs durables backend (DB + worker).
- [ ] Reintentos e idempotencia en `finalize`.
- [ ] Persistencia de jobs fuera de sesión del navegador.
- [ ] Notificación fuera del tab actual (opcional con webhook/email).

### Sprint 3 (Expansión de producto)
- [ ] Soporte de target React (componentes + docs).
- [ ] Soporte Vite starter.
- [ ] Multi-target export en un solo kit.
- [ ] Comparador de drafts A/B y edición de tokens avanzada.

## Backlog Estratégico

- [ ] CLI real `stealthis-kit` para que `bunx stealthis-kit pull <kit-id>` funcione.
- [ ] Historial de versiones por kit y rollback.
- [ ] Compartir drafts por URL (modo colaboración).
- [ ] Persistencia por usuario/proyecto (auth opcional).

## Restricciones Conocidas del MVP

1. La cola asíncrona es local al navegador (`localStorage`), no durable en servidor.
2. El comando CLI es solo UX; no existe registry/backend para pull real.
3. El output actual está enfocado solo en HTML/CSS/JS.
4. El modo IA depende de BYOK y puede caer a deterministic.
5. No hay tests E2E dedicados de StyleForge aún.

## Criterio de Cierre MVP (Definition of Done)

- [x] Usuario selecciona referencias + constraints en ruedas.
- [x] Draft deterministic funciona sin IA.
- [x] Draft IA funciona con BYOK y fallback no rompe UX.
- [x] Finalize produce kit descargable con `IMPLEMENTATION.md`.
- [x] Estado de jobs persiste tras refresh y muestra errores.
- [x] `StyleForge` aparece en nav y `Builder` sigue visible.
- [ ] Smoke checks de rutas documentados para release candidate.
- [ ] Lint global limpio o baseline de lint acordada para merge.

## Bitácora

- 2026-03-04: se crea app separada `apps/styleforge`, APIs de draft/finalize/references, motor deterministic+IA, kit ZIP y nav integration en `www`.
- 2026-03-04: se define roadmap operativo con estado real, próximos sprints y checklist de cierre MVP.
