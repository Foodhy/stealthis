(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------------- Toast ---------------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ---------------- Mobile nav drawer ---------------- */
  const sidebar = $("#sidebar");
  const navToggle = $("#navToggle");
  const scrim = $("#scrim");

  function setNav(open) {
    sidebar.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    scrim.hidden = !open;
  }
  navToggle.addEventListener("click", () => setNav(!sidebar.classList.contains("open")));
  scrim.addEventListener("click", () => setNav(false));

  /* ---------------- Endpoint filter (left nav search) ---------------- */
  const navSearch = $("#navSearch");
  navSearch.addEventListener("input", () => {
    const q = navSearch.value.trim().toLowerCase();
    $$(".nav-group").forEach((group) => {
      let visible = 0;
      $$(".nav-link", group).forEach((link) => {
        const match = link.textContent.toLowerCase().includes(q);
        link.hidden = q && !match;
        if (!link.hidden) visible++;
      });
      group.style.display = q && visible === 0 ? "none" : "";
    });
  });

  /* ---------------- Smooth anchor + close drawer ---------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + id);
      target.focus({ preventScroll: true });
      if (window.innerWidth <= 820) setNav(false);
    });
  });

  /* Anchor links inside endpoint heads -> copy deep link */
  $$(".anchor").forEach((a) => {
    a.addEventListener("click", () => {
      const url = location.href.split("#")[0] + a.getAttribute("href");
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => toast("Link copied"), () => {});
      }
    });
  });

  /* ---------------- TOC scrollspy ---------------- */
  const sections = $$("section.block");
  const navLinks = $$(".nav-link");
  const linkById = new Map();
  navLinks.forEach((l) => {
    const id = (l.getAttribute("href") || "").slice(1);
    if (id) linkById.set(id, l);
  });

  function setActive(id) {
    navLinks.forEach((l) => l.classList.remove("is-active"));
    const link = linkById.get(id);
    if (link) {
      link.classList.add("is-active");
      const scroll = $(".sidebar-scroll");
      if (scroll) {
        const lr = link.getBoundingClientRect();
        const sr = scroll.getBoundingClientRect();
        if (lr.top < sr.top + 40 || lr.bottom > sr.bottom - 40) {
          link.scrollIntoView({ block: "nearest" });
        }
      }
    }
  }

  if ("IntersectionObserver" in window) {
    const seen = new Map();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => seen.set(en.target.id, en.intersectionRatio));
        let bestId = null;
        let best = -1;
        sections.forEach((s) => {
          const r = seen.get(s.id) || 0;
          const top = s.getBoundingClientRect().top;
          if (top < 200 && r >= 0 && (r > best || (bestId === null))) {
            // prefer the last section whose top is above the trigger line
          }
        });
        // choose the section closest to (but above) the trigger line
        let chosen = null;
        sections.forEach((s) => {
          const top = s.getBoundingClientRect().top;
          if (top - 120 <= 0) chosen = s.id;
        });
        if (chosen) setActive(chosen);
      },
      { rootMargin: "-110px 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => obs.observe(s));
  }

  // also update on scroll for snappy highlight
  let raf;
  window.addEventListener(
    "scroll",
    () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        let chosen = sections[0] ? sections[0].id : null;
        sections.forEach((s) => {
          if (s.getBoundingClientRect().top - 120 <= 0) chosen = s.id;
        });
        if (chosen) setActive(chosen);
      });
    },
    { passive: true }
  );

  /* ---------------- Language tabs ---------------- */
  const langTabs = $$(".lang-tab");
  function selectLang(lang) {
    langTabs.forEach((t) => {
      const on = t.dataset.lang === lang;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    $$("[data-lang-pane]").forEach((p) => {
      p.hidden = p.getAttribute("data-lang-pane") !== lang;
    });
  }
  langTabs.forEach((t) => t.addEventListener("click", () => selectLang(t.dataset.lang)));

  /* ---------------- Copy buttons ---------------- */
  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      let text = "";
      if (btn.dataset.copy === "req") {
        const active = $('[data-lang-pane]:not([hidden])');
        text = active ? active.innerText : "";
      } else if (btn.dataset.copy === "res") {
        text = JSON.stringify(SAMPLE, null, 2);
      }
      const done = () => {
        const old = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("copied");
        toast("Copied to clipboard");
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove("copied");
        }, 1400);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done, () => toast("Copy failed"));
      } else {
        toast("Clipboard unavailable");
      }
    });
  });

  /* ---------------- Required-only param filters ---------------- */
  $$(".req-filter").forEach((cb) => {
    cb.addEventListener("change", () => {
      const wrap = cb.closest(".endpoint") || cb.closest(".block");
      const table = wrap ? $("table.params", wrap) : null;
      if (!table) return;
      let shown = 0;
      $$("tbody tr", table).forEach((row) => {
        const required = row.dataset.required === "true";
        row.hidden = cb.checked && !required;
        if (!row.hidden) shown++;
      });
      toast(cb.checked ? `Showing ${shown} required param${shown === 1 ? "" : "s"}` : "Showing all params");
    });
  });

  /* ---------------- Collapsible JSON tree ---------------- */
  const SAMPLE = {
    id: "clu_8Kdb20fA",
    object: "cluster",
    name: "prod-eu",
    region: "eu-west-3",
    tier: "verdant",
    status: "provisioning",
    encryption: true,
    replicas: [
      { id: "rep_01", role: "primary", healthy: true, lag_ms: 0 },
      { id: "rep_02", role: "read", healthy: true, lag_ms: 12 },
      { id: "rep_03", role: "read", healthy: true, lag_ms: 9 }
    ],
    latest_snapshot: null,
    created_at: "2026-06-08T14:22:05Z"
  };

  const treeEl = $("#jsonTree");

  function tokenFor(val) {
    if (val === null) return { cls: "jt-null", text: "null" };
    const t = typeof val;
    if (t === "string") return { cls: "jt-str", text: JSON.stringify(val) };
    if (t === "number") return { cls: "jt-num", text: String(val) };
    if (t === "boolean") return { cls: "jt-bool", text: String(val) };
    return null;
  }

  function makeRow(indent) {
    const row = document.createElement("div");
    row.className = "jt-row";
    row.style.paddingLeft = indent * 14 + "px";
    return row;
  }

  function punc(text) {
    const s = document.createElement("span");
    s.className = "jt-punc";
    s.textContent = text;
    return s;
  }

  function renderValue(container, value, indent, keyName, trailingComma) {
    const isArr = Array.isArray(value);
    const isObj = value && typeof value === "object";

    if (!isObj) {
      // leaf
      const row = makeRow(indent);
      if (keyName !== null) {
        const k = document.createElement("span");
        k.className = "jt-key";
        k.textContent = JSON.stringify(keyName);
        row.appendChild(k);
        row.appendChild(punc(": "));
      }
      const tok = tokenFor(value);
      const v = document.createElement("span");
      v.className = tok.cls;
      v.textContent = tok.text;
      row.appendChild(v);
      if (trailingComma) row.appendChild(punc(","));
      container.appendChild(row);
      return;
    }

    // object / array with a toggle
    const open = isArr ? "[" : "{";
    const close = isArr ? "]" : "}";
    const entries = isArr ? value.map((v, i) => [i, v]) : Object.entries(value);

    const headRow = makeRow(indent);
    const toggle = document.createElement("button");
    toggle.className = "jt-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Toggle node");
    toggle.textContent = "▾";
    headRow.appendChild(toggle);

    if (keyName !== null) {
      const k = document.createElement("span");
      k.className = "jt-key";
      k.textContent = JSON.stringify(keyName);
      headRow.appendChild(k);
      headRow.appendChild(punc(": "));
    }
    headRow.appendChild(punc(open));

    const hint = document.createElement("span");
    hint.className = "jt-collapsed-hint";
    hint.textContent = " " + entries.length + (isArr ? " items " : " keys ") + close;
    hint.style.display = "none";
    headRow.appendChild(hint);

    container.appendChild(headRow);

    const children = document.createElement("div");
    children.className = "jt-children";
    container.appendChild(children);

    entries.forEach(([k, v], i) => {
      renderValue(children, v, indent + 1, isArr ? null : k, i < entries.length - 1);
    });

    const closeRow = makeRow(indent);
    closeRow.appendChild(punc(close));
    if (trailingComma) closeRow.appendChild(punc(","));
    container.appendChild(closeRow);

    toggle.addEventListener("click", () => {
      const collapsed = children.classList.toggle("hidden");
      toggle.classList.toggle("collapsed", collapsed);
      closeRow.style.display = collapsed ? "none" : "";
      hint.style.display = collapsed ? "" : "none";
    });
  }

  if (treeEl) {
    treeEl.innerHTML = "";
    renderValue(treeEl, SAMPLE, 0, null, false);
  }

  /* ---------------- Keyboard shortcut: "/" focuses filter ---------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== navSearch) {
      const tag = (document.activeElement.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      e.preventDefault();
      navSearch.focus();
    }
    if (e.key === "Escape" && sidebar.classList.contains("open")) setNav(false);
  });

  // Open from initial hash
  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ block: "start" }), 60);
  }
})();
