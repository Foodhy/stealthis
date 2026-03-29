(() => {
  const DATA = [
    { id: 1, title: "Payment retries", status: "active", type: "workflow" },
    { id: 2, title: "Onboarding copy", status: "pending", type: "content" },
    { id: 3, title: "API docs refresh", status: "active", type: "docs" },
    { id: 4, title: "Quarterly report", status: "archived", type: "analytics" },
    { id: 5, title: "Token rotation", status: "pending", type: "security" },
    { id: 6, title: "Usage dashboard", status: "active", type: "analytics" },
    { id: 7, title: "Support macros", status: "archived", type: "ops" },
  ];

  const searchInput = document.getElementById("search");
  const statusInputs = Array.from(document.querySelectorAll("input[name='status']"));
  const list = document.getElementById("list");
  const count = document.getElementById("count");

  const state = {
    q: "",
    status: new Set(),
  };
  const canSyncHistory = !window.location.href.startsWith("about:srcdoc");

  const applyStateFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get("q") ?? "";
    state.status = new Set((params.get("status") ?? "").split(",").filter(Boolean));

    searchInput.value = state.q;
    for (const input of statusInputs) {
      input.checked = state.status.has(input.value);
    }
  };

  const syncUrl = () => {
    if (!canSyncHistory) return;

    const params = new URLSearchParams();
    const query = state.q.trim();
    if (query) params.set("q", query);
    if (state.status.size > 0) {
      params.set("status", Array.from(state.status).join(","));
    }

    const next = params.toString();
    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    try {
      history.replaceState({}, "", url);
    } catch {
      // ignore History API restrictions inside sandboxed srcdoc iframes
    }
  };

  const render = () => {
    const query = state.q.trim().toLowerCase();

    const filtered = DATA.filter((item) => {
      const queryMatch =
        query.length === 0 || `${item.title} ${item.type}`.toLowerCase().includes(query);
      const statusMatch = state.status.size === 0 || state.status.has(item.status);
      return queryMatch && statusMatch;
    });

    list.innerHTML = "";
    for (const item of filtered) {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p class="meta">
          <span>${item.type}</span>
          <span class="badge">${item.status}</span>
        </p>
      `;
      list.appendChild(card);
    }

    count.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;
  };

  searchInput.addEventListener("input", () => {
    state.q = searchInput.value;
    syncUrl();
    render();
  });

  for (const input of statusInputs) {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.status.add(input.value);
      } else {
        state.status.delete(input.value);
      }
      syncUrl();
      render();
    });
  }

  applyStateFromUrl();
  render();
})();
