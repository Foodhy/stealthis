<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const typingUser = ref("Sarah");
const messages = ref([
  {
    id: 1,
    user: "Sarah",
    avatar: "SC",
    color: "#bc8cff",
    text: "Hey! Did you get a chance to review the PR?",
  },
  {
    id: 2,
    user: "You",
    avatar: "YO",
    color: "#7ee787",
    text: "Yes, looks great! Just left a few comments.",
    own: true,
  },
  { id: 3, user: "Sarah", avatar: "SC", color: "#bc8cff", text: "Perfect, I'll address them now" },
]);
const input = ref("");
let timer;

onMounted(() => {
  timer = setTimeout(() => {
    messages.value.push({
      id: Date.now(),
      user: "Sarah",
      avatar: "SC",
      color: "#bc8cff",
      text: "Should be ready in a few minutes!",
    });
    typingUser.value = null;
  }, 3000);
});

onUnmounted(() => {
  clearTimeout(timer);
});

function handleKeyDown(e) {
  if (e.key === "Enter" && input.value.trim()) {
    messages.value.push({
      id: Date.now(),
      user: "You",
      avatar: "YO",
      color: "#7ee787",
      text: input.value.trim(),
      own: true,
    });
    input.value = "";
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden flex flex-col h-[480px]">
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-[#30363d]">
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-[#bc8cff] flex items-center justify-center text-xs font-bold text-[#0d1117]">SC</div>
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#7ee787] rounded-full border-2 border-[#161b22]"></span>
        </div>
        <div>
          <p class="text-[#e6edf3] text-sm font-semibold">Sarah Chen</p>
          <p class="text-[#7ee787] text-xs">{{ typingUser ? "typing\u2026" : "online" }}</p>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex items-end gap-2"
          :class="{ 'flex-row-reverse': msg.own }"
        >
          <div
            v-if="!msg.own"
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1117] flex-shrink-0"
            :style="{ background: msg.color }"
          >
            {{ msg.avatar }}
          </div>
          <div
            class="px-3 py-2 rounded-2xl text-sm max-w-[70%]"
            :class="msg.own
              ? 'bg-[#238636] text-white rounded-br-sm'
              : 'bg-[#21262d] text-[#e6edf3] rounded-bl-sm'"
          >
            {{ msg.text }}
          </div>
        </div>

        <div v-if="typingUser" class="flex items-end gap-2">
          <div class="w-6 h-6 rounded-full bg-[#bc8cff] flex items-center justify-center text-[10px] font-bold text-[#0d1117]">SC</div>
          <div class="bg-[#21262d] px-4 py-3 rounded-2xl rounded-bl-sm">
            <div class="flex items-center gap-1">
              <span
                v-for="i in 3"
                :key="i"
                class="dot"
                :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="px-3 py-3 border-t border-[#30363d]">
        <input
          v-model="input"
          @keydown="handleKeyDown"
          placeholder="Message\u2026"
          class="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-[#e6edf3] text-sm placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-5px); opacity: 1; }
}
.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #8b949e;
  animation: typing-bounce 1.2s ease-in-out infinite;
}
</style>
