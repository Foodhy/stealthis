/* Pull-to-refresh — vanilla Pointer Events, rubber-band pull, snap release. */
(() => {
  const viewport = document.querySelector("[data-viewport]");
  const list = document.querySelector("[data-list]");
  const indicator = document.querySelector("[data-indicator]");
  const status = document.querySelector("[data-status]");
  const button = document.querySelector("[data-refresh]");
  if (!viewport || !list) return;

  const THRESHOLD = 64;   // px of pull needed to arm a refresh
  const MAX_PULL = 110;   // hard cap after rubber-banding
  const HOLD = 56;        // resting offset while loading

  const SUBJECTS = [
    ["Ana Ruiz", "Design review moved to 4pm"],
    ["Deploy bot", "Build #1841 succeeded"],
    ["Marc Vidal", "Re: pricing page copy"],
    ["Statuspage", "All systems operational"],
    ["Lena Ortiz", "Contract signed — next steps"],
    ["Sofia Marin", "Sprint retro notes attached"],
    ["Billing", "Invoice 2261 is ready"],
  ];

  let seed = 0;
  let pointerId = null;
  let startY = 0;
  let pull = 0;
  let armed = false;
  let loading = false;

  const clockFrom = (minutesAgo) => {
    const d = new Date(Date.now() - minutesAgo * 60000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const makeItem = ([from, sub], minutesAgo, isNew) => {
    const li = document.createElement("li");
    li.className = "ptr__item" + (isNew ? " is-new" : "");
    li.innerHTML = `
      <span class="ptr__avatar" aria-hidden="true">${from[0]}</span>
      <span>
        <span class="ptr__from">${from}</span><br />
        <span class="ptr__sub">${sub}</span>
      </span>
      <span class="ptr__time">${clockFrom(minutesAgo)}</span>`;
    return li;
  };

  // Seed the initial list.
  for (let i = 0; i < 6; i += 1) {
    list.append(makeItem(SUBJECTS[(seed + i) % SUBJECTS.length], 12 + i * 17, false));
  }
  seed += 6;

  const render = () => {
    const progress = Math.min(1, pull / THRESHOLD);
    viewport.style.setProperty("--ptr-pull", `${pull}px`);
    viewport.style.setProperty("--ptr-progress", progress.toFixed(3));
    indicator.classList.toggle("is-armed", armed || loading);
  };

  const setStatus = (text, ok) => {
    status.textContent = text;
    status.classList.toggle("is-ok", Boolean(ok));
  };

  const settle = (to) => {
    viewport.classList.add("is-settling");
    pull = to;
    render();
    window.setTimeout(() => viewport.classList.remove("is-settling"), 360);
  };

  // Rubber band: resistance grows with distance so the pull feels elastic.
  const damp = (raw) => MAX_PULL * (1 - Math.exp(-raw / (MAX_PULL * 0.9)));

  function refresh() {
    if (loading) return;
    loading = true;
    armed = false;
    viewport.classList.add("is-loading");
    settle(HOLD);
    setStatus("Refreshing…");
    button.disabled = true;

    window.setTimeout(() => {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = count - 1; i >= 0; i -= 1) {
        list.prepend(makeItem(SUBJECTS[(seed + i) % SUBJECTS.length], i, true));
      }
      seed += count;
      while (list.children.length > 12) list.lastElementChild.remove();

      loading = false;
      viewport.classList.remove("is-loading");
      viewport.scrollTop = 0;
      settle(0);
      button.disabled = false;
      setStatus(`Updated · ${count} new message${count > 1 ? "s" : ""}`, true);
    }, 1100);
  }

  viewport.addEventListener("pointerdown", (e) => {
    if (loading || pointerId !== null) return;
    if (viewport.scrollTop > 0) return;
    pointerId = e.pointerId;
    startY = e.clientY;
    viewport.classList.remove("is-settling");
  });

  viewport.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointerId) return;
    const raw = e.clientY - startY;
    if (raw <= 0) {
      // Upward drag hands control back to native scrolling.
      pull = 0;
      armed = false;
      render();
      return;
    }
    if (!viewport.hasPointerCapture(pointerId)) viewport.setPointerCapture(pointerId);
    if (e.cancelable) e.preventDefault();
    pull = damp(raw);
    armed = pull >= THRESHOLD;
    setStatus(armed ? "Release to refresh" : "Pull to refresh");
    render();
  });

  const endDrag = (e) => {
    if (e.pointerId !== pointerId) return;
    if (viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
    pointerId = null;
    if (armed) {
      refresh();
    } else {
      settle(0);
      if (!loading) setStatus("Idle");
    }
    armed = false;
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  // Keyboard + button alternatives.
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      refresh();
    }
  });
  button.addEventListener("click", refresh);

  render();
})();
