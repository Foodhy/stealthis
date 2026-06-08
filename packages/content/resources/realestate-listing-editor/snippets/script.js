(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var byId = function (id) { return document.getElementById(id); };

  var toastEl = byId("toast");
  var toastTimer = null;
  function toast(msg, ok) {
    if (!toastEl) return;
    toastEl.innerHTML =
      (ok === false ? "" : '<span class="toast__check" aria-hidden="true">✓</span>') +
      String(msg);
    toastEl.hidden = false;
    // force reflow so the transition replays
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  function digits(str) { return String(str == null ? "" : str).replace(/[^\d]/g, ""); }
  function groupThousands(num) {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* ---------- feature checklist ---------- */
  var FEATURES = [
    "Chef's kitchen", "Hardwood floors", "Primary suite", "Two-car garage",
    "Swimming pool", "Home office", "Solar panels", "Mountain views",
    "Wine cellar", "Smart home", "Fireplace", "Walk-in closets"
  ];
  var DEFAULT_ON = ["Chef's kitchen", "Hardwood floors", "Primary suite", "Mountain views"];

  var featuresWrap = byId("features");
  FEATURES.forEach(function (name, i) {
    var id = "feat-" + i;
    var label = document.createElement("label");
    label.className = "feature";
    label.setAttribute("for", id);
    var input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = name;
    input.checked = DEFAULT_ON.indexOf(name) !== -1;
    var span = document.createElement("span");
    span.textContent = name;
    label.appendChild(input);
    label.appendChild(span);
    featuresWrap.appendChild(label);
    input.addEventListener("change", renderFeatures);
  });

  /* ---------- photos ---------- */
  // tone index cycles 0..3, mapping to the CSS gradient "photos"
  var photoGrid = byId("photoGrid");
  var fileInput = byId("fileInput");
  var dropzone = byId("dropzone");
  var photoSeq = 0;
  var photos = []; // { id, tone, label }

  var LABELS = ["Front elevation", "Great room", "Kitchen", "Primary suite",
                "Garden", "Pool deck", "Office", "Aerial view"];

  function addPhotos(n) {
    for (var i = 0; i < n; i++) {
      photos.push({
        id: "p" + (photoSeq++),
        tone: photos.length % 4,
        label: LABELS[photoSeq % LABELS.length]
      });
    }
    renderPhotos();
    syncPreview();
  }

  function renderPhotos() {
    photoGrid.innerHTML = "";
    photos.forEach(function (p, idx) {
      var li = document.createElement("li");
      li.className = "photo listing-card__media";
      li.setAttribute("data-tone", String(p.tone));
      li.setAttribute("draggable", "true");
      li.dataset.id = p.id;

      var img = document.createElement("span");
      img.className = "photo__img";
      li.appendChild(img);

      if (idx === 0) {
        var cover = document.createElement("span");
        cover.className = "photo__cover";
        cover.textContent = "Cover";
        li.appendChild(cover);
      }

      var ord = document.createElement("span");
      ord.className = "photo__order";
      ord.textContent = (idx + 1) + " · " + p.label;
      li.appendChild(ord);

      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "photo__remove";
      rm.setAttribute("aria-label", "Remove photo " + (idx + 1));
      rm.innerHTML = "&times;";
      rm.addEventListener("click", function (e) {
        e.stopPropagation();
        photos = photos.filter(function (x) { return x.id !== p.id; });
        renderPhotos();
        syncPreview();
        toast("Photo removed");
      });
      li.appendChild(rm);

      attachDrag(li);
      photoGrid.appendChild(li);
    });
  }

  /* drag-reorder */
  var dragId = null;
  function attachDrag(li) {
    li.addEventListener("dragstart", function (e) {
      dragId = li.dataset.id;
      li.classList.add("dragging");
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragId); }
    });
    li.addEventListener("dragend", function () {
      li.classList.remove("dragging");
      Array.prototype.forEach.call(photoGrid.children, function (c) { c.classList.remove("drop-target"); });
      dragId = null;
    });
    li.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      if (li.dataset.id !== dragId) li.classList.add("drop-target");
    });
    li.addEventListener("dragleave", function () { li.classList.remove("drop-target"); });
    li.addEventListener("drop", function (e) {
      e.preventDefault();
      li.classList.remove("drop-target");
      var targetId = li.dataset.id;
      if (!dragId || dragId === targetId) return;
      var from = photos.findIndex(function (p) { return p.id === dragId; });
      var to = photos.findIndex(function (p) { return p.id === targetId; });
      if (from < 0 || to < 0) return;
      var moved = photos.splice(from, 1)[0];
      photos.splice(to, 0, moved);
      var wasCover = to === 0;
      renderPhotos();
      syncPreview();
      if (wasCover) toast("New cover photo set");
    });
  }

  // dropzone interactions (simulate uploads)
  dropzone.addEventListener("click", function () { fileInput.click(); });
  dropzone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener("change", function () {
    var n = fileInput.files && fileInput.files.length ? fileInput.files.length : 1;
    addPhotos(n);
    toast(n + (n === 1 ? " photo added" : " photos added"));
    fileInput.value = "";
  });
  ["dragenter", "dragover"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("is-over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove("is-over"); });
  });
  dropzone.addEventListener("drop", function (e) {
    var n = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) || 1;
    addPhotos(n);
    toast(n + (n === 1 ? " photo added" : " photos added"));
  });

  /* ---------- live preview ---------- */
  var els = {
    address: byId("address"), city: byId("city"), zip: byId("zip"),
    price: byId("price"), type: byId("type"), beds: byId("beds"),
    baths: byId("baths"), sqft: byId("sqft"), year: byId("year"),
    description: byId("description")
  };

  var p = {
    media: byId("previewMedia"), count: byId("previewCount"),
    status: byId("previewStatus"), price: byId("previewPrice"),
    address: byId("previewAddress"), loc: byId("previewLoc"),
    beds: byId("specBeds"), baths: byId("specBaths"), sqft: byId("specSqft"),
    type: byId("previewType"), desc: byId("previewDesc"), features: byId("previewFeatures")
  };

  function fmtNum(v) {
    var d = digits(v);
    return d ? groupThousands(d) : "";
  }

  // live price formatting
  els.price.addEventListener("input", function () {
    var caretEnd = els.price.selectionStart === els.price.value.length;
    els.price.value = fmtNum(els.price.value);
    if (caretEnd) els.price.setSelectionRange(els.price.value.length, els.price.value.length);
    clearError("price");
    syncPreview();
  });

  function syncPreview() {
    var addr = els.address.value.trim() || "Untitled listing";
    p.address.textContent = addr;

    var loc = [els.city.value.trim(), els.zip.value.trim()].filter(Boolean).join(" ");
    p.loc.textContent = loc || "Location pending";

    var price = digits(els.price.value);
    p.price.textContent = price ? "$" + groupThousands(price) : "Price on request";

    p.beds.textContent = els.beds.value || "0";
    p.baths.textContent = els.baths.value || "0";
    p.sqft.textContent = els.sqft.value ? groupThousands(digits(els.sqft.value)) : "—";

    var typeParts = [els.type.value];
    if (els.year.value) typeParts.push("Built " + els.year.value);
    p.type.textContent = typeParts.join(" · ");

    p.desc.textContent = els.description.value.trim() ||
      "Add a description to bring this home to life.";

    // photo cover + count
    if (photos.length) {
      p.media.setAttribute("data-tone", String(photos[0].tone));
      p.count.textContent = "1 / " + photos.length;
      p.count.style.display = "";
    } else {
      p.media.setAttribute("data-tone", "0");
      p.count.textContent = "No photos";
    }
  }

  function renderFeatures() {
    var checked = Array.prototype.slice
      .call(featuresWrap.querySelectorAll("input:checked"))
      .map(function (i) { return i.value; });
    p.features.innerHTML = "";
    if (!checked.length) {
      var li = document.createElement("li");
      li.className = "chip-row__empty";
      li.textContent = "No features selected yet";
      p.features.appendChild(li);
      return;
    }
    checked.slice(0, 8).forEach(function (name) {
      var li = document.createElement("li");
      li.textContent = name;
      p.features.appendChild(li);
    });
    if (checked.length > 8) {
      var more = document.createElement("li");
      more.textContent = "+" + (checked.length - 8) + " more";
      p.features.appendChild(more);
    }
  }

  // wire all text/number/select inputs to preview
  ["address", "city", "zip", "type", "beds", "baths", "sqft", "year", "description"]
    .forEach(function (k) {
      els[k].addEventListener("input", function () { clearError(k); syncPreview(); });
      els[k].addEventListener("change", syncPreview);
    });

  /* ---------- char count ---------- */
  var charCount = byId("charCount");
  var MAX = 600;
  function updateCount() {
    var len = els.description.value.length;
    charCount.textContent = len + " / " + MAX;
    charCount.classList.toggle("is-near", len >= MAX * 0.85 && len < MAX);
    charCount.classList.toggle("is-max", len >= MAX);
  }
  els.description.addEventListener("input", updateCount);

  /* ---------- validation ---------- */
  function showError(field) {
    els[field].classList.add("is-invalid");
    var msg = document.querySelector('[data-error="' + field + '"]');
    if (msg) msg.hidden = false;
  }
  function clearError(field) {
    if (!els[field]) return;
    els[field].classList.remove("is-invalid");
    var msg = document.querySelector('[data-error="' + field + '"]');
    if (msg) msg.hidden = true;
  }

  function validate() {
    var ok = true;
    if (!els.address.value.trim()) { showError("address"); ok = false; }
    var price = digits(els.price.value);
    if (!price || Number(price) <= 0) { showError("price"); ok = false; }
    return ok;
  }

  /* ---------- status + buttons ---------- */
  var statusPill = byId("statusPill");
  var statusLabel = byId("statusLabel");

  function setStatus(state) {
    statusPill.setAttribute("data-state", state);
    var text = state === "published" ? "Published" : "Draft";
    statusLabel.textContent = text;
    p.status.textContent = text;
    p.status.setAttribute("data-state", state);
  }

  byId("saveBtn").addEventListener("click", function () {
    syncPreview();
    setStatus("draft");
    toast("Draft saved");
  });

  byId("publishBtn").addEventListener("click", function () {
    if (!validate()) {
      var first = document.querySelector(".input.is-invalid");
      if (first) first.focus();
      toast("Add an address and price before publishing", false);
      return;
    }
    if (!photos.length) {
      toast("Add at least one photo before publishing", false);
      dropzone.focus();
      return;
    }
    setStatus("published");
    var addr = els.address.value.trim();
    toast("Published “" + addr + "” to the market");
  });

  /* ---------- init ---------- */
  addPhotos(4);
  renderFeatures();
  updateCount();
  syncPreview();
})();
