// The Marginalia Review — landing interactions (vanilla JS)
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2800);
  }

  /* ---------- featured essay: expand / collapse with smooth height ---------- */
  var body = document.getElementById("essay-body");
  var toggle = document.getElementById("essay-toggle");

  if (body && toggle) {
    var setCollapsedHeight = function () {
      // when collapsed the CSS max-height clamp drives the look; nothing to set
    };

    toggle.addEventListener("click", function () {
      var collapsed = body.getAttribute("data-collapsed") === "true";

      if (collapsed) {
        // expand: animate from current clamp to full scroll height
        var start = body.clientHeight;
        body.style.maxHeight = start + "px";
        body.setAttribute("data-collapsed", "false");
        // force reflow then set to full height
        void body.offsetHeight;
        body.style.maxHeight = body.scrollHeight + "px";
        var onEnd = function () {
          body.style.maxHeight = "none";
          body.removeEventListener("transitionend", onEnd);
        };
        body.addEventListener("transitionend", onEnd);

        toggle.setAttribute("aria-expanded", "true");
        toggle.innerHTML = 'Read less <span class="chev" aria-hidden="true">↓</span>';
      } else {
        // collapse: from full height back to the clamp value (340 / 300)
        var full = body.scrollHeight;
        body.style.maxHeight = full + "px";
        void body.offsetHeight;
        var clamp = window.matchMedia("(max-width: 720px)").matches ? 300 : 340;
        body.style.maxHeight = clamp + "px";
        var onEnd2 = function () {
          body.removeAttribute("style");
          body.setAttribute("data-collapsed", "true");
          body.removeEventListener("transitionend", onEnd2);
        };
        body.addEventListener("transitionend", onEnd2);

        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = 'Continue reading <span class="chev" aria-hidden="true">↓</span>';
        // keep the essay top in view when collapsing
        var featured = document.getElementById("featured");
        if (featured) {
          var top = featured.getBoundingClientRect().top + window.scrollY - 16;
          if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
        }
      }
    });

    setCollapsedHeight();
  }

  /* ---------- contents: genre filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var items = Array.prototype.slice.call(document.querySelectorAll(".toc__item"));
  var emptyMsg = document.getElementById("toc-empty");

  function applyFilter(genre) {
    var shown = 0;
    items.forEach(function (item) {
      var match = genre === "all" || item.getAttribute("data-genre") === genre;
      item.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");

      var genre = chip.getAttribute("data-genre");
      applyFilter(genre);

      var label = chip.textContent.trim();
      toast(genre === "all" ? "Showing all twelve pieces" : "Filtered to " + label.toLowerCase() + "s");
    });
  });

  /* ---------- subscribe form ---------- */
  var form = document.getElementById("subform");
  var emailInput = document.getElementById("sub-email");
  var err = document.getElementById("sub-err");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (form && emailInput) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = emailInput.value.trim();
      if (!emailRe.test(val)) {
        if (err) err.hidden = false;
        emailInput.setAttribute("aria-invalid", "true");
        emailInput.focus();
        return;
      }
      if (err) err.hidden = true;
      emailInput.removeAttribute("aria-invalid");
      form.reset();
      toast("Thank you — Issue No. 14 will be posted to you.");
    });

    emailInput.addEventListener("input", function () {
      if (err && !err.hidden && emailRe.test(emailInput.value.trim())) {
        err.hidden = true;
        emailInput.removeAttribute("aria-invalid");
      }
    });
  }

  /* ---------- smooth in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: top, behavior: "smooth" });
      if (typeof target.focus === "function") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
})();
