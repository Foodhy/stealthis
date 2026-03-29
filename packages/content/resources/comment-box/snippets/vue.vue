<script setup>
import { ref } from "vue";

const comments = ref([
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "SC",
    color: "#bc8cff",
    text: "This is exactly what I was looking for! Clean API design.",
    time: "2h ago",
    likes: 12,
  },
  {
    id: 2,
    user: "Alex Rivera",
    avatar: "AR",
    color: "#58a6ff",
    text: "Great implementation. One suggestion: add keyboard shortcut support.",
    time: "45m ago",
    likes: 7,
  },
]);
const text = ref("");
const submitting = ref(false);
const likedMap = ref({});

function toggleLike(id) {
  likedMap.value[id] = !likedMap.value[id];
}

function submit() {
  if (!text.value.trim()) return;
  submitting.value = true;
  setTimeout(() => {
    comments.value.push({
      id: Date.now(),
      user: "You",
      avatar: "YO",
      color: "#7ee787",
      text: text.value.trim(),
      time: "just now",
      likes: 0,
    });
    text.value = "";
    submitting.value = false;
  }, 500);
}

function handleKey(e) {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex justify-center p-6">
    <div class="w-full max-w-lg">
      <h2 class="text-[#e6edf3] font-bold text-lg mb-5">{{ comments.length }} Comments</h2>

      <div class="space-y-4 mb-6">
        <div v-for="c in comments" :key="c.id" class="flex gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#0d1117] flex-shrink-0"
            :style="{ background: c.color }"
          >
            {{ c.avatar }}
          </div>
          <div class="flex-1">
            <div class="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3">
              <div class="flex items-baseline justify-between mb-1">
                <span class="text-[#e6edf3] font-semibold text-sm">{{ c.user }}</span>
                <span class="text-[#484f58] text-xs">{{ c.time }}</span>
              </div>
              <p class="text-[#8b949e] text-sm leading-relaxed">{{ c.text }}</p>
            </div>
            <div class="flex items-center gap-4 mt-1.5 ml-1">
              <button
                @click="toggleLike(c.id)"
                class="text-xs transition-colors"
                :class="likedMap[c.id] ? 'text-[#ff6b6b]' : 'text-[#484f58] hover:text-[#8b949e]'"
              >
                {{ likedMap[c.id] ? '\u2665' : '\u2661' }} {{ c.likes + (likedMap[c.id] ? 1 : 0) }}
              </button>
              <button class="text-xs text-[#484f58] hover:text-[#8b949e] transition-colors">Reply</button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <div class="w-8 h-8 rounded-full bg-[#7ee787] flex items-center justify-center text-xs font-bold text-[#0d1117] flex-shrink-0 mt-0.5">
          YO
        </div>
        <div class="flex-1">
          <textarea
            v-model="text"
            @keydown="handleKey"
            placeholder="Add a comment..."
            rows="3"
            class="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] placeholder-[#484f58] text-sm resize-none focus:outline-none focus:border-[#58a6ff] transition-colors"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <span class="text-[11px] text-[#484f58]">Cmd+Enter to submit</span>
            <button
              @click="submit"
              :disabled="!text.trim() || submitting"
              class="px-4 py-1.5 bg-[#238636] border border-[#2ea043] text-white text-sm rounded-lg font-semibold disabled:opacity-40 hover:bg-[#2ea043] transition-colors"
            >
              {{ submitting ? 'Posting...' : 'Comment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
