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

async function initSoundReactiveHooks() {
  return {
    supported: false,
    reason: "shared module unavailable in imported version",
    getLevel() {
      return 0;
    },
    destroy() {},
  };
}

const audioBtn = document.getElementById("audioBtn");
const statusEl = document.getElementById("status");
const bars = document.getElementById("bars");
let sound;
let raf = 0;

const nodes = Array.from({ length: 24 }, () => {
  const el = document.createElement("span");
  el.className = "bar";
  el.style.height = "20%";
  bars.appendChild(el);
  return el;
});

async function enableMidi() {
  if (!navigator.requestMIDIAccess) {
    return "MIDI unavailable in this browser.";
  }

  try {
    const access = await navigator.requestMIDIAccess();
    let hit = false;
    access.inputs.forEach((input) => {
      input.onmidimessage = (event) => {
        hit = true;
        const velocity = event.data[2] || 0;
        const normalized = velocity / 127;
        nodes.forEach((el, i) => {
          const wave = Math.sin(performance.now() * 0.002 + i) * 0.3 + 0.7;
          el.style.height = `${Math.max(10, normalized * wave * 100)}%`;
        });
      };
    });
    return hit ? "MIDI input attached." : "MIDI ready. Send notes from a controller.";
  } catch (_error) {
    return "MIDI permission rejected.";
  }
}

function animateAudio() {
  if (sound && sound.supported) {
    const level = sound.getLevel();
    nodes.forEach((el, i) => {
      const wave = Math.sin(performance.now() * 0.003 + i * 0.4) * 0.25 + 0.75;
      el.style.height = `${Math.max(10, level * wave * 100)}%`;
    });
  }
  raf = requestAnimationFrame(animateAudio);
}

audioBtn.addEventListener("click", async () => {
  sound = await initSoundReactiveHooks();
  const midiMessage = await enableMidi();
  if (sound.supported) {
    statusEl.textContent = `Audio reactive active. ${midiMessage}`;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(animateAudio);
  } else {
    statusEl.textContent = `Audio unavailable (${sound.reason}). ${midiMessage}`;
  }
});

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(raf);
  if (sound && sound.destroy) sound.destroy();
});
