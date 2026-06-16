// ===========================================================================
// Phase 63 — Form Patterns  (collection: patterns, prefix: form-)
// ===========================================================================
export const meta = {
  name: 'form-phase63-finish',
  description: 'Generate Phase 63 — Form Patterns (16 resources, mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'un agente por recurso' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'patterns'

const STYLE = `DESIGN SYSTEM (match exactly unless told otherwise):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif.
- Neutral product-UI palette in :root —
  --brand:#5b5bf0; --brand-d:#4646d6; --brand-700:#3a3ab8; --brand-50:#eef0ff;
  --accent:#00b4a6; --accent-soft:#d8f5f2;
  --ink:#101322; --ink-2:#3a4060; --muted:#6c7393;
  --bg:#f6f7fb; --white:#ffffff; --surface:#ffffff;
  --line:rgba(16,19,34,0.1); --line-2:rgba(16,19,34,0.16);
  --ok:#2f9e6f; --warn:#d98a2b; --danger:#d4503e;
  radii: --r-sm:8px --r-md:14px --r-lg:20px; soft shadows (0 1px 2px / 0 8px 24px rgba(16,19,34,.08)).
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background, centered max-width container.
- Form fields: clear labels, focus-visible rings, error state (--danger border + helper text + aria-invalid + aria-describedby), success state (--ok). Helper text under fields. Required markers.
- Accessible: aria where relevant (aria-live for validation/save status, role=alert for error summaries, fieldset/legend for groups), WCAG AA contrast, keyboard-usable, focus management on step change.
- Responsive: works down to ~360px (add a @media (max-width:520px) section); mobile-stacked vs desktop-grid.
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Real validation logic, no fake submits.
- Use simple inline SVG icons (no external assets, no <img>).
- Realistic but clearly fictional names/data.`

const DISCLAIMER = ''

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (write a rich one-line description yourself), then a short prose body:

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
createdAt: 2026-06-13
updatedAt: 2026-06-13
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>${DISCLAIMER ? '\n\n' + DISCLAIMER : ''}`

  return `You are generating ONE production-quality static UI demo resource for a "Form Patterns" library. It must be self-contained, polished, accessible, and visually distinctive — not a generic placeholder. Forms must have REAL working validation/state logic in vanilla JS.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive, full field states (focus/error/success/disabled).
3. ${dir}/snippets/script.js  — working vanilla JS: validation, step/state logic, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real fields with labels/placeholders/helper text, working validation with inline error messages and aria-invalid, clear focus and error/success states, progress/section indicators where relevant, smooth transitions, and a genuinely interactive script (no fake submit — show a success/confirmation state). No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 63.A — Form Structures
  { slug: 'form-multi-step', title: 'Form — Multi-step (progress + back/next)', category: 'ui-components', difficulty: 'med', tags: 'multi-step, wizard',
    build: 'A 3-4 step signup/checkout form (Account → Profile → Plan → Review). Top progress indicator with numbered steps and aria-current. Each step validates its own fields before Next is enabled; Back preserves entered values. Final Review step summarizes all answers, Submit shows a success screen. Focus moves to the step heading on change. Smooth slide transition between steps.' },
  { slug: 'form-wizard-branching', title: 'Form — Branching wizard (conditional steps)', category: 'ui-components', difficulty: 'hard', tags: 'wizard, branching',
    build: 'A wizard where the path branches on answers (e.g. "Account type? Personal | Business" → business shows extra company/VAT steps that personal skips). The step list updates dynamically, the progress count reflects the actual branch length, Back returns to the correct prior branch step. Validation per step. End on a tailored summary. State object tracks answers + computed step sequence.' },
  { slug: 'form-sectioned-long', title: 'Form — Long sectioned form (sticky nav)', category: 'ui-components', difficulty: 'med', tags: 'sections, sticky-nav',
    build: 'A long single-page settings form split into sections (Profile, Account, Notifications, Billing, Security) with a sticky left side-nav (or top tabs on mobile). Clicking a nav item scroll-spies/highlights the active section; the active section updates as you scroll. Each section is a card. A sticky "Save changes" bar appears when any field is dirty. Validation on save.' },
  { slug: 'form-inline-edit', title: 'Form — Inline edit / edit-in-place', category: 'ui-components', difficulty: 'med', tags: 'inline-edit, edit-in-place',
    build: 'A profile/details panel of rows (Name, Email, Role, Bio) each showing a value with an Edit (pencil) button. Clicking Edit swaps the row into an inline input with Save/Cancel; Enter saves, Esc cancels, Save validates and shows a brief "Saved" check, Cancel restores the original. Only one row editable at a time. Focus moves into the input on edit.' },
  { slug: 'form-repeatable-rows', title: 'Form — Repeatable field rows (add/remove)', category: 'ui-components', difficulty: 'med', tags: 'repeatable, dynamic-rows',
    build: 'A form section for a variable-length list (e.g. team members: name + email + role select, or line items). "Add row" appends a new blank row with smooth height transition; each row has a Remove (trash) button; min 1 row enforced. Rows are validated individually, renumbered on remove, and a running count/total shown. Keyboard accessible add/remove. Empty-state when reduced to a placeholder.' },

  // 63.B — Validation & Feedback
  { slug: 'form-inline-validation', title: 'Form — Real-time inline validation', category: 'ui-components', difficulty: 'med', tags: 'validation, realtime',
    build: 'A signup form (full name, email, password, confirm password, phone) validating on blur and as-you-type after first blur: per-field error text with aria-invalid + aria-describedby, success check when valid, and a submit button disabled until all valid. Debounced typing checks. Clear, specific messages (e.g. "Enter a valid email"). On submit show a success state.' },
  { slug: 'form-error-summary', title: 'Form — Top error summary + jump-to-field', category: 'ui-components', difficulty: 'med', tags: 'validation, error-summary',
    build: 'A form that on submit (when invalid) renders an error summary box at the top (role=alert) listing every invalid field as links; clicking a link focuses/scrolls to that field. Each field also shows its inline error. Fixing fields removes them from the summary live. Summary gets focus on submit-fail. Accessible pattern (GOV.UK style).' },
  { slug: 'form-password-strength', title: 'Form — Password strength + rules checklist', category: 'ui-components', difficulty: 'easy', tags: 'password, strength-meter',
    build: 'A set-password field with a strength meter bar (weak→strong, color-coded) updating as you type, plus a live rules checklist (min length, upper, lower, number, symbol) ticking off with check icons, a show/hide toggle, and a confirm-password match indicator. aria-live announces strength. Submit enabled only when strong + matching.' },
  { slug: 'form-async-validation', title: 'Form — Async availability check', category: 'ui-components', difficulty: 'med', tags: 'validation, async',
    build: 'A username (and/or email) field that, after debounced typing, shows a spinner then a result: available (green check) or taken (red, with suggestions like name1, name_2). Simulate the async check with setTimeout against a fictional taken-list. aria-busy/aria-live for status. Submit blocked while checking or if taken. Show the loading→result transition clearly.' },
  { slug: 'form-success-feedback', title: 'Form — Submit success / confirmation states', category: 'ui-components', difficulty: 'easy', tags: 'success, confirmation',
    build: 'A contact/request form demonstrating the full submit lifecycle: idle → submitting (button spinner + disabled) → success (animated checkmark, confirmation message, reference number, "Submit another" reset) and an error path (banner + retry). Show smooth state transitions and an SVG success animation. aria-live for the result.' },

  // 63.C — State & Complex Inputs
  { slug: 'form-autosave-draft', title: 'Form — Autosave + saved indicator + restore', category: 'ui-components', difficulty: 'med', tags: 'autosave, draft',
    build: 'A note/long-form editor that autosaves: a status pill cycles "Saving… → Saved {time ago}" on debounced edits, persists draft to localStorage, and on load offers "Restore unsaved draft?" if one exists. Manual "Save now" button too. aria-live polite for status. Show a word/char count. Clear, subtle save affordance like Google Docs.' },
  { slug: 'form-conditional-fields', title: 'Form — Conditional show/hide fields', category: 'ui-components', difficulty: 'med', tags: 'conditional, dynamic',
    build: 'A form where fields reveal based on prior answers: e.g. "Do you have a company?" Yes → company name + size; "Shipping same as billing?" No → reveals a shipping address block; a "How did you hear about us?" Other → reveals a text input. Revealed fields animate in, are required only when visible, and validation ignores hidden fields. Clean reveal transitions.' },
  { slug: 'form-dependent-selects', title: 'Form — Dependent / cascading selects', category: 'ui-components', difficulty: 'med', tags: 'cascading, selects',
    build: 'Cascading dropdowns: Country → State/Region → City, where each select populates from the previous choice (fictional data set covering a few countries). Changing a parent resets and repopulates children, disables children until the parent is chosen, and shows a placeholder. A second example: Category → Subcategory. aria + keyboard friendly. Show the dependency clearly.' },
  { slug: 'form-address-input', title: 'Form — Smart address input (autocomplete)', category: 'ui-components', difficulty: 'med', tags: 'address, autocomplete',
    build: 'An address field with a typeahead suggestion dropdown (filter a fictional address list as you type, keyboard arrow/enter to select, highlight match). Selecting an address auto-fills the structured fields (street, city, postcode, country). A "Enter manually" toggle reveals the full field set. ARIA combobox pattern (aria-expanded, aria-activedescendant). Clear, fast suggestions.' },
  { slug: 'form-payment-input', title: 'Form — Card / payment input group', category: 'ui-components', difficulty: 'med', tags: 'payment, card-input',
    build: 'A credit-card form: card number with live formatting (groups of 4) + detected brand icon (Visa/MC/Amex via prefix), expiry MM/YY mask, CVC (3-4 digits by brand), cardholder name, postal code. Luhn-check the number with inline validation, animate a small card preview that mirrors the inputs (flips for CVC). All client-side/demo. Submit shows a "Payment confirmed (demo)" success.' },
  { slug: 'form-unsaved-guard', title: 'Form — Unsaved-changes leave guard', category: 'ui-components', difficulty: 'easy', tags: 'guard, dirty-state',
    build: 'A form that tracks a dirty state once any field changes; attempting to navigate away (a "Leave page" / "Cancel" button, or in-page route links) triggers a confirm modal: "You have unsaved changes — Leave / Stay". Saving clears the dirty flag and disables the guard. Wire beforeunload too (note it in comments). Modal is accessible (focus trap, Esc = Stay).' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos "${COLLECTION}" (Phase 63 — Form Patterns)…`)

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
