/* ====================================================================
   Clausic — Rock · Pop · Ambient
   6 procedurally-generated NoteSequence compositions for html-midi-player
   ==================================================================== */

// --------------- Scale & Theory Helpers ---------------

const SCALES = {
  blues:       [0, 3, 5, 6, 7, 10],       // 1 b3 4 b5 5 b7
  minor:       [0, 2, 3, 5, 7, 8, 10],     // natural minor
  major:       [0, 2, 4, 5, 7, 9, 11],
  pentatonic:  [0, 2, 4, 7, 9],            // major pentatonic
  lydian:      [0, 2, 4, 6, 7, 9, 11],     // major with #4
};

const ROOTS = { C: 60, D: 62, E: 64, F: 65, 'F#': 66, G: 67, A: 69, Bb: 70, B: 71 };

/** Map a scale degree (0-based, can exceed one octave) to a MIDI pitch */
function scaleNote(root, scale, degree) {
  if (degree == null) return null;
  const len = scale.length;
  const octave = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  return root + scale[idx] + octave * 12;
}

/** Convert beat number to seconds */
function beatToSec(beat, bpm) {
  return (beat * 60) / bpm;
}

// --------------- NoteSequence Generator ---------------

function generate(cfg) {
  const { root, scale, bpm, bars, chords, melody, bass, drums, programs, arpeggios } = cfg;
  const notes = [];
  const sc = SCALES[scale];
  const beatDur = 60 / bpm;           // duration of one quarter note in seconds
  const eighthDur = beatDur / 2;      // duration of one eighth note
  const beatsPerBar = 4;
  const eighthsPerBar = 8;
  const totalBeats = bars * beatsPerBar;
  const totalTime = totalBeats * beatDur;

  // ---- Chords / Pads ----
  if (chords && chords.length > 0) {
    for (let bar = 0; bar < bars; bar++) {
      const chord = chords[bar % chords.length];
      const startBeat = bar * beatsPerBar;
      const start = beatToSec(startBeat, bpm);
      const end = beatToSec(startBeat + beatsPerBar, bpm);
      chord.forEach(deg => {
        const pitch = scaleNote(root, sc, deg);
        if (pitch != null) {
          notes.push({
            pitch,
            startTime: start,
            endTime: end,
            velocity: 50 + Math.floor(Math.random() * 15),
            program: programs.pad,
          });
        }
      });
    }
  }

  // ---- Arpeggios (for ambient tracks) ----
  if (arpeggios && arpeggios.length > 0) {
    const arpRoot = root - 12; // one octave lower for arps base, or use provided
    let arpIdx = 0;
    for (let bar = 0; bar < bars; bar++) {
      const chord = chords ? chords[bar % chords.length] : [0, 2, 4];
      for (let eighth = 0; eighth < eighthsPerBar; eighth++) {
        const arpDeg = arpeggios[arpIdx % arpeggios.length];
        arpIdx++;
        if (arpDeg == null) continue;
        // Map arp degree into the current chord
        const chordIdx = ((arpDeg % chord.length) + chord.length) % chord.length;
        const octShift = Math.floor(arpDeg / chord.length);
        const deg = chord[chordIdx] + octShift * (sc.length);
        const pitch = scaleNote(root, sc, deg);
        if (pitch == null) continue;
        const startBeat = bar * beatsPerBar + eighth * 0.5;
        const start = beatToSec(startBeat, bpm);
        const dur = eighthDur * (1.5 + Math.random() * 1.5); // longer, overlapping notes
        notes.push({
          pitch,
          startTime: start,
          endTime: start + dur,
          velocity: 35 + Math.floor(Math.random() * 20),
          program: programs.melody,
        });
      }
    }
  }

  // ---- Melody ----
  if (melody && melody.length > 0) {
    let melIdx = 0;
    for (let bar = 0; bar < bars; bar++) {
      for (let eighth = 0; eighth < eighthsPerBar; eighth++) {
        const deg = melody[melIdx % melody.length];
        melIdx++;
        if (deg == null) continue;
        const pitch = scaleNote(root, sc, deg);
        if (pitch == null) continue;
        const startBeat = bar * beatsPerBar + eighth * 0.5;
        const start = beatToSec(startBeat, bpm);
        // Vary note lengths: some eighth, some quarter
        const isLong = (eighth % 2 === 0 && melody[(melIdx) % melody.length] == null);
        const dur = isLong ? beatDur : eighthDur * 0.9;
        notes.push({
          pitch,
          startTime: start,
          endTime: start + dur,
          velocity: 70 + Math.floor(Math.random() * 25),
          program: programs.melody,
        });
      }
    }
  }

  // ---- Bass ----
  if (bass && bass.length > 0) {
    let bassIdx = 0;
    for (let bar = 0; bar < bars; bar++) {
      for (let beat = 0; beat < beatsPerBar; beat++) {
        const deg = bass[bassIdx % bass.length];
        bassIdx++;
        if (deg == null) continue;
        const pitch = scaleNote(root - 24, sc, deg); // two octaves below root
        if (pitch == null) continue;
        const startBeat = bar * beatsPerBar + beat;
        const start = beatToSec(startBeat, bpm);
        const dur = beatDur * 0.85;
        notes.push({
          pitch,
          startTime: start,
          endTime: start + dur,
          velocity: 75 + Math.floor(Math.random() * 20),
          program: programs.bass,
        });
      }
    }
  }

  // ---- Drums ----
  if (drums) {
    const drumMap = { kick: 36, snare: 38, hat: 42, openHat: 46, crash: 49, ride: 51 };
    for (const [name, pattern] of Object.entries(drums)) {
      if (!pattern || pattern.length === 0) continue;
      const drumPitch = drumMap[name] || 38;
      let patIdx = 0;
      for (let bar = 0; bar < bars; bar++) {
        for (let eighth = 0; eighth < eighthsPerBar; eighth++) {
          const hit = pattern[patIdx % pattern.length];
          patIdx++;
          if (!hit) continue;
          const startBeat = bar * beatsPerBar + eighth * 0.5;
          const start = beatToSec(startBeat, bpm);
          const vel = (typeof hit === 'number') ? hit : (70 + Math.floor(Math.random() * 25));
          notes.push({
            pitch: drumPitch,
            startTime: start,
            endTime: start + 0.15,
            velocity: vel,
            isDrum: true,
          });
        }
      }
    }
  }

  return {
    notes,
    tempos: [{ time: 0, qpm: bpm }],
    totalTime,
  };
}

// --------------- Track Configurations ---------------

const tracks = [

  // ── 0: Neon City Riff — Rock · E blues · 132 BPM ──
  {
    root: ROOTS.E,
    scale: 'blues',
    bpm: 132,
    bars: 16,
    // E blues power chords: E5, G5, A5, Bb5 (i, bIII, IV, bV)
    chords: [
      [0, 4, 6],       // E power (root, 5th, octave in blues scale degrees)
      [0, 4, 6],       // E power again
      [2, 4, 8],       // A power
      [1, 3, 7],       // G power
    ],
    // Bluesy melody: mix of blues licks with rests
    melody: [
      4, 5, 6, null, 4, 3, 2, null,
      0, 2, 3, 4, null, null, 5, 4,
      3, 2, 0, null, 2, 3, 4, 5,
      6, null, 5, 4, 3, null, 2, 0,
      4, 4, 5, 6, null, 8, 7, 6,
      5, null, 4, 3, 2, 3, 4, null,
      0, null, 2, 3, 5, 4, 3, 2,
      0, null, null, null, 2, 4, 5, 6,
    ],
    // Bass follows chord roots with walking passing tones
    bass: [
      0, null, 2, 0,
      0, 4, 2, null,
      2, null, 4, 2,
      1, null, 0, 1,
      0, 2, 0, null,
      0, null, 4, 3,
      2, 4, 2, null,
      1, 0, 1, null,
    ],
    // Driving rock drums
    drums: {
      kick:    [1, 0, 0, 0, 1, 0, 1, 0],
      snare:   [0, 0, 1, 0, 0, 0, 1, 0],
      hat:     [1, 1, 1, 1, 1, 1, 1, 1],
      crash:   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // crash on bar 1 beat 1
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    programs: { melody: 30, bass: 34, pad: 29 }, // DistortionGuitar, ElectricBassPick, OverdrivenGuitar
  },

  // ── 1: Desert Storm — Rock · D minor · 92 BPM ──
  {
    root: ROOTS.D,
    scale: 'minor',
    bpm: 92,
    bars: 16,
    // Dm, Bb, C, Am (i, bVI, bVII, v)
    chords: [
      [0, 2, 4],       // Dm (D F A)
      [5, 7, 9],       // Bb
      [6, 8, 10],      // C
      [4, 6, 8],       // Am
    ],
    // Moody, angular minor melody with tremolo feel
    melody: [
      7, null, 6, 5, 4, null, 3, 2,
      0, null, null, 2, 4, 5, null, 4,
      6, 7, null, 6, 5, 4, null, 2,
      3, null, 4, null, 2, 0, null, null,
      7, 8, 9, null, 7, 6, 5, null,
      4, null, 2, 3, 4, null, 6, 5,
      4, 3, 2, null, 0, null, 2, 4,
      5, null, null, 4, 3, 2, 0, null,
    ],
    bass: [
      0, null, 0, 2,
      5, null, 5, 4,
      6, null, 6, 4,
      4, null, 2, 0,
      0, 2, 0, null,
      5, null, 6, 5,
      6, 4, 6, null,
      4, 2, 0, null,
    ],
    // Heavy, half-time feel drums
    drums: {
      kick:    [1, 0, 0, 0, 0, 0, 1, 0],
      snare:   [0, 0, 0, 0, 1, 0, 0, 0],
      hat:     [1, 0, 1, 0, 1, 0, 1, 0],
      ride:    [0, 1, 0, 1, 0, 1, 0, 1],
      crash:   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    programs: { melody: 29, bass: 33, pad: 48 }, // OverdrivenGuitar, ElectricBass, StringEnsemble
  },

  // ── 2: Summer Signal — Pop · C major · 118 BPM ──
  {
    root: ROOTS.C,
    scale: 'major',
    bpm: 118,
    bars: 16,
    // C, G, Am, F (I, V, vi, IV) — classic pop
    chords: [
      [0, 2, 4],       // C (C E G)
      [4, 6, 8],       // G
      [5, 7, 9],       // Am
      [3, 5, 7],       // F
    ],
    // Bright, catchy pop melody
    melody: [
      4, 5, 7, null, 7, 5, 4, null,
      2, 4, 5, 7, null, 9, 7, 5,
      4, null, 5, 4, 2, null, 0, 2,
      4, null, null, null, 2, 4, 5, null,
      7, 9, 7, 5, 4, null, 5, 7,
      9, null, 11, 9, 7, null, 5, 4,
      5, 7, 5, 4, 2, null, 4, null,
      7, null, 5, null, 4, 2, 0, null,
    ],
    bass: [
      0, null, 0, 2,
      4, null, 4, 2,
      5, null, 5, 4,
      3, null, 3, 2,
      0, 2, 0, null,
      4, null, 2, 4,
      5, 4, 5, null,
      3, null, 2, 0,
    ],
    // Upbeat pop drums with clap-style snare
    drums: {
      kick:    [1, 0, 0, 1, 1, 0, 0, 0],
      snare:   [0, 0, 1, 0, 0, 0, 1, 0],
      hat:     [1, 1, 1, 1, 1, 1, 1, 1],
      openHat: [0, 0, 0, 0, 0, 0, 0, 1],
    },
    programs: { melody: 80, bass: 38, pad: 4 }, // SynthLeadSquare, SynthBass, ElectricPiano
  },

  // ── 3: Midnight Drive — Pop · A minor · 96 BPM ──
  {
    root: ROOTS.A,
    scale: 'minor',
    bpm: 96,
    bars: 16,
    // Am, F, C, G (i, bVI, bIII, bVII)
    chords: [
      [0, 2, 4],       // Am
      [5, 7, 9],       // F
      [2, 4, 6],       // C
      [6, 8, 10],      // G
    ],
    // Moody, smooth pop melody with longer phrases
    melody: [
      4, null, 5, 4, 2, null, null, null,
      0, 2, 4, null, 5, 6, 5, null,
      4, null, 2, null, 4, 5, 7, null,
      6, 5, 4, null, 2, null, null, null,
      7, null, 8, 7, 5, 4, null, 2,
      4, null, null, 5, 7, null, 9, 7,
      5, null, 4, 2, 0, null, 2, null,
      4, null, 5, null, 4, 2, 0, null,
    ],
    bass: [
      0, null, 0, null,
      5, null, 5, 4,
      2, null, 2, 4,
      6, null, 4, 2,
      0, null, 2, 0,
      5, null, 4, 5,
      2, null, 4, 2,
      6, null, 4, null,
    ],
    drums: {
      kick:    [1, 0, 0, 0, 0, 0, 1, 0],
      snare:   [0, 0, 1, 0, 0, 1, 0, 0],
      hat:     [1, 0, 1, 1, 1, 0, 1, 1],
      ride:    [0, 1, 0, 0, 0, 1, 0, 0],
    },
    programs: { melody: 4, bass: 33, pad: 89 }, // ElectricPiano, ElectricBass, PadWarm
  },

  // ── 4: Glass Forest — Ambient · F# pentatonic · 52 BPM ──
  {
    root: ROOTS['F#'],
    scale: 'pentatonic',
    bpm: 52,
    bars: 16,
    // Wide open voicings cycling through pentatonic clusters
    chords: [
      [0, 2, 4],       // F# A# C#
      [1, 3, 5],       // G# C# E#
      [2, 4, 6],       // A# E# G#
      [0, 3, 5],       // F# C# E#
    ],
    // No standard melody — use arpeggios instead
    melody: null,
    // Slow crystalline arpeggios
    arpeggios: [
      0, null, 1, null, 2, null, 3, null,
      2, null, 1, null, 0, null, null, null,
      1, null, 2, null, 3, null, 4, null,
      3, null, 2, null, 1, null, null, null,
      0, null, null, 2, null, 3, null, 4,
      null, 3, null, 2, null, 1, null, null,
      2, null, 3, null, 5, null, 4, null,
      3, null, null, 2, null, 1, null, null,
    ],
    bass: [
      0, null, null, null,
      1, null, null, null,
      2, null, null, null,
      0, null, null, null,
    ],
    drums: null,   // No drums for ambient
    programs: { melody: 11, bass: 88, pad: 89 }, // Vibraphone, PadNewAge, PadWarm
  },

  // ── 5: Ocean Drift — Ambient · C Lydian · 44 BPM ──
  {
    root: ROOTS.C,
    scale: 'lydian',
    bpm: 44,
    bars: 16,
    // Lydian chord voicings: Cmaj7, D/C, Em, F#dim/C
    chords: [
      [0, 2, 4, 6],    // C E G B (Cmaj7)
      [1, 3, 5, 7],    // D F# A C
      [2, 4, 6],       // E G B
      [0, 3, 6],       // C F# B (lydian tension)
    ],
    melody: null,
    // Slow oceanic arpeggios
    arpeggios: [
      0, null, null, 1, null, null, 2, null,
      null, 3, null, null, 2, null, null, 1,
      null, null, 0, null, null, 1, null, 2,
      null, 3, null, null, null, 2, null, null,
      0, null, 2, null, null, 3, null, null,
      4, null, null, 3, null, 2, null, null,
      1, null, null, null, 0, null, null, 1,
      null, 2, null, null, null, 1, null, null,
    ],
    bass: [
      0, null, null, null,
      1, null, null, null,
      2, null, null, null,
      0, null, null, null,
    ],
    drums: null,   // No drums for ambient
    programs: { melody: 88, bass: 48, pad: 89 }, // PadNewAge, StringEnsemble, PadWarm
  },
];

// --------------- Visualization & Tab Helpers ---------------

function stopAllPlayers() {
  document.querySelectorAll('midi-player').forEach(p => { try { p.stop(); } catch (_) {} });
}

function zoomVisualizer(viz) {
  const svg = viz.querySelector('svg');
  if (!svg) return;
  const rects = svg.querySelectorAll('rect[data-note]');
  if (!rects.length) return;
  let minY = Infinity, maxY = -Infinity;
  rects.forEach(r => {
    const y = parseFloat(r.getAttribute('y') || 0), h = parseFloat(r.getAttribute('height') || 0);
    if (y < minY) minY = y;
    if (y + h > maxY) maxY = y + h;
  });
  if (!isFinite(minY)) return;
  const vb = svg.getAttribute('viewBox');
  if (!vb) return;
  const [vx, , vw, vh] = vb.split(' ').map(Number);
  const m = vh * 0.05;
  svg.setAttribute('viewBox', `${vx} ${Math.max(0, minY - m)} ${vw} ${Math.min(vh, maxY - minY + m * 2)}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}

function observeViz(viz) {
  const obs = new MutationObserver(() => {
    const svg = viz.querySelector('svg');
    if (svg && svg.querySelectorAll('rect[data-note]').length > 0) { zoomVisualizer(viz); obs.disconnect(); }
  });
  obs.observe(viz, { childList: true, subtree: true, attributes: true });
  zoomVisualizer(viz);
}

// --------------- Initialization ---------------

document.addEventListener('DOMContentLoaded', () => {

  // Generate and assign NoteSequences to each player/visualizer
  tracks.forEach((cfg, i) => {
    const ns = generate(cfg);
    const player = document.querySelector(`#piece-new-${i} midi-player`);
    const viz = document.querySelector(`#viz-${i}`);

    if (viz) {
      viz.noteSequence = ns;
    }
    if (player) {
      player.noteSequence = ns;
    }
  });

  // Observe all visualizers for zoom
  document.querySelectorAll('midi-visualizer').forEach(observeViz);

  // Tab switching
  document.querySelectorAll('.tabs').forEach(nav => {
    const tabs = nav.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        stopAllPlayers();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const parent = tab.closest('.collection') || document.body;
        parent.querySelectorAll('.piece').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`piece-${tab.dataset.track}`);
        if (target) {
          target.classList.add('active');
          target.querySelectorAll('midi-visualizer').forEach(observeViz);
        }
      });
    });
  });
});
