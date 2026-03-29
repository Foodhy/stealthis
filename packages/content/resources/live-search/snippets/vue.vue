<script setup>
import { ref, watch, onUnmounted } from "vue";

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

const query = ref("");
const results = ref(ITEMS);
const loading = ref(false);
const focused = ref(false);
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

watch(query, (q) => {
  if (!q) {
    results.value = ITEMS;
    loading.value = false;
    return;
  }
  loading.value = true;
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    results.value = search(q);
    loading.value = false;
  }, 300);
});

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex justify-center p-6 pt-12">
    <div class="w-full max-w-lg">
      <div
        class="relative flex items-center bg-[#161b22] border rounded-xl px-4 transition-colors"
        :class="focused ? 'border-[#58a6ff]' : 'border-[#30363d]'"
      >
        <svg class="w-4 h-4 text-[#8b949e] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          v-model="query"
          @focus="focused = true"
          @blur="focused = false"
          placeholder="Search components, animations..."
          class="flex-1 bg-transparent text-[#e6edf3] placeholder-[#484f58] px-3 py-3 text-sm focus:outline-none"
        />
        <div
          v-if="loading"
          class="w-4 h-4 border-2 border-[#30363d] border-t-[#58a6ff] rounded-full animate-spin flex-shrink-0"
        ></div>
        <button
          v-if="query && !loading"
          @click="query = ''"
          class="text-[#484f58] hover:text-[#8b949e] flex-shrink-0"
        >
          &#x2715;
        </button>
      </div>

      <div class="mt-2 text-[11px] text-[#484f58] px-1">
        <template v-if="query">
          {{ results.length }} result{{ results.length !== 1 ? 's' : '' }} for "{{ query }}"
        </template>
        <template v-else>{{ ITEMS.length }} components</template>
      </div>

      <div class="mt-3 space-y-2">
        <div
          v-for="item in results"
          :key="item.id"
          class="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#8b949e]/40 transition-colors cursor-pointer"
        >
          <div class="flex-1">
            <p class="text-[#e6edf3] text-sm font-medium">{{ item.title }}</p>
            <p class="text-[#484f58] text-xs mt-0.5">{{ item.tags.join(' \u00B7 ') }}</p>
          </div>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            :style="{ color: CATEGORY_COLORS[item.category], background: CATEGORY_COLORS[item.category] + '18' }"
          >
            {{ item.category }}
          </span>
        </div>

        <div v-if="results.length === 0" class="text-center py-12 text-[#484f58]">
          <p class="text-3xl mb-2">&#x1F50D;</p>
          <p class="text-sm">No results found</p>
        </div>
      </div>
    </div>
  </div>
</template>
