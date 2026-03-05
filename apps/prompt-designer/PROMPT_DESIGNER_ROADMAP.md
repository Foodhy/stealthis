# Prompt Designer Roadmap (Migracion desde lead-dialogue-builder)

## Progreso
- [x] Fase 1 completada
- [x] Fase 2 completada
- [x] Fase 3 completada
- [ ] Fase 4 en progreso

## Objetivo
- Migrar el proyecto existente `lead-dialogue-builder` hacia `prompt-designer`.
- Priorizar la migracion de componentes y paginas ya funcionales antes de agregar nuevas features.
- Mantener paridad funcional en flujo principal de prompts y configuracion.
- Excluir `Adri Stats` del alcance inicial.

## Alcance Inicial (MVP de migracion)
- Prompts (listado + editor + detalle).
- Nueva fuente.
- Probar endpoints.
- Valores.
- Configuracion.
- Changelog (si ya esta estable y no bloquea la migracion principal).

## Fuera de alcance por ahora
- Adri Stats.
- Nuevos modulos no existentes en `lead-dialogue-builder`.
- Refactors grandes de arquitectura que no sean necesarios para migrar.

## Inventario base a migrar

### Paginas origen
- `src/pages/Index.tsx` (Prompts).
- `src/pages/NewDataSource.tsx` (Nueva fuente).
- `src/pages/TestEndpoints.tsx` (Probar endpoints).
- `src/pages/Values.tsx` (Valores).
- `src/pages/Settings.tsx` (Configuracion).

### Componentes clave
- `PromptGrid`, `PromptEditor`, `PromptSection`, `VariablePanel`.
- `AgentTester` y componentes de `ApiTester/*`.
- `Navbar`, `MarkdownEditor`, `FullscreenEditor`.

### Servicios y tipos
- `services/promptService.ts`
- `services/informationSourceService.ts`
- `services/valuesService.ts`
- `services/apiConfigService.ts`
- `services/localStorageService.ts`
- `types/dataSource.ts`

## Plan por fases

### Fase 1 - Base de migracion
- [x] Definir estructura de carpetas destino para pages/components/services/types.
- [x] Migrar router y layout principal para soportar:
  - [x] `/prompts`
  - [x] `/nueva-fuente`
  - [x] `/probar-endpoints`
  - [x] `/valores`
  - [x] `/configuracion`
- [x] Migrar `Navbar` con tabs equivalentes.
- [x] Quitar/ocultar tab `Adri Stats`.

### Fase 2 - Migracion de componentes core de Prompts
- [x] Migrar `PromptGrid` y vista de listado.
- [x] Migrar `PromptEditor` + secciones de markdown.
- [x] Migrar panel de variables y toolbar/editor en fullscreen.
- [x] Validar estado local y persistencia basica con servicios actuales.

### Fase 3 - Migracion por paginas funcionales
- Nueva fuente:
  - [x] Migrar formulario y flujo de alta/edicion de fuente.
  - [x] Reusar `informationSourceService` y `types/dataSource`.
- Probar endpoints:
  - [x] Migrar `AgentTester` + `ApiTester`.
  - [x] Validar request/response panel y snippets.
- Valores:
  - [x] Migrar CRUD y visualizacion de valores.
  - [x] Reusar `valuesService`.
- Configuracion:
  - [x] Migrar pantalla de ajustes y configuraciones de API.
  - [x] Reusar `apiConfigService`.

### Fase 4 - Cierre de migracion
- [x] Revisar paridad visual/funcional con `lead-dialogue-builder`.
- [ ] Limpiar codigo no usado despues de migrar.
- [x] Documentar diferencias intencionales (si aplica).
- [x] Preparar backlog de mejoras post-migracion (sin incluir Adri Stats).

## Criterios de aceptacion de migracion
- Navegacion completa entre Prompts, Nueva fuente, Probar endpoints, Valores y Configuracion.
- Flujos CRUD principales funcionando con los servicios migrados.
- Sin referencias activas a Adri Stats en rutas, navbar o layout.
- Compilacion limpia del app `prompt-designer`.

## Riesgos y mitigaciones
- Riesgo: dependencias de estado global entre componentes migrados.
- Mitigacion: migrar por modulo, validando cada pagina de forma aislada.

- Riesgo: servicios acoplados a estructuras antiguas.
- Mitigacion: crear adaptadores pequenos en lugar de reescribir todo al inicio.

- Riesgo: regresion visual en editor/markdown.
- Mitigacion: migrar primero componentes de UI compartidos y luego paginas.

## Orden recomendado de ejecucion
1. Navbar + routing base.
2. Prompts (listado/editor).
3. Nueva fuente.
4. Probar endpoints.
5. Valores.
6. Configuracion.
7. Changelog (opcional, si no bloquea el MVP).
