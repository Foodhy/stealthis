# Design Scan — prueba del flujo entero

Resultado de **STL-032**, el criterio de salida del sprint DESIGN SCAN.
Fecha: **2026-08-18**. Modelo: `gemini-flash-lite-latest`.

Tres sitios elegidos por ser opuestos entre sí, no tres variantes del mismo:
un producto oscuro hecho con utilidades, un sitio minimalista de hace treinta
años, y un portal institucional obsesionado con la accesibilidad.

## Lo que salió

| | stealthis.dev | news.ycombinator.com | www.gov.uk |
|---|---|---|---|
| Capturado | 126 KB html · 72 KB css | 33 KB html · 7 KB css | 83 KB html · 390 KB css |
| Colores | 4 | 2 | 47 |
| Niveles tipográficos | 12 | 3 | 12 |
| Radios | 6 | **omitido** | 5 |
| Secciones de prosa | 8/8 | 8/8 | 7/8 |
| Componentes | 11 | 2 | 8 |
| Cubiertos por el catálogo | 11/11 | 2/2 | 7/8 |
| Bloques recreados | 8 | 2 | 6 |
| Colores ajenos tras revestir | 0 | 0 | 0 |
| Contraste AA | 10/10 | 1/1 | 7/7 |
| Valida contra la spec | ✅ limpio | ✅ limpio | ✅ limpio |
| Tiempo | 8,4 s | 4,9 s | 5,4 s |

Que Hacker News dé 2 colores y 3 niveles no es un fallo de extracción: **es su
design system**. Y que su `rounded` salga omitido, con el motivo escrito, es
justo lo que debe pasar en una página que no redondea nada.

## El fallo que encontró esta prueba

**La superficie salía invertida en los sitios oscuros.** `stealthis.dev` es
oscuro y la extracción devolvía `surface: #ffffff`.

La causa: la superficie se elegía contando declaraciones del CSS, y una web
hecha con utilidades trae docenas de `.bg-white` que ganan por frecuencia,
mientras el fondo real se declara una sola vez:

```css
html { background-color: rgb(3 7 18 / var(--tw-bg-opacity, 1)); }
```

Contar declaraciones no es saber qué pinta la página. El efecto se propagaba a
todo lo demás: el contraste daba **0 de 11 pares en AA** (texto gris sobre un
blanco que no existe), la prosa describía una superficie equivocada, y la
recreación vestía los snippets con el fondo contrario al del sitio.

Arreglado en STL-036: el fondo declarado en `html`, `body` o `:root` manda
sobre el recuento, y `on-surface` se elige por contraste real contra esa
superficie en vez de por frecuencia. De paso se arregló el parseo de
`rgb(3 7 18 / var(...))`, que se cortaba en el paréntesis interior.

Después del arreglo, el mismo sitio pasa de **0/11** a **10/10** pares en AA.

## Lo que quedó pobre, sin maquillar

- **`textarea` no tiene equivalente en el catálogo** (gov.uk). Se marca como no
  cubierto, que es la respuesta honesta; forzar un recurso que no encaja haría
  que la recreación pareciera completa sin serlo.
- **La sección `Layout` volvió vacía** en gov.uk. Es variabilidad del modelo, no
  del código: se reporta en `discarded` y el archivo sigue siendo válido. Pasa
  de vez en cuando y no siempre en el mismo sitio.
- **`rem` y `em` se asumen a 16px.** Sin renderizar la página no hay forma de
  saber el tamaño raíz real. Una página que lo cambie producirá una escala
  desplazada.
- **Los colores translúcidos y los de gama ancha no se juzgan** en el informe de
  contraste: su luminancia no se puede calcular sin renderizar, y un número
  inventado sería peor que el silencio.
- **gov.uk emite 47 colores.** Es su paleta real, declarada en variables, pero
  47 tokens son muchos para trabajar a mano. No se recorta porque recortar sería
  decidir por el usuario cuál de sus colores sobra.

## Lo que esta prueba NO cubre

Se ejecutó fuera del navegador, con los mismos módulos que usa la página. Queda
por comprobar a ojo, y hace falta la extensión de Chrome o una sesión manual:

- Errores de consola durante un escaneo real.
- Que los iframes de la recreación pinten bien y ninguna capa descartable salga
  abierta.
- Que **recargar a mitad** reanude — cubierto por los tests del motor, pero no
  visto en pantalla en estos tres sitios.

## Cómo repetirlo

```bash
bun run docs/design-md/check-design-md.ts <archivo>.DESIGN.md
```

El guion que produjo esta tabla vive en el scratchpad de la sesión, no en el
repo: depende de una clave de API y de la red, y no es un test que deba correr
en CI.
