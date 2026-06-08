(function () {
  "use strict";

  /* ---------- toast ---------- */
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

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  function closeNav() {
    navLinks.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });

  /* ---------- reveal on scroll ---------- */
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- active nav link ---------- */
  var sections = ["services", "barbers", "heritage", "book"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var linkFor = {};
  navLinks.querySelectorAll('a[href^="#"]:not(.btn)').forEach(function (a) {
    linkFor[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var link = linkFor[e.target.id];
          if (!link) return;
          if (e.isIntersecting) {
            Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- count-up stats ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1300, start = null;
    function fmt(n) { return n.toLocaleString("en-US"); }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- service filters ---------- */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".svc");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-selected", String(on));
      });
      cards.forEach(function (card) {
        var match = f === "all" || card.getAttribute("data-cat") === f;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------- ticket builder ---------- */
  var ticket = [];
  var ticketEl = document.getElementById("ticket");
  var ticketList = document.getElementById("ticketList");
  var ticketTotal = document.getElementById("ticketTotal");

  function renderTicket() {
    if (!ticket.length) {
      ticketEl.hidden = true;
      return;
    }
    ticketEl.hidden = false;
    ticketList.innerHTML = "";
    var total = 0;
    ticket.forEach(function (item, i) {
      total += item.cost;
      var li = document.createElement("li");
      var label = document.createElement("span");
      label.textContent = item.name + " · $" + item.cost;
      var rm = document.createElement("button");
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove " + item.name);
      rm.textContent = "×";
      rm.addEventListener("click", function () {
        ticket.splice(i, 1);
        renderTicket();
      });
      li.appendChild(label);
      li.appendChild(rm);
      ticketList.appendChild(li);
    });
    ticketTotal.textContent = "$" + total;
  }

  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-add");
      var cost = parseInt(btn.getAttribute("data-cost"), 10) || 0;
      if (ticket.some(function (t) { return t.name === name; })) {
        toast(name + " is already on your ticket.");
        return;
      }
      ticket.push({ name: name, cost: cost });
      renderTicket();
      toast("Added " + name + " to your ticket.");
    });
  });

  /* ---------- barber picker ---------- */
  var barberSelect = document.getElementById("fBarber");
  function pickBarber(name, node) {
    document.querySelectorAll(".barber").forEach(function (b) { b.classList.remove("is-picked"); });
    if (node) node.classList.add("is-picked");
    if (barberSelect) {
      var found = Array.prototype.some.call(barberSelect.options, function (o) {
        if (o.value === name || o.text === name) { barberSelect.value = o.value || o.text; return true; }
        return false;
      });
      if (!found) barberSelect.value = name;
    }
    toast(name + " is your barber. Finish booking below.");
  }
  document.querySelectorAll(".barber").forEach(function (b) {
    function act() { pickBarber(b.getAttribute("data-barber"), b); }
    b.addEventListener("click", act);
    b.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); }
    });
  });

  /* ---------- open / closed indicator ---------- */
  var openDot = document.getElementById("openDot");
  var openLabel = document.getElementById("openLabel");
  function updateOpen() {
    var now = new Date();
    var day = now.getDay(); // 0 Sun .. 6 Sat
    var hour = now.getHours() + now.getMinutes() / 60;
    var open = false;
    if (day >= 1 && day <= 5) open = hour >= 9 && hour < 19;
    else if (day === 6) open = hour >= 8 && hour < 17;
    openDot.classList.remove("is-open", "is-closed");
    if (open) {
      openDot.classList.add("is-open");
      openLabel.textContent = "Open now — the pole is spinning";
    } else {
      openDot.classList.add("is-closed");
      openLabel.textContent = day === 0 ? "Closed Sundays — see you Monday" : "Closed now — back during shop hours";
    }
  }
  if (openDot && openLabel) { updateOpen(); setInterval(updateOpen, 60000); }

  /* ---------- date min = today ---------- */
  var dateInput = document.getElementById("fDate");
  if (dateInput) {
    var t = new Date();
    var iso = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    dateInput.min = iso;
  }

  /* ---------- form validation ---------- */
  var form = document.getElementById("bookForm");
  function setError(id, msg) {
    var field = document.getElementById(id).closest(".field");
    var err = form.querySelector('.err[data-for="' + id + '"]');
    field.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
  }
  function validPhone(v) {
    var digits = v.replace(/\D/g, "");
    return digits.length >= 10;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var name = document.getElementById("fName").value.trim();
    var phone = document.getElementById("fPhone").value.trim();
    var date = document.getElementById("fDate").value;

    if (!name) { setError("fName", "Tell us your name."); ok = false; } else setError("fName", "");
    if (!phone) { setError("fPhone", "We need a number to confirm."); ok = false; }
    else if (!validPhone(phone)) { setError("fPhone", "Enter a valid phone number."); ok = false; }
    else setError("fPhone", "");
    if (!date) { setError("fDate", "Pick a date."); ok = false; }
    else if (date < dateInput.min) { setError("fDate", "Choose today or later."); ok = false; }
    else setError("fDate", "");
    setError("fBarber", "");

    if (!ok) {
      toast("Please fix the highlighted fields.");
      var firstErr = form.querySelector(".has-error input, .has-error select");
      if (firstErr) firstErr.focus();
      return;
    }

    var barber = barberSelect.value || "the next available barber";
    var extra = ticket.length ? " (" + ticket.length + " item" + (ticket.length > 1 ? "s" : "") + " on ticket)" : "";
    toast("Booked, " + name + "! " + barber + " on " + date + extra + ". We'll text to confirm.");

    form.reset();
    ticket = [];
    renderTicket();
    document.querySelectorAll(".barber").forEach(function (b) { b.classList.remove("is-picked"); });
    if (dateInput) dateInput.min = iso;
  });

  /* clear field error as user types */
  ["fName", "fPhone", "fDate", "fBarber"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function () { setError(id, ""); });
  });
})();
