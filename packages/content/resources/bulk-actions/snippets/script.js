(() => {
  let items = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: `Asset ${index + 1}`,
    detail: `Design artifact ${index + 1}`,
  }));

  const selected = new Set();

  const grid = document.getElementById("grid");
  const toggleAll = document.getElementById("toggle-all");
  const bulkBar = document.getElementById("bulk-bar");
  const selectedCount = document.getElementById("selected-count");
  const archiveBtn = document.getElementById("archive");
  const removeBtn = document.getElementById("remove");

  const render = () => {
    grid.innerHTML = "";

    for (const item of items) {
      const checked = selected.has(item.id);
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-top">
          <span>#${item.id}</span>
          <label><input data-select="${item.id}" type="checkbox" ${checked ? "checked" : ""} /> Select</label>
        </div>
        <h3>${item.name}</h3>
        <p>${item.detail}</p>
      `;
      grid.appendChild(card);
    }

    const count = selected.size;
    selectedCount.textContent = `${count} selected`;
    bulkBar.hidden = count === 0;
    toggleAll.checked = items.length > 0 && count === items.length;
    toggleAll.indeterminate = count > 0 && count < items.length;
  };

  grid.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const id = target.getAttribute("data-select");
    if (!id) return;

    const numericId = Number(id);
    if (target.checked) {
      selected.add(numericId);
    } else {
      selected.delete(numericId);
    }

    render();
  });

  toggleAll.addEventListener("change", () => {
    if (toggleAll.checked) {
      selected.clear();
      for (const item of items) selected.add(item.id);
    } else {
      selected.clear();
    }
    render();
  });

  archiveBtn.addEventListener("click", () => {
    items = items.map((item) => {
      if (!selected.has(item.id)) return item;
      return { ...item, detail: `${item.detail} (archived)` };
    });
    selected.clear();
    render();
  });

  removeBtn.addEventListener("click", () => {
    items = items.filter((item) => !selected.has(item.id));
    selected.clear();
    render();
  });

  render();
})();
