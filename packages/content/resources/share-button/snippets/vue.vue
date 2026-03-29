<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const OPTIONS = [
  { label: "Copy link", icon: "🔗", action: "copy" },
  { label: "Twitter / X", icon: "✦", action: "twitter" },
  { label: "LinkedIn", icon: "in", action: "linkedin" },
  { label: "Facebook", icon: "f", action: "facebook" },
  { label: "WhatsApp", icon: "✉", action: "whatsapp" },
];

const open = ref(false);
const copied = ref(false);
const containerEl = ref(null);

function handleOption(action) {
  if (action === "copy") {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  }
  open.value = false;
}

function handleClickOutside(e) {
  if (containerEl.value && !containerEl.value.contains(e.target)) open.value = false;
}

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside));
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center gap-8 p-6">
    <div ref="containerEl" class="relative">
      <button @click="open = !open" :class="['flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200', open ? 'bg-[#58a6ff] text-[#0d1117]' : 'bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:border-[#8b949e]/40']">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Share
      </button>
      <div v-if="open" class="absolute top-full mt-2 right-0 w-44 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-xl z-10">
        <button v-for="o in OPTIONS" :key="o.action" @click="handleOption(o.action)" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e6edf3] hover:bg-[#21262d] transition-colors">
          <span class="w-5 h-5 flex items-center justify-center text-xs font-bold bg-[#30363d] rounded text-[#8b949e]">{{ o.icon }}</span>
          {{ o.action === "copy" && copied ? "Copied!" : o.label }}
        </button>
      </div>
    </div>
    <div v-if="copied" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#238636] text-white text-sm px-4 py-2 rounded-lg shadow-lg">Link copied to clipboard!</div>
  </div>
</template>
