---
title: "[Concepto] — Fundamentos"
description: "El modelo mental de [concepto], con tabla de referencia y fuentes primarias. Base de los casos del área."
sidebar:
  label: "Fundamentos"
  order: 0
playbook:
  area: "[área]"
  type: "fundamentals"
  covers: ["concepto-1", "concepto-2"]
---

## Qué es y por qué te afecta

Explica el concepto sin asumir formación previa en CS. Ancla con un ejemplo cotidiano
de código que el lector ya escribió sin saber que este concepto estaba detrás.

## El modelo mental

El diagrama o narrativa que hace clic. Puede ser ASCII art, un diagrama Mermaid si
Starlight lo soporta, o una analogía bien elegida. Esta sección es la que el lector
debe poder reconstruir de memoria.

## Tabla de referencia

La tabla que el lector volverá a consultar. Ejemplos según el área:

- Algorithms: complejidad de operaciones comunes en JS

| Operación | Estructura | Complejidad |
| --- | --- | --- |
| `arr.find(x)` | Array | O(n) |
| `map.get(k)` | Map | O(1) |
| `set.has(x)` | Set | O(1) |
| `arr.includes(x)` | Array | O(n) |
| `arr.sort()` | Array | O(n log n) |

- Runtime: fases del event loop y qué corre en cada una
- Backend: tipos de índice y qué queries aceleran

## Cómo se conecta con los casos

Lista de los casos del área, cada uno con la frase-síntoma:
- [Caso 1](./case-...) — "…"
- [Caso 2](./case-...) — "…"

## Fuentes primarias

Links a MDN, web.dev, docs oficiales (Node, Postgres, React Native), charlas canónicas.
Preferir fuentes primarias sobre blogs. Cada fuente con una línea de qué aporta.
