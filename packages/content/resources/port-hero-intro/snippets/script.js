/* =================================================================
   Portfolio — Hero / Intro Header Variants
   Vanilla JS: role rotator, cursor-follow glow, copy-email.
   ================================================================= */
(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------- Copy email ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts.
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  var copyButtons = document.querySelectorAll(".copy-email");
  Array.prototype.forEach.call(copyButtons, function (btn) {
    var label = btn.querySelector(".copy-email__label");
    var originalLabel = label ? label.textContent : "";
    btn.addEventListener("click", function () {
      var email = btn.getAttribute("data-email") || "";
      copyText(email).then(
        function () {
          btn.classList.add("is-copied");
          if (label) label.textContent = "Copied ✓";
          toast("Email copied — " + email);
          window.setTimeout(function () {
            btn.classList.remove("is-copied");
            if (label) label.textContent = originalLabel;
          }, 1800);
        },
        function () {
          toast("Copy failed — " + email);
        }
      );
    });
  });

  /* ---------- Role rotator (Variant 3) ---------- */
  var rotatorTextEl = document.getElementById("rotator-text");
  if (rotatorTextEl) {
    var roles = [
      "product designer",
      "systems thinker",
      "prototyper",
      "design-systems lead",
      "front-end tinkerer",
      "problem framer"
    ];
    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // Simple cross-fade swap, no per-character typing.
      var rIdx = 0;
      window.setInterval(function () {
        rIdx = (rIdx + 1) % roles.length;
        rotatorTextEl.textContent = roles[rIdx];
      }, 2600);
    } else {
      var idx = 0;
      var charPos = roles[0].length; // start fully typed on first word
      var deleting = false;
      var TYPE_MS = 70;
      var DELETE_MS = 38;
      var HOLD_MS = 1500;

      function tick() {
        var word = roles[idx];
        if (!deleting) {
          charPos++;
          rotatorTextEl.textContent = word.slice(0, charPos);
          if (charPos >= word.length) {
            deleting = true;
            return window.setTimeout(tick, HOLD_MS);
          }
          return window.setTimeout(tick, TYPE_MS);
        }
        charPos--;
        rotatorTextEl.textContent = word.slice(0, Math.max(charPos, 0));
        if (charPos <= 0) {
          deleting = false;
          idx = (idx + 1) % roles.length;
          return window.setTimeout(tick, 320);
        }
        return window.setTimeout(tick, DELETE_MS);
      }
      // Kick off after the initial hold so the first word reads cleanly.
      window.setTimeout(function () {
        deleting = true;
        tick();
      }, HOLD_MS);
    }
  }

  /* ---------- Cursor-follow glow (Variant 2) ---------- */
  var followEls = document.querySelectorAll("[data-cursor-follow]");
  var supportsHover =
    !window.matchMedia || window.matchMedia("(hover: hover)").matches;

  if (supportsHover) {
    Array.prototype.forEach.call(followEls, function (el) {
      el.addEventListener("pointermove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--glow-x", x.toFixed(1) + "%");
        el.style.setProperty("--glow-y", y.toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--glow-x", "80%");
        el.style.setProperty("--glow-y", "30%");
      });
    });
  }

  /* ---------- Résumé link is illustrative ---------- */
  var resumeLink = document.querySelector('a[href="#resume"]');
  if (resumeLink) {
    resumeLink.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Résumé download is illustrative in this demo");
    });
  }
})();
