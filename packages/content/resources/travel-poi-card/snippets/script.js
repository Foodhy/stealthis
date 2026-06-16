/* Travel — Point-of-interest cards
   Vanilla JS: heart toggles (persisted), star fills, category + saved filter,
   "view on map" focus, and a small toast helper. No external libs. */
(function () {
  "use strict";

  var STORE_KEY = "wayfarer:saved:v1";
  var grid = document.getElementById("poiGrid");
  var pois = Array.prototype.slice.call(document.querySelectorAll(".poi"));
  var hearts = Array.prototype.slice.call(document.querySelectorAll(".heart"));
  var filters = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));
  var savedCountEl = document.getElementById("savedCount");
  var emptyState = document.getElementById("emptyState");
  var mapNote = document.getElementById("mapNote");
  var pins = Array.prototype.slice.call(document.querySelectorAll(".pin"));
  var activeFilter = "all";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg, kind) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle("toast--save", kind === "save");
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- persistence ---------- */
  function loadSaved() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }
  function persist(list) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (e) {
      /* storage may be blocked (private mode) — keep working in-session */
    }
  }
  var saved = loadSaved();

  function isSaved(id) {
    return saved.indexOf(id) !== -1;
  }

  /* ---------- star ratings ---------- */
  document.querySelectorAll(".stars").forEach(function (el) {
    var rating = parseFloat(el.getAttribute("data-rating")) || 0;
    var pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    el.style.setProperty("--pct", pct.toFixed(1) + "%");
  });

  /* ---------- counts + empty state ---------- */
  function refreshCount() {
    if (savedCountEl) savedCountEl.textContent = String(saved.length);
  }
  function updateEmptyState() {
    if (!emptyState) return;
    if (activeFilter !== "saved") {
      emptyState.hidden = true;
      return;
    }
    emptyState.hidden = saved.length > 0;
  }

  /* ---------- filtering ---------- */
  function applyFilter() {
    pois.forEach(function (poi) {
      var cat = poi.getAttribute("data-category");
      var id = poi.getAttribute("data-id");
      var show;
      if (activeFilter === "all") show = true;
      else if (activeFilter === "saved") show = isSaved(id);
      else show = cat === activeFilter;
      poi.hidden = !show;
    });
    updateEmptyState();
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      applyFilter();
    });
  });

  /* ---------- heart toggle ---------- */
  function syncHeart(btn) {
    var poi = btn.closest(".poi");
    if (!poi) return;
    var id = poi.getAttribute("data-id");
    btn.setAttribute("aria-pressed", isSaved(id) ? "true" : "false");
  }

  hearts.forEach(function (btn) {
    syncHeart(btn);
    btn.addEventListener("click", function () {
      var poi = btn.closest(".poi");
      if (!poi) return;
      var id = poi.getAttribute("data-id");
      var nameEl = poi.querySelector(".name");
      var name = nameEl ? nameEl.textContent.trim() : "place";

      if (isSaved(id)) {
        saved = saved.filter(function (x) { return x !== id; });
        btn.setAttribute("aria-pressed", "false");
        toast("Removed " + name + " from your trip");
      } else {
        saved.push(id);
        btn.setAttribute("aria-pressed", "true");
        btn.classList.add("pulse");
        window.setTimeout(function () { btn.classList.remove("pulse"); }, 440);
        toast("Saved " + name + " to your trip ♥", "save");
      }
      persist(saved);
      refreshCount();
      if (activeFilter === "saved") applyFilter();
      else updateEmptyState();
    });
  });

  /* ---------- view on map ---------- */
  function focusPlace(place) {
    var matched = null;
    pins.forEach(function (pin) {
      var on = pin.getAttribute("data-place") === place;
      pin.classList.toggle("is-active", on);
      if (on) matched = pin;
    });
    if (mapNote && matched) {
      mapNote.innerHTML = "Showing <strong>" + place + "</strong> on the map.";
    }
    return matched;
  }

  document.querySelectorAll(".map-link").forEach(function (link) {
    link.addEventListener("click", function () {
      // anchor still scrolls to #map; we just light up the pin
      var place = link.getAttribute("data-place");
      focusPlace(place);
      toast("Focused " + place + " on the map");
    });
  });

  pins.forEach(function (pin) {
    pin.addEventListener("click", function () {
      var place = pin.getAttribute("data-place");
      focusPlace(place);
      toast(place);
    });
  });

  /* ---------- init ---------- */
  refreshCount();
  applyFilter();
})();
