<script context="module" lang="ts">
  export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

  export const INDENT = 18;

  export function isContainer(v: Json): v is Json[] | { [k: string]: Json } {
    return v !== null && typeof v === "object";
  }

  export function entriesOf(v: Json[] | { [k: string]: Json }): [string | number, Json][] {
    return Array.isArray(v) ? v.map((x, i) => [i, x] as [number, Json]) : Object.entries(v);
  }

  /** Split a string into plain/hit segments for search highlighting. */
  export function splitTerm(raw: string, term: string) {
    if (!term) return [{ text: raw, hit: false }];
    const q = term.toLowerCase();
    const lower = raw.toLowerCase();
    const parts: { text: string; hit: boolean }[] = [];
    let from = 0;
    let idx = lower.indexOf(q);
    while (idx !== -1) {
      if (idx > from) parts.push({ text: raw.slice(from, idx), hit: false });
      parts.push({ text: raw.slice(idx, idx + term.length), hit: true });
      from = idx + term.length;
      idx = lower.indexOf(q, from);
    }
    if (from < raw.length) parts.push({ text: raw.slice(from), hit: false });
    return parts;
  }

  /** Paths of every container holding a match — used to auto-open branches. */
  export function pathsWithMatches(value: Json, term: string): Set<string> {
    const open = new Set<string>();
    if (!term) return open;
    const q = term.toLowerCase();
    const walk = (v: Json, key: string | number | null, path: string): boolean => {
      let hit = key !== null && String(key).toLowerCase().includes(q);
      if (isContainer(v)) {
        for (const [k, child] of entriesOf(v)) {
          if (walk(child, k, path + "/" + k)) hit = true;
        }
        if (hit) open.add(path);
      } else if (String(v).toLowerCase().includes(q)) {
        hit = true;
      }
      return hit;
    };
    walk(value, null, "");
    return open;
  }

  export function collectPaths(value: Json) {
    const acc: { path: string; depth: number }[] = [];
    const walk = (v: Json, path: string, depth: number) => {
      if (!isContainer(v)) return;
      const es = entriesOf(v);
      if (es.length) acc.push({ path, depth });
      for (const [k, child] of es) walk(child, path + "/" + k, depth + 1);
    };
    walk(value, "", 0);
    return acc;
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import Node from "./JsonNode.svelte";

  export let data: Json | undefined = undefined;
  /** Raw JSON text; wins over `data` and drives the Raw tab. */
  export let text: string | undefined = undefined;
  export let title = "Payload";
  export let defaultOpenDepth = 1;

  let mode: "tree" | "raw" = "tree";
  let term = "";
  let active = 0;
  let copied = false;
  let matchCount = 0;
  let treeEl: HTMLDivElement;
  let open = new Set<string>();

  $: rawText = text ?? (data === undefined ? "" : JSON.stringify(data, null, 2));

  let parseError = false;
  $: {
    parseError = false;
    if (text === undefined) {
      value = data;
    } else if (!text.trim()) {
      value = undefined;
    } else {
      try {
        value = JSON.parse(text) as Json;
      } catch {
        value = undefined;
        parseError = true;
      }
    }
  }
  let value: Json | undefined;

  $: allPaths = value === undefined ? [] : collectPaths(value);
  $: open = new Set(allPaths.filter((p) => p.depth < defaultOpenDepth).map((p) => p.path));

  const trimmed = () => term.trim();

  function onSearch() {
    const t = trimmed();
    active = 0;
    if (t && value !== undefined) {
      const needed = pathsWithMatches(value, t);
      needed.forEach((p) => open.add(p));
      open = open;
    }
    refreshMatches();
  }

  async function refreshMatches() {
    await tick();
    const marks = treeEl?.querySelectorAll("mark.jv-mark") ?? [];
    matchCount = marks.length;
    if (active >= matchCount) active = 0;
    // Marks are rendered by the recursive child, which has no global index —
    // flag the active one here, where the DOM order is known.
    marks.forEach((m) => m.classList.remove("jv-mark-active"));
    const el = marks[active] as HTMLElement | undefined;
    el?.classList.add("jv-mark-active");
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function goto(delta: number) {
    if (!matchCount) return;
    active = (active + delta + matchCount) % matchCount;
    refreshMatches();
  }

  function toggle(path: string) {
    if (!open.delete(path)) open.add(path);
    open = open;
    refreshMatches();
  }

  function copy() {
    if (navigator.clipboard) navigator.clipboard.writeText(rawText);
    copied = true;
    setTimeout(() => (copied = false), 1200);
  }
</script>

<div class="jv-shell">
  <div class="jv-toolbar">
    <span class="jv-title">{title}</span>
    <input
      class="jv-search"
      type="text"
      placeholder="Search…"
      aria-label={`Search in ${title}`}
      bind:value={term}
      disabled={mode === "raw"}
      on:input={onSearch}
      on:keydown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          goto(e.shiftKey ? -1 : 1);
        }
      }}
    />
    <span class="jv-search-nav">
      <span class="jv-search-counter">
        {matchCount ? `${active + 1}/${matchCount}` : trimmed() ? "0/0" : ""}
      </span>
      <button type="button" class="jv-nav-btn" disabled={!matchCount} title="Previous (Shift+Enter)" on:click={() => goto(-1)}>▲</button>
      <button type="button" class="jv-nav-btn" disabled={!matchCount} title="Next (Enter)" on:click={() => goto(1)}>▼</button>
    </span>
    <div class="jv-actions">
      <button
        type="button" class="jv-btn jv-btn-icon" title="Expand all" aria-label="Expand all"
        on:click={() => { open = new Set(allPaths.map((p) => p.path)); refreshMatches(); }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 9 12 4 17 9" /><polyline points="7 15 12 20 17 15" /></svg>
      </button>
      <button
        type="button" class="jv-btn jv-btn-icon" title="Collapse all" aria-label="Collapse all"
        on:click={() => { open = new Set([""]); refreshMatches(); }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 4 12 9 17 4" /><polyline points="7 20 12 15 17 20" /></svg>
      </button>
      <button type="button" class="jv-btn jv-btn-icon" class:jv-copied={copied} title="Copy JSON" aria-label="Copy JSON" on:click={copy}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
      </button>
      <div class="jv-mode">
        <button type="button" class="jv-mode-btn" class:active={mode === "tree"} on:click={() => (mode = "tree")}>Tree</button>
        <button type="button" class="jv-mode-btn" class:active={mode === "raw"} on:click={() => (mode = "raw")}>Raw</button>
      </div>
    </div>
  </div>

  <div class="jv-wrap">
    <div class="jv-tree" bind:this={treeEl} hidden={mode !== "tree"}>
      {#if parseError}
        <div class="jv-empty jv-error">Invalid JSON — switch to Raw to fix it.</div>
      {:else if value === undefined}
        <div class="jv-empty">Nothing to display.</div>
      {:else}
        <Node
          nodeKey={null}
          value={value}
          depth={0}
          isLast={true}
          path=""
          {open}
          {toggle}
          term={trimmed()}
          {active}
        />
      {/if}
    </div>
    <textarea class="jv-raw" hidden={mode !== "raw"} readonly spellcheck="false" value={rawText}></textarea>
  </div>
</div>

<!--
  ============================================================
  JsonNode.svelte — recursive child component (same folder)
  ============================================================

<script lang="ts">
  import { INDENT, isContainer, entriesOf, splitTerm, type Json } from "./JsonTreeViewer.svelte";
  import Self from "./JsonNode.svelte";

  export let nodeKey: string | number | null;
  export let value: Json;
  export let depth = 0;
  export let isLast = true;
  export let path = "";
  export let open: Set<string>;
  export let toggle: (path: string) => void;
  export let term = "";
  export let active = 0;

  // Marks are numbered by DOM order after render; `active` is compared against
  // the index the parent shell resolved from the live <mark> node list.
  $: q = term.toLowerCase();
  $: container = isContainer(value);
  $: entries = container ? entriesOf(value as Json[]) : [];
  $: empty = container && entries.length === 0;
  $: isArr = Array.isArray(value);
  $: isOpen = open.has(path);
  $: matched =
    !!term &&
    ((nodeKey !== null && String(nodeKey).toLowerCase().includes(q)) ||
      (!container && String(value).toLowerCase().includes(q)));

  function valueClass(v: Json) {
    if (v === null) return "jv-val-null";
    if (typeof v === "string") return "jv-val-str";
    if (typeof v === "number") return "jv-val-num";
    return "jv-val-bool";
  }
</script>

{#if container && !empty}
  <div class="jv-node">
    <div class="jv-row" class:jv-highlight={matched} style="cursor:pointer" on:click={() => toggle(path)}>
      <span class="jv-indent" style={`width:${depth * INDENT}px`}></span>
      <span class="jv-toggle" class:open={isOpen}>▶</span>
      {#if nodeKey !== null}
        <span class="jv-key">"{#each splitTerm(String(nodeKey), term) as p}{#if p.hit}<mark class="jv-mark">{p.text}</mark>{:else}{p.text}{/if}{/each}"</span><span class="jv-colon">:</span>
      {/if}
      <span class="jv-bracket">{isArr ? "[" : "{"}</span>
      {#if !isOpen}
        <span class="jv-collapsed"> … {entries.length} {isArr ? "items ]" : "keys }"}</span>
      {/if}
    </div>
    {#if isOpen}
      <div class="jv-children">
        {#each entries as [k, child], i (k)}
          <Self nodeKey={k} value={child} depth={depth + 1} isLast={i === entries.length - 1}
                path={path + "/" + k} {open} {toggle} {term} {active} />
        {/each}
      </div>
      <div class="jv-row">
        <span class="jv-indent" style={`width:${depth * INDENT}px`}></span>
        <span class="jv-toggle-space"></span>
        <span class="jv-bracket">{isArr ? "]" : "}"}</span>{#if !isLast}<span class="jv-comma">,</span>{/if}
      </div>
    {/if}
  </div>
{:else}
  <div class="jv-node">
    <div class="jv-row" class:jv-highlight={matched}>
      <span class="jv-indent" style={`width:${depth * INDENT}px`}></span>
      <span class="jv-toggle-space"></span>
      {#if nodeKey !== null}
        <span class="jv-key">"{#each splitTerm(String(nodeKey), term) as p}{#if p.hit}<mark class="jv-mark">{p.text}</mark>{:else}{p.text}{/if}{/each}"</span><span class="jv-colon">:</span>
      {/if}
      {#if empty}
        <span class="jv-bracket">{isArr ? "[]" : "{}"}</span>
      {:else if typeof value === "string"}
        <span class="jv-val-str">"{#each splitTerm(value, term) as p}{#if p.hit}<mark class="jv-mark">{p.text}</mark>{:else}{p.text}{/if}{/each}"</span>
      {:else if typeof value === "number"}
        <span class="jv-val-num">{#each splitTerm(String(value), term) as p}{#if p.hit}<mark class="jv-mark">{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
      {:else}
        <span class={valueClass(value)}>{String(value)}</span>
      {/if}
      {#if !isLast}<span class="jv-comma">,</span>{/if}
    </div>
  </div>
{/if}
-->
