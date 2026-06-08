# Cómo construir una Phase con un workflow multi-agente

Guía reutilizable para que Claude Code (o tú con Claude) construya una fase completa de
recursos del `ROADMAP.md` (Clinic, Gym, Salon, Real Estate, etc.) usando **un workflow
multi-agente** en vez de escribir cada recurso a mano, uno por uno.

> Esto documenta exactamente el proceso que usamos para terminar la **Phase 29 (Clinic)**.
> Cópialo y adáptalo para cualquier fase nueva.

---

## TL;DR — el flujo en 6 pasos

1. **Lee el patrón** — abre un recurso terminado de la colección y copia su estructura.
2. **Saca la lista de trabajo** — qué slugs faltan, cuáles tienen `index.mdx` pero sin snippets.
3. **Verifica el cableado** (wiring) — la colección debe existir en schema + config + collections + i18n.
4. **Lanza el workflow** — un agente por recurso, en paralelo (ver script abajo).
5. **Valida** — que todos los recursos cargan; regenera el catálogo MCP.
6. **Actualiza el ROADMAP** — marca los checkboxes y la nota de progreso.

El disparador es decirle a Claude algo como:

> "usa un workflow para terminar la Phase 30 del ROADMAP"

La palabra clave **workflow** (o "fan out agents", "multi-agente") es la que autoriza a
Claude a usar la herramienta `Workflow`. Sin esa señal explícita, Claude lo hará a mano.

---

## Cómo funcionan los multi-agentes (mecánica)

No son varias sesiones de Claude abiertas a mano. Es **un único script de orquestación**
(JavaScript) que Claude escribe y lanza con **una sola** llamada a la herramienta `Workflow`.
Ese script corre en un runtime del harness que expone una función clave: **`agent(prompt)`** —
cada llamada **genera un subagente** (un Claude independiente, con su propio contexto limpio)
que ejecuta ese prompt y devuelve un resultado.

El patrón "uno por recurso, todos en paralelo" es:

```js
// SPECS = array con un objeto por recurso (slug, título, qué construir…)
const results = await parallel(
  SPECS.map((s) => () =>
    agent(buildPrompt(s), {           // ← cada agent() = 1 subagente Claude
      label: s.slug,                  //   nombre visible en /workflows
      agentType: 'general-purpose',   //   para que tenga la tool Write
      schema: RESULT,                 //   lo obliga a devolver JSON validado
    })
  )
)
```

Tres piezas:

1. **`agent(prompt, opts)`** — lanza un subagente. Recibe un prompt grande (sistema de diseño
   + spec del recurso), escribe sus archivos con `Write` y devuelve `{ slug, files, summary }`.
2. **`SPECS.map(s => () => agent(...))`** — convierte los N specs en N *thunks* (funciones sin
   ejecutar todavía; por eso el `() =>`).
3. **`parallel([...])`** — los dispara **todos a la vez**. El runtime limita a ~16 concurrentes;
   el resto espera turno. (Para varias *etapas* por item, usa `pipeline()` en vez de `parallel`.)

### Leer la pantalla de `/workflows`

```
Phases — Generate 19/24                                    ← 19 de 24 subagentes terminados
✓ clinic-prescription-…  Opus 4.8                          ← cacheado (resume) · 0 tokens
✓ clinic-dispense-queue  Opus 4.8 · 119.4k tok · 42 tools  ← corrió en vivo
● clinic-landing-general Opus 4.8 · 46.4k tok · 7 tools    ← gris = en progreso
```

- **✓ sin tokens** → devuelto de caché por un *resume* (ya estaba hecho).
- **✓ con tokens** → corrió en vivo; `tok`/`tools` = lo que consumió ese subagente.
- **● gris** → trabajando en ese momento.

### Resume (retomar tras un corte)

Si el workflow se corta a la mitad (p. ej. **límite de sesión**), no hay que rehacer todo.
Cada `agent()` exitoso queda cacheado; reanudar con el **mismo script** re-ejecuta solo los que
fallaron (devolvieron `null`) y devuelve el resto al instante:

```
Workflow({ scriptPath: "<ruta al script .js>", resumeFromRunId: "<run id previo>" })
```

El `scriptPath` y el `runId` los imprime la herramienta `Workflow` al lanzarse. Mismo script +
mismos args → 100% cache hit. (Así recuperamos los 15 recursos que el límite de sesión cortó en
la Phase 29 sin re-generar los 9 ya hechos.)

### Por qué esto y no a mano

- **Velocidad de reloj**: N recursos en paralelo ≈ el más lento, no la suma de los N.
- **Aislamiento**: cada subagente tiene contexto limpio enfocado en *un* recurso → no se desvía.
- **Determinismo**: qué se hace, en qué orden y los reintentos los decide el script, no el modelo.
- **Costo**: lanza decenas de agentes → muchos tokens. Vale para 20+ recursos; para 1-3, a mano.

> ⚠️ **Opt-in obligatorio**: Claude solo usa `Workflow` si se lo pides explícitamente con la
> palabra "workflow"/"multi-agente". Es por diseño, para no gastar tokens sin que lo autorices.

---

## Anatomía de un recurso

Todo recurso vive en `packages/content/resources/<slug>/`:

```
packages/content/resources/<slug>/
├── index.mdx                # frontmatter (metadata Zod) + prosa
└── snippets/
    ├── html.html            # documento completo, enlaza style.css y script.js
    ├── style.css            # :root variables primero, responsive
    └── script.js            # vanilla JS, sin librerías
```

El frontmatter debe cumplir el esquema Zod en `packages/schema/src/schema.ts`
(`ResourceMetaSchema`). Campos clave:

```yaml
---
slug: <slug>
title: "<Tema> — <Título>"
description: "<una línea, 55-90 palabras, sin comillas dobles internas>"
category: pages            # o ui-components, etc. (ResourceCategorySchema)
type: page                 # pages→page, ui-components→component (ResourceTypeSchema)
tags: [<colección>, ...]
tech: [html, css, vanilla-js]
difficulty: med            # easy | med | hard
targets: [html]
collections: [<colección>] # debe estar en ResourceCollectionSchema
labRoute: /<category>/<slug>
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-08
updatedAt: 2026-06-08
---
```

**Regla del cuerpo**: termina con el disclaimer de la colección si aplica, p. ej. en Clinic:

```
> Illustrative UI only — **not** intended for real medical use.
```

El recurso de referencia ("gold standard") para Clinic es
`packages/content/resources/clinic-appointment-list/` — ábrelo para ver el nivel de pulido
esperado: paleta en `:root`, fuente Inter, datos realistas, badges, micro-interacciones y un
`script.js` que de verdad funciona.

---

## Paso 1 — Lee el patrón

```bash
# Estructura y snippets de un recurso terminado
ls packages/content/resources/<slug-terminado>/snippets/
cat packages/content/resources/<slug-terminado>/index.mdx
cat packages/content/resources/<slug-terminado>/snippets/{html.html,style.css,script.js}
```

Copia la paleta `:root`, la fuente y las convenciones (reset box-sizing, toast helper,
`@media (max-width:520px)`, aria, etc.).

## Paso 2 — Saca la lista de trabajo

Cuidado: un directorio `snippets/` puede existir pero estar **vacío** (el recurso está
"scaffolded" pero incompleto). Cuenta solo archivos reales:

```bash
cd packages/content/resources
for d in <prefijo>-*; do
  n=$(/bin/ls "$d/snippets" 2>/dev/null | grep -E '\.(html|css|js)$' | wc -l | tr -d ' ')
  has=$([ -f "$d/index.mdx" ] && echo mdx || echo "NO-mdx")
  echo "$d: snippets=$n $has"
done
```

- `snippets=3` → completo, **no tocar**.
- `snippets=0` + `mdx` → faltan snippets (no sobreescribir el mdx).
- `snippets=0` + `NO-mdx` → recurso nuevo de cero.

Cruza esto con la tabla de la fase en `ROADMAP.md` (los `[ ]` vs `✅`).

## Paso 3 — Verifica el cableado de la colección

Una colección nueva (`gym`, `salon`, `realestate`…) debe añadirse en **4 sitios** antes de
que los recursos carguen. Si la colección ya existe (como `clinic`), salta este paso.

```bash
grep -n "<colección>" packages/schema/src/schema.ts          # ResourceCollectionSchema enum
grep -n "<colección>" apps/www/src/content/config.ts          # enum del content collection
grep -n "<colección>" apps/www/src/lib/collections.ts         # tarjeta (id, titleKey, descKey, accentToken)
grep -n "<colección>" apps/www/src/i18n/index.ts              # collection.<col>.title/.desc
```

Si falta, añádelo en los 4 (incluye `accentToken` en `collections.ts`).

**Sobre i18n / idiomas**: `apps/www` declara ~15 locales en `astro.config.mjs`
(`en, es, fr, ja, ms, hi, ko, nl, de, pt-br, zh-hk, zh-cn, it, pl, uk`), pero solo 6 tienen
mapa de traducción completo en `i18n/index.ts`: **`en, es, fr, ja, de, it`**. La función `t()`
**cae a inglés** si falta una clave (`ui[locale][key] ?? ui[en][key] ?? key`). Por eso, para una
colección nueva basta con añadir `collection.<col>.title` y `.desc` al mapa **`en`** (obligatorio,
es el fallback) y al **`es`** (rutas en español); los demás idiomas caen a inglés solos. Es lo que
hizo `clinic`. Si quieres traducción real en fr/ja/de/it, añade también las claves a esos mapas.

## Paso 4 — Lanza el workflow

Un **agente por recurso**, en paralelo. Como cada agente escribe en un directorio distinto,
**no** hay conflicto de archivos → no se necesita aislamiento por worktree.

Estructura del script (ver plantilla completa en
[`docs/templates/phase-build.workflow.js`](docs/templates/phase-build.workflow.js)):

- Un string `STYLE` con el sistema de diseño compartido (paleta, fuente, accesibilidad).
- Un array `SPECS` con un objeto por recurso: `{ slug, title, category, difficulty, build, ... }`.
  - `build` = descripción detallada de qué construir (entre más específico, mejor el resultado).
  - `mdxExists: true` para los que ya tienen `index.mdx` (el agente solo escribe snippets).
  - `palette: "..."` para landings temáticos que usan otra paleta.
- `parallel(SPECS.map(s => () => agent(buildPrompt(s), { schema, agentType: 'general-purpose' })))`.
- Cada agente devuelve `{ slug, files, summary }` (structured output).

Claude lo lanza con la herramienta `Workflow`. Corre en segundo plano; míralo con `/workflows`.

**Importante**: usa `agentType: 'general-purpose'` para que el agente tenga la tool `Write`.

## Paso 5 — Valida y regenera el catálogo

```bash
# ¿Cuántos quedaron completos?
cd packages/content/resources
c=0; for d in <prefijo>-*; do n=$(/bin/ls "$d/snippets" 2>/dev/null | grep -Ec '\.(html|css|js)$'); [ "$n" = 3 ] && c=$((c+1)); done; echo "$c completos"

# Regenera el catálogo MCP (obligatorio cuando cambia el contenido)
bun run --filter @stealthis/mcp catalog

# (opcional) lint
bun run lint
```

## Paso 6 — Actualiza el ROADMAP

- Marca cada `[ ]` → `✅` en la tabla de la fase.
- Actualiza la nota **Progress (fecha)** con qué quedó hecho y qué falta.
- Cambia el estado de la fase (`🚧 IN PROGRESS` → `✅ DONE`) si se completó.

---

## Plantilla del script de workflow

La plantilla parametrizada vive en
[`docs/templates/phase-build.workflow.js`](docs/templates/phase-build.workflow.js).
Para una fase nueva: copia el archivo, cambia `BASE` (no cambia), el `STYLE` de la colección,
y rellena el array `SPECS` con los recursos de la fase desde el `ROADMAP.md`.

---

## Notas y gotchas

- **`gray-matter` parsea fechas YAML como `Date`** — por eso el schema usa
  `z.union([z.string(), z.date()])`. Usa fechas `YYYY-MM-DD` sin comillas.
- **No uses `t(\`key.${var}\`)` dentro de plantillas Astro** — `<typeof t>` se parsea como tag HTML.
- **El catálogo MCP es un JSON estático** (`apps/mcp/src/catalog.json`); hay que regenerarlo
  cada vez que cambia el contenido, si no, el MCP server queda desactualizado.
- **Opt-in del workflow**: Claude solo usa la herramienta `Workflow` si se lo pides
  explícitamente (palabra "workflow"/"multi-agente"). Para tareas pequeñas no hace falta.
- **Costo**: un workflow lanza decenas de agentes en paralelo — rápido en reloj, pero consume
  bastantes tokens. Vale la pena para 20+ recursos; para 1-3, hazlo a mano.
