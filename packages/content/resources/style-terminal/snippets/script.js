/* ============================================================
   TERMINAL / CLI — Interactive Script
   - Button click simulates command execution with typed output
   - Input enter key echoes typed command as output
   - Typewriter effect for output lines
   - Header uptime counter (live ticking)
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. Button click → simulate command execution
     Each button has data-cmd and data-output attributes
  ---------------------------------------------------------- */
  const outputArea = document.getElementById("cmd-output");
  const buttons = document.querySelectorAll(".btn[data-cmd]");

  function appendLine(text, cssClass) {
    if (!outputArea) return;
    const line = document.createElement("span");
    line.className = "cmd-output-line " + (cssClass || "");
    line.textContent = text;
    outputArea.appendChild(line);
    outputArea.scrollTop = outputArea.scrollHeight;
  }

  function typewriterAppend(text, cssClass, delay, callback) {
    if (!outputArea) return;
    const line = document.createElement("span");
    line.className = "cmd-output-line " + (cssClass || "");
    outputArea.appendChild(line);

    let i = 0;
    const interval = setInterval(function () {
      line.textContent += text[i];
      i++;
      outputArea.scrollTop = outputArea.scrollHeight;
      if (i >= text.length) {
        clearInterval(interval);
        if (callback) setTimeout(callback, 80);
      }
    }, delay || 18);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const cmd = btn.dataset.cmd || "";
      const output = btn.dataset.output || "";

      // Flash button
      btn.style.opacity = "0.6";
      setTimeout(function () {
        btn.style.opacity = "";
      }, 120);

      // Show command line
      typewriterAppend("$ " + cmd, "cmd-line", 14, function () {
        // Show each output line
        const lines = output.split("\n");
        let lineIdx = 0;

        function nextLine() {
          if (lineIdx >= lines.length) return;
          const txt = lines[lineIdx];
          lineIdx++;
          appendLine("> " + txt, "out-line");
          if (lineIdx < lines.length) {
            setTimeout(nextLine, 100);
          } else {
            appendLine("> Exit code: 0", "out-line");
          }
        }

        setTimeout(nextLine, 120);
      });
    });
  });

  /* ----------------------------------------------------------
     2. Input enter key: echo typed line as terminal output
  ---------------------------------------------------------- */
  const termInput = document.getElementById("term-input");

  if (termInput && outputArea) {
    termInput.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      const val = termInput.value.trim();
      if (!val) return;

      appendLine("$ " + val, "cmd-line");

      // Simulate a "command not found" response for unknown commands
      const knownCmds = {
        help: "Usage: terminal-ui [--demo|--verbose|--help]\nAll systems nominal.",
        ls: "profile.sh  actions.sh  input.sh  flags.sh",
        whoami: "root_user",
        pwd: "/usr/local/terminal-ui/demo",
        clear: "__CLEAR__",
        date: new Date().toString(),
        uptime: "up 99 days, 23 hours, 59 minutes",
        version: "terminal-ui v2.1.0",
      };

      const response = knownCmds[val.toLowerCase()];

      setTimeout(function () {
        if (response === "__CLEAR__") {
          outputArea.innerHTML = "";
        } else if (response) {
          response.split("\n").forEach(function (line) {
            appendLine("> " + line, "out-line");
          });
        } else {
          appendLine("> command not found: " + val, "out-line");
          appendLine('> Try "help" for available commands.', "out-line");
        }
        termInput.value = "";
      }, 200);
    });
  }

  /* ----------------------------------------------------------
     3. Live uptime counter in the header
  ---------------------------------------------------------- */
  const uptimeEl = document.querySelector(".header-uptime");
  if (uptimeEl) {
    let seconds = 0;
    setInterval(function () {
      seconds++;
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      uptimeEl.textContent = "UPTIME: " + h + ":" + m + ":" + s;
    }, 1000);
  }

  /* ----------------------------------------------------------
     4. Badges — toggle active state on click
  ---------------------------------------------------------- */
  const badges = document.querySelectorAll(".badge");
  badges.forEach(function (badge) {
    if (badge.classList.contains("badge-off")) return; // deprecated can't be toggled
    badge.style.cursor = "pointer";

    badge.addEventListener("click", function () {
      if (badge.classList.contains("badge-on")) {
        badge.classList.remove("badge-on");
        badge.style.textDecoration = "line-through";
        badge.style.opacity = "0.5";
      } else {
        badge.classList.add("badge-on");
        badge.style.textDecoration = "";
        badge.style.opacity = "";
      }
    });
  });

  /* ----------------------------------------------------------
     5. Cursor blink speed on input focus
  ---------------------------------------------------------- */
  if (termInput) {
    const cursorInInput = document.querySelector(".cursor-blink");
    termInput.addEventListener("focus", function () {
      if (cursorInInput) cursorInInput.style.animationDuration = "0.4s";
    });
    termInput.addEventListener("blur", function () {
      if (cursorInInput) cursorInInput.style.animationDuration = "0.8s";
    });
  }
})();
