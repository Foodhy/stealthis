(function () {
  "use strict";

  var toastEl = document.getElementById("toast");
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

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
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
      } catch (e) {
        reject(e);
      }
    });
  }

  /* ---- Reveal conclusions ---- */
  var revealBtn = document.getElementById("revealBtn");
  var extraSeg = document.querySelector(".seg-extra");
  var revealLabel = revealBtn ? revealBtn.querySelector(".reveal-label") : null;

  if (revealBtn && extraSeg) {
    revealBtn.addEventListener("click", function () {
      var open = extraSeg.hasAttribute("hidden");
      if (open) {
        extraSeg.removeAttribute("hidden");
        revealBtn.setAttribute("aria-expanded", "true");
        if (revealLabel) revealLabel.textContent = "Hide conclusions";
      } else {
        extraSeg.setAttribute("hidden", "");
        revealBtn.setAttribute("aria-expanded", "false");
        if (revealLabel) revealLabel.textContent = "Show conclusions";
      }
    });
  }

  /* ---- Build plain-text abstract ---- */
  function buildAbstractText() {
    var lines = [];
    var title = document.getElementById("art-title");
    if (title) lines.push(title.textContent.trim());
    var authors = document.querySelector(".authors");
    if (authors) lines.push(authors.textContent.replace(/\s+/g, " ").trim());
    lines.push("");
    var segs = document.querySelectorAll("#abstract .seg");
    segs.forEach(function (seg) {
      var dt = seg.querySelector("dt");
      var dd = seg.querySelector("dd");
      if (dt && dd) {
        lines.push(dt.textContent.trim() + ": " + dd.textContent.replace(/\s+/g, " ").trim());
      }
    });
    lines.push("");
    var doi = document.getElementById("doiLink");
    if (doi) lines.push("DOI: " + doi.textContent.trim());
    return lines.join("\n");
  }

  function buildCitation() {
    var doi = document.getElementById("doiLink");
    var doiTxt = doi ? doi.textContent.trim() : "";
    return (
      "Velasco, A. R., Okonkwo, J., Lindqvist, M., & Raghavan, P. S. (2026). " +
      "Mitochondrial fission dynamics regulate dendritic spine maturation in cortical neurons under metabolic stress. " +
      "Journal of Cell & Developmental Biology, 41(3), 211–229. https://doi.org/" + doiTxt
    );
  }

  /* ---- Copy abstract ---- */
  var copyBtn = document.getElementById("copyBtn");
  var copyLabel = document.getElementById("copyLabel");

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyText(buildAbstractText())
        .then(function () {
          copyBtn.classList.add("is-done");
          if (copyLabel) copyLabel.textContent = "Copied";
          toast("Abstract copied to clipboard");
          setTimeout(function () {
            copyBtn.classList.remove("is-done");
            if (copyLabel) copyLabel.textContent = "Copy abstract";
          }, 1800);
        })
        .catch(function () {
          toast("Copy failed — select and copy manually");
        });
    });
  }

  /* ---- Copy citation ---- */
  var citeBtn = document.getElementById("citeBtn");
  if (citeBtn) {
    citeBtn.addEventListener("click", function () {
      copyText(buildCitation())
        .then(function () {
          toast("Citation copied (APA)");
        })
        .catch(function () {
          toast("Copy failed — try again");
        });
    });
  }

  /* ---- Keyword chips ---- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var kw = chip.getAttribute("data-kw") || chip.textContent.trim();
      copyText(kw).then(function () {
        toast('Keyword "' + kw + '" copied');
      }).catch(function () {
        toast("Search: " + kw);
      });
    });
  });

  /* ---- DOI link ---- */
  var doiLink = document.getElementById("doiLink");
  if (doiLink) {
    doiLink.addEventListener("click", function (e) {
      e.preventDefault();
      copyText("https://doi.org/" + doiLink.textContent.trim())
        .then(function () { toast("DOI link copied"); })
        .catch(function () { toast("DOI: " + doiLink.textContent.trim()); });
    });
  }
})();
