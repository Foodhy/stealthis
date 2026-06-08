// ===========================================================================
// PLANTILLA — Workflow para construir una Phase del ROADMAP con agentes en paralelo
// ===========================================================================
// Cómo usarla:
//   1. Copia este archivo y renombra meta.name / meta.description.
//   2. Ajusta COLLECTION, BASE (no suele cambiar) y el string STYLE de la colección.
//   3. Rellena el array SPECS con un objeto por recurso (sácalos del ROADMAP.md).
//   4. Lánzalo: pídele a Claude "usa un workflow con este script" o invoca la
//      herramienta Workflow con { scriptPath: "<ruta a este archivo>" }.
//
// Ver la guía completa en PHASE-WORKFLOW.md (raíz del repo).
// ===========================================================================

export const meta = {
  name: 'phase-build', // <-- cámbialo por fase, p.ej. 'gym-phase30-finish'
  description: 'Generar los recursos faltantes de una fase (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'un agente por recurso' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'clinic' // <-- cámbialo: gym | salon | realestate | ...

// ── Sistema de diseño compartido de la colección ───────────────────────────
// Ajusta la paleta y el tono según la fila "Shared design language" del ROADMAP.
const STYLE = `DESIGN SYSTEM (match exactly unless told otherwise):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif.
- Default palette in :root —
  --teal:#129c93; --teal-d:#0c7a73; --teal-700:#0a655f; --teal-50:#e7f5f3;
  --coral:#ff7a66; --coral-soft:#ffe6df;
  --ink:#16322f; --ink-2:#3a534f; --muted:#6b827e;
  --bg:#f1f7f6; --white:#ffffff;
  --line:rgba(16,50,47,0.1); --line-2:rgba(16,50,47,0.18);
  --ok:#2f9e6f; --warn:#d98a2b; --danger:#d4503e;
  radii: --r-sm:8px --r-md:14px --r-lg:20px; soft shadows.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional names/data.`

// Disclaimer opcional que debe cerrar el cuerpo del mdx (vacío = sin disclaimer).
const DISCLAIMER = '> Illustrative UI only — **not** intended for real medical use.'

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`

  const mdxInstr = s.mdxExists
    ? `DO NOT create index.mdx — it already exists and must be left untouched. Write ONLY the three snippet files.`
    : `Create ${dir}/index.mdx with EXACTLY this frontmatter (fill description yourself), then the prose body:

---
slug: ${s.slug}
title: "${s.title}"
description: "<ONE-LINE rich description, 55-90 words, no internal double-quotes>"
category: ${s.category}
type: ${type}
tags: ${tags}
tech: [html, css, vanilla-js]
difficulty: ${s.difficulty}
targets: [html]
collections: [${COLLECTION}]
labRoute: /${s.category}/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-08
updatedAt: 2026-06-08
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource. It must be self-contained, polished, and visually distinctive — not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}
RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
${s.mdxExists ? '' : '4. ' + dir + '/index.mdx — frontmatter + prose as specified below.'}

${mdxInstr}

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, badges, smooth micro-interactions, a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

// ── Lista de recursos de la fase ───────────────────────────────────────────
// Un objeto por recurso. Saca slug/category/difficulty del ROADMAP.md.
//   mdxExists: true  → el recurso ya tiene index.mdx (solo escribe snippets)
//   palette: "..."   → landings temáticos con paleta propia
const SPECS = [
  // {
  //   slug: 'gym-class-schedule',
  //   title: 'Gym — Class Schedule',
  //   category: 'pages',          // pages | ui-components | ...
  //   difficulty: 'med',          // easy | med | hard
  //   tags: 'schedule, classes',  // tags extra (además de COLLECTION)
  //   build: 'Week grid de clases con ...',
  //   // mdxExists: true,
  //   // palette: 'Yoga theme — Sage + bone + dusty rose ...',
  // },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos de la colección "${COLLECTION}"…`)

const RESULT = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['slug', 'files'],
}

const results = await parallel(
  SPECS.map((s) => () =>
    agent(buildPrompt(s), {
      label: s.slug,
      phase: 'Generate',
      agentType: 'general-purpose',
      schema: RESULT,
    })
  )
)

const ok = results.filter(Boolean)
return {
  requested: SPECS.length,
  completed: ok.length,
  resources: ok.map((r) => ({ slug: r.slug, fileCount: (r.files || []).length })),
}
