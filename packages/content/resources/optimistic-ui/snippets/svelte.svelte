<script>
let tasks = [
  { id: 1, label: "Ship release notes", pending: false },
  { id: 2, label: "Clean API logs", pending: false },
];
let value = "";
let notice = { message: "Use optimistic updates to keep interactions instant.", tone: "info" };
let nextId = 3;
let nextTempId = -1;

function fakeRequest() {
  return new Promise((resolve, reject) => {
    const delay = 280 + Math.random() * 720;
    setTimeout(() => {
      if (Math.random() < 0.28) reject(new Error("Request failed"));
      else resolve();
    }, delay);
  });
}

async function onAdd(event) {
  event.preventDefault();
  const label = value.trim();
  if (!label) {
    notice = { message: "Enter a task name before adding.", tone: "error" };
    return;
  }

  const tempId = nextTempId;
  nextTempId -= 1;

  value = "";
  tasks = [{ id: tempId, label, pending: true }, ...tasks];
  notice = { message: "Task added optimistically. Syncing with server...", tone: "info" };

  try {
    await fakeRequest();
    const confirmedId = nextId;
    nextId += 1;
    tasks = tasks.map((t) => (t.id === tempId ? { ...t, id: confirmedId, pending: false } : t));
    notice = { message: "Task confirmed by server.", tone: "ok" };
  } catch {
    tasks = tasks.filter((t) => t.id !== tempId);
    notice = { message: "Add failed. Optimistic task was rolled back.", tone: "error" };
  }
}

async function onDelete(id) {
  const removedIndex = tasks.findIndex((t) => t.id === id);
  if (removedIndex === -1) return;
  const removed = tasks[removedIndex];

  tasks = tasks.filter((t) => t.id !== id);
  notice = { message: "Task removed optimistically. Syncing with server...", tone: "info" };

  try {
    await fakeRequest();
    notice = { message: "Deletion confirmed by server.", tone: "ok" };
  } catch {
    if (!tasks.some((t) => t.id === removed.id)) {
      const next = [...tasks];
      const safeIndex = Math.min(Math.max(removedIndex, 0), next.length);
      next.splice(safeIndex, 0, removed);
      tasks = next;
    }
    notice = { message: "Delete failed. Item restored.", tone: "error" };
  }
}

$: noticeClass =
  notice.tone === "ok"
    ? "text-emerald-300"
    : notice.tone === "error"
      ? "text-rose-300"
      : "text-sky-300";
</script>

<section class="min-h-screen bg-[#0d1117] px-4 py-6 text-[#e6edf3]">
  <div class="mx-auto max-w-2xl space-y-4">
    <header class="rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
      <p class="text-xs font-bold uppercase tracking-wide text-[#8b949e]">Pattern</p>
      <h1 class="mt-1 text-lg font-bold">Optimistic UI</h1>
      <p class="mt-1 text-sm text-[#8b949e]">
        UI updates immediately and rolls back only if the request fails.
      </p>
    </header>

    <form
      on:submit|preventDefault={onAdd}
      class="flex gap-2 rounded-2xl border border-[#30363d] bg-[#161b22] p-3"
    >
      <input
        bind:value={value}
        placeholder="Add task"
        class="flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6b7280] outline-none transition-colors focus:border-[#58a6ff]"
      />
      <button
        type="submit"
        class="rounded-lg border border-[#58a6ff]/45 bg-[#58a6ff]/15 px-4 py-2 text-sm font-semibold text-[#c9e6ff] transition-colors hover:bg-[#58a6ff]/25"
      >
        Add
      </button>
    </form>

    <p class="min-h-5 text-xs {noticeClass}">{notice.message}</p>

    <ul class="grid gap-2">
      {#each tasks as task (task.id)}
        <li class="flex items-center justify-between gap-3 rounded-xl border border-[#30363d] bg-[#161b22] px-3 py-2.5">
          <div class="flex items-center gap-2 text-sm">
            <span class={task.pending ? "text-[#cdd9e5]" : "text-[#e6edf3]"}>{task.label}</span>
            {#if task.pending}
              <span class="rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-200">
                syncing
              </span>
            {/if}
          </div>
          <button
            type="button"
            disabled={task.pending}
            on:click={() => onDelete(task.id)}
            class="rounded-md border border-rose-500/35 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 transition-colors enabled:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </li>
      {/each}
      {#if tasks.length === 0}
        <li class="rounded-xl border border-dashed border-[#30363d] bg-[#161b22] px-3 py-5 text-center text-sm text-[#8b949e]">
          No tasks left. Add one to test optimistic create.
        </li>
      {/if}
    </ul>
  </div>
</section>
