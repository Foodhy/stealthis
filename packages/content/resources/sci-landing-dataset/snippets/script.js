(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- featured datasets data ---------- */
  var DATASETS = [
    {
      cat: "Climate",
      title: "Global Sea Surface Temperature, daily (1982–2026)",
      doi: "10.4521/nodi.sst.v7",
      fmt: "NetCDF",
      size: "412 GB",
      lic: "CC0-1.0",
      upd: "2026-06-11"
    },
    {
      cat: "Genomics",
      title: "Reference Pangenome Assembly — Cohort B (n=1,140)",
      doi: "10.4521/nodi.png.0042",
      fmt: "FASTA",
      size: "2.7 TB",
      lic: "ODbL-1.0",
      upd: "2026-05-29"
    },
    {
      cat: "Economics",
      title: "Consumer Price Index, all urban items (monthly)",
      doi: "10.4521/nodi.cpi.m12",
      fmt: "CSV",
      size: "8.4 MB",
      lic: "CC-BY-4.0",
      upd: "2026-06-13"
    },
    {
      cat: "Astronomy",
      title: "Transiting Exoplanet Photometry — Sector 91",
      doi: "10.4521/nodi.tep.s91",
      fmt: "Parquet",
      size: "61 GB",
      lic: "CC0-1.0",
      upd: "2026-06-02"
    },
    {
      cat: "Climate",
      title: "Arctic Sea-Ice Extent, gridded passive microwave",
      doi: "10.4521/nodi.ice.g25",
      fmt: "GeoTIFF",
      size: "94 GB",
      lic: "CC-BY-4.0",
      upd: "2026-06-08"
    },
    {
      cat: "Economics",
      title: "Regional Labor Market Flows, quarterly panel",
      doi: "10.4521/nodi.lmf.q2",
      fmt: "JSON",
      size: "320 MB",
      lic: "CC-BY-4.0",
      upd: "2026-04-30"
    }
  ];

  var dbody = document.getElementById("dbody");
  var tableFoot = document.getElementById("tableFoot");

  function rowHTML(d) {
    return (
      '<tr data-cat="' + d.cat + '">' +
      '<td><div class="ds-name">' +
        '<span class="ds-title"><span class="cat-tag ' + d.cat + '">' + d.cat + "</span>" + escapeHtml(d.title) + "</span>" +
        '<span class="ds-doi">doi:' + d.doi + "</span>" +
      "</div></td>" +
      '<td><span class="fmt-badge">' + d.fmt + "</span></td>" +
      '<td class="num">' + d.size + "</td>" +
      '<td><span class="lic">' + d.lic + "</span></td>" +
      '<td><span class="upd">' + d.upd + "</span></td>" +
      '<td class="ar"><button class="dl-btn" data-title="' + escapeAttr(d.title) + '">' +
        '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>' +
        "Download</button></td>" +
      "</tr>"
    );
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  var currentFilter = "all";

  function renderTable() {
    var rows = DATASETS.filter(function (d) {
      return currentFilter === "all" || d.cat === currentFilter;
    });
    dbody.innerHTML = rows.map(rowHTML).join("");
    var label =
      currentFilter === "all"
        ? "Showing " + rows.length + " of 4,217 datasets."
        : "Showing " + rows.length + " " + currentFilter + " dataset" + (rows.length === 1 ? "" : "s") + " of 4,217 total.";
    tableFoot.textContent = label;
  }

  renderTable();

  /* download (event delegation) */
  dbody.addEventListener("click", function (e) {
    var btn = e.target.closest(".dl-btn");
    if (!btn) return;
    toast("Preparing download · " + btn.getAttribute("data-title"));
  });

  /* filter buttons */
  var fbtns = document.querySelectorAll(".fbtn");
  fbtns.forEach(function (b) {
    b.addEventListener("click", function () {
      fbtns.forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      currentFilter = b.getAttribute("data-filter");
      renderTable();
    });
  });

  /* ---------- search ---------- */
  var form = document.getElementById("searchForm");
  var input = document.getElementById("searchInput");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) { toast("Enter a keyword, agency, DOI, or format"); input.focus(); return; }
    toast("Searching catalog for “" + q + "” …");
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      input.value = chip.getAttribute("data-q");
      input.focus();
      toast("Searching catalog for “" + input.value + "” …");
    });
  });

  /* ---------- category tiles ---------- */
  document.querySelectorAll(".tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      var cat = tile.getAttribute("data-cat");
      var match = document.querySelector('.fbtn[data-filter="' + cat + '"]');
      if (match) match.click();
      document.getElementById("featured").scrollIntoView({ behavior: "smooth", block: "start" });
      toast("Filtered featured datasets to " + cat);
    });
  });

  /* ---------- API snippet tabs ---------- */
  var SNIPPETS = {
    curl:
      '<span class="tok-com"># Fetch the latest CPI release as JSON</span>\n' +
      '<span class="tok-cmd">curl</span> <span class="tok-flag">-sH</span> <span class="tok-str">"Accept: application/json"</span> \\\n' +
      '  <span class="tok-url">https://api.opendata.gov/v3/datasets/nodi.cpi.m12/data</span> \\\n' +
      '  <span class="tok-flag">--compressed</span> <span class="tok-flag">-o</span> <span class="tok-str">cpi.json</span>',
    python:
      '<span class="tok-kw">import</span> requests\n\n' +
      "r = requests.get(\n" +
      '  <span class="tok-str">"https://api.opendata.gov/v3/datasets/nodi.cpi.m12/data"</span>,\n' +
      '  headers={<span class="tok-str">"Accept"</span>: <span class="tok-str">"application/json"</span>},\n' +
      ")\n" +
      "data = r.json()\n" +
      '<span class="tok-cmd">print</span>(data[<span class="tok-str">"records"</span>][<span class="tok-str">0</span>])',
    js:
      '<span class="tok-kw">const</span> res = <span class="tok-kw">await</span> <span class="tok-cmd">fetch</span>(\n' +
      '  <span class="tok-str">"https://api.opendata.gov/v3/datasets/nodi.cpi.m12/data"</span>,\n' +
      '  { headers: { <span class="tok-str">"Accept"</span>: <span class="tok-str">"application/json"</span> } }\n' +
      ");\n" +
      '<span class="tok-kw">const</span> data = <span class="tok-kw">await</span> res.json();\n' +
      "console.<span class=\"tok-cmd\">log</span>(data.records[<span class=\"tok-str\">0</span>]);"
  };

  var PLAIN = {
    curl:
      '# Fetch the latest CPI release as JSON\n' +
      'curl -sH "Accept: application/json" \\\n' +
      "  https://api.opendata.gov/v3/datasets/nodi.cpi.m12/data \\\n" +
      "  --compressed -o cpi.json",
    python:
      "import requests\n\n" +
      "r = requests.get(\n" +
      '  "https://api.opendata.gov/v3/datasets/nodi.cpi.m12/data",\n' +
      '  headers={"Accept": "application/json"},\n' +
      ")\n" +
      "data = r.json()\n" +
      'print(data["records"][0])',
    js:
      'const res = await fetch(\n' +
      '  "https://api.opendata.gov/v3/datasets/nodi.cpi.m12/data",\n' +
      '  { headers: { "Accept": "application/json" } }\n' +
      ");\n" +
      "const data = await res.json();\n" +
      "console.log(data.records[0]);"
  };

  var codeBlock = document.getElementById("codeBlock");
  var currentLang = "curl";

  function setLang(lang) {
    currentLang = lang;
    codeBlock.innerHTML = SNIPPETS[lang];
  }
  setLang("curl");

  document.querySelectorAll(".atab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".atab").forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      setLang(tab.getAttribute("data-lang"));
    });
  });

  /* copy snippet */
  var copyBtn = document.getElementById("copyBtn");
  copyBtn.addEventListener("click", function () {
    var text = PLAIN[currentLang];
    var done = function () {
      copyBtn.classList.add("done");
      var span = copyBtn.querySelector("span");
      var prev = span.textContent;
      span.textContent = "Copied";
      toast("Snippet copied to clipboard");
      setTimeout(function () {
        copyBtn.classList.remove("done");
        span.textContent = prev;
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (err) {
        toast("Copy failed — select manually");
      }
    }
  });

  /* ---------- sign in ---------- */
  document.getElementById("signin").addEventListener("click", function () {
    toast("Sign-in is disabled in this demo");
  });

  /* ---------- animated counters ---------- */
  function formatNum(n, fmt) {
    if (fmt === "dec") return n.toFixed(1);
    return Math.round(n).toLocaleString("en-US");
  }

  function animateCounter(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var fmt = el.getAttribute("data-fmt") || "int";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1300;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(to * eased, fmt) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(to, fmt) + suffix;
    }
    requestAnimationFrame(step);
  }

  var statNums = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach(function (el) { io.observe(el); });
  } else {
    statNums.forEach(animateCounter);
  }
})();
