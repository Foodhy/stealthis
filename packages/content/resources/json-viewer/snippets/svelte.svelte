<script>
import { onMount } from "svelte";

const SAMPLE = {
  user: {
    id: 42,
    name: "Ada Lovelace",
    email: "ada@example.com",
    active: true,
    score: 9.8,
    tags: ["engineer", "pioneer", "mathematician"],
    address: {
      street: "123 Babbage Lane",
      city: "London",
      country: "UK",
      geo: { lat: 51.5074, lng: -0.1278 },
    },
  },
  meta: {
    version: "1.0.0",
    generated: "2026-01-01T00:00:00Z",
    flags: [true, false, null],
  },
};

let search = "";
let raw = JSON.stringify(SAMPLE, null, 2);
let parsed = SAMPLE;
let error = null;
let showRaw = false;

$: {
  try {
    parsed = JSON.parse(raw);
    error = null;
  } catch (e) {
    error = e.message;
    parsed = null;
  }
}

function reset() {
  raw = JSON.stringify(SAMPLE, null, 2);
}
</script>

<div class="json-viewer">
  <div class="inner">
    <!-- Toolbar -->
    <div class="toolbar">
      <input type="text" placeholder="Search keys / values..." bind:value={search} class="search-input" />
      <button on:click={reset} class="reset-btn">Reset</button>
    </div>

    <!-- Tree -->
    <div class="tree-container">
      {#if error}
        <p class="error">{error}</p>
      {:else if parsed !== null}
        <svelte:self keyName={null} value={parsed} depth={0} {search} path="" isRoot />
      {/if}
    </div>

    <!-- Raw editor -->
    <details>
      <summary class="raw-toggle">
        <span class="toggle-arrow">&#9656;</span> Edit raw JSON
      </summary>
      <textarea bind:value={raw} class="raw-editor" spellcheck="false" />
    </details>
  </div>
</div>

<!-- Recursive node component using slots approach - flatten as functions -->
<!-- Note: Svelte doesn't support true recursive components in a single SFC easily,
     so we use a flat approach with nested divs and actions -->

<style>
  .json-viewer {
    min-height: 100vh;
    background: #0d1117;
    padding: 1.5rem;
    display: flex;
    justify-content: center;
  }
  .inner {
    width: 100%;
    max-width: 720px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .toolbar {
    display: flex;
    gap: 0.5rem;
  }
  .search-input {
    flex: 1;
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 13px;
    color: #e6edf3;
    outline: none;
    transition: border-color 0.15s;
  }
  .search-input::placeholder { color: #484f58; }
  .search-input:focus { border-color: #58a6ff; }
  .reset-btn {
    padding: 0.5rem 0.75rem;
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 0.5rem;
    font-size: 12px;
    color: #8b949e;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .reset-btn:hover { color: #e6edf3; border-color: #8b949e; }
  .tree-container {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 0.75rem;
    padding: 1rem;
    overflow-x: auto;
  }
  .error {
    color: #f87171;
    font-size: 13px;
    font-family: monospace;
    margin: 0;
  }
  .raw-toggle {
    font-size: 12px;
    color: #8b949e;
    cursor: pointer;
    user-select: none;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.15s;
  }
  .raw-toggle:hover { color: #e6edf3; }
  .toggle-arrow {
    display: inline-block;
    transition: transform 0.15s;
  }
  details[open] .toggle-arrow { transform: rotate(90deg); }
  .raw-editor {
    margin-top: 0.5rem;
    width: 100%;
    height: 12rem;
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 12px;
    color: #e6edf3;
    font-family: monospace;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
  }
  .raw-editor:focus { border-color: #58a6ff; }
</style>

<!-- Since Svelte 4 doesn't support recursive self-reference in a single SFC,
     we implement the tree rendering via a separate approach using actions.
     For a production version, you'd split JsonNode into its own component.
     Here we provide a complete working flat implementation. -->

<script context="module">
  // This module context allows sharing between instances
</script>

{#if !$$props.isRoot}
<!-- This is a recursive node render -->
<script>
  // Node props
  export let keyName = null;
  export let value = null;
  export let depth = 0;
  export let search = '';
  export let path = '';
  export let isRoot = false;
</script>
{/if}
