(function () {
  "use strict";

  const beforeEl = document.getElementById("diff-before");
  const afterEl = document.getElementById("diff-after");
  if (!beforeEl || !afterEl) return;

  // Sample code strings
  const beforeCode = [
    'import { useState } from "react";',
    "",
    "function Counter() {",
    "  const [count, setCount] = useState(0);",
    "",
    "  function handleClick() {",
    "    setCount(count + 1);",
    "  }",
    "",
    "  return (",
    '    <div className="counter">',
    "      <p>Count: {count}</p>",
    "      <button onClick={handleClick}>",
    "        Increment",
    "      </button>",
    "    </div>",
    "  );",
    "}",
    "",
    "export default Counter;",
  ];

  const afterCode = [
    'import { useState, useCallback } from "react";',
    "",
    "function Counter({ initial = 0, step = 1 }) {",
    "  const [count, setCount] = useState(initial);",
    "",
    "  const increment = useCallback(() => {",
    "    setCount((prev) => prev + step);",
    "  }, [step]);",
    "",
    "  const decrement = useCallback(() => {",
    "    setCount((prev) => prev - step);",
    "  }, [step]);",
    "",
    "  return (",
    '    <div className="counter">',
    "      <p>Count: {count}</p>",
    '      <div className="counter-actions">',
    "        <button onClick={decrement}>-</button>",
    "        <button onClick={increment}>+</button>",
    "      </div>",
    "    </div>",
    "  );",
    "}",
    "",
    "export default Counter;",
  ];

  // Simple line-by-line diff using LCS approach
  function computeDiff(oldLines, newLines) {
    const oldSet = new Set(oldLines.map((l, i) => i + ":" + l));
    const newSet = new Set(newLines.map((l, i) => i + ":" + l));

    // Find common lines (by content only, simple approach)
    const oldResult = [];
    const newResult = [];

    let oi = 0;
    let ni = 0;

    while (oi < oldLines.length || ni < newLines.length) {
      if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
        // Same line
        oldResult.push({ text: oldLines[oi], type: "same", num: oi + 1 });
        newResult.push({ text: newLines[ni], type: "same", num: ni + 1 });
        oi++;
        ni++;
      } else {
        // Check if old line exists later in new
        const oldInNew = newLines.indexOf(oldLines[oi], ni);
        const newInOld = oldLines.indexOf(newLines[ni], oi);

        if (oi < oldLines.length && (oldInNew === -1 || (newInOld !== -1 && newInOld <= oi + 2))) {
          // Removed line
          oldResult.push({ text: oldLines[oi], type: "removed", num: oi + 1 });
          newResult.push({ text: "", type: "empty", num: null });
          oi++;
        } else if (ni < newLines.length) {
          // Added line
          oldResult.push({ text: "", type: "empty", num: null });
          newResult.push({ text: newLines[ni], type: "added", num: ni + 1 });
          ni++;
        } else {
          oi++;
          ni++;
        }
      }
    }

    return { oldResult, newResult };
  }

  function renderLines(container, lines) {
    lines.forEach(function (line) {
      var div = document.createElement("div");
      div.className = "diff-line";
      if (line.type !== "same") {
        div.classList.add("diff-line--" + line.type);
      }

      var numSpan = document.createElement("span");
      numSpan.className = "diff-line-number";
      numSpan.textContent = line.num !== null ? line.num : "";

      var contentSpan = document.createElement("span");
      contentSpan.className = "diff-line-content";

      var prefix = "";
      if (line.type === "removed") prefix = "- ";
      else if (line.type === "added") prefix = "+ ";
      else if (line.type === "empty") prefix = "  ";
      else prefix = "  ";

      contentSpan.textContent = prefix + line.text;

      div.appendChild(numSpan);
      div.appendChild(contentSpan);
      container.appendChild(div);
    });
  }

  var diff = computeDiff(beforeCode, afterCode);
  renderLines(beforeEl, diff.oldResult);
  renderLines(afterEl, diff.newResult);

  // Sync scroll
  var panels = document.querySelectorAll(".diff-code");
  panels.forEach(function (panel) {
    panel.addEventListener("scroll", function () {
      panels.forEach(function (other) {
        if (other !== panel) {
          other.scrollTop = panel.scrollTop;
        }
      });
    });
  });
})();
