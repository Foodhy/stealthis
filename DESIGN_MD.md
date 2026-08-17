# DESIGN.md — spec anclada y mapeo para Design Scan

Documento de referencia de **STL-022**. Fija qué versión de la spec seguimos, decide cómo la
consumimos desde el navegador, y escribe el mapeo de *lo que se extrae de una página* → *cada
grupo de tokens*. Lo leen STL-027 (extracción), STL-028 (cuerpo con el modelo) y STL-029
(visor y exportación).

---

## 1. Qué es y por qué lo adoptamos

`DESIGN.md` es un formato abierto de Google Labs (Apache-2.0) para describir un design system
completo en un solo archivo de texto plano, legible por personas y por agentes. Dos capas:

- **Frontmatter YAML** — los tokens. Es la parte normativa: los valores exactos.
- **Cuerpo Markdown** — la razón de cada decisión, en secciones fijas.

La spec lo dice explícito: *«The tokens are the normative values; the prose provides context for
how to apply them»*. Esa segunda capa es la que nos importa de verdad — sin el porqué solo
sabríamos copiar lo que ya vimos, y Design Scan tiene que poder **generar elementos que no
estaban en la página escaneada**.

Consecuencia de diseño para todo el sprint: **no inventamos formato propio.** El artefacto que
Design Scan persiste en `localStorage` *es* un DESIGN.md, y la exportación deja de ser código
nuestro.

### Versión anclada

| | |
|---|---|
| Repo | `google-labs-code/design.md` |
| Commit fijado | **`9bf8eae67128b6cc55ad9bf86665767deb4c11cd`** |
| `version:` del formato | `alpha` |
| Paquete npm | `@google/design.md` **0.4.0** |
| Licencia | Apache-2.0 |

Copia literal de la spec en ese commit: [`docs/design-md/spec-9bf8eae.md`](docs/design-md/spec-9bf8eae.md).
Se ancla al commit, **no a «la última»**: el formato está en `alpha` y puede cambiar sin aviso.
Al subir de versión, se re-corre el prototipo del § 5 y se anota aquí qué cambió.

---

## 2. La spec, en lo que nos afecta

### Frontmatter

```yaml
version: <string>          # opcional; actual "alpha"
name: <string>
description: <string>      # opcional
omitted: <string[] | {section, reason}[]>   # opcional
colors:      { <token>: <Color> }
typography:  { <token>: <Typography> }
rounded:     { <nivel>: <Dimension> }
spacing:     { <nivel>: <Dimension | number> }
components:  { <componente>: { <prop>: <string | referencia> } }
```

- **Color** — cualquier color CSS válido: hex, nombrados, `rgb()/hsl()/hwb()`, `oklch()/lab()`,
  `color-mix()`. Recomendado hex `#RRGGBB`. Internamente se convierten a sRGB para el contraste.
- **Typography** — `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`,
  `fontFeature`, `fontVariation`. `lineHeight` acepta dimensión **o** número sin unidad
  (multiplicador, que es la práctica recomendada). `fontWeight` vale como número o como string.
- **Dimension** — solo `px`, `em`, `rem`. Nada de `%`, `vw` ni `ch`.
- **Referencias** — `{grupo.token}` entre llaves. Apuntan a un valor primitivo, salvo dentro de
  `components`, donde sí se puede referenciar un compuesto (`{typography.label-md}`).
- **Props de componente** — `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`,
  `size`, `height`, `width`. Las variantes van como claves hermanas: `button-primary`,
  `button-primary-hover`, `button-primary-active`.
- **`omitted`** — declara qué secciones se dejan fuera a propósito, con motivo. **Es nuestra
  válvula de escape**: lo que no se pueda extraer de una página va aquí, nunca inventado.

### Cuerpo: ocho secciones, en este orden

`Overview` (alias *Brand & Style*) · `Colors` · `Typography` · `Layout` (alias *Layout & Spacing*)
· `Elevation & Depth` (alias *Elevation*) · `Shapes` · `Components` · `Do's and Don'ts`

Todas con `##`. Se pueden **omitir**, pero las presentes deben ir en ese orden. Un `#` opcional
sirve de título y no cuenta como sección.

### Qué hacer con lo desconocido

La spec fija el comportamiento, y lo copiamos tal cual:

| Caso | Comportamiento |
|---|---|
| Encabezado desconocido (`## Iconography`) | Preservar, no fallar |
| Token de color / tipografía con nombre desconocido | Aceptar si el valor es válido |
| Valor de spacing raro | Aceptar; guardar como string |
| Propiedad de componente desconocida | Aceptar **con aviso** |
| **Encabezado duplicado** | **Error: se rechaza el archivo** |

---

## 3. Decisión: cómo consumimos la herramienta oficial

**`@google/design.md` no se importa en el navegador. Replicamos el schema, y usamos el paquete
oficial como verificador fuera de la página.**

El motivo es concreto, no una precaución vaga:

- El paquete expone una **API de librería** de verdad — subpath `./linter`, con `lint()`,
  `runLinter`, `DEFAULT_RULES` y los emisores de Tailwind v3/v4, DTCG y CSS vars. Sobre el papel
  es importable.
- Pero se compila con `bun build --target node` y declara `engines.node >= 18`. Y lo que lo cierra:
  `packages/cli/src/linter/spec-config.ts` hace `readFileSync(resolve(dirname(fileURLToPath(
  import.meta.url)), './spec-config.yaml'))` a través de un singleton perezoso, y de él cuelgan
  `model/handler.ts` y la regla `section-order`. Es decir: **cualquier `lint()` toca el disco.**
  `loadSpecConfig(filePath?)` tampoco salva — el parámetro también pasa por `readFileSync`.
- De 41 archivos del linter, solo 3 usan APIs de Node, y 2 de esos son generación de la spec
  (build-time). El problema es real pero está concentrado: si algún día aceptan inyectar la config
  ya parseada, esta decisión se revisa.
- `apps/www` es `output: "static"` y el build borra `_worker.js`. No hay servidor donde ejecutarlo,
  y el worker de STL-023 corre en Workers, que tampoco tiene `fs`.

Lo que hacemos entonces:

| Dónde | Qué |
|---|---|
| Navegador (STL-027, 028, 029) | Parser y emisores propios, con el schema de este documento |
| Verificación (local / CI) | `npx @google/design.md lint` sobre los DESIGN.md generados |

Y una regla de higiene: **el paquete no se instala hoy.** Si en algún momento entra como
dependencia de desarrollo, pasa por el cooldown de 3 días de `bunfig.toml` (ver
`SUPPLY_CHAIN_SECURITY.md`). Por ahora se invoca con `npx` a mano y punto.

---

## 4. El mapeo: de una página a un DESIGN.md

Esta es la tabla que ejecuta STL-027. Todo lo determinista sale del CSS capturado por el worker
de STL-023; nada de esto necesita modelo.

### 4.1 `colors`

| Fuente | Cómo |
|---|---|
| Custom properties `--*` del `:root` cuyo valor parsea como color | Se toman **tal cual, con su nombre**. Es la fuente de mayor calidad: el sitio ya nombró sus tokens |
| Declaraciones `color`, `background-color`, `border-color`, `fill`, `stroke` | Se normalizan a hex sRGB y se cuentan por frecuencia |
| Gradientes y `color-mix()` | Se extraen las paradas como colores sueltos; el gradiente entero va a la prosa, no al token |

Nombrado: si el sitio ya usa nombres, se respetan. Si no, se asignan roles por función —
`surface` el fondo de mayor área, `on-surface` el color de texto dominante sobre él, `primary` el
color de acento más usado en elementos interactivos, `outline` el de bordes. La spec exige
**como mínimo `primary`**.

> Dato de los ejemplos oficiales: los tres (`atmospheric-glass`, `paws-and-paths`,
> `totality-festival`) publican **47 colores** cada uno, con el juego de roles de Material
> (`surface-container-*`, `on-*`, `*-fixed`). No es obligatorio y no vamos a fabricar 47 roles a
> la fuerza: extraemos los que la página realmente usa.

### 4.2 `typography`

| Fuente | Cómo |
|---|---|
| Reglas de `h1`…`h6`, `body`, `button`, `label`, `small` | Un nivel por combinación distinta de familia + tamaño + peso |
| `font-family` computada | Se guarda la familia primera de la pila; el resto va a la prosa |
| `line-height` sin unidad | Se conserva sin unidad — es lo que la spec recomienda |
| `letter-spacing` en `em` | Se conserva; si viene en `px` se convierte a `em` sobre su `fontSize` |

Nombres: convención semántica de la spec — `display-lg`, `headline-lg/md`, `body-lg/md/sm`,
`label-lg/md/sm`. Los ejemplos oficiales traen entre 6 y 8 niveles; la spec dice que lo normal
son 9-15. Si de una página salen 30 tamaños distintos, **se agrupan en escala**, no se vuelca uno
por declaración.

### 4.3 `rounded`

`border-radius` únicos, ordenados y mapeados a `sm` · `md` · `lg` · `xl` · `full`. `9999px` y
`50%` colapsan a `full`. Si la página no redondea nada, **no se inventa la escala**: va
`omitted: [{section: rounded, reason: "..."}]`.

> Ojo: los ejemplos oficiales usan una clave `DEFAULT` (`rounded.DEFAULT: 0.5rem`), que es un
> tailwindismo y no está en los niveles recomendados de la spec. Se acepta al leer; nosotros no
> la emitimos.

### 4.4 `spacing`

Se busca el **máximo común divisor aparente** de paddings, márgenes y `gap` para deducir la
unidad base (casi siempre 4 u 8px), y de ahí la escala `xs/sm/md/lg/xl`. Además se emiten claves
descriptivas cuando se detectan: `gutter`, `margin`, `container-padding`, `section-margin`. La
spec permite número sin unidad para cosas como número de columnas.

### 4.5 `components`

Entrada de la fase con modelo (STL-028) y salida hacia el emparejamiento con el MCP (STL-030).
Se detectan por rol y por selector: `button-primary`, `button-primary-hover`, `button-ghost`,
`input-field`, `card`, `list-item-interactive`, `chip`, `tooltip`, `badge`, `nav-link`.

**Regla dura:** los valores de un componente se emiten como **referencia** (`{colors.primary}`,
`{rounded.xl}`, `{typography.label-sm}`), nunca como literal, siempre que exista el token. Un
componente con colores literales rompe el propósito del formato — al cambiar el token, el
componente no le sigue. Solo se deja literal lo que de verdad no es un token, típicamente
`rgba(255,255,255,0.1)` de un cristal, como hace el propio ejemplo `glass-card-standard`.

### 4.6 El cuerpo (STL-028, con modelo)

| Sección | De dónde sale |
|---|---|
| Overview | Personalidad de marca inferida del conjunto: paleta, densidad, tipografía |
| Colors | Descripción de cada rol y **cuándo** usarlo, no adjetivos |
| Typography | Estrategia de familias y jerarquía |
| Layout | Modelo de rejilla, anchos máximos y la escala de espaciado deducida |
| Elevation & Depth | Sombras detectadas; si no hay, **cómo se consigue la jerarquía sin ellas** |
| Shapes | El lenguaje de radios en una frase |
| Components | Guía por componente detectado |
| Do's and Don'ts | Reglas accionables, incluido el contraste AA |

Lo que el modelo **no** hace: tocar los valores del frontmatter. Los tokens los pone STL-027 de
forma determinista; el modelo escribe prosa y propone nombres, nada más.

---

## 5. Verificación hecha

Prototipo desechable (no entra en `apps/` ni en `packages/`; vive en el scratchpad de la sesión)
que lee un DESIGN.md, valida el frontmatter contra este schema, detecta las secciones con sus
alias, resuelve las referencias `{...}` y hace round-trip para comprobar que no se pierde ninguna
clave.

Corrido sobre 7 archivos reales del repo oficial — los 3 ejemplos publicados y 4 fixtures del
linter:

```
atmospheric-glass    colors:47 typography:6 rounded:6 spacing:5 components:10
                     7/8 secciones · 22 referencias, 0 rotas · 119 claves, sin pérdidas
paws-and-paths       colors:47 typography:8 rounded:6 spacing:8 components:10
                     7/8 secciones · 34 referencias, 0 rotas · 132 claves, sin pérdidas
totality-festival    colors:47 typography:6 rounded:6 spacing:5 components:10
                     7/8 secciones · 23 referencias, 0 rotas · 123 claves, sin pérdidas
HERITAGE             8/8 secciones ·  0 referencias      ·  93 claves, sin pérdidas
MERIDIAN             7/8 secciones ·  0 referencias      ·  83 claves, sin pérdidas
NO_FRONTMATTER       sin frontmatter — aceptado, la spec lo permite
OUT_OF_ORDER         ERROR de orden de secciones — detectado, que es lo que ese fixture prueba
```

**Cero claves perdidas y cero referencias rotas en los seis archivos válidos**, y el único que
falla es el que está construido para fallar. El mapeo se sostiene.

Copias fijadas de los tres ejemplos en [`docs/design-md/fixtures/`](docs/design-md/fixtures/),
para que STL-027 tenga contra qué probar sin depender de la red.

---

## 6. Lo que queda abierto

- **La spec es `alpha`.** Puede romper. Por eso se ancla el commit y por eso el prototipo se
  vuelve a correr al subir de versión.
- **`components` está declarado en evolución** por la propia spec: *«The components specification
  is actively evolving»*. Es justo la parte de la que cuelga STL-030. Si cambia, cambia el
  emparejamiento con el MCP.
- **Ningún ejemplo oficial escribe `version:`.** Nosotros sí lo escribiremos, para saber contra
  qué versión se generó cada archivo.
- **`@google/design.md` en el navegador** — cerrado hoy por `readFileSync`. Si el paquete acepta
  recibir la config ya parseada, se revisa esta decisión y nos ahorramos mantener los emisores.

## Fuentes

- Spec y CLI — <https://github.com/google-labs-code/design.md>
- Anuncio oficial — <https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/>
- Lectura de la spec — <https://www.dsebastien.net/design-md-specification/>
- Formato de design tokens del W3C, en el que se inspira — <https://www.designtokens.org/tr/2025.10/format/>
