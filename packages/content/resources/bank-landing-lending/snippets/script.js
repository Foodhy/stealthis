(function () {
  "use strict";

  /* ───────── Toast helper ───────── */
  var toastHost = document.getElementById("toastHost");
  function toast(msg, opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      '<span class="t-ic" aria-hidden="true">' + (opts.icon || "✓") + "</span><span>" + msg + "</span>";
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      el.addEventListener("animationend", function () { el.remove(); });
    }, opts.duration || 2600);
  }

  /* ───────── Money formatting ───────── */
  var fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  function money(n) { return fmt.format(n); }

  /* ───────── Calculator ───────── */
  var amount = document.getElementById("amount");
  var range = document.getElementById("amountRange");
  var schedule = document.getElementById("schedule");
  var totalPay = document.getElementById("totalPay");
  var MIN = 20, MAX = 2000;

  var WHEN = ["Due today", "In 2 weeks", "In 4 weeks", "In 6 weeks"];

  function clamp(v) { return Math.min(MAX, Math.max(MIN, v)); }

  function parseAmount() {
    var v = parseFloat(String(amount.value).replace(/[^0-9.]/g, ""));
    if (isNaN(v)) v = MIN;
    return v;
  }

  function paintRange(v) {
    var pct = ((v - MIN) / (MAX - MIN)) * 100;
    range.style.background =
      "linear-gradient(90deg, var(--coral) 0%, var(--coral) " + pct + "%, var(--line) " + pct + "%)";
  }

  function render(v, animate) {
    var each = v / 4;
    var rows = "";
    for (var i = 0; i < 4; i++) {
      // last instalment absorbs rounding remainder
      var amt = i < 3 ? Math.floor(each * 100) / 100 : v - Math.floor(each * 100) / 100 * 3;
      rows +=
        '<div class="pay-row"' + (animate ? ' style="animation-delay:' + i * 60 + 'ms"' : "") + ">" +
          '<span class="pay-badge">' + (i + 1) + "</span>" +
          '<span class="pay-when">' + (i === 0 ? "Pay today" : "Payment " + (i + 1)) +
            "<small>" + WHEN[i] + "</small></span>" +
          '<span class="pay-amt">' + money(amt) + "</span>" +
        "</div>";
    }
    schedule.innerHTML = rows;
    totalPay.textContent = money(v);
  }

  function syncFromAmount(animate) {
    var v = clamp(parseAmount());
    range.value = v;
    paintRange(v);
    render(v, animate);
  }

  amount.addEventListener("input", function () { syncFromAmount(false); });
  amount.addEventListener("blur", function () {
    var v = clamp(parseAmount());
    amount.value = v.toFixed(2);
    syncFromAmount(true);
  });
  range.addEventListener("input", function () {
    var v = clamp(parseFloat(range.value));
    amount.value = v.toFixed(2);
    paintRange(v);
    render(v, false);
  });

  // initial paint
  syncFromAmount(true);

  /* Pre-qualify button */
  document.getElementById("prequalBtn").addEventListener("click", function () {
    var v = clamp(parseAmount());
    toast("Pre-qualified! " + money(v / 4) + " due today — no score impact.", { duration: 3200 });
  });

  /* ───────── Mobile nav ───────── */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  function closeNav() { navLinks.classList.remove("is-open"); navToggle.setAttribute("aria-expanded", "false"); }
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ───────── Partner stores ───────── */
  var PARTNERS = [
    { name: "Lumen Living", cat: "home", offer: "Pay in 4", color: "#ff6b5e" },
    { name: "NorthPeak", cat: "fashion", offer: "0% interest", color: "#2bcc9a" },
    { name: "Petalwood", cat: "home", offer: "Pay in 4", color: "#7c5cff" },
    { name: "Coraline Beauty", cat: "beauty", offer: "Free returns", color: "#f0473a" },
    { name: "Volt Cycles", cat: "tech", offer: "Pay Monthly", color: "#1ba87d" },
    { name: "Saltwater Co.", cat: "fashion", offer: "Pay in 30", color: "#ff8a5e" },
    { name: "Mira Home", cat: "home", offer: "Pay in 4", color: "#5c7cff" },
    { name: "Brightline", cat: "tech", offer: "0% interest", color: "#ff6b5e" },
    { name: "Velvet & Oak", cat: "beauty", offer: "Pay in 4", color: "#cc5cff" },
    { name: "Trailhead", cat: "fashion", offer: "Pay Monthly", color: "#2bcc9a" },
    { name: "Pixelworks", cat: "tech", offer: "Pay in 30", color: "#f0473a" },
    { name: "Glow Atelier", cat: "beauty", offer: "Free returns", color: "#7c5cff" }
  ];
  var grid = document.getElementById("partnerGrid");

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }
  function renderPartners(cat) {
    var list = cat === "all" ? PARTNERS : PARTNERS.filter(function (p) { return p.cat === cat; });
    grid.innerHTML = list.map(function (p, i) {
      return (
        '<article class="partner" style="animation-delay:' + i * 40 + 'ms">' +
          '<div class="partner-logo" style="background:' + p.color + '">' + initials(p.name) + "</div>" +
          "<h3>" + p.name + "</h3>" +
          '<span class="cat">' + p.cat + "</span><br />" +
          '<span class="offer">' + p.offer + "</span>" +
        "</article>"
      );
    }).join("");
  }
  renderPartners("all");

  var catTabs = document.getElementById("catTabs");
  catTabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".cat-tab");
    if (!btn) return;
    catTabs.querySelectorAll(".cat-tab").forEach(function (t) {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    renderPartners(btn.dataset.cat);
  });

  /* ───────── FAQ accordion ───────── */
  var accordion = document.getElementById("accordion");
  accordion.addEventListener("click", function (e) {
    var q = e.target.closest(".acc-q");
    if (!q) return;
    var item = q.parentElement;
    var open = item.classList.contains("is-open");
    accordion.querySelectorAll(".acc-item").forEach(function (it) {
      it.classList.remove("is-open");
      var ans = it.querySelector(".acc-a");
      ans.style.maxHeight = null;
      it.querySelector(".acc-q").setAttribute("aria-expanded", "false");
    });
    if (!open) {
      item.classList.add("is-open");
      q.setAttribute("aria-expanded", "true");
      var ans = item.querySelector(".acc-a");
      ans.style.maxHeight = ans.scrollHeight + "px";
    }
  });

  /* ───────── CTA email ───────── */
  var ctaForm = document.getElementById("ctaForm");
  var ctaEmail = document.getElementById("ctaEmail");
  var ctaMsg = document.getElementById("ctaMsg");
  ctaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = ctaEmail.value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      ctaMsg.textContent = "Please enter a valid email so we can send your link.";
      ctaMsg.classList.add("is-err");
      ctaEmail.focus();
      return;
    }
    ctaMsg.textContent = "Free forever on Pay in 4 · No spam, ever.";
    ctaMsg.classList.remove("is-err");
    ctaForm.reset();
    toast("Download link sent to your inbox.", { duration: 3000 });
  });
})();
