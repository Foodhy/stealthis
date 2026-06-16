/* Widget — Resizable widget card frame
   Vanilla JS only. No frameworks, no chart libs. */
(() => {
  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function fmtMoney(n) {
    return "$" + (n / 1000).toFixed(1) + "K";
  }

  function fmtInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function ns(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  /* ------------------------------------------------------------------ */
  /* Chart renderers (inline SVG, no libraries)                          */
  /* ------------------------------------------------------------------ */
  var COLORS = ["#5b5bf0", "#00b4a6", "#d98a2b", "#6c7393"];

  function buildLine(data, opts) {
    opts = opts || {};
    var W = 320,
      H = 120,
      pad = 6;
    var max = Math.max.apply(null, data) * 1.08;
    var min = Math.min.apply(null, data) * 0.92;
    var span = max - min || 1;
    var step = (W - pad * 2) / (data.length - 1);
    var pts = data.map((v, i) => {
      var x = pad + i * step;
      var y = H - pad - ((v - min) / span) * (H - pad * 2);
      return [x, y];
    });
    var line = pts
      .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1))
      .join(" ");
    var area =
      "M" +
      pad +
      " " +
      (H - pad) +
      " " +
      pts.map((p) => "L" + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ") +
      " L" +
      (W - pad) +
      " " +
      (H - pad) +
      " Z";

    var uid = "g" + Math.random().toString(36).slice(2, 7);
    var svg = ns("svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Line trend chart");

    var defs = ns("defs");
    var grad = ns("linearGradient");
    grad.setAttribute("id", uid);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    var s1 = ns("stop");
    s1.setAttribute("offset", "0%");
    s1.setAttribute("stop-color", "#5b5bf0");
    s1.setAttribute("stop-opacity", "0.22");
    var s2 = ns("stop");
    s2.setAttribute("offset", "100%");
    s2.setAttribute("stop-color", "#5b5bf0");
    s2.setAttribute("stop-opacity", "0");
    grad.appendChild(s1);
    grad.appendChild(s2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    // gridlines
    for (var g = 1; g < 4; g++) {
      var gy = pad + ((H - pad * 2) / 4) * g;
      var gl = ns("line");
      gl.setAttribute("x1", pad);
      gl.setAttribute("x2", W - pad);
      gl.setAttribute("y1", gy);
      gl.setAttribute("y2", gy);
      gl.setAttribute("stroke", "rgba(16,19,34,0.07)");
      gl.setAttribute("stroke-width", "1");
      svg.appendChild(gl);
    }

    var fill = ns("path");
    fill.setAttribute("d", area);
    fill.setAttribute("fill", "url(#" + uid + ")");
    svg.appendChild(fill);

    var path = ns("path");
    path.setAttribute("d", line);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#5b5bf0");
    path.setAttribute("stroke-width", "2.4");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);

    // end dot
    var last = pts[pts.length - 1];
    var dot = ns("circle");
    dot.setAttribute("cx", last[0]);
    dot.setAttribute("cy", last[1]);
    dot.setAttribute("r", "3.2");
    dot.setAttribute("fill", "#5b5bf0");
    dot.setAttribute("stroke", "#fff");
    dot.setAttribute("stroke-width", "1.6");
    svg.appendChild(dot);

    return svg;
  }

  function buildBars(data) {
    var W = 320,
      H = 120,
      pad = 6,
      gap = 10;
    var max = Math.max.apply(null, data) * 1.05;
    var bw = (W - pad * 2 - gap * (data.length - 1)) / data.length;
    var svg = ns("svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Bar chart by channel");

    data.forEach((v, i) => {
      var h = (v / max) * (H - pad * 2);
      var x = pad + i * (bw + gap);
      var y = H - pad - h;
      var r = ns("rect");
      r.setAttribute("x", x.toFixed(1));
      r.setAttribute("y", y.toFixed(1));
      r.setAttribute("width", bw.toFixed(1));
      r.setAttribute("height", Math.max(2, h).toFixed(1));
      r.setAttribute("rx", "4");
      r.setAttribute("fill", i === data.length - 1 ? "#00b4a6" : "#5b5bf0");
      r.setAttribute("opacity", i === data.length - 1 ? "1" : (0.55 + 0.45 * (v / max)).toFixed(2));
      svg.appendChild(r);
    });
    return svg;
  }

  function buildDonut(parts) {
    var total = parts.reduce((a, p) => a + p.v, 0);
    var wrap = document.createElement("div");
    wrap.className = "donut-wrap";

    var R = 42,
      C = 50,
      sw = 16,
      circ = 2 * Math.PI * R;
    var svg = ns("svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Plan mix donut chart");

    var track = ns("circle");
    track.setAttribute("cx", C);
    track.setAttribute("cy", C);
    track.setAttribute("r", R);
    track.setAttribute("fill", "none");
    track.setAttribute("stroke", "rgba(16,19,34,0.07)");
    track.setAttribute("stroke-width", sw);
    svg.appendChild(track);

    var offset = 0;
    parts.forEach((p, i) => {
      var frac = p.v / total;
      var seg = ns("circle");
      seg.setAttribute("cx", C);
      seg.setAttribute("cy", C);
      seg.setAttribute("r", R);
      seg.setAttribute("fill", "none");
      seg.setAttribute("stroke", COLORS[i % COLORS.length]);
      seg.setAttribute("stroke-width", sw);
      seg.setAttribute("stroke-dasharray", (frac * circ).toFixed(2) + " " + circ.toFixed(2));
      seg.setAttribute("stroke-dashoffset", (-offset * circ).toFixed(2));
      seg.setAttribute("transform", "rotate(-90 " + C + " " + C + ")");
      seg.setAttribute("stroke-linecap", "butt");
      svg.appendChild(seg);
      offset += frac;
    });

    var tNum = ns("text");
    tNum.setAttribute("x", C);
    tNum.setAttribute("y", C - 1);
    tNum.setAttribute("text-anchor", "middle");
    tNum.setAttribute("font-size", "15");
    tNum.setAttribute("font-weight", "800");
    tNum.setAttribute("fill", "#101322");
    tNum.textContent = fmtInt(total);
    svg.appendChild(tNum);

    var tLbl = ns("text");
    tLbl.setAttribute("x", C);
    tLbl.setAttribute("y", C + 12);
    tLbl.setAttribute("text-anchor", "middle");
    tLbl.setAttribute("font-size", "7");
    tLbl.setAttribute("font-weight", "600");
    tLbl.setAttribute("fill", "#6c7393");
    tLbl.textContent = "accounts";
    svg.appendChild(tLbl);

    wrap.appendChild(svg);

    var legend = document.createElement("ul");
    legend.className = "legend";
    parts.forEach((p, i) => {
      var li = document.createElement("li");
      var sw2 = document.createElement("span");
      sw2.className = "swatch";
      sw2.style.background = COLORS[i % COLORS.length];
      var k = document.createElement("span");
      k.className = "lk";
      k.textContent = p.k;
      var v = document.createElement("span");
      v.className = "lv";
      v.textContent = Math.round((p.v / total) * 100) + "%";
      li.appendChild(sw2);
      li.appendChild(k);
      li.appendChild(v);
      legend.appendChild(li);
    });
    wrap.appendChild(legend);
    return wrap;
  }

  /* ------------------------------------------------------------------ */
  /* Per-widget data model + drawing                                     */
  /* ------------------------------------------------------------------ */
  function newSeries(n, lo, hi) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(rand(lo, hi));
    return a;
  }

  // seed each widget once, keyed off its chart type
  function seed(slot) {
    var type = slot.getAttribute("data-chart");
    if (type === "line") {
      return { type: type, data: newSeries(28, 140000, 192000) };
    } else if (type === "bars") {
      return { type: type, data: newSeries(4, 1800, 4600) };
    } else {
      return {
        type: "donut",
        parts: [
          { k: "Starter", v: 1480 },
          { k: "Team", v: 1120 },
          { k: "Business", v: 410 },
          { k: "Enterprise", v: 200 },
        ],
      };
    }
  }

  function drawSlot(slot, state) {
    slot.textContent = "";
    if (state.type === "line") slot.appendChild(buildLine(state.data));
    else if (state.type === "bars") slot.appendChild(buildBars(state.data));
    else slot.appendChild(buildDonut(state.parts));
  }

  /* Recompute headline value + delta from the series. */
  function refreshFigure(widget, state) {
    var valEl = widget.querySelector(".w-value");
    var capEl = widget.querySelector(".w-cap");
    if (!valEl) return;
    var deltaEl = valEl.querySelector(".w-delta");

    var current, prior, display;
    if (state.type === "line") {
      current = state.data[state.data.length - 1];
      prior = state.data[Math.max(0, state.data.length - 8)];
      display = fmtMoney(current);
      if (capEl) capEl.textContent = "vs. " + fmtMoney(prior) + " prior period";
    } else if (state.type === "bars") {
      current = state.data.reduce((a, b) => a + b, 0);
      prior = state.prior || current;
      display = fmtInt(current);
      if (capEl) capEl.textContent = "across " + state.data.length + " channels";
    } else {
      return; // donut has no headline value row
    }

    // rebuild value text node, preserve delta chip
    valEl.childNodes[0]
      ? (valEl.childNodes[0].nodeValue = display)
      : valEl.insertBefore(document.createTextNode(display), valEl.firstChild);

    if (deltaEl) {
      var pct = prior ? ((current - prior) / prior) * 100 : 0;
      var up = pct >= 0;
      deltaEl.className = "w-delta " + (up ? "is-up" : "is-down");
      deltaEl.textContent = (up ? "▲ " : "▼ ") + Math.abs(pct).toFixed(1) + "%";
      deltaEl.setAttribute(
        "aria-label",
        (up ? "up " : "down ") + Math.abs(pct).toFixed(1) + " percent"
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /* Init widgets                                                        */
  /* ------------------------------------------------------------------ */
  var widgets = Array.prototype.slice.call(document.querySelectorAll(".widget"));

  widgets.forEach((widget) => {
    var slot = widget.querySelector(".chart-slot");
    if (!slot) return;
    widget.__state = seed(slot);
    drawSlot(slot, widget.__state);
    refreshFigure(widget, widget.__state);
    wireMenu(widget);
    wireSizeToggle(widget);
    wireDrag(widget);
  });

  /* ------------------------------------------------------------------ */
  /* Refresh: spinner -> new data                                        */
  /* ------------------------------------------------------------------ */
  function refreshWidget(widget, silent) {
    var body = widget.querySelector(".w-body");
    var slot = widget.querySelector(".chart-slot");
    if (!body || !slot) return;
    if (body.querySelector(".w-loading")) return; // already refreshing

    var overlay = document.createElement("div");
    overlay.className = "w-loading";
    overlay.innerHTML = '<div class="spinner" role="status" aria-label="Loading"></div>';
    body.appendChild(overlay);

    setTimeout(() => {
      var st = widget.__state;
      if (st.type === "line") {
        st.data = newSeries(28, 138000, 196000);
      } else if (st.type === "bars") {
        st.prior = st.data.reduce((a, b) => a + b, 0);
        st.data = newSeries(4, 1700, 4800);
      } else {
        st.parts = st.parts.map((p) => ({ k: p.k, v: Math.round(p.v * rand(0.9, 1.12)) }));
      }
      drawSlot(slot, st);
      refreshFigure(widget, st);
      overlay.remove();

      var stamp = widget.querySelector(".w-foot span:nth-child(2)");
      if (stamp) stamp.textContent = "Synced just now";
      if (!silent) toast("Widget refreshed");
    }, 720);
  }

  /* ------------------------------------------------------------------ */
  /* Menu popover + actions                                              */
  /* ------------------------------------------------------------------ */
  var openMenu = null;

  function closeMenus() {
    if (!openMenu) return;
    openMenu.menu.hidden = true;
    openMenu.btn.setAttribute("aria-expanded", "false");
    openMenu = null;
  }

  function wireMenu(widget) {
    var btn = widget.querySelector(".w-menu-btn");
    var menu = widget.querySelector(".menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      var isOpen = !menu.hidden;
      closeMenus();
      if (!isOpen) {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        openMenu = { menu: menu, btn: btn };
        var first = menu.querySelector("[role=menuitem]");
        if (first) first.focus();
      }
    });

    menu.addEventListener("keydown", (e) => {
      var items = Array.prototype.slice.call(menu.querySelectorAll("[role=menuitem]"));
      var idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      } else if (e.key === "Escape") {
        closeMenus();
        btn.focus();
      }
    });

    menu.querySelectorAll("[role=menuitem]").forEach((item) => {
      item.addEventListener("click", () => {
        var action = item.getAttribute("data-action");
        closeMenus();
        btn.focus();
        if (action === "refresh") refreshWidget(widget);
        else if (action === "expand") expandWidget(widget);
        else if (action === "remove") removeWidget(widget);
      });
    });
  }

  document.addEventListener("click", closeMenus);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenus();
  });

  /* ------------------------------------------------------------------ */
  /* Size toggle S / M / L                                               */
  /* ------------------------------------------------------------------ */
  function wireSizeToggle(widget) {
    var toggle = widget.querySelector(".size-toggle");
    if (!toggle) return;
    toggle.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        setSize(widget, b.getAttribute("data-set-size"));
      });
    });
  }

  function setSize(widget, size) {
    if (!size) return;
    widget.classList.remove("size-s", "size-m", "size-l");
    widget.classList.add("size-" + size);
    widget.setAttribute("data-size", size);
    widget.querySelectorAll(".size-toggle button").forEach((b) => {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-size") === size ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Expand -> modal                                                     */
  /* ------------------------------------------------------------------ */
  var overlay = document.getElementById("overlay");
  var modalBody = document.getElementById("modalBody");
  var modalTitle = document.getElementById("modalTitle");
  var modalClose = document.getElementById("modalClose");
  var lastFocused = null;

  function expandWidget(widget) {
    if (!overlay || !modalBody) return;
    lastFocused = document.activeElement;
    var title = widget.querySelector(".w-title h2");
    if (modalTitle) modalTitle.textContent = title ? title.textContent : "Widget detail";

    modalBody.textContent = "";
    var slot = document.createElement("div");
    slot.className = "chart-slot";
    modalBody.appendChild(slot);
    drawSlot(slot, widget.__state);

    // a small meta strip
    var meta = document.createElement("dl");
    meta.className = "modal-meta";
    var stats = [
      ["Range", "Last 30 days"],
      ["Confidence", "98.2%"],
      ["Owner", "Rae Aldridge"],
      ["Sources", "5 connected"],
    ];
    stats.forEach((s) => {
      var d = document.createElement("div");
      var dt = document.createElement("dt");
      dt.textContent = s[0];
      var dd = document.createElement("dd");
      dd.textContent = s[1];
      d.appendChild(dt);
      d.appendChild(dd);
      meta.appendChild(d);
    });
    modalBody.appendChild(meta);

    overlay.hidden = false;
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!overlay) return;
    overlay.hidden = true;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && !overlay.hidden) closeModal();
  });

  /* ------------------------------------------------------------------ */
  /* Remove with animation                                               */
  /* ------------------------------------------------------------------ */
  function removeWidget(widget) {
    widget.classList.add("is-removing");
    setTimeout(() => {
      widget.remove();
      toast("Widget removed");
    }, 220);
  }

  /* ------------------------------------------------------------------ */
  /* Drag to rearrange                                                   */
  /* ------------------------------------------------------------------ */
  var board = document.getElementById("board");
  var dragEl = null;

  function wireDrag(widget) {
    widget.addEventListener("dragstart", (e) => {
      dragEl = widget;
      widget.classList.add("is-dragging");
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setData("text/plain", "w");
        } catch (err) {}
      }
    });
    widget.addEventListener("dragend", () => {
      widget.classList.remove("is-dragging");
      widgets.forEach((w) => {
        w.classList.remove("drop-target");
      });
      dragEl = null;
    });
    widget.addEventListener("dragover", (e) => {
      if (!dragEl || dragEl === widget) return;
      e.preventDefault();
      widget.classList.add("drop-target");
    });
    widget.addEventListener("dragleave", () => {
      widget.classList.remove("drop-target");
    });
    widget.addEventListener("drop", (e) => {
      e.preventDefault();
      widget.classList.remove("drop-target");
      if (!dragEl || dragEl === widget || !board) return;
      var nodes = Array.prototype.slice.call(board.children);
      var from = nodes.indexOf(dragEl);
      var to = nodes.indexOf(widget);
      if (from < to) board.insertBefore(dragEl, widget.nextSibling);
      else board.insertBefore(dragEl, widget);
      toast("Layout updated");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Topbar: range select, add widget, mobile nav                        */
  /* ------------------------------------------------------------------ */
  var rangeSelect = document.getElementById("rangeSelect");
  if (rangeSelect) {
    rangeSelect.addEventListener("change", () => {
      widgets.forEach((w) => {
        refreshWidget(w, true);
      });
      var labels = { 7: "last 7 days", 30: "last 30 days", 90: "last quarter" };
      toast("Showing " + (labels[rangeSelect.value] || "range"));
    });
  }

  var addBtn = document.getElementById("addWidget");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      toast("Widget catalog coming soon");
    });
  }

  var navToggle = document.getElementById("navToggle");
  var app = document.querySelector(".app");
  if (navToggle && app) {
    navToggle.addEventListener("click", () => {
      app.classList.toggle("nav-open");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Live ticking — nudge the line widget so it feels alive              */
  /* ------------------------------------------------------------------ */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    setInterval(() => {
      var live = widgets.find
        ? widgets.find((w) => w.parentNode && w.__state && w.__state.type === "line")
        : null;
      if (!live) return;
      var st = live.__state;
      var last = st.data[st.data.length - 1];
      st.data.push(Math.max(120000, last + rand(-4200, 5200)));
      st.data.shift();
      var slot = live.querySelector(".chart-slot");
      if (slot) {
        drawSlot(slot, st);
        refreshFigure(live, st);
      }
    }, 4200);
  }
})();
