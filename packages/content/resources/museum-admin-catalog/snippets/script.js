(function () {
  "use strict";

  // ---- Seed data ---------------------------------------------------------
  var PALETTES = [
    ["#b08968", "#7f5539"], ["#5e6472", "#2b2d34"], ["#a3b18a", "#588157"],
    ["#cdb4db", "#8e6c9b"], ["#c9ada7", "#9a8c98"], ["#83c5be", "#006d77"],
    ["#e9c46a", "#bb8a2e"], ["#dda15e", "#bc6c25"], ["#9aa0a8", "#6b717a"],
    ["#a0937d", "#6e5e4e"], ["#b5838d", "#6d4c52"], ["#cbc0d3", "#8a7fa3"]
  ];

  var STATUSES = ["On view", "In storage", "On loan", "In conservation"];

  var seed = [
    { accession: "1962.014.2", title: "Harbor at Dawn", artist: "Élise Renaud", date: "1908", medium: "Oil on canvas", location: "Gallery 14 · West Wing", status: "On view" },
    { accession: "1971.203.1", title: "Study of Folded Cloth", artist: "Anton Veerhoff", date: "c. 1640", medium: "Red chalk on laid paper", location: "Works on Paper · Storage", status: "In storage" },
    { accession: "1955.087.5", title: "The Cartographer's Table", artist: "Mira Solberg", date: "1931", medium: "Tempera on panel", location: "Gallery 7 · North Wing", status: "On view" },
    { accession: "2003.118.3", title: "Untitled (Ochre Field)", artist: "Davíd Okonkwo", date: "1974", medium: "Acrylic on linen", location: "Loan · Tate Modern", status: "On loan" },
    { accession: "1948.056.9", title: "Reliquary Casket", artist: "Workshop of Limoges", date: "c. 1220", medium: "Gilt copper, champlevé enamel", location: "Medieval · Vitrine 3", status: "On view" },
    { accession: "1989.041.7", title: "Two Figures, Descending", artist: "Hélène Marchetti", date: "1956", medium: "Bronze with brown patina", location: "Conservation Lab", status: "In conservation" },
    { accession: "1933.012.4", title: "Still Life with Quince", artist: "Joaquín Beltrán", date: "1899", medium: "Oil on canvas", location: "Gallery 11 · West Wing", status: "On view" },
    { accession: "2011.230.1", title: "Circuit (Variation IX)", artist: "Yuki Tanabe", date: "2009", medium: "Inkjet print on rag", location: "Photography · Storage", status: "In storage" },
    { accession: "1967.099.2", title: "Veiled Portrait of a Lady", artist: "Unknown (Florentine)", date: "c. 1490", medium: "Tempera and gold on panel", location: "Gallery 3 · East Wing", status: "On view" },
    { accession: "1998.144.6", title: "Salt Marsh, Evening", artist: "Greta Lindqvist", date: "1962", medium: "Watercolor on paper", location: "Loan · Stedelijk", status: "On loan" },
    { accession: "1925.007.8", title: "Amphora with Dancers", artist: "Attributed to the Berlin Painter", date: "c. 480 BCE", medium: "Terracotta, red-figure", location: "Antiquities · Vitrine 1", status: "On view" },
    { accession: "2007.166.3", title: "Glasshouse No. 4", artist: "Pieter Vanderveld", date: "2001", medium: "Chromogenic print", location: "Photography · Storage", status: "In storage" },
    { accession: "1972.058.1", title: "Composition in Slate", artist: "Nadia Brening", date: "1948", medium: "Oil and sand on board", location: "Gallery 16 · West Wing", status: "On view" },
    { accession: "1944.033.5", title: "Embroidered Court Robe", artist: "Unknown (Qing dynasty)", date: "18th c.", medium: "Silk, gold-wrapped thread", location: "Textiles · Cold Storage", status: "In storage" },
    { accession: "2015.201.2", title: "Threshold (After Rain)", artist: "Imani Cole", date: "2014", medium: "Mixed media on panel", location: "Gallery 22 · Contemporary", status: "On view" },
    { accession: "1960.077.4", title: "The Astronomer's Globe", artist: "Workshop of Coronelli", date: "c. 1688", medium: "Engraved paper over plaster", location: "Conservation Lab", status: "In conservation" },
    { accession: "1981.109.6", title: "Red Interior with Chair", artist: "Lucien Abadie", date: "1953", medium: "Gouache on board", location: "Gallery 18 · West Wing", status: "On view" },
    { accession: "1937.024.3", title: "Coastal Cliffs, Brittany", artist: "Marthe Caillou", date: "1911", medium: "Oil on canvas", location: "Loan · Musée d'Orsay", status: "On loan" },
    { accession: "2019.245.1", title: "Signal / Noise", artist: "Rashid Iqbal", date: "2018", medium: "LED, microcontroller, steel", location: "Gallery 24 · New Media", status: "On view" },
    { accession: "1953.061.7", title: "Portrait of a Collector", artist: "Wilhelm Brandt", date: "1842", medium: "Oil on canvas", location: "Gallery 5 · East Wing", status: "On view" },
    { accession: "1929.018.2", title: "Funerary Stele", artist: "Unknown (Attic)", date: "c. 350 BCE", medium: "Pentelic marble", location: "Antiquities · Storage", status: "In storage" },
    { accession: "2009.188.4", title: "Drift (Triptych)", artist: "Sonia Vidal", date: "2006", medium: "Oil on three panels", location: "Conservation Lab", status: "In conservation" },
    { accession: "1976.092.1", title: "Night Window", artist: "Theo Lindemann", date: "1959", medium: "Etching and aquatint", location: "Works on Paper · Storage", status: "In storage" },
    { accession: "1991.137.5", title: "The Weavers", artist: "Concha Ferrer", date: "1968", medium: "Wool tapestry", location: "Gallery 9 · North Wing", status: "On view" }
  ];

  var objects = seed.map(function (o, i) {
    return Object.assign({ id: "obj-" + i, pal: PALETTES[i % PALETTES.length] }, o);
  });

  // ---- State -------------------------------------------------------------
  var state = {
    search: "",
    status: "",
    medium: "",
    sortKey: "accession",
    sortDir: "asc",
    page: 1,
    perPage: 8,
    selected: new Set()
  };

  // ---- Elements ----------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  var rowsEl = $("rows");
  var searchEl = $("search");
  var statusFilterEl = $("filter-status");
  var mediumFilterEl = $("filter-medium");
  var selectAllEl = $("select-all");

  // ---- Toast -------------------------------------------------------------
  function toast(msg) {
    var host = $("toast-host");
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity 0.3s ease";
      el.style.opacity = "0";
      setTimeout(function () { el.remove(); }, 320);
    }, 2400);
  }

  // ---- Helpers -----------------------------------------------------------
  function statusClass(s) {
    return { "On view": "onview", "In storage": "storage", "On loan": "loan", "In conservation": "conservation" }[s] || "storage";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Sort key for accession & date that handles BCE / century strings gracefully.
  function dateRank(d) {
    var m = d.match(/(\d{3,4})\s*BCE/i);
    if (m) return -parseInt(m[1], 10);
    m = d.match(/(\d{1,2})(st|nd|rd|th)\s*c/i);
    if (m) return (parseInt(m[1], 10) - 1) * 100 + 50;
    m = d.match(/(\d{3,4})/);
    if (m) return parseInt(m[1], 10);
    return 0;
  }

  function compare(a, b) {
    var k = state.sortKey, dir = state.sortDir === "asc" ? 1 : -1;
    var av, bv;
    if (k === "date") { av = dateRank(a.date); bv = dateRank(b.date); }
    else { av = (a[k] || "").toLowerCase(); bv = (b[k] || "").toLowerCase(); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  }

  function filtered() {
    var q = state.search.trim().toLowerCase();
    return objects.filter(function (o) {
      if (state.status && o.status !== state.status) return false;
      if (state.medium && o.medium !== state.medium) return false;
      if (q) {
        var hay = (o.title + " " + o.artist + " " + o.accession + " " + o.medium + " " + o.location + " " + o.date).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(compare);
  }

  // ---- Stats -------------------------------------------------------------
  function renderStats() {
    $("stat-total").textContent = objects.length;
    var c = { "On view": 0, "In storage": 0, "On loan": 0, "In conservation": 0 };
    objects.forEach(function (o) { c[o.status]++; });
    $("stat-onview").textContent = c["On view"];
    $("stat-storage").textContent = c["In storage"];
    $("stat-loan").textContent = c["On loan"];
    $("stat-conservation").textContent = c["In conservation"];
  }

  // ---- Medium filter / datalist ------------------------------------------
  function renderMediumOptions() {
    var media = Array.from(new Set(objects.map(function (o) { return o.medium; }))).sort();
    var keep = state.medium;
    mediumFilterEl.innerHTML = '<option value="">All media</option>' +
      media.map(function (m) {
        return '<option value="' + escapeHtml(m) + '"' + (m === keep ? " selected" : "") + ">" + escapeHtml(m) + "</option>";
      }).join("");
    var dl = $("medium-list");
    if (dl) dl.innerHTML = media.map(function (m) { return '<option value="' + escapeHtml(m) + '">'; }).join("");
  }

  // ---- Render table ------------------------------------------------------
  function render() {
    var list = filtered();
    var total = list.length;
    var pages = Math.max(1, Math.ceil(total / state.perPage));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.perPage;
    var pageItems = list.slice(start, start + state.perPage);

    rowsEl.innerHTML = pageItems.map(function (o) {
      var sel = state.selected.has(o.id);
      var grad = "linear-gradient(135deg," + o.pal[0] + "," + o.pal[1] + ")";
      return '<tr class="' + (sel ? "selected" : "") + '" data-id="' + o.id + '">' +
        '<td class="col-check"><input type="checkbox" class="row-check" ' + (sel ? "checked" : "") + ' aria-label="Select ' + escapeHtml(o.title) + '" /></td>' +
        '<td class="cell-accession">' + escapeHtml(o.accession) + "</td>" +
        '<td><div class="cell-thumb"><span class="thumb" style="background:' + grad + '" aria-hidden="true"></span>' +
          '<div><div class="cell-title">' + escapeHtml(o.title) + "</div></div></div></td>" +
        '<td class="cell-muted">' + escapeHtml(o.artist) + "</td>" +
        '<td class="col-num cell-muted">' + escapeHtml(o.date) + "</td>" +
        '<td class="cell-sub">' + escapeHtml(o.medium) + "</td>" +
        '<td class="cell-sub">' + escapeHtml(o.location) + "</td>" +
        '<td><span class="badge ' + statusClass(o.status) + '">' + escapeHtml(o.status) + "</span></td>" +
        '<td class="col-act"><div class="row-actions">' +
          '<button class="icon-btn" data-act="edit" aria-label="Edit ' + escapeHtml(o.title) + '">✎</button>' +
          '<button class="icon-btn danger" data-act="delete" aria-label="Remove ' + escapeHtml(o.title) + '">🗑</button>' +
        "</div></td></tr>";
    }).join("");

    $("empty").hidden = total !== 0;
    document.querySelector(".catalog").style.display = total === 0 ? "none" : "";

    // Pager
    var shown = total === 0 ? 0 : start + 1;
    var shownEnd = Math.min(start + state.perPage, total);
    $("pager-info").textContent = total === 0 ? "No objects" : "Showing " + shown + "–" + shownEnd + " of " + total;
    $("prev").disabled = state.page <= 1;
    $("next").disabled = state.page >= pages;

    var pagesEl = $("pager-pages");
    pagesEl.innerHTML = "";
    for (var p = 1; p <= pages; p++) {
      var b = document.createElement("button");
      b.className = "page-num" + (p === state.page ? " active" : "");
      b.textContent = p;
      b.dataset.page = p;
      pagesEl.appendChild(b);
    }

    // select-all reflects current page
    var allSelected = pageItems.length > 0 && pageItems.every(function (o) { return state.selected.has(o.id); });
    selectAllEl.checked = allSelected;
    selectAllEl.indeterminate = !allSelected && pageItems.some(function (o) { return state.selected.has(o.id); });

    renderBulkBar();
    renderSortHeaders();
  }

  function renderSortHeaders() {
    document.querySelectorAll(".catalog .sort").forEach(function (btn) {
      btn.classList.remove("asc", "desc");
      if (btn.dataset.key === state.sortKey) btn.classList.add(state.sortDir);
    });
  }

  function renderBulkBar() {
    var n = state.selected.size;
    var bar = $("bulk-bar");
    bar.hidden = n === 0;
    $("bulk-count").textContent = n + " selected";
  }

  // ---- Sorting -----------------------------------------------------------
  document.querySelectorAll(".catalog .sort").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.key;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "asc";
      }
      render();
    });
  });

  // ---- Filters / search --------------------------------------------------
  searchEl.addEventListener("input", function () { state.search = searchEl.value; state.page = 1; render(); });
  statusFilterEl.addEventListener("change", function () { state.status = statusFilterEl.value; state.page = 1; render(); });
  mediumFilterEl.addEventListener("change", function () { state.medium = mediumFilterEl.value; state.page = 1; render(); });

  $("empty-reset").addEventListener("click", function () {
    state.search = ""; state.status = ""; state.medium = ""; state.page = 1;
    searchEl.value = ""; statusFilterEl.value = ""; mediumFilterEl.value = "";
    render();
    toast("Filters reset.");
  });

  // ---- Pager -------------------------------------------------------------
  $("prev").addEventListener("click", function () { if (state.page > 1) { state.page--; render(); } });
  $("next").addEventListener("click", function () { state.page++; render(); });
  $("pager-pages").addEventListener("click", function (e) {
    var b = e.target.closest(".page-num");
    if (b) { state.page = parseInt(b.dataset.page, 10); render(); }
  });

  // ---- Row interactions --------------------------------------------------
  rowsEl.addEventListener("change", function (e) {
    var cb = e.target.closest(".row-check");
    if (!cb) return;
    var id = cb.closest("tr").dataset.id;
    if (cb.checked) state.selected.add(id); else state.selected.delete(id);
    render();
  });

  rowsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var id = btn.closest("tr").dataset.id;
    if (btn.dataset.act === "edit") openForm(id);
    else if (btn.dataset.act === "delete") askDelete([id]);
  });

  selectAllEl.addEventListener("change", function () {
    var pageItems = currentPageItems();
    if (selectAllEl.checked) pageItems.forEach(function (o) { state.selected.add(o.id); });
    else pageItems.forEach(function (o) { state.selected.delete(o.id); });
    render();
  });

  function currentPageItems() {
    var list = filtered();
    var start = (state.page - 1) * state.perPage;
    return list.slice(start, start + state.perPage);
  }

  // ---- Bulk actions ------------------------------------------------------
  $("bulk-apply").addEventListener("click", function () {
    var s = $("bulk-status").value;
    if (!s) { toast("Choose a status to apply."); return; }
    var n = 0;
    objects.forEach(function (o) { if (state.selected.has(o.id)) { o.status = s; n++; } });
    $("bulk-status").value = "";
    renderStats();
    render();
    toast("Set <span class=\"t-gold\">" + n + "</span> object" + (n === 1 ? "" : "s") + " to " + escapeHtml(s) + ".");
  });
  $("bulk-clear").addEventListener("click", function () {
    state.selected.clear();
    render();
  });

  // ---- Slide-over form ---------------------------------------------------
  var slideover = $("slideover");
  var scrim = $("scrim");
  var form = $("object-form");
  var editingId = null;
  var lastFocus = null;

  function openForm(id) {
    editingId = id || null;
    lastFocus = document.activeElement;
    form.reset();
    clearErrors();
    renderMediumOptions();
    $("slide-title").textContent = id ? "Edit object" : "New object";
    if (id) {
      var o = objects.find(function (x) { return x.id === id; });
      $("f-accession").value = o.accession;
      $("f-title").value = o.title;
      $("f-artist").value = o.artist;
      $("f-date").value = o.date;
      $("f-medium").value = o.medium;
      $("f-location").value = o.location;
      $("f-status").value = o.status;
    }
    scrim.hidden = false;
    slideover.hidden = false;
    setTimeout(function () { $("f-accession").focus(); }, 30);
    document.addEventListener("keydown", onKey);
  }

  function closeForm() {
    slideover.hidden = true;
    scrim.hidden = true;
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) { if (e.key === "Escape") closeForm(); }

  $("slide-close").addEventListener("click", closeForm);
  $("slide-cancel").addEventListener("click", closeForm);
  scrim.addEventListener("click", closeForm);

  function clearErrors() {
    form.querySelectorAll(".field.invalid").forEach(function (f) { f.classList.remove("invalid"); });
    form.querySelectorAll(".err").forEach(function (e) { e.textContent = ""; });
  }

  function setError(name, msg) {
    var input = form.querySelector('[name="' + name + '"]');
    var field = input.closest(".field");
    field.classList.add("invalid");
    var err = field.querySelector('.err[data-for="' + name + '"]');
    if (err) err.textContent = msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var data = {
      accession: $("f-accession").value.trim(),
      title: $("f-title").value.trim(),
      artist: $("f-artist").value.trim() || "Unknown",
      date: $("f-date").value.trim(),
      medium: $("f-medium").value.trim() || "—",
      location: $("f-location").value.trim() || "Unassigned",
      status: $("f-status").value
    };
    var ok = true;
    if (!data.accession) { setError("accession", "Accession number is required."); ok = false; }
    else if (!/^\d{4}\.\d{1,4}(\.\d{1,3})?$/.test(data.accession)) { setError("accession", "Use a format like 2024.118.3."); ok = false; }
    else {
      var dup = objects.some(function (o) { return o.accession === data.accession && o.id !== editingId; });
      if (dup) { setError("accession", "That accession number already exists."); ok = false; }
    }
    if (!data.title) { setError("title", "Title is required."); ok = false; }
    if (!data.date) { setError("date", "A date is required."); ok = false; }
    if (!ok) {
      form.querySelector(".field.invalid input").focus();
      return;
    }

    if (editingId) {
      var o = objects.find(function (x) { return x.id === editingId; });
      Object.assign(o, data);
      toast("Updated <span class=\"t-gold\">" + escapeHtml(data.title) + "</span>.");
    } else {
      objects.unshift(Object.assign({
        id: "obj-" + Date.now(),
        pal: PALETTES[objects.length % PALETTES.length]
      }, data));
      toast("Catalogued <span class=\"t-gold\">" + escapeHtml(data.title) + "</span>.");
    }
    closeForm();
    renderStats();
    renderMediumOptions();
    render();
  });

  $("add-btn").addEventListener("click", function () { openForm(null); });

  // ---- Delete confirm ----------------------------------------------------
  var confirmEl = $("confirm");
  var confirmScrim = $("confirm-scrim");
  var pendingDelete = [];

  function askDelete(ids) {
    pendingDelete = ids;
    var body = $("confirm-body");
    if (ids.length === 1) {
      var o = objects.find(function (x) { return x.id === ids[0]; });
      $("confirm-title").textContent = "Remove this object?";
      body.innerHTML = "“" + escapeHtml(o.title) + "” (" + escapeHtml(o.accession) + ") will be permanently removed from the catalog.";
    } else {
      $("confirm-title").textContent = "Remove " + ids.length + " objects?";
      body.textContent = "The selected records will be permanently removed from the catalog.";
    }
    confirmScrim.hidden = false;
    confirmEl.hidden = false;
    setTimeout(function () { $("confirm-cancel").focus(); }, 30);
    document.addEventListener("keydown", onConfirmKey);
  }

  function closeConfirm() {
    confirmEl.hidden = true;
    confirmScrim.hidden = true;
    pendingDelete = [];
    document.removeEventListener("keydown", onConfirmKey);
  }
  function onConfirmKey(e) { if (e.key === "Escape") closeConfirm(); }

  $("confirm-cancel").addEventListener("click", closeConfirm);
  confirmScrim.addEventListener("click", closeConfirm);
  $("confirm-ok").addEventListener("click", function () {
    var ids = pendingDelete.slice();
    objects = objects.filter(function (o) { return ids.indexOf(o.id) === -1; });
    ids.forEach(function (id) { state.selected.delete(id); });
    closeConfirm();
    renderStats();
    renderMediumOptions();
    render();
    toast("Removed " + ids.length + " object" + (ids.length === 1 ? "" : "s") + ".");
  });

  // ---- Init --------------------------------------------------------------
  renderStats();
  renderMediumOptions();
  render();
})();
