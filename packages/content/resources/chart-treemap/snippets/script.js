const DATA = [
  {
    label: "Technology",
    color: "#818cf8",
    children: [
      { label: "NVDA", value: 320 },
      { label: "AAPL", value: 280 },
      { label: "MSFT", value: 240 },
      { label: "GOOGL", value: 200 },
    ],
  },
  {
    label: "Finance",
    color: "#34d399",
    children: [
      { label: "JPM", value: 180 },
      { label: "BAC", value: 140 },
      { label: "GS", value: 120 },
    ],
  },
  {
    label: "Healthcare",
    color: "#f59e0b",
    children: [
      { label: "JNJ", value: 160 },
      { label: "UNH", value: 130 },
      { label: "PFE", value: 90 },
    ],
  },
  {
    label: "Energy",
    color: "#f87171",
    children: [
      { label: "XOM", value: 150 },
      { label: "CVX", value: 110 },
    ],
  },
  {
    label: "Consumer",
    color: "#a78bfa",
    children: [
      { label: "AMZN", value: 200 },
      { label: "WMT", value: 130 },
    ],
  },
];
const total = DATA.flatMap((g) => g.children).reduce((a, d) => a + d.value, 0);
const tooltip = document.getElementById("chartTooltip");
const wrap = document.getElementById("treemapWrap");

function squarify(items, x, y, w, h) {
  if (!items.length) return [];
  const results = [];
  const remaining = [...items];
  while (remaining.length) {
    const row = [];
    let rowVal = 0;
    const totalVal = remaining.reduce((a, d) => a + d.value, 0);
    const isHoriz = w >= h;
    const dim = isHoriz ? h : w;

    for (let i = 0; i < remaining.length; i++) {
      row.push(remaining[i]);
      rowVal += remaining[i].value;
      const rowArea = (rowVal / totalVal) * (w * h);
      const rowLen = rowArea / dim;
      const worst = row.reduce(
        (a, d) =>
          Math.max(
            a,
            Math.max(
              (rowLen * (d.value / rowVal) * dim) / (rowLen || 1),
              (rowLen || 1) / ((rowLen * (d.value / rowVal) * dim) / (rowLen || 1) || 1)
            )
          ),
        0
      );
      const nextVal = i + 1 < remaining.length ? remaining[i + 1].value : 0;
      const nextWorst =
        nextVal > 0
          ? Math.max(
              worst,
              Math.max(
                (rowLen * (nextVal / (rowVal + nextVal)) * dim) / (rowLen || 1),
                (rowLen || 1) /
                  ((rowLen * (nextVal / (rowVal + nextVal)) * dim) / (rowLen || 1) || 1)
              )
            )
          : Infinity;
      if (nextWorst >= worst && i + 1 < remaining.length) continue;
      // Lay out row
      let cursor = isHoriz ? y : x;
      const rowLen2 = ((rowVal / totalVal) * (w * h)) / dim;
      row.forEach((d) => {
        const size = (d.value / rowVal) * dim;
        const rect = isHoriz
          ? { x, y: cursor, w: rowLen2, h: size }
          : { x: cursor, y, w: size, h: rowLen2 };
        results.push({ ...d, rect });
        cursor += size;
      });
      remaining.splice(0, row.length);
      if (isHoriz) {
        x += rowLen2;
        w -= rowLen2;
      } else {
        y += rowLen2;
        h -= rowLen2;
      }
      break;
    }
    if (!row.length && remaining.length) {
      const d = remaining.shift();
      results.push({ ...d, rect: { x, y, w: w, h: h } });
    }
  }
  return results;
}

function render() {
  wrap.innerHTML = "";
  const W = wrap.clientWidth,
    H = wrap.clientHeight;

  const all = DATA.flatMap((g) =>
    g.children.map((c) => ({ ...c, group: g.label, color: g.color }))
  );
  const laid = squarify(all, 0, 0, W, H);

  laid.forEach((d, i) => {
    const { x, y, w, h } = d.rect;
    if (w < 2 || h < 2) return;
    const tile = document.createElement("div");
    tile.className = "tm-tile";
    tile.style.left = x + "px";
    tile.style.top = y + "px";
    tile.style.width = w + "px";
    tile.style.height = h + "px";
    tile.style.background = d.color;
    tile.style.animationDelay = i * 0.02 + "s";
    if (w > 40 && h > 30) {
      tile.innerHTML = `<div class="tm-name">${d.label}</div><div class="tm-val">$${d.value}B</div>`;
    }
    tile.addEventListener("mouseenter", (e) => {
      const pct = ((d.value / total) * 100).toFixed(1);
      tooltip.innerHTML = `<strong>${d.label}</strong> · ${d.group}<br/>$${d.value}B &nbsp;|&nbsp; ${pct}%`;
      tooltip.hidden = false;
      tooltip.style.left = e.clientX + 12 + "px";
      tooltip.style.top = e.clientY - 40 + "px";
    });
    tile.addEventListener("mousemove", (e) => {
      tooltip.style.left = e.clientX + 12 + "px";
      tooltip.style.top = e.clientY - 40 + "px";
    });
    tile.addEventListener("mouseleave", () => (tooltip.hidden = true));
    wrap.appendChild(tile);
  });
}

const ro = new ResizeObserver(render);
ro.observe(wrap);
render();
