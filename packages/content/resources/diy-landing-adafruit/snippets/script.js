/* SOLDERBOX — electronics shop & learn landing. Vanilla JS only. */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── toast helper ─────────────────────────────────────────────── */
  var toastHost = $("#toasts");
  function toast(msg, accent) {
    if (!toastHost) return;
    var el = document.createElement("div");
    el.className = "toast";
    if (accent) el.style.borderLeftColor = accent;
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 280);
    }, 2600);
  }

  /* ── announcement rotator ─────────────────────────────────────── */
  var ANN = [
    "Free shipping on solder-shaped orders over $59 — continental orders only.",
    "Tuesday restock lands 11:00 ET. Bins are full, coffee is not.",
    "Every kit ships with a printed guide and a spare of the part you'll lose.",
    "Bench Hours EP 214 streams Thursday 20:00 ET — bring bad wiring photos."
  ];
  var annEl = $("#annMsg"), annIdx = 0, annTimer;
  function showAnn(i) {
    annIdx = (i + ANN.length) % ANN.length;
    annEl.classList.add("is-fade");
    setTimeout(function () {
      annEl.textContent = ANN[annIdx];
      annEl.classList.remove("is-fade");
    }, 240);
  }
  function autoAnn() {
    clearInterval(annTimer);
    annTimer = setInterval(function () { showAnn(annIdx + 1); }, 5200);
  }
  $$("[data-ann]").forEach(function (b) {
    b.addEventListener("click", function () {
      showAnn(annIdx + parseInt(b.dataset.ann, 10));
      autoAnn();
    });
  });
  autoAnn();

  /* ── sticky header shadow ─────────────────────────────────────── */
  var hdr = $("#hdr");
  window.addEventListener("scroll", function () {
    hdr.classList.toggle("is-stuck", window.scrollY > 12);
  }, { passive: true });

  /* ── cart ─────────────────────────────────────────────────────── */
  var count = 2;
  var countEl = $("#cartCount");
  function addToCart(name) {
    count += 1;
    countEl.textContent = String(count);
    countEl.classList.remove("is-bump");
    void countEl.offsetWidth;
    countEl.classList.add("is-bump");
    $("#cartBtn").setAttribute("aria-label", "Cart, " + count + " items");
    toast("Added " + name + " to cart", "#2b8cff");
  }
  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add); return; }
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.dataset.toast, "#ff3d81");
  });

  /* ── search ───────────────────────────────────────────────────── */
  $("#searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = $("#q").value.trim();
    toast(q ? 'Searching parts & guides for "' + q + '"…' : "Type a part number or a topic to search.");
  });

  /* ── product rail scrolling ───────────────────────────────────── */
  var rail = $("#rail");
  $$("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var card = rail.querySelector(".pcard");
      var step = card ? card.getBoundingClientRect().width + 16 : 240;
      rail.scrollBy({ left: step * 2 * parseInt(b.dataset.scroll, 10), behavior: "smooth" });
    });
  });
  rail.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { rail.scrollBy({ left: 240, behavior: "smooth" }); e.preventDefault(); }
    if (e.key === "ArrowLeft") { rail.scrollBy({ left: -240, behavior: "smooth" }); e.preventDefault(); }
  });

  /* ── countdown to next Thursday 20:00 local ───────────────────── */
  var pad = function (n) { return n < 10 ? "0" + n : String(n); };
  function nextThursday() {
    var d = new Date();
    d.setHours(20, 0, 0, 0);
    var delta = (4 - d.getDay() + 7) % 7; // 4 = Thursday
    if (delta === 0 && Date.now() > d.getTime()) delta = 7;
    d.setDate(d.getDate() + delta);
    return d;
  }
  var target = nextThursday();
  function tick() {
    var ms = target - Date.now();
    if (ms <= 0) { target = nextThursday(); ms = target - Date.now(); }
    var s = Math.floor(ms / 1000);
    $("#cd").textContent = pad(Math.floor(s / 86400));
    $("#ch").textContent = pad(Math.floor(s / 3600) % 24);
    $("#cm").textContent = pad(Math.floor(s / 60) % 60);
    $("#cs").textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  var notify = $("#notifyBtn");
  notify.addEventListener("click", function () {
    var on = notify.classList.toggle("is-on");
    notify.textContent = on ? "Reminder set ✓" : "Notify me";
    toast(on ? "We'll ping you 15 minutes before EP 214." : "Reminder removed.", on ? "#b8ff3d" : "#ff3d81");
  });

  /* ── newsletter ───────────────────────────────────────────────── */
  var newsForm = $("#newsForm"), email = $("#email"), newsErr = $("#newsErr");
  newsForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    newsErr.hidden = ok;
    email.classList.toggle("is-bad", !ok);
    if (!ok) { email.focus(); return; }
    toast("Subscribed — first Tuesday Bin lands next week.", "#b8ff3d");
    newsForm.reset();
  });
  email.addEventListener("input", function () {
    if (!newsErr.hidden) { newsErr.hidden = true; email.classList.remove("is-bad"); }
  });

  /* ── learn filters ────────────────────────────────────────────── */
  var guides = $$(".guide"), empty = $("#guidesEmpty");
  $$(".fbtn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".fbtn").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      var track = btn.dataset.track, shown = 0;
      guides.forEach(function (g) {
        var hit = track === "all" || g.dataset.track === track;
        g.classList.toggle("is-hidden", !hit);
        if (hit) shown++;
      });
      empty.hidden = shown > 0;
      toast(shown + (shown === 1 ? " guide" : " guides") + " in " + btn.textContent.trim());
    });
  });

  /* ── quick view modal ─────────────────────────────────────────── */
  var modal = $("#modal"), mUse = $("#mUse"), lastFocus = null, current = "";
  function openModal(card) {
    lastFocus = document.activeElement;
    current = card.dataset.name;
    $("#mTitle").textContent = current;
    $("#mSku").textContent = card.dataset.sku;
    $("#mPrice").textContent = card.dataset.price;
    var href = card.querySelector("use").getAttribute("href");
    mUse.setAttribute("href", href);
    var dl = $("#mSpecs");
    dl.innerHTML = "";
    card.dataset.specs.split(";").forEach(function (pair) {
      var kv = pair.split("|");
      var dt = document.createElement("dt"); dt.textContent = kv[0];
      var dd = document.createElement("dd"); dd.textContent = kv[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal__x").focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var q = e.target.closest("[data-quick]");
    if (q) { openModal(q.closest(".pcard")); return; }
    if (e.target.closest("[data-close]")) closeModal();
  });
  $("#mAdd").addEventListener("click", function () { addToCart(current); closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
    if (e.key === "Tab" && !modal.hidden) {
      var f = $$('button, [href], input', $(".modal__box"));
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  /* ── scroll reveal ────────────────────────────────────────────── */
  var targets = $$(".pcard, .guide, .show, .news, .hero__stats li");
  if ("IntersectionObserver" in window) {
    targets.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add("is-in"); }, (i % 6) * 55);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
