(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3400);
  }

  /* ---------- Gallery data ---------- */
  var PHOTOS = [
    { id: "1519741497674-611481863552", cat: "ceremony", cap: "The first look", cls: "wide" },
    { id: "1465495976277-4387d4b0b4c6", cat: "detail", cap: "Rings & vows", cls: "" },
    { id: "1511285560929-80b456fea0bc", cat: "portrait", cap: "Golden hour", cls: "tall" },
    { id: "1520854221256-17451cc331bf", cat: "ceremony", cap: "The aisle", cls: "" },
    { id: "1519225421980-715cb0215aed", cat: "portrait", cap: "Just married", cls: "" },
    { id: "1522673607200-164d1b6ce486", cat: "detail", cap: "Bouquet", cls: "" },
    { id: "1583939003579-730e3918a45a", cat: "portrait", cap: "Quiet moment", cls: "wide" },
    { id: "1606216794074-735e91aa2c92", cat: "detail", cap: "The dress", cls: "tall" },
    { id: "1519657337289-077653f724ed", cat: "ceremony", cap: "Confetti", cls: "" },
    { id: "1537633552985-df8429e8048b", cat: "portrait", cap: "Reception", cls: "" }
  ];

  var grid = document.getElementById("grid");
  var frag = document.createDocumentFragment();

  PHOTOS.forEach(function (p, i) {
    var btn = document.createElement("button");
    btn.className = "frame " + p.cls;
    btn.type = "button";
    btn.dataset.cat = p.cat;
    btn.dataset.cap = p.cap;
    btn.dataset.index = i;
    btn.setAttribute("aria-label", "Open image: " + p.cap);
    var img = document.createElement("img");
    img.loading = "lazy";
    img.alt = p.cap;
    img.src = "https://images.unsplash.com/photo-" + p.id + "?auto=format&fit=crop&w=900&q=65";
    btn.appendChild(img);
    frag.appendChild(btn);
  });
  grid.appendChild(frag);

  /* ---------- Filters ---------- */
  var chips = document.querySelectorAll(".chip");
  var frames = Array.prototype.slice.call(grid.querySelectorAll(".frame"));

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var f = chip.dataset.filter;
      frames.forEach(function (frame) {
        var show = f === "all" || frame.dataset.cat === f;
        frame.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var current = 0;
  var lastFocus = null;

  function visibleFrames() {
    return frames.filter(function (f) { return !f.classList.contains("is-hidden"); });
  }

  function openLightbox(frame) {
    var vis = visibleFrames();
    current = vis.indexOf(frame);
    lastFocus = frame;
    renderLightbox(vis);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function renderLightbox(vis) {
    var frame = vis[current];
    if (!frame) return;
    var src = frame.querySelector("img").src.replace("w=900", "w=1500");
    lbImg.src = src;
    lbImg.alt = frame.dataset.cap;
    lbCap.textContent = frame.dataset.cap + " · " + (current + 1) + " / " + vis.length;
  }

  function step(dir) {
    var vis = visibleFrames();
    current = (current + dir + vis.length) % vis.length;
    renderLightbox(vis);
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener("click", function (e) {
    var frame = e.target.closest(".frame");
    if (frame) openLightbox(frame);
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* Touch swipe on lightbox */
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  /* ---------- Testimonials ---------- */
  var QUOTES = [
    {
      text: "They melted into the day like guests, not photographers. Every frame feels like a memory we forgot we had.",
      name: "Priya & Daniel",
      meta: "Married in Ravello",
      av: "1544005313-94ddf0286df2"
    },
    {
      text: "We cried looking at the gallery. Amara and Wren caught the exact second my dad saw me in the dress.",
      name: "Sofia & Marcus",
      meta: "Married in Kyoto",
      av: "1438761681033-6461ffad8d80"
    },
    {
      text: "Calm, kind, and impossibly talented. Our families still talk about how easy the whole day felt.",
      name: "Elena & Theo",
      meta: "Married in Provence",
      av: "1500648767791-00dcc994a43e"
    }
  ];

  var quotesEl = document.getElementById("quotes");
  var dotsEl = document.getElementById("dots");
  var qIndex = 0;
  var qTimer;

  QUOTES.forEach(function (q, i) {
    var fig = document.createElement("figure");
    fig.className = "quote" + (i === 0 ? " is-active" : "");
    fig.innerHTML =
      '<blockquote>&ldquo;' + q.text + '&rdquo;</blockquote>' +
      '<div class="quote-by">' +
      '<img loading="lazy" alt="" src="https://images.unsplash.com/photo-' + q.av + '?auto=format&fit=crop&w=120&q=70" />' +
      '<cite><strong>' + q.name + '</strong> · ' + q.meta + '</cite>' +
      '</div>';
    quotesEl.appendChild(fig);

    var dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " is-active" : "");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Testimonial " + (i + 1));
    dot.addEventListener("click", function () { goQuote(i); resetAuto(); });
    dotsEl.appendChild(dot);
  });

  var quoteEls = quotesEl.querySelectorAll(".quote");
  var dotEls = dotsEl.querySelectorAll(".dot");

  function goQuote(i) {
    qIndex = i;
    quoteEls.forEach(function (el, k) { el.classList.toggle("is-active", k === i); });
    dotEls.forEach(function (el, k) { el.classList.toggle("is-active", k === i); });
  }
  function resetAuto() {
    clearInterval(qTimer);
    qTimer = setInterval(function () { goQuote((qIndex + 1) % QUOTES.length); }, 5500);
  }
  resetAuto();

  var wordsSec = document.getElementById("words");
  wordsSec.addEventListener("mouseenter", function () { clearInterval(qTimer); });
  wordsSec.addEventListener("mouseleave", resetAuto);

  /* ---------- Package buttons ---------- */
  document.querySelectorAll(".pkg-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("“" + b.dataset.pkg + "” selected — scroll down to send your inquiry.");
      var f = document.getElementById("inquire");
      f.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Hero counters ---------- */
  var counters = document.querySelectorAll(".hero-stats strong");
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1400, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + "+";
      }
      requestAnimationFrame(tick);
    });
  }
  setTimeout(runCounters, 400);

  /* ---------- Hero parallax ---------- */
  var heroImg = document.getElementById("heroImg");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && heroImg) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = "translateY(" + (y * 0.18) + "px)";
      }
    }, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(".sec-head, .pkg, .frame, .inquire-form, .assure");
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Inquiry form validation ---------- */
  var form = document.getElementById("inquireForm");
  var errs = {};
  form.querySelectorAll(".err").forEach(function (e) { errs[e.dataset.for] = e; });

  function setErr(name, msg) {
    var input = form.elements[name];
    if (errs[name]) errs[name].textContent = msg || "";
    if (input) input.classList.toggle("invalid", !!msg);
    return !msg;
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    var ok = true;
    var v = form.elements;

    ok = setErr("names", v.names.value.trim().length >= 2 ? "" : "Please share your names.") && ok;
    ok = setErr("email", emailRe.test(v.email.value.trim()) ? "" : "Enter a valid email address.") && ok;

    var dateVal = v.date.value;
    if (!dateVal) {
      ok = setErr("date", "Pick your wedding date.") && ok;
    } else if (new Date(dateVal) < new Date(new Date().toDateString())) {
      ok = setErr("date", "Please choose a future date.") && ok;
    } else {
      setErr("date", "");
    }

    var g = parseInt(v.guests.value, 10);
    ok = setErr("guests", (g >= 2 && g <= 600) ? "" : "Guests must be between 2 and 600.") && ok;

    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix the highlighted fields.");
      var firstBad = form.querySelector(".invalid");
      if (firstBad) firstBad.focus();
      return;
    }
    var names = form.elements.names.value.trim();
    var date = new Date(form.elements.date.value).toLocaleDateString(undefined, {
      month: "long", day: "numeric", year: "numeric"
    });
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Checking availability…";
    setTimeout(function () {
      btn.disabled = false;
      btn.textContent = "Send inquiry";
      form.reset();
      toast("Thank you, " + names + "! We're available on " + date + " — check your inbox within 24h.");
    }, 1100);
  });

  /* Clear error as the user types */
  form.addEventListener("input", function (e) {
    if (e.target.name && errs[e.target.name] && e.target.classList.contains("invalid")) {
      setErr(e.target.name, "");
    }
  });
})();
