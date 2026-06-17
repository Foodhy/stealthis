(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="t-ico">✓</span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 280);
    }, 2800);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---------- Count-up animations ---------- */
  function animateCount(el, target, opts) {
    opts = opts || {};
    var dur = 1100;
    var start = null;
    var isMoney = opts.money;
    function fmt(v) {
      if (isMoney) {
        return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return Math.round(v).toLocaleString("en-US");
    }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (isMoney ? "$" : "") + fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (isMoney ? "$" : "") + fmt(target);
    }
    requestAnimationFrame(step);
  }

  var counted = false;
  function runCounts() {
    if (counted) return;
    counted = true;
    var bal = document.querySelector(".mock-bal");
    if (bal) animateCount(bal, parseFloat(bal.dataset.count), { money: true });
    document.querySelectorAll(".s-num").forEach(function (el) {
      animateCount(el, parseFloat(el.dataset.count));
    });
  }
  // kick counts when hero / stats enter view (or immediately as fallback)
  if ("IntersectionObserver" in window) {
    var balEl = document.querySelector(".mock-bal");
    var statsEl = document.querySelector(".story-stats");
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (en.target === balEl) {
            animateCount(balEl, parseFloat(balEl.dataset.count), { money: true });
          } else {
            en.target.querySelectorAll(".s-num").forEach(function (el) {
              animateCount(el, parseFloat(el.dataset.count));
            });
          }
          co.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    if (balEl) co.observe(balEl);
    if (statsEl) co.observe(statsEl);
  } else {
    runCounts();
  }

  /* ---------- Pricing toggle ---------- */
  var btMonthly = document.getElementById("btMonthly");
  var btYearly = document.getElementById("btYearly");
  var nums = document.querySelectorAll(".p-num");
  var periods = document.querySelectorAll(".p-per");
  var mode = "monthly";

  function setPricing(next) {
    if (next === mode) return;
    mode = next;
    var yearly = mode === "yearly";
    btMonthly.classList.toggle("is-active", !yearly);
    btYearly.classList.toggle("is-active", yearly);
    btMonthly.setAttribute("aria-pressed", String(!yearly));
    btYearly.setAttribute("aria-pressed", String(yearly));
    nums.forEach(function (n) {
      var val = yearly ? n.dataset.yearly : n.dataset.monthly;
      n.textContent = val;
    });
    periods.forEach(function (p) { p.textContent = yearly ? "/mo billed yearly" : "/mo"; });
    toast(yearly ? "Yearly billing applied — you save 20%" : "Switched to monthly billing");
  }
  if (btMonthly && btYearly) {
    btMonthly.addEventListener("click", function () { setPricing("monthly"); });
    btYearly.addEventListener("click", function () { setPricing("yearly"); });
  }

  /* ---------- CTA email form ---------- */
  var ctaForm = document.getElementById("ctaForm");
  var ctaEmail = document.getElementById("ctaEmail");
  if (ctaForm) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = ctaEmail.value.trim();
      if (!re.test(v)) {
        ctaEmail.classList.add("invalid");
        ctaEmail.focus();
        toast("Enter a valid work email to continue");
        return;
      }
      ctaEmail.classList.remove("invalid");
      var company = v.split("@")[1].split(".")[0];
      toast("Application started for " + company + " — check your inbox");
      ctaEmail.value = "";
    });
    ctaEmail.addEventListener("input", function () { ctaEmail.classList.remove("invalid"); });
  }

  /* ---------- Logo + chip nudges ---------- */
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () { toast(c.textContent.trim() + " integration is ready to connect"); });
  });
})();
