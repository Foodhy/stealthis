(() => {
  const board = document.getElementById("board");
  if (!board) return;

  const live = document.getElementById("live");
  const cols = [...board.querySelectorAll(".col")];
  const lists = cols.map((c) => c.querySelector(".list"));

  const placeholder = document.createElement("li");
  placeholder.className = "placeholder";
  placeholder.setAttribute("aria-hidden", "true");

  let dragged = null;

  /* ---------- state helpers ---------- */

  const label = (card) => card.textContent.replace(/\s+/g, " ").trim();
  const statusOf = (card) => card.closest(".col").dataset.status;

  function refresh() {
    cols.forEach((col) => {
      const n = col.querySelectorAll(".card").length;
      col.querySelector("[data-count]").textContent = String(n);
    });
    // Persistence boundary: replace with your own save call.
    // save(cols.map(c => ({ status: c.dataset.status,
    //   cards: [...c.querySelectorAll(".card")].map(label) })));
  }

  function announce(card) {
    const list = card.parentElement;
    const index = [...list.querySelectorAll(".card")].indexOf(card) + 1;
    const total = list.querySelectorAll(".card").length;
    live.textContent = `"${label(card)}" moved to ${statusOf(card)}, position ${index} of ${total}.`;
  }

  function settle(card) {
    card.classList.remove("just-moved");
    void card.offsetWidth;
    card.classList.add("just-moved");
    refresh();
    announce(card);
  }

  /* ---------- pointer / HTML5 drag & drop ---------- */

  // Given a list and a pointer Y, find the card the dragged item should sit before.
  function cardAfter(list, y) {
    const candidates = [...list.querySelectorAll(".card:not(.dragging)")];
    return candidates.find((card) => {
      const box = card.getBoundingClientRect();
      return y < box.top + box.height / 2;
    }) || null;
  }

  board.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    dragged = card;
    card.classList.add("dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // Some browsers require data to be set for the drag to begin.
      e.dataTransfer.setData("text/plain", label(card));
    }
  });

  board.addEventListener("dragend", () => {
    if (!dragged) return;
    dragged.classList.remove("dragging");
    placeholder.remove();
    cols.forEach((c) => c.classList.remove("is-over"));
    dragged = null;
  });

  cols.forEach((col, i) => {
    const list = lists[i];

    col.addEventListener("dragover", (e) => {
      if (!dragged) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      cols.forEach((c) => c.classList.toggle("is-over", c === col));
      const before = cardAfter(list, e.clientY);
      if (before) list.insertBefore(placeholder, before);
      else list.appendChild(placeholder);
    });

    col.addEventListener("dragleave", (e) => {
      if (!col.contains(e.relatedTarget)) col.classList.remove("is-over");
    });

    col.addEventListener("drop", (e) => {
      if (!dragged) return;
      e.preventDefault();
      const card = dragged;
      if (placeholder.parentElement === list) list.replaceChild(card, placeholder);
      else list.appendChild(card);
      placeholder.remove();
      card.classList.remove("dragging");
      cols.forEach((c) => c.classList.remove("is-over"));
      dragged = null;
      settle(card);
      card.focus();
    });
  });

  /* ---------- keyboard fallback ---------- */

  board.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const list = card.parentElement;
    const colIndex = lists.indexOf(list);
    const siblings = [...list.querySelectorAll(".card")];
    const pos = siblings.indexOf(card);
    let moved = false;

    if (e.key === "ArrowLeft" && colIndex > 0) {
      lists[colIndex - 1].appendChild(card);
      moved = true;
    } else if (e.key === "ArrowRight" && colIndex < lists.length - 1) {
      lists[colIndex + 1].appendChild(card);
      moved = true;
    } else if (e.key === "ArrowUp" && pos > 0) {
      list.insertBefore(card, siblings[pos - 1]);
      moved = true;
    } else if (e.key === "ArrowDown" && pos < siblings.length - 1) {
      list.insertBefore(card, siblings[pos + 1].nextSibling);
      moved = true;
    }

    if (moved) {
      e.preventDefault();
      settle(card);
      card.focus();
    }
  });

  refresh();
})();
