if (!window.MotionPreference) {
  const __mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const __listeners = new Set();

  const MotionPreference = {
    prefersReducedMotion() {
      return __mql.matches;
    },
    setOverride(value) {
      const reduced = Boolean(value);
      document.documentElement.classList.toggle("reduced-motion", reduced);
      window.dispatchEvent(new CustomEvent("motion-preference", { detail: { reduced } }));
      for (const listener of __listeners) {
        try {
          listener({ reduced, override: reduced, systemReduced: __mql.matches });
        } catch {}
      }
    },
    onChange(listener) {
      __listeners.add(listener);
      try {
        listener({
          reduced: __mql.matches,
          override: null,
          systemReduced: __mql.matches,
        });
      } catch {}
      return () => __listeners.delete(listener);
    },
    getState() {
      return { reduced: __mql.matches, override: null, systemReduced: __mql.matches };
    },
  };

  window.MotionPreference = MotionPreference;
}

const statusEl = document.getElementById("status");
const runBtn = document.getElementById("runBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function fallbackRender(message) {
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, "#1f2f55");
  g.addColorStop(1, "#553077");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e9f3ff";
  ctx.font = "700 24px Trebuchet MS";
  ctx.fillText("WebGPU Probe", 28, 48);
  ctx.font = "16px Trebuchet MS";
  ctx.fillText(message, 28, 80);
}

runBtn.addEventListener("click", async () => {
  if (!navigator.gpu) {
    statusEl.textContent = "WebGPU unavailable. Using fallback preview.";
    fallbackRender("navigator.gpu not found in this browser.");
    return;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      statusEl.textContent = "WebGPU adapter unavailable. Using fallback preview.";
      fallbackRender("No adapter returned by browser.");
      return;
    }

    const info = adapter.info ? await adapter.info : null;
    const label = info
      ? `${info.vendor || "vendor"} / ${info.architecture || "architecture"}`
      : "adapter detected";
    statusEl.textContent = `WebGPU available: ${label}`;
    fallbackRender(`WebGPU path detected (${label}). Extend this branch with render pipelines.`);
  } catch (error) {
    statusEl.textContent = "WebGPU probe failed. Using fallback preview.";
    fallbackRender(`Probe error: ${error.message}`);
  }
});
