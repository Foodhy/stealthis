(() => {
  "use strict";

  /* ===== DOM refs ===== */
  const sidebar = document.getElementById("sidebar");
  const mainWrapper = document.getElementById("mainWrapper");
  const collapseBtn = document.getElementById("collapseBtn");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const overlay = document.getElementById("sidebarOverlay");

  /* ===== Sidebar toggle (desktop collapse) ===== */
  collapseBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  /* ===== Hamburger (mobile) ===== */
  function openMobileSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
  }

  function closeMobileSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
  }

  hamburgerBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });

  overlay.addEventListener("click", closeMobileSidebar);

  /* ===== Sidebar nav active state ===== */
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".sidebar-link").forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      closeMobileSidebar();
    });
  });

  /* ===== KPI count-up animation ===== */
  function animateKPI() {
    const cards = document.querySelectorAll(".kpi-card");
    const duration = 1200;

    cards.forEach((card) => {
      const target = parseFloat(card.dataset.target);
      const prefix = card.dataset.prefix || "";
      const suffix = card.dataset.suffix || "";
      const valueEl = card.querySelector(".kpi-value");
      const isFloat = target % 1 !== 0;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (isFloat) {
          valueEl.textContent = prefix + current.toFixed(1) + suffix;
        } else {
          valueEl.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  animateKPI();

  /* ===== Shared tooltip ===== */
  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  document.body.appendChild(tooltip);

  function showTooltip(x, y, text) {
    tooltip.textContent = text;
    tooltip.classList.add("visible");
    tooltip.style.left = x + 12 + "px";
    tooltip.style.top = y - 28 + "px";
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  /* ===== Utility: parse canvas data attrs ===== */
  function getCanvasData(id) {
    const canvas = document.getElementById(id);
    const values = canvas.dataset.values.split(",").map(Number);
    const labels = canvas.dataset.labels.split(",");
    const colors = canvas.dataset.colors ? canvas.dataset.colors.split(",") : [];
    return { canvas, values, labels, colors };
  }

  /* ===== LINE CHART ===== */
  function drawLineChart() {
    const { canvas, values, labels } = getCanvasData("lineChart");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padTop = 20;
    const padBottom = 40;
    const padLeft = 50;
    const padRight = 20;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const maxVal = Math.max(...values) * 1.1;
    const minVal = 0;

    function xPos(i) {
      return padLeft + (i / (values.length - 1)) * chartW;
    }
    function yPos(v) {
      return padTop + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
    }

    /* Grid lines */
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const val = maxVal - (maxVal / gridLines) * i;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("$" + (val / 1000).toFixed(0) + "k", padLeft - 8, y + 4);
    }

    /* X labels */
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    labels.forEach((label, i) => {
      ctx.fillText(label, xPos(i), h - 10);
    });

    /* Gradient fill */
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.25)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.01)");

    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(values[0]));
    values.forEach((v, i) => {
      if (i > 0) ctx.lineTo(xPos(i), yPos(v));
    });
    ctx.lineTo(xPos(values.length - 1), padTop + chartH);
    ctx.lineTo(xPos(0), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    /* Line */
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(values[0]));
    values.forEach((v, i) => {
      if (i > 0) ctx.lineTo(xPos(i), yPos(v));
    });
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    /* Dots */
    const dots = [];
    values.forEach((v, i) => {
      const x = xPos(i);
      const y = yPos(v);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      dots.push({ x, y, label: labels[i], value: v });
    });

    /* Hover */
    canvas.addEventListener("mousemove", (e) => {
      const cr = canvas.getBoundingClientRect();
      const mx = e.clientX - cr.left;
      const my = e.clientY - cr.top;
      let found = false;

      dots.forEach((d) => {
        const dist = Math.sqrt((mx - d.x) ** 2 + (my - d.y) ** 2);
        if (dist < 16) {
          showTooltip(e.clientX, e.clientY, d.label + ": $" + d.value.toLocaleString());
          found = true;
        }
      });

      if (!found) hideTooltip();
    });

    canvas.addEventListener("mouseleave", hideTooltip);
  }

  /* ===== BAR CHART ===== */
  function drawBarChart() {
    const { canvas, values, labels, colors } = getCanvasData("barChart");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padTop = 20;
    const padBottom = 50;
    const padLeft = 50;
    const padRight = 20;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const maxVal = Math.max(...values) * 1.15;
    const barWidth = (chartW / values.length) * 0.55;
    const gap = chartW / values.length;

    /* Grid */
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const val = maxVal - (maxVal / gridLines) * i;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("$" + (val / 1000).toFixed(1) + "k", padLeft - 8, y + 4);
    }

    /* Bars */
    const bars = [];
    values.forEach((v, i) => {
      const x = padLeft + gap * i + (gap - barWidth) / 2;
      const barH = (v / maxVal) * chartH;
      const y = padTop + chartH - barH;

      /* Rounded top */
      const r = Math.min(6, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r);
      ctx.lineTo(x + barWidth, padTop + chartH);
      ctx.lineTo(x, padTop + chartH);
      ctx.closePath();
      ctx.fillStyle = colors[i] || "#6366f1";
      ctx.fill();

      bars.push({
        x,
        y,
        w: barWidth,
        h: barH,
        label: labels[i],
        value: v,
      });

      /* X label */
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], x + barWidth / 2, h - 14);
    });

    /* Hover */
    canvas.addEventListener("mousemove", (e) => {
      const cr = canvas.getBoundingClientRect();
      const mx = e.clientX - cr.left;
      const my = e.clientY - cr.top;
      let found = false;

      bars.forEach((b) => {
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= padTop + chartH) {
          showTooltip(e.clientX, e.clientY, b.label + ": $" + b.value.toLocaleString());
          found = true;
        }
      });

      if (!found) hideTooltip();
    });

    canvas.addEventListener("mouseleave", hideTooltip);
  }

  /* ===== DONUT CHART ===== */
  function drawDonutChart() {
    const { canvas, values, labels, colors } = getCanvasData("donutChart");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(w, h) / 2 - 10;
    const innerR = outerR * 0.6;
    const total = values.reduce((a, b) => a + b, 0);

    const segments = [];
    let startAngle = -Math.PI / 2;

    values.forEach((v, i) => {
      const sliceAngle = (v / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();

      segments.push({
        start: startAngle,
        end: endAngle,
        label: labels[i],
        value: v,
        pct: ((v / total) * 100).toFixed(0),
        color: colors[i],
      });

      startAngle = endAngle;
    });

    /* Center text */
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total.toLocaleString(), cx, cy - 6);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px -apple-system, sans-serif";
    ctx.fillText("Total", cx, cy + 14);

    /* Legend */
    const legend = document.getElementById("donutLegend");
    legend.innerHTML = "";
    segments.forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="legend-dot" style="background:' +
        s.color +
        '"></span>' +
        s.label +
        " " +
        s.pct +
        "%";
      legend.appendChild(li);
    });

    /* Hover */
    canvas.addEventListener("mousemove", (e) => {
      const cr = canvas.getBoundingClientRect();
      const mx = e.clientX - cr.left;
      const my = e.clientY - cr.top;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= innerR && dist <= outerR) {
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;

        const seg = segments.find((s) => angle >= s.start && angle < s.end);
        if (seg) {
          showTooltip(e.clientX, e.clientY, seg.label + ": " + seg.pct + "% (" + seg.value + ")");
          return;
        }
      }
      hideTooltip();
    });

    canvas.addEventListener("mouseleave", hideTooltip);
  }

  /* ===== TABLE SORT ===== */
  function initTableSort() {
    const table = document.getElementById("ordersTable");
    const headers = table.querySelectorAll("th[data-sort]");
    let currentSort = { col: -1, asc: true };

    headers.forEach((th, colIndex) => {
      th.addEventListener("click", () => {
        const type = th.dataset.sort;
        const asc = currentSort.col === colIndex ? !currentSort.asc : true;
        currentSort = { col: colIndex, asc };

        /* Update classes */
        headers.forEach((h) => h.classList.remove("sort-asc", "sort-desc"));
        th.classList.add(asc ? "sort-asc" : "sort-desc");

        /* Sort rows */
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));

        rows.sort((a, b) => {
          let va = a.cells[colIndex].textContent.trim();
          let vb = b.cells[colIndex].textContent.trim();

          if (type === "number") {
            va = parseFloat(va.replace(/[^0-9.\-]/g, "")) || 0;
            vb = parseFloat(vb.replace(/[^0-9.\-]/g, "")) || 0;
          }

          if (va < vb) return asc ? -1 : 1;
          if (va > vb) return asc ? 1 : -1;
          return 0;
        });

        rows.forEach((row) => tbody.appendChild(row));
      });
    });
  }

  initTableSort();

  /* ===== Draw charts on load & resize ===== */
  function drawAll() {
    drawLineChart();
    drawBarChart();
    drawDonutChart();
  }

  drawAll();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawAll, 150);
  });
})();
