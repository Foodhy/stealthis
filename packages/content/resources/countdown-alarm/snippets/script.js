(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = { ctx: null, master: null, muted: reduced, noise: null, voices: [] };

  function context() {
    if (!desk.ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      desk.ctx = new AudioCtor();
      desk.master = desk.ctx.createGain();
      desk.master.gain.value = desk.muted ? 0 : 0.22;
      const compressor = desk.ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 10;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      desk.master.connect(compressor);
      compressor.connect(desk.ctx.destination);
    }
    if (desk.ctx.state === "suspended") desk.ctx.resume();
    return desk.ctx;
  }

  function setMaster(value) {
    if (!desk.master || !desk.ctx) return;
    const now = desk.ctx.currentTime;
    desk.master.gain.cancelScheduledValues(now);
    desk.master.gain.setValueAtTime(value, now);
  }

  function silenceNow() {
    setMaster(0);
    if (!desk.ctx) return;
    const now = desk.ctx.currentTime;
    for (const voice of desk.voices) {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(0, now);
    }
    desk.voices = [];
  }

  function remember(source, gain) {
    const voice = { source, gain };
    desk.voices.push(voice);
    source.onended = () => {
      desk.voices = desk.voices.filter((item) => item !== voice);
    };
  }

  function burst(freq, dur, type, peak, delay, slide) {
    if (desk.muted) return;
    const audio = context();
    const start = audio.currentTime + (delay || 0);
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slide) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(48, slide), start + dur);
    }
    const attack = Math.min(0.02, dur * 0.3);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak || 0.14, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(desk.master);
    osc.start(start);
    osc.stop(start + dur + 0.04);
    remember(osc, gain);
  }

  function air(dur, peak, from, to, delay) {
    if (desk.muted) return;
    const audio = context();
    const start = audio.currentTime + (delay || 0);
    if (!desk.noise) {
      const length = Math.floor(audio.sampleRate * 0.35);
      const buffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      desk.noise = buffer;
    }
    const source = audio.createBufferSource();
    source.buffer = desk.noise;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.75;
    filter.frequency.setValueAtTime(from, start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(90, to), start + dur);
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak || 0.08, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(desk.master);
    source.start(start);
    source.stop(start + dur + 0.02);
    remember(source, gain);
  }

  const tones = {
    success() {
      burst(523.25, 0.12, "sine", 0.15, 0);
      burst(659.25, 0.14, "sine", 0.13, 0.07);
      burst(783.99, 0.2, "triangle", 0.11, 0.13);
    },
    error() {
      burst(196, 0.2, "square", 0.06, 0, 130);
      burst(146.83, 0.26, "sawtooth", 0.045, 0.05);
      air(0.12, 0.05, 420, 160, 0);
    },
    warning() {
      burst(466.16, 0.11, "triangle", 0.13, 0);
      burst(349.23, 0.18, "triangle", 0.11, 0.09);
    },
    info() {
      burst(698.46, 0.18, "sine", 0.12, 0);
    },
    message() {
      burst(880, 0.07, "sine", 0.11, 0);
      burst(1174.66, 0.14, "sine", 0.08, 0.05);
    },
    mention() {
      burst(987.77, 0.09, "sine", 0.1, 0);
      burst(1318.51, 0.16, "triangle", 0.08, 0.06);
    },
    urgent() {
      burst(740, 0.07, "square", 0.05, 0);
      burst(740, 0.07, "square", 0.05, 0.11);
      burst(880, 0.14, "square", 0.06, 0.22);
    },
    copy() {
      burst(1046.5, 0.05, "triangle", 0.09, 0);
      burst(1567.98, 0.09, "sine", 0.06, 0.04);
    },
    tick(step) {
      const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
      burst(scale[Math.abs(step || 0) % scale.length], 0.045, "sine", 0.055, 0);
    },
    tap(step) {
      const scale = [392, 440, 493.88, 523.25, 587.33, 659.25, 783.99, 880];
      burst(scale[Math.abs(step || 0) % scale.length], 0.07, "triangle", 0.1, 0);
    },
    whoosh() {
      air(0.16, 0.09, 1900, 280, 0);
    },
    confirm() {
      burst(523.25, 0.09, "sine", 0.12, 0);
      burst(783.99, 0.15, "sine", 0.1, 0.06);
    },
    reject() {
      burst(311.13, 0.12, "triangle", 0.1, 0, 170);
    },
    key() {
      air(0.025, 0.045, 2600, 1700, 0);
    },
    backspace() {
      air(0.04, 0.04, 900, 420, 0);
    },
    pickup() {
      burst(280, 0.08, "sine", 0.1, 0, 540);
    },
    drop() {
      burst(460, 0.1, "sine", 0.1, 0, 240);
    },
    email() {
      burst(440, 0.1, "triangle", 0.1, 0);
      burst(554.37, 0.16, "sine", 0.08, 0.08);
    },
    system() {
      burst(220, 0.08, "square", 0.04, 0);
      burst(440, 0.14, "sine", 0.08, 0.05);
    },
    glide(freq) {
      burst(freq, 0.05, "sine", 0.05, 0);
    },
    resolve() {
      burst(392, 0.14, "sine", 0.08, 0);
      burst(493.88, 0.16, "sine", 0.07, 0.04);
      burst(587.33, 0.24, "triangle", 0.08, 0.08);
    },
    send() {
      burst(659.25, 0.08, "sine", 0.1, 0);
      burst(987.77, 0.14, "triangle", 0.08, 0.05);
    },
  };

  const nowEl = document.querySelector(".now");
  const muteBtn = document.querySelector("[data-mute]");

  function say(label) {
    if (nowEl) nowEl.textContent = desk.muted ? "Sonido en pausa" : label;
  }

  function syncMute() {
    if (!muteBtn) return;
    muteBtn.setAttribute("aria-pressed", String(desk.muted));
    muteBtn.textContent = desk.muted ? "Activar sonido" : "Silenciar";
  }

  syncMute();
  if (desk.muted) say("Sonido en pausa");

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      desk.muted = !desk.muted;
      syncMute();
      if (!desk.muted) {
        context();
        setMaster(0.22);
        say("Sonido listo");
      } else {
        silenceNow();
        say("Sonido en pausa");
      }
    });
  }

  document.addEventListener("pointerdown", () => {
    if (!desk.muted) context();
  });
  const num = document.querySelector("[data-num]");
  let left = 5;
  let timer = 0;
  function show(value) {
    num.textContent = String(value);
  }
  function tick() {
    show(left);
    if (left <= 0) {
      tones.urgent();
      say("Sonando: tiempo");
      timer = 0;
      return;
    }
    tones.tick(5 - left);
    say(`Sonando: ${left}`);
    left -= 1;
    timer = window.setTimeout(tick, 1000);
  }
  document.querySelector("[data-start]").addEventListener("click", () => {
    window.clearTimeout(timer);
    left = 5;
    tick();
  });
  document.querySelector("[data-stop]").addEventListener("click", () => {
    window.clearTimeout(timer);
    timer = 0;
    tones.drop();
    say("Sonando: pausa");
  });
})();
