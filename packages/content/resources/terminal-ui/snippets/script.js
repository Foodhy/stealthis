const body = document.getElementById("termBody");

const SCRIPT = [
  { type: "cmd", text: "git clone https://github.com/acme/app.git", delay: 600 },
  { type: "stdout", text: "Cloning into 'app'...", delay: 400 },
  { type: "stdout", text: "remote: Enumerating objects: 342, done.", delay: 200 },
  { type: "stdout", text: "remote: Counting objects: 100% (342/342), done.", delay: 200 },
  {
    type: "stdout",
    text: "Receiving objects: 100% (342/342), 1.4 MiB | 8.2 MiB/s, done.",
    delay: 300,
  },
  { type: "info", text: "", delay: 200 },
  { type: "cmd", text: "cd app && bun install", delay: 500 },
  { type: "stdout", text: "bun install v1.1.0 (bf3ee7a)", delay: 200 },
  { type: "stdout", text: "+ 148 packages installed [1.24s]", delay: 400 },
  { type: "info", text: "", delay: 200 },
  { type: "cmd", text: "bun run build", delay: 500 },
  { type: "info", text: "▶ Building for production...", delay: 300 },
  { type: "info", text: "  dist/index.js    42.1 kB │ gzip: 14.2 kB", delay: 300 },
  { type: "info", text: "  dist/style.css    8.3 kB │ gzip:  2.1 kB", delay: 200 },
  { type: "stdout", text: "✓ Build completed in 1.34s", delay: 300 },
  { type: "prompt", text: "", delay: 300 }, // final prompt
];

let timeouts = [];
let cursorEl = null;

function appendLine(type, text) {
  const line = document.createElement("div");

  if (type === "prompt") {
    line.className = "t-line";
    line.innerHTML = `<span class="t-prompt">❯</span><span class="cursor"></span>`;
    cursorEl = line.querySelector(".cursor");
  } else if (type === "cmd") {
    line.className = "t-line";
    line.innerHTML = `<span class="t-prompt">❯</span><span class="t-cmd">${text}</span>`;
  } else if (type === "stdout") {
    line.className = "t-stdout";
    line.textContent = text;
  } else if (type === "stderr") {
    line.className = "t-stderr";
    line.textContent = text;
  } else if (type === "info") {
    line.className = "t-info";
    line.textContent = text;
  }

  body.appendChild(line);
  line.scrollIntoView({ block: "nearest" });
}

function typeCommand(text, callback) {
  const line = document.createElement("div");
  line.className = "t-line";
  const prompt = document.createElement("span");
  prompt.className = "t-prompt";
  prompt.textContent = "❯ ";
  const cmd = document.createElement("span");
  cmd.className = "t-cmd";
  const cur = document.createElement("span");
  cur.className = "cursor";
  line.appendChild(prompt);
  line.appendChild(cmd);
  line.appendChild(cur);
  body.appendChild(line);

  let i = 0;
  function next() {
    if (i < text.length) {
      cmd.textContent += text[i++];
      line.scrollIntoView({ block: "nearest" });
      const t = setTimeout(next, 28 + Math.random() * 20);
      timeouts.push(t);
    } else {
      cur.remove();
      callback();
    }
  }
  next();
}

function run(index = 0) {
  if (index >= SCRIPT.length) return;
  const { type, text, delay } = SCRIPT[index];

  const t = setTimeout(() => {
    if (type === "cmd") {
      typeCommand(text, () => run(index + 1));
    } else {
      appendLine(type, text);
      run(index + 1);
    }
  }, delay);
  timeouts.push(t);
}

function clear() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
  body.innerHTML = "";
}

run();

document.getElementById("replayBtn").addEventListener("click", () => {
  clear();
  run();
});
document.getElementById("clearBtn").addEventListener("click", clear);
