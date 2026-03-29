# Vibe — Minimal project roadmap (from bolt.diy)

Vibe is a minimal AI-assisted project builder derived from bolt.diy. It uses **Astro with React islands** for the UI, requires **folder selection** when creating a project (user chooses where files are written), and focuses on **Ollama**, **OpenAI** (with auth for Plus API), and **Gemini** as LLM providers.

---

## Stack and constraints

- **Framework**: Astro (SSG or SSR as needed). Interactive UI via **React islands** (e.g. chat, project form, provider settings).
- **Project creation**: When the user creates a project, they **must select a folder**; generated files are written there (e.g. via File System Access API in browser, or Electron dialog if we add a desktop shell later).
- **LLM providers (initial)**:
  - **Ollama** — local; same pattern as dbviz (base URL from env, `listModels` + streaming `generate`).
  - **OpenAI** — cloud; API key + auth for Plus-tier API where needed.
  - **Gemini** — cloud; API key.
- **Reference**: Ollama integration follows [apps/dbviz](apps/dbviz): client-friendly `listModels`/`generate` with streaming and `onToken`; base URL from env (e.g. `DBVIZ_OLLAMA_BASE_URL` → for vibe: `VIBE_OLLAMA_BASE_URL` or similar).

---

## Bolt.diy — What we reuse (conceptually)

Bolt.diy is Remix + Vite + 19+ providers, workbench, MCP, deploy. For Vibe we **do not** use Remix; we port only:

- **UI patterns**: Chat layout, message list, input, model/provider selector (simplified).
- **LLM patterns**: One provider interface (Ollama, OpenAI, Gemini), streaming response, optional system prompt.
- **Ollama**: Implement like dbviz ([apps/dbviz/src/lib/ollama.ts](apps/dbviz/src/lib/ollama.ts)): `listModels(baseUrl)`, `generate({ model, prompt, baseUrl, signal, onToken })` with NDJSON stream parsing.

We leave out: Remix routes, WebContainer, Electron (until later), MCP, deploy, 19-provider registry, Supabase, Git UI, workbench (file tree/terminal/editor) in the first phases.

---

## Part 1 — Astro shell and layout

- **Goal**: New Astro app under `apps/vibe` that runs and renders a single full-screen layout. No chat logic yet.
- **Scope**:
  - Astro project (Bun), one main page, global layout with theme (light/dark).
  - Header (logo “Vibe”) and main content area. Styles (e.g. Tailwind or existing monorepo preset).
- **Done**: `bun run dev` serves the app; one page with header and main area; theme toggle works.

---

## Part 2 — Folder selection for project creation

- **Goal**: Every time the user creates a project, they **must** select a folder; that folder is where generated files will be created.
- **Scope**:
  - In the UI: “Create project” flow that triggers folder selection (e.g. `showDirectoryPicker()` via File System Access API in supported browsers).
  - Persist or pass the chosen handle/path for the rest of the flow. No project creation without folder selection.
  - Fallback: if File System Access API is unavailable, offer “Download as ZIP” and document that full “write to folder” may require Electron or a local helper later.
- **Done**: User cannot complete “create project” without selecting a folder (or using the fallback); chosen folder is used (or clearly deferred) for file writes.

---

## Part 3 — Minimal chat UI (React island)

- **Goal**: Chat interface as an Astro page with a **React island**: message list + input + send. No workbench, no sidebar.
- **Scope**:
  - One React island component (e.g. `ChatPanel.tsx`) that renders messages and input. Optional example prompts.
  - State: messages and input in React state (or minimal store). Ready to receive streamed assistant replies.
- **Done**: UI shows messages and sends user message; assistant area ready for streamed response (can be mocked first).

---

## Part 4 — Ollama integration (like dbviz)

- **Goal**: Ollama as first LLM: list models, stream completions. Same pattern as dbviz.
- **Scope**:
  - **Client-side** (or optional server proxy): `listModels(baseUrl)` and `generate({ model, prompt, baseUrl, signal, onToken })` as in [apps/dbviz/src/lib/ollama.ts](apps/dbviz/src/lib/ollama.ts). Base URL from env (e.g. `VIBE_OLLAMA_BASE_URL`, default `http://localhost:11434`).
  - React island: model dropdown populated from `listModels`, generate on send, stream tokens into assistant message via `onToken`.
  - No Remix; Astro API route or direct client fetch to Ollama (CORS permitting) or via a small proxy route.
- **Done**: User can pick an Ollama model and get streamed replies in the chat UI.

---

## Part 5 — OpenAI and Gemini (plus OpenAI auth for Plus API)

- **Goal**: Add OpenAI and Gemini. For OpenAI, support both API key and subscription/Plus auth (OAuth) as in OpenClaw.
- **Scope**:
  - **OpenAI Option A (API key)**: API key in env or settings; backend uses it for direct `openai/*` models. Same idea as OpenClaw’s `openai-api-key` and `OPENAI_API_KEY`.
  - **OpenAI Option B (Plus / Codex subscription)**: OAuth flow so the backend can call the Plus/Codex API with the user’s ChatGPT account. Follow OpenClaw’s pattern: PKCE + state → redirect to `https://auth.openai.com/oauth/authorize` → callback (e.g. `/api/auth/openai/callback`) that exchanges code at `https://auth.openai.com/oauth/token` → store `{ access, refresh, expires, accountId }` (e.g. server-side session or encrypted cookie); refresh when expired. See **Appendix — OpenClaw OpenAI auth** below.
  - **Gemini**: API key in env or settings.
  - Backend: Astro API routes (or serverless) that accept chat messages and stream back using the chosen provider (OpenAI / Gemini). Keys and OAuth tokens server-side only.
  - UI: Provider selector (Ollama / OpenAI / Gemini) and model selector; OpenAI option includes “API key” vs “Sign in with ChatGPT (Plus)” when OAuth is implemented.
- **Done**: User can choose OpenAI or Gemini, set API key (and complete OpenAI OAuth for Plus when needed), and get streamed replies.

---

## Part 6 — Project creation: write files to selected folder

- **Goal**: When user creates a project (after selecting a folder in Part 2), generated files are written into that folder.
- **Scope**:
  - Use the folder chosen in Part 2. With File System Access API: create/write files in the selected directory. With “Download as ZIP” fallback: generate the same file set and offer as ZIP.
  - Content of generated project: minimal (e.g. from LLM or templates). Scope to be defined (e.g. single HTML/JS/CSS or a small app scaffold).
- **Done**: Creating a project writes (or downloads) the agreed file set into the user-chosen folder or ZIP.

---

## Part 7 — Minimal settings (React island)

- **Goal**: Configure Ollama base URL, OpenAI (API key or Plus OAuth), Gemini API key.
- **Scope**:
  - Settings UI as a React island: Ollama base URL; OpenAI = “API key” field or “Sign in with ChatGPT (Plus)” (triggers OAuth flow as in OpenClaw); Gemini API key. Persist API keys in env or secure server-side storage; OAuth tokens in server session or encrypted cookie after callback.
- **Done**: User can set and save these; chat and project creation use the configured providers.

---

## Optional later

- **Second local provider** (e.g. LM Studio): same pattern as Ollama (base URL + list/generate).
- **Chat persistence**: Save/load history.
- **Workbench lite**: File tree + simple editor and “project context” for the LLM.
- **Electron shell**: Desktop app with native folder picker and file writes.

---

## Appendix — dbviz Ollama reference

- [apps/dbviz/src/lib/ollama.ts](apps/dbviz/src/lib/ollama.ts): `listModels(baseUrl)`, `generate({ model, prompt, baseUrl, signal, onToken })`; streaming via NDJSON from `/api/generate`.
- [apps/dbviz/.env.example](apps/dbviz/.env.example): `DBVIZ_OLLAMA_BASE_URL` (optional).
- [apps/dbviz/src/components/DbVizStudio.tsx](apps/dbviz/src/components/DbVizStudio.tsx): `listModels()` on load, `generate()` with `onToken` to update UI; AbortController for cancel.

Vibe reuses this Ollama pattern and adds OpenAI (with Plus auth) and Gemini via server-side API routes.

---

## Appendix — OpenClaw OpenAI auth reference

OpenClaw implements two OpenAI auth options; Vibe can mirror the same ideas (API key + OAuth for Plus/Codex).

**Option A — API key (OpenAI Platform)**  
- Env: `OPENAI_API_KEY` or config. Onboarding: `openclaw onboard --auth-choice openai-api-key` or `--openai-api-key "$OPENAI_API_KEY"`.  
- Key is stored (e.g. agent dir) and used for direct `openai/*` models.  
- Refs: [apps/vibe/openclaw/docs/providers/openai.md](apps/vibe/openclaw/docs/providers/openai.md), [apps/vibe/openclaw/src/commands/auth-choice.apply.openai.ts](apps/vibe/openclaw/src/commands/auth-choice.apply.openai.ts) (`openai-api-key` branch, `setOpenaiApiKey`).

**Option B — Codex (ChatGPT / Plus subscription)**  
- OAuth with PKCE: generate verifier/challenge + state → open `https://auth.openai.com/oauth/authorize` → callback on `http://127.0.0.1:1455/auth/callback` (CLI) or, for web, a callback route (e.g. `/api/auth/openai/callback`) that receives the redirect and exchanges the code at `https://auth.openai.com/oauth/token`.  
- Store `{ access, refresh, expires, accountId }`; at runtime use access token and refresh when expired.  
- Refs:  
  - [apps/vibe/openclaw/docs/concepts/oauth.md](apps/vibe/openclaw/docs/concepts/oauth.md) — token sink, storage, PKCE flow.  
  - [apps/vibe/openclaw/docs/providers/openai.md](apps/vibe/openclaw/docs/providers/openai.md) — Option B (Codex), CLI `openclaw onboard --auth-choice openai-codex` and `openclaw models auth login --provider openai-codex`.  
  - [apps/vibe/openclaw/src/commands/auth-choice.apply.openai.ts](apps/vibe/openclaw/src/commands/auth-choice.apply.openai.ts) — `openai-codex` branch: `loginOpenAICodexOAuth()` then `writeOAuthCredentials("openai-codex", creds, agentDir)` and `applyAuthProfileConfig(..., provider: "openai-codex", mode: "oauth")`.  
  - [apps/vibe/openclaw/src/commands/openai-codex-oauth.ts](apps/vibe/openclaw/src/commands/openai-codex-oauth.ts) — `loginOpenAICodexOAuth` wraps `loginOpenAICodex` from `@mariozechner/pi-ai/oauth`, with VPS-aware handlers (open URL locally or show URL to paste).  

For Vibe (Astro web app): implement a web OAuth flow (redirect to OpenAI, callback route that exchanges code and stores tokens server-side or in an encrypted cookie), and use the stored access token (with refresh) for Plus/Codex API calls.
