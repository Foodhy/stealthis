(() => {
  let tasks = [
    { id: 1, label: "Ship release notes", pending: false },
    { id: 2, label: "Clean API logs", pending: false },
  ];

  const list = document.getElementById("tasks");
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const status = document.getElementById("status");

  let nextId = 3;

  const setStatus = (message, tone = "ok") => {
    status.textContent = message;
    status.className = `status ${tone}`;
  };

  const fakeRequest = () =>
    new Promise((resolve, reject) => {
      const delay = 300 + Math.random() * 700;
      setTimeout(() => {
        if (Math.random() < 0.25) {
          reject(new Error("Request failed"));
        } else {
          resolve(true);
        }
      }, delay);
    });

  const render = () => {
    list.innerHTML = "";

    for (const task of tasks) {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="task-left">
          <span>${task.label}</span>
          ${task.pending ? '<span class="pending">pending</span>' : ""}
        </div>
        <button type="button" data-delete="${task.id}">Delete</button>
      `;
      list.appendChild(li);
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const label = input.value.trim();
    if (!label) return;

    const tempId = -Date.now();
    tasks = [{ id: tempId, label, pending: true }, ...tasks];
    input.value = "";
    setStatus("Task added optimistically...");
    render();

    try {
      await fakeRequest();
      tasks = tasks.map((task) => {
        if (task.id !== tempId) return task;
        return { id: nextId++, label: task.label, pending: false };
      });
      setStatus("Task confirmed by server.", "ok");
    } catch (_error) {
      tasks = tasks.filter((task) => task.id !== tempId);
      setStatus("Add failed. Rolled back.", "error");
    }

    render();
  });

  list.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const value = target.getAttribute("data-delete");
    if (!value) return;

    const id = Number(value);
    const index = tasks.findIndex((task) => task.id === id);
    if (index < 0) return;

    const [removed] = tasks.splice(index, 1);
    render();
    setStatus("Task removed optimistically...");

    try {
      await fakeRequest();
      setStatus("Deletion confirmed by server.", "ok");
    } catch (_error) {
      tasks.splice(index, 0, removed);
      setStatus("Delete failed. Restored item.", "error");
      render();
    }
  });

  render();
})();
