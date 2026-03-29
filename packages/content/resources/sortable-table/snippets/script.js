(() => {
  const rows = [
    { name: "Lia", team: "Core", score: 89, updated: "2026-02-28" },
    { name: "Milo", team: "Growth", score: 72, updated: "2026-03-01" },
    { name: "Aya", team: "Core", score: 94, updated: "2026-03-02" },
    { name: "Noah", team: "Ops", score: 66, updated: "2026-02-27" },
    { name: "Ira", team: "Growth", score: 81, updated: "2026-03-03" },
  ];

  let sortKey = "name";
  let sortDir = "asc";

  const tbody = document.getElementById("body");

  const render = () => {
    const sorted = rows.slice().sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (left === right) return 0;
      if (typeof left === "number" && typeof right === "number") {
        return sortDir === "asc" ? left - right : right - left;
      }
      return sortDir === "asc"
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });

    tbody.innerHTML = "";
    for (const row of sorted) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.team}</td>
        <td>${row.score}</td>
        <td>${row.updated}</td>
      `;
      tbody.appendChild(tr);
    }
  };

  const sortButtons = document.querySelectorAll("th[data-key] > button");
  for (const button of sortButtons) {
    button.addEventListener("click", () => {
      const key = button.parentElement?.getAttribute("data-key");
      if (!key) return;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = "asc";
      }
      render();
    });
  }

  let activeTh = null;
  let startX = 0;
  let startWidth = 0;

  const onMove = (event) => {
    if (!activeTh) return;
    const delta = event.clientX - startX;
    const nextWidth = Math.max(90, startWidth + delta);
    activeTh.style.width = `${nextWidth}px`;
  };

  const onUp = () => {
    activeTh = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  const resizeHandles = document.querySelectorAll("[data-resize]");
  for (const handle of resizeHandles) {
    handle.addEventListener("mousedown", (event) => {
      const th = handle.parentElement;
      if (!(th instanceof HTMLElement)) return;
      activeTh = th;
      startX = event.clientX;
      startWidth = th.offsetWidth;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      event.preventDefault();
    });
  }

  render();
})();
