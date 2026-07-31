// Notebook behavior: Run buttons type each cell's output, Run All cascades,
// Restart clears every output. Nav chips scroll manually (fragment navigation
// is blocked inside sandboxed srcdoc iframes).

let execCount = 0;
let running = false;
const status = document.getElementById("kernel-status");

function setBusy(busy, label) {
  running = busy;
  status.textContent = label || (busy ? "Kernel busy ●" : "Kernel idle");
  status.classList.toggle("busy", busy);
}

function typeOutput(cell, { instant = false } = {}) {
  return new Promise((resolve) => {
    const template = cell.querySelector(".out-template");
    const out = cell.querySelector(".out:not(.prompt)");
    const runBtn = cell.querySelector(".run");
    const inPrompt = cell.querySelector(".prompt.in");
    const outPrompt = cell.querySelector(".outwrap .prompt.out");
    if (!template || !out) return resolve();

    execCount += 1;
    const n = execCount;
    inPrompt.textContent = `In [${n}]:`;
    outPrompt.textContent = `Out [${n}]:`;
    cell.classList.add("ran", "active");
    runBtn.disabled = true;

    const finalHTML = template.innerHTML.trim();
    if (instant || cell.dataset.hasRun) {
      out.innerHTML = finalHTML;
      cell.dataset.hasRun = "1";
      runBtn.disabled = false;
      cell.classList.remove("active");
      return resolve();
    }

    // Type the plain text, then swap in the syntax-colored HTML.
    const text = template.content
      ? template.content.textContent.trim()
      : template.textContent.trim();
    out.innerHTML = '<span class="caret"></span>';
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 90)); // ~90 frames total
    const timer = setInterval(() => {
      i = Math.min(text.length, i + step);
      out.textContent = text.slice(0, i);
      out.insertAdjacentHTML("beforeend", '<span class="caret"></span>');
      if (i >= text.length) {
        clearInterval(timer);
        out.innerHTML = finalHTML;
        cell.dataset.hasRun = "1";
        runBtn.disabled = false;
        cell.classList.remove("active");
        resolve();
      }
    }, 16);
  });
}

const codeCells = Array.from(document.querySelectorAll(".cell.code"));

codeCells.forEach((cell) => {
  cell.querySelector(".run").addEventListener("click", async () => {
    if (running) return;
    setBusy(true);
    await typeOutput(cell);
    setBusy(false);
  });
});

document.getElementById("run-all").addEventListener("click", async () => {
  if (running) return;
  setBusy(true);
  for (let i = 0; i < codeCells.length; i++) {
    setBusy(true, `Kernel busy ● cell ${i + 1}/${codeCells.length}`);
    codeCells[i].scrollIntoView({ behavior: "smooth", block: "center" });
    await typeOutput(codeCells[i]);
  }
  setBusy(false);
});

document.getElementById("restart").addEventListener("click", () => {
  if (running) return;
  execCount = 0;
  codeCells.forEach((cell) => {
    cell.classList.remove("ran", "active");
    delete cell.dataset.hasRun;
    cell.querySelector(".out:not(.prompt)").innerHTML = "";
    cell.querySelector(".prompt.in").textContent = "In [ ]:";
    cell.querySelector(".run").disabled = false;
  });
  setBusy(false, "Kernel restarted — idle");
});

document.querySelectorAll('.nb-nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
