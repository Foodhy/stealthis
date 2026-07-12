---
title: "Cruzas dos listas y va lento"
description: "Buscar dentro de un loop es O(n²) sin que lo parezca. Diagnóstico, solución con Map en O(n), umbrales reales y alternativas con trade-offs."
sidebar:
  label: "Cruzar dos listas va lento"
playbook:
  area: "algorithms"
  situation: "Combinar dos arrays (ej. orders con users) se vuelve lento al crecer los datos"
  symptoms: ["página tarda al cargar datos", "función que 'antes era instantánea' ahora tarda segundos", "CPU al 100% procesando arrays"]
  recommendation: "index-with-map"
  complexity_before: "O(n·m)"
  complexity_after: "O(n+m)"
  alternatives: ["join-en-db", "web-worker", "dejar-como-esta"]
---

## La situación

Tienes dos listas — por ejemplo `orders` y `users` — y necesitas combinar cada orden con
su usuario. Escribiste algo natural con `.find()`, funcionó perfecto en desarrollo con
50 registros, y hoy con 5.000 órdenes y 2.000 usuarios la página se queda pensando un
par de segundos. No cambiaste nada; solo crecieron los datos.

## Diagnóstico: por qué pasa

```ts
const enriched = orders.map((order) => ({
  ...order,
  user: users.find((u) => u.id === order.userId), // ← búsqueda O(m) …
}))                                                //   dentro de un loop O(n)
```

`.find()` recorre el array hasta encontrar el elemento: **O(m)** en promedio. Al llamarlo
dentro de un `.map()` sobre `orders`, el costo total es **O(n·m)**. Con 5.000 órdenes ×
2.000 usuarios son hasta 10.000.000 de comparaciones — por eso lo que era instantáneo
ahora tarda. El problema no es JavaScript ni tu framework: es la forma del algoritmo
(ver [Fundamentos: Big O en JS](./fundamentals)).

La trampa es que `orders.map(...).find(...)` no *parece* un doble loop anidado, pero lo es.
Lo mismo aplica a `.filter()`, `.includes()`, `.indexOf()` o `.some()` dentro de cualquier
iteración.

## Recomendación: indexa primero con un Map

Construye una vez un índice `id → user` y consulta en O(1):

**Antes** — O(n·m):
```ts
const enriched = orders.map((order) => ({
  ...order,
  user: users.find((u) => u.id === order.userId),
}))
```

**Después** — O(n+m):
```ts
const usersById = new Map(users.map((u) => [u.id, u])) // O(m), una sola vez

const enriched = orders.map((order) => ({
  ...order,
  user: usersById.get(order.userId) ?? null,            // O(1) por lookup
}))
```

Con 5.000 × 2.000 pasas de ~10M de operaciones a ~7.000. En la práctica: de segundos
a milisegundos.

**¿Cuándo importa?** Sé honesto contigo mismo antes de refactorizar:
- **n·m < ~100.000** (ej. 300 × 300): la diferencia son microsegundos. Déjalo legible.
- **n·m entre 10⁵ y 10⁶:** empieza a ser perceptible (decenas de ms). Vale el Map si
  el código corre en cada render o interacción.
- **n·m > 10⁶:** el Map es obligatorio; sin él bloqueas el hilo principal.

El mismo patrón aplica a membresía: si haces `arr.includes(x)` dentro de un loop,
convierte `arr` en un `Set` primero (`set.has(x)` es O(1)).

## Alternativas descartadas (y cuándo SÍ usarlas)

### Hacer el JOIN en la base de datos
- **Qué resuelve:** la DB combina las tablas con sus índices y te llega el dato ya unido;
  además dejas de transferir dos datasets completos por la red.
- **Por qué no es la primera opción aquí:** este caso asume que ya tienes ambas listas en
  el cliente (o vienen de APIs distintas). Si puedes cambiar el backend, hazlo — pero es
  un cambio de contrato de API, no un fix local.
- **Cuándo SÍ es la correcta:** siempre que controles el backend y los datos vivan en la
  misma DB. De hecho, si estás trayendo 5.000 órdenes al cliente para cruzarlas, la
  pregunta real puede ser otra → ver [Mi endpoint tarda](../backend-data/case-slow-endpoint).

### Mover el cruce a un Web Worker
- **Qué resuelve:** que el cálculo no congele la UI mientras corre.
- **Por qué no es la primera opción aquí:** el worker no hace el trabajo más rápido, solo
  lo saca del hilo principal — y serializar dos arrays grandes hacia el worker tiene su
  propio costo. Arregla primero el algoritmo: O(n+m) probablemente ya no necesita worker.
- **Cuándo SÍ es la correcta:** cuando el trabajo sigue siendo pesado *después* de
  optimizar el algoritmo (parsing de archivos grandes, cálculos numéricos reales) →
  ver [La UI se congela](../frontend-performance/case-frozen-ui).

### Dejarlo como está
- **Qué resuelve:** legibilidad máxima, cero riesgo de regresión.
- **Por qué no es la primera opción aquí:** el caso parte de que ya notas la lentitud.
- **Cuándo SÍ es la correcta:** n·m pequeño y estable (listas de configuración, catálogos
  fijos). Optimizar eso es complejidad gratis en la dirección equivocada.

## Cómo medir antes y después

```ts
console.time('enrich')
const enriched = /* … */
console.timeEnd('enrich') // enrich: 2340ms → enrich: 4ms
```

Para verlo en contexto real: DevTools → pestaña Performance → graba la interacción y
busca el bloque largo amarillo (scripting) con tu función en el flame chart. Mide antes
y después; si la mejora no aparece en el perfil, la optimización no era ahí.

## Señales de que necesitas otra cosa

- Los datos ya no caben cómodos en memoria o tardan en llegar por red → el cruce debe
  ocurrir en el backend ([Backend/DB: fundamentos](../backend-data/fundamentals)).
- Después del Map sigue lento porque el trabajo por item es pesado (no el lookup) →
  workers o chunking ([Runtime: fundamentos](../runtime/fundamentals)).
- Necesitas buscar por texto, no por id exacto → es otro problema
  ([Necesito buscar/filtrar](./case-search-filter)).

## Recursos relacionados

- [Fundamentos: Big O y complejidad de operaciones en JS](./fundamentals)
- MDN — [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map): semántica y rendimiento de lookups por clave
