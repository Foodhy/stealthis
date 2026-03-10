# Como funciona `apps/mcp` (guia rapida)

Este servicio tiene **2 formas de uso**:

1. **MCP real** para clientes AI (Claude, Cursor, etc): `POST /mcp`
2. **REST directo** para scripts/humanos: `GET /tools/*`

Si parecia que "no hay endpoints", normalmente es porque el endpoint principal de MCP no es `GET`, sino **JSON-RPC por `POST /mcp`**.

## Para que sirve

`apps/mcp` expone el catalogo de recursos de StealThis para que un agente AI pueda:

- descubrir recursos (`list_resources`)
- leer metadata (`get_resource`)
- traer codigo listo para copiar (`get_snippet`)
- buscar por keywords (`search`)
- abrir demo lab (`get_lab`)

## Endpoint principal (MCP)

- URL: `https://mcp.stealthis.dev/mcp` (prod) o `http://localhost:8787/mcp` (local)
- Protocolo: JSON-RPC 2.0 sobre HTTP
- Metodos implementados:
  - `initialize`
  - `tools/list`
  - `tools/call`
  - `ping`
  - `notifications/initialized` (sin respuesta, 204)

### Ejemplo minimo: listar tools por MCP

```bash
curl -sS https://mcp.stealthis.dev/mcp \
  -H 'content-type: application/json' \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/list"
  }'
```

### Ejemplo minimo: llamar una tool por MCP

```bash
curl -sS https://mcp.stealthis.dev/mcp \
  -H 'content-type: application/json' \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"get_snippet",
      "arguments":{"slug":"scroll-fade","target":"react"}
    }
  }'
```

## Endpoints REST (directos)

Estos endpoints son utiles para pruebas rapidas, scripts y debugging:

- `GET /`
- `GET /tools/list_resources?category=&difficulty=&tech=`
- `GET /tools/get_resource/:slug`
- `GET /tools/get_snippet/:slug/:target`
- `GET /tools/search?q=...`
- `GET /tools/get_lab/:slug`

Ejemplos:

```bash
curl https://mcp.stealthis.dev/tools/list_resources?category=web-animations&difficulty=easy
curl https://mcp.stealthis.dev/tools/get_resource/scroll-fade
curl https://mcp.stealthis.dev/tools/get_snippet/scroll-fade/react
curl "https://mcp.stealthis.dev/tools/search?q=parallax"
curl https://mcp.stealthis.dev/tools/get_lab/glass-card
```

## Flujo interno de datos

1. El contenido canonico vive en `packages/content/resources/*`.
2. `bun run --filter @stealthis/mcp catalog` ejecuta `scripts/generate-catalog.ts`.
3. Ese script genera `apps/mcp/src/catalog.json` (metadata + snippets embebidos).
4. El Worker (`src/index.ts`) carga ese JSON y responde tools/endpoints sin leer disco en runtime.

## Casos de uso reales

1. **Asistente de codigo**: "Dame un hero en React con animacion" -> tool `search` + `get_snippet`.
2. **Playground interno**: UI propia que consulta `/tools/list_resources` y muestra snippets.
3. **Automatizacion**: script CI que valida que un `slug` exista con `/tools/get_resource/:slug`.
4. **Enlace a demos**: app que usa `get_lab` para abrir demos full-screen en `lab.stealthis.dev`.

## Ejemplos de preguntas y respuestas que entrega

### 1) Descubrir recursos por filtros

Pregunta:

```txt
Muestrame recursos faciles de web-animations hechos con css
```

Tool usada:

```txt
list_resources(category: "web-animations", difficulty: "easy", tech: "css")
```

Respuesta esperada (resumen):

```json
[
  {
    "slug": "scroll-fade",
    "title": "Scroll Fade",
    "category": "web-animations",
    "difficulty": "easy",
    "targets": ["html", "css", "js", "react"],
    "resourceUrl": "https://stealthis.dev/r/scroll-fade"
  }
]
```

### 2) Ver metadata completa de un recurso

Pregunta:

```txt
Que incluye el recurso scroll-fade?
```

Tool usada:

```txt
get_resource(slug: "scroll-fade")
```

Respuesta esperada (resumen):

```json
{
  "slug": "scroll-fade",
  "title": "Scroll Fade",
  "description": "...",
  "category": "web-animations",
  "availableSnippets": ["html", "css", "js", "react"],
  "resourceUrl": "https://stealthis.dev/r/scroll-fade",
  "labUrl": "https://lab.stealthis.dev/web-animations/scroll-fade"
}
```

### 3) Pedir codigo listo para usar

Pregunta:

```txt
Dame el snippet react de scroll-fade
```

Tool usada:

```txt
get_snippet(slug: "scroll-fade", target: "react")
```

Respuesta esperada:

```txt
// Scroll Fade — react
// Source: https://stealthis.dev/r/scroll-fade

import ...
```

### 4) Buscar por keyword

Pregunta:

```txt
Busca recursos de parallax
```

Tool usada:

```txt
search(query: "parallax")
```

Respuesta esperada (resumen):

```txt
Found N result(s) for "parallax":
[
  { "slug": "...", "title": "...", "targets": [...], "resourceUrl": "..." }
]
```

### 5) Obtener URL de demo en lab

Pregunta:

```txt
Hay demo para glass-card?
```

Tool usada:

```txt
get_lab(slug: "glass-card")
```

Respuesta esperada:

```json
{
  "slug": "glass-card",
  "title": "Glass Card",
  "labUrl": "https://lab.stealthis.dev/ui-components/glass-card",
  "resourceUrl": "https://stealthis.dev/r/glass-card"
}
```

### 6) Errores comunes (y mensaje)

- Si el `slug` no existe: `Resource 'slug-x' not found.`
- Si pides target no disponible: `Target 'vue' not available for 'scroll-fade'. Available: html, css, js, react`
- Si buscas sin resultados: `No resources found for query: "..."`.

## Preguntas frecuentes (FAQ)

### Por que `apps/www` no utiliza este endpoint MCP?

Porque `apps/www` consume el contenido directamente desde la coleccion de Astro (`getCollection("resources")`) apuntando a `packages/content/resources/*` como fuente canonica.

Eso evita:

- dependencia de red entre servicios internos
- latencia extra por hacer fetch HTTP a su propio backend
- acoplar el build de `www` a la disponibilidad de `mcp`

En este repo, ambos (`www` y `mcp`) leen del mismo origen (`packages/content`), pero con estrategias distintas:

- `www`: lee la coleccion de contenido de forma directa
- `mcp`: genera `src/catalog.json` y lo sirve por tools/endpoints

### Entonces, cuando si debo usar `POST /mcp`?

Cuando el consumidor es externo al monorepo o es un cliente AI (Claude/Cursor) que necesita tools MCP estandar.

### Que endpoint uso si estoy haciendo scripts simples?

Usa REST (`/tools/*`) porque es mas directo para `curl`/`fetch` y debugging manual.

### Que endpoint uso si quiero compatibilidad MCP real?

Usa `POST /mcp`, con `initialize`, `tools/list` y `tools/call`.

### Por que agregue un recurso y no aparece en MCP?

Porque el catalogo de MCP es generado en build-time. Si cambias contenido en `packages/content`, debes correr:

```bash
bun run --filter @stealthis/mcp catalog
```

Despues reinicia `dev:mcp` o vuelve a hacer build/deploy.

## Desarrollo local

```bash
bun run --filter @stealthis/mcp catalog
bun run dev:mcp
# servidor local: http://localhost:8787
```

Nota: si cambias contenido en `packages/content`, debes regenerar catalogo antes de probar.
