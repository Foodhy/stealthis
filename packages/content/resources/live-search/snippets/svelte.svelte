<script>
import { onDestroy } from "svelte";

const ITEMS = [
  { id: 1, title: "Command Palette", category: "UI Component", tags: ["keyboard", "search"] },
  { id: 2, title: "Animated Tabs", category: "UI Component", tags: ["tabs", "animation"] },
  { id: 3, title: "Drag & Drop List", category: "UI Component", tags: ["drag", "sortable"] },
  { id: 4, title: "CSS Typewriter", category: "Animation", tags: ["text", "css"] },
  { id: 5, title: "SVG Path Drawing", category: "Animation", tags: ["svg", "gsap"] },
  { id: 6, title: "Mouse Trail", category: "Animation", tags: ["canvas", "mouse"] },
  { id: 7, title: "Kanban Board", category: "SaaS", tags: ["drag", "project"] },
  { id: 8, title: "Calendar View", category: "SaaS", tags: ["dates", "scheduler"] },
  { id: 9, title: "Data Table", category: "UI Component", tags: ["table", "sort"] },
  { id: 10, title: "Audio Player", category: "Media", tags: ["audio", "html5"] },
  { id: 11, title: "Video Player", category: "Media", tags: ["video", "html5"] },
  { id: 12, title: "Quiz Widget", category: "Interactive", tags: ["quiz", "learning"] },
];

const CATEGORY_COLORS = {
  "UI Component": "#58a6ff",
  Animation: "#bc8cff",
  SaaS: "#7ee787",
  Media: "#f1e05a",
  Interactive: "#ff7b72",
};

let query = "";
let results = ITEMS;
let loading = false;
let focused = false;
let timeoutId = null;

function search(q) {
  const lower = q.toLowerCase().trim();
  return ITEMS.filter(
    (item) =>
      !lower ||
      item.title.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower) ||
      item.tags.some((t) => t.includes(lower))
  );
}

$: {
  if (!query) {
    results = ITEMS;
    loading = false;
  } else {
    loading = true;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      results = search(query);
      loading = false;
    }, 300);
  }
}

onDestroy(() => {
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<div class="min-h-screen bg-[#0d1117] flex justify-center p-6 pt-12">
  <div class="w-full max-w-lg">
    <div
      class="relative flex items-center bg-[#161b22] border rounded-xl px-4 transition-colors"
      class:border-[#58a6ff]={focused}
      class:border-[#30363d]={!focused}
    >
      <svg class="w-4 h-4 text-[#8b949e] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        bind:value={query}
        on:focus={() => (focused = true)}
        on:blur={() => (focused = false)}
        placeholder="Search components, animations..."
        class="flex-1 bg-transparent text-[#e6edf3] placeholder-[#484f58] px-3 py-3 text-sm focus:outline-none"
      />
      {#if loading}
        <div class="w-4 h-4 border-2 border-[#30363d] border-t-[#58a6ff] rounded-full animate-spin flex-shrink-0"></div>
      {/if}
      {#if query && !loading}
        <button on:click={() => (query = "")} class="text-[#484f58] hover:text-[#8b949e] flex-shrink-0">
          &#x2715;
        </button>
      {/if}
    </div>

    <div class="mt-2 text-[11px] text-[#484f58] px-1">
      {#if query}
        {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
      {:else}
        {ITEMS.length} components
      {/if}
    </div>

    <div class="mt-3 space-y-2">
      {#each results as item (item.id)}
        <div
          class="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#8b949e]/40 transition-colors cursor-pointer"
        >
          <div class="flex-1">
            <p class="text-[#e6edf3] text-sm font-medium">{item.title}</p>
            <p class="text-[#484f58] text-xs mt-0.5">{item.tags.join(" \u00B7 ")}</p>
          </div>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style="color: {CATEGORY_COLORS[item.category]}; background: {CATEGORY_COLORS[item.category]}18;"
          >
            {item.category}
          </span>
        </div>
      {/each}

      {#if results.length === 0}
        <div class="text-center py-12 text-[#484f58]">
          <p class="text-3xl mb-2">&#x1F50D;</p>
          <p class="text-sm">No results found</p>
        </div>
      {/if}
    </div>
  </div>
</div>
