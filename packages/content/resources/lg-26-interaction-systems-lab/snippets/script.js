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

function initCursorSystem() {
  return { setEnabled() {}, destroy() {} };
}

function initSpotlightOverlay() {
  return { setEnabled() {}, destroy() {} };
}

function initSectionTransitionOrchestrator() {
  return { destroy() {} };
}

function createTimelineDebugger() {
  return { log() {}, destroy() {} };
}

function initPerformanceMonitor() {
  return {
    onUpdate() {
      return () => {};
    },
    destroy() {},
  };
}

function applyLowPowerClass() {
  return { enabled: false, reasons: [] };
}

function createCleanupRegistry() {
  const callbacks = [];
  return {
    add(fn) {
      if (typeof fn === "function") callbacks.push(fn);
    },
    run() {
      for (const fn of callbacks.splice(0)) {
        try {
          fn();
        } catch {}
      }
    },
  };
}

const motionToggle = document.getElementById("motionToggle");
const soundBtn = document.getElementById("soundBtn");
const audioState = document.getElementById("audioState");
const meterFill = document.getElementById("meterFill");
const perfState = document.getElementById("perfState");

const state = {
  reduced: window.MotionPreference.prefersReducedMotion(),
  sound: null,
  meterRaf: 0,
};
const cleanup = createCleanupRegistry();
const lowPower = applyLowPowerClass(document.documentElement);
if (lowPower.enabled) state.reduced = true;

const debuggerPanel = createTimelineDebugger({ enabled: true, title: "Phase 6 Debugger" });
const cursorSystem = initCursorSystem({ enabled: !state.reduced });
const spotlight = initSpotlightOverlay({ enabled: !state.reduced });
const orchestrator = initSectionTransitionOrchestrator({
  selector: "[data-section]",
  onEnter: (section) => {
    debuggerPanel.log(`enter: ${section.querySelector("h1, h2")?.textContent || "section"}`);
  },
  onExit: (section) => {
    debuggerPanel.log(`exit: ${section.querySelector("h1, h2")?.textContent || "section"}`);
  },
});
const perfMonitor = initPerformanceMonitor({ lowPower: lowPower.enabled });
let lastPerfRender = 0;

cleanup.add(() => orchestrator.destroy());
cleanup.add(() => cursorSystem.destroy());
cleanup.add(() => spotlight.destroy());
cleanup.add(() => debuggerPanel.destroy());
cleanup.add(() => perfMonitor.destroy());

cleanup.add(
  perfMonitor.onUpdate((snapshot) => {
    const now = performance.now();
    if (now - lastPerfRender < 220) return;
    lastPerfRender = now;
    perfState.textContent = `FPS ${snapshot.fps.toFixed(1)} | worst ${snapshot.worstFrameMs.toFixed(1)}ms | long tasks ${snapshot.longTasks} | target ${snapshot.budget.targetFps}`;
  })
);

debuggerPanel.log(
  lowPower.enabled ? `low power detected: ${lowPower.reasons.join(", ")}` : "standard power mode"
);

function applyMotionMode() {
  document.body.classList.toggle("no-motion", state.reduced);
  motionToggle.textContent = state.reduced ? "Enable motion" : "Disable motion";
  cursorSystem.setEnabled(!state.reduced);
  spotlight.setEnabled(!state.reduced);
  debuggerPanel.log(state.reduced ? "motion disabled" : "motion enabled");
}

function stopMeterLoop() {
  if (state.meterRaf) cancelAnimationFrame(state.meterRaf);
  state.meterRaf = 0;
}

function startMeterLoop() {
  stopMeterLoop();

  const step = () => {
    if (state.sound && state.sound.supported) {
      const level = state.sound.getLevel();
      meterFill.style.width = `${Math.min(100, Math.max(0, level * 100))}%`;
    }
    state.meterRaf = requestAnimationFrame(step);
  };

  state.meterRaf = requestAnimationFrame(step);
}

async function enableSoundHook() {
  if (state.sound && state.sound.supported) return;

  audioState.textContent = "Requesting microphone access...";
  debuggerPanel.log("sound hook requested");
  const soundModule = await Promise.resolve({ initSoundReactiveHooks });
  state.sound = await soundModule.initSoundReactiveHooks();

  if (!state.sound.supported) {
    audioState.textContent = `Audio hook unavailable (${state.sound.reason}).`;
    debuggerPanel.log(`sound hook unavailable: ${state.sound.reason}`);
    return;
  }

  audioState.textContent = "Audio hook active. Meter is now driven by input energy.";
  debuggerPanel.log("sound hook active");
  startMeterLoop();
}

motionToggle.addEventListener("click", () => {
  state.reduced = !state.reduced;
  applyMotionMode();
});

soundBtn.addEventListener("click", enableSoundHook);

window.addEventListener("beforeunload", () => {
  stopMeterLoop();
  if (state.sound && state.sound.destroy) state.sound.destroy();
  cleanup.run();
});

applyMotionMode();
