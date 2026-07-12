(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
      setTimeout(function () { toastEl.hidden = true; }, 260);
    }, 2600);
  }

  /* ---------- Data: tearsheets ---------- */
  var TEARSHEETS = [
    {
      cat: "editorial",
      tag: "Editorial",
      title: "The Long Winter",
      credit: "Vestige Quarterly · Styling Marco Feld",
      issue: "Issue 214",
      img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    },
    {
      cat: "cover",
      tag: "Cover",
      title: "Salt Season",
      credit: "NÉ Magazine · Talent Aria Vos",
      issue: "May 2026",
      img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      tall: true,
    },
    {
      cat: "beauty",
      tag: "Beauty",
      title: "Second Skin",
      credit: "ODE Paris · MUA Ines Kort",
      issue: "Digital",
      img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    },
    {
      cat: "campaign",
      tag: "Campaign",
      title: "Field & Kort SS26",
      credit: "Lookbook · Art Dir. R. Sol",
      issue: "Campaign",
      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    },
    {
      cat: "editorial",
      tag: "Editorial",
      title: "Blue Hour Girls",
      credit: "PARALLAX · Set Nord Studio",
      issue: "Issue 08",
      img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      tall: true,
    },
    {
      cat: "beauty",
      tag: "Beauty",
      title: "Gloss & Grain",
      credit: "Muse Editorial · Hair T. Lund",
      issue: "Digital",
      img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    },
    {
      cat: "cover",
      tag: "Cover",
      title: "Aperture Nord",
      credit: "Aperture Nord · Talent K. Møller",
      issue: "Winter 26",
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
    },
    {
      cat: "campaign",
      tag: "Campaign",
      title: "Vestige Atelier",
      credit: "Campaign · Prod. Salt & Iron",
      issue: "Campaign",
      img: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80",
    },
    {
      cat: "editorial",
      tag: "Editorial",
      title: "Paper Weather",
      credit: "PARALLAX · Styling M. Feld",
      issue: "Issue 09",
      img: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=900&q=80",
    },
  ];

  /* ---------- Render grid ---------- */
  var grid = document.getElementById("grid");
  var emptyEl = document.getElementById("grid-empty");
  var currentFilter = "all";
  var visible = [];

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    visible = TEARSHEETS.filter(function (t) {
      return currentFilter === "all" || t.cat === currentFilter;
    });

    if (visible.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    visible.forEach(function (t, i) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "card" + (t.tall ? " is-tall" : "");
      card.style.animationDelay = (i * 45) + "ms";
      card.setAttribute("aria-label", "Open tearsheet: " + t.title + ", " + t.credit);
      card.dataset.index = String(i);
      card.innerHTML =
        '<div class="card__img" style="background-image:url(' + t.img + ')"></div>' +
        '<div class="card__scrim"></div>' +
        '<span class="card__issue">' + t.issue + "</span>" +
        '<div class="card__body">' +
          '<span class="card__tag">' + t.tag + "</span>" +
          '<h3 class="card__title">' + t.title + "</h3>" +
          '<p class="card__credit">' + t.credit + "</p>" +
        "</div>";
      card.addEventListener("click", function () {
        openLightbox(parseInt(card.dataset.index, 10));
      });
      grid.appendChild(card);
    });
  }

  /* ---------- Filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      currentFilter = chip.dataset.filter;
      renderGrid();
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbTitle = lb ? lb.querySelector(".lightbox__title") : null;
  var lbCredit = lb ? lb.querySelector(".lightbox__credit") : null;
  var lbIndex = 0;
  var lastFocused = null;

  function openLightbox(i) {
    if (!lb) return;
    lbIndex = i;
    lastFocused = document.activeElement;
    updateLightbox();
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    document.getElementById("lb-close").focus();
  }

  function updateLightbox() {
    var t = visible[lbIndex];
    if (!t) return;
    lbImg.style.backgroundImage = "url(" + t.img + ")";
    lbImg.setAttribute("aria-label", t.title + " — " + t.credit);
    lbTitle.textContent = t.title;
    lbCredit.textContent = t.credit + " · " + t.issue;
  }

  function closeLightbox() {
    if (!lb) return;
    lb.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(dir) {
    lbIndex = (lbIndex + dir + visible.length) % visible.length;
    updateLightbox();
  }

  if (lb) {
    document.getElementById("lb-close").addEventListener("click", closeLightbox);
    document.getElementById("lb-prev").addEventListener("click", function () { step(-1); });
    document.getElementById("lb-next").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------- Masthead scroll state ---------- */
  var masthead = document.getElementById("masthead");
  var heroMedia = document.querySelector(".hero__media");
  function onScroll() {
    var y = window.pageYOffset;
    if (masthead) masthead.classList.toggle("is-scrolled", y > 40);
    if (heroMedia && y < window.innerHeight) {
      heroMedia.style.transform = "scale(1.04) translateY(" + (y * 0.15) + "px)";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Copy email ---------- */
  var emailBtn = document.getElementById("email-copy");
  if (emailBtn) {
    emailBtn.addEventListener("click", function () {
      var email = "studio@lenamarchetti.photo";
      function done() { toast("Studio email copied to clipboard"); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { toast("Copy: " + email); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Form validation ---------- */
  var form = document.getElementById("inquiry-form");
  function setError(name, msg) {
    var field = form.querySelector('[name="' + name + '"]');
    var wrap = field.closest(".field");
    var errEl = form.querySelector('.field__error[data-for="' + name + '"]');
    if (msg) {
      wrap.classList.add("has-error");
      field.setAttribute("aria-invalid", "true");
      errEl.textContent = msg;
    } else {
      wrap.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
      errEl.textContent = "";
    }
    return !msg;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").trim();
      var email = (data.get("email") || "").trim();
      var message = (data.get("message") || "").trim();
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      var ok = true;
      ok = setError("name", name.length < 2 ? "Please tell me your name." : "") && ok;
      ok = setError("email", !emailRe.test(email) ? "Enter a valid email address." : "") && ok;
      ok = setError("message", message.length < 12 ? "A few more words about the project, please." : "") && ok;

      if (!ok) {
        var firstErr = form.querySelector(".has-error input, .has-error textarea");
        if (firstErr) firstErr.focus();
        toast("Please fix the highlighted fields");
        return;
      }

      var btn = form.querySelector(".form__submit");
      btn.disabled = true;
      btn.textContent = "Sending…";
      setTimeout(function () {
        form.reset();
        btn.disabled = false;
        btn.textContent = "Send inquiry";
        toast("Thanks, " + name.split(" ")[0] + " — inquiry received. I'll reply within two days.");
      }, 800);
    });

    // clear error on input
    ["name", "email", "message"].forEach(function (n) {
      var f = form.querySelector('[name="' + n + '"]');
      if (f) f.addEventListener("input", function () { setError(n, ""); });
    });
  }

  /* ---------- Init ---------- */
  renderGrid();
})();
