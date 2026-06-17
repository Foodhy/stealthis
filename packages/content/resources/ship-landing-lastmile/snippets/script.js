(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 320);
    }, 2800);
  }

  /* ---------- Mobile nav ---------- */
  var hamburger = document.getElementById("hamburger");
  var mobileNav = document.getElementById("mobileNav");
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      var open = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        hamburger.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Smooth scroll for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1200, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  var counted = false;
  var statHost = document.querySelector(".hero-stats");
  if (statHost && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !counted) {
          counted = true;
          document.querySelectorAll("[data-count]").forEach(countUp);
          sio.disconnect();
        }
      });
    }, { threshold: 0.4 });
    sio.observe(statHost);
  }

  /* ---------- Live ETA countdown ---------- */
  var etaMin = document.getElementById("etaMin");
  var etaSec = document.getElementById("etaSec");
  var etaFill = document.getElementById("etaFill");
  var etaPill = document.getElementById("etaPill");
  var etaSteps = document.getElementById("etaSteps");
  var TOTAL = 8 * 60; // 8 minutes baseline
  var remaining = 7 * 60 + 42;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function renderEta() {
    if (etaMin) etaMin.textContent = pad(Math.floor(remaining / 60));
    if (etaSec) etaSec.textContent = pad(remaining % 60);
    var pct = Math.max(0, Math.min(100, (1 - remaining / TOTAL) * 100));
    if (etaFill) etaFill.style.width = pct.toFixed(1) + "%";

    if (etaPill) {
      if (remaining <= 0) { etaPill.textContent = "Delivered"; etaPill.className = "pill pill-ok"; }
      else if (remaining <= 90) { etaPill.textContent = "Almost there"; etaPill.className = "pill pill-lime"; }
      else { etaPill.textContent = "On the move"; etaPill.className = "pill pill-ok"; }
    }

    if (etaSteps) {
      var items = etaSteps.querySelectorAll("li");
      if (remaining <= 0) {
        items.forEach(function (li) { li.className = "done"; });
      } else if (remaining <= 90 && items[3]) {
        items[2].className = "done";
        items[3].className = "active";
      }
    }
  }
  renderEta();
  var etaTimer = setInterval(function () {
    if (remaining > 0) {
      remaining--;
      renderEta();
      if (remaining === 0) {
        toast("Delivered to 221B Maple Ave — enjoy!");
        clearInterval(etaTimer);
      }
    }
  }, 1000);

  /* ---------- Address form ---------- */
  var addrForm = document.getElementById("addrForm");
  var addrInput = document.getElementById("addrInput");
  if (addrForm) {
    addrForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (addrInput && addrInput.value.trim()) || "";
      if (!val) { toast("Add an address so we can route a rider."); addrInput && addrInput.focus(); return; }
      var min = 8 + Math.floor(Math.random() * 9);
      remaining = min * 60 + Math.floor(Math.random() * 60);
      TOTAL = remaining;
      renderEta();
      toast("A rider near " + val + " — ETA " + min + " min.");
    });
  }

  /* ---------- Coverage cities ---------- */
  var cityList = document.getElementById("cityList");
  var covNote = document.getElementById("covNote");
  if (cityList && covNote) {
    cityList.addEventListener("click", function (e) {
      var btn = e.target.closest(".city");
      if (!btn) return;
      cityList.querySelectorAll(".city").forEach(function (c) { c.classList.remove("active"); });
      btn.classList.add("active");
      var city = btn.getAttribute("data-city");
      var min = btn.getAttribute("data-min");
      var riders = btn.getAttribute("data-riders");
      covNote.textContent = city + ": " + riders + " riders online · " + min + " min average drop right now.";
      toast(city + " is live — " + riders + " riders nearby.");
    });
  }

  /* ---------- Rider earnings calculator ---------- */
  var hoursRange = document.getElementById("hoursRange");
  var hoursOut = document.getElementById("hoursOut");
  var earnVal = document.getElementById("earnVal");
  var dropsOut = document.getElementById("dropsOut");
  var earnTier = document.getElementById("earnTier");
  function updateEarn() {
    var h = parseInt(hoursRange.value, 10);
    var dropsPerHour = 4;
    var drops = h * dropsPerHour;
    var pay = Math.round(drops * 7.1);
    if (hoursOut) hoursOut.textContent = h;
    if (earnVal) earnVal.textContent = pay;
    if (dropsOut) dropsOut.textContent = drops;
    if (earnTier) {
      if (h >= 38) { earnTier.textContent = "Top rider"; }
      else if (h >= 22) { earnTier.textContent = "Steady"; }
      else { earnTier.textContent = "Casual"; }
    }
  }
  if (hoursRange) {
    hoursRange.addEventListener("input", updateEarn);
    updateEarn();
  }

  /* ---------- App store + SMS ---------- */
  document.querySelectorAll(".store-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Dasher for " + b.getAttribute("data-store") + " — opening store…");
    });
  });
  var smsForm = document.getElementById("smsForm");
  var smsInput = document.getElementById("smsInput");
  if (smsForm) {
    smsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (smsInput && smsInput.value.trim()) || "";
      if (v.replace(/\D/g, "").length < 7) { toast("Enter a valid phone number."); smsInput && smsInput.focus(); return; }
      toast("Link sent — check your texts!");
      smsForm.reset();
    });
  }
  var psCall = document.querySelector(".ps-call");
  if (psCall) psCall.addEventListener("click", function () { toast("Calling Mara K…"); });

  /* ---------- Phone mini ETA tick ---------- */
  var phEta = document.getElementById("phEta");
  if (phEta) {
    var phR = 6 * 60 + 21;
    setInterval(function () {
      if (phR > 0) { phR--; phEta.textContent = pad(Math.floor(phR / 60)) + ":" + pad(phR % 60); }
    }, 1000);
  }
})();
