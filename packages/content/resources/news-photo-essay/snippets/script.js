(function () {
  "use strict";

  var deck = document.getElementById("plates");
  var plates = Array.prototype.slice.call(document.querySelectorAll(".plate"));
  var curEl = document.getElementById("frameCur");
  var totalEl = document.getElementById("frameTotal");
  var progressBar = document.getElementById("progressBar");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var toTop = document.getElementById("toTop");
  var toastEl = document.getElementById("toast");

  var total = plates.length;
  var current = 0; // index into plates
  var toastTimer = null;

  totalEl.textContent = pad(total);

  /* ---------- helpers ---------- */
  function pad(n) { return String(n).length < 2 ? "0" + n : String(n); }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 1900);
  }

  function setCurrent(idx) {
    if (idx < 0) idx = 0;
    if (idx > total - 1) idx = total - 1;
    current = idx;
    var frame = parseInt(plates[idx].getAttribute("data-frame"), 10) || idx + 1;
    curEl.textContent = pad(frame);
    var pct = total > 1 ? (frame - 1) / (total - 1) * 100 : 0;
    progressBar.style.width = pct.toFixed(2) + "%";

    plates.forEach(function (p, i) {
      p.classList.toggle("is-active", i === idx);
    });
  }

  function goTo(idx, announce) {
    if (idx < 0) idx = 0;
    if (idx > total - 1) idx = total - 1;
    plates[idx].scrollIntoView({ behavior: "smooth", block: "start" });
    if (announce) {
      var frame = parseInt(plates[idx].getAttribute("data-frame"), 10) || idx + 1;
      toast("Plate " + frame + " of " + total);
    }
  }

  function next() { goTo(current + 1, true); }
  function prev() { goTo(current - 1, true); }

  /* ---------- active-plate tracking via IntersectionObserver ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (e) {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
          best = e;
        }
      });
      if (best) {
        var idx = plates.indexOf(best.target);
        if (idx !== -1 && idx !== current) setCurrent(idx);
      }
    }, { root: deck, threshold: [0.35, 0.55, 0.75] });
    plates.forEach(function (p) { io.observe(p); });
  } else {
    // fallback: scroll math
    deck.addEventListener("scroll", function () {
      var mid = deck.scrollTop + deck.clientHeight / 2;
      var idx = 0;
      for (var i = 0; i < plates.length; i++) {
        if (plates[i].offsetTop <= mid) idx = i;
      }
      if (idx !== current) setCurrent(idx);
    }, { passive: true });
  }

  /* ---------- controls ---------- */
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  if (toTop) {
    toTop.addEventListener("click", function () {
      goTo(0, false);
      toast("Back to the title spread");
    });
  }

  /* ---------- keyboard navigation ---------- */
  document.addEventListener("keydown", function (e) {
    if (lightboxOpen) {
      if (e.key === "Escape") { closeLightbox(); }
      return;
    }
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
        e.preventDefault(); next(); break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault(); prev(); break;
      case "Home":
        e.preventDefault(); goTo(0, true); break;
      case "End":
        e.preventDefault(); goTo(total - 1, true); break;
      case " ":
        e.preventDefault(); e.shiftKey ? prev() : next(); break;
      default: break;
    }
  });

  /* ---------- lightbox / zoom ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lightboxOpen = false;
  var lastFocused = null;

  // duotone class carried over to the lightbox image
  var DUO_RE = /\bduo--[a-z]+\b/;

  function openLightbox(btn) {
    var duoCls = (btn.className.match(DUO_RE) || [""])[0];
    lbImg.className = "lightbox__img duo " + duoCls;

    var fig = btn.closest("figure");
    var cap = fig ? fig.querySelector(".caption") : null;
    if (cap) {
      var text = cap.querySelector(".caption__text");
      var credit = cap.querySelector(".caption__credit");
      lbCap.innerHTML =
        (text ? text.innerHTML : "") +
        (credit ? "<b>" + credit.textContent + "</b>" : "");
    } else {
      lbCap.innerHTML = "";
    }

    lastFocused = btn;
    lightbox.hidden = false;
    lightboxOpen = true;
    document.body.style.overflow = "hidden";
    lbClose.focus();
    toast("Zoomed — press Esc to close");
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxOpen = false;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  document.querySelectorAll("[data-zoom]").forEach(function (btn) {
    btn.addEventListener("click", function () { openLightbox(btn); });
  });

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- init ---------- */
  setCurrent(0);

  // de-emphasise the scroll hint once the reader has moved on
  var hint = document.getElementById("scrollHint");
  if (hint) {
    var hintObserver = function () {
      if (current > 0) {
        hint.style.transition = "opacity .4s ease";
        hint.style.opacity = "0";
        deck.removeEventListener("scroll", hintObserver);
      }
    };
    deck.addEventListener("scroll", hintObserver, { passive: true });
  }
})();
