/* FLIP Layout Animation — First · Last · Invert · Play
 * Vanilla JS, no dependencies. Animates only transform + opacity. */
(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var status = document.getElementById("status");
  var chipsWrap = document.getElementById("chips");
  var reduceToggle = document.getElementById("reduce");

  var DURATION = 460; // ms
  var EASING = "cubic-bezier(0.22, 0.61, 0.36, 1)";

  // Respect OS-level reduced-motion by default.
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduceToggle.checked = mq.matches;
  try {
    mq.addEventListener("change", function (e) {
      reduceToggle.checked = e.matches;
    });
  } catch (_) {
    /* older Safari — ignore */
  }

  var CATEGORIES = {
    core: { label: "Core", color: "#8b5cf6", icon: "◆" },
    data: { label: "Data", color: "#22d3ee", icon: "▲" },
    ui: { label: "UI", color: "#34d399", icon: "●" },
    net: { label: "Net", color: "#fbbf24", icon: "◇" }
  };
  var CAT_KEYS = Object.keys(CATEGORIES);

  var NAMES = [
    "Aurora", "Basalt", "Cobalt", "Dune", "Ember", "Flux", "Glint", "Halo",
    "Ionic", "Jade", "Krypton", "Lumen", "Mistral", "Nimbus", "Onyx",
    "Prism", "Quartz", "Ripple", "Sable", "Talon", "Umbra", "Vertex",
    "Willow", "Xenon", "Yonder", "Zephyr"
  ];

  var uid = 0;
  function makeItem(name, cat) {
    return {
      id: ++uid,
      name: name,
      cat: cat || CAT_KEYS[(Math.random() * CAT_KEYS.length) | 0],
      weight: Math.round((Math.random() * 9.4 + 0.5) * 10) / 10
    };
  }

  // Seed model
  var items = [];
  for (var i = 0; i < 10; i++) {
    items.push(makeItem(NAMES[i], CAT_KEYS[i % CAT_KEYS.length]));
  }

  var activeFilter = "all";
  var nextName = 10;

  /* ---------- Rendering ---------- */
  function visibleItems() {
    if (activeFilter === "all") return items.slice();
    return items.filter(function (it) {
      return it.cat === activeFilter;
    });
  }

  function cardEl(it) {
    var meta = CATEGORIES[it.cat];
    var li = document.createElement("li");
    li.className = "card";
    li.dataset.id = String(it.id);
    li.style.setProperty("--cat", meta.color);
    li.innerHTML =
      '<div class="card__top">' +
      '<span class="card__dot" aria-hidden="true">' + meta.icon + "</span>" +
      '<span class="card__name"></span>' +
      "</div>" +
      '<span class="card__cat">' + meta.label + "</span>" +
      '<div class="card__meta">' +
      "<span>weight</span>" +
      '<span class="card__weight"></span>' +
      "</div>";
    li.querySelector(".card__name").textContent = it.name;
    li.querySelector(".card__weight").textContent = it.weight.toFixed(1) + " kg";
    return li;
  }

  // Map id -> element currently in DOM
  function currentEls() {
    var map = new Map();
    var nodes = grid.children;
    for (var i = 0; i < nodes.length; i++) {
      map.set(nodes[i].dataset.id, nodes[i]);
    }
    return map;
  }

  var animating = false;

  /* ---------- The FLIP pass ---------- */
  function render(reason) {
    var reduce = reduceToggle.checked;
    var wanted = visibleItems();
    var wantedIds = new Set(
      wanted.map(function (it) {
        return String(it.id);
      })
    );

    var existing = currentEls();

    // ---- FIRST: record positions of elements already on screen ----
    var firstRects = new Map();
    existing.forEach(function (el, id) {
      firstRects.set(id, el.getBoundingClientRect());
    });

    // ---- Determine exits (present now, not wanted) ----
    var exits = [];
    existing.forEach(function (el, id) {
      if (!wantedIds.has(id)) exits.push(el);
    });

    // ---- LAST: build the target DOM order ----
    // Remove exiting nodes from flow immediately for measurement,
    // but keep them for the exit animation as absolutely-positioned ghosts.
    if (reduce) {
      // No animation: just rebuild directly.
      grid.replaceChildren();
      wanted.forEach(function (it) {
        grid.appendChild(cardEl(it));
      });
      report(reason, wanted.length, 0, exits.length, 0);
      return;
    }

    // Freeze exiting elements as ghosts so they can fade without holding space.
    exits.forEach(function (el) {
      var r = firstRects.get(el.dataset.id);
      var host = grid.getBoundingClientRect();
      el.style.position = "absolute";
      el.style.zIndex = "0";
      el.style.margin = "0";
      el.style.width = r.width + "px";
      el.style.height = r.height + "px";
      el.style.left = r.left - host.left + grid.scrollLeft + "px";
      el.style.top = r.top - host.top + grid.scrollTop + "px";
    });

    // Reorder / create the kept & new elements into wanted order.
    var enters = [];
    var moved = 0;
    var frag = document.createDocumentFragment();

    wanted.forEach(function (it) {
      var id = String(it.id);
      var el = existing.get(id);
      if (el) {
        frag.appendChild(el); // moving a live node preserves it
      } else {
        el = cardEl(it);
        el.classList.add("is-enter");
        enters.push(el);
        frag.appendChild(el);
      }
    });

    // Put ghosts back so they render during the transition.
    grid.appendChild(frag);
    exits.forEach(function (el) {
      grid.appendChild(el);
    });

    // ---- LAST measure + INVERT for kept nodes ----
    wanted.forEach(function (it) {
      var id = String(it.id);
      var first = firstRects.get(id);
      if (!first) return; // newly entered, handled separately
      var el = grid.querySelector('.card[data-id="' + id + '"]');
      if (!el) return;
      var last = el.getBoundingClientRect();
      var dx = first.left - last.left;
      var dy = first.top - last.top;
      if (dx || dy) {
        moved++;
        el.style.transition = "none";
        el.style.transform = "translate(" + dx + "px," + dy + "px)";
      }
    });

    // Force a reflow so the inverted transforms are committed before we play.
    void grid.offsetWidth;

    // ---- PLAY ----
    animating = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        // Kept nodes slide to zero.
        wanted.forEach(function (it) {
          var id = String(it.id);
          if (!firstRects.has(id)) return;
          var el = grid.querySelector('.card[data-id="' + id + '"]');
          if (!el) return;
          el.style.transition =
            "transform " + DURATION + "ms " + EASING;
          el.style.transform = "translate(0,0)";
        });

        // Entering nodes scale+fade in.
        enters.forEach(function (el) {
          el.style.transition =
            "transform " + DURATION + "ms " + EASING +
            ", opacity " + DURATION + "ms ease";
          el.classList.remove("is-enter");
        });

        // Exiting ghosts fade + shrink, then are removed.
        exits.forEach(function (el) {
          el.style.transition =
            "transform " + DURATION * 0.7 + "ms ease, opacity " +
            DURATION * 0.7 + "ms ease";
          el.classList.add("is-exit");
        });
      });
    });

    // Cleanup after the transition finishes.
    window.setTimeout(function () {
      wanted.forEach(function (it) {
        var el = grid.querySelector('.card[data-id="' + it.id + '"]');
        if (el) {
          el.style.transition = "";
          el.style.transform = "";
        }
      });
      exits.forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      animating = false;
    }, DURATION + 40);

    report(reason, wanted.length, moved, exits.length, enters.length);
  }

  function report(reason, total, moved, removed, added) {
    var parts = [];
    if (reason) parts.push(reason);
    parts.push(total + " shown");
    if (moved) parts.push("<b>" + moved + " moved</b>");
    if (added) parts.push(added + " added");
    if (removed) parts.push(removed + " removed");
    status.innerHTML = parts.join("  ·  ");
  }

  /* ---------- Actions ---------- */
  function shuffle() {
    for (var i = items.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var t = items[i];
      items[i] = items[j];
      items[j] = t;
    }
    render("Shuffled");
  }

  function sortByName() {
    items.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    render("Sorted A–Z");
  }

  function sortByWeight() {
    items.sort(function (a, b) {
      return b.weight - a.weight;
    });
    render("Sorted by weight");
  }

  function addCard() {
    var name = NAMES[nextName % NAMES.length] +
      (nextName >= NAMES.length ? " " + (Math.floor(nextName / NAMES.length) + 1) : "");
    nextName++;
    var it = makeItem(name);
    // Insert near the front so the move is visible.
    items.splice((Math.random() * (items.length + 1)) | 0, 0, it);
    render("Added a card");
  }

  function removeLast() {
    if (!items.length) {
      report("Nothing to remove", 0, 0, 0, 0);
      return;
    }
    items.pop();
    render("Removed a card");
  }

  /* ---------- Wiring ---------- */
  var ACTIONS = {
    shuffle: shuffle,
    "sort-name": sortByName,
    "sort-weight": sortByWeight,
    add: addCard,
    remove: removeLast
  };

  document.querySelector(".toolbar").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    if (animating) return; // avoid overlapping FLIP passes
    var fn = ACTIONS[btn.dataset.act];
    if (fn) fn();
  });

  // Build filter chips.
  function buildChips() {
    var defs = [{ id: "all", label: "All" }].concat(
      CAT_KEYS.map(function (k) {
        return { id: k, label: CATEGORIES[k].label };
      })
    );
    defs.forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.role = "tab";
      b.dataset.filter = d.id;
      b.textContent = d.label;
      b.setAttribute("aria-selected", d.id === activeFilter ? "true" : "false");
      chipsWrap.appendChild(b);
    });
  }

  chipsWrap.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip || animating) return;
    activeFilter = chip.dataset.filter;
    Array.prototype.forEach.call(chipsWrap.children, function (c) {
      c.setAttribute(
        "aria-selected",
        c.dataset.filter === activeFilter ? "true" : "false"
      );
    });
    render("Filter: " + (activeFilter === "all" ? "All" : CATEGORIES[activeFilter].label));
  });

  reduceToggle.addEventListener("change", function () {
    render(reduceToggle.checked ? "Reduced motion on" : "Reduced motion off");
  });

  /* ---------- Init ---------- */
  buildChips();
  // Initial paint (no FLIP needed — nothing to invert from).
  visibleItems().forEach(function (it) {
    grid.appendChild(cardEl(it));
  });
  report("Ready", items.length, 0, 0, 0);
})();
