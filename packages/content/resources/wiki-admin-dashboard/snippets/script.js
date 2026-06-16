(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const SVGNS = "http://www.w3.org/2000/svg";

  function el(tag, attrs) {
    const node = document.createElementNS(SVGNS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function fmtCompact(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 1 : 1).replace(/\.0$/, "") + "k";
    return String(Math.round(n));
  }
  function fmtInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  /* ------------------------------------------------------------------ */
  /* Toast                                                              */
  /* ------------------------------------------------------------------ */
  const toastHost = $("#toastHost");
  function toast(msg, icon = "✓") {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="toast-ico"></span><span class="toast-msg"></span>';
    t.querySelector(".toast-ico").textContent = icon;
    t.querySelector(".toast-msg").textContent = msg;
    toastHost.appendChild(t);
    setTimeout(() => {
      t.classList.add("is-out");
      t.addEventListener("animationend", () => t.remove(), { once: true });
    }, 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Sidebar drawer                                                     */
  /* ------------------------------------------------------------------ */
  const sidebar = $("#sidebar");
  const scrim = $("#scrim");
  const menuBtn = $("#menuBtn");
  function openNav() {
    sidebar.classList.add("is-open");
    scrim.classList.add("is-open");
    scrim.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    sidebar.classList.remove("is-open");
    scrim.classList.remove("is-open");
    scrim.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", () =>
    sidebar.classList.contains("is-open") ? closeNav() : openNav()
  );
  scrim.addEventListener("click", closeNav);
  $$(".sidebar .nav-item").forEach((a) =>
    a.addEventListener("click", () => {
      if (window.innerWidth <= 820) closeNav();
    })
  );

  /* ------------------------------------------------------------------ */
  /* Count-up KPIs                                                       */
  /* ------------------------------------------------------------------ */
  function countUp(node) {
    const target = parseFloat(node.dataset.count);
    const decimals = parseInt(node.dataset.decimals || "0", 10);
    const suffix = node.dataset.suffix || "";
    const compact = node.dataset.format === "compact";
    const dur = 1100;
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      let text;
      if (compact) text = fmtCompact(val);
      else if (decimals > 0) text = val.toFixed(decimals);
      else text = fmtInt(val);
      node.textContent = text + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const kpiNodes = $$(".kpi-value");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            countUp(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    kpiNodes.forEach((n) => io.observe(n));
  } else {
    kpiNodes.forEach(countUp);
  }

  /* ------------------------------------------------------------------ */
  /* Chart data + rendering                                             */
  /* ------------------------------------------------------------------ */
  // Deterministic pseudo-random series so demo looks stable per range.
  function series(range) {
    const pts = range === 7 ? 7 : range === 30 ? 15 : 18;
    const out = [];
    let seed = range * 9301 + 49297;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const baseViews = range === 7 ? 1500 : range === 30 ? 1450 : 1300;
    const now = Date.now();
    const stepDays = range / (pts - 1);
    for (let i = 0; i < pts; i++) {
      const wave = Math.sin(i / 2.1) * 240 + Math.sin(i / 5) * 160;
      const views = Math.max(420, Math.round(baseViews + wave + (rnd() - 0.4) * 420 + i * 6));
      const searches = Math.max(120, Math.round(views * (0.32 + rnd() * 0.08)));
      const d = new Date(now - (range - i * stepDays) * 86400000);
      out.push({
        date: d,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views,
        searches,
      });
    }
    return out;
  }

  const chart = $("#chart");
  const gridG = $("#gridLines");
  const areaViews = $("#areaViews");
  const lineViews = $("#lineViews");
  const lineSearch = $("#lineSearch");
  const pointsG = $("#points");
  const chartX = $("#chartX");
  const tip = $("#chartTip");
  const chartWrap = $(".chart-wrap");
  const W = 800, H = 260, padL = 8, padR = 8, padT = 14, padB = 18;

  // gradient def for area fill
  (function injectGrad() {
    const defs = el("defs", {});
    const grad = el("linearGradient", { id: "viewsGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(el("stop", { offset: "0", "stop-color": "#2563eb" }));
    grad.appendChild(el("stop", { offset: "1", "stop-color": "#2563eb", "stop-opacity": "0" }));
    defs.appendChild(grad);
    chart.insertBefore(defs, chart.firstChild);
  })();

  function renderChart(range) {
    const data = series(range);
    const maxV = Math.max(...data.map((d) => d.views)) * 1.12;
    const n = data.length;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const x = (i) => padL + (innerW * i) / (n - 1);
    const y = (v) => padT + innerH - (v / maxV) * innerH;

    // grid + y labels
    gridG.textContent = "";
    const rows = 4;
    for (let r = 0; r <= rows; r++) {
      const gv = (maxV / rows) * r;
      const gy = y(gv);
      gridG.appendChild(el("line", { x1: padL, y1: gy, x2: W - padR, y2: gy }));
      const tx = document.createElementNS(SVGNS, "text");
      tx.setAttribute("x", padL);
      tx.setAttribute("y", gy - 3);
      tx.textContent = fmtCompact(gv);
      gridG.appendChild(tx);
    }

    const linePath = (key) =>
      data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");

    const vp = linePath("views");
    lineViews.setAttribute("d", vp);
    lineSearch.setAttribute("d", linePath("searches"));
    areaViews.setAttribute(
      "d",
      `${vp} L${x(n - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${x(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`
    );

    // animate stroke
    [lineViews, lineSearch].forEach((p) => {
      const len = p.getTotalLength();
      p.style.transition = "none";
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      // force reflow
      void p.getBoundingClientRect();
      p.style.transition = "stroke-dashoffset 0.7s ease";
      p.style.strokeDashoffset = "0";
    });

    // points
    pointsG.textContent = "";
    data.forEach((d, i) => {
      ["searches", "views"].forEach((key) => {
        const c = el("circle", {
          cx: x(i),
          cy: y(d[key]),
          r: n > 12 ? 3 : 3.6,
          class: "dot " + (key === "views" ? "dot-views" : "dot-search"),
        });
        c.addEventListener("mouseenter", () => showTip(d, x(i), Math.min(y(d.views), y(d.searches))));
        c.addEventListener("mouseleave", hideTip);
        pointsG.appendChild(c);
      });
    });

    // x axis labels (show a subset)
    chartX.textContent = "";
    const labelEvery = Math.ceil(n / 6);
    data.forEach((d, i) => {
      if (i % labelEvery === 0 || i === n - 1) {
        const s = document.createElement("span");
        s.textContent = d.label;
        chartX.appendChild(s);
      }
    });

    $("#rangeLabel").textContent = "last " + range + " days";
  }

  function showTip(d, px, py) {
    const rect = chart.getBoundingClientRect();
    const sx = (px / W) * rect.width;
    const sy = (py / H) * rect.height;
    tip.hidden = false;
    tip.innerHTML =
      '<span class="tt-date">' +
      d.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
      "</span>" +
      '<span class="tt-views">● <b>' + fmtInt(d.views) + "</b> views</span><br>" +
      '<span class="tt-search">● <b>' + fmtInt(d.searches) + "</b> searches</span>";
    tip.style.left = sx + chartWrap.querySelector(".chart").offsetLeft + "px";
    tip.style.top = sy + chart.offsetTop + "px";
  }
  function hideTip() {
    tip.hidden = true;
  }

  // range toggle
  $$(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".seg-btn").forEach((b) => {
        b.classList.remove("is-active");
        b.removeAttribute("aria-pressed");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      renderChart(parseInt(btn.dataset.range, 10));
    });
  });

  renderChart(30);
  window.addEventListener("resize", () => hideTip());

  /* ------------------------------------------------------------------ */
  /* Top articles table (sortable)                                      */
  /* ------------------------------------------------------------------ */
  const articles = [
    { title: "Connecting Aurora DB over TLS", space: "Aurora DB", views: 8420, helpful: 94, updated: "2026-06-02" },
    { title: "Project Nimbus: deploy from CLI", space: "Project Nimbus", views: 6315, helpful: 91, updated: "2026-05-28" },
    { title: "Verdant API rate limits explained", space: "Verdant API", views: 5890, helpful: 88, updated: "2026-06-04" },
    { title: "Resetting your workspace password", space: "Onboarding", views: 5120, helpful: 79, updated: "2026-03-11" },
    { title: "Migrating from v3 to v4 schema", space: "Aurora DB", views: 4730, helpful: 72, updated: "2026-01-19" },
    { title: "Webhooks & event subscriptions", space: "Verdant API", views: 4210, helpful: 90, updated: "2026-05-30" },
    { title: "Backups, restores, and PITR", space: "Aurora DB", views: 3980, helpful: 86, updated: "2026-04-22" },
    { title: "Single sign-on with SAML", space: "Onboarding", views: 3540, helpful: 61, updated: "2025-11-14" },
  ];

  const topBody = $("#topBody");
  let sortKey = "title";
  let sortDir = "desc"; // matches default header

  function helpClass(h) {
    return h >= 85 ? "help-good" : h >= 70 ? "help-mid" : "help-low";
  }
  function staleDays(dateStr) {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }
  function relUpdated(dateStr) {
    const days = staleDays(dateStr);
    if (days > 120) return { text: days + "d ago", stale: true };
    if (days > 30) return { text: Math.round(days / 30) + "mo ago", stale: false };
    return { text: days + "d ago", stale: false };
  }

  function renderTable() {
    const sorted = articles.slice().sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "updated") {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });

    topBody.innerHTML = sorted
      .map((a) => {
        const u = relUpdated(a.updated);
        return (
          "<tr>" +
          '<td><span class="art-title">' + a.title + '</span><span class="art-space">' + a.space + "</span></td>" +
          '<td class="num">' + fmtInt(a.views) + "</td>" +
          '<td class="num"><span class="help-bar"><span class="help-track"><span class="help-fill ' +
          helpClass(a.helpful) + '" style="width:' + a.helpful + '%"></span></span>' + a.helpful + "%</span></td>" +
          '<td class="num' + (u.stale ? " cell-stale" : "") + '">' + (u.stale ? "⚑ " : "") + u.text + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  $$("#topTable th.sortable").forEach((th) => {
    th.querySelector("button").addEventListener("click", () => {
      const key = th.dataset.key;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = th.dataset.type === "text" ? "asc" : "desc";
      }
      $$("#topTable th").forEach((h) => h.classList.remove("is-sorted-asc", "is-sorted-desc"));
      th.classList.add(sortDir === "asc" ? "is-sorted-asc" : "is-sorted-desc");
      renderTable();
    });
  });
  renderTable();

  /* ------------------------------------------------------------------ */
  /* Needs attention                                                    */
  /* ------------------------------------------------------------------ */
  const attentionData = [
    {
      id: "a1", type: "stale", icon: "⚑", iconCls: "att-stale", tagCls: "tag-stale", tag: "Stale",
      name: "Migrating from v3 to v4 schema",
      detail: "Last edited 140 days ago — references a deprecated migration tool.",
    },
    {
      id: "a2", type: "rating", icon: "♥", iconCls: "att-rating", tagCls: "tag-rating", tag: "Low rated",
      name: "Single sign-on with SAML",
      detail: "Helpfulness dropped to 61% over 38 votes. 9 readers left feedback.",
    },
    {
      id: "a3", type: "link", icon: "⛓", iconCls: "att-link", tagCls: "tag-link", tag: "Broken link",
      name: "Resetting your workspace password",
      detail: "2 outbound links return 404 (status.aurora.dev, /legacy/reset).",
    },
    {
      id: "a4", type: "stale", icon: "⚑", iconCls: "att-stale", tagCls: "tag-stale", tag: "Stale",
      name: "Verdant API authentication tokens",
      detail: "No edits since the v4 token format shipped 96 days ago.",
    },
  ];

  const attentionList = $("#attentionList");
  const attentionEmpty = $("#attentionEmpty");
  const attentionCount = $("#attentionCount");
  const navAttentionCount = $("#navAttentionCount");
  let openFlags = attentionData.length;

  function renderAttention() {
    attentionList.innerHTML = attentionData
      .map(
        (a) =>
          '<li class="attention-item" data-id="' + a.id + '">' +
          '<span class="att-icon ' + a.iconCls + '">' + a.icon + "</span>" +
          '<div class="att-body">' +
          '<div class="att-top"><span class="att-name">' + a.name + "</span>" +
          '<span class="att-tag ' + a.tagCls + '">' + a.tag + "</span></div>" +
          '<p class="att-detail">' + a.detail + "</p></div>" +
          '<div class="att-actions">' +
          '<button class="att-btn is-resolve" data-act="resolve" type="button">Resolve</button>' +
          '<button class="att-btn" data-act="dismiss" type="button">Dismiss</button>' +
          "</div></li>"
      )
      .join("");
  }

  function updateCounts() {
    attentionCount.textContent = openFlags;
    navAttentionCount.textContent = openFlags;
    navAttentionCount.style.display = openFlags === 0 ? "none" : "";
    attentionEmpty.hidden = openFlags !== 0;
  }

  attentionList.addEventListener("click", (e) => {
    const btn = e.target.closest(".att-btn");
    if (!btn) return;
    const item = btn.closest(".attention-item");
    const id = item.dataset.id;
    const act = btn.dataset.act;
    item.classList.add("is-removing");
    item.addEventListener(
      "transitionend",
      () => {
        const idx = attentionData.findIndex((a) => a.id === id);
        if (idx > -1) attentionData.splice(idx, 1);
        openFlags = attentionData.length;
        item.remove();
        updateCounts();
      },
      { once: true }
    );
    toast(
      act === "resolve" ? "Flag resolved and re-indexed" : "Flag dismissed",
      act === "resolve" ? "✓" : "↪"
    );
  });

  renderAttention();
  updateCounts();

  /* ------------------------------------------------------------------ */
  /* Activity feed                                                      */
  /* ------------------------------------------------------------------ */
  const feedData = [
    { who: "Dao Lin", init: "DL", color: "#2563eb", action: "edit", actCls: "fa-edit", verb: "edited", art: "Connecting Aurora DB over TLS", when: "4 min ago" },
    { who: "Mara Reyes", init: "MR", color: "#7c3aed", action: "publish", actCls: "fa-publish", verb: "published", art: "Verdant API rate limits explained", when: "26 min ago" },
    { who: "Ines Okafor", init: "IO", color: "#db2777", action: "revert", actCls: "fa-revert", verb: "reverted", art: "Webhooks & event subscriptions", when: "1 hr ago" },
    { who: "Tomas Vega", init: "TV", color: "#0891b2", action: "edit", actCls: "fa-edit", verb: "edited", art: "Backups, restores, and PITR", when: "3 hr ago" },
    { who: "Mara Reyes", init: "MR", color: "#7c3aed", action: "archive", actCls: "fa-archive", verb: "archived", art: "Legacy v2 setup guide", when: "Yesterday" },
    { who: "Dao Lin", init: "DL", color: "#2563eb", action: "edit", actCls: "fa-edit", verb: "edited", art: "Project Nimbus: deploy from CLI", when: "Yesterday" },
  ];

  $("#feed").innerHTML = feedData
    .map(
      (f) =>
        '<li class="feed-item">' +
        '<span class="feed-avatar" style="background:' + f.color + '">' + f.init + "</span>" +
        '<div class="feed-body">' +
        '<p class="feed-text"><b>' + f.who + "</b> " + f.verb + ' <a href="#main">' + f.art + "</a></p>" +
        '<p class="feed-meta"><span class="feed-action ' + f.actCls + '">' + f.action + "</span><span>" + f.when + "</span></p>" +
        "</div></li>"
    )
    .join("");

  /* ------------------------------------------------------------------ */
  /* Search + misc                                                      */
  /* ------------------------------------------------------------------ */
  const kbSearch = $("#kbSearch");
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== kbSearch && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      kbSearch.focus();
    }
    if (e.key === "Escape") {
      kbSearch.blur();
      if (sidebar.classList.contains("is-open")) closeNav();
    }
  });
  kbSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && kbSearch.value.trim()) {
      toast('Searching for "' + kbSearch.value.trim() + '" across 713 articles', "⌕");
    }
  });

  $("#refreshBtn").addEventListener("click", () => {
    const btn = $("#refreshBtn");
    btn.disabled = true;
    btn.textContent = "↻ Syncing…";
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "↻ Sync";
      toast("Knowledge base re-synced — 713 articles indexed");
    }, 900);
  });
})();
