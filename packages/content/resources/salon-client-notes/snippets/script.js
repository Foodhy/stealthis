(function () {
  "use strict";

  /* ---------- In-memory state ---------- */
  const state = {
    preferences: [
      "Prefers cooler tones",
      "No fragrance",
      "Gloss finish, not matte",
      "Books mornings only",
    ],
    products: [
      {
        name: "Olaplex No.3",
        detail: "Bond builder · pre-color treatment",
        tag: "In use",
        swatch: "#c9a78f",
      },
      {
        name: "Wella Koleston 7/1",
        detail: "Ash base · 20 vol developer",
        tag: "Formula",
        swatch: "#8a7d70",
      },
      {
        name: "Kérastase Blond Absolu",
        detail: "Purple mask · every 3rd wash",
        tag: "Home",
        swatch: "#b6a0c4",
      },
      {
        name: "Davines OI Oil",
        detail: "Finishing — fragrance-free swap",
        tag: "Swapped",
        swatch: "#b08d57",
      },
    ],
    notes: [
      {
        ts: "May 18, 2026 · 10:42 AM",
        text: "Half-head babylights + gloss refresh. Loved the cooler result — keep developer at 20 vol max next time.",
      },
      {
        ts: "Mar 02, 2026 · 9:15 AM",
        text: "Patch test passed for new ash line. Scalp calm throughout. Booked 8-week return.",
      },
    ],
  };

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };

  let toastTimer = null;
  const toastNode = $("#toast");
  function toast(msg) {
    toastNode.textContent = msg;
    toastNode.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNode.classList.remove("show"), 2400);
  }

  function stamp() {
    const d = new Date();
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return date + " · " + time;
  }

  /* ---------- Preferences ---------- */
  const chipList = $("#chip-list");
  const prefCount = $("#pref-count");

  function renderChips() {
    chipList.innerHTML = "";
    if (state.preferences.length === 0) {
      const empty = el("li", "chip-empty");
      empty.textContent = "No preferences saved yet.";
      chipList.appendChild(empty);
    } else {
      state.preferences.forEach((pref, i) => {
        const li = el("li", "chip");

        const label = document.createElement("span");
        label.textContent = pref;

        const x = el("button", "chip__x");
        x.type = "button";
        x.innerHTML = "&times;";
        x.setAttribute("aria-label", "Remove preference: " + pref);
        x.dataset.index = String(i);

        li.appendChild(label);
        li.appendChild(x);
        chipList.appendChild(li);
      });
    }
    const n = state.preferences.length;
    prefCount.textContent = n + (n === 1 ? " cue" : " cues");
  }

  chipList.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip__x");
    if (!btn) return;
    const i = Number(btn.dataset.index);
    const [removed] = state.preferences.splice(i, 1);
    renderChips();
    toast("Removed “" + removed + "”");
  });

  $("#chip-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chip-input");
    const value = input.value.trim();
    if (!value) return;
    const exists = state.preferences.some(
      (p) => p.toLowerCase() === value.toLowerCase()
    );
    if (exists) {
      toast("That preference is already saved");
      input.select();
      return;
    }
    state.preferences.push(value);
    input.value = "";
    input.focus();
    renderChips();
    toast("Preference added");
  });

  /* ---------- Product history ---------- */
  function renderProducts() {
    const list = $("#product-list");
    list.innerHTML = "";
    state.products.forEach((p) => {
      const li = el("li", "product");

      const swatch = el("span", "product__swatch");
      swatch.style.background = p.swatch;
      swatch.setAttribute("aria-hidden", "true");

      const body = el("div");
      const name = el("div", "product__name");
      name.textContent = p.name;
      const detail = el("div", "product__detail");
      detail.textContent = p.detail;
      body.appendChild(name);
      body.appendChild(detail);

      const tag = el("span", "product__tag");
      tag.textContent = p.tag;

      li.appendChild(swatch);
      li.appendChild(body);
      li.appendChild(tag);
      list.appendChild(li);
    });
  }

  /* ---------- Notes ---------- */
  const noteList = $("#note-list");
  const noteCount = $("#note-count");

  function renderNotes() {
    noteList.innerHTML = "";
    state.notes.forEach((note) => {
      const li = el("li", "entry");
      const time = el("p", "entry__time");
      time.textContent = note.ts;
      const text = el("p", "entry__text");
      text.textContent = note.text;
      li.appendChild(time);
      li.appendChild(text);
      noteList.appendChild(li);
    });
    const n = state.notes.length;
    noteCount.textContent = n + (n === 1 ? " entry" : " entries");
  }

  $("#note-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#note-input");
    const value = input.value.trim();
    if (!value) {
      toast("Write a note first");
      input.focus();
      return;
    }
    state.notes.unshift({ ts: stamp(), text: value });
    input.value = "";
    input.focus();
    renderNotes();
    toast("Note saved");
  });

  /* ---------- Init ---------- */
  renderChips();
  renderProducts();
  renderNotes();
  $("#visit-count").textContent = String(24);
})();
