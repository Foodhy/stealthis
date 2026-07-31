(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toaster = document.getElementById("toaster");
  function toast(msg, ms) {
    if (!toaster) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toaster.appendChild(el);
    window.setTimeout(function () {
      el.classList.add("is-out");
      window.setTimeout(function () { el.remove(); }, 240);
    }, ms || 2400);
  }

  /* ---------- accordions ---------- */
  var accBtns = document.querySelectorAll(".acc-btn");
  Array.prototype.forEach.call(accBtns, function (btn) {
    btn.addEventListener("click", function () {
      var acc = btn.closest(".acc");
      var open = acc.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  function openAccordionsWithVisibleRows() {
    Array.prototype.forEach.call(document.querySelectorAll(".acc"), function (acc) {
      var rows = acc.querySelectorAll(".grow");
      var visible = 0;
      Array.prototype.forEach.call(rows, function (r) {
        if (!r.classList.contains("is-dim")) visible++;
      });
      var btn = acc.querySelector(".acc-btn");
      if (visible > 0 && !acc.classList.contains("is-open")) {
        acc.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ---------- difficulty filter ---------- */
  var allRows = document.querySelectorAll(".grow");
  var status = document.querySelector("[data-filter-status]");
  var fbtns = document.querySelectorAll(".fbtn");
  var total = allRows.length;

  function applyFilter(value) {
    var shown = 0;
    Array.prototype.forEach.call(allRows, function (row) {
      var match = value === "all" || row.getAttribute("data-difficulty") === value;
      row.classList.toggle("is-dim", !match);
      if (match) shown++;
    });
    Array.prototype.forEach.call(fbtns, function (b) {
      var on = b.getAttribute("data-diff") === value;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (status) {
      status.textContent = value === "all"
        ? "Showing all " + total + " guides."
        : "Highlighting " + shown + " of " + total + " guides rated " + value + ".";
    }
    if (value !== "all") openAccordionsWithVisibleRows();
  }

  Array.prototype.forEach.call(fbtns, function (b) {
    b.addEventListener("click", function () {
      applyFilter(b.getAttribute("data-diff"));
    });
  });
  applyFilter("all");

  /* ---------- cart ---------- */
  var cart = [];
  var countEl = document.querySelector("[data-cart-count]");
  var totalEl = document.querySelector("[data-cart-total]");

  function renderCart() {
    var sum = cart.reduce(function (a, i) { return a + i.price; }, 0);
    if (countEl) countEl.textContent = String(cart.length);
    if (totalEl) totalEl.textContent = "$" + sum;
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-add]"), function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-add");
      var price = parseFloat(btn.getAttribute("data-price")) || 0;
      cart.push({ name: name, price: price });
      renderCart();
      btn.classList.add("is-added");
      btn.textContent = "Added";
      window.setTimeout(function () {
        btn.classList.remove("is-added");
        btn.textContent = "Add";
      }, 1300);
      toast(name + " added to your repair kit — $" + price);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-cart-open]"), function (btn) {
    btn.addEventListener("click", function () {
      if (!cart.length) { toast("Your repair kit is empty — add a part or tool."); return; }
      var sum = cart.reduce(function (a, i) { return a + i.price; }, 0);
      toast(cart.length + " item" + (cart.length > 1 ? "s" : "") + " in the kit · subtotal $" + sum, 3200);
    });
  });
  renderCart();

  /* ---------- smooth scroll to score ---------- */
  var scoreLink = document.querySelector("[data-score-link]");
  if (scoreLink) {
    scoreLink.addEventListener("click", function (e) {
      var target = document.getElementById("score");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus({ preventScroll: true });
    });
  }

  /* ---------- reveal: counters + bars ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target.toLocaleString("en-US") + suffix; return; }
    var start = performance.now();
    var dur = 900;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll("[data-count]");
  var bars = document.querySelectorAll(".bar");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-count")) countUp(el);
        else el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(counters, function (c) { io.observe(c); });
    Array.prototype.forEach.call(bars, function (b) { io.observe(b); });
  } else {
    Array.prototype.forEach.call(counters, countUp);
    Array.prototype.forEach.call(bars, function (b) { b.classList.add("is-in"); });
  }

  /* ---------- guide + problem rows are demo links ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".grow a, .problems a"), function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var name = a.querySelector(".g-name") || a.querySelector(".p-fix");
      toast("Opening guide: " + (name ? name.textContent.replace("→", "").trim() : "guide"));
    });
  });
})();
