(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var region = document.getElementById("toastRegion");
  function toast(msg, kind) {
    if (!region) return;
    var el = document.createElement("div");
    el.className = "toast " + (kind || "");
    el.setAttribute("role", "status");
    el.textContent = msg;
    region.appendChild(el);
    setTimeout(function () {
      el.classList.add("leaving");
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  /* ---------- Mascot wiggle on click / keypress ---------- */
  var mascot = document.getElementById("mascot");
  if (mascot) {
    mascot.setAttribute("tabindex", "0");
    mascot.setAttribute("role", "button");
    mascot.setAttribute("aria-label", "Say hi to Grinny the tooth");
    var cheers = ["Hi there! 🦷", "Brush, brush, hooray! ✨", "You've got a great smile!", "High five! 🖐"];
    function wiggle() {
      mascot.classList.remove("wiggle");
      void mascot.offsetWidth;
      mascot.classList.add("wiggle");
      toast(cheers[Math.floor(Math.random() * cheers.length)], "ok");
    }
    mascot.addEventListener("click", wiggle);
    mascot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); wiggle(); }
    });
  }

  /* ---------- Count-up stats ---------- */
  var stats = document.querySelectorAll(".stat-num");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1300, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val >= 1000 ? val.toLocaleString("en-US") : String(val);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    var seen = new WeakSet();
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !seen.has(en.target)) {
          seen.add(en.target);
          animateCount(en.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function (s) { statObs.observe(s); });
  } else {
    stats.forEach(animateCount);
  }

  /* ---------- Care-by-age tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  var cards = document.querySelectorAll(".care-card");
  function selectGroup(group) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-group") === group;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    cards.forEach(function (c) {
      var show = c.getAttribute("data-group") === group;
      c.classList.toggle("is-hidden", !show);
      if (show) { c.style.animation = "none"; void c.offsetWidth; c.style.animation = ""; }
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectGroup(t.getAttribute("data-group")); });
    t.addEventListener("keydown", function (e) {
      var idx = null;
      if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
      if (idx !== null) {
        e.preventDefault();
        tabs[idx].focus();
        selectGroup(tabs[idx].getAttribute("data-group"));
      }
    });
  });

  /* ---------- FAQ accordion (single-open) ---------- */
  var qs = document.querySelectorAll(".faq-q");
  qs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      qs.forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        var p = document.getElementById(other.getAttribute("aria-controls"));
        if (p) p.hidden = true;
      });
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.hidden = false;
      }
    });
  });

  /* ---------- Testimonials rotator ---------- */
  var reviews = [
    { q: "My daughter used to cry at the dentist. Now she counts down the days. The staff are pure magic.", name: "Maya R.", role: "Parent of 2", initials: "MR" },
    { q: "The first-visit walkthrough calmed my nerves more than my son's! We left with a sticker and a plan.", name: "Daniel O.", role: "Dad of a toddler", initials: "DO" },
    { q: "Gentle, patient, and genuinely fun. My twins actually argue over who gets to go first.", name: "Priya S.", role: "Parent of twins", initials: "PS" },
    { q: "They explained everything at my daughter's level. No fear, no fuss — just a happy kiddo.", name: "Leah T.", role: "First-time parent", initials: "LT" }
  ];
  var qEl = document.getElementById("testiQuote");
  var nameEl = document.getElementById("testiName");
  var roleEl = document.getElementById("testiRole");
  var avaEl = document.getElementById("testiAvatar");
  var dotsWrap = document.getElementById("testiDots");
  var current = 0, timer = null;

  function renderReview(i) {
    current = i;
    var r = reviews[i];
    qEl.style.opacity = "0";
    setTimeout(function () {
      qEl.textContent = '"' + r.q + '"';
      nameEl.textContent = r.name;
      roleEl.textContent = r.role;
      avaEl.textContent = r.initials;
      qEl.style.opacity = "1";
    }, 180);
    if (dotsWrap) {
      Array.prototype.forEach.call(dotsWrap.children, function (d, di) {
        d.classList.toggle("is-active", di === i);
        d.setAttribute("aria-selected", di === i ? "true" : "false");
      });
    }
  }
  if (qEl && dotsWrap) {
    qEl.style.transition = "opacity .18s ease";
    reviews.forEach(function (r, i) {
      var b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Review from " + r.name);
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", function () { renderReview(i); restart(); });
      dotsWrap.appendChild(b);
    });
    function next() { renderReview((current + 1) % reviews.length); }
    function restart() { clearInterval(timer); timer = setInterval(next, 5000); }
    restart();
  }

  /* ---------- Booking form ---------- */
  var form = document.getElementById("bookForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll("input[required], select[required]");
      var firstBad = null;
      fields.forEach(function (f) {
        var bad = !f.value || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.classList.toggle("invalid", bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        firstBad.focus();
        toast("Please fill in the highlighted fields.", "err");
        return;
      }
      var name = form.querySelector("#parent").value.trim().split(" ")[0] || "there";
      form.reset();
      toast("Thanks, " + name + "! We'll confirm your visit within 1 business day. 🦷", "ok");
    });
    form.querySelectorAll("input, select").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("invalid"); });
      f.addEventListener("change", function () { f.classList.remove("invalid"); });
    });
  }

  /* ---------- Sticky book bar (show after hero) ---------- */
  var bar = document.getElementById("stickyBar");
  var hero = document.getElementById("hero");
  if (bar && hero && "IntersectionObserver" in window) {
    var barObs = new IntersectionObserver(function (entries) {
      bar.classList.toggle("show", !entries[0].isIntersecting);
    }, { threshold: 0 });
    barObs.observe(hero);
  } else if (bar) {
    window.addEventListener("scroll", function () {
      bar.classList.toggle("show", window.scrollY > 480);
    }, { passive: true });
  }
})();
