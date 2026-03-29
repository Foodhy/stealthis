/* ── Scales & Roots ─────────────────────────────────── */
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};
const ROOTS = {
  C: 60,
  "C#": 61,
  Db: 61,
  D: 62,
  "D#": 63,
  Eb: 63,
  E: 64,
  F: 65,
  "F#": 66,
  Gb: 66,
  G: 67,
  "G#": 68,
  Ab: 68,
  A: 69,
  "A#": 70,
  Bb: 70,
  B: 71,
};

/* ── 10 Presets (Tracks) ───────────────────────────── */
/*  Each track has a distinct personality:
 *  1  Classic vaporwave — steady, familiar
 *  2  Ethereal mallsoft — no drums, glacial, ultra-reverb
 *  3  Dark bass-driven — dry, punchy, active bass line
 *  4  Cascading arpeggios — fast steps, bright, constant hi-hats
 *  5  Slow tape — minimal, heavy swing, tape-degraded
 *  6  Ambient meditation — no drums, slowest, massive space
 *  7  Bright cruise — fastest, major key, full drums, dry
 *  8  Lo-fi boom bap — warm, muffled, sparse fragments
 *  9  Cinematic neon — no drums, atmospheric, wide delay
 *  10 Funky groove — complex drums, syncopated, danceable
 */
const PRESETS = [
  // 1 — Classic supersaw vaporwave
  {
    name: "Vaporwave Basico",
    root: "C",
    mode: "minor",
    bpm: 78,
    swing: 0.03,
    drums: { kick: "x...x...", snare: "....x...", hat: ".x.x.x.x" },
    pad: [0, 2, 4, 7, 6, 4, 2, 0],
    bass: [0, null, -2, null, -4, null, -2, null],
    lead: [12, 10, 7, null, 10, 7, 5, null],
    fx: { room: 0.72, delay: 0.34, tone: 900, master: 0.72, slow: 2.0 },
    synth: {},
  },
  // 2 — Pure sine tones, no drums, ethereal mall muzak
  {
    name: "Mallsoft Suave",
    root: "Ab",
    mode: "major",
    bpm: 58,
    swing: 0,
    drums: { kick: "........", snare: "........", hat: "........" },
    pad: [0, 4, 7, 11, 14, 11, 7, 4],
    bass: [0, null, null, null, 0, null, null, null],
    lead: [14, 12, 11, 9, 7, 9, 11, 12],
    fx: { room: 0.94, delay: 0.55, tone: 520, master: 0.58, slow: 4.5 },
    synth: {
      padType: "sine",
      padVoices: 1,
      padDetune: 0,
      padAttack: 0.15,
      padRelease: 1.2,
      bassType: "sine",
      bassSub: false,
      leadType: "sine",
      leadQ: 0.3,
    },
  },
  // 3 — Dark square-wave bass, aggressive, dry
  {
    name: "Bassline Nocturno",
    root: "D",
    mode: "minor",
    bpm: 84,
    swing: 0.02,
    drums: { kick: "x.x..x.x", snare: "....x...", hat: "x.x.x.x." },
    pad: [7, null, 5, null, 3, null, 5, null],
    bass: [0, 3, -2, 0, -4, -2, 0, 3],
    lead: [14, null, 12, 14, 10, null, 12, null],
    fx: { room: 0.42, delay: 0.18, tone: 1050, master: 0.76, slow: 1.6 },
    synth: {
      padType: "square",
      padVoices: 2,
      padDetune: 5,
      padQ: 1.5,
      bassType: "square",
      bassQ: 2.0,
      leadType: "sawtooth",
      kickPitch: 120,
      kickDecay: 0.28,
      snareTone: 180,
    },
  },
  // 4 — Ultra-wide 5-voice supersaw, 8-bit lead, cascading arps
  {
    name: "Arpegio VHS",
    root: "A",
    mode: "minor",
    bpm: 80,
    swing: 0,
    drums: { kick: "x...x...", snare: "........", hat: "xxxxxxxx" },
    pad: [0, 2, 4, 7, 9, 11, 14, 16],
    bass: [0, null, -4, null, 0, null, -4, null],
    lead: [7, 9, 11, 14, 16, 14, 11, 9],
    fx: { room: 0.65, delay: 0.42, tone: 1300, master: 0.7, slow: 1.4 },
    synth: {
      padVoices: 5,
      padDetune: 15,
      bassType: "triangle",
      leadType: "square",
      leadQ: 1.0,
      hatFreq: 8000,
      hatDecay: 0.03,
    },
  },
  // 5 — Detuned triangle, slow tape, heavy swing
  {
    name: "Beat Lento",
    root: "G",
    mode: "minor",
    bpm: 66,
    swing: 0.06,
    drums: { kick: "x.......", snare: "....x...", hat: "........" },
    pad: [0, 2, 3, null, -1, null, 0, null],
    bass: [0, null, null, null, -3, null, null, null],
    lead: [12, null, null, 10, null, null, 7, null],
    fx: { room: 0.82, delay: 0.38, tone: 580, master: 0.68, slow: 3.2 },
    synth: {
      padType: "triangle",
      padDetune: 20,
      padAttack: 0.08,
      padRelease: 0.9,
      bassType: "sine",
      leadType: "triangle",
      kickPitch: 100,
      kickDecay: 0.35,
      snareDecay: 0.25,
    },
  },
  // 6 — Sine chorus ambient, no drums, glacial meditation
  {
    name: "Acordes Sonados",
    root: "Db",
    mode: "major",
    bpm: 56,
    swing: 0,
    drums: { kick: "........", snare: "........", hat: "........" },
    pad: [0, 4, 7, 11, 14, 11, 7, 4],
    bass: [0, null, null, null, -3, null, null, null],
    lead: [21, 19, 16, 14, 12, 14, 16, 19],
    fx: { room: 0.95, delay: 0.58, tone: 480, master: 0.55, slow: 5.0 },
    synth: {
      padType: "sine",
      padVoices: 4,
      padDetune: 3,
      padAttack: 0.2,
      padRelease: 1.5,
      padQ: 0.3,
      bassType: "sine",
      bassSub: false,
      bassQ: 0.5,
      leadType: "sine",
      leadQ: 0.3,
    },
  },
  // 7 — Bright square pad, punchy drums, fastest, energetic
  {
    name: "Sunset Cruise",
    root: "E",
    mode: "major",
    bpm: 94,
    swing: 0.04,
    drums: { kick: "x.x.x.x.", snare: "..x...x.", hat: ".x.x.x.x" },
    pad: [0, 2, 4, 7, 4, 2, 0, -1],
    bass: [0, -1, -3, -1, 0, 2, 0, -1],
    lead: [7, 9, 11, 14, 16, 14, 11, 9],
    fx: { room: 0.38, delay: 0.16, tone: 1400, master: 0.78, slow: 1.5 },
    synth: {
      padType: "square",
      padVoices: 3,
      padDetune: 7,
      leadType: "sawtooth",
      leadQ: 1.0,
      kickPitch: 160,
      kickDecay: 0.15,
      snareTone: 260,
      hatDecay: 0.04,
    },
  },
  // 8 — Heavily detuned triangle, warm lo-fi, muffled drums
  {
    name: "Lo-fi Vapor",
    root: "Bb",
    mode: "minor",
    bpm: 72,
    swing: 0.05,
    drums: { kick: "x..x..x.", snare: "....x...", hat: "..x...x." },
    pad: [0, 3, 5, 3, 0, -2, 0, null],
    bass: [0, null, -2, null, -3, null, 0, null],
    lead: [12, null, 10, null, null, 7, null, null],
    fx: { room: 0.74, delay: 0.32, tone: 540, master: 0.66, slow: 2.6 },
    synth: {
      padType: "triangle",
      padVoices: 2,
      padDetune: 25,
      padAttack: 0.06,
      bassType: "triangle",
      leadType: "sine",
      kickPitch: 110,
      kickDecay: 0.3,
      hatFreq: 4500,
      hatDecay: 0.08,
    },
  },
  // 9 — Clean sine, cinematic, no drums, huge delay
  {
    name: "Intro de Neon",
    root: "D#",
    mode: "minor",
    bpm: 60,
    swing: 0,
    drums: { kick: "........", snare: "........", hat: "........" },
    pad: [0, null, 4, null, 7, null, 4, null],
    bass: [0, null, null, null, 0, null, null, null],
    lead: [14, 12, null, 10, null, 7, null, 12],
    fx: { room: 0.92, delay: 0.62, tone: 680, master: 0.6, slow: 4.0 },
    synth: {
      padType: "sine",
      padVoices: 2,
      padDetune: 2,
      padAttack: 0.25,
      padRelease: 1.8,
      padQ: 0.4,
      bassType: "sine",
      bassSub: false,
      bassQ: 0.5,
      leadType: "triangle",
      leadQ: 0.4,
    },
  },
  // 10 — Square-wave funk, complex drums, punchy stabs, max swing
  {
    name: "Vaporwave Groove",
    root: "F",
    mode: "minor",
    bpm: 90,
    swing: 0.07,
    drums: { kick: "x..x.x..", snare: "..x...x.", hat: ".xxx.xxx" },
    pad: [0, null, 3, null, 7, null, 10, null],
    bass: [0, -2, 0, 3, -4, -2, 0, 3],
    lead: [12, 14, null, 10, 12, null, 7, 10],
    fx: { room: 0.48, delay: 0.22, tone: 1100, master: 0.78, slow: 1.7 },
    synth: {
      padType: "square",
      padVoices: 2,
      padDetune: 4,
      padAttack: 0.01,
      padRelease: 0.3,
      bassType: "square",
      bassQ: 2.5,
      leadType: "square",
      leadQ: 1.2,
      kickPitch: 150,
      kickDecay: 0.18,
      snareTone: 240,
    },
  },
];

/* ── Per-track synth defaults ──────────────────────── */
const DEFAULT_SYNTH = {
  padType: "sawtooth",
  padVoices: 3,
  padDetune: 9,
  padAttack: 0.03,
  padRelease: 0.6,
  padQ: 0.8,
  bassType: "sawtooth",
  bassSub: true,
  bassQ: 1.2,
  leadType: "triangle",
  leadQ: 0.6,
  kickPitch: 140,
  kickDecay: 0.22,
  snareTone: 220,
  snareDecay: 0.18,
  hatFreq: 6500,
  hatDecay: 0.06,
};
function getSynth() {
  return { ...DEFAULT_SYNTH, ...(currentPreset.synth || {}) };
}

/* ── State ──────────────────────────────────────────── */
let audioCtx, masterGain, dryGain, delayNode, feedbackGain, wetGain, analyser, compressor;
let schedulerTimer = null,
  nextNoteTime = 0,
  stepIndex = 0,
  isPlaying = false;
let currentTrack = 0;
let currentPreset = structuredClone(PRESETS[0]);

/* ── DOM refs ───────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const trackListEl = $("trackList");
const playBtn = $("playBtn"),
  stopBtn = $("stopBtn"),
  prevBtn = $("prevBtn"),
  nextBtn = $("nextBtn");
const iconPlay = $("iconPlay"),
  iconPause = $("iconPause");
const tempoSlider = $("tempoSlider"),
  volumeSlider = $("volumeSlider");
const tempoValue = $("tempoValue"),
  volumeValue = $("volumeValue");
const scaleValue = $("scaleValue"),
  bpmValue = $("bpmValue"),
  stateValue = $("stateValue");
const nowTitle = $("nowTitle"),
  nowMeta = $("nowMeta");
const barsEl = $("bars"),
  stepsEl = $("steps");
const editorToggle = $("editorToggle"),
  editorPanel = $("editorPanel");
const presetEditor = $("presetEditor"),
  applyBtn = $("applyBtn"),
  editorStatus = $("editorStatus");
const barNodes = [],
  stepNodes = [];

/* ── UI ─────────────────────────────────────────────── */
function buildTrackList() {
  trackListEl.innerHTML = "";
  PRESETS.forEach((p, i) => {
    const el = document.createElement("div");
    el.className = "track-item" + (i === currentTrack ? " active" : "");
    el.dataset.index = i;
    el.innerHTML = `<span class="track-num">${i + 1}</span><span class="track-name">${p.name}</span><span class="track-info">${p.root} ${p.mode} ${p.bpm}</span>`;
    el.addEventListener("click", () => selectTrack(i, true));
    trackListEl.appendChild(el);
  });
}

function highlightTrack() {
  trackListEl.querySelectorAll(".track-item").forEach((el, i) => {
    el.classList.toggle("active", i === currentTrack);
    el.classList.toggle("playing", i === currentTrack && isPlaying);
  });
}

function updateNowPlaying() {
  const p = currentPreset;
  nowTitle.textContent = p.name;
  nowMeta.textContent = `${p.root} ${p.mode} \u2022 ${p.bpm} BPM`;
  syncEditor();
}

function syncEditor() {
  presetEditor.value = JSON.stringify(currentPreset, null, 2);
  editorStatus.textContent = "";
  editorStatus.className = "editor-status";
}

function validatePreset(p) {
  if (!p || typeof p !== "object") throw new Error("Must be an object");
  if (!ROOTS[p.root]) throw new Error("Invalid root");
  if (!SCALES[p.mode]) throw new Error("Mode must be major or minor");
  ["pad", "bass", "lead"].forEach((k) => {
    if (!Array.isArray(p[k]) || p[k].length !== 8) throw new Error(`${k} must be 8-step array`);
  });
  if (!p.drums) throw new Error("Missing drums");
  ["kick", "snare", "hat"].forEach((k) => {
    if (typeof p.drums[k] !== "string" || p.drums[k].length !== 8)
      throw new Error(`drums.${k} must be 8 chars`);
  });
}

function updateStats() {
  tempoValue.textContent = Math.round(Number(tempoSlider.value));
  volumeValue.textContent = Math.round(Number(volumeSlider.value) * 100) + "%";
  bpmValue.textContent = Math.round(Number(tempoSlider.value));
  scaleValue.textContent = `${currentPreset.root} ${currentPreset.mode}`;
  stateValue.textContent = isPlaying ? "Playing" : "Ready";
}

function updatePlayIcon() {
  iconPlay.classList.toggle("hidden", isPlaying);
  iconPause.classList.toggle("hidden", !isPlaying);
}

function highlightStep(idx) {
  stepNodes.forEach((n, i) => n.classList.toggle("active", i === idx));
}

/* ── Track selection ────────────────────────────────── */
function selectTrack(i, autoPlay) {
  const wasPlaying = isPlaying;
  if (wasPlaying) stopPlayback();
  currentTrack = i;
  currentPreset = structuredClone(PRESETS[i]);
  tempoSlider.value = currentPreset.bpm;
  volumeSlider.value = currentPreset.fx.master;
  updateNowPlaying();
  updateStats();
  highlightTrack();
  highlightStep(-1);
  if (audioCtx) updateEffects();
  if (autoPlay || wasPlaying) startPlayback();
}

function nextTrack() {
  selectTrack((currentTrack + 1) % PRESETS.length, true);
}
function prevTrack() {
  selectTrack((currentTrack - 1 + PRESETS.length) % PRESETS.length, true);
}

/* ── Audio engine ───────────────────────────────────── */
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  dryGain = audioCtx.createGain();
  wetGain = audioCtx.createGain();
  delayNode = audioCtx.createDelay(1.5);
  feedbackGain = audioCtx.createGain();
  analyser = audioCtx.createAnalyser();
  compressor = audioCtx.createDynamicsCompressor();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.85;
  dryGain.gain.value = 0.9;
  wetGain.gain.value = 0.22;
  delayNode.delayTime.value = 0.3;
  feedbackGain.gain.value = 0.3;
  masterGain.gain.value = Number(volumeSlider.value);
  dryGain.connect(compressor);
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);
  wetGain.connect(compressor);
  compressor.connect(masterGain);
  masterGain.connect(analyser);
  analyser.connect(audioCtx.destination);
  updateEffects();
  renderViz();
}

function updateEffects() {
  if (!audioCtx) return;
  const fx = currentPreset.fx,
    t = audioCtx.currentTime;
  delayNode.delayTime.setValueAtTime(Math.max(0.05, Math.min(0.8, fx.delay || 0.3)), t);
  feedbackGain.gain.setValueAtTime(Math.max(0, Math.min(0.75, (fx.room || 0.3) * 0.62)), t);
  wetGain.gain.setValueAtTime(Math.max(0, Math.min(0.45, (fx.room || 0.3) * 0.32)), t);
  masterGain.gain.setValueAtTime(Number(volumeSlider.value), t);
}

function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function degreeToMidi(deg, oct = 0) {
  const root = ROOTS[currentPreset.root],
    sc = SCALES[currentPreset.mode];
  const dir = deg < 0 ? -1 : 1,
    abs = Math.abs(deg);
  const o = Math.floor(abs / sc.length),
    idx = abs % sc.length;
  return root + dir * (sc[idx] + o * 12) + oct * 12;
}

function connectFX(src, amt = 0.3) {
  const s = audioCtx.createGain();
  s.gain.value = amt;
  src.connect(dryGain);
  src.connect(s);
  s.connect(delayNode);
  delayNode.connect(wetGain);
}

function env(g, t, a, d, sus, rel, pk = 1) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(pk, t + a);
  g.gain.linearRampToValueAtTime(Math.max(0.0001, sus), t + a + d);
  g.gain.setTargetAtTime(0.0001, t + a + d, Math.max(0.02, rel));
}

/* ── Instruments (timbre driven by preset.synth) ──── */
function playKick(t) {
  const sy = getSynth();
  const o = audioCtx.createOscillator(),
    g = audioCtx.createGain(),
    f = audioCtx.createBiquadFilter();
  o.type = "sine";
  o.frequency.setValueAtTime(sy.kickPitch, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.18);
  f.type = "lowpass";
  f.frequency.value = 180;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(1, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sy.kickDecay);
  o.connect(f);
  f.connect(g);
  connectFX(g, 0.04);
  o.start(t);
  o.stop(t + sy.kickDecay + 0.03);
}

function playSnare(t) {
  const sy = getSynth();
  const bs = audioCtx.sampleRate * sy.snareDecay,
    buf = audioCtx.createBuffer(1, bs, audioCtx.sampleRate),
    d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bs);
  const n = audioCtx.createBufferSource(),
    nf = audioCtx.createBiquadFilter(),
    ng = audioCtx.createGain();
  const to = audioCtx.createOscillator(),
    tg = audioCtx.createGain();
  n.buffer = buf;
  nf.type = "highpass";
  nf.frequency.value = 1800;
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.55, t + 0.005);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + sy.snareDecay);
  to.type = "triangle";
  to.frequency.setValueAtTime(sy.snareTone, t);
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.25, t + 0.003);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  n.connect(nf);
  nf.connect(ng);
  connectFX(ng, 0.12);
  to.connect(tg);
  connectFX(tg, 0.05);
  n.start(t);
  n.stop(t + sy.snareDecay + 0.02);
  to.start(t);
  to.stop(t + 0.13);
}

function playHat(t) {
  const sy = getSynth();
  const bs = audioCtx.sampleRate * sy.hatDecay,
    buf = audioCtx.createBuffer(1, bs, audioCtx.sampleRate),
    d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bs);
  const src = audioCtx.createBufferSource(),
    f = audioCtx.createBiquadFilter(),
    g = audioCtx.createGain();
  src.buffer = buf;
  f.type = "highpass";
  f.frequency.value = sy.hatFreq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sy.hatDecay * 0.8);
  src.connect(f);
  f.connect(g);
  connectFX(g, 0.04);
  src.start(t);
  src.stop(t + sy.hatDecay);
}

function playPad(t, freq, dur, cut = 1200, gv = 0.14) {
  const sy = getSynth();
  const mix = audioCtx.createGain(),
    f = audioCtx.createBiquadFilter(),
    a = audioCtx.createGain();
  f.type = "lowpass";
  f.frequency.setValueAtTime(cut, t);
  f.Q.value = sy.padQ;
  for (let i = 0; i < sy.padVoices; i++) {
    const det = sy.padVoices === 1 ? 0 : ((i / (sy.padVoices - 1)) * 2 - 1) * sy.padDetune;
    const o = audioCtx.createOscillator();
    o.type = sy.padType;
    o.frequency.setValueAtTime(freq, t);
    o.detune.value = det;
    o.connect(mix);
    o.start(t);
    o.stop(t + dur + 0.3);
  }
  env(a, t, sy.padAttack, 0.18, gv, dur * sy.padRelease, gv);
  mix.connect(f);
  f.connect(a);
  connectFX(a, 0.28);
}

function playBass(t, freq, dur, cut = 420, gv = 0.18) {
  const sy = getSynth();
  const o = audioCtx.createOscillator(),
    f = audioCtx.createBiquadFilter(),
    a = audioCtx.createGain();
  o.type = sy.bassType;
  o.frequency.setValueAtTime(freq, t);
  f.type = "lowpass";
  f.frequency.setValueAtTime(cut, t);
  f.Q.value = sy.bassQ;
  if (sy.bassSub) {
    const sub = audioCtx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(freq / 2, t);
    sub.connect(f);
    sub.start(t);
    sub.stop(t + dur + 0.08);
  }
  env(a, t, 0.008, 0.1, gv, Math.max(0.06, dur * 0.3), gv);
  o.connect(f);
  f.connect(a);
  connectFX(a, 0.08);
  o.start(t);
  o.stop(t + dur + 0.08);
}

function playLead(t, freq, dur, cut = 1400, gv = 0.08) {
  const sy = getSynth();
  const o = audioCtx.createOscillator(),
    a = audioCtx.createGain(),
    f = audioCtx.createBiquadFilter();
  o.type = sy.leadType;
  o.frequency.setValueAtTime(freq, t);
  f.type = "lowpass";
  f.frequency.setValueAtTime(cut, t);
  f.Q.value = sy.leadQ;
  env(a, t, 0.01, 0.08, gv, Math.max(0.08, dur * 0.3), gv);
  o.connect(f);
  f.connect(a);
  connectFX(a, 0.22);
  o.start(t);
  o.stop(t + dur + 0.1);
}

/* ── Sequencer ──────────────────────────────────────── */
function stepDur() {
  return (60 / Number(tempoSlider.value) / 2) * Number(currentPreset.fx.slow || 2);
}

function triggerStep(step, t) {
  const sd = stepDur(),
    sh = sd * 0.85,
    lo = sd * 1.6;
  if (currentPreset.drums.kick[step] === "x") playKick(t);
  if (currentPreset.drums.snare[step] === "x") playSnare(t);
  if (currentPreset.drums.hat[step] === "x") playHat(t);
  const bd = currentPreset.bass[step];
  if (bd != null)
    playBass(
      t,
      midiToFreq(degreeToMidi(bd, -1)),
      sh,
      Math.max(240, currentPreset.fx.tone * 0.5),
      0.18
    );
  const pd = currentPreset.pad[step];
  if (pd != null) playPad(t, midiToFreq(degreeToMidi(pd, 0)), lo, currentPreset.fx.tone, 0.12);
  const ld = currentPreset.lead[step];
  if (ld != null)
    playLead(
      t + 0.01,
      midiToFreq(degreeToMidi(ld, 0)),
      sh * 0.9,
      currentPreset.fx.tone * 1.25,
      0.07
    );
  highlightStep(step);
}

function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + 0.12) {
    const sw = (stepIndex % 2 === 1 ? currentPreset.swing || 0 : 0) * stepDur();
    triggerStep(stepIndex, nextNoteTime + sw);
    nextNoteTime += stepDur();
    stepIndex = (stepIndex + 1) % 8;
  }
}

/* ── Playback ───────────────────────────────────────── */
function startPlayback() {
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();
  if (isPlaying) {
    stopPlayback();
    return;
  }
  updateEffects();
  isPlaying = true;
  nextNoteTime = audioCtx.currentTime + 0.05;
  stepIndex = 0;
  schedulerTimer = setInterval(scheduler, 25);
  updateStats();
  updatePlayIcon();
  highlightTrack();
}

function stopPlayback() {
  isPlaying = false;
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  highlightStep(-1);
  updateStats();
  updatePlayIcon();
  highlightTrack();
}

/* ── Visualizer ─────────────────────────────────────── */
function renderViz() {
  if (!analyser) {
    requestAnimationFrame(renderViz);
    return;
  }
  const d = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(d);
  for (let i = 0; i < barNodes.length; i++) {
    const v = d[i % d.length] / 255;
    barNodes[i].style.height = `${8 + v * 120}px`;
    barNodes[i].style.opacity = 0.35 + v * 0.8;
  }
  requestAnimationFrame(renderViz);
}

/* ── Init ───────────────────────────────────────────── */
function init() {
  buildTrackList();
  for (let i = 0; i < 32; i++) {
    const b = document.createElement("div");
    b.className = "bar";
    barsEl.appendChild(b);
    barNodes.push(b);
  }
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("div");
    s.className = "step";
    s.textContent = i + 1;
    stepsEl.appendChild(s);
    stepNodes.push(s);
  }
  selectTrack(0, false);
}

/* ── Events ─────────────────────────────────────────── */
playBtn.addEventListener("click", startPlayback);
stopBtn.addEventListener("click", stopPlayback);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);
tempoSlider.addEventListener("input", updateStats);
volumeSlider.addEventListener("input", () => {
  volumeValue.textContent = Math.round(Number(volumeSlider.value) * 100) + "%";
  if (masterGain && audioCtx)
    masterGain.gain.setValueAtTime(Number(volumeSlider.value), audioCtx.currentTime);
});
editorToggle.addEventListener("click", () => {
  editorPanel.classList.toggle("hidden");
  editorToggle.textContent = editorPanel.classList.contains("hidden")
    ? "Edit Preset JSON"
    : "Hide Editor";
});
applyBtn.addEventListener("click", () => {
  try {
    const p = JSON.parse(presetEditor.value);
    validatePreset(p);
    currentPreset = p;
    if (audioCtx) updateEffects();
    updateNowPlaying();
    updateStats();
    editorStatus.textContent = "Preset applied.";
    editorStatus.className = "editor-status ok";
  } catch (e) {
    editorStatus.textContent = `Invalid: ${e.message}`;
    editorStatus.className = "editor-status err";
  }
});
window.addEventListener("beforeunload", () => {
  stopPlayback();
  if (audioCtx) audioCtx.close();
});

init();
