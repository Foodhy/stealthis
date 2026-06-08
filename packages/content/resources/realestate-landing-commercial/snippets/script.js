/* ============================================================
   Meridian Commercial — landing interactions (vanilla JS)
   - Asset-class tab filtering
   - Sortable listings table (price / cap / NOI / $-per-SF)
   - Animated hero counters
   - Demo request-OM form with validation + toast
   ============================================================ */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastRegion = document.getElementById("toast-region");
  function toast(msg) {
    if (!toastRegion) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRegion.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 280);
    }, 3200);
  }

  /* ---------- listing dataset (fictional) ---------- */
  var LISTINGS = [
    { name: "Cascade Logistics Park", meta: "412,000 SF · Reno, NV", cls: "industrial", price: 74500000, cap: 6.35, noi: 4730000, psf: 181, deal: "sale" },
    { name: "Northgate Office Tower", meta: "286,400 SF · Austin, TX", cls: "office", price: 119000000, cap: 5.85, noi: 6961500, psf: 416, deal: "sale" },
    { name: "Harbor Point Retail Center", meta: "98,200 SF · Tampa, FL", cls: "retail", price: 41200000, cap: 6.90, noi: 2842800, psf: 420, deal: "lease" },
    { name: "Ironworks Distribution", meta: "540,000 SF · Columbus, OH", cls: "industrial", price: 88300000, cap: 6.10, noi: 5386300, psf: 164, deal: "sale" },
    { name: "Mesa Crossing Power Center", meta: "212,500 SF · Phoenix, AZ", cls: "retail", price: 63750000, cap: 6.45, noi: 4111875, psf: 300, deal: "sale" },
    { name: "Lakeshore Corporate Plaza", meta: "174,000 SF · Chicago, IL", cls: "office", price: 52000000, cap: 7.20, noi: 3744000, psf: 299, deal: "lease" },
    { name: "Cypress Industrial Land", meta: "38.4 acres · Houston, TX", cls: "land", price: 18900000, cap: 0, noi: 0, psf: 11, deal: "sale" },
    { name: "Brightline Flex Campus", meta: "126,800 SF · Denver, CO", cls: "industrial", price: 33600000, cap: 6.75, noi: 2268000, psf: 265, deal: "lease" },
    { name: "Summit Medical Office", meta: "92,300 SF · Nashville, TN", cls: "office", price: 47800000, cap: 6.05, noi: 2891900, psf: 518, deal: "sale" },
    { name: "Riverbend Development Site", meta: "61.0 acres · Sacramento, CA", cls: "land", price: 27400000, cap: 0, noi: 0, psf: 10, deal: "sale" }
  ];

  var body = document.getElementById("listing-body");
  var emptyMsg = document.getElementById("table-empty");
  var state = { cls: "all", sortKey: null, sortDir: "desc" };

  /* ---------- formatters ---------- */
  function fmtMoney(n) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    return "$" + n.toLocaleString("en-US");
  }
  function fmtCap(n) { return n > 0 ? n.toFixed(2) + "%" : "—"; }
  function fmtNoi(n) { return n > 0 ? fmtMoney(n) : "—"; }
  function fmtPsf(n) { return "$" + n; }
  function classLabel(c) { return c.charAt(0).toUpperCase() + c.slice(1); }

  /* ---------- render ---------- */
  function visibleRows() {
    var rows = LISTINGS.filter(function (r) { return state.cls === "all" || r.cls === state.cls; });
    if (state.sortKey) {
      var dir = state.sortDir === "asc" ? 1 : -1;
      rows.sort(function (a, b) { return (a[state.sortKey] - b[state.sortKey]) * dir; });
    }
    return rows;
  }

  function render() {
    var rows = visibleRows();
    body.innerHTML = "";
    if (!rows.length) {
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;

    rows.forEach(function (r) {
      var tr = document.createElement("tr");

      var dealBadge = r.deal === "sale"
        ? '<span class="badge badge--sale">For Sale</span>'
        : '<span class="badge badge--lease">For Lease</span>';

      tr.innerHTML =
        '<td>' +
          '<div class="prop">' +
            '<span class="thumb thumb--' + r.cls + '" aria-hidden="true"></span>' +
            '<span>' +
              '<span class="prop__name">' + r.name + '</span>' +
              '<span class="prop__meta">' + classLabel(r.cls) + ' · ' + r.meta + '</span>' +
            '</span>' +
          '</div>' +
        '</td>' +
        '<td class="num cell-price">' + fmtMoney(r.price) + '</td>' +
        '<td class="num cell-cap">' + fmtCap(r.cap) + '</td>' +
        '<td class="num">' + fmtNoi(r.noi) + '</td>' +
        '<td class="num">' + fmtPsf(r.psf) + '</td>' +
        '<td>' + dealBadge + '</td>' +
        '<td><button class="row-cta" type="button" data-prop="' + r.name + '">Request OM</button></td>';

      body.appendChild(tr);
    });
  }

  /* ---------- tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      state.cls = tab.getAttribute("data-class");
      render();
      var n = visibleRows().length;
      var label = state.cls === "all" ? "all asset classes" : classLabel(state.cls);
      toast("Showing " + n + " listing" + (n === 1 ? "" : "s") + " · " + label);
    });
  });

  /* ---------- sorting ---------- */
  var headers = Array.prototype.slice.call(document.querySelectorAll("th.sortable"));
  headers.forEach(function (th) {
    var key = th.getAttribute("data-sort");
    th.querySelector("button").addEventListener("click", function () {
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "desc";
      }
      headers.forEach(function (h) { h.setAttribute("aria-sort", "none"); });
      th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      render();
      var labels = { price: "price", cap: "cap rate", noi: "NOI", psf: "price per SF" };
      toast("Sorted by " + labels[key] + " · " + (state.sortDir === "asc" ? "low to high" : "high to low"));
    });
  });

  /* ---------- row CTA (event delegation) ---------- */
  body.addEventListener("click", function (e) {
    var btn = e.target.closest(".row-cta");
    if (!btn) return;
    toast("OM requested for " + btn.getAttribute("data-prop") + " — a broker will follow up.");
    var form = document.getElementById("om-form");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ---------- hero counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (el.getAttribute("data-count").indexOf(".") > -1) ? 1 : 0;
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var shown = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-US");
      el.textContent = prefix + shown + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".stat__num[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- request-OM form ---------- */
  var form = document.getElementById("om-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["name"];
      var email = form.elements["email"];
      var ok = true;
      [name, email].forEach(function (f) { f.classList.remove("invalid"); });

      if (!name.value.trim()) { name.classList.add("invalid"); ok = false; }
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value.trim())) { email.classList.add("invalid"); ok = false; }

      if (!ok) {
        toast("Please add your name and a valid work email.");
        var firstBad = form.querySelector(".invalid");
        if (firstBad) firstBad.focus();
        return;
      }

      var cls = form.elements["assetClass"].value;
      toast("Request received — " + classLabel(cls) + " offering memoranda are on the way.");
      form.reset();
    });
  }

  /* ---------- init ---------- */
  render();
})();
