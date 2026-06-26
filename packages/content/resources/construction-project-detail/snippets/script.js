(function () {
  "use strict";

  /* ---------- Gallery: thumbnails swap the main image ---------- */
  var main = document.getElementById("mainImg");
  var thumbs = document.getElementById("thumbs");

  if (main && thumbs) {
    thumbs.addEventListener("click", function (e) {
      var btn = e.target.closest(".thumb");
      if (!btn) return;

      thumbs.querySelectorAll(".thumb").forEach(function (t) {
        t.classList.remove("is-active");
      });
      btn.classList.add("is-active");

      main.style.setProperty("--c1", btn.dataset.c1);
      main.style.setProperty("--c2", btn.dataset.c2);

      var label = btn.dataset.label || "Project image";
      main.dataset.label = label;
      var tag = main.querySelector(".ph__tag");
      if (tag) tag.textContent = label;
    });
  }

  /* ---------- Before / After wipe slider ---------- */
  var ba = document.getElementById("ba");
  var before = document.getElementById("baBefore");
  var handle = document.getElementById("baHandle");

  if (ba && before && handle) {
    var dragging = false;

    function setPct(pct) {
      pct = Math.max(0, Math.min(100, pct));
      before.style.width = pct + "%";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    }

    function pctFromEvent(clientX) {
      var rect = ba.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onMove(clientX) {
      if (!dragging) return;
      setPct(pctFromEvent(clientX));
    }

    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) {
      onMove(e.clientX);
    });
    handle.addEventListener("pointerup", function () {
      dragging = false;
    });

    // Click anywhere on the strip to jump
    ba.addEventListener("pointerdown", function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      setPct(pctFromEvent(e.clientX));
    });

    // Keyboard accessibility
    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft") { setPct(cur - 5); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setPct(cur + 5); e.preventDefault(); }
      else if (e.key === "Home") { setPct(0); e.preventDefault(); }
      else if (e.key === "End") { setPct(100); e.preventDefault(); }
    });

    setPct(50);
  }

  /* ---------- CTA form: inline validation + faux submit ---------- */
  var form = document.getElementById("ctaForm");
  var msg = document.getElementById("formMsg");

  if (form && msg) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      msg.classList.remove("is-ok", "is-err");

      if (!name.value.trim()) {
        msg.textContent = "Please enter your name.";
        msg.classList.add("is-err");
        name.focus();
        return;
      }
      if (!emailOk) {
        msg.textContent = "Please enter a valid email address.";
        msg.classList.add("is-err");
        email.focus();
        return;
      }

      var who = name.value.trim().split(" ")[0];
      msg.textContent = "Thanks, " + who + " — your estimate request is in. We'll be in touch within 5 business days.";
      msg.classList.add("is-ok");
      form.reset();
    });
  }
})();
