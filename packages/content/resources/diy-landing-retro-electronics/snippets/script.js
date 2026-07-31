(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- toast ---------------- */
  var host = document.getElementById("toastHost");
  function toast(msg) {
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    host.appendChild(el);
    window.setTimeout(function () {
      el.classList.add("out");
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, 3600);
  }

  /* ---------------- CRT boot typing ---------------- */
  var screenEl = document.getElementById("screen");
  var bootEl = document.getElementById("boot");
  var lamp = document.getElementById("lamp");
  var powerBtn = document.getElementById("power");

  var BOOT = [
    "CATHODE REVIVAL BENCH OS  v2.7",
    "",
    "> degauss coil ......... OK",
    "> HV rail 24.1 kV ...... OK",
    "> filament 6.3 V ....... OK",
    "> convergence .......... ALIGNED",
    "> 22 caps on tray 4 .... READY",
    "",
    "bench 4 idle. awaiting unit."
  ];

  var typeTimer = null;
  function typeBoot() {
    if (!bootEl) return;
    window.clearTimeout(typeTimer);
    bootEl.textContent = "";
    var full = BOOT.join("\n");
    if (reduced) {
      bootEl.textContent = full;
      addCursor();
      return;
    }
    var i = 0;
    (function step() {
      if (i > full.length) {
        addCursor();
        return;
      }
      bootEl.textContent = full.slice(0, i);
      i += 1;
      typeTimer = window.setTimeout(step, full.charAt(i) === "\n" ? 90 : 18);
    })();
  }
  function addCursor() {
    var c = document.createElement("span");
    c.className = "cursor";
    bootEl.appendChild(c);
  }

  function setPower(on) {
    if (!screenEl || !powerBtn) return;
    powerBtn.setAttribute("aria-checked", on ? "true" : "false");
    screenEl.setAttribute("data-on", on ? "true" : "false");
    if (lamp) lamp.classList.toggle("on", on);
    screenEl.classList.remove("collapsing", "igniting");
    /* force reflow so the animation restarts cleanly */
    void screenEl.offsetWidth;
    screenEl.classList.add(on ? "igniting" : "collapsing");
    if (on) {
      typeBoot();
      toast("Tube warming up — filament at 6.3 V.");
    } else {
      window.clearTimeout(typeTimer);
      toast("Set powered down. Let the HV bleed off before opening it.");
    }
  }

  if (powerBtn) {
    powerBtn.addEventListener("click", function () {
      setPower(powerBtn.getAttribute("aria-checked") !== "true");
    });
  }
  typeBoot();
  if (lamp) lamp.classList.add("on");

  /* ---------------- gallery filter ---------------- */
  var pills = Array.prototype.slice.call(document.querySelectorAll(".pill[data-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".ba"));
  var emptyMsg = document.getElementById("galleryEmpty");

  function applyFilter(kind) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = kind === "all" || card.getAttribute("data-kind") === kind;
      card.classList.toggle("hide", !match);
      if (match) shown += 1;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
    return shown;
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        var on = p === pill;
        p.classList.toggle("is-on", on);
        p.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var kind = pill.getAttribute("data-filter");
      var n = applyFilter(kind);
      toast(n === 1 ? "1 unit on the bench." : n + " units on the bench.");
    });
  });

  /* touch: tap a gallery card to hold the "after" state */
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      card.focus();
    });
  });

  /* ---------------- recap kit ---------------- */
  var addKit = document.getElementById("addKit");
  var kitAdded = false;
  var deviceSel = document.getElementById("qDevice");
  if (addKit) {
    addKit.addEventListener("click", function () {
      kitAdded = true;
      addKit.textContent = "Kit added ✓";
      if (deviceSel) deviceSel.value = "Vectra 64 console";
      toast("CRK-0642 recap kit (22 pcs, $34.50) attached to your quote.");
      var q = document.getElementById("quote");
      if (q) q.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  }

  /* ---------------- quote form ---------------- */
  var form = document.getElementById("quoteForm");
  var err = document.getElementById("qErr");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = document.getElementById("qName");
      var email = document.getElementById("qEmail");
      var device = deviceSel ? deviceSel.value : "your unit";
      var problem = null;

      if (!name.value.trim()) problem = "We need a name for the bench card.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))
        problem = "That email doesn't look reachable — check it once more.";

      if (problem) {
        if (err) {
          err.textContent = problem;
          err.hidden = false;
        }
        (problem.indexOf("name") > -1 ? name : email).focus();
        return;
      }
      if (err) err.hidden = true;

      var ticket = "CR-" + String(4400 + Math.floor(Math.random() * 500));
      toast(
        "Ticket " + ticket + " opened for the " + device +
        (kitAdded ? " (recap kit included)." : ".") +
        " We'll reply within 2 business days."
      );
      form.reset();
      addKit && (addKit.textContent = "Add kit to quote");
      kitAdded = false;
    });
  }

  /* ---------------- seven-segment bench clock ---------------- */
  var clock = document.getElementById("clock");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    if (!clock) return;
    var d = new Date();
    clock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick();
  window.setInterval(tick, 1000);

  /* ---------------- smooth in-page nav ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });
})();
