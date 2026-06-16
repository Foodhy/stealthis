/* Travel — Saved Trips / Wishlist
   Vanilla JS. Renders saved trips + pinned places from localStorage, with
   filtering, duplicate, remove-with-undo, progress bars, and an empty state.

   Storage model (shared with explore / planner views):
     - "wayfarer:saved:v1"   -> array of place IDs (the simple shared wishlist
                                that the POI / explore feed reads & writes)
     - "wayfarer:library:v1" -> richer metadata for this view: trips + places,
                                keyed by id. Place ids are kept in sync with
                                the shared list above so the two never drift. */
(function () {
  "use strict";

  var SHARED_KEY = "wayfarer:saved:v1";
  var LIB_KEY = "wayfarer:library:v1";

  var grid = document.getElementById("tripGrid");
  var tpl = document.getElementById("cardTpl");
  var emptyState = document.getElementById("emptyState");
  var savedCountEl = document.getElementById("savedCount");
  var filters = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));
  var countEls = {};
  document.querySelectorAll(".chip-count").forEach(function (el) {
    countEls[el.getAttribute("data-count")] = el;
  });

  var activeFilter = "all";

  /* ---------- toast (with optional undo action) ---------- */
  var toastEl = document.getElementById("toast");
  var toastMsg = document.getElementById("toastMsg");
  var toastUndo = document.getElementById("toastUndo");
  var toastTimer = null;
  var undoAction = null;

  function hideToast() {
    toastEl.classList.remove("show");
    undoAction = null;
  }
  function toast(msg, opts) {
    opts = opts || {};
    toastMsg.textContent = msg;
    toastEl.classList.toggle("toast--save", opts.kind === "save");
    if (opts.onUndo) {
      undoAction = opts.onUndo;
      toastUndo.hidden = false;
    } else {
      undoAction = null;
      toastUndo.hidden = true;
    }
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, opts.onUndo ? 5200 : 2400);
  }
  toastUndo.addEventListener("click", function () {
    if (typeof undoAction === "function") {
      var fn = undoAction;
      undoAction = null;
      window.clearTimeout(toastTimer);
      hideToast();
      fn();
    }
  });

  /* ---------- seed data (a personal, lived-in library) ---------- */
  var SEED = [
    {
      id: "amalfi-loop", kind: "trip", name: "Amalfi Coast Loop", place: "Italy",
      scene: "coast", dates: "Sep 14 – 19", saved: 11, done: 4,
      blurb: "Five lazy days of lemon groves, ferry hops and cliffside dinners between Positano and Ravello."
    },
    {
      id: "kyoto-autumn", kind: "trip", name: "Kyoto in Maple Season", place: "Japan",
      scene: "forest", dates: null, saved: 8, done: 1,
      blurb: "A loose draft chasing the first red maples — temples at dawn, kaiseki at dusk, no fixed dates yet."
    },
    {
      id: "atlas-traverse", kind: "trip", name: "High Atlas Traverse", place: "Morocco",
      scene: "desert", dates: "Apr 2 – 8", saved: 9, done: 9,
      blurb: "Mule-supported ridge walk to Toubkal, mint tea in mountain villages, finishing in Marrakech."
    },
    {
      id: "lofoten-light", kind: "trip", name: "Lofoten Slow Light", place: "Norway",
      scene: "alps", dates: null, saved: 6, done: 0,
      blurb: "Fishing huts on stilts, midnight sun and a rented rowboat — a someday trip kept warm for June."
    },
    {
      id: "casa-tivira", kind: "place", name: "Casa Tivira", place: "Tavira, PT",
      scene: "harbor", rating: 4.8, price: 3,
      blurb: "Nine-room townhouse with a tiled courtyard and rooftop figs — the gentlest breakfast in the old town."
    },
    {
      id: "praia-concha", kind: "place", name: "Praia da Concha", place: "Algarve, PT",
      scene: "lagoon", rating: 4.7, price: 0,
      blurb: "Shell-shaped cove reached by a cliff stair — calm clear water and one tiny café for grilled fish."
    },
    {
      id: "blue-grotto-swim", kind: "place", name: "Blue Grotto Swim", place: "Capri, IT",
      scene: "islands", rating: 4.6, price: 2,
      blurb: "Row in through the low mouth at golden hour, when the water lights up an impossible electric blue."
    },
    {
      id: "shirakawa-go", kind: "place", name: "Shirakawa-gō Hamlet", place: "Gifu, JP",
      scene: "city", rating: 4.9, price: 1,
      blurb: "Thatched farmhouses under snow, woodsmoke in the air, and a single inn that still pours its own sake."
    }
  ];

  /* ---------- persistence ---------- */
  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* private mode — keep working in-session */ }
  }

  // library: array of item objects, ordered. seed once.
  var library = read(LIB_KEY, null);
  if (!Array.isArray(library) || !library.length) {
    library = SEED.slice();
    write(LIB_KEY, library);
  }

  // keep the shared wishlist (place ids) in sync from the library
  function syncSharedFromLibrary() {
    var ids = library
      .filter(function (it) { return it.kind === "place"; })
      .map(function (it) { return it.id; });
    write(SHARED_KEY, ids);
  }
  syncSharedFromLibrary();

  /* ---------- helpers ---------- */
  function priceLabel(tier) {
    if (!tier || tier <= 0) return { text: "Free", free: true };
    var s = "";
    for (var i = 0; i < 4; i++) s += i < tier ? "€" : "";
    return { text: s, free: false };
  }

  /* ---------- render ---------- */
  function buildCard(item) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.setAttribute("data-id", item.id);
    node.setAttribute("data-kind", item.kind);

    var cover = node.querySelector(".cover");
    cover.setAttribute("data-scene", item.scene || "coast");
    cover.setAttribute("aria-label", item.name + " cover");

    node.querySelector(".kind-badge").textContent = item.kind === "trip" ? "Trip" : "Place";
    node.querySelector(".place").textContent = item.place;
    node.querySelector(".name").textContent = item.name;
    node.querySelector(".blurb").textContent = item.blurb;

    var heart = node.querySelector(".heart");
    heart.setAttribute("aria-label", "Remove " + item.name + " from saved");

    var dateEl = node.querySelector(".dates");
    if (item.kind === "trip") {
      if (item.dates) {
        dateEl.textContent = item.dates;
      } else {
        dateEl.textContent = "No dates yet";
        dateEl.classList.add("no-dates");
      }
      // progress
      var pw = node.querySelector(".progress-wrap");
      pw.hidden = false;
      var saved = item.saved || 0;
      var done = item.done || 0;
      var pct = saved ? Math.round((done / saved) * 100) : 0;
      node.querySelector(".progress-label").textContent =
        done + " of " + saved + " stops ready";
      node.querySelector(".progress-pct").textContent = pct + "%";
      // animate from 0
      var fill = node.querySelector(".progress-fill");
      window.requestAnimationFrame(function () { fill.style.width = pct + "%"; });
    } else {
      dateEl.textContent = "Saved place";
      dateEl.classList.add("no-dates");
      var foot = node.querySelector(".place-foot");
      foot.hidden = false;
      var stars = node.querySelector(".stars");
      var pctStars = Math.max(0, Math.min(100, (item.rating / 5) * 100));
      stars.style.setProperty("--pct", pctStars.toFixed(1) + "%");
      node.querySelector(".rating").setAttribute(
        "aria-label", "Rated " + item.rating + " out of 5"
      );
      node.querySelector(".rating-num").textContent = item.rating.toFixed(1);
      var pl = priceLabel(item.price);
      var priceEl = node.querySelector(".price");
      priceEl.textContent = pl.text;
      if (pl.free) priceEl.classList.add("free");
      priceEl.setAttribute("aria-label", pl.free ? "Free to visit" : "Price tier " + item.price);
    }

    wireCard(node, item);
    return node;
  }

  function render() {
    grid.textContent = "";
    var shown = 0;
    library.forEach(function (item) {
      var node = buildCard(item);
      var match = activeFilter === "all" || item.kind === activeFilter;
      node.hidden = !match;
      if (match) shown++;
      grid.appendChild(node);
    });

    // counts
    var nTrip = library.filter(function (i) { return i.kind === "trip"; }).length;
    var nPlace = library.filter(function (i) { return i.kind === "place"; }).length;
    if (countEls.all) countEls.all.textContent = String(library.length);
    if (countEls.trip) countEls.trip.textContent = String(nTrip);
    if (countEls.place) countEls.place.textContent = String(nPlace);
    if (savedCountEl) savedCountEl.textContent = String(library.length);

    var isEmpty = library.length === 0;
    emptyState.hidden = !isEmpty;
    grid.hidden = isEmpty;
  }

  /* ---------- per-card actions ---------- */
  function wireCard(node, item) {
    var heart = node.querySelector(".heart");
    var removeBtn = node.querySelector(".act-remove");
    var openBtn = node.querySelector(".act-open");
    var dupeBtn = node.querySelector(".act-dupe");

    function doRemove() { removeItem(item.id); }
    heart.addEventListener("click", doRemove);
    removeBtn.addEventListener("click", doRemove);

    openBtn.addEventListener("click", function () {
      toast("Opening " + item.name + (item.kind === "trip" ? " in the planner…" : "…"), { kind: "save" });
    });

    dupeBtn.addEventListener("click", function () {
      duplicateItem(item.id);
    });
  }

  function indexOfId(id) {
    for (var i = 0; i < library.length; i++) {
      if (library[i].id === id) return i;
    }
    return -1;
  }

  function commit() {
    write(LIB_KEY, library);
    syncSharedFromLibrary();
  }

  /* ---------- remove with undo ---------- */
  function removeItem(id) {
    var idx = indexOfId(id);
    if (idx === -1) return;
    var item = library[idx];

    // animate the card out, then re-render
    var card = grid.querySelector('.trip[data-id="' + cssEscape(id) + '"]');
    if (card) card.classList.add("removing");

    window.setTimeout(function () {
      library.splice(idx, 1);
      commit();
      render();

      toast("Removed " + item.name, {
        onUndo: function () {
          // restore at the same position (clamped)
          var at = Math.min(idx, library.length);
          library.splice(at, 0, item);
          commit();
          render();
          toast(item.name + " restored", { kind: "save" });
        }
      });
    }, 300);
  }

  /* ---------- duplicate ---------- */
  function duplicateItem(id) {
    var idx = indexOfId(id);
    if (idx === -1) return;
    var orig = library[idx];

    var copy = JSON.parse(JSON.stringify(orig));
    // unique id + name; a duplicated trip resets its dates (fresh draft)
    var base = orig.id;
    var n = 2;
    while (indexOfId(base + "-copy" + (n > 2 ? n : "")) !== -1) n++;
    copy.id = base + "-copy" + (n > 2 ? n : "");
    copy.name = orig.name + " (copy)";
    if (copy.kind === "trip") {
      copy.dates = null;
      copy.done = 0;
    }
    library.splice(idx + 1, 0, copy);
    commit();
    render();
    toast("Duplicated " + orig.name, { kind: "save" });
  }

  // minimal attribute-selector escape for our known id charset
  function cssEscape(s) {
    return String(s).replace(/["\\]/g, "\\$&");
  }

  /* ---------- filters ---------- */
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
    });
  });

  /* ---------- init ---------- */
  render();
})();
