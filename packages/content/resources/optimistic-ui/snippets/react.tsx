import { type FormEvent, useRef, useState } from "react";

type Task = {
  id: number;
  label: string;
  pending: boolean;
};

type NoticeTone = "idle" | "info" | "ok" | "error";

const fakeRequest = () =>
  new Promise<void>((resolve, reject) => {
    const delay = 280 + Math.random() * 720;
    setTimeout(() => {
      if (Math.random() < 0.28) {
        reject(new Error("Request failed"));
      } else {
        resolve();
      }
    }, delay);
  });

export default function OptimisticUiPattern() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, label: "Ship release notes", pending: false },
    { id: 2, label: "Clean API logs", pending: false },
  ]);
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState<{ message: string; tone: NoticeTone }>({
    message: "Use optimistic updates to keep interactions instant.",
    tone: "info",
  });

  const nextIdRef = useRef(3);
  const nextTempIdRef = useRef(-1);

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    const label = value.trim();
    if (!label) {
      setNotice({ message: "Enter a task name before adding.", tone: "error" });
      return;
    }

    const tempId = nextTempIdRef.current;
    nextTempIdRef.current -= 1;

    setValue("");
    setTasks((prev) => [{ id: tempId, label, pending: true }, ...prev]);
    setNotice({ message: "Task added optimistically. Syncing with server...", tone: "info" });

    try {
      await fakeRequest();
      const confirmedId = nextIdRef.current;
      nextIdRef.current += 1;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === tempId ? { ...task, id: confirmedId, pending: false } : task
        )
      );
      setNotice({ message: "Task confirmed by server.", tone: "ok" });
    } catch {
      setTasks((prev) => prev.filter((task) => task.id !== tempId));
      setNotice({ message: "Add failed. Optimistic task was rolled back.", tone: "error" });
    }
  };

  const onDelete = async (id: number) => {
    let removed: Task | null = null;
    let removedIndex = -1;

    setTasks((prev) => {
      removedIndex = prev.findIndex((task) => task.id === id);
      if (removedIndex === -1) return prev;
      removed = prev[removedIndex];
      return prev.filter((task) => task.id !== id);
    });

    if (!removed) return;
    const rollbackTask = removed;
    const rollbackIndex = removedIndex;

    setNotice({ message: "Task removed optimistically. Syncing with server...", tone: "info" });

    try {
      await fakeRequest();
      setNotice({ message: "Deletion confirmed by server.", tone: "ok" });
    } catch {
      setTasks((prev) => {
        if (prev.some((task) => task.id === rollbackTask.id)) return prev;
        const next = prev.slice();
        const safeIndex = Math.min(Math.max(rollbackIndex, 0), next.length);
        next.splice(safeIndex, 0, rollbackTask);
        return next;
      });
      setNotice({ message: "Delete failed. Item restored.", tone: "error" });
    }
  };

  const noticeClass =
    notice.tone === "ok"
      ? "text-emerald-300"
      : notice.tone === "error"
        ? "text-rose-300"
        : "text-sky-300";

  return (
    <section className="min-h-screen bg-[#0d1117] px-4 py-6 text-[#e6edf3]">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8b949e]">Pattern</p>
          <h1 className="mt-1 text-lg font-bold">Optimistic UI</h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            UI updates immediately and rolls back only if the request fails.
          </p>
        </header>

        <form
          onSubmit={onAdd}
          className="flex gap-2 rounded-2xl border border-[#30363d] bg-[#161b22] p-3"
        >
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Add task"
            className="flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6b7280] outline-none transition-colors focus:border-[#58a6ff]"
          />
          <button
            type="submit"
            className="rounded-lg border border-[#58a6ff]/45 bg-[#58a6ff]/15 px-4 py-2 text-sm font-semibold text-[#c9e6ff] transition-colors hover:bg-[#58a6ff]/25"
          >
            Add
          </button>
        </form>

        <p className={`min-h-5 text-xs ${noticeClass}`}>{notice.message}</p>

        <ul className="grid gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#30363d] bg-[#161b22] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className={task.pending ? "text-[#cdd9e5]" : "text-[#e6edf3]"}>
                  {task.label}
                </span>
                {task.pending && (
                  <span className="rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-200">
                    syncing
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={task.pending}
                onClick={() => onDelete(task.id)}
                className="rounded-md border border-rose-500/35 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 transition-colors enabled:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="rounded-xl border border-dashed border-[#30363d] bg-[#161b22] px-3 py-5 text-center text-sm text-[#8b949e]">
              No tasks left. Add one to test optimistic create.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
