<script setup>
import { ref, nextTick, watch } from "vue";

const RESPONSES = [
  "That's a great question! Let me think through this carefully.\n\nThe key insight here is that you need to consider both the time and space complexity. For most practical cases, a hash map approach gives you O(1) lookups which is exactly what you want.",
  "I understand what you're looking for. Here's my take:\n\nYou can approach this problem from two angles — either top-down with memoization, or bottom-up with tabulation. Both work, but tabulation often has better cache performance.",
  "Sure! The short answer is: **yes, that's possible**.\n\nThe longer answer involves understanding how the event loop works. JavaScript is single-threaded, so asynchronous operations are handled through the microtask queue and the callback queue.",
  "Great point! Let me break that down:\n\n1. First, initialize your state properly\n2. Then handle the edge cases\n3. Finally, make sure you clean up any side effects\n\nThis pattern works reliably in production environments.",
  "Interesting question. The tradeoff here is between **readability** and **performance**. For small datasets, readability wins. For large datasets — say 10k+ items — you'll want to optimize.",
];

let msgId = 0;
const messages = ref([
  {
    id: ++msgId,
    role: "assistant",
    content: "Hello! I'm your AI assistant. Ask me anything — I'm here to help.",
    streaming: false,
  },
]);
const input = ref("");
const isStreaming = ref(false);
const bottomRef = ref(null);
let responseIdx = 0;

watch(
  messages,
  () => {
    nextTick(() => {
      bottomRef.value?.scrollIntoView({ behavior: "smooth" });
    });
  },
  { deep: true }
);

function stream(id, text) {
  let i = 0;
  const tick = setInterval(() => {
    i++;
    messages.value = messages.value.map((m) =>
      m.id === id ? { ...m, content: text.slice(0, i), streaming: i < text.length } : m
    );
    if (i >= text.length) {
      clearInterval(tick);
      isStreaming.value = false;
    }
  }, 12);
}

function send() {
  const text = input.value.trim();
  if (!text || isStreaming.value) return;

  const userId = ++msgId;
  const assistantId = ++msgId;
  const response = RESPONSES[responseIdx % RESPONSES.length];
  responseIdx++;

  messages.value = [
    ...messages.value,
    { id: userId, role: "user", content: text, streaming: false },
    { id: assistantId, role: "assistant", content: "", streaming: true },
  ];
  input.value = "";
  isStreaming.value = true;

  setTimeout(() => stream(assistantId, response), 400);
}

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] p-4 flex justify-center items-center">
    <div class="w-full max-w-[680px] h-[600px] flex flex-col bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center gap-3 px-5 py-3.5 bg-[#21262d] border-b border-[#30363d] flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#bc8cff] flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M9 9h.01M15 9h.01M9 15s1.5 2 3 2 3-2 3-2"/>
          </svg>
        </div>
        <div>
          <p class="text-[13px] font-bold text-[#e6edf3]">AI Assistant</p>
          <p class="text-[11px] text-green-400">
            {{ isStreaming ? 'Typing...' : 'Online' }}
          </p>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex gap-3"
          :class="{ 'flex-row-reverse': msg.role === 'user' }"
        >
          <!-- Avatar -->
          <div
            class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
            :class="msg.role === 'assistant'
              ? 'bg-gradient-to-br from-[#58a6ff] to-[#bc8cff] text-white'
              : 'bg-[#30363d] text-[#8b949e]'"
          >
            {{ msg.role === 'assistant' ? 'AI' : 'U' }}
          </div>

          <!-- Bubble -->
          <div
            class="max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap"
            :class="msg.role === 'user'
              ? 'bg-[#58a6ff] text-white rounded-tr-sm'
              : 'bg-[#21262d] text-[#e6edf3] border border-[#30363d] rounded-tl-sm'"
          >
            {{ msg.content }}
            <span
              v-if="msg.streaming"
              class="inline-block w-2 h-4 bg-[#58a6ff] ml-0.5 align-middle animate-pulse rounded-sm"
            ></span>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isStreaming && messages[messages.length - 1]?.content === ''" class="flex gap-3">
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#bc8cff] flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white">
            AI
          </div>
          <div class="bg-[#21262d] border border-[#30363d] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
            <span
              v-for="i in 3"
              :key="i"
              class="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce"
              :style="{ animationDelay: `${(i - 1) * 150}ms` }"
            ></span>
          </div>
        </div>

        <div ref="bottomRef"></div>
      </div>

      <!-- Input -->
      <div class="flex-shrink-0 px-4 py-3 border-t border-[#30363d] bg-[#161b22]">
        <div class="flex items-end gap-2 bg-[#21262d] border border-[#30363d] rounded-xl px-3 py-2 focus-within:border-[#58a6ff] transition-colors">
          <textarea
            v-model="input"
            @keydown="handleKey"
            placeholder="Message AI..."
            rows="1"
            class="flex-1 bg-transparent text-[13px] text-[#e6edf3] placeholder-[#484f58] resize-none outline-none leading-relaxed max-h-32"
            :style="{ overflowY: input.split('\n').length > 4 ? 'auto' : 'hidden' }"
            :disabled="isStreaming"
          ></textarea>
          <button
            @click="send"
            :disabled="!input.trim() || isStreaming"
            class="w-8 h-8 rounded-lg bg-[#58a6ff] flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#79b8ff] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p class="text-[10px] text-[#484f58] mt-1.5 text-center">
          Enter to send &middot; Shift+Enter for new line
        </p>
      </div>
    </div>
  </div>
</template>
