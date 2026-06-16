/* Computational Soft Matter Group — publications index
   Vanilla JS. Live filtering, search, sort, BibTeX/citation copy. */
(function () {
  "use strict";

  // Group members — names matched against author lists to bold them.
  var MEMBERS = [
    "M. Okonkwo-Reyes",
    "L. Vasquez",
    "T. Aaltonen",
    "R. Devi",
    "S. Brennan",
    "K. Yamazaki",
  ];

  // Seeded, fictional bibliography.
  var PUBS = [
    {
      id: "okonkwo2026shear",
      type: "journal",
      year: 2026,
      authors: ["M. Okonkwo-Reyes", "P. Lindqvist", "R. Devi", "S. Brennan"],
      title: "Shear-induced crystallisation pathways in dense colloidal suspensions",
      venue: "Physical Review X",
      volume: "16",
      pages: "021034",
      doi: "10.1109/prx.2026.021034",
      topic: "Colloids",
      peer: true,
      oa: true,
      award: "Editors' Suggestion",
      cited: 4,
      hasCode: true,
      hasPdf: true,
    },
    {
      id: "vasquez2026active",
      type: "preprint",
      year: 2026,
      authors: ["L. Vasquez", "M. Okonkwo-Reyes"],
      title: "Active stress regulation in confined bacterial suspensions: a continuum model",
      venue: "arXiv:2603.14988 [cond-mat.soft]",
      doi: "10.48550/arXiv.2603.14988",
      topic: "Active matter",
      peer: false,
      oa: true,
      cited: 1,
      hasCode: true,
      hasPdf: true,
    },
    {
      id: "aaltonen2025glass",
      type: "journal",
      year: 2025,
      authors: ["T. Aaltonen", "K. Yamazaki", "M. Okonkwo-Reyes"],
      title: "Dynamic heterogeneity near the glass transition of binary polymer melts",
      venue: "Soft Matter",
      volume: "21",
      pages: "3877–3891",
      doi: "10.1039/sm2025.03877",
      topic: "Glass physics",
      peer: true,
      oa: false,
      cited: 17,
      hasCode: true,
      hasPdf: true,
    },
    {
      id: "devi2025membrane",
      type: "journal",
      year: 2025,
      authors: ["R. Devi", "S. Brennan", "M. Okonkwo-Reyes"],
      title: "Curvature-coupled phase separation in lipid bilayer membranes",
      venue: "Biophysical Journal",
      volume: "128",
      pages: "1142–1156",
      doi: "10.1016/j.bpj.2025.01142",
      topic: "Membranes",
      peer: true,
      oa: true,
      cited: 9,
      hasCode: false,
      hasPdf: true,
    },
    {
      id: "yamazaki2025md",
      type: "conference",
      year: 2025,
      authors: ["K. Yamazaki", "T. Aaltonen"],
      title: "Scalable molecular dynamics for polydisperse soft spheres on heterogeneous GPUs",
      venue: "Proc. Int. Conf. on Computational Physics (ICCP 25)",
      pages: "88–97",
      doi: "10.1145/iccp25.0088",
      topic: "Methods & software",
      peer: true,
      oa: false,
      award: "Best Paper",
      cited: 6,
      hasCode: true,
      hasPdf: true,
    },
    {
      id: "brennan2024gel",
      type: "journal",
      year: 2024,
      authors: ["S. Brennan", "L. Vasquez", "M. Okonkwo-Reyes", "H. Nakamura"],
      title: "Rheological signatures of arrested phase separation in attractive colloidal gels",
      venue: "Journal of Rheology",
      volume: "68",
      pages: "455–472",
      doi: "10.1122/jor.2024.0455",
      topic: "Colloids",
      peer: true,
      oa: false,
      cited: 23,
      hasCode: true,
      hasPdf: true,
    },
    {
      id: "okonkwo2024review",
      type: "journal",
      year: 2024,
      authors: ["M. Okonkwo-Reyes", "T. Aaltonen"],
      title: "Coarse-grained models of soft matter: a practitioner's review",
      venue: "Annual Review of Condensed Matter Physics",
      volume: "15",
      pages: "201–229",
      doi: "10.1146/arcmp.2024.00201",
      topic: "Methods & software",
      peer: true,
      oa: true,
      cited: 41,
      hasCode: false,
      hasPdf: true,
    },
    {
      id: "devi2023active",
      type: "preprint",
      year: 2023,
      authors: ["R. Devi", "M. Okonkwo-Reyes"],
      title: "Topological defects as control variables in active nematic films",
      venue: "arXiv:2310.07712 [cond-mat.soft]",
      doi: "10.48550/arXiv.2310.07712",
      topic: "Active matter",
      peer: false,
      oa: true,
      cited: 14,
      hasCode: true,
      hasPdf: true,
    },
    {
      id: "vasquez2023swim",
      type: "journal",
      year: 2023,
      authors: ["L. Vasquez", "K. Yamazaki", "M. Okonkwo-Reyes"],
      title: "Hydrodynamic clustering of microswimmers under acoustic confinement",
      venue: "Physical Review Fluids",
      volume: "8",
      pages: "094201",
      doi: "10.1103/prfluids.8.094201",
      topic: "Active matter",
      peer: true,
      oa: false,
      cited: 19,
      hasCode: true,
      hasPdf: true,
    },
    {
      id: "aaltonen2022chapter",
      type: "chapter",
      year: 2022,
      authors: ["T. Aaltonen", "M. Okonkwo-Reyes"],
      title: "Free-energy methods for soft interfaces",
      venue: "In: Handbook of Statistical Mechanics of Soft Materials, ch. 7",
      pages: "211–248",
      doi: "10.1007/hbssm.2022.07",
      topic: "Glass physics",
      peer: true,
      oa: false,
      cited: 11,
      hasCode: false,
      hasPdf: false,
    },
    {
      id: "brennan2022droplet",
      type: "journal",
      year: 2022,
      authors: ["S. Brennan", "R. Devi"],
      title: "Coalescence statistics of surfactant-laden emulsion droplets in turbulent flow",
      venue: "Journal of Fluid Mechanics",
      volume: "942",
      pages: "A18",
      doi: "10.1017/jfm.2022.0a18",
      topic: "Membranes",
      peer: true,
      oa: true,
      cited: 27,
      hasCode: false,
      hasPdf: true,
    },
    {
      id: "yamazaki2021bench",
      type: "conference",
      year: 2021,
      authors: ["K. Yamazaki", "L. Vasquez", "M. Okonkwo-Reyes"],
      title: "Benchmarking lattice-Boltzmann kernels for soft-matter simulation at exascale",
      venue: "Proc. Supercomputing Workshop on Mesoscale Methods (SC-MM 21)",
      pages: "31–40",
      doi: "10.1145/scmm21.0031",
      topic: "Methods & software",
      peer: true,
      oa: false,
      cited: 33,
      hasCode: true,
      hasPdf: true,
    },
  ];

  // ── DOM refs ──────────────────────────────
  var $ = function (sel) { return document.querySelector(sel); };
  var search = $("#search");
  var searchClear = $("#search-clear");
  var fYear = $("#f-year");
  var fTopic = $("#f-topic");
  var fAuthor = $("#f-author");
  var fType = $("#f-type");
  var fPeer = $("#f-peer");
  var fPreprint = $("#f-preprint");
  var fBest = $("#f-best");
  var fSort = $("#f-sort");
  var resetAll = $("#reset-all");
  var groupsEl = $("#year-groups");
  var emptyEl = $("#empty-state");
  var countEl = $("#result-count");
  var activeTags = $("#active-tags");
  var resultsEl = $("#results");
  var toastEl = $("#toast");

  var TYPE_LABEL = {
    journal: "Article",
    conference: "Conference",
    preprint: "Preprint",
    chapter: "Chapter",
  };

  // ── Toast ─────────────────────────────────
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function authorList(authors) {
    return authors
      .map(function (a) {
        var isMember = MEMBERS.indexOf(a) !== -1;
        return isMember ? '<span class="me">' + esc(a) + "</span>" : esc(a);
      })
      .join(", ");
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ── BibTeX + citation generation ──────────
  function bibtex(p) {
    var entryType =
      p.type === "conference" ? "inproceedings" : p.type === "chapter" ? "incollection" : "article";
    var fields = [
      ["author", p.authors.join(" and ")],
      ["title", p.title],
      [p.type === "conference" ? "booktitle" : "journal", p.venue],
      ["year", String(p.year)],
    ];
    if (p.volume) fields.push(["volume", p.volume]);
    if (p.pages) fields.push(["pages", p.pages]);
    fields.push(["doi", p.doi]);
    var lines = fields.map(function (f) {
      return "  " + f[0] + " = {" + f[1] + "}";
    });
    return "@" + entryType + "{" + p.id + ",\n" + lines.join(",\n") + "\n}";
  }

  function citation(p) {
    var auth = p.authors
      .map(function (a, i) {
        return i === p.authors.length - 1 && p.authors.length > 1 ? "& " + a : a;
      })
      .join(", ");
    var s = auth + " (" + p.year + "). " + p.title + ". ";
    s += p.venue;
    if (p.volume) s += ", " + p.volume;
    if (p.pages) s += ", " + p.pages;
    s += ". https://doi.org/" + p.doi;
    return s;
  }

  function copy(text, msg) {
    var done = function () { toast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy.bind(null, text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  // ── Populate filter selects ───────────────
  function uniqueSorted(arr) {
    return arr.filter(function (v, i) { return arr.indexOf(v) === i; });
  }
  function populateSelects() {
    var years = uniqueSorted(PUBS.map(function (p) { return p.year; })).sort(function (a, b) { return b - a; });
    years.forEach(function (y) { fYear.appendChild(opt(y, y)); });

    var topics = uniqueSorted(PUBS.map(function (p) { return p.topic; })).sort();
    topics.forEach(function (t) { fTopic.appendChild(opt(t, t)); });

    var authors = [];
    PUBS.forEach(function (p) { p.authors.forEach(function (a) { authors.push(a); }); });
    uniqueSorted(authors)
      .sort()
      .forEach(function (a) { fAuthor.appendChild(opt(a, a)); });
  }
  function opt(value, label) {
    var o = document.createElement("option");
    o.value = value;
    o.textContent = label;
    return o;
  }

  // ── Filtering ─────────────────────────────
  function getState() {
    return {
      q: search.value.trim().toLowerCase(),
      year: fYear.value,
      topic: fTopic.value,
      author: fAuthor.value,
      type: fType.value,
      peer: fPeer.checked,
      preprint: fPreprint.checked,
      best: fBest.checked,
      sort: fSort.value,
    };
  }

  function matches(p, st) {
    if (st.year && String(p.year) !== st.year) return false;
    if (st.topic && p.topic !== st.topic) return false;
    if (st.author && p.authors.indexOf(st.author) === -1) return false;
    if (st.type && p.type !== st.type) return false;
    if (st.peer && !p.peer) return false;
    if (st.preprint && p.type !== "preprint") return false;
    if (st.best && !p.award) return false;
    if (st.q) {
      var hay = (
        p.title +
        " " +
        p.authors.join(" ") +
        " " +
        p.venue +
        " " +
        p.topic +
        " " +
        p.doi
      ).toLowerCase();
      if (hay.indexOf(st.q) === -1) return false;
    }
    return true;
  }

  function highlight(text, q) {
    if (!q) return esc(text);
    var idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return esc(text);
    return esc(text.slice(0, idx)) + "<mark>" + esc(text.slice(idx, idx + q.length)) + "</mark>" + highlight(text.slice(idx + q.length), q);
  }

  var ICONS = {
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    doi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
    bib: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    cite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3-1 5-3 5-7V5H3v9h4M14 21c3-1 5-3 5-7V5h-5v9h4"/></svg>',
  };

  function pubHTML(p, num, q) {
    var badges = "";
    if (p.peer) badges += '<span class="badge peer">Peer-reviewed</span>';
    if (p.type === "preprint") badges += '<span class="badge preprint">Preprint</span>';
    if (p.award) badges += '<span class="badge award">' + esc(p.award) + "</span>";
    if (p.oa) badges += '<span class="badge oa">Open access</span>';
    badges += '<span class="badge topic">' + esc(p.topic) + "</span>";

    var venue = "<em>" + highlight(p.venue, q) + "</em>";
    if (p.volume) venue += ' <span class="mono">' + esc(p.volume) + "</span>";
    if (p.pages) venue += ', <span class="mono">' + esc(p.pages) + "</span>";
    venue += " (" + p.year + ").";

    var links = "";
    if (p.hasPdf) links += '<a class="pub-link" href="#" data-act="pdf" data-id="' + p.id + '">' + ICONS.pdf + "PDF</a>";
    links += '<a class="pub-link" href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">' + ICONS.doi + "DOI</a>";
    if (p.hasCode) links += '<a class="pub-link" href="#" data-act="code" data-id="' + p.id + '">' + ICONS.code + "Code</a>";
    links += '<button class="pub-link" type="button" data-act="bib" data-id="' + p.id + '">' + ICONS.bib + "BibTeX</button>";
    links += '<button class="pub-link cite" type="button" data-act="cite" data-id="' + p.id + '">' + ICONS.cite + "Cite</button>";

    return (
      '<li class="pub">' +
      '<div class="pub-num">[' + num + ']<span class="pub-type">' + TYPE_LABEL[p.type] + "</span></div>" +
      '<div class="pub-body">' +
      '<h3 class="pub-title">' + highlight(p.title, q) + "</h3>" +
      '<p class="pub-authors">' + authorList(p.authors) + "</p>" +
      '<p class="pub-venue">' + venue + "</p>" +
      '<div class="badges">' + badges + "</div>" +
      '<div class="pub-links">' + links +
      '<span class="pub-cited"><strong>' + p.cited + "</strong> citations</span>" +
      "</div>" +
      "</div>" +
      "</li>"
    );
  }

  function render() {
    var st = getState();
    searchClear.hidden = !search.value;

    var filtered = PUBS.filter(function (p) { return matches(p, st); });

    // sort
    filtered.sort(function (a, b) {
      if (st.sort === "cited") return b.cited - a.cited;
      if (st.sort === "oldest") return a.year - b.year || a.title.localeCompare(b.title);
      return b.year - a.year || a.title.localeCompare(b.title); // newest
    });

    renderTags(st);
    renderCount(filtered.length, st);

    if (!filtered.length) {
      groupsEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    var num = 1;
    var html;
    if (st.sort === "cited") {
      // flat list, no year grouping
      html =
        '<li class="year-group"><div class="year-head"><h2>By citations</h2>' +
        '<span class="year-tally">most cited first</span></div><ol class="pubs">';
      filtered.forEach(function (p) { html += pubHTML(p, num++, st.q); });
      html += "</ol></li>";
    } else {
      // group by year
      var order = [];
      var byYear = {};
      filtered.forEach(function (p) {
        if (!byYear[p.year]) { byYear[p.year] = []; order.push(p.year); }
        byYear[p.year].push(p);
      });
      html = order
        .map(function (y) {
          var items = byYear[y];
          var rows = items.map(function (p) { return pubHTML(p, num++, st.q); }).join("");
          return (
            '<li class="year-group"><div class="year-head"><h2>' + y + "</h2>" +
            '<span class="year-tally">' + items.length + (items.length === 1 ? " publication" : " publications") + "</span></div>" +
            '<ol class="pubs">' + rows + "</ol></li>"
          );
        })
        .join("");
    }
    groupsEl.innerHTML = html;
  }

  function renderCount(n, st) {
    var active = countActive(st);
    var base = "<strong>" + n + "</strong> of " + PUBS.length + " publication" + (PUBS.length === 1 ? "" : "s");
    countEl.innerHTML = active ? base + " · " + active + " filter" + (active === 1 ? "" : "s") + " active" : base;
  }

  function countActive(st) {
    var n = 0;
    if (st.q) n++;
    if (st.year) n++;
    if (st.topic) n++;
    if (st.author) n++;
    if (st.type) n++;
    if (st.peer) n++;
    if (st.preprint) n++;
    if (st.best) n++;
    return n;
  }

  function renderTags(st) {
    var tags = [];
    if (st.q) tags.push(["q", '"' + st.q + '"']);
    if (st.year) tags.push(["year", "Year: " + st.year]);
    if (st.topic) tags.push(["topic", st.topic]);
    if (st.author) tags.push(["author", st.author]);
    if (st.type) tags.push(["type", TYPE_LABEL[st.type]]);
    if (st.peer) tags.push(["peer", "Peer-reviewed"]);
    if (st.preprint) tags.push(["preprint", "Preprints only"]);
    if (st.best) tags.push(["best", "Award"]);

    activeTags.innerHTML = tags
      .map(function (t) {
        return '<span class="tag">' + esc(t[1]) + '<button type="button" data-clear="' + t[0] + '" aria-label="Remove filter ' + esc(t[1]) + '">×</button></span>';
      })
      .join("");
  }

  function clearOne(key) {
    switch (key) {
      case "q": search.value = ""; break;
      case "year": fYear.value = ""; break;
      case "topic": fTopic.value = ""; break;
      case "author": fAuthor.value = ""; break;
      case "type": fType.value = ""; break;
      case "peer": fPeer.checked = false; break;
      case "preprint": fPreprint.checked = false; break;
      case "best": fBest.checked = false; break;
    }
  }

  function resetFilters() {
    search.value = "";
    fYear.value = "";
    fTopic.value = "";
    fAuthor.value = "";
    fType.value = "";
    fPeer.checked = false;
    fPreprint.checked = false;
    fBest.checked = false;
    fSort.value = "newest";
  }

  // ── Events ────────────────────────────────
  [search].forEach(function (el) { el.addEventListener("input", render); });
  [fYear, fTopic, fAuthor, fType, fSort].forEach(function (el) { el.addEventListener("change", render); });
  [fPeer, fPreprint, fBest].forEach(function (el) { el.addEventListener("change", render); });

  searchClear.addEventListener("click", function () {
    search.value = "";
    search.focus();
    render();
  });

  resetAll.addEventListener("click", function () {
    resetFilters();
    render();
    toast("Filters reset");
  });

  activeTags.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-clear]");
    if (!btn) return;
    clearOne(btn.getAttribute("data-clear"));
    render();
  });

  // delegated link/button actions inside results
  resultsEl.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act");
    var p = PUBS.filter(function (x) { return x.id === el.getAttribute("data-id"); })[0];
    if (!p) return;

    if (act === "bib") {
      e.preventDefault();
      copy(bibtex(p), "BibTeX copied to clipboard");
    } else if (act === "cite") {
      e.preventDefault();
      copy(citation(p), "Citation copied to clipboard");
    } else if (act === "pdf") {
      e.preventDefault();
      toast("PDF (demo): " + p.id + ".pdf — fictional document");
    } else if (act === "code") {
      e.preventDefault();
      toast("Repository (demo): github.com/csm-lab/" + p.id);
    }
  });

  // ── Metrics ───────────────────────────────
  function fillMetrics() {
    var total = PUBS.length;
    var peer = PUBS.filter(function (p) { return p.peer; }).length;
    var pre = PUBS.filter(function (p) { return p.type === "preprint"; }).length;
    var citations = PUBS.reduce(function (s, p) { return s + p.cited; }, 0);
    var cites = PUBS.map(function (p) { return p.cited; }).sort(function (a, b) { return b - a; });
    var h = 0;
    for (var i = 0; i < cites.length; i++) { if (cites[i] >= i + 1) h = i + 1; }
    set("total", total);
    set("peer", peer);
    set("preprint", pre);
    set("citations", citations);
    set("hindex", h);
  }
  function set(name, val) {
    var el = document.querySelector('[data-metric="' + name + '"]');
    if (el) el.textContent = val;
  }

  // ── Init ──────────────────────────────────
  populateSelects();
  fillMetrics();
  render();
})();
