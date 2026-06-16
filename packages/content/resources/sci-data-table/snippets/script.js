(function () {
  "use strict";

  /**
   * Fictional benchmark dataset. Each numeric field carries a value, an
   * uncertainty (1 SD), the number of significant figures to display, and an
   * optional footnote marker. Data is illustrative only.
   */
  var ROWS = [
    { catalyst: "Au nanoneedles",      loading: [0.42, 0.03, 2, "a"], fe: [91.4, 1.2, 1, "b"], jco: [14.8, 0.6, 1], eta: [690, 12, 0],  stability: [48, 3, 0] },
    { catalyst: "Ag dendrites",        loading: [0.55, 0.04, 2, "a"], fe: [84.2, 2.1, 1, "b"], jco: [11.2, 0.5, 1], eta: [740, 15, 0],  stability: [36, 4, 0] },
    { catalyst: "Ni–N–C single atom",  loading: [0.30, 0.02, 2, "a"], fe: [96.7, 0.8, 1, "b"], jco: [22.5, 0.9, 1], eta: [610, 9,  0],  stability: [120, 6, 0], best: true },
    { catalyst: "Cu oxide-derived",    loading: [0.61, 0.05, 2, "a"], fe: [38.9, 3.4, 1, "b"], jco: [6.4, 0.4, 1],  eta: [820, 22, 0],  stability: [18, 2, 0] },
    { catalyst: "Zn porous foam",      loading: [0.48, 0.03, 2, "a"], fe: [72.6, 2.8, 1, "b"], jco: [9.1, 0.5, 1],  eta: [780, 18, 0],  stability: [29, 3, 0] },
    { catalyst: "Fe–N–C single atom",  loading: [0.27, 0.02, 2, "a"], fe: [89.3, 1.5, 1, "b"], jco: [17.9, 0.7, 1], eta: [660, 11, 0],  stability: [84, 5, 0] },
    { catalyst: "Pd–Cu alloy",         loading: [0.52, 0.04, 2, "a"], fe: [65.1, 2.6, 1, "b"], jco: [13.3, 0.6, 1], eta: [710, 14, 0],  stability: [42, 4, 0] },
    { catalyst: "Sn quantum sheet",    loading: [0.39, 0.03, 2, "a"], fe: [12.7, 1.9, 1, "b"], jco: [3.2, 0.3, 1],  eta: [905, 25, 0],  stability: [22, 3, 0] },
    { catalyst: "Co phthalocyanine",   loading: [0.21, 0.02, 2, "a"], fe: [93.8, 1.1, 1, "b"], jco: [19.4, 0.8, 1], eta: [640, 10, 0],  stability: [66, 5, 0] }
  ];

  var COLUMNS = [
    { key: "catalyst",  type: "text", label: "Catalyst",  fn: "" },
    { key: "loading",   type: "num",  label: "Loading",   fn: "a" },
    { key: "fe",        type: "num",  label: "FE_CO",     fn: "b" },
    { key: "jco",       type: "num",  label: "j_CO",      fn: "" },
    { key: "eta",       type: "num",  label: "eta",       fn: "c" },
    { key: "stability", type: "num",  label: "Stability", fn: "" }
  ];

  var tbody = document.getElementById("tbody");
  var headers = Array.prototype.slice.call(document.querySelectorAll("th.th-sort"));
  var toastEl = document.getElementById("toast");

  var sortState = { key: "fe", dir: "desc" }; // default matches aria-sort on FE column

  /* ---- helpers ---- */

  function fmt(num, decimals) {
    return Number(num).toFixed(decimals);
  }

  function sortValue(row, key, type) {
    if (type === "text") return row[key].toLowerCase();
    return row[key][0];
  }

  function renderCell(field) {
    // field = [value, uncertainty, decimals, footnoteMark?]
    var value = fmt(field[0], field[2]);
    var unc = fmt(field[1], field[2]);
    var mark = field[3] ? '<sup class="fn-mark" title="See footnote ' + field[3] + '">' + field[3] + "</sup>" : "";
    return (
      '<span class="val">' + value +
      ' <span class="unc">&plusmn; ' + unc + "</span></span>" + mark
    );
  }

  function render() {
    var rows = ROWS.slice();
    var key = sortState.key;
    var dir = sortState.dir;
    var type = key === "catalyst" ? "text" : "num";

    rows.sort(function (a, b) {
      var av = sortValue(a, key, type);
      var bv = sortValue(b, key, type);
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });

    tbody.innerHTML = rows
      .map(function (r) {
        var badge = r.best ? '<span class="best-badge" title="Best result">best</span>' : "";
        return (
          '<tr class="' + (r.best ? "is-best" : "") + '">' +
          '<td class="col-catalyst">' + r.catalyst + badge + "</td>" +
          '<td class="num">' + renderCell(r.loading) + "</td>" +
          '<td class="num">' + renderCell(r.fe) + "</td>" +
          '<td class="num">' + renderCell(r.jco) + "</td>" +
          '<td class="num">' + renderCell(r.eta) + "</td>" +
          '<td class="num">' + renderCell(r.stability) + "</td>" +
          "</tr>"
        );
      })
      .join("");

    headers.forEach(function (th) {
      var k = th.getAttribute("data-key");
      if (k === key) {
        th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
      } else {
        th.setAttribute("aria-sort", "none");
      }
    });
  }

  /* ---- sorting interaction ---- */

  headers.forEach(function (th) {
    var btn = th.querySelector(".sort-btn");
    btn.addEventListener("click", function () {
      var key = th.getAttribute("data-key");
      if (sortState.key === key) {
        sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
      } else {
        sortState.key = key;
        // numbers default to descending (best-first), text to ascending
        sortState.dir = th.getAttribute("data-type") === "num" ? "desc" : "asc";
      }
      render();
      var col = COLUMNS.filter(function (c) { return c.key === key; })[0];
      toast("Sorted by " + (col ? col.label.replace(/_/g, "") : key) + " (" + sortState.dir + ")");
    });
  });

  /* ---- CSV export ---- */

  function buildCSV() {
    var head = [
      "Catalyst",
      "Loading_mg_cm-2",
      "Loading_SD",
      "FE_CO_%",
      "FE_CO_SD",
      "jCO_mA_cm-2",
      "jCO_SD",
      "Overpotential_mV",
      "Overpotential_SD",
      "Stability_h",
      "Stability_SD"
    ];

    var rows = ROWS.slice().sort(function (a, b) {
      var key = sortState.key;
      var type = key === "catalyst" ? "text" : "num";
      var av = sortValue(a, key, type);
      var bv = sortValue(b, key, type);
      if (av < bv) return sortState.dir === "asc" ? -1 : 1;
      if (av > bv) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });

    function esc(s) {
      s = String(s);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }

    var lines = [head.join(",")];
    rows.forEach(function (r) {
      lines.push(
        [
          esc(r.catalyst),
          fmt(r.loading[0], r.loading[2]), fmt(r.loading[1], r.loading[2]),
          fmt(r.fe[0], r.fe[2]),           fmt(r.fe[1], r.fe[2]),
          fmt(r.jco[0], r.jco[2]),         fmt(r.jco[1], r.jco[2]),
          fmt(r.eta[0], r.eta[2]),         fmt(r.eta[1], r.eta[2]),
          fmt(r.stability[0], r.stability[2]), fmt(r.stability[1], r.stability[2])
        ].join(",")
      );
    });

    return lines.join("\n");
  }

  var csvBtn = document.getElementById("csv-btn");
  csvBtn.addEventListener("click", function () {
    var csv = buildCSV();
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "co2rr_benchmark_table1.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Downloaded Table 1 as CSV (" + ROWS.length + " rows)");
  });

  /* ---- toast ---- */

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  render();
})();
