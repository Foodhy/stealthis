(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2400);
  }

  /* ---------- Billing toggle ---------- */
  var toggle = document.getElementById("billingToggle");
  var labels = document.querySelectorAll(".billing__label");
  var amounts = document.querySelectorAll(".plan__amount");
  var notes = document.querySelectorAll("[data-note]");
  var annual = true; // page loads on annual to surface the saving

  function fmt(n) {
    return Number(n).toLocaleString("en-US");
  }

  function animateValue(el, to) {
    var from = parseInt(el.textContent.replace(/[^0-9]/g, ""), 10) || 0;
    if (from === to) { el.textContent = fmt(to); return; }
    var start = performance.now();
    var dur = 380;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(from + (to - from) * eased);
      el.textContent = fmt(val);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function applyBilling() {
    toggle.setAttribute("aria-checked", String(annual));
    toggle.setAttribute(
      "aria-label",
      annual ? "Switch to monthly billing" : "Switch to annual billing"
    );
    labels.forEach(function (l) {
      var on = l.getAttribute("data-period") === (annual ? "annual" : "monthly");
      l.classList.toggle("is-active", on);
    });
    amounts.forEach(function (a) {
      var to = parseInt(a.getAttribute(annual ? "data-annual" : "data-monthly"), 10);
      animateValue(a, to);
    });
    notes.forEach(function (n) {
      var keep = n.textContent.indexOf("Pay as") === 0 || n.textContent.indexOf("From") === 0;
      if (keep) return;
      n.textContent = annual ? "Billed annually" : "Billed monthly";
    });
  }

  toggle.addEventListener("click", function () {
    annual = !annual;
    applyBilling();
    toast(annual ? "Annual billing — saving 20%" : "Switched to monthly billing");
  });
  applyBilling();

  /* ---------- Plan CTAs ---------- */
  document.querySelectorAll("[data-buy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-buy");
      var period = annual ? "annual" : "monthly";
      if (plan === "Team Studio" || plan === "Day Pass") {
        toast(
          plan === "Day Pass"
            ? "Day pass reserved — see you at the front desk!"
            : "Team Studio enquiry sent — we'll be in touch."
        );
      } else {
        toast(plan + " selected · " + period + " billing");
      }
    });
  });

  /* ---------- Compare column highlight ---------- */
  var table = document.querySelector(".ctable");
  function setHighlight(col) {
    table.querySelectorAll("[data-col]").forEach(function (cell) {
      cell.classList.toggle("is-hl", cell.getAttribute("data-col") === col);
    });
  }
  function clearHighlight() {
    table.querySelectorAll(".is-hl").forEach(function (c) {
      c.classList.remove("is-hl");
    });
  }
  var pinned = null;
  table.querySelectorAll("thead th[data-col]").forEach(function (th) {
    var col = th.getAttribute("data-col");
    th.addEventListener("mouseenter", function () {
      if (!pinned) setHighlight(col);
    });
    th.addEventListener("mouseleave", function () {
      if (!pinned) clearHighlight();
    });
    var btn = th.querySelector(".colbtn");
    if (btn) {
      btn.addEventListener("click", function () {
        if (pinned === col) {
          pinned = null;
          clearHighlight();
          toast("Highlight cleared");
        } else {
          pinned = col;
          setHighlight(col);
          toast("Highlighting " + btn.textContent.trim());
        }
      });
    }
  });

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    q.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      // close others
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
          other.querySelector(".faq__a").style.maxHeight = null;
        }
      });
      if (open) {
        item.classList.remove("is-open");
        q.setAttribute("aria-expanded", "false");
        a.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Tour / call buttons ---------- */
  ["tourBtn", "ctaTour"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function () {
      toast("Tour request sent — pick a time from the email we just mailed.");
    });
  });
  var call = document.getElementById("ctaCall");
  if (call) call.addEventListener("click", function () {
    toast("We'll call you back within one business day.");
  });
})();
