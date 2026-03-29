# StyleForge Component Collection Roadmap

> Ultima actualizacion: 2026-03-07
> Alcance: `apps/styleforge` + `apps/www/src/pages/showcase/index.astro` + extensiones del modelo en `packages/content/resources`

## Contexto actual

Hoy StyleForge trabaja con referencias individuales de paginas y componentes. La seleccion actual parte de recursos existentes en StealThis, curados desde `packages/content/resources`, y el showcase principal en `/showcase/` presenta previews individuales de esos recursos.

El siguiente paso del producto es soportar colecciones de componentes derivadas de StealThis: grupos coherentes de piezas que puedan verse juntas, compararse entre si, generarse desde StyleForge, guardarse dentro del proyecto y buscarse como una unidad o por cada componente que las compone.

## Objetivo

Evolucionar StyleForge desde un flujo centrado en referencias individuales hacia un flujo de colecciones de componentes reutilizables, manteniendo la arquitectura actual del monorepo y reutilizando los conceptos existentes de `components` y `pages`.

## Decisiones cerradas

- `packages/content/resources` sigue siendo la fuente canonica para recursos y metadata.
- El surface principal para revisar colecciones es el showcase existente en `apps/www/src/pages/showcase/index.astro`.
- La iniciativa reutiliza las categorias `components` y `pages`; no abre nuevas categorias top-level.
- No se plantea un nuevo workspace package como base inicial de esta linea de trabajo.
- El nuevo documento complementa `apps/styleforge/ROADMAP.md`; no lo reemplaza.

## Modelo conceptual

El producto pasa a manejar dos niveles de informacion:

### Nivel 1: coleccion de componentes

Unidad curada o generada que agrupa varias piezas relacionadas bajo una misma direccion visual, un mismo caso de uso o una misma familia de interfaz.

### Nivel 2: recurso individual

Cada componente o pagina que pertenece a una coleccion y que sigue viviendo en `packages/content/resources` como fuente de verdad.

StyleForge seguira usando referencias actuales de paginas y componentes, pero evolucionara para generar y guardar colecciones completas, no solo elementos sueltos.

## Fase 1 - Definir la coleccion inicial de componentes StealThis

### Objetivo

Definir el primer set de colecciones a partir de los componentes ya usados dentro de paginas actuales y separar claramente que piezas caen bajo `components` y cuales bajo `pages`.

### Alcance

- Auditar recursos existentes en `packages/content/resources`.
- Identificar componentes reutilizables ya presentes dentro de experiencias de pagina.
- Establecer una primera taxonomia operativa de colecciones sin crear nuevas categorias top-level.

### Entregables

- Inventario inicial de colecciones StealThis basado en recursos ya existentes.
- Criterio editorial para clasificar elementos en `components` y `pages`.
- Regla base para relacionar una coleccion con sus recursos individuales.

### Dependencias

- Estado actual de metadata en `packages/content/resources`.
- Curacion actual de referencias en StyleForge para `components` y `pages`.

### Criterio de cierre

La primera tanda de colecciones queda definida con un criterio consistente de pertenencia, cada coleccion referencia recursos existentes del repo y no requiere inventar una nueva categoria global.

## Fase 2 - Expandir Showcase para revisar colecciones

### Objetivo

Ampliar `/showcase/` para que el usuario pueda revisar colecciones completas, expandirlas, colapsarlas y compararlas entre si desde el surface publico existente.

### Alcance

- Mantener el showcase actual como entry point.
- Agregar una vista de coleccion ademas de la vista de recurso individual.
- Incorporar estados de expandir/colapsar y comparacion entre colecciones.

### Entregables

- Modelo de presentacion para colecciones en `apps/www/src/pages/showcase/index.astro`.
- UX definida para ver todos los componentes de una coleccion o solo un subconjunto.
- Flujo de comparacion entre una coleccion y otra sin crear una segunda showcase surface.

### Dependencias

- Fase 1 cerrada con colecciones iniciales identificadas.
- Relacion clara entre coleccion y recursos individuales.

### Criterio de cierre

El showcase puede mostrar colecciones de manera comprensible, permite expandir o colapsar grupos y soporta comparacion entre conjuntos sin romper la navegacion basada en previews individuales.

## Fase 3 - Extender StyleForge para generar colecciones

### Objetivo

Permitir que StyleForge use referencias existentes para proponer y generar varias piezas relacionadas dentro de una misma coleccion, en lugar de limitarse a una lista plana de componentes sugeridos.

### Alcance

- Conservar el input actual de referencias de paginas y componentes.
- Evolucionar draft y finalize para pensar en grupos coherentes.
- Mantener la trazabilidad entre referencias fuente y output generado.

### Entregables

- Definicion funcional de coleccion generada dentro del flujo de StyleForge.
- Reglas para asociar una direccion visual con multiples piezas relacionadas.
- Output esperado donde una coleccion conserva vinculos a referencias `components` y `pages`.

### Dependencias

- Fase 1 para taxonomia inicial.
- Fase 2 para definir como se revisan las colecciones ya generadas.

### Criterio de cierre

StyleForge puede producir una coleccion de componentes relacionada entre si, con trazabilidad hacia referencias existentes y sin abandonar el modelo actual de seleccion de paginas y componentes.

## Fase 4 - Persistir colecciones en el proyecto

### Objetivo

Guardar las colecciones generadas dentro del proyecto usando el modelo actual de contenido y extendiendo el agrupamiento de metadata en `packages/content/resources`.

### Alcance

- Persistir colecciones sin crear un nuevo package Bun dedicado.
- Extender el agrupamiento de metadata para expresar pertenencia a colecciones.
- Mantener a `packages/content/resources` como fuente canonica.

### Entregables

- Estrategia de persistencia basada en el modelo actual del repo.
- Convencion para enlazar colecciones con sus recursos individuales.
- Regla de guardado compatible con `components` y `pages`.

### Dependencias

- Fase 3 cerrada con una definicion clara de coleccion generada.
- Alineacion con el roadmap actual de StyleForge y con `PROGRESS.md`.

### Criterio de cierre

Una coleccion puede guardarse dentro del proyecto sin introducir una nueva categoria top-level ni romper el rol de `packages/content/resources` como fuente de verdad.

## Fase 5 - Habilitar busqueda por coleccion y por componente

### Objetivo

Habilitar descubrimiento interno del catalogo tanto por coleccion completa como por cada componente individual perteneciente a esa coleccion.

### Alcance

- Resolver "search each one" como busqueda interna del catalogo.
- Cubrir consultas por nombre de coleccion y por pieza individual.
- Mantener navegacion consistente entre results de coleccion y results de recurso.

### Entregables

- Criterios de indexacion para colecciones y recursos individuales.
- Experiencia de descubrimiento alineada con el catalogo actual de StealThis.
- Reglas para exponer coincidencias por coleccion y por componente sin duplicar surfaces.

### Dependencias

- Fase 4 cerrada con persistencia real de colecciones.
- Relacion estable entre coleccion y recurso individual.

### Criterio de cierre

El catalogo puede descubrir una coleccion completa o un componente puntual perteneciente a ella, y ambos caminos mantienen contexto suficiente para navegar entre los dos niveles.

## Fuera de alcance de esta linea

- Un backend durable nuevo para jobs o colecciones.
- Un nuevo workspace package dedicado solo a colecciones.
- Un rediseño completo de categorias del repositorio.
- Una segunda showcase surface distinta a `/showcase/` en esta primera implementacion.
- Una especificacion detallada de schemas, payloads o UI final pixel-perfect.

## Alineacion con documentos existentes

- Este roadmap se alinea con `apps/styleforge/ROADMAP.md`, donde StyleForge ya selecciona referencias de paginas y componentes, genera drafts y finaliza kits.
- Este roadmap respeta `PROGRESS.md`, que ya formaliza las categorias `components` y `pages` dentro del proyecto.
- La iniciativa se apoya en recursos ya existentes del repo y ya utilizables como referencias StealThis.

## Supuestos y defaults

- "StealThis components" se interpreta como recursos ya existentes en el repositorio.
- "Search each one" se interpreta como descubrimiento interno del catalogo por coleccion y por componente individual, no como busqueda externa.
- El roadmap se mantiene operativo y por fases; no intenta cerrar de antemano todos los detalles de schema o UI.
