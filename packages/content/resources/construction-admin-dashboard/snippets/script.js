(function () {
  "use strict";

  /* ---------- animated KPI counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var dur = 900;
    var start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = prefix + val.toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll(".kpi__value[data-count]").forEach(animateCount);

  /* ---------- revenue bar chart ---------- */
  var revenue = [
    { m: "Jan", v: 312400 },
    { m: "Feb", v: 358900 },
    { m: "Mar", v: 401200 },
    { m: "Apr", v: 376500 },
    { m: "May", v: 437200 },
    { m: "Jun", v: 487300 }
  ];
  var max = Math.max.apply(null, revenue.map(function (d) { return d.v; }));
  var chart = document.getElementById("chart");
  var tooltip = document.getElementById("tooltip");

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  if (chart) {
    revenue.forEach(function (d) {
      var bar = document.createElement("div");
      bar.className = "bar";
      bar.tabIndex = 0;
      bar.setAttribute("role", "listitem");
      bar.setAttribute("aria-label", d.m + " 2026: " + money(d.v));

      var fill = document.createElement("div");
      fill.className = "bar__fill";

      var label = document.createElement("span");
      label.className = "bar__label";
      label.textContent = d.m;

      bar.appendChild(fill);
      bar.appendChild(label);
      chart.appendChild(bar);

      // animate height after paint
      requestAnimationFrame(function () {
        fill.style.height = Math.round((d.v / max) * 100) + "%";
      });

      function showTip() {
        if (!tooltip) return;
        tooltip.hidden = false;
        tooltip.textContent = d.m + " — " + money(d.v);
        var br = bar.getBoundingClientRect();
        var cr = chart.parentElement.getBoundingClientRect();
        tooltip.style.left = br.left - cr.left + br.width / 2 + "px";
        tooltip.style.top = br.top - cr.top - 6 + "px";
      }
      function hideTip() {
        if (tooltip) tooltip.hidden = true;
      }
      bar.addEventListener("mouseenter", showTip);
      bar.addEventListener("mousemove", showTip);
      bar.addEventListener("mouseleave", hideTip);
      bar.addEventListener("focus", showTip);
      bar.addEventListener("blur", hideTip);
    });
  }

  /* ---------- recent jobs table ---------- */
  var jobs = [
    { id: "JOB-2241", name: "Maple Ridge Kitchen Remodel", client: "Dana & Paul Whitfield", site: "418 Maple Ridge Dr", value: 84500, crew: "Finish · Crew D", status: "progress" },
    { id: "JOB-2238", name: "Lakeshore Office Build-Out", client: "Northwind Capital LLC", site: "2200 Lakeshore Blvd, Ste 7", value: 312000, crew: "Framing · Crew B", status: "progress" },
    { id: "JOB-2247", name: "Harbor View Deck & Pergola", client: "Renee Alvarado", site: "61 Harbor View Ln", value: 38900, crew: "Sitework · Crew F", status: "scheduled" },
    { id: "JOB-2230", name: "Cedar Hollow Foundation Pour", client: "Cedar Hollow Homes", site: "Lot 14, Cedar Hollow", value: 156400, crew: "Concrete · Crew A", status: "progress" },
    { id: "JOB-2219", name: "Greenway Roof Replacement", client: "Greenway HOA", site: "Bldgs 3–5, Greenway Ct", value: 98700, crew: "Roofing · Crew E", status: "hold" },
    { id: "JOB-2252", name: "Sunset Bistro TI Fit-Out", client: "Sunset Bistro Group", site: "75 Market St, Unit 2", value: 224800, crew: "MEP · Crew C", status: "scheduled" },
    { id: "JOB-2205", name: "Birchwood ADU Garage Conversion", client: "Tomás & Lena Ortiz", site: "33 Birchwood Ave", value: 67200, crew: "Finish · Crew D", status: "complete" },
    { id: "JOB-2243", name: "Ironside Warehouse Slab Repair", client: "Ironside Logistics", site: "900 Industrial Pkwy", value: 41300, crew: "Concrete · Crew A", status: "progress" },
    { id: "JOB-2211", name: "Willow Park Bathroom Suite", client: "Karen Boateng", site: "12 Willow Park Rd", value: 29850, crew: "MEP · Crew C", status: "hold" },
    { id: "JOB-2199", name: "Hillcrest Retaining Wall", client: "City of Hillcrest", site: "Hillcrest Trailhead", value: 73600, crew: "Sitework · Crew F", status: "complete" }
  ];

  var labels = {
    progress: "In progress",
    scheduled: "Scheduled",
    hold: "On hold",
    complete: "Complete"
  };

  var body = document.getElementById("jobs-body");
  var empty = document.getElementById("empty");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  function render(filter) {
    var rows = jobs.filter(function (j) {
      return filter === "all" || j.status === filter;
    });
    body.innerHTML = "";
    rows.forEach(function (j) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><span class="job__name">' + j.name + '</span>' +
        '<span class="job__id">' + j.id + "</span></td>" +
        "<td>" + j.client + "</td>" +
        "<td>" + j.site + "</td>" +
        '<td class="num">$' + j.value.toLocaleString("en-US") + "</td>" +
        "<td>" + j.crew + "</td>" +
        '<td><span class="badge badge--' + j.status + '">' + labels[j.status] + "</span></td>";
      body.appendChild(tr);
    });
    if (empty) empty.hidden = rows.length !== 0;
  }

  // counts per filter for the chips
  document.getElementById("cnt-all").textContent = jobs.length;

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      render(chip.getAttribute("data-filter"));
    });
  });

  render("all");
})();
