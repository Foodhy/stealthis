(function () {
  "use strict";

  // ---- Period-based dataset (re-bases the whole dashboard) ----
  var DATA = {
    jun: {
      label: "June 2026",
      kpis: { matters: "68", hours: "1,284", revenue: "$842,500", leads: "37" },
      bars: [["M. Pierce", 176], ["D. Okafor", 158], ["R. Castellano", 142], ["A. Velázquez", 128], ["J. Whitfield", 110], ["H. Tanaka", 94]],
      leads: [["Referrals", 15], ["Organic search", 10], ["Directory listing", 7], ["Paid ads", 5]]
    },
    may: {
      label: "May 2026",
      kpis: { matters: "62", hours: "1,232", revenue: "$759,000", leads: "40" },
      bars: [["M. Pierce", 168], ["D. Okafor", 151], ["R. Castellano", 133], ["A. Velázquez", 121], ["J. Whitfield", 118], ["H. Tanaka", 88]],
      leads: [["Referrals", 14], ["Organic search", 12], ["Directory listing", 8], ["Paid ads", 6]]
    },
    apr: {
      label: "April 2026",
      kpis: { matters: "59", hours: "1,176", revenue: "$701,200", leads: "33" },
      bars: [["M. Pierce", 159], ["D. Okafor", 144], ["R. Castellano", 127], ["A. Velázquez", 110], ["J. Whitfield", 102], ["H. Tanaka", 81]],
      leads: [["Referrals", 11], ["Organic search", 9], ["Directory listing", 8], ["Paid ads", 5]]
    }
  };

  var select = document.getElementById("period");
  var periodLabel = document.getElementById("periodLabel");
  var barsEl = document.getElementById("bars");
  var leadsEl = document.getElementById("leads");

  function fmtTime() {
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    return hh + ":" + mm;
  }

  function render(key) {
    var d = DATA[key];
    if (!d) return;

    // KPIs
    Object.keys(d.kpis).forEach(function (k) {
      var el = document.querySelector('[data-kpi="' + k + '"]');
      if (el) el.textContent = d.kpis[k];
    });

    // Bar chart — scale relative to the top performer
    var maxBar = Math.max.apply(null, d.bars.map(function (b) { return b[1]; }));
    barsEl.innerHTML = d.bars.map(function (b) {
      var pct = Math.round((b[1] / maxBar) * 100);
      return '<li class="bar-row">' +
        '<span class="bar-name">' + b[0] + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="--pct:' + pct + '%">' +
        '<span class="bar-val">' + b[1] + '</span></span></span></li>';
    }).join("");

    // Leads by source
    var totalLeads = d.leads.reduce(function (s, l) { return s + l[1]; }, 0);
    document.querySelector(".leads-panel .panel-note").textContent = totalLeads + " new leads";
    leadsEl.innerHTML = d.leads.map(function (l) {
      var pct = Math.round((l[1] / totalLeads) * 100);
      return '<li class="lead-row">' +
        '<span class="lead-top"><span class="lead-name">' + l[0] + '</span>' +
        '<span class="lead-pct">' + pct + '%</span></span>' +
        '<span class="lead-track"><span class="lead-fill" style="--pct:' + pct + '%"></span></span>' +
        '<span class="lead-count">' + l[1] + ' leads</span></li>';
    }).join("");

    periodLabel.textContent = "Performance for " + d.label + ", updated 22 Jun 2026 · " + fmtTime();
  }

  if (select) {
    select.addEventListener("change", function () { render(select.value); });
    render(select.value);
  }

  // ---- Sortable matters table ----
  var table = document.getElementById("matters");
  if (table) {
    var tbody = table.querySelector("tbody");
    var headers = table.querySelectorAll("th[data-sort]");

    headers.forEach(function (th) {
      var btn = th.querySelector("button");
      btn.addEventListener("click", function () {
        var index = Array.prototype.indexOf.call(th.parentNode.children, th);
        var isNum = th.dataset.type === "num";
        var current = th.getAttribute("aria-sort");
        var asc = current !== "ascending";

        // reset all headers
        headers.forEach(function (h) { h.setAttribute("aria-sort", "none"); });
        th.setAttribute("aria-sort", asc ? "ascending" : "descending");

        var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
        rows.sort(function (a, b) {
          var ca = a.children[index];
          var cb = b.children[index];
          var va, vb;
          if (isNum) {
            va = parseFloat(ca.dataset.value || "0");
            vb = parseFloat(cb.dataset.value || "0");
          } else {
            va = ca.textContent.trim().toLowerCase();
            vb = cb.textContent.trim().toLowerCase();
          }
          if (va < vb) return asc ? -1 : 1;
          if (va > vb) return asc ? 1 : -1;
          return 0;
        });

        rows.forEach(function (r) { tbody.appendChild(r); });
      });
    });
  }
})();
