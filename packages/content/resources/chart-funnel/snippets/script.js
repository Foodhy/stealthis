const STAGES = [
  { label: "Visitors", value: 10000, color: "#818cf8" },
  { label: "Sign Ups", value: 4200, color: "#6366f1" },
  { label: "Onboarded", value: 2800, color: "#a78bfa" },
  { label: "Active Users", value: 1600, color: "#8b5cf6" },
  { label: "Paid Customers", value: 640, color: "#7c3aed" },
];
const tooltip = document.getElementById("chartTooltip");
const wrap = document.getElementById("funnelWrap");

const maxW = 560;
const minW = 80;

STAGES.forEach((stage, i) => {
  const pct = ((stage.value / STAGES[0].value) * 100).toFixed(1);
  const w = minW + (maxW - minW) * (stage.value / STAGES[0].value);

  const stageEl = document.createElement("div");
  stageEl.className = "funnel-stage";
  stageEl.style.animationDelay = `${i * 0.1}s`;

  const bar = document.createElement("div");
  bar.className = "funnel-bar";
  bar.style.width = w + "px";
  bar.style.background = stage.color;
  bar.innerHTML = `<span class="funnel-name">${stage.label}</span><span class="funnel-val">${stage.value.toLocaleString()}</span>`;

  bar.addEventListener("mouseenter", (e) => {
    const conv = ((stage.value / STAGES[0].value) * 100).toFixed(1);
    tooltip.innerHTML = `<strong>${stage.label}</strong><br/>${stage.value.toLocaleString()} users<br/>Overall: ${conv}%`;
    tooltip.hidden = false;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY - 40 + "px";
  });
  bar.addEventListener("mousemove", (e) => {
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY - 40 + "px";
  });
  bar.addEventListener("mouseleave", () => (tooltip.hidden = true));

  stageEl.appendChild(bar);

  if (i < STAGES.length - 1) {
    const drop = STAGES[i].value - STAGES[i + 1].value;
    const dropPct = ((drop / STAGES[i].value) * 100).toFixed(1);
    const dropEl = document.createElement("div");
    dropEl.className = "funnel-drop";
    dropEl.innerHTML = `▼ <span class="drop-pct">-${dropPct}%</span> dropped (${drop.toLocaleString()})`;
    stageEl.appendChild(dropEl);
  }

  wrap.appendChild(stageEl);
});
