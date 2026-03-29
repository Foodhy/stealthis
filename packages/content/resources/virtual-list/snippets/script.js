(() => {
  const TOTAL = 5000;
  const ROW_HEIGHT = 44;
  const OVERSCAN = 6;

  const DATA = Array.from({ length: TOTAL }, (_, index) => ({
    id: index + 1,
    label: `Record #${index + 1}`,
    group: `Group ${((index % 8) + 1).toString().padStart(2, "0")}`,
  }));

  const viewport = document.getElementById("viewport");
  const spacer = document.getElementById("spacer");
  const rows = document.getElementById("rows");
  const meta = document.getElementById("meta");

  spacer.style.height = `${TOTAL * ROW_HEIGHT}px`;

  const render = () => {
    const scrollTop = viewport.scrollTop;
    const viewHeight = viewport.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(TOTAL, Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + OVERSCAN);

    rows.style.transform = `translateY(${start * ROW_HEIGHT}px)`;

    const fragment = document.createDocumentFragment();
    for (let index = start; index < end; index += 1) {
      const row = DATA[index];
      const el = document.createElement("div");
      el.className = "row";
      el.innerHTML = `<span>${row.label}</span><span>${row.group}</span>`;
      fragment.appendChild(el);
    }

    rows.innerHTML = "";
    rows.appendChild(fragment);
    meta.textContent = `Rendering rows ${start + 1}-${end} of ${TOTAL}`;
  };

  viewport.addEventListener("scroll", render);
  window.addEventListener("resize", render);
  render();
})();
