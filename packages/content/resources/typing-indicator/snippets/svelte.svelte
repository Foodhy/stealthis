<script>
import { onMount, onDestroy } from "svelte";

let typingUser = "Sarah";
let messages = [
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
];
let input = "";
let timer;

onMount(() => {
  timer = setTimeout(() => {
    messages = [
      ...messages,
      {
        id: Date.now(),
        user: "Sarah",
        avatar: "SC",
        color: "#bc8cff",
        text: "Should be ready in a few minutes!",
      },
    ];
    typingUser = null;
  }, 3000);
});

onDestroy(() => {
  clearTimeout(timer);
});

function handleKeyDown(e) {
  if (e.key === "Enter" && input.trim()) {
    messages = [
      ...messages,
      {
        id: Date.now(),
        user: "You",
        avatar: "YO",
        color: "#7ee787",
        text: input.trim(),
        own: true,
      },
    ];
    input = "";
  }
}
</script>

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
        <p class="text-[#7ee787] text-xs">{typingUser ? "typing\u2026" : "online"}</p>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      {#each messages as msg (msg.id)}
        <div class="flex items-end gap-2" class:flex-row-reverse={msg.own}>
          {#if !msg.own}
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1117] flex-shrink-0"
              style="background: {msg.color};"
            >
              {msg.avatar}
            </div>
          {/if}
          <div
            class="px-3 py-2 rounded-2xl text-sm max-w-[70%]"
            class:bg-[#238636]={msg.own}
            class:text-white={msg.own}
            class:rounded-br-sm={msg.own}
            class:bg-[#21262d]={!msg.own}
            class:text-[#e6edf3]={!msg.own}
            class:rounded-bl-sm={!msg.own}
          >
            {msg.text}
          </div>
        </div>
      {/each}

      {#if typingUser}
        <div class="flex items-end gap-2">
          <div class="w-6 h-6 rounded-full bg-[#bc8cff] flex items-center justify-center text-[10px] font-bold text-[#0d1117]">SC</div>
          <div class="bg-[#21262d] px-4 py-3 rounded-2xl rounded-bl-sm">
            <div class="flex items-center gap-1">
              {#each [0, 1, 2] as i}
                <span
                  class="w-2 h-2 rounded-full bg-[#8b949e]"
                  style="animation: typing-bounce 1.2s ease-in-out {i * 0.2}s infinite;"
                ></span>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Input -->
    <div class="px-3 py-3 border-t border-[#30363d]">
      <input
        bind:value={input}
        on:keydown={handleKeyDown}
        placeholder="Message\u2026"
        class="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-[#e6edf3] text-sm placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
      />
    </div>
  </div>
</div>

<style>
  @keyframes -global-typing-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
</style>
