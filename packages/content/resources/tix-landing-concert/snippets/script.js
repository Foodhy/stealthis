(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Apply data-hue gradients (attr() fallback) ---------- */
  document.querySelectorAll("[data-hue]").forEach(function (el) {
    el.style.setProperty("--hue", el.getAttribute("data-hue"));
    el.style.setProperty("--h", el.getAttribute("data-hue"));
  });

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Countdown to opening night ---------- */
  var target = new Date("2026-08-14T20:00:00").getTime();
  var cdFields = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    mins: document.querySelector('[data-cd="mins"]'),
    secs: document.querySelector('[data-cd="secs"]'),
  };
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tickCountdown() {
    var diff = target - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    if (cdFields.days) cdFields.days.textContent = pad(d);
    if (cdFields.hours) cdFields.hours.textContent = pad(h);
    if (cdFields.mins) cdFields.mins.textContent = pad(m);
    if (cdFields.secs) cdFields.secs.textContent = pad(s);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- Date filters ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var dateItems = document.querySelectorAll("#datesList .date");
  var emptyMsg = document.getElementById("datesEmpty");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("chip--on"); });
      chip.classList.add("chip--on");
      var f = chip.getAttribute("data-filter");
      var shown = 0;
      dateItems.forEach(function (item) {
        var match = f === "all" || item.getAttribute("data-status") === f;
        item.style.display = match ? "" : "none";
        if (match) shown++;
      });
      if (emptyMsg) emptyMsg.hidden = shown !== 0;
    });
  });

  /* ---------- Waitlist buttons ---------- */
  document.querySelectorAll("[data-waitlist]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var city = btn.getAttribute("data-waitlist");
      btn.textContent = "On waitlist";
      btn.disabled = true;
      btn.style.opacity = ".7";
      toast("You're on the " + city + " waitlist — we'll ping you if seats open.");
    });
  });

  /* ---------- Cart ---------- */
  var cart = {};
  var cartBar = document.getElementById("cartBar");
  var cartText = document.getElementById("cartText");
  var cartTotal = document.getElementById("cartTotal");
  function renderCart() {
    var count = 0, total = 0;
    Object.keys(cart).forEach(function (k) {
      count += cart[k].qty;
      total += cart[k].qty * cart[k].amt;
    });
    if (count === 0) {
      if (cartBar) cartBar.hidden = true;
      return;
    }
    if (cartBar) cartBar.hidden = false;
    if (cartText) cartText.textContent = count + (count === 1 ? " ticket" : " tickets");
    if (cartTotal) cartTotal.textContent = "$" + total;
  }
  document.querySelectorAll("[data-buy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-buy");
      var amt = parseInt(btn.getAttribute("data-amt"), 10) || 0;
      var current = cart[name] ? cart[name].qty : 0;
      if (current >= 4) {
        toast("4 ticket limit reached for " + name + ".");
        return;
      }
      cart[name] = { qty: current + 1, amt: amt };
      renderCart();
      toast("Added " + name + " ($" + amt + ") — " + (current + 1) + " in cart.");
    });
  });
  var checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      toast("Checkout is illustrative only — no real tickets are sold here.");
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
