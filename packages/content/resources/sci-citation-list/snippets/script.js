(function () {
  "use strict";

  /* ---- fictional bibliography ---- */
  var REFS = [
    {
      id: 1,
      authors: "Okonkwo, L., Vasquez-Reyes, M., & Bauer, E.",
      authorsShort: "Okonkwo et al.",
      title: "Radiative controls on sub-canopy temperature in remnant forests.",
      venue: "J. Comput. Ecol.",
      year: 2023, vol: "12(4)", pages: "601–619",
      doi: "10.4821/jce.2023.0188", type: "Article", oa: true,
    },
    {
      id: 2,
      authors: "Hendricks, P., & Mwangi, R.",
      authorsShort: "Hendricks & Mwangi",
      title: "Thermal buffering across closed-canopy gradients: a meta-analysis.",
      venue: "Global Change Biol.",
      year: 2021, vol: "27(9)", pages: "1880–1897",
      doi: "10.1029/gcb.2021.4477", type: "Review", oa: false,
    },
    {
      id: 3,
      authors: "Lindqvist, A., Sørensen, K., & Patel, N.",
      authorsShort: "Lindqvist et al.",
      title: "Microrefugia and the persistence of cold-adapted flora.",
      venue: "Ecography",
      year: 2022, vol: "45(2)", pages: "210–224",
      doi: "10.1111/ecog.2022.0093", type: "Article", oa: true,
    },
    {
      id: 4,
      authors: "Adeyemi, T.",
      authorsShort: "Adeyemi",
      title: "Canopy structure as a climate-regulation service.",
      venue: "Trends Ecol. Evol.",
      year: 2020, vol: "35(11)", pages: "1003–1015",
      doi: "10.1016/tree.2020.0551", type: "Review", oa: false,
    },
    {
      id: 5,
      authors: "Brennan, S., & Iwata, Y.",
      authorsShort: "Brennan & Iwata",
      title: "Edge penetration depth in fragmented temperate woodland.",
      venue: "Landsc. Ecol.",
      year: 2019, vol: "34(6)", pages: "1411–1428",
      doi: "10.1007/lae.2019.3320", type: "Article", oa: true,
    },
    {
      id: 6,
      authors: "Castellanos, D., & Whitfield, J.",
      authorsShort: "Castellanos & Whitfield",
      title: "Thermal safety margins of understorey invertebrates.",
      venue: "Funct. Ecol.",
      year: 2024, vol: "38(1)", pages: "44–58",
      doi: "10.1111/fec.2024.0007", type: "Article", oa: false,
    },
    {
      id: 7,
      authors: "Okonkwo, L., & Bauer, E.",
      authorsShort: "Okonkwo & Bauer",
      title: "A radiative-transfer framing for understorey microclimate.",
      venue: "Methods Ecol. Evol.",
      year: 2022, vol: "13(7)", pages: "1450–1463",
      doi: "10.1111/mee3.2022.0144", type: "Methods", oa: true,
    },
    {
      id: 8,
      authors: "Nakamura, H., Ostrowski, F., & Diallo, A.",
      authorsShort: "Nakamura et al.",
      title: "Heat exposure and demographic decline in shaded ferns.",
      venue: "Oecologia",
      year: 2023, vol: "201(3)", pages: "655–670",
      doi: "10.1007/oec.2023.2891", type: "Article", oa: false,
    },
    {
      id: 9,
      authors: "Virtanen, P., & Halonen, M.",
      authorsShort: "Virtanen & Halonen",
      title: "Extinction coefficients for boreal canopy light models.",
      venue: "Agric. For. Meteorol.",
      year: 2018, vol: "256", pages: "112–125",
      doi: "10.1016/afm.2018.0399", type: "Article", oa: true,
    },
    {
      id: 10,
      authors: "Sato, R.",
      authorsShort: "Sato",
      title: "Validating LAD-based attenuation against tower flux data.",
      venue: "Boreal Environ. Res.",
      year: 2021, vol: "26", pages: "77–94",
      doi: "10.5281/ber.2021.0026", type: "Article", oa: true,
    },
    {
      id: 11,
      authors: "Greco, M., & Andersson, L.",
      authorsShort: "Greco & Andersson",
      title: "Eddy-covariance constraints on sub-canopy energy balance.",
      venue: "J. Geophys. Res. Biogeosci.",
      year: 2020, vol: "125(8)", pages: "e2020JG005",
      doi: "10.1029/jgrg.2020.0058", type: "Article", oa: false,
    },
    {
      id: 12,
      authors: "Quintero, B., & Falk, H.",
      authorsShort: "Quintero & Falk",
      title: "Spatial decay of microclimatic edge effects in temperate fragments.",
      venue: "Forest Ecol. Manag.",
      year: 2022, vol: "509", pages: "120042",
      doi: "10.1016/fem.2022.0042", type: "Article", oa: true,
    },
  ];

  var byId = {};
  REFS.forEach(function (r) { byId[r.id] = r; });

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- toast ---- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  /* ---- clipboard ---- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); resolve(); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  }

  /* ---- parse "1", "2-4", "6,8", "5,12" into a sorted id array ---- */
  function parseSpec(spec) {
    var ids = [];
    spec.split(",").forEach(function (part) {
      part = part.trim();
      if (part.indexOf("-") > -1) {
        var bounds = part.split("-");
        var lo = parseInt(bounds[0], 10);
        var hi = parseInt(bounds[1], 10);
        for (var i = lo; i <= hi; i++) ids.push(i);
      } else if (part) {
        ids.push(parseInt(part, 10));
      }
    });
    return ids.filter(function (n, i, a) { return !isNaN(n) && a.indexOf(n) === i; });
  }

  /* ---- compress [2,3,4] -> "2–4" for numeric/superscript display ---- */
  function compressRanges(ids) {
    if (!ids.length) return "";
    var sorted = ids.slice().sort(function (a, b) { return a - b; });
    var out = [];
    var start = sorted[0], prev = sorted[0];
    for (var i = 1; i <= sorted.length; i++) {
      if (sorted[i] === prev + 1) { prev = sorted[i]; continue; }
      out.push(start === prev ? String(start) : start + "–" + prev);
      start = sorted[i]; prev = sorted[i];
    }
    return out.join(",");
  }

  /* ---- author-year label for a set of ids ---- */
  function authorYearLabel(ids) {
    return ids.map(function (id) {
      var r = byId[id];
      return r ? r.authorsShort + ", " + r.year : id;
    }).join("; ");
  }

  /* ---- render inline citations in the chosen style ---- */
  var currentStyle = "numeric";
  var crefs = $$(".cref");

  function renderCitations() {
    document.body.classList.remove("fmt-numeric", "fmt-author-year", "fmt-superscript");
    document.body.classList.add("fmt-" + currentStyle);

    crefs.forEach(function (span) {
      var spec = span.getAttribute("data-cite");
      var ids = parseSpec(spec);
      span.innerHTML = "";

      var a = document.createElement("a");
      a.href = "#references";
      a.setAttribute("role", "link");
      a.setAttribute("tabindex", "0");
      a.dataset.ids = ids.join(",");

      var aria = "Citation " + ids.join(", ") + " — " +
        ids.map(function (id) { return byId[id] ? byId[id].authorsShort + " " + byId[id].year : id; }).join("; ");
      a.setAttribute("aria-label", aria);

      if (currentStyle === "author-year") {
        a.textContent = "(" + authorYearLabel(ids) + ")";
      } else if (currentStyle === "superscript") {
        a.textContent = compressRanges(ids);
      } else {
        a.textContent = "[" + compressRanges(ids) + "]";
      }
      span.appendChild(a);
    });
  }

  /* ---- tooltip ---- */
  var tip = $("#tip");
  var tipHideTimer;

  function tipHTML(ids) {
    return ids.map(function (id) {
      var r = byId[id];
      if (!r) return "";
      return '<div><span class="tip-num">[' + id + ']</span> ' +
        r.authorsShort + ' (' + r.year + '). ' +
        '<span class="tip-title">' + r.title + '</span> ' +
        '<span class="tip-venue">' + r.venue + '</span></div>';
    }).join("");
  }

  function showTip(target) {
    var ids = (target.dataset.ids || "").split(",").map(Number);
    tip.innerHTML = tipHTML(ids);
    tip.setAttribute("aria-hidden", "false");
    var r = target.getBoundingClientRect();
    tip.classList.add("show");
    // position after it has dimensions
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = r.left + r.width / 2 - tw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tw - 10));
    var top = r.top - th - 10;
    if (top < 10) top = r.bottom + 10;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function hideTip() {
    tip.classList.remove("show");
    tip.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("mouseover", function (e) {
    var a = e.target.closest && e.target.closest(".cref a");
    if (a) { clearTimeout(tipHideTimer); showTip(a); }
  });
  document.addEventListener("mouseout", function (e) {
    var a = e.target.closest && e.target.closest(".cref a");
    if (a) { tipHideTimer = setTimeout(hideTip, 120); }
  });
  document.addEventListener("focusin", function (e) {
    if (e.target.closest && e.target.closest(".cref a")) showTip(e.target);
  });
  document.addEventListener("focusout", function (e) {
    if (e.target.closest && e.target.closest(".cref a")) hideTip();
  });
  window.addEventListener("scroll", hideTip, { passive: true });

  /* ---- click inline cite -> smooth scroll + highlight ---- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".cref a");
    if (!a) return;
    e.preventDefault();
    hideTip();
    var first = (a.dataset.ids || "").split(",")[0];
    var li = document.getElementById("ref-" + first);
    if (li) {
      li.scrollIntoView({ behavior: "smooth", block: "center" });
      li.classList.remove("ref-target");
      void li.offsetWidth;
      li.classList.add("ref-target");
      setTimeout(function () { li.classList.remove("ref-target"); }, 1500);
    }
  });
  // keyboard activate
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest(".cref a")) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* ---- BibTeX ---- */
  function bibKey(r) {
    var first = r.authors.split(",")[0].replace(/[^A-Za-z]/g, "");
    return first + r.year;
  }
  function toBibTeX(r) {
    var entryType = r.type === "Methods" ? "article" : "article";
    return "@" + entryType + "{" + bibKey(r) + ",\n" +
      "  author  = {" + r.authors.replace(/&/g, "and") + "},\n" +
      "  title   = {" + r.title.replace(/\.$/, "") + "},\n" +
      "  journal = {" + r.venue + "},\n" +
      "  year    = {" + r.year + "},\n" +
      "  volume  = {" + r.vol + "},\n" +
      "  pages   = {" + r.pages.replace(/–/g, "--") + "},\n" +
      "  doi     = {" + r.doi + "}\n" +
      "}";
  }
  function plainCite(r) {
    return r.authors + " (" + r.year + "). " + r.title + " " + r.venue + ", " +
      r.vol + ", " + r.pages + ". https://doi.org/" + r.doi;
  }

  /* ---- render references list ---- */
  var listEl = $("#refList");
  REFS.forEach(function (r) {
    var li = document.createElement("li");
    li.className = "ref-item";
    li.id = "ref-" + r.id;

    var badges = '<span class="badge badge-type">' + r.type + "</span>";
    if (r.oa) badges += '<span class="badge badge-oa">Open Access</span>';

    li.innerHTML =
      '<div class="ref-num">' + r.id + "</div>" +
      '<div class="ref-body">' +
        '<p class="ref-cite">' +
          '<span class="ref-authors">' + r.authors + "</span> (" +
          '<span class="ref-year">' + r.year + "</span>). " +
          '<span class="ref-title">' + r.title + "</span> " +
          '<span class="ref-venue">' + r.venue + "</span>, " + r.vol + ", " + r.pages + "." +
        "</p>" +
        '<div class="ref-meta">' +
          badges +
          '<a class="doi" href="https://doi.org/' + r.doi + '" target="_blank" rel="noopener">doi:' + r.doi + "</a>" +
          '<span class="ref-actions">' +
            '<button class="mini" type="button" data-act="cite" data-id="' + r.id + '">Cite</button>' +
            '<button class="mini" type="button" data-act="copy" data-id="' + r.id + '">Copy</button>' +
          "</span>" +
        "</div>" +
      "</div>";
    listEl.appendChild(li);
  });

  /* ---- per-entry buttons ---- */
  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var r = byId[parseInt(btn.dataset.id, 10)];
    if (!r) return;
    if (btn.dataset.act === "cite") {
      copyText(toBibTeX(r)).then(
        function () { toast("BibTeX [" + r.id + "] copied"); },
        function () { toast("Copy failed"); }
      );
    } else {
      copyText(plainCite(r)).then(
        function () { toast("Citation [" + r.id + "] copied"); },
        function () { toast("Copy failed"); }
      );
    }
  });

  /* ---- copy all bibtex ---- */
  $("#copyAllBib").addEventListener("click", function () {
    var all = REFS.map(toBibTeX).join("\n\n");
    copyText(all).then(
      function () { toast("All " + REFS.length + " BibTeX entries copied"); },
      function () { toast("Copy failed"); }
    );
  });

  /* ---- style toggle ---- */
  var seg = $("#styleSeg");
  var segBtns = $$(".seg-btn", seg);
  function setStyle(style, focusBtn) {
    currentStyle = style;
    segBtns.forEach(function (b) {
      var on = b.dataset.style === style;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      if (on && focusBtn) b.focus();
    });
    renderCitations();
    hideTip();
  }
  seg.addEventListener("click", function (e) {
    var b = e.target.closest(".seg-btn");
    if (b) { setStyle(b.dataset.style); toast("Style: " + b.dataset.style.replace("-", "–")); }
  });
  seg.addEventListener("keydown", function (e) {
    var idx = segBtns.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setStyle(segBtns[(idx + 1) % segBtns.length].dataset.style, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setStyle(segBtns[(idx - 1 + segBtns.length) % segBtns.length].dataset.style, true);
    }
  });
  segBtns.forEach(function (b) { b.tabIndex = b.classList.contains("is-active") ? 0 : -1; });

  /* ---- init ---- */
  renderCitations();
})();
