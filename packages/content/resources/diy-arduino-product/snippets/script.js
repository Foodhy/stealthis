(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- toast ---------------- */
  var toastHost = $("#toasts");
  function toast(msg, ms) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, ms || 2600);
  }

  /* ---------------- gallery ---------------- */
  var stage = $("#stage");
  var shots = $$(".shot");
  var thumbs = $$(".thumb");

  function showShot(name) {
    shots.forEach(function (s) { s.classList.toggle("is-active", s.dataset.shot === name); });
    thumbs.forEach(function (t) {
      var on = t.dataset.shot === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  thumbs.forEach(function (t, i) {
    t.addEventListener("click", function () { showShot(t.dataset.shot); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = thumbs[(i + d + thumbs.length) % thumbs.length];
      next.focus();
      showShot(next.dataset.shot);
    });
  });

  /* magnifier: translate origin with pointer */
  stage.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * 100;
    var y = ((e.clientY - r.top) / r.height) * 100;
    var art = $(".shot.is-active .board-svg");
    if (art) art.style.transformOrigin = x + "% " + y + "%";
    stage.dataset.mag = "1";
  });
  stage.addEventListener("pointerleave", function () { stage.dataset.mag = "0"; });
  stage.addEventListener("blur", function () { stage.dataset.mag = "0"; });

  /* ---------------- buy box ---------------- */
  var priceEl = $("#price");
  var priceNote = $("#priceNote");
  var ctaTotal = $("#ctaTotal");
  var qtyEl = $("#qty");
  var stockEl = $("#stock");
  var stockText = $("#stockText");

  var money = function (n) { return "$" + n.toFixed(2); };

  function currentVariant() { return $('input[name="variant"]:checked'); }
  function qty() { return Math.max(1, Math.min(99, parseInt(qtyEl.value, 10) || 1)); }

  function render() {
    var v = currentVariant();
    var unitPrice = parseFloat(v.dataset.price);
    var units = parseInt(v.dataset.unit, 10);
    var q = qty();
    qtyEl.value = String(q);

    priceEl.textContent = money(unitPrice);
    priceNote.textContent = units > 1
      ? "excl. VAT · " + money(unitPrice / units) + " per board"
      : "excl. VAT · unit " + money(unitPrice);
    ctaTotal.textContent = money(unitPrice * q);

    if (v.dataset.stock === "low") {
      stockEl.dataset.level = "low";
      stockText.textContent = "Low stock — 9 trays left";
    } else {
      stockEl.dataset.level = "in";
      stockText.textContent = "In stock — ships in 24 h";
    }
  }

  $$('input[name="variant"]').forEach(function (r) {
    r.addEventListener("change", function () {
      render();
      var name = r.closest(".variant").querySelector(".variant-name").textContent;
      toast("Variant set to " + name.toLowerCase() + ".");
    });
  });

  $("#qtyMinus").addEventListener("click", function () { qtyEl.value = String(qty() - 1); render(); });
  $("#qtyPlus").addEventListener("click", function () { qtyEl.value = String(qty() + 1); render(); });
  qtyEl.addEventListener("input", function () { qtyEl.value = qtyEl.value.replace(/[^0-9]/g, ""); });
  qtyEl.addEventListener("change", render);
  qtyEl.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") { e.preventDefault(); qtyEl.value = String(qty() + 1); render(); }
    if (e.key === "ArrowDown") { e.preventDefault(); qtyEl.value = String(qty() - 1); render(); }
  });

  var cartCount = $("#cartCount");
  var cart = 0;
  $("#addBtn").addEventListener("click", function () {
    var v = currentVariant();
    var boards = qty() * parseInt(v.dataset.unit, 10);
    cart += boards;
    cartCount.textContent = String(cart);
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth;
    cartCount.classList.add("bump");
    toast("Added " + boards + " × Circuito Nano R3 — " + ctaTotal.textContent + " in cart.");
  });

  $("#cartBtn").addEventListener("click", function () {
    toast(cart === 0 ? "Your cart is empty." : "Cart: " + cart + " board" + (cart === 1 ? "" : "s") + " ready for checkout.");
  });

  render();

  /* ---------------- tabs ---------------- */
  var tabs = $$(".tab");
  function activate(btn) {
    tabs.forEach(function (t) {
      var on = t === btn;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      var p = document.getElementById(t.dataset.panel);
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { activate(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); activate(n);
    });
  });
  $$('a[href^="#tab-"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var btn = document.getElementById(a.getAttribute("href").slice(1));
      if (btn) activate(btn);
    });
  });

  /* ---------------- downloads ---------------- */
  $$(".dl").forEach(function (b) {
    b.addEventListener("click", function () {
      var size = b.parentElement.querySelector(".size").textContent;
      b.disabled = true;
      b.textContent = "Preparing…";
      setTimeout(function () {
        b.disabled = false;
        b.textContent = "Download";
        toast("Started download: " + b.dataset.file + " (" + size + ")");
      }, 620);
    });
  });

  /* ---------------- accessories carousel ---------------- */
  var rail = $("#rail");
  function step() {
    var card = rail.querySelector(".card");
    return card ? card.getBoundingClientRect().width + 16 : 240;
  }
  $("#accNext").addEventListener("click", function () { rail.scrollBy({ left: step() * 2, behavior: "smooth" }); });
  $("#accPrev").addEventListener("click", function () { rail.scrollBy({ left: -step() * 2, behavior: "smooth" }); });
  rail.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: step(), behavior: "smooth" }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: "smooth" }); }
  });
  $$(".card").forEach(function (c) {
    c.addEventListener("click", function () {
      toast(c.querySelector("h3").textContent + " — " + c.querySelector(".card-price").textContent);
    });
  });

  /* ---------------- copy snippet ---------------- */
  var copyBtn = $("#copyBtn");
  copyBtn.addEventListener("click", function () {
    var code = $(".code pre code").textContent;
    var done = function () {
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("done");
      toast("blink.ino copied to clipboard.");
      setTimeout(function () { copyBtn.textContent = "Copy"; copyBtn.classList.remove("done"); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = code; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (err) { toast("Copy failed — select the code manually."); }
      ta.remove();
    }
  });

  /* ---------------- reveal on scroll ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.transition = "opacity .5s ease, transform .5s ease";
          en.target.style.opacity = "1";
          en.target.style.transform = "none";
          io.unobserve(en.target);
        }
      });
    }, { threshold: .16 });
    $$(".step, .card, .feature-list li").forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.transform = "translateY(14px)";
      el.style.transitionDelay = (i % 6) * 45 + "ms";
      io.observe(el);
    });
  }
})();
