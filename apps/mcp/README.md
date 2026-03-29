# StealThis MCP Server

REST API + MCP server for the StealThis.dev resource library.

- **Production:** `https://mcp.stealthis.dev`
- **Local:** `http://localhost:8787`
- **Guia de funcionamiento:** `./COMO_FUNCIONA.md`

---

## Configuración en clientes MCP

### Claude Code (CLI)

```bash
# Agregar el servidor (una sola vez)
claude mcp add stealthis --transport http https://mcp.stealthis.dev/mcp

# Verificar que está activo
claude mcp list
```

En local durante desarrollo:
```bash
claude mcp add stealthis-local --transport http http://localhost:8787/mcp
```

---

### Claude Desktop

Edita `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "stealthis": {
      "type": "http",
      "url": "https://mcp.stealthis.dev/mcp"
    }
  }
}
```

Reinicia Claude Desktop. Las tools aparecen automáticamente.

---

### Cursor

En **Settings → MCP** (o `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "stealthis": {
      "type": "http",
      "url": "https://mcp.stealthis.dev/mcp"
    }
  }
}
```

---

## Tools disponibles

Una vez configurado, el AI puede llamar estas tools directamente:

| Tool | Descripción |
|------|-------------|
| `list_resources` | Lista todos los recursos. Filtra por `category`, `difficulty`, `tech`. |
| `get_resource` | Metadata completa de un recurso por `slug`. |
| `get_snippet` | Código fuente de un target específico (`html`, `css`, `js`, `react`, `vue`…). |
| `search` | Busca recursos por keyword en título, descripción, tags y tech. |
| `get_lab` | URL del demo full-screen en lab.stealthis.dev. |

### Ejemplos de uso en chat

```
Muéstrame todos los recursos de animaciones web fáciles
→ list_resources(category: "web-animations", difficulty: "easy")

Dame el código React del scroll-fade
→ get_snippet(slug: "scroll-fade", target: "react")

Busca recursos con GSAP
→ search(query: "gsap")

¿Hay demo de glass-card?
→ get_lab(slug: "glass-card")
```

---

## REST API (acceso directo sin MCP)

Para uso desde scripts, `fetch`, o curl:

```bash
# Listar recursos
curl https://mcp.stealthis.dev/tools/list_resources
curl https://mcp.stealthis.dev/tools/list_resources?category=web-animations&difficulty=easy

# Obtener un recurso
curl https://mcp.stealthis.dev/tools/get_resource/scroll-fade

# Obtener snippet de código
curl https://mcp.stealthis.dev/tools/get_snippet/scroll-fade/react
curl https://mcp.stealthis.dev/tools/get_snippet/glass-card/css

# Buscar
curl https://mcp.stealthis.dev/tools/search?q=parallax

# URL del lab
curl https://mcp.stealthis.dev/tools/get_lab/glass-card
```

---

## Desarrollo local

```bash
# 1. Generar el catálogo (solo cuando cambie content)
bun run --filter @stealthis/mcp catalog

# 2. Iniciar el worker
bun run dev:mcp
# → http://localhost:8787
```

> **Nota:** `bun run dev:mcp` NO regenera el catálogo automáticamente.
> Si añades o editas recursos en `packages/content`, ejecuta el paso 1 primero.

---

## Deploy

```bash
bun run --filter @stealthis/mcp catalog  # regenerar catálogo
bun run --filter @stealthis/mcp build    # dry-run
bun run --filter @stealthis/mcp deploy   # wrangler deploy
```

---

## Cómo funciona internamente

- **Protocolo:** MCP Streamable HTTP (`POST /mcp`) — compatible con Claude Code, Claude Desktop, Cursor, y cualquier cliente MCP con soporte HTTP.
- **Datos:** El catálogo (`src/catalog.json`) se genera en build-time con todos los recursos y sus snippets de código. No hay lectura de disco en runtime.
- **Transport:** Sin SSE — las respuestas son JSON síncronas (suficiente para tools sin streaming).
