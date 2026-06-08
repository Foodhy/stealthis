(function () {
  "use strict";

  const groups = Array.from(document.querySelectorAll(".group"));
  const rows = Array.from(document.querySelectorAll(".row"));
  const navList = document.getElementById("section-nav");
  const estimate = document.getElementById("estimate");
  const estCount = document.getElementById("estimate-count");
  const estTotal = document.getElementById("estimate-total");
  const estBook = document.getElementById("estimate-book");
  const estClear = document.getElementById("estimate-clear");

  /* ── Toast helper ──────────────────────────── */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ── Build sticky section nav from groups ──── */
  groups.forEach((g) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sectionnav__btn";
    btn.textContent = g.dataset.group;
    btn.dataset.target = g.id;
    btn.addEventListener("click", () => {
      const target = document.getElementById(g.id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus({ preventScroll: true });
    });
    li.appendChild(btn);
    navList.appendChild(li);
  });
  const navBtns = Array.from(navList.querySelectorAll(".sectionnav__btn"));

  /* ── Scroll-spy: highlight active section ──── */
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navBtns.forEach((b) =>
            b.classList.toggle("is-active", b.dataset.target === id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  groups.forEach((g) => spy.observe(g));

  /* ── Selection / running estimate ──────────── */
  const selected = new Map(); // name -> { price, from }

  function fmt(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function renderEstimate() {
    const count = selected.size;
    if (count === 0) {
      estimate.hidden = true;
      return;
    }
    estimate.hidden = false;

    let total = 0;
    let hasFrom = false;
    selected.forEach((v) => {
      total += v.price;
      if (v.from) hasFrom = true;
    });

    estCount.textContent =
      count + (count === 1 ? " service selected" : " services selected");
    estTotal.innerHTML = hasFrom
      ? '<span class="from">from</span>' + fmt(total)
      : fmt(total);
  }

  function toggleRow(row) {
    const name = row.dataset.name.replace(/&amp;/g, "&");
    const price = parseInt(row.dataset.price, 10) || 0;
    const from = row.dataset.from === "true";

    if (selected.has(name)) {
      selected.delete(name);
      row.classList.remove("is-selected");
      row.setAttribute("aria-pressed", "false");
    } else {
      selected.set(name, { price, from });
      row.classList.add("is-selected");
      row.setAttribute("aria-pressed", "true");
      toast(name + " added to your visit");
    }
    renderEstimate();
  }

  rows.forEach((row) => {
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-pressed", "false");
    const label = row.querySelector(".row__name").textContent.trim();
    const price = row.querySelector(".row__price").textContent.trim();
    row.setAttribute("aria-label", label + ", " + price + ". Add to visit.");

    row.addEventListener("click", () => toggleRow(row));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleRow(row);
      }
    });
  });

  estClear.addEventListener("click", () => {
    selected.clear();
    rows.forEach((r) => {
      r.classList.remove("is-selected");
      r.setAttribute("aria-pressed", "false");
    });
    renderEstimate();
    toast("Selection cleared");
  });

  estBook.addEventListener("click", () => {
    const count = selected.size;
    if (!count) return;
    toast(
      "Reserved " +
        count +
        (count === 1 ? " service" : " services") +
        " with Aria Vance — see you soon"
    );
    selected.clear();
    rows.forEach((r) => {
      r.classList.remove("is-selected");
      r.setAttribute("aria-pressed", "false");
    });
    renderEstimate();
  });

  /* ── Generic booking buttons ───────────────── */
  document.querySelectorAll("[data-book]").forEach((el) => {
    el.addEventListener("click", () => {
      toast("Booking request sent for " + el.dataset.book + " — we'll confirm shortly");
    });
  });

  renderEstimate();
})();
