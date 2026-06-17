(function () {
  "use strict";

  var TIER_COLORS = ["#7c3aed", "#ff3d81", "#0ea5e9", "#f97316", "#16a34a", "#d97706"];

  var state = {
    tiers: [
      { id: 1, name: "General Admission", price: 49, qty: 1200, color: "#7c3aed" },
      { id: 2, name: "VIP Lounge", price: 129, qty: 300, color: "#ff3d81" },
      { id: 3, name: "Platinum Pit", price: 249, qty: 60, color: "#0ea5e9" },
    ],
    sections: [
      { id: 1, name: "Floor A", cap: 400 },
      { id: 2, name: "Mezzanine", cap: 220 },
    ],
    seatMode: "ga",
    hero: "#7c3aed",
    nextTier: 4,
    nextSection: 3,
    published: false,
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- toast ---------- */
  function toast(msg, kind) {
    var wrap = $("#toastWrap");
    var t = document.createElement("div");
    t.className = "toast";
    if (kind === "err") t.setAttribute("data-kind", "err");
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3100);
  }

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function fmtDate(val) {
    if (!val) return "Date TBA";
    var d = new Date(val + "T00:00:00");
    if (isNaN(d)) return "Date TBA";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }

  /* ---------- tiers ---------- */
  function renderTiers() {
    var list = $("#tierList");
    list.innerHTML = "";
    state.tiers.forEach(function (tier) {
      var row = document.createElement("div");
      row.className = "tier";
      row.style.setProperty("--tc", tier.color);
      row.innerHTML =
        '<span class="tier-bar"></span>' +
        '<div class="tier-fields">' +
          '<label>Tier name<input type="text" data-f="name" value="' + escAttr(tier.name) + '" placeholder="Tier name" /></label>' +
          '<label class="with-prefix">Price<span class="prefix">$</span><input type="number" min="0" step="1" data-f="price" value="' + tier.price + '" /></label>' +
          '<label>Quantity<input type="number" min="0" step="1" data-f="qty" value="' + tier.qty + '" /></label>' +
        '</div>' +
        '<button class="tier-remove" type="button" aria-label="Remove tier"' + (state.tiers.length <= 1 ? " disabled" : "") + '>×</button>';

      row.querySelectorAll("input").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var f = inp.getAttribute("data-f");
          if (f === "name") tier.name = inp.value;
          else tier[f] = Math.max(0, parseInt(inp.value, 10) || 0);
          updateTotals();
          renderPreview();
        });
      });
      var rm = row.querySelector(".tier-remove");
      rm.addEventListener("click", function () {
        if (state.tiers.length <= 1) return;
        state.tiers = state.tiers.filter(function (t) { return t.id !== tier.id; });
        markDraft();
        renderTiers(); updateTotals(); renderPreview();
        toast("Removed “" + (tier.name || "tier") + "”");
      });
      list.appendChild(row);
    });
  }

  function addTier() {
    var color = TIER_COLORS[state.tiers.length % TIER_COLORS.length];
    state.tiers.push({ id: state.nextTier++, name: "New tier", price: 35, qty: 100, color: color });
    markDraft();
    renderTiers(); updateTotals(); renderPreview();
    toast("Tier added");
    var inputs = $$("#tierList .tier:last-child input[data-f='name']");
    if (inputs[0]) inputs[0].select();
  }

  function updateTotals() {
    var cap = 0, gross = 0;
    state.tiers.forEach(function (t) { cap += t.qty; gross += t.qty * t.price; });
    $("#totalCap").textContent = cap.toLocaleString("en-US");
    $("#grossPot").textContent = money(gross);
    $("#pvCap").textContent = cap.toLocaleString("en-US");
    $("#pvCount").textContent = String(state.tiers.length);
    $("#pvGross").textContent = money(gross);
  }

  /* ---------- seating ---------- */
  function renderSections() {
    var list = $("#sectionList");
    list.innerHTML = "";
    state.sections.forEach(function (sec) {
      var row = document.createElement("div");
      row.className = "section-row";
      row.innerHTML =
        '<label>Section name<input type="text" data-f="name" value="' + escAttr(sec.name) + '" /></label>' +
        '<label>Capacity<input type="number" min="0" data-f="cap" value="' + sec.cap + '" /></label>' +
        '<button class="tier-remove" type="button" aria-label="Remove section">×</button>';
      row.querySelectorAll("input").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var f = inp.getAttribute("data-f");
          if (f === "name") sec.name = inp.value;
          else sec.cap = Math.max(0, parseInt(inp.value, 10) || 0);
        });
      });
      row.querySelector(".tier-remove").addEventListener("click", function () {
        state.sections = state.sections.filter(function (s) { return s.id !== sec.id; });
        renderSections();
        toast("Section removed");
      });
      list.appendChild(row);
    });
  }

  function setSeatMode(mode) {
    state.seatMode = mode;
    $$(".seat-mode").forEach(function (b) {
      var on = b.getAttribute("data-mode") === mode;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    $("#sectionsWrap").hidden = mode !== "reserved";
    if (mode === "reserved" && state.sections.length === 0) addSection();
    markDraft();
    renderPreview();
  }

  function addSection() {
    state.sections.push({ id: state.nextSection++, name: "Section " + state.nextSection, cap: 150 });
    renderSections();
  }

  /* ---------- preview ---------- */
  function renderPreview() {
    var name = $("#evName").value.trim() || "Untitled event";
    var venue = $("#evVenue").value.trim() || "Venue TBA";
    var date = $("#evDate").value;
    var desc = $("#evDesc").value.trim();

    document.documentElement.style.setProperty("--hero", state.hero);
    $("#pvName").textContent = name;
    $("#pvVenue").textContent = venue;
    $("#pvDate").textContent = fmtDate(date);
    $("#pvDesc").textContent = desc;

    var seatLabel = state.seatMode === "reserved" ? "Reserved seating" : "General admission";
    $("#pvSeat").textContent = seatLabel;

    var rows = $("#pvTiers");
    rows.innerHTML = "";
    if (!state.tiers.length) {
      rows.innerHTML = '<p class="pv-empty">No tiers yet — add one to see pricing.</p>';
    } else {
      state.tiers.forEach(function (t) {
        var el = document.createElement("div");
        el.className = "pv-row";
        el.style.setProperty("--tc", t.color);
        var soldOut = t.qty === 0;
        el.innerHTML =
          '<span class="pv-swatch"></span>' +
          '<span class="pv-name">' + escHtml(t.name || "Tier") +
            (soldOut ? ' <small style="color:var(--danger)">Sold out</small>'
                     : ' <small>' + t.qty.toLocaleString("en-US") + ' left</small>') + '</span>' +
          '<span class="pv-price">' + money(t.price) + '</span>';
        rows.appendChild(el);
      });
    }

    var badge = $("#pvStatus");
    badge.textContent = state.published ? "Live" : "Draft";
    badge.setAttribute("data-live", state.published ? "1" : "0");
  }

  /* ---------- status ---------- */
  function markDraft() {
    if (!state.published) return;
    state.published = false;
    setStatus("draft");
    renderPreview();
  }
  function setStatus(s) {
    var pill = $("#statusPill");
    pill.setAttribute("data-state", s);
    pill.textContent = s === "live" ? "Live" : "Draft";
  }

  /* ---------- validation ---------- */
  function clearErr(id) {
    var f = document.querySelector('[data-err="' + id + '"]');
    if (f) { f.textContent = ""; f.closest(".field").classList.remove("has-error"); }
  }
  function setErr(id, msg) {
    var f = document.querySelector('[data-err="' + id + '"]');
    if (f) { f.textContent = msg; f.closest(".field").classList.add("has-error"); }
  }

  function validate() {
    var ok = true;
    var checks = [
      ["evName", $("#evName").value.trim(), "Event name is required."],
      ["evVenue", $("#evVenue").value.trim(), "Venue is required."],
      ["evDate", $("#evDate").value, "Pick an event date."],
    ];
    checks.forEach(function (c) {
      clearErr(c[0]);
      if (!c[1]) { setErr(c[0], c[2]); ok = false; }
    });

    if ($("#evDate").value) {
      var d = new Date($("#evDate").value + "T00:00:00");
      var today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) { setErr("evDate", "Date can't be in the past."); ok = false; }
    }

    var totalCap = state.tiers.reduce(function (s, t) { return s + t.qty; }, 0);
    var named = state.tiers.every(function (t) { return t.name.trim().length > 0; });
    if (!named) { toast("Every tier needs a name.", "err"); ok = false; }
    if (totalCap <= 0) { toast("Add capacity to at least one tier.", "err"); ok = false; }

    return ok;
  }

  /* ---------- escaping ---------- */
  function escHtml(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;"); }

  /* ---------- wiring ---------- */
  function init() {
    renderTiers();
    renderSections();
    updateTotals();
    renderPreview();

    $("#addTierBtn").addEventListener("click", addTier);
    $("#addSectionBtn").addEventListener("click", function () { addSection(); toast("Section added"); });

    $$(".seat-mode").forEach(function (b) {
      b.addEventListener("click", function () { setSeatMode(b.getAttribute("data-mode")); });
    });

    ["evName", "evVenue", "evDate", "evTime", "evDesc"].forEach(function (id) {
      var el = $("#" + id);
      el.addEventListener("input", function () { clearErr(id); markDraft(); renderPreview(); });
    });

    $$("#heroSwatches .swatch").forEach(function (sw) {
      sw.addEventListener("click", function () {
        state.hero = sw.getAttribute("data-c");
        $$("#heroSwatches .swatch").forEach(function (s) {
          var on = s === sw;
          s.classList.toggle("is-on", on);
          s.setAttribute("aria-checked", on ? "true" : "false");
        });
        markDraft();
        renderPreview();
      });
    });

    $("#saveDraftBtn").addEventListener("click", function () {
      toast("Draft saved");
    });

    $("#publishBtn").addEventListener("click", function () {
      if (!validate()) {
        toast("Fix the highlighted fields to publish.", "err");
        var firstErr = document.querySelector(".has-error input");
        if (firstErr) firstErr.focus();
        return;
      }
      state.published = true;
      setStatus("live");
      renderPreview();
      toast("“" + ($("#evName").value.trim()) + "” is live!");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
