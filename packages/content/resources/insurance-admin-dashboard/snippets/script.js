(function () {
  "use strict";

  /* -------- Premium-by-month bar chart -------- */
  var premiums = [
    { month: "Jan", value: 9.8 },
    { month: "Feb", value: 10.4 },
    { month: "Mar", value: 11.1 },
    { month: "Apr", value: 12.0 },
    { month: "May", value: 11.6 },
    { month: "Jun", value: 13.2 },
    { month: "Jul", value: 13.9 },
    { month: "Aug", value: 14.7 }
  ];

  var barsHost = document.getElementById("chartBars");
  if (barsHost) {
    var max = premiums.reduce(function (m, p) { return Math.max(m, p.value); }, 0);
    premiums.forEach(function (p) {
      var col = document.createElement("div");
      col.className = "bar";

      var val = document.createElement("span");
      val.className = "bar__val";
      val.textContent = "$" + p.value.toFixed(1) + "M";

      var fill = document.createElement("div");
      fill.className = "bar__fill";
      fill.setAttribute("title", p.month + ": $" + p.value.toFixed(1) + "M");

      var label = document.createElement("span");
      label.className = "bar__label";
      label.textContent = p.month;

      col.appendChild(val);
      col.appendChild(fill);
      col.appendChild(label);
      barsHost.appendChild(col);

      // animate after paint
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.height = Math.round((p.value / max) * 100) + "%";
        });
      });
    });
  }

  /* -------- Claims-by-status breakdown -------- */
  var claims = [
    { name: "Open", count: 1284, color: "#2563eb" },
    { name: "In review", count: 642, color: "#d97706" },
    { name: "Approved", count: 798, color: "#15a06b" },
    { name: "Denied", count: 216, color: "#dc2626" }
  ];

  var bdHost = document.getElementById("breakdown");
  if (bdHost) {
    var total = claims.reduce(function (s, c) { return s + c.count; }, 0);
    claims.forEach(function (c) {
      var pct = Math.round((c.count / total) * 100);

      var li = document.createElement("li");

      var top = document.createElement("div");
      top.className = "bd__top";

      var name = document.createElement("span");
      name.className = "bd__name";
      var dot = document.createElement("span");
      dot.className = "bd__dot";
      dot.style.background = c.color;
      name.appendChild(dot);
      name.appendChild(document.createTextNode(c.name));

      var num = document.createElement("span");
      num.className = "bd__count";
      num.textContent = c.count.toLocaleString();
      var pctEl = document.createElement("span");
      pctEl.className = "bd__pct";
      pctEl.textContent = pct + "%";
      num.appendChild(pctEl);

      top.appendChild(name);
      top.appendChild(num);

      var track = document.createElement("div");
      track.className = "bd__track";
      var fill = document.createElement("div");
      fill.className = "bd__fill";
      fill.style.background = c.color;
      track.appendChild(fill);

      li.appendChild(top);
      li.appendChild(track);
      bdHost.appendChild(li);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = pct + "%";
        });
      });
    });
  }

  /* -------- Period segmented control -------- */
  var segs = document.querySelectorAll("[data-period]");
  segs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segs.forEach(function (b) {
        b.classList.remove("is-active");
        b.removeAttribute("aria-pressed");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
    });
  });

  /* -------- Live policy search -------- */
  var input = document.getElementById("policySearch");
  var body = document.getElementById("policyBody");
  var countEl = document.getElementById("rowCount");
  var empty = document.getElementById("emptyState");

  if (input && body) {
    var rows = Array.prototype.slice.call(body.querySelectorAll("tr"));
    var totalRows = rows.length;

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var visible = 0;

      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        var show = q === "" || text.indexOf(q) !== -1;
        row.style.display = show ? "" : "none";
        if (show) visible++;
      });

      if (countEl) countEl.textContent = visible;
      if (empty) empty.hidden = visible !== 0;

      var label = document.querySelector(".count");
      if (label) {
        label.innerHTML = '<span id="rowCount">' + visible + "</span> of " + totalRows + " policies";
        countEl = document.getElementById("rowCount");
      }
    });
  }
})();
