# @stealthis/scan-proxy

Worker que captura el HTML y el CSS de una URL pública para **Design Scan**
(`/design-scan` en `apps/www`). Tarea STL-023.

## Por qué existe

`apps/www` es un build estático y el paso de build borra `_worker.js`, así que no puede hospedar
endpoints. Y el navegador no puede leer un sitio ajeno por CORS. Hace falta algo en medio.

Va **aparte de `apps/mcp`** a propósito: el worker del catálogo no debe llevar dentro un fetcher de
URL arbitraria.

## Uso

**Helper local (Design Scan en stealthis.dev):**

```bash
bun run dev:scan-proxy                    # desde la raíz → http://127.0.0.1:8799
# o sin clonar el repo:
curl -fsSL https://stealthis.dev/design-scan/local-proxy.mjs -o /tmp/stealthis-capture.mjs && node /tmp/stealthis-capture.mjs
```

**Worker en Cloudflare (opcional, despliegue propio):**

```bash
bun run dev:scan-proxy:cf                 # wrangler dev --port 8799
```

```bash
curl "http://127.0.0.1:8799/capture?url=https://example.com/"
```

Respuesta:

```jsonc
{
  "requestedUrl": "https://example.com/",
  "finalUrl":     "https://example.com/",   // tras las redirecciones
  "html":         "<!doctype html>…",
  "inlineStyles": ["body{…}"],              // los <style> del documento
  "stylesheets":  [                          // href resueltos a absoluto
    { "url": "https://example.com/a.css", "css": "…", "bytes": 46459 },
    { "url": "https://example.com/b.css", "css": "",  "bytes": 0, "skipped": "respondió 404" }
  ],
  "bytes": 202909,
  "notes": []                                // recortes y omisiones, en texto
}
```

Una hoja que falla **no tumba la captura**: se devuelve con `skipped` y su motivo.

## Seguridad

Un worker que hace `fetch` a lo que pegue cualquiera es un SSRF abierto y una factura ajena. Las
defensas viven en [`src/guard.ts`](src/guard.ts) y se aplican **en cada salto de redirección**, no
solo en la URL original:

| Defensa | Qué corta |
|---|---|
| Esquema | Solo `http:` y `https:`. Fuera `file:`, `data:`, `gopher:`, `ftp:` |
| Hostname | `localhost`, `*.local`, `*.internal`, `metadata.google.internal` |
| Rango de IP | Loopback, privadas, CGNAT, multicast y **link-local `169.254.169.254`** (metadatos de la nube), en IPv4 e IPv6, incluidas las IPv4 embebidas en IPv6 |
| Resolución DNS | El host se resuelve por DoH y se comprueba que **todas** sus direcciones sean públicas: un dominio que apunta a `127.0.0.1` pasa el filtro de texto y muere aquí |
| Redirecciones | `redirect: "manual"` y revalidación de cada `Location`. Máximo 4 saltos |
| Credenciales | Se rechaza `http://user:pass@host/` |
| CORS | Lista blanca de orígenes. **Nunca `*`** |

**Residuo conocido y aceptado:** entre la resolución DNS y el `fetch` real hay una ventana de
*DNS rebinding*. Cerrarla exigiría fetchear por IP con la cabecera `Host`, que Workers no permite.
Queda escrito aquí en vez de fingir que no existe.

### Límites

Definidos en `LIMITS` ([`src/capture.ts`](src/capture.ts)) y expuestos en `GET /`:

| | |
|---|---|
| HTML | 2 MB |
| Cada hoja de estilo | 1 MB |
| Total de la captura | 8 MB |
| Tiempo por petición | 8 s |
| Hojas descargadas | 20 (el resto se listan sin descargar) |
| Redirecciones | 4 |
| Rate limit | 20 capturas por minuto y por IP |

El corte por tamaño se hace **leyendo el cuerpo**, no mirando `content-length`: esa cabecera es una
promesa del servidor remoto, no un hecho.

El rate limit usa el limitador nativo de Cloudflare declarado en `wrangler.toml` — sin KV ni Durable
Objects. Si el binding no está (dev sin configurar), el endpoint sigue funcionando sin él.

## Tests

```bash
bun test    # desde apps/scan-proxy
```

Cubren el guardia SSRF, que es la parte que no puede fallar en silencio.
