(function () {
  "use strict";

  var byline = document.getElementById("byline");
  var authorList = document.getElementById("authorList");
  var affList = document.getElementById("affList");
  var toastEl = document.getElementById("toast");
  if (!byline || !authorList || !affList) return;

  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  var authors = Array.prototype.slice.call(authorList.querySelectorAll(".author"));
  var affs = Array.prototype.slice.call(affList.querySelectorAll(".aff"));

  function affsOf(authorEl) {
    var raw = authorEl.getAttribute("data-affs") || "";
    return raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function clearHighlight() {
    affs.forEach(function (a) { a.classList.remove("is-active"); });
    authors.forEach(function (a) { a.classList.remove("is-active"); });
  }

  function highlight(authorEl) {
    clearHighlight();
    authorEl.classList.add("is-active");
    var ids = affsOf(authorEl);
    affs.forEach(function (a) {
      if (ids.indexOf(a.getAttribute("data-aff")) !== -1) {
        a.classList.add("is-active");
      }
    });
  }

  // Hover + focus: highlight matching affiliations
  authors.forEach(function (authorEl) {
    var btn = authorEl.querySelector(".author-btn");
    if (!btn) return;
    authorEl.addEventListener("mouseenter", function () { highlight(authorEl); });
    authorEl.addEventListener("mouseleave", clearHighlight);
    btn.addEventListener("focus", function () { highlight(authorEl); });
    btn.addEventListener("blur", clearHighlight);

    // Click name = scroll affiliations into view + sticky highlight toggle
    btn.addEventListener("click", function (e) {
      // ignore clicks that originate on the corresponding-author star
      if (e.target.closest(".corr-star")) return;
      var ids = affsOf(authorEl);
      var name = authorEl.querySelector(".author-name").textContent;
      var label = ids.length > 1 ? "affiliations " : "affiliation ";
      toast(name + " — " + label + ids.join(", "));
    });
  });

  // Hovering an affiliation row also highlights the authors who belong to it
  affs.forEach(function (affEl) {
    var id = affEl.getAttribute("data-aff");
    affEl.addEventListener("mouseenter", function () {
      clearHighlight();
      affEl.classList.add("is-active");
      authors.forEach(function (a) {
        if (affsOf(a).indexOf(id) !== -1) a.classList.add("is-active");
      });
    });
    affEl.addEventListener("mouseleave", clearHighlight);
  });

  // ---------- Corresponding-author email reveal ----------
  var openPop = null;
  function closePop() {
    if (openPop) { openPop.remove(); openPop = null; }
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onEsc);
  }
  function onDocClick(e) {
    if (openPop && !openPop.contains(e.target) && !e.target.closest(".corr-star")) {
      closePop();
    }
  }
  function onEsc(e) { if (e.key === "Escape") closePop(); }

  authorList.addEventListener("click", function (e) {
    var star = e.target.closest(".corr-star");
    if (!star) return;
    e.preventDefault();
    e.stopPropagation();

    var authorEl = star.closest(".author");
    var email = authorEl ? authorEl.getAttribute("data-corr") : null;
    if (!email) return;

    var wasThis = openPop && openPop.dataset.email === email;
    closePop();
    if (wasThis) return;

    var pop = document.createElement("div");
    pop.className = "email-pop";
    pop.dataset.email = email;
    var link = document.createElement("a");
    link.href = "mailto:" + email;
    link.textContent = email;
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var done = function () { toast("Email copied: " + email); closePop(); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, done);
      } else {
        done();
      }
    });
    pop.appendChild(link);
    pop.appendChild(copyBtn);

    byline.style.position = "relative";
    byline.appendChild(pop);

    var sr = star.getBoundingClientRect();
    var br = byline.getBoundingClientRect();
    var left = sr.left - br.left - 12;
    var top = sr.bottom - br.top + 8;
    var maxLeft = byline.clientWidth - pop.offsetWidth - 4;
    pop.style.left = Math.max(4, Math.min(left, maxLeft)) + "px";
    pop.style.top = top + "px";

    openPop = pop;
    setTimeout(function () {
      document.addEventListener("click", onDocClick, true);
      document.addEventListener("keydown", onEsc);
    }, 0);
  });

  // ---------- ORCID feedback ----------
  authorList.querySelectorAll(".orcid:not(.orcid--none)").forEach(function (a) {
    a.addEventListener("click", function () {
      var label = a.getAttribute("aria-label") || "ORCID";
      toast("Opening " + label.replace(" (opens in new tab)", ""));
    });
  });

  // ---------- Variant toggle (expanded / compact) ----------
  function buildCompactSummary() {
    var parts = affs.map(function (a) {
      var num = a.querySelector(".aff-num").textContent.trim();
      var txt = a.querySelector(".aff-text").textContent.trim();
      // keep first clause (institution) for the compact footnote
      var inst = txt.split(",").slice(0, 2).join(",").trim();
      return num + " " + inst;
    });
    return parts.join("  ·  ");
  }
  byline.setAttribute("data-affsummary", buildCompactSummary());

  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  function setVariant(variant, focusIdx) {
    byline.setAttribute("data-variant", variant);
    closePop();
    segBtns.forEach(function (b, i) {
      var on = b.getAttribute("data-variant") === variant;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      if (focusIdx != null && i === focusIdx) b.focus();
    });
  }
  segBtns.forEach(function (b, i) {
    b.tabIndex = b.classList.contains("is-active") ? 0 : -1;
    b.addEventListener("click", function () { setVariant(b.getAttribute("data-variant")); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var next = e.key === "ArrowRight"
          ? (i + 1) % segBtns.length
          : (i - 1 + segBtns.length) % segBtns.length;
        setVariant(segBtns[next].getAttribute("data-variant"), next);
      }
    });
  });
})();
