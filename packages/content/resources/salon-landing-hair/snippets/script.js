/* ============================================================
   Maison Lumière — landing interactions (vanilla JS)
   - mobile nav + sticky shadow
   - reveal-on-scroll
   - animated stat counter
   - service "plan" builder with live total
   - before/after slider (pointer + range)
   - testimonial carousel
   - live open/closed status
   - booking form validation + toast
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2800);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobile() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
  }
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMobile);
    });
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + (p === 1 ? "+" : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (parseInt(el.getAttribute("data-count"), 10) || 0).toLocaleString("en-US") + "+";
    });
  }

  /* ---------- Service plan builder ---------- */
  var plan = []; // { name, price }
  var planSummary = document.getElementById("planSummary");
  var planList = document.getElementById("planList");
  var planTotal = document.getElementById("planTotal");

  function renderPlan() {
    if (!planList) return;
    if (plan.length === 0) {
      if (planSummary) planSummary.hidden = true;
      return;
    }
    if (planSummary) planSummary.hidden = false;
    planList.innerHTML = "";
    var total = 0;
    plan.forEach(function (item, idx) {
      total += item.price;
      var li = document.createElement("li");
      var label = document.createElement("span");
      label.textContent = item.name + " · from $" + item.price;
      var rm = document.createElement("button");
      rm.type = "button";
      rm.textContent = "remove";
      rm.setAttribute("aria-label", "Remove " + item.name + " from plan");
      rm.addEventListener("click", function () {
        plan.splice(idx, 1);
        // reset matching service button
        cards.forEach(function (c) {
          if (c.getAttribute("data-name") === item.name) resetCardBtn(c);
        });
        renderPlan();
      });
      li.appendChild(label);
      li.appendChild(rm);
      planList.appendChild(li);
    });
    if (planTotal) planTotal.textContent = "$" + total.toLocaleString("en-US");
  }

  function resetCardBtn(card) {
    var btn = card.querySelector(".svc__add");
    if (btn) {
      btn.classList.remove("is-added");
      btn.textContent = "Add to plan";
    }
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll(".svc"));
  cards.forEach(function (card) {
    var btn = card.querySelector(".svc__add");
    if (!btn) return;
    var name = card.getAttribute("data-name");
    var price = parseInt(card.getAttribute("data-price"), 10) || 0;
    btn.addEventListener("click", function () {
      var existing = plan.findIndex(function (p) { return p.name === name; });
      if (existing > -1) {
        plan.splice(existing, 1);
        resetCardBtn(card);
        toast(name + " removed from your plan");
      } else {
        plan.push({ name: name, price: price });
        btn.classList.add("is-added");
        btn.textContent = "Added ✓";
        toast(name + " added — from $" + price);
        // preselect in booking dropdown if it's the only one
        var sel = document.getElementById("bService");
        if (sel && !sel.value) {
          for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].textContent.replace(/&amp;/g, "&").trim() === name) {
              sel.selectedIndex = i;
              break;
            }
          }
        }
      }
      renderPlan();
    });
  });

  /* ---------- Stylist quick-book ---------- */
  document.querySelectorAll("[data-stylist]").forEach(function (b) {
    b.addEventListener("click", function () {
      var who = b.getAttribute("data-stylist");
      var sel = document.getElementById("bStylist");
      if (sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text === who) { sel.selectedIndex = i; break; }
        }
      }
      toast("Booking with " + who + " — fill in your details");
      var book = document.getElementById("book");
      if (book) book.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Before / After slider ---------- */
  var baRange = document.getElementById("baRange");
  var baBefore = document.getElementById("baBefore");
  var baHandle = document.getElementById("baHandle");
  function setBA(val) {
    var v = Math.max(0, Math.min(100, val));
    if (baBefore) baBefore.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    if (baHandle) baHandle.style.left = v + "%";
  }
  if (baRange) {
    baRange.addEventListener("input", function () { setBA(parseFloat(baRange.value)); });
    setBA(parseFloat(baRange.value));
  }

  /* ---------- Testimonials carousel ---------- */
  var quotes = document.querySelectorAll("#quotes .quote");
  var dots = document.querySelectorAll("#quoteDots button");
  var qIndex = 0;
  var qTimer;
  function showQuote(i) {
    qIndex = (i + quotes.length) % quotes.length;
    quotes.forEach(function (q, n) { q.classList.toggle("is-active", n === qIndex); });
    dots.forEach(function (d, n) {
      d.classList.toggle("is-active", n === qIndex);
      d.setAttribute("aria-selected", String(n === qIndex));
    });
  }
  function startQuotes() {
    clearInterval(qTimer);
    qTimer = setInterval(function () { showQuote(qIndex + 1); }, 5500);
  }
  dots.forEach(function (d, n) {
    d.addEventListener("click", function () { showQuote(n); startQuotes(); });
  });
  if (quotes.length) { showQuote(0); startQuotes(); }

  /* ---------- Live open / closed status ---------- */
  // Tue–Thu 10–19, Fri 9–20, Sat 9–18, Sun/Mon closed. Day: 0=Sun..6=Sat
  var SCHEDULE = {
    0: null, 1: null,
    2: [10, 19], 3: [10, 19], 4: [10, 19],
    5: [9, 20], 6: [9, 18]
  };
  function updateStatus() {
    var el = document.getElementById("openStatus");
    if (!el) return;
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours() + now.getMinutes() / 60;
    var hrs = SCHEDULE[day];
    el.classList.remove("is-open", "is-closed");
    if (hrs && hour >= hrs[0] && hour < hrs[1]) {
      el.classList.add("is-open");
      el.textContent = "Open now · closes at " + hrs[1] + ":00";
    } else {
      el.classList.add("is-closed");
      // find next opening
      for (var add = 0; add < 8; add++) {
        var d = (day + add) % 7;
        var h = SCHEDULE[d];
        if (h && !(add === 0 && hour < h[0] ? false : add === 0)) {
          if (add === 0 && hour < h[0]) {
            el.textContent = "Closed · opens today at " + h[0] + ":00";
            return;
          }
          if (add > 0) {
            var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var label = add === 1 ? "tomorrow" : names[d];
            el.textContent = "Closed · opens " + label + " at " + h[0] + ":00";
            return;
          }
        }
      }
      el.textContent = "Closed · see hours above";
    }
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Booking form ---------- */
  var form = document.getElementById("book");
  var dateInput = document.getElementById("bDate");
  if (dateInput) {
    var today = new Date();
    dateInput.min = today.toISOString().split("T")[0];
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var required = form.querySelectorAll("[required]");
      var firstBad = null;
      required.forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle("is-invalid", bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        firstBad.focus();
        toast("Please complete the highlighted fields");
        return;
      }
      var name = form.querySelector("#bName").value.trim().split(" ")[0];
      var service = form.querySelector("#bService").value.replace(/&amp;/g, "&");
      var date = form.querySelector("#bDate").value;
      var time = form.querySelector("#bTime").value;
      toast("Thank you, " + name + " — your " + service + " request for " + date + " at " + time + " is in. We will text to confirm.");
      form.reset();
      plan = [];
      cards.forEach(resetCardBtn);
      renderPlan();
      if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
    });
    form.querySelectorAll("input, select").forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("is-invalid"); });
      f.addEventListener("change", function () { f.classList.remove("is-invalid"); });
    });
  }

  /* ---------- Footer social stubs ---------- */
  document.querySelectorAll("[data-soc]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Follow @maisonlumiere — link coming soon");
    });
  });
})();
