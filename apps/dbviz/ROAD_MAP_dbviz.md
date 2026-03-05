# DBViz Roadmap (Database Only)

## Vision
Construir una vertical completa de **database-schemas relacionales** dentro de StealThis:
- Categoria nueva en `www` para explorar esquemas.
- Soporte en `lab` para ver SQL + diagrama (ERD) renderizado.
- App `dbviz` para crear/probar/revisar esquemas por comandos.
- Evolucion posterior: conexion con Supabase + generacion asistida por IA (Ollama).

## Estado actual (2026-03-05)
- Fase 0: completada.
- Fase 1: completada.
- Fase 2: completada (8 recursos iniciales publicados).
- Fase 3: completada (Lab renderiza SQL + ERD).
- Fase 4: completada (commands workspace + artifacts + ejecución local `pglite`).
- Fase 5: completada en local (`docker` + `pglite`) con validación automática y reporte.
- Fase 6: en progreso (check + pull Supabase + export de borrador a `packages/content/resources/<slug>` + runtime selector en UI).
- Fase 7: pendiente.
- Fase 8: pendiente.

## Siguiente foco inmediato
1. Conectar el flujo de import Supabase dentro de la UI de `dbviz` (actualmente el import es CLI-first).
2. Agregar endpoint/backend en `dbviz` para ejecutar preview directo con `local+docker` y modo seguro para `supabase`.
3. Integrar `dbviz:validate` y `dbviz:supabase:check` en CI cuando se estabilice baseline global de lint.

## Scope (solo database)
Incluye:
- Modelado relacional, SQL DDL, ERD, seeds, queries.
- Integracion en `www`, `lab`, `dbviz`.
- Datos fake para pruebas y demos.
- Integracion futura con Supabase (lectura/import de schema).
- Integracion futura IA local con Ollama para generar esquemas.

No incluye (por ahora):
- Chat de producto en tiempo real.
- Categorias no relacionadas a base de datos.
- Soporte NoSQL (se deja para siguiente etapa).

## Categoria principal
### `database-schemas` (alias `db-schemas`)

Cada recurso debe incluir minimo:
- `schema.sql` (DDL completo).
- `diagram.mmd` o `schema.dbml` (ERD).
- `seed.sql` (datos fake/base).
- `queries.sql` (consultas tipicas de uso).

Opcional:
- `migrations.sql` (versionado inicial).
- `notes.md` (decisiones de modelado).

## Subtemas iniciales (MVP)
- `ecommerce-core` (users, products, orders, payments, inventory)
- `saas-multi-tenant` (orgs, members, roles, billing)
- `crm-sales` (leads, accounts, deals, activities)
- `lms-education` (courses, lessons, enrollments, progress)
- `marketplace` (buyers, sellers, listings, transactions)
- `booking-reservations` (resources, slots, reservations, cancellations)
- `cms-blog` (posts, authors, tags, media)
- `support-helpdesk` (tickets, comments, SLA, status history)

## Estructura estandar por recurso
Ruta base:
`packages/content/resources/<slug>/`

Estructura:
- `index.mdx`
- `snippets/schema.sql`
- `snippets/diagram.mmd` o `snippets/schema.dbml`
- `snippets/seed.sql`
- `snippets/queries.sql`

Frontmatter recomendado:
- `category: database-schemas`
- `type: schema`
- `targets`: incluir `sql` y `diagram` (o convension equivalente que definamos en schema)
- `labRoute`: obligatorio para los recursos que se renderizan en Lab

## Plan de implementacion por fases

## Fase 0 - Definicion tecnica y contratos
Objetivo:
Definir convenciones unicas para archivos, targets y render.

Tareas:
- Acordar formato de diagrama: `diagram.mmd` (Mermaid) como default.
- Acordar si se soporta `schema.dbml` desde inicio o en fase posterior.
- Definir contrato de snippet targets (`sql`, `diagram`, `seed`, `queries`).
- Definir como `lab` resuelve y muestra snippets faltantes.

Entregable:
- Documento de contrato de formato (este roadmap + checklist de implementacion).

Criterio de aceptacion:
- Equipo alineado en nombres de archivo y targets.

## Fase 1 - Soporte de categoria en schema + www
Objetivo:
Habilitar `database-schemas` como categoria oficial.

Archivos a actualizar:
- `packages/schema/src/schema.ts`
- `packages/schema/src/types.ts`
- `apps/www/src/content/config.ts`
- `apps/www/src/i18n/index.ts`

Tareas:
- Registrar la nueva categoria en enums/tipos.
- Agregar labels i18n para categoria y filtros.
- Verificar que `www/library` liste recursos de database.

Entregable:
- Categoria visible en UI y filtros de `www`.

Criterio de aceptacion:
- Nuevo card/categoria en browse section de `www`.
- Filtrado por `database-schemas` funcional.

## Fase 2 - Carga de contenido MVP (8 recursos)
Objetivo:
Publicar los 8 subtemas base.

Tareas:
- Crear 8 recursos con estructura estandar.
- Validar calidad SQL (FK, indexes minimos, timestamps).
- Agregar `seed.sql` realista y consultas utiles.

Entregable:
- Primer lote de recursos navegables en `www`.

Criterio de aceptacion:
- Cada recurso muestra SQL + diagrama + seeds + queries.
- Metadata consistente (slug, title, description, tags, difficulty, dates).

## Fase 3 - Soporte en Lab (SQL + ERD visible)
Objetivo:
Visualizar esquema de forma didactica en `lab`.

Tareas:
- Ruta `lab` para recursos database (por `labRoute`).
- Panel doble:
- SQL viewer (read-only, copiable).
- Render ERD (Mermaid o parser DBML segun contrato fase 0).
- Fallback claro cuando falte algun snippet.

Entregable:
- Preview funcional de cada recurso database en `lab`.

Criterio de aceptacion:
- `http://localhost:4323/<category>/<slug>` renderiza SQL + diagrama sin errores.

## Fase 4 - DBViz app (commands first)
Objetivo:
Consolidar `apps/dbviz` como entorno para probar esquemas.

Tareas:
- Consolidar panel de comandos SQL (MVP actual).
- Tabs `Diagram` y `Migrations`.
- Cargar ejemplos desde recursos de `packages/content/resources`.
- Exportar artifacts (`schema.sql`, `seed.sql`, `queries.sql`, `diagram.mmd`).

Entregable:
- Flujo local para iterar esquemas desde `dbviz`.

Criterio de aceptacion:
- Usuario puede abrir ejemplo, editar SQL y ver resultado visual base.

## Fase 5 - Datos fake y testing de esquemas
Objetivo:
Asegurar que cada schema sea ejecutable y demostrable.

Tareas:
- Estandar de `seed.sql` por recurso.
- Generar datasets fake consistentes por dominio.
- Validar queries tipicas sobre seed data.
- Checklist de integridad referencial minima.

Entregable:
- Demos reproducibles en local para cada schema.

Criterio de aceptacion:
- Ejecutar `schema.sql` + `seed.sql` sin errores en entorno local.
- `queries.sql` devuelve resultados esperados.

## Fase 6 - Integracion Supabase (import/inspect)
Objetivo:
Permitir traer schemas existentes desde Supabase.

Estado fase 6 (actual):
- [x] `supabase:check` para validar conexión.
- [x] `supabase:pull` para generar artifacts (`snapshot.json`, `schema.sql`, `diagram.mmd`, `seed.sql`, `queries.sql`).
- [x] Export opcional a borrador de recurso en `packages/content/resources/<slug>`.
- [ ] Flujo de import desde UI de `dbviz` (hoy CLI-first).
- [ ] Preview/ejecución segura desde UI con proveedor `supabase`.

Tareas:
- Definir mecanismo de import (SQL dump o introspection metadata).
- Mapear salida de Supabase al formato interno (`schema.sql`, `diagram.mmd`).
- Mostrar estado de import en `dbviz`.
- Guardar salida como nuevo recurso o borrador.

Entregable:
- Importador de schema desde Supabase a DBViz.

Criterio de aceptacion:
- Desde una fuente Supabase, generar artifacts compatibles con la estructura del proyecto.

## Fase 7 - IA para creacion de schemas (Ollama)
Objetivo:
Generar y refinar esquemas por prompts en local-first.

Tareas:
- Diseñar prompt template para generar:
- DDL limpio.
- relaciones FK.
- seed data razonable.
- consultas base.
- Integrar proveedor local Ollama en `dbviz`.
- Agregar guardrails (validacion SQL, nombres reservados, FK coherentes).

Entregable:
- Generacion asistida de schemas con Ollama.

Criterio de aceptacion:
- Prompt -> `schema.sql` + `diagram` + `seed.sql` + `queries.sql` validos en flujo local.

## Fase 8 - Hardening y release
Objetivo:
Cerrar calidad, documentacion y DX.

Tareas:
- Documentar flujo completo en docs.
- Mejorar mensajes de error y fallback UX.
- Revisar rendimiento de render de diagramas grandes.
- Definir versionado de recursos database.

Entregable:
- Primera version estable de vertical database.

Criterio de aceptacion:
- Equipo puede crear/publicar/revisar schemas end-to-end sin pasos manuales ambiguos.

## Backlog database (despues del MVP)
- `query-patterns` (joins, CTEs, windows, reportes)
- `db-migrations` (versionado, rollback, estrategias)
- `db-performance` (indices, particionado, anti-patterns)
- `data-warehousing` (star schema, fact/dim, ETL)
- `api-contracts` (OpenAPI + modelos conectados al schema)

## Validacion y checks por iteracion
Comandos base:
- `bun run lint`
- `bun run build:www`
- `bun run build:lab`
- `bun run build:dbviz`
- `bun run --filter @stealthis/mcp catalog` (si cambia contenido/schema)
- `bun run build:mcp` (si cambia catalogo o schema)

Smoke tests minimos:
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/`
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/library`
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/`
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/<category>/<slug>`

## Definition of done (global)
Se considera completada la vertical cuando:
- La categoria `database-schemas` existe y se usa en `www`.
- Cada recurso database tiene SQL + ERD + seeds + queries.
- `lab` renderiza SQL + diagrama.
- `dbviz` permite iterar y probar esquemas por comandos.
- Existe pipeline para datos fake.
- Existe integracion Supabase (import/inspect).
- Existe flujo IA con Ollama para generar schemas validos.
