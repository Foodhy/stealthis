(function () {
  "use strict";

  // ---- In-memory dataset (fictional) ----
  var PRODUCTS = [
    { id: 1, name: "Aurora Wireless Headphones", cat: "Audio", price: 129, stock: "in", color: "#5b5bf0", icon: "headphones" },
    { id: 2, name: "Pebble Bluetooth Earbuds", cat: "Audio", price: 49, stock: "low", color: "#00b4a6", icon: "earbuds" },
    { id: 3, name: "Volt Portable Speaker", cat: "Audio", price: 79, stock: "in", color: "#d98a2b", icon: "speaker" },
    { id: 4, name: "Lumen Smart Desk Lamp", cat: "Home", price: 64, stock: "in", color: "#d4503e", icon: "lamp" },
    { id: 5, name: "Drift Mechanical Keyboard", cat: "Computing", price: 119, stock: "low", color: "#3a3ab8", icon: "keyboard" },
    { id: 6, name: "Quartz Wireless Mouse", cat: "Computing", price: 39, stock: "in", color: "#2f9e6f", icon: "mouse" },
    { id: 7, name: "Nimbus Standing Mug Warmer", cat: "Home", price: 29, stock: "in", color: "#4646d6", icon: "mug" },
    { id: 8, name: "Tidal Noise-Cancelling Buds", cat: "Audio", price: 99, stock: "in", color: "#00b4a6", icon: "earbuds" }
  ];

  var SUGGESTIONS = ["headphones", "earbuds", "keyboard", "desk lamp", "speaker"];

  var ICONS = {
    headphones: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="7" rx="1.5"/><rect x="17" y="13" width="4" height="7" rx="1.5"/>',
    earbuds: '<circle cx="8" cy="8" r="3.5"/><path d="M8 11v6"/><circle cx="16" cy="16" r="3.5"/><path d="M16 13V7"/>',
    speaker: '<rect x="6" y="3" width="12" height="18" rx="2.5"/><circle cx="12" cy="15" r="3.5"/><circle cx="12" cy="7" r="1"/>',
    lamp: '<path d="M9 18h6l-1 3H10z"/><path d="M12 18v-4"/><path d="M7 9l5-6 5 6z"/>',
    keyboard: '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M7 11h0M11 11h0M15 11h0M8 15h8"/>',
    mouse: '<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 7v3"/>',
    mug: '<path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"/>'
  };

  // ---- Elements ----
  var panel = document.querySelector(".panel");
  var input = document.getElementById("q");
  var clearInline = document.getElementById("clearInline");
  var results = document.getElementById("results");
  var count = document.getElementById("count");
  var empty = document.getElementById("empty");
  var emptyQ = document.getElementById("emptyQ");
  var suggested = document.getElementById("suggested");
  var clearSearch = document.getElementById("clearSearch");
  var browseAll = document.getElementById("browseAll");
  var filterBar = document.getElementById("filterBar");
  var clearFilters = document.getElementById("clearFilters");
  var toastHost = document.getElementById("toastHost");
  var segButtons = Array.prototype.slice.call(document.querySelectorAll(".seg"));

  var variant = "suggested";
  // active filters narrow the dataset; in the "filters" variant they're on by default
  var filters = { cat: false, price: false, stock: false };

  // ---- Toast ----
  var toastTimer;
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 13 10 18 19 6"/></svg><span></span>';
    el.querySelector("span").textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 240);
    }, 2200);
  }

  // ---- Filtering logic ----
  function matches(p, q) {
    var hay = (p.name + " " + p.cat).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function passesFilters(p) {
    if (filters.cat && p.cat !== "Audio") return false;
    if (filters.price && p.price >= 50) return false;
    if (filters.stock && p.stock !== "in") return false;
    return true;
  }

  function compute() {
    var q = input.value.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      return (q === "" || matches(p, q)) && passesFilters(p);
    });
    return list;
  }

  // ---- Render ----
  function renderItem(p) {
    var stockBadge =
      p.stock === "low"
        ? '<span class="badge low">Low stock</span>'
        : '<span class="badge stock">In stock</span>';
    var li = document.createElement("li");
    li.className = "result-item";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.innerHTML =
      '<span class="thumb" style="background:' +
      p.color +
      '"><svg viewBox="0 0 24 24" aria-hidden="true">' +
      ICONS[p.icon] +
      "</svg></span>" +
      '<div class="r-body">' +
      '<p class="r-title">' +
      esc(p.name) +
      "</p>" +
      '<p class="r-meta">' +
      esc(p.cat) +
      " · Free shipping</p>" +
      "</div>" +
      '<div class="r-side"><span class="r-price">$' +
      p.price +
      "</span>" +
      stockBadge +
      "</div>";
    li.addEventListener("click", function () {
      toast("Opened “" + p.name + "”");
    });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toast("Opened “" + p.name + "”");
      }
    });
    return li;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function renderSuggested() {
    suggested.innerHTML = "";
    SUGGESTIONS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "s-chip";
      b.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/></svg>' +
        '<span>' + esc(s) + "</span>";
      b.addEventListener("click", function () {
        // clear filters so the suggested query actually returns something
        setAllFilters(false);
        input.value = s;
        input.focus();
        render();
        toast("Searching for “" + s + "”");
      });
      suggested.appendChild(b);
    });
  }

  function render() {
    var q = input.value.trim();
    clearInline.hidden = q.length === 0;

    var list = compute();

    if (list.length > 0) {
      empty.hidden = true;
      results.hidden = false;
      results.innerHTML = "";
      list.forEach(function (p, i) {
        var node = renderItem(p);
        node.style.animationDelay = i * 0.03 + "s";
        results.appendChild(node);
      });
      count.textContent = list.length + (list.length === 1 ? " result" : " results");
    } else {
      results.innerHTML = "";
      results.hidden = true;
      emptyQ.textContent = "“" + (q || "your search") + "”";
      empty.hidden = false;
      count.textContent = "0 results";
    }
  }

  // ---- Filters ----
  function syncFilterBar() {
    var any = filters.cat || filters.price || filters.stock;
    // bar visibility for the filters variant is also controlled by CSS;
    // here we toggle individual chips
    filterBar.hidden = variant !== "filters";
    if (variant === "filters") {
      document.querySelectorAll(".chip").forEach(function (chip) {
        var key = chip.getAttribute("data-filter");
        chip.style.display = filters[key] ? "" : "none";
      });
      clearFilters.style.display = any ? "" : "none";
    }
  }

  function setAllFilters(on) {
    filters.cat = on;
    filters.price = on;
    filters.stock = on;
    syncFilterBar();
  }

  document.querySelectorAll(".chip-x").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-remove");
      filters[key] = false;
      syncFilterBar();
      render();
      toast("Filter removed");
    });
  });

  clearFilters.addEventListener("click", function () {
    setAllFilters(false);
    render();
    toast("All filters cleared");
  });

  // ---- Variant switcher ----
  function setVariant(v) {
    variant = v;
    panel.setAttribute("data-variant", v);
    segButtons.forEach(function (b) {
      var on = b.getAttribute("data-variant") === v;
      b.setAttribute("aria-checked", on ? "true" : "false");
    });

    if (v === "filters") {
      setAllFilters(true);
      // seed a query that has matches under the audio/under-$50/in-stock filters
      input.value = "buds";
    } else if (v === "minimal") {
      setAllFilters(false);
      input.value = "zxcv";
    } else {
      setAllFilters(false);
      input.value = "wireless headphones";
    }
    syncFilterBar();
    render();
  }

  segButtons.forEach(function (b, idx) {
    b.addEventListener("click", function () {
      setVariant(b.getAttribute("data-variant"));
    });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        var next = segButtons[(idx + 1) % segButtons.length];
        next.focus();
        next.click();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        var prev = segButtons[(idx - 1 + segButtons.length) % segButtons.length];
        prev.focus();
        prev.click();
      }
    });
  });

  // ---- Search input ----
  input.addEventListener("input", render);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && input.value) {
      input.value = "";
      render();
    }
  });

  clearInline.addEventListener("click", function () {
    input.value = "";
    input.focus();
    render();
  });

  clearSearch.addEventListener("click", function () {
    input.value = "";
    setAllFilters(false);
    input.focus();
    render();
    toast("Search cleared");
  });

  browseAll.addEventListener("click", function () {
    input.value = "";
    setAllFilters(false);
    render();
    toast("Showing all products");
  });

  // ---- Init ----
  renderSuggested();
  setVariant("suggested");
})();
