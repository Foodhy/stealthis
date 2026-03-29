(() => {
  const DATA = [
    "billing portal",
    "dashboard metrics",
    "error tracking",
    "event ingestion",
    "feature flags",
    "git workflow",
    "incident report",
    "knowledge base",
    "live updates",
    "message queue",
    "notification center",
    "payment retries",
    "query planner",
    "release notes",
    "search analytics",
    "session replay",
    "status page",
    "team invites",
  ];

  const input = document.getElementById("search");
  const state = document.getElementById("state");
  const results = document.getElementById("results");

  let debounceId = 0;
  let requestToken = 0;

  const render = (items) => {
    results.innerHTML = "";
    for (const item of items) {
      const li = document.createElement("li");
      li.textContent = item;
      results.appendChild(li);
    }
  };

  const search = (query, token) =>
    new Promise((resolve) => {
      setTimeout(
        () => {
          const normalized = query.trim().toLowerCase();
          const data = normalized
            ? DATA.filter((item) => item.includes(normalized)).slice(0, 8)
            : DATA.slice(0, 8);
          resolve({ token, data });
        },
        260 + Math.random() * 280
      );
    });

  const run = async () => {
    const query = input.value;
    const token = ++requestToken;
    state.textContent = "Searching...";

    const response = await search(query, token);
    if (response.token !== requestToken) return;

    render(response.data);
    state.textContent = response.data.length
      ? `${response.data.length} result${response.data.length === 1 ? "" : "s"}`
      : "No results";
  };

  input.addEventListener("input", () => {
    clearTimeout(debounceId);
    debounceId = window.setTimeout(run, 300);
  });

  run();
})();
