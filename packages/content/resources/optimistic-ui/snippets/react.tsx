import { type FormEvent, useState } from "react";

type Task = {
  id: number;
  label: string;
  pending: boolean;
};

const fakeRequest = () =>
  new Promise<void>((resolve, reject) => {
    const delay = 300 + Math.random() * 700;
    setTimeout(() => {
      if (Math.random() < 0.25) {
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
  const [status, setStatus] = useState("");
  const [nextId, setNextId] = useState(3);

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    const label = value.trim();
    if (!label) return;

    const tempId = -Date.now();
    setValue("");
    setTasks((prev) => [{ id: tempId, label, pending: true }, ...prev]);
    setStatus("Task added optimistically...");

    try {
      await fakeRequest();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === tempId ? { id: nextId, label: task.label, pending: false } : task
        )
      );
      setNextId((id) => id + 1);
      setStatus("Task confirmed by server.");
    } catch (_error) {
      setTasks((prev) => prev.filter((task) => task.id !== tempId));
      setStatus("Add failed. Rolled back.");
    }
  };

  const onDelete = async (id: number) => {
    const previous = tasks;
    const removed = previous.find((task) => task.id === id);
    if (!removed) return;

    setTasks((prev) => prev.filter((task) => task.id !== id));
    setStatus("Task removed optimistically...");

    try {
      await fakeRequest();
      setStatus("Deletion confirmed by server.");
    } catch (_error) {
      setTasks((prev) => [removed, ...prev]);
      setStatus("Delete failed. Restored item.");
    }
  };

  return (
    <section style={{ fontFamily: "system-ui, sans-serif", color: "#e2e8f0" }}>
      <form onSubmit={onAdd} style={{ display: "flex", gap: 8 }}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Add task"
        />
        <button type="submit">Add</button>
      </form>
      <p>{status}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: 8,
            }}
          >
            <span>
              {task.label}
              {task.pending ? " (pending)" : ""}
            </span>
            <button type="button" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
