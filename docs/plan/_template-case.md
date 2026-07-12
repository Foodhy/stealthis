---
title: "[Síntoma tal como lo diría un dev]"
description: "[Situación] → diagnóstico, recomendación con complejidad, y alternativas con trade-offs."
sidebar:
  label: "[Síntoma corto]"
playbook:
  area: "[algorithms | frontend-performance | backend-data | runtime | platform-choice | mobile-native]"
  situation: "[una frase]"
  symptoms: ["síntoma 1", "síntoma 2"]
  recommendation: "[solución principal en una palabra/frase]"
  complexity_before: "[O(...) o n/a]"
  complexity_after: "[O(...) o n/a]"
  alternatives: ["alt-1", "alt-2"]
---

## La situación

Describe el escenario como lo vive el dev: qué construyó, qué esperaba, qué está pasando.
2-4 frases, en segunda persona. Sin nombrar tecnologías de solución todavía.

## Diagnóstico: por qué pasa

Explica la causa raíz conectando con el fundamento del área
([link a fundamentals](./fundamentals)). Si aplica Big O, muéstralo aquí:
qué operación es O(n²) y por qué.

## Recomendación

La solución principal, con el porqué antes que el cómo.

**Antes** — O(n²):
```ts
// código problemático real y mínimo
```

**Después** — O(n):
```ts
// código corregido
```

**¿Cuándo importa?** Umbral honesto: "con n < 1.000 la diferencia es de microsegundos;
a partir de ~10.000 items se vuelve perceptible (>100ms)". No vender optimización
prematura.

## Alternativas descartadas (y cuándo SÍ usarlas)

### [Alternativa 1]
- **Qué resuelve:** …
- **Por qué no es la primera opción aquí:** …
- **Cuándo SÍ es la correcta:** … ← obligatorio; toda alternativa tiene su situación

### [Alternativa 2]
- (mismo formato)

## Cómo medir antes y después

Herramienta concreta y pasos: profiler del navegador, `console.time`, EXPLAIN ANALYZE,
React DevTools Profiler, Lighthouse… lo que aplique. Nunca optimizar sin medir.

## Señales de que necesitas otra cosa

Cuándo esta solución se queda corta y cuál es el siguiente nivel
(link al caso o fundamento correspondiente).

## Recursos relacionados

- [Fundamento del área](./fundamentals)
- [Demo en Lab si existe](https://lab.stealthis.dev/...)
- Fuente primaria relevante (MDN/web.dev/docs oficiales)
