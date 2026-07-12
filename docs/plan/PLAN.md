# PLAN — Sección "Playbooks" (casos de uso → recomendación) para StealThis.dev

## Objetivo
Agregar guías orientadas a SITUACIONES, no a tecnologías. El lector llega con un problema
("mi lista de 10k items va lenta", "no sé si hacer web o app nativa", "mi endpoint tarda 3s")
y sale con: diagnóstico → recomendación fundamentada → código → complejidad (Big O cuando
aplica) → alternativas descartadas y sus trade-offs.

La tecnología es la CONSECUENCIA de la recomendación, nunca el punto de partida.

## Principio de estructura: general primero, específico después
Cada área abre con una página de **Fundamentos** (concepto general con fuentes: MDN,
web.dev, papers/docs oficiales) y luego páginas de **Casos** que aplican ese fundamento
a situaciones concretas. Ejemplo: primero "Cómo funciona el event loop" (fundamento),
después "Mi UI se congela al procesar un archivo grande" (caso que lo aplica).

## Estructura en docs (Starlight)

```
src/content/docs/playbooks/
├── index.md                          # Cómo usar los playbooks + índice de síntomas
│
├── algorithms/                       # ÁREA 1 — Algoritmos y estructuras de datos
│   ├── fundamentals.md               # Big O explicado con fuentes; tabla de complejidades
│   │                                 # de operaciones comunes en JS (Array, Map, Set, Object)
│   ├── case-lookup-in-loops.md       # "Cruzo dos listas y va lento" → .find() en loop O(n²)
│   │                                 # vs Map O(n); cuándo NO importa (n pequeño)
│   ├── case-search-filter.md         # "Necesito buscar/filtrar" → includes O(n) vs índice
│   │                                 # invertido vs backend vs motor de búsqueda; umbrales
│   ├── case-sorting-ranking.md       # "Ordeno/rankeo datos" → sort O(n log n), top-k con
│   │                                 # heap, cuándo ordenar en DB vs cliente
│   └── case-dedup-counting.md        # "Duplicados/conteos" → Set/Map O(n) vs nested loops
│
├── frontend-performance/             # ÁREA 2 — Performance frontend
│   ├── fundamentals.md               # Pipeline de render del navegador, re-renders de React,
│   │                                 # Core Web Vitals (fuentes: web.dev, MDN)
│   ├── case-large-lists.md           # "Lista de miles de items" → virtualización, paginación,
│   │                                 # windowing; cuándo cada una
│   ├── case-janky-input.md           # "El input se traba al escribir" → debounce/throttle,
│   │                                 # useDeferredValue, trabajo fuera del render
│   ├── case-slow-images.md           # "Imágenes pesadas" → formatos, lazy loading, srcset, CDN
│   └── case-frozen-ui.md             # "La UI se congela en cálculos" → Web Workers, chunking,
│   │                                 # requestIdleCallback (conecta con runtime/fundamentals)
│
├── backend-data/                     # ÁREA 3 — Backend, DB y escala
│   ├── fundamentals.md               # Cómo ejecuta una query la DB, índices B-tree, qué es
│   │                                 # un query plan (fuentes: docs Postgres, Use The Index Luke)
│   ├── case-slow-endpoint.md         # "Mi endpoint tarda" → N+1 (O(n) queries → 1-2),
│   │                                 # índices, EXPLAIN, paginación keyset vs offset
│   ├── case-repeated-reads.md        # "Leo lo mismo mil veces" → capas de cache (memoria,
│   │                                 # Redis, HTTP/CDN), invalidación, trade-offs de staleness
│   ├── case-heavy-jobs.md            # "Tareas pesadas bloquean requests" → colas y background
│   │                                 # jobs; cuándo basta un setImmediate y cuándo necesitas cola
│   └── case-growing-traffic.md       # "Crece el tráfico" → escala vertical vs horizontal,
│                                     # stateless, rate limiting, qué medir antes de escalar
│
├── runtime/                          # ÁREA 4 — Runtime: event loop, workers, concurrencia
│   ├── fundamentals.md               # Event loop (browser y Node), microtasks vs macrotasks,
│   │                                 # por qué JS "single-threaded" no significa "sin concurrencia"
│   │                                 # (fuentes: MDN, docs Node.js, charla "What the heck is
│   │                                 # the event loop anyway")
│   ├── case-blocking-cpu.md          # "Cálculo CPU-bound bloquea todo" → Web Workers /
│   │                                 # worker_threads, costo de serialización, cuándo NO usarlos
│   └── case-async-patterns.md        # "Muchas operaciones async" → Promise.all vs allSettled
│                                     # vs secuencial, límites de concurrencia (p-limit), backpressure
│
├── platform-choice/                  # ÁREA 5 — Elección de plataforma/stack
│   ├── fundamentals.md               # Criterios de decisión: equipo, tiempo, presupuesto,
│   │                                 # requisitos nativos, SEO, offline; matriz de decisión
│   ├── case-new-product.md           # "Empiezo un producto" → web vs PWA vs híbrido vs nativo,
│   │                                 # árbol de decisión con situaciones reales
│   └── case-internal-tool.md         # "Herramienta interna/dashboard" → qué priorizar distinto
│                                     # a un producto público (velocidad > polish, auth, tablas)
│
└── mobile-native/                    # ÁREA 6 — Mejoras nativas en mobile
    ├── fundamentals.md               # Puente RN/JSI, hilo JS vs hilo UI, por qué las animaciones
    │                                 # se traban (fuentes: docs React Native/Expo, Reanimated)
    ├── case-janky-animations.md      # "Animaciones a tirones" → Reanimated/hilo UI vs Animated
    │                                 # JS-driven; qué corre en cada hilo
    ├── case-long-lists-mobile.md     # "Listas largas en mobile" → FlashList vs FlatList,
    │                                 # getItemLayout, imágenes en listas
    └── case-offline-sync.md          # "Debe funcionar offline" → persistencia, cola de
                                      # mutaciones, resolución de conflictos, trade-offs
```

Total v1: 6 fundamentos + 18 casos. Plantillas: `_template-fundamentals.md` y
`_template-case.md` (no se publican).

## Formato obligatorio

### Páginas de Fundamentos
1. Qué es y por qué te afecta (sin asumir CS previo)
2. El modelo mental (diagramas si Starlight lo permite, o ASCII)
3. Tabla de referencia (ej: complejidad de operaciones JS; fases del event loop)
4. Fuentes primarias al final (MDN, web.dev, docs oficiales, con links)
5. Links a los casos del área

### Páginas de Caso
1. **La situación** — descrita como la viviría el dev ("tienes X, pasa Y")
2. **Diagnóstico** — por qué pasa, conectando con el fundamento del área
3. **Recomendación principal** — con código antes/después y complejidad (O(n²) → O(n))
   cuando aplique; números de umbral honestos ("con n < 1.000 no lo notarás")
4. **Alternativas descartadas** — cada una con: qué resuelve, por qué no es la primera
   opción aquí, y en qué situación SÍ sería la correcta (trade-offs explícitos)
5. **Cómo medir** — antes de optimizar: profiler, EXPLAIN, React DevTools, etc.
6. **Señales de que necesitas otra cosa** — cuándo este caso escala al siguiente nivel
7. **Recursos relacionados** en Library/Lab

Frontmatter estructurado para MCP/agentes:
```yaml
playbook:
  area: "frontend-performance"
  situation: "Lista de miles de items renderiza lento"
  symptoms: ["scroll lag", "high memory", "slow initial render"]
  recommendation: "virtualization"
  complexity_before: "O(n) nodos en DOM"
  complexity_after: "O(visible) nodos en DOM"
  alternatives: ["pagination", "infinite-scroll", "server-side-filtering"]
```

## Sidebar (Starlight)
Grupo "Playbooks" con sub-grupos por área (autogenerate por directorio). Ubicar arriba,
después de Getting Started — es contenido diferenciador.

## Home (stealthis.dev)
Sección "When you're stuck" / "Playbooks" entre "Browse by Category" y el roadmap:
- Formato: tarjetas de SÍNTOMA, no de tecnología. Ej: "Tu lista de 10.000 items va lenta →",
  "Tu endpoint tarda 3 segundos →", "¿Web, PWA o app nativa? →", "La UI se congela →"
- Cada tarjeta linkea a su caso en docs
- Reutilizar design tokens/componentes existentes de la home

## Orden de implementación
1. Plantillas + index + área algorithms completa (fundamento + 4 casos) — commit
2. runtime/ (es la base conceptual de frontend-performance y backend) — commit
3. frontend-performance/ — commit
4. backend-data/ — commit
5. platform-choice/ + mobile-native/ — commit
6. Sidebar en Starlight — commit
7. Sección "Playbooks" en la home — commit
8. Links cruzados desde Choose Your Path y Recommendations

## Criterios de calidad
- Cada caso parte de la situación, nunca del nombre de una librería
- Big O siempre que aplique, con umbrales honestos de cuándo importa y cuándo no
- Toda alternativa descartada incluye la situación en la que SÍ sería la correcta
- Fundamentos citan fuentes primarias (MDN, web.dev, docs oficiales de Node/Postgres/RN)
- Sección "Cómo medir" obligatoria: nunca recomendar optimizar sin medir primero
- Idioma consistente con los docs existentes
