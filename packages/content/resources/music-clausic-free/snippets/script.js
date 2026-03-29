/* ====================================================================
   Clausic — Free Compositions
   10 procedurally-generated NoteSequence compositions for html-midi-player
   ==================================================================== */

// --------------- Scale & Theory Helpers ---------------

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  blues: [0, 3, 5, 6, 7, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
};

const ROOTS = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };

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
  const { root, scale, bpm, bars, chords, melody, bass, drums, programs } = cfg;
  const notes = [];
  const sc = SCALES[scale];
  const beatDur = 60 / bpm;
  const eighthDur = beatDur / 2;
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
      chord.forEach((deg) => {
        const pitch = scaleNote(root, sc, deg);
        if (pitch != null) {
          notes.push({
            pitch,
            startTime: start,
            endTime: end,
            velocity: 45 + Math.floor(Math.random() * 15),
            program: programs.pad,
          });
        }
      });
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
        const isLong = eighth % 2 === 0 && melody[melIdx % melody.length] == null;
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

  // ---- Counter-melody / harmony (optional) ----
  if (cfg.counter && cfg.counter.length > 0) {
    let cIdx = 0;
    for (let bar = 0; bar < bars; bar++) {
      for (let eighth = 0; eighth < eighthsPerBar; eighth++) {
        const deg = cfg.counter[cIdx % cfg.counter.length];
        cIdx++;
        if (deg == null) continue;
        const pitch = scaleNote(root, sc, deg);
        if (pitch == null) continue;
        const startBeat = bar * beatsPerBar + eighth * 0.5;
        const start = beatToSec(startBeat, bpm);
        const dur = eighthDur * 0.85;
        notes.push({
          pitch,
          startTime: start,
          endTime: start + dur,
          velocity: 50 + Math.floor(Math.random() * 15),
          program: programs.counter || programs.melody,
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
        const pitch = scaleNote(root - 24, sc, deg);
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
          const vel =
            typeof hit === "number" && hit > 1 ? hit : 70 + Math.floor(Math.random() * 25);
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
  // ── 0: Open Road — C major · 120 BPM · Adventure begins ──
  {
    root: ROOTS.C,
    scale: "major",
    bpm: 120,
    bars: 16,
    // C, F, G, C (I, IV, V, I) — classic adventure
    chords: [
      [0, 2, 4], // C (C E G)
      [3, 5, 7], // F (F A C)
      [4, 6, 8], // G (G B D)
      [0, 2, 4], // C (C E G)
    ],
    // Bright, bouncy, adventurous melody
    melody: [
      4,
      5,
      7,
      null,
      7,
      9,
      7,
      5,
      4,
      null,
      2,
      4,
      5,
      null,
      7,
      null,
      9,
      7,
      5,
      4,
      2,
      null,
      4,
      5,
      7,
      null,
      null,
      5,
      4,
      2,
      0,
      null,
      7,
      9,
      11,
      null,
      9,
      7,
      5,
      null,
      4,
      5,
      7,
      9,
      null,
      11,
      9,
      7,
      5,
      null,
      4,
      2,
      0,
      null,
      2,
      4,
      5,
      7,
      null,
      5,
      4,
      null,
      2,
      null,
    ],
    bass: [
      0,
      null,
      0,
      2,
      3,
      null,
      3,
      2,
      4,
      null,
      4,
      2,
      0,
      null,
      2,
      0,
      0,
      2,
      0,
      null,
      3,
      null,
      2,
      3,
      4,
      null,
      2,
      4,
      0,
      null,
      2,
      0,
    ],
    // Upbeat, driving drums
    drums: {
      kick: [1, 0, 0, 1, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat: [1, 1, 1, 1, 1, 1, 1, 1],
      crash: [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0,
      ],
    },
    programs: { melody: 0, bass: 33, pad: 48 }, // Piano, ElectricBass, Strings
  },

  // ── 1: Emerald Canopy — E minor · 68 BPM · Mystery ──
  {
    root: ROOTS.E,
    scale: "minor",
    bpm: 68,
    bars: 16,
    // Em, Am, Bm, Em (i, iv, v, i) — dark, mysterious
    chords: [
      [0, 2, 4], // Em
      [3, 5, 7], // Am
      [4, 6, 8], // Bm
      [0, 2, 4], // Em
    ],
    // Sparse, eerie melody with lots of rests — forest sounds
    melody: [
      4,
      null,
      null,
      null,
      5,
      null,
      null,
      null,
      3,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      5,
      null,
      null,
      3,
      null,
      null,
      null,
      2,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      7,
      null,
      null,
      5,
      4,
      null,
      null,
      null,
      null,
      null,
      3,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      3,
      null,
      null,
      2,
      null,
    ],
    counter: [
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    bass: [0, null, null, null, 3, null, null, null, 4, null, null, null, 0, null, null, null],
    // Very sparse drums — occasional soft kick, no snare
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0],
      hat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    programs: { melody: 73, bass: 33, pad: 88, counter: 9 }, // Flute, ElectricBass, PadNewAge, Glockenspiel
  },

  // ── 2: Hollow Peak — D minor · 56 BPM · Dark caverns ──
  {
    root: ROOTS.D,
    scale: "minor",
    bpm: 56,
    bars: 16,
    // Dm, Gm, Bb, A (i, iv, bVI, V) — dark, cavernous
    chords: [
      [0, 2, 4], // Dm
      [3, 5, 7], // Gm
      [5, 7, 9], // Bb
      [4, 6, 8], // A (borrowed V)
    ],
    // Very slow, echoing, sparse — dripping cave melody
    melody: [
      7,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      5,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      3,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      5,
      null,
      null,
      null,
      null,
      null,
      7,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      3,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
    ],
    counter: [
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    bass: [0, null, null, null, 3, null, null, null, 5, null, null, null, 4, null, null, null],
    // NO drums — cave ambiance
    drums: null,
    programs: { melody: 11, bass: 33, pad: 89, counter: 9 }, // Vibraphone, ElectricBass, PadWarm, Glockenspiel
  },

  // ── 3: Harbor Dawn — A major · 92 BPM · Waterside calm ──
  {
    root: ROOTS.A,
    scale: "major",
    bpm: 92,
    bars: 16,
    // A, D, E, A (I, IV, V, I) — peaceful, flowing
    chords: [
      [0, 2, 4], // A
      [3, 5, 7], // D
      [4, 6, 8], // E
      [0, 2, 4], // A
    ],
    // Gentle, flowing melody like water
    melody: [
      4,
      null,
      5,
      4,
      2,
      null,
      null,
      null,
      0,
      2,
      4,
      null,
      5,
      7,
      null,
      5,
      4,
      null,
      2,
      null,
      4,
      5,
      7,
      null,
      9,
      null,
      7,
      5,
      4,
      null,
      null,
      null,
      7,
      null,
      9,
      7,
      5,
      null,
      4,
      null,
      2,
      4,
      null,
      5,
      7,
      null,
      9,
      null,
      7,
      null,
      5,
      null,
      4,
      2,
      null,
      0,
      2,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
    ],
    bass: [
      0,
      null,
      0,
      2,
      3,
      null,
      3,
      2,
      4,
      null,
      4,
      2,
      0,
      null,
      2,
      0,
      0,
      null,
      2,
      0,
      3,
      null,
      2,
      3,
      4,
      null,
      2,
      4,
      0,
      null,
      null,
      null,
    ],
    // Light drums — ride cymbal feel
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0],
      snare: [0, 0, 1, 0, 0, 0, 0, 0],
      ride: [1, 0, 1, 0, 1, 0, 1, 0],
      hat: [0, 1, 0, 1, 0, 1, 0, 1],
    },
    programs: { melody: 73, bass: 33, pad: 48 }, // Flute, ElectricBass, Strings
  },

  // ── 4: Starboard Waltz — F major · 100 BPM · Jazz cruise ──
  {
    root: ROOTS.F,
    scale: "major",
    bpm: 100,
    bars: 16,
    // Fmaj7, Gm7, Am7, Bbmaj7 (I7, ii7, iii7, IV7) — jazzy extensions
    chords: [
      [0, 2, 4, 6], // Fmaj7 (F A C E)
      [1, 3, 5, 7], // Gm7
      [2, 4, 6, 8], // Am7
      [3, 5, 7, 9], // Bbmaj7
    ],
    // Jazzy, swung melody with chromatic passing tones
    melody: [
      4,
      null,
      5,
      6,
      null,
      5,
      4,
      null,
      2,
      4,
      null,
      5,
      6,
      null,
      7,
      null,
      9,
      null,
      7,
      6,
      5,
      null,
      4,
      2,
      4,
      null,
      null,
      null,
      5,
      6,
      7,
      null,
      9,
      11,
      null,
      9,
      7,
      null,
      6,
      5,
      4,
      null,
      6,
      null,
      7,
      9,
      null,
      7,
      6,
      null,
      5,
      4,
      2,
      null,
      4,
      null,
      5,
      null,
      null,
      4,
      2,
      null,
      null,
      null,
    ],
    counter: [
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      6,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
    ],
    bass: [
      0,
      null,
      2,
      4,
      1,
      null,
      3,
      1,
      2,
      null,
      4,
      2,
      3,
      null,
      1,
      3,
      0,
      2,
      0,
      null,
      1,
      null,
      3,
      1,
      2,
      null,
      0,
      2,
      3,
      null,
      1,
      null,
    ],
    // Swung jazz drums — ride-driven, brushy
    drums: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0],
      snare: [0, 0, 0, 1, 0, 0, 0, 1],
      ride: [1, 0, 1, 1, 1, 0, 1, 1],
      hat: [0, 0, 0, 0, 0, 1, 0, 0],
    },
    programs: { melody: 4, bass: 33, pad: 0, counter: 11 }, // ElectricPiano, ElectricBass, Piano, Vibraphone
  },

  // ── 5: Phantom Bells — B diminished · 48 BPM · Haunting ──
  {
    root: ROOTS.B,
    scale: "diminished",
    bpm: 48,
    bars: 16,
    // Dissonant diminished clusters — eerie, unsettling
    chords: [
      [0, 2, 4], // Bdim cluster
      [1, 3, 5], // C#dim cluster
      [0, 3, 6], // tritone spacing
      [1, 4, 7], // tritone spacing
    ],
    // Haunting, sparse — ghost-like fragments
    melody: [
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      5,
      null,
      null,
      null,
      null,
      null,
      3,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      6,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      3,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      5,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
    ],
    counter: [
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    bass: [0, null, null, null, 1, null, null, null, 0, null, null, null, 1, null, null, null],
    // NO drums — eerie silence
    drums: null,
    programs: { melody: 88, bass: 33, pad: 89, counter: 9 }, // PadNewAge, ElectricBass, PadWarm, Glockenspiel
  },

  // ── 6: Golden Savanna — G major · 104 BPM · Tropical ──
  {
    root: ROOTS.G,
    scale: "major",
    bpm: 104,
    bars: 16,
    // G, C, D, Em (I, IV, V, vi) — bright tropical
    chords: [
      [0, 2, 4], // G (G B D)
      [3, 5, 7], // C (C E G)
      [4, 6, 8], // D (D F# A)
      [5, 7, 9], // Em (E G B)
    ],
    // Bouncy, tropical marimba melody
    melody: [
      4,
      5,
      7,
      null,
      9,
      7,
      5,
      4,
      2,
      4,
      5,
      7,
      null,
      9,
      null,
      7,
      5,
      4,
      null,
      2,
      4,
      5,
      7,
      9,
      11,
      null,
      9,
      7,
      5,
      null,
      4,
      null,
      7,
      9,
      11,
      null,
      9,
      7,
      5,
      null,
      4,
      5,
      7,
      null,
      9,
      11,
      9,
      7,
      5,
      null,
      4,
      2,
      0,
      2,
      4,
      null,
      5,
      7,
      null,
      9,
      7,
      5,
      4,
      null,
    ],
    bass: [
      0,
      null,
      0,
      2,
      3,
      null,
      3,
      2,
      4,
      null,
      4,
      2,
      5,
      null,
      4,
      2,
      0,
      2,
      0,
      null,
      3,
      null,
      2,
      3,
      4,
      2,
      4,
      null,
      5,
      null,
      4,
      2,
    ],
    // Lively tropical drums — lots of energy
    drums: {
      kick: [1, 0, 0, 1, 1, 0, 0, 1],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat: [1, 1, 1, 1, 1, 1, 1, 1],
      openHat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      crash: [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0,
      ],
    },
    programs: { melody: 12, bass: 33, pad: 25 }, // Marimba, ElectricBass, AcousticGuitar
  },

  // ── 7: Ember Coast — E blues · 88 BPM · Volcanic heat ──
  {
    root: ROOTS.E,
    scale: "blues",
    bpm: 88,
    bars: 16,
    // Blues shuffle: E7, A7, B7 (I7, IV7, V7)
    chords: [
      [0, 2, 4], // E blues tonic
      [0, 2, 4], // E blues tonic
      [2, 3, 5], // A7 area
      [3, 4, 5], // B7 area
    ],
    // Hot, bluesy melody — bends and licks
    melody: [
      4,
      3,
      2,
      null,
      0,
      2,
      3,
      null,
      4,
      null,
      5,
      4,
      3,
      null,
      2,
      0,
      2,
      3,
      4,
      null,
      5,
      null,
      4,
      3,
      2,
      null,
      null,
      0,
      2,
      3,
      4,
      null,
      5,
      null,
      4,
      3,
      2,
      null,
      3,
      4,
      5,
      4,
      3,
      null,
      2,
      0,
      null,
      2,
      3,
      null,
      4,
      5,
      null,
      4,
      3,
      2,
      0,
      null,
      null,
      null,
      2,
      null,
      3,
      null,
    ],
    bass: [
      0,
      null,
      0,
      2,
      0,
      null,
      2,
      0,
      2,
      null,
      3,
      2,
      3,
      null,
      2,
      0,
      0,
      2,
      0,
      null,
      0,
      null,
      2,
      0,
      2,
      null,
      0,
      2,
      3,
      null,
      2,
      null,
    ],
    // Shuffling blues drums
    drums: {
      kick: [1, 0, 0, 1, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat: [1, 0, 1, 1, 1, 0, 1, 1],
      ride: [0, 1, 0, 0, 0, 1, 0, 0],
    },
    programs: { melody: 29, bass: 33, pad: 4 }, // OverdrivenGuitar, ElectricBass, ElectricPiano
  },

  // ── 8: Iron Summit — D minor · 112 BPM · Epic ascent ──
  {
    root: ROOTS.D,
    scale: "minor",
    bpm: 112,
    bars: 16,
    // Dm, Bb, C, Dm (i, bVI, bVII, i) — epic, driving
    chords: [
      [0, 2, 4], // Dm
      [5, 7, 9], // Bb
      [6, 8, 10], // C
      [0, 2, 4], // Dm
    ],
    // Intense, driving melody — ascending phrases
    melody: [
      0,
      2,
      4,
      5,
      7,
      null,
      5,
      4,
      2,
      4,
      5,
      7,
      9,
      null,
      7,
      5,
      4,
      5,
      7,
      9,
      10,
      null,
      9,
      7,
      5,
      null,
      4,
      2,
      0,
      null,
      null,
      null,
      7,
      9,
      10,
      null,
      12,
      10,
      9,
      7,
      5,
      7,
      9,
      null,
      10,
      12,
      10,
      9,
      7,
      null,
      5,
      4,
      2,
      4,
      5,
      7,
      9,
      null,
      7,
      5,
      4,
      null,
      2,
      null,
    ],
    counter: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      7,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      5,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
    ],
    bass: [
      0,
      null,
      0,
      2,
      5,
      null,
      5,
      4,
      6,
      null,
      6,
      4,
      0,
      null,
      2,
      0,
      0,
      2,
      0,
      null,
      5,
      null,
      4,
      5,
      6,
      null,
      4,
      6,
      0,
      null,
      2,
      0,
    ],
    // Intense, driving drums — double kick feel
    drums: {
      kick: [1, 0, 1, 0, 1, 0, 1, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat: [1, 1, 1, 1, 1, 1, 1, 1],
      crash: [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0,
      ],
    },
    programs: { melody: 56, bass: 38, pad: 48, counter: 80 }, // Trumpet, SynthBass, Strings, SynthLeadSquare
  },

  // ── 9: Marble Hall — A major · 96 BPM · Triumphant ──
  {
    root: ROOTS.A,
    scale: "major",
    bpm: 96,
    bars: 16,
    // A, D, E, F#m, D, E, A, A (I, IV, V, vi, IV, V, I, I) — regal, triumphant
    chords: [
      [0, 2, 4], // A
      [3, 5, 7], // D
      [4, 6, 8], // E
      [5, 7, 9], // F#m
      [3, 5, 7], // D
      [4, 6, 8], // E
      [0, 2, 4], // A
      [0, 2, 4], // A
    ],
    // Triumphant, regal melody — fanfare-like
    melody: [
      4,
      null,
      4,
      5,
      7,
      null,
      9,
      null,
      11,
      null,
      9,
      7,
      5,
      null,
      null,
      null,
      7,
      null,
      9,
      11,
      12,
      null,
      11,
      9,
      7,
      null,
      5,
      null,
      4,
      null,
      null,
      null,
      9,
      null,
      11,
      12,
      14,
      null,
      12,
      11,
      9,
      null,
      7,
      null,
      9,
      11,
      null,
      9,
      7,
      null,
      5,
      4,
      2,
      null,
      4,
      5,
      7,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    counter: [
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    bass: [
      0,
      null,
      0,
      2,
      3,
      null,
      3,
      2,
      4,
      null,
      4,
      2,
      5,
      null,
      4,
      2,
      3,
      null,
      3,
      2,
      4,
      null,
      4,
      2,
      0,
      null,
      2,
      0,
      0,
      null,
      0,
      null,
    ],
    // Full, majestic drums
    drums: {
      kick: [1, 0, 0, 1, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hat: [1, 1, 1, 1, 1, 1, 1, 1],
      ride: [1, 0, 1, 0, 1, 0, 1, 0],
      crash: [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0,
      ],
    },
    programs: { melody: 56, bass: 33, pad: 48, counter: 0 }, // Trumpet, ElectricBass, Strings, Piano
  },
];

// --------------- Visualization & Tab Helpers ---------------

function stopAllPlayers() {
  document.querySelectorAll("midi-player").forEach((p) => {
    try {
      p.stop();
    } catch (_) {}
  });
}

function zoomVisualizer(viz) {
  const svg = viz.querySelector("svg");
  if (!svg) return;
  const rects = svg.querySelectorAll("rect[data-note]");
  if (!rects.length) return;
  let minY = Infinity,
    maxY = -Infinity;
  rects.forEach((r) => {
    const y = parseFloat(r.getAttribute("y") || 0),
      h = parseFloat(r.getAttribute("height") || 0);
    if (y < minY) minY = y;
    if (y + h > maxY) maxY = y + h;
  });
  if (!isFinite(minY)) return;
  const vb = svg.getAttribute("viewBox");
  if (!vb) return;
  const [vx, , vw, vh] = vb.split(" ").map(Number);
  const m = vh * 0.05;
  svg.setAttribute(
    "viewBox",
    `${vx} ${Math.max(0, minY - m)} ${vw} ${Math.min(vh, maxY - minY + m * 2)}`
  );
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
}

function observeViz(viz) {
  const obs = new MutationObserver(() => {
    const svg = viz.querySelector("svg");
    if (svg && svg.querySelectorAll("rect[data-note]").length > 0) {
      zoomVisualizer(viz);
      obs.disconnect();
    }
  });
  obs.observe(viz, { childList: true, subtree: true, attributes: true });
  zoomVisualizer(viz);
}

// --------------- Initialization ---------------

document.addEventListener("DOMContentLoaded", () => {
  // Generate and assign NoteSequences to each player/visualizer
  tracks.forEach((cfg, i) => {
    const ns = generate(cfg);
    const section = document.getElementById(`piece-p3-${i}`);
    if (!section) return;

    const player = section.querySelector("midi-player");
    const viz = document.querySelector(`#viz-${i}`);

    if (viz) {
      viz.noteSequence = ns;
    }
    if (player) {
      player.noteSequence = ns;
    }
  });

  // Observe all visualizers for zoom
  document.querySelectorAll("midi-visualizer").forEach(observeViz);

  // Tab switching
  document.querySelectorAll(".tabs").forEach((nav) => {
    const tabs = nav.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        stopAllPlayers();
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const parent = tab.closest(".collection") || document.body;
        parent.querySelectorAll(".piece").forEach((p) => p.classList.remove("active"));
        const target = document.getElementById(`piece-${tab.dataset.track}`);
        if (target) {
          target.classList.add("active");
          target.querySelectorAll("midi-visualizer").forEach(observeViz);
        }
      });
    });
  });
});
