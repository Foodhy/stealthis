/* ===================================================================
   Clausic — Pokemon Collection · script.js
   6 programmatic NoteSequence tracks for <midi-player> web components
   =================================================================== */

// --------------- Scale & Utility ---------------

const SCALES = {
  majorPentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

const ROOTS = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, Bb: 70, B: 71 };

/**
 * Return a MIDI pitch from a scale degree (0-based) relative to a root.
 * Negative degrees go below root; degrees >= scale.length wrap into higher octaves.
 */
function scaleNote(root, scale, degree) {
  const len = scale.length;
  const octave = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  return root + octave * 12 + scale[idx];
}

/** Seconds per beat */
function spb(qpm) {
  return 60 / qpm;
}

// --------------- NoteSequence Generator ---------------

/**
 * Build a NoteSequence from a config object.
 * cfg.qpm        — tempo
 * cfg.totalTime  — total duration in seconds
 * cfg.layers     — array of { fn, program, isDrum }
 *   fn(notes, beat) receives the array and the beat helper
 *   beat(n) returns seconds at beat n
 */
function generate(cfg) {
  const b = (n) => n * spb(cfg.qpm);
  const notes = [];
  for (const layer of cfg.layers) {
    const layerNotes = [];
    layer.fn(layerNotes, b);
    for (const n of layerNotes) {
      if (layer.isDrum) {
        n.isDrum = true;
      } else {
        n.program = layer.program;
      }
      notes.push(n);
    }
  }
  return {
    notes,
    tempos: [{ time: 0, qpm: cfg.qpm }],
    totalTime: cfg.totalTime,
  };
}

/** Helper: add a note to array */
function N(arr, pitch, start, end, velocity) {
  arr.push({ pitch, startTime: start, endTime: end, velocity: velocity || 80 });
}

// --------------- Track Definitions (16 bars each) ---------------

// ===== 0: KANTO (Gen I) — G major pentatonic · 108 BPM =====
function buildKanto() {
  const root = ROOTS.G - 12; // G3
  const sc = SCALES.majorPentatonic;
  const qpm = 108;
  const totalBars = 16;
  const totalTime = totalBars * 4 * spb(qpm);

  return generate({
    qpm,
    totalTime,
    layers: [
      // Marimba melody (program 12)
      {
        program: 12,
        fn(notes, b) {
          // Cheerful, nostalgic 8-bit style melody — two 8-bar phrases
          const melodyDegrees = [
            // Phrase A (bars 1-4)
            4, 5, 7, 5, 4, 3, 2, -1, 0, 2, 4, 5, 7, 5, 4, 2,
            // Phrase A variation (bars 5-8)
            4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 4, 5, 4, 2, 0, -1,
            // Phrase B (bars 9-12)
            7, 9, 10, 9, 7, 5, 4, 5, 7, 5, 4, 2, 0, 2, 4, -1,
            // Phrase B variation / ending (bars 13-16)
            9, 7, 5, 4, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, -1, 0,
          ];
          const rhythms = [
            // Each value = duration in eighth notes (0.5 beats)
            2, 2, 3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 2, 2, 2, 2, 3, 1, 2, 1, 1, 2, 2, 2, 2, 2, 3,
            1, 2, 2, 2, 2, 3, 1, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 2, 2,
            2, 2, 3, 1, 2, 4,
          ];
          let t = 0;
          for (let i = 0; i < melodyDegrees.length; i++) {
            const deg = melodyDegrees[i];
            const dur = rhythms[i] * 0.5 * spb(qpm);
            if (deg === -1) {
              // rest
              t += dur;
              continue;
            }
            const p = scaleNote(root + 12, sc, deg);
            const vel = i % 4 === 0 ? 95 : 80;
            N(notes, p, t, t + dur * 0.9, vel);
            t += dur;
          }
        },
      },
      // Acoustic guitar chords (program 25)
      {
        program: 25,
        fn(notes, b) {
          // Strum pattern: quarter-note chords on beats, varying voicings
          const chordProgressions = [
            // bars 1-4: I - V - vi(rel) - IV
            [0, 4, 7],
            [4, 7, 9],
            [2, 5, 9],
            [0, 4, 7],
            [0, 4, 7],
            [4, 7, 9],
            [2, 5, 9],
            [0, 2, 4],
            // bars 5-8
            [0, 4, 7],
            [2, 5, 9],
            [4, 7, 9],
            [0, 4, 7],
            [0, 4, 7],
            [2, 5, 9],
            [4, 7, 9],
            [0, 2, 4],
            // bars 9-12
            [4, 7, 9],
            [2, 5, 7],
            [0, 4, 7],
            [2, 4, 9],
            [4, 7, 9],
            [2, 5, 7],
            [0, 4, 7],
            [0, 2, 4],
            // bars 13-16
            [4, 7, 9],
            [2, 5, 7],
            [0, 4, 7],
            [2, 4, 9],
            [4, 7, 9],
            [2, 5, 7],
            [0, 4, 7],
            [0, 4, 7],
          ];
          for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < 4; beat += 2) {
              const idx = bar * 2 + Math.floor(beat / 2);
              const chord = chordProgressions[idx % chordProgressions.length];
              const t = b(bar * 4 + beat);
              for (const deg of chord) {
                const p = scaleNote(root, sc, deg);
                N(notes, p, t, t + b(1.8), 60);
              }
            }
          }
        },
      },
      // Glockenspiel counter-melody accents (program 9)
      {
        program: 9,
        fn(notes, b) {
          const accents = [
            { bar: 0, beat: 2.5, deg: 7, dur: 1 },
            { bar: 1, beat: 0.5, deg: 9, dur: 1.5 },
            { bar: 2, beat: 3, deg: 5, dur: 1 },
            { bar: 3, beat: 1, deg: 4, dur: 2 },
            { bar: 4, beat: 2.5, deg: 9, dur: 1 },
            { bar: 5, beat: 0, deg: 7, dur: 1.5 },
            { bar: 6, beat: 3.5, deg: 5, dur: 0.5 },
            { bar: 7, beat: 2, deg: 4, dur: 2 },
            { bar: 8, beat: 1, deg: 10, dur: 1 },
            { bar: 9, beat: 3, deg: 9, dur: 1 },
            { bar: 10, beat: 0.5, deg: 7, dur: 1.5 },
            { bar: 11, beat: 2, deg: 5, dur: 2 },
            { bar: 12, beat: 0, deg: 9, dur: 1 },
            { bar: 13, beat: 2.5, deg: 7, dur: 1.5 },
            { bar: 14, beat: 1, deg: 5, dur: 2 },
            { bar: 15, beat: 3, deg: 4, dur: 1 },
          ];
          for (const a of accents) {
            const t = b(a.bar * 4 + a.beat);
            const p = scaleNote(root + 24, sc, a.deg);
            N(notes, p, t, t + b(a.dur), 65);
          }
        },
      },
      // Drums
      {
        isDrum: true,
        fn(notes, b) {
          for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < 4; beat++) {
              const t = b(bar * 4 + beat);
              // Hi-hat every beat
              N(notes, 42, t, t + b(0.15), 60);
              // Bass drum on 1 and 3
              if (beat === 0 || beat === 2) {
                N(notes, 36, t, t + b(0.15), 90);
              }
              // Snare on 2 and 4
              if (beat === 1 || beat === 3) {
                N(notes, 38, t, t + b(0.15), 85);
              }
              // Off-beat hi-hat
              N(notes, 42, t + b(0.5), t + b(0.65), 45);
            }
            // Crash on bar 1, 5, 9, 13
            if (bar % 4 === 0) {
              N(notes, 49, b(bar * 4), b(bar * 4 + 0.3), 80);
            }
          }
        },
      },
    ],
  });
}

// ===== 1: JOHTO (Gen II) — A Dorian · 76 BPM =====
function buildJohto() {
  const root = ROOTS.A - 12; // A3
  const sc = SCALES.dorian;
  const qpm = 76;
  const totalBars = 16;
  const totalTime = totalBars * 4 * spb(qpm);

  return generate({
    qpm,
    totalTime,
    layers: [
      // Piano melody (program 0)
      {
        program: 0,
        fn(notes, b) {
          // Melancholic, folk-like melody
          const melody = [
            // Phrase A — wistful ascending (bars 1-4)
            { d: 0, s: 0, dur: 2 },
            { d: 2, s: 2, dur: 1 },
            { d: 3, s: 3, dur: 1 },
            { d: 4, s: 4, dur: 2 },
            { d: 5, s: 6, dur: 2 },
            { d: 6, s: 8, dur: 1.5 },
            { d: 5, s: 9.5, dur: 1 },
            { d: 4, s: 10.5, dur: 1.5 },
            { d: 3, s: 12, dur: 2 },
            { d: 2, s: 14, dur: 2 },
            // Phrase A2 (bars 5-8)
            { d: 0, s: 16, dur: 1 },
            { d: 2, s: 17, dur: 1 },
            { d: 4, s: 18, dur: 2 },
            { d: 6, s: 20, dur: 1.5 },
            { d: 7, s: 21.5, dur: 1 },
            { d: 6, s: 22.5, dur: 1.5 },
            { d: 5, s: 24, dur: 2 },
            { d: 4, s: 26, dur: 1 },
            { d: 3, s: 27, dur: 1 },
            { d: 2, s: 28, dur: 2 },
            { d: 0, s: 30, dur: 2 },
            // Phrase B — climax (bars 9-12)
            { d: 7, s: 32, dur: 2 },
            { d: 8, s: 34, dur: 1 },
            { d: 9, s: 35, dur: 1 },
            { d: 7, s: 36, dur: 2 },
            { d: 6, s: 38, dur: 2 },
            { d: 5, s: 40, dur: 1.5 },
            { d: 4, s: 41.5, dur: 1.5 },
            { d: 3, s: 43, dur: 1 },
            { d: 2, s: 44, dur: 2 },
            { d: 4, s: 46, dur: 2 },
            // Phrase B2 — resolution (bars 13-16)
            { d: 5, s: 48, dur: 1 },
            { d: 4, s: 49, dur: 1 },
            { d: 3, s: 50, dur: 2 },
            { d: 2, s: 52, dur: 1 },
            { d: 3, s: 53, dur: 1 },
            { d: 4, s: 54, dur: 2 },
            { d: 3, s: 56, dur: 1.5 },
            { d: 2, s: 57.5, dur: 1.5 },
            { d: 1, s: 59, dur: 1 },
            { d: 0, s: 60, dur: 4 },
          ];
          for (const n of melody) {
            const p = scaleNote(root + 12, sc, n.d);
            const vel = n.dur >= 2 ? 90 : 78;
            N(notes, p, b(n.s), b(n.s + n.dur * 0.95), vel);
          }
        },
      },
      // Flute counter-melody (program 73)
      {
        program: 73,
        fn(notes, b) {
          // Enters bar 3, weaves around the piano
          const flute = [
            // bars 3-4
            { d: 7, s: 8, dur: 1 },
            { d: 6, s: 9, dur: 0.5 },
            { d: 5, s: 9.5, dur: 1.5 },
            { d: 4, s: 11, dur: 1 },
            { d: 5, s: 12, dur: 2 },
            { d: 4, s: 14, dur: 1 },
            // bars 5-6
            { d: 2, s: 17, dur: 1.5 },
            { d: 4, s: 18.5, dur: 1.5 },
            { d: 5, s: 20, dur: 2 },
            { d: 6, s: 22, dur: 1 },
            { d: 7, s: 23, dur: 1 },
            // bars 7-8
            { d: 6, s: 24, dur: 1.5 },
            { d: 5, s: 25.5, dur: 1 },
            { d: 4, s: 26.5, dur: 1.5 },
            { d: 3, s: 28, dur: 2 },
            { d: 2, s: 30, dur: 2 },
            // bars 9-10
            { d: 9, s: 33, dur: 1 },
            { d: 8, s: 34, dur: 1 },
            { d: 7, s: 35, dur: 1 },
            { d: 8, s: 36, dur: 2 },
            { d: 7, s: 38, dur: 1 },
            { d: 6, s: 39, dur: 1 },
            // bars 11-12
            { d: 5, s: 40, dur: 2 },
            { d: 4, s: 42, dur: 1 },
            { d: 3, s: 43, dur: 1 },
            { d: 4, s: 44, dur: 2 },
            { d: 5, s: 46, dur: 2 },
            // bars 13-14
            { d: 4, s: 48, dur: 1 },
            { d: 3, s: 49, dur: 1 },
            { d: 2, s: 50, dur: 2 },
            { d: 3, s: 52, dur: 1.5 },
            { d: 4, s: 53.5, dur: 1.5 },
            { d: 5, s: 55, dur: 1 },
            // bars 15-16
            { d: 4, s: 56, dur: 2 },
            { d: 2, s: 58, dur: 2 },
            { d: 0, s: 60, dur: 4 },
          ];
          for (const n of flute) {
            const p = scaleNote(root + 24, sc, n.d);
            N(notes, p, b(n.s), b(n.s + n.dur * 0.92), 68);
          }
        },
      },
      // Strings pad (program 48)
      {
        program: 48,
        fn(notes, b) {
          // Sustained chords, 2-bar changes
          const chords = [
            [0, 2, 4], // Am (i)
            [3, 5, 7], // C (III)
            [5, 7, 9], // D (IV)  — dorian IV is major
            [4, 6, 8], // Em (v)
            [0, 2, 4], // Am (i)
            [3, 5, 7], // C (III)
            [5, 7, 9], // D (IV)
            [0, 2, 4], // Am (i)
          ];
          for (let i = 0; i < chords.length; i++) {
            const startBeat = i * 8;
            for (const deg of chords[i]) {
              const p = scaleNote(root, sc, deg);
              N(notes, p, b(startBeat), b(startBeat + 7.5), 50);
            }
          }
        },
      },
      // Drums — gentle brush-like
      {
        isDrum: true,
        fn(notes, b) {
          for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < 4; beat++) {
              const t = b(bar * 4 + beat);
              // Ride cymbal
              N(notes, 51, t, t + b(0.12), 45);
              // Bass drum on 1 and 3 (soft)
              if (beat === 0 || beat === 2) {
                N(notes, 36, t, t + b(0.12), 65);
              }
              // Snare ghost notes on 2 and 4
              if (beat === 1 || beat === 3) {
                N(notes, 38, t, t + b(0.12), 50);
              }
            }
          }
        },
      },
    ],
  });
}

// ===== 2: HOENN (Gen III) — C major · 96 BPM =====
function buildHoenn() {
  const root = ROOTS.C; // C4
  const sc = SCALES.major;
  const qpm = 96;
  const totalBars = 16;
  const totalTime = totalBars * 4 * spb(qpm);

  return generate({
    qpm,
    totalTime,
    layers: [
      // Synth lead saw melody (program 81)
      {
        program: 81,
        fn(notes, b) {
          // Tropical adventure, energetic melody
          const melody = [
            // Phrase A (bars 1-4) — upbeat, adventurous
            { d: 0, s: 0, dur: 1 },
            { d: 2, s: 1, dur: 0.5 },
            { d: 4, s: 1.5, dur: 1.5 },
            { d: 5, s: 3, dur: 1 },
            { d: 7, s: 4, dur: 1.5 },
            { d: 5, s: 5.5, dur: 0.5 },
            { d: 4, s: 6, dur: 1 },
            { d: 2, s: 7, dur: 1 },
            { d: 4, s: 8, dur: 0.5 },
            { d: 5, s: 8.5, dur: 0.5 },
            { d: 7, s: 9, dur: 1.5 },
            { d: 9, s: 10.5, dur: 1.5 },
            { d: 7, s: 12, dur: 1 },
            { d: 5, s: 13, dur: 1 },
            { d: 4, s: 14, dur: 1 },
            { d: 2, s: 15, dur: 1 },
            // Phrase A2 (bars 5-8)
            { d: 0, s: 16, dur: 0.5 },
            { d: 4, s: 16.5, dur: 0.5 },
            { d: 7, s: 17, dur: 1.5 },
            { d: 9, s: 18.5, dur: 1.5 },
            { d: 11, s: 20, dur: 1 },
            { d: 9, s: 21, dur: 0.5 },
            { d: 7, s: 21.5, dur: 1.5 },
            { d: 5, s: 23, dur: 1 },
            { d: 4, s: 24, dur: 0.5 },
            { d: 5, s: 24.5, dur: 0.5 },
            { d: 7, s: 25, dur: 1 },
            { d: 9, s: 26, dur: 1 },
            { d: 7, s: 27, dur: 1 },
            { d: 5, s: 28, dur: 1.5 },
            { d: 4, s: 29.5, dur: 1 },
            { d: 2, s: 30.5, dur: 1.5 },
            // Phrase B (bars 9-12) — build
            { d: 9, s: 32, dur: 1 },
            { d: 11, s: 33, dur: 1 },
            { d: 12, s: 34, dur: 1.5 },
            { d: 11, s: 35.5, dur: 0.5 },
            { d: 9, s: 36, dur: 1 },
            { d: 7, s: 37, dur: 1 },
            { d: 9, s: 38, dur: 2 },
            { d: 11, s: 40, dur: 0.5 },
            { d: 12, s: 40.5, dur: 0.5 },
            { d: 14, s: 41, dur: 1.5 },
            { d: 12, s: 42.5, dur: 1.5 },
            { d: 11, s: 44, dur: 1 },
            { d: 9, s: 45, dur: 1 },
            { d: 7, s: 46, dur: 2 },
            // Phrase B2 (bars 13-16) — resolution
            { d: 5, s: 48, dur: 1 },
            { d: 7, s: 49, dur: 1 },
            { d: 9, s: 50, dur: 2 },
            { d: 7, s: 52, dur: 0.5 },
            { d: 5, s: 52.5, dur: 0.5 },
            { d: 4, s: 53, dur: 1 },
            { d: 2, s: 54, dur: 2 },
            { d: 4, s: 56, dur: 1 },
            { d: 5, s: 57, dur: 0.5 },
            { d: 4, s: 57.5, dur: 0.5 },
            { d: 2, s: 58, dur: 1 },
            { d: 0, s: 59, dur: 1 },
            { d: 0, s: 60, dur: 4 },
          ];
          for (const n of melody) {
            const p = scaleNote(root, sc, n.d);
            N(notes, p, b(n.s), b(n.s + n.dur * 0.9), 88);
          }
        },
      },
      // Marimba arpeggios (program 12)
      {
        program: 12,
        fn(notes, b) {
          // Sixteenth-note arpeggios
          const chordDegs = [
            [0, 2, 4, 7], // C
            [3, 5, 7, 9], // F
            [4, 6, 7, 11], // G
            [0, 2, 4, 7], // C
            [5, 7, 9, 11], // Am
            [3, 5, 7, 9], // F
            [4, 6, 7, 11], // G
            [0, 2, 4, 7], // C
          ];
          for (let bar = 0; bar < totalBars; bar++) {
            const chord = chordDegs[bar % chordDegs.length];
            for (let sixteenth = 0; sixteenth < 16; sixteenth++) {
              const deg = chord[sixteenth % chord.length];
              const t = b(bar * 4 + sixteenth * 0.25);
              const p = scaleNote(root + 12, sc, deg + (sixteenth >= 8 ? 7 : 0));
              N(notes, p, t, t + b(0.2), 55 + (sixteenth % 4 === 0 ? 15 : 0));
            }
          }
        },
      },
      // Steel drums chords (program 114)
      {
        program: 114,
        fn(notes, b) {
          const chords = [
            [0, 4, 7],
            [5, 9, 12],
            [7, 11, 14],
            [0, 4, 7],
            [5, 9, 12],
            [0, 4, 7],
            [7, 11, 14],
            [0, 4, 7],
          ];
          for (let bar = 0; bar < totalBars; bar++) {
            const chord = chords[bar % chords.length];
            // Half-note chords on beats 1 and 3
            for (let beat = 0; beat < 4; beat += 2) {
              const t = b(bar * 4 + beat);
              for (const deg of chord) {
                const p = scaleNote(root, sc, deg);
                N(notes, p, t, t + b(1.8), 62);
              }
            }
          }
        },
      },
      // Drums — upbeat
      {
        isDrum: true,
        fn(notes, b) {
          for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < 4; beat++) {
              const t = b(bar * 4 + beat);
              // Hi-hat 8ths
              N(notes, 42, t, t + b(0.1), 65);
              N(notes, 42, t + b(0.5), t + b(0.6), 50);
              // Kick on 1, 2-and, 3
              if (beat === 0 || beat === 2) {
                N(notes, 36, t, t + b(0.1), 95);
              }
              if (beat === 1) {
                N(notes, 36, t + b(0.5), t + b(0.6), 80);
              }
              // Snare on 2 and 4
              if (beat === 1 || beat === 3) {
                N(notes, 38, t, t + b(0.1), 90);
              }
            }
            // Open hi-hat accent every 2 bars
            if (bar % 2 === 1) {
              N(notes, 46, b(bar * 4 + 3.5), b(bar * 4 + 3.7), 70);
            }
            // Crash on phrase starts
            if (bar % 4 === 0) {
              N(notes, 49, b(bar * 4), b(bar * 4 + 0.3), 85);
            }
          }
        },
      },
    ],
  });
}

// ===== 3: SINNOH (Gen IV) — D Phrygian · 72 BPM =====
function buildSinnoh() {
  const root = ROOTS.D - 12; // D3
  const sc = SCALES.phrygian;
  const qpm = 72;
  const totalBars = 16;
  const totalTime = totalBars * 4 * spb(qpm);

  return generate({
    qpm,
    totalTime,
    layers: [
      // Organ chords (program 19)
      {
        program: 19,
        fn(notes, b) {
          // Dark, sustained organ pads — whole-note chords
          const chords = [
            [0, 2, 4], // Dm (i)
            [1, 3, 5], // Eb (bII)
            [0, 2, 4], // Dm (i)
            [5, 7, 9], // Am- (v)
            [3, 5, 7], // F (III)
            [1, 3, 5], // Eb (bII)
            [0, 2, 4], // Dm (i)
            [5, 7, 9], // Am- (v)
            [3, 5, 7], // F (III)
            [1, 3, 5], // Eb (bII)
            [6, 8, 10], // Bb (VI)
            [5, 7, 9], // Am- (v)
            [3, 5, 7], // F (III)
            [1, 3, 5], // Eb (bII)
            [0, 2, 4], // Dm (i)
            [0, 2, 4], // Dm (i) — final
          ];
          for (let bar = 0; bar < totalBars; bar++) {
            const chord = chords[bar];
            const t = b(bar * 4);
            for (const deg of chord) {
              const p = scaleNote(root, sc, deg);
              N(notes, p, t, t + b(3.8), 55);
            }
          }
        },
      },
      // Choir pad (program 52)
      {
        program: 52,
        fn(notes, b) {
          // Ethereal sustained notes, 2-bar phrasing
          const pads = [
            { d: 7, s: 0, dur: 7 },
            { d: 5, s: 8, dur: 7 },
            { d: 7, s: 16, dur: 7 },
            { d: 4, s: 24, dur: 7 },
            { d: 7, s: 32, dur: 7 },
            { d: 5, s: 40, dur: 7 },
            { d: 4, s: 48, dur: 7 },
            { d: 0, s: 56, dur: 8 },
          ];
          for (const n of pads) {
            const p = scaleNote(root + 12, sc, n.d);
            N(notes, p, b(n.s), b(n.s + n.dur), 42);
            // Add a fifth above for richness
            const p2 = scaleNote(root + 12, sc, n.d + 4);
            N(notes, p2, b(n.s + 0.5), b(n.s + n.dur - 0.5), 35);
          }
        },
      },
      // Strings melody (program 48) — slow, mysterious
      {
        program: 48,
        fn(notes, b) {
          const melody = [
            // Phrase A (bars 1-4) — dark, descending
            { d: 7, s: 0, dur: 3 },
            { d: 6, s: 3, dur: 1 },
            { d: 5, s: 4, dur: 2 },
            { d: 4, s: 6, dur: 2 },
            { d: 3, s: 8, dur: 3 },
            { d: 1, s: 11, dur: 1 },
            { d: 0, s: 12, dur: 4 },
            // Phrase A2 (bars 5-8) — ascending
            { d: 0, s: 16, dur: 2 },
            { d: 1, s: 18, dur: 1 },
            { d: 3, s: 19, dur: 1 },
            { d: 4, s: 20, dur: 2 },
            { d: 5, s: 22, dur: 2 },
            { d: 7, s: 24, dur: 3 },
            { d: 8, s: 27, dur: 1 },
            { d: 7, s: 28, dur: 4 },
            // Phrase B (bars 9-12) — climax
            { d: 9, s: 32, dur: 2 },
            { d: 10, s: 34, dur: 1 },
            { d: 9, s: 35, dur: 1 },
            { d: 7, s: 36, dur: 2 },
            { d: 8, s: 38, dur: 2 },
            { d: 10, s: 40, dur: 2 },
            { d: 9, s: 42, dur: 1 },
            { d: 7, s: 43, dur: 1 },
            { d: 5, s: 44, dur: 2 },
            { d: 4, s: 46, dur: 2 },
            // Phrase B2 (bars 13-16) — fading resolution
            { d: 3, s: 48, dur: 3 },
            { d: 1, s: 51, dur: 1 },
            { d: 0, s: 52, dur: 4 },
            { d: 2, s: 56, dur: 2 },
            { d: 1, s: 58, dur: 2 },
            { d: 0, s: 60, dur: 4 },
          ];
          for (const n of melody) {
            const p = scaleNote(root + 12, sc, n.d);
            const vel = n.s >= 32 && n.s < 48 ? 85 : 72;
            N(notes, p, b(n.s), b(n.s + n.dur * 0.95), vel);
          }
        },
      },
      // Sparse atmospheric percussion (no full kit — just accents)
      {
        isDrum: true,
        fn(notes, b) {
          // Very sparse: cymbal swells and occasional low hits
          for (let bar = 0; bar < totalBars; bar++) {
            // Ride bell every 2 bars
            if (bar % 2 === 0) {
              N(notes, 51, b(bar * 4), b(bar * 4 + 0.2), 35);
            }
            // Gentle bass drum on beat 1 every 4 bars
            if (bar % 4 === 0) {
              N(notes, 36, b(bar * 4), b(bar * 4 + 0.15), 50);
            }
            // Crash at climax sections
            if (bar === 8 || bar === 12) {
              N(notes, 49, b(bar * 4), b(bar * 4 + 0.3), 55);
            }
          }
        },
      },
    ],
  });
}

// ===== 4: UNOVA (Gen V) — Bb Mixolydian · 110 BPM =====
function buildUnova() {
  const root = ROOTS.Bb - 12; // Bb3
  const sc = SCALES.mixolydian;
  const qpm = 110;
  const totalBars = 16;
  const totalTime = totalBars * 4 * spb(qpm);

  return generate({
    qpm,
    totalTime,
    layers: [
      // Synth lead square melody (program 80)
      {
        program: 80,
        fn(notes, b) {
          // Modern, urban, electronic groove
          const melody = [
            // Phrase A (bars 1-4) — punchy, rhythmic
            { d: 0, s: 0, dur: 0.5 },
            { d: 2, s: 0.5, dur: 0.5 },
            { d: 4, s: 1, dur: 1 },
            { d: 5, s: 2, dur: 0.5 },
            { d: 4, s: 2.5, dur: 0.5 },
            { d: 2, s: 3, dur: 1 },
            { d: 4, s: 4, dur: 0.5 },
            { d: 5, s: 4.5, dur: 0.5 },
            { d: 7, s: 5, dur: 1.5 },
            { d: 5, s: 6.5, dur: 0.5 },
            { d: 4, s: 7, dur: 1 },
            { d: 2, s: 8, dur: 0.5 },
            { d: 4, s: 8.5, dur: 0.5 },
            { d: 5, s: 9, dur: 1 },
            { d: 7, s: 10, dur: 0.5 },
            { d: 9, s: 10.5, dur: 1.5 },
            { d: 7, s: 12, dur: 1 },
            { d: 5, s: 13, dur: 0.5 },
            { d: 4, s: 13.5, dur: 0.5 },
            { d: 2, s: 14, dur: 1 },
            { d: 0, s: 15, dur: 1 },
            // Phrase A2 (bars 5-8) — variation
            { d: 7, s: 16, dur: 0.5 },
            { d: 9, s: 16.5, dur: 0.5 },
            { d: 11, s: 17, dur: 1 },
            { d: 9, s: 18, dur: 0.5 },
            { d: 7, s: 18.5, dur: 1 },
            { d: 5, s: 19.5, dur: 0.5 },
            { d: 7, s: 20, dur: 1 },
            { d: 9, s: 21, dur: 0.5 },
            { d: 11, s: 21.5, dur: 1 },
            { d: 9, s: 22.5, dur: 0.5 },
            { d: 7, s: 23, dur: 1 },
            { d: 5, s: 24, dur: 0.5 },
            { d: 4, s: 24.5, dur: 0.5 },
            { d: 2, s: 25, dur: 1 },
            { d: 4, s: 26, dur: 0.5 },
            { d: 5, s: 26.5, dur: 1 },
            { d: 4, s: 27.5, dur: 0.5 },
            { d: 2, s: 28, dur: 1 },
            { d: 0, s: 29, dur: 1 },
            // rest
            { d: 0, s: 31, dur: 1 },
            // Phrase B (bars 9-12) — energetic climax
            { d: 7, s: 32, dur: 0.5 },
            { d: 9, s: 32.5, dur: 0.5 },
            { d: 11, s: 33, dur: 0.5 },
            { d: 12, s: 33.5, dur: 1 },
            { d: 11, s: 34.5, dur: 0.5 },
            { d: 9, s: 35, dur: 1 },
            { d: 11, s: 36, dur: 0.5 },
            { d: 12, s: 36.5, dur: 0.5 },
            { d: 14, s: 37, dur: 1.5 },
            { d: 12, s: 38.5, dur: 0.5 },
            { d: 11, s: 39, dur: 1 },
            { d: 9, s: 40, dur: 0.5 },
            { d: 11, s: 40.5, dur: 0.5 },
            { d: 12, s: 41, dur: 1 },
            { d: 11, s: 42, dur: 0.5 },
            { d: 9, s: 42.5, dur: 0.5 },
            { d: 7, s: 43, dur: 1 },
            { d: 5, s: 44, dur: 0.5 },
            { d: 7, s: 44.5, dur: 0.5 },
            { d: 9, s: 45, dur: 1.5 },
            { d: 7, s: 46.5, dur: 0.5 },
            { d: 5, s: 47, dur: 1 },
            // Phrase B2 (bars 13-16) — outro
            { d: 4, s: 48, dur: 0.5 },
            { d: 5, s: 48.5, dur: 0.5 },
            { d: 7, s: 49, dur: 1 },
            { d: 5, s: 50, dur: 0.5 },
            { d: 4, s: 50.5, dur: 0.5 },
            { d: 2, s: 51, dur: 1 },
            { d: 4, s: 52, dur: 1 },
            { d: 5, s: 53, dur: 0.5 },
            { d: 4, s: 53.5, dur: 0.5 },
            { d: 2, s: 54, dur: 1 },
            { d: 0, s: 55, dur: 1 },
            { d: 2, s: 56, dur: 0.5 },
            { d: 4, s: 56.5, dur: 0.5 },
            { d: 5, s: 57, dur: 1 },
            { d: 4, s: 58, dur: 1 },
            { d: 2, s: 59, dur: 1 },
            { d: 0, s: 60, dur: 4 },
          ];
          for (const n of melody) {
            const p = scaleNote(root + 12, sc, n.d);
            N(notes, p, b(n.s), b(n.s + n.dur * 0.85), 92);
          }
        },
      },
      // Trumpet accents (program 56)
      {
        program: 56,
        fn(notes, b) {
          // Stab accents on off-beats, enters bar 3
          const stabs = [
            { d: 7, s: 8.5, dur: 0.5 },
            { d: 9, s: 10, dur: 0.5 },
            { d: 7, s: 12.5, dur: 0.5 },
            { d: 5, s: 14, dur: 0.5 },
            { d: 9, s: 16.5, dur: 0.5 },
            { d: 11, s: 18, dur: 0.5 },
            { d: 7, s: 20.5, dur: 0.5 },
            { d: 9, s: 22, dur: 0.5 },
            { d: 5, s: 24.5, dur: 0.5 },
            { d: 7, s: 26, dur: 0.5 },
            { d: 4, s: 28.5, dur: 0.5 },
            { d: 5, s: 30, dur: 0.5 },
            // Climax section — more accents
            { d: 11, s: 32.5, dur: 0.5 },
            { d: 12, s: 33.5, dur: 0.5 },
            { d: 14, s: 34.5, dur: 0.5 },
            { d: 12, s: 36, dur: 0.5 },
            { d: 11, s: 37.5, dur: 0.5 },
            { d: 14, s: 38.5, dur: 0.5 },
            { d: 12, s: 40, dur: 0.5 },
            { d: 11, s: 41.5, dur: 0.5 },
            { d: 9, s: 42.5, dur: 0.5 },
            { d: 7, s: 44, dur: 0.5 },
            { d: 9, s: 45.5, dur: 0.5 },
            { d: 7, s: 46.5, dur: 0.5 },
            // Outro
            { d: 5, s: 48.5, dur: 0.5 },
            { d: 7, s: 50.5, dur: 0.5 },
            { d: 4, s: 52.5, dur: 0.5 },
            { d: 5, s: 54.5, dur: 0.5 },
            { d: 2, s: 56.5, dur: 0.5 },
            { d: 4, s: 58.5, dur: 0.5 },
            { d: 0, s: 60, dur: 2 },
          ];
          for (const n of stabs) {
            const p = scaleNote(root + 12, sc, n.d);
            N(notes, p, b(n.s), b(n.s + n.dur * 0.8), 78);
          }
        },
      },
      // Electric piano chords (program 4)
      {
        program: 4,
        fn(notes, b) {
          const chords = [
            [0, 4, 7], // Bb (I)
            [5, 7, 11], // F (V)
            [2, 4, 7], // Cm (ii)
            [6, 9, 11], // Ab (bVII)
            [0, 4, 7], // Bb (I)
            [5, 7, 11], // F (V)
            [3, 5, 9], // Eb (IV)
            [0, 4, 7], // Bb (I)
          ];
          for (let bar = 0; bar < totalBars; bar++) {
            const chord = chords[bar % chords.length];
            // Rhythmic comping pattern
            const beats = [0, 1.5, 2.5, 3.5];
            for (const beat of beats) {
              const t = b(bar * 4 + beat);
              for (const deg of chord) {
                const p = scaleNote(root, sc, deg);
                N(notes, p, t, t + b(0.8), beat === 0 ? 68 : 55);
              }
            }
          }
        },
      },
      // Drums — electronic, driving
      {
        isDrum: true,
        fn(notes, b) {
          for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < 4; beat++) {
              const t = b(bar * 4 + beat);
              // Closed hi-hat 16ths
              for (let s = 0; s < 4; s++) {
                const ht = t + b(s * 0.25);
                N(notes, 42, ht, ht + b(0.05), 50 + (s === 0 ? 20 : 0));
              }
              // Kick pattern: syncopated
              if (beat === 0) {
                N(notes, 36, t, t + b(0.1), 100);
              }
              if (beat === 1) {
                N(notes, 36, t + b(0.5), t + b(0.6), 85);
              }
              if (beat === 2) {
                N(notes, 36, t, t + b(0.1), 95);
                N(notes, 36, t + b(0.75), t + b(0.85), 80);
              }
              // Snare on 2 and 4
              if (beat === 1 || beat === 3) {
                N(notes, 38, t, t + b(0.1), 95);
              }
            }
            // Open hi-hat on beat 4-and
            N(notes, 46, b(bar * 4 + 3.5), b(bar * 4 + 3.7), 75);
            // Crash on 1, 5, 9, 13
            if (bar % 4 === 0) {
              N(notes, 49, b(bar * 4), b(bar * 4 + 0.3), 90);
            }
          }
        },
      },
    ],
  });
}

// ===== 5: KALOS (Gen VI) — F major pentatonic · 84 BPM =====
function buildKalos() {
  const root = ROOTS.F - 12; // F3
  const sc = SCALES.majorPentatonic;
  const qpm = 84;
  const totalBars = 16;
  const totalTime = totalBars * 4 * spb(qpm);

  return generate({
    qpm,
    totalTime,
    layers: [
      // Harp arpeggios (program 46)
      {
        program: 46,
        fn(notes, b) {
          // Flowing eighth-note arpeggios, French-waltz feel
          const chordDegs = [
            [0, 2, 4, 7], // F
            [2, 4, 7, 9], // Am
            [0, 2, 4, 7], // F
            [4, 7, 9, 12], // C
            [2, 4, 7, 9], // Am/Dm
            [0, 2, 4, 7], // F
            [4, 7, 9, 12], // C
            [0, 2, 4, 7], // F
          ];
          for (let bar = 0; bar < totalBars; bar++) {
            const chord = chordDegs[bar % chordDegs.length];
            // Ascending-descending arpeggio pattern per bar
            const pattern = [0, 1, 2, 3, 2, 1, 0, 3];
            for (let eighth = 0; eighth < 8; eighth++) {
              const deg = chord[pattern[eighth]];
              const octShift = eighth < 4 ? 0 : 7;
              const t = b(bar * 4 + eighth * 0.5);
              const p = scaleNote(root + 12, sc, deg + octShift);
              N(notes, p, t, t + b(0.45), 55 + (eighth === 0 ? 10 : 0));
            }
          }
        },
      },
      // Accordion melody (program 21)
      {
        program: 21,
        fn(notes, b) {
          // Romantic, French-inspired melody
          const melody = [
            // Phrase A (bars 1-4) — gentle, lilting
            { d: 4, s: 0, dur: 2 },
            { d: 5, s: 2, dur: 1 },
            { d: 4, s: 3, dur: 1 },
            { d: 2, s: 4, dur: 2 },
            { d: 4, s: 6, dur: 2 },
            { d: 5, s: 8, dur: 1.5 },
            { d: 7, s: 9.5, dur: 1 },
            { d: 5, s: 10.5, dur: 1.5 },
            { d: 4, s: 12, dur: 3 },
            { d: 2, s: 15, dur: 1 },
            // Phrase A2 (bars 5-8) — expands upward
            { d: 4, s: 16, dur: 1 },
            { d: 5, s: 17, dur: 1 },
            { d: 7, s: 18, dur: 2 },
            { d: 9, s: 20, dur: 1.5 },
            { d: 7, s: 21.5, dur: 1 },
            { d: 5, s: 22.5, dur: 1.5 },
            { d: 4, s: 24, dur: 2 },
            { d: 2, s: 26, dur: 1 },
            { d: 4, s: 27, dur: 1 },
            { d: 5, s: 28, dur: 2 },
            { d: 4, s: 30, dur: 2 },
            // Phrase B (bars 9-12) — emotional climax
            { d: 7, s: 32, dur: 2 },
            { d: 9, s: 34, dur: 1 },
            { d: 10, s: 35, dur: 1 },
            { d: 9, s: 36, dur: 2 },
            { d: 7, s: 38, dur: 1 },
            { d: 5, s: 39, dur: 1 },
            { d: 7, s: 40, dur: 1.5 },
            { d: 9, s: 41.5, dur: 1.5 },
            { d: 10, s: 43, dur: 1 },
            { d: 9, s: 44, dur: 2 },
            { d: 7, s: 46, dur: 2 },
            // Phrase B2 (bars 13-16) — gentle resolution
            { d: 5, s: 48, dur: 1.5 },
            { d: 4, s: 49.5, dur: 1 },
            { d: 2, s: 50.5, dur: 1.5 },
            { d: 4, s: 52, dur: 2 },
            { d: 5, s: 54, dur: 1 },
            { d: 4, s: 55, dur: 1 },
            { d: 2, s: 56, dur: 2 },
            { d: 0, s: 58, dur: 2 },
            { d: 0, s: 60, dur: 4 },
          ];
          for (const n of melody) {
            const p = scaleNote(root + 12, sc, n.d);
            const vel = n.s >= 32 && n.s < 48 ? 85 : 75;
            N(notes, p, b(n.s), b(n.s + n.dur * 0.92), vel);
          }
        },
      },
      // Strings pad (program 48)
      {
        program: 48,
        fn(notes, b) {
          // Warm sustained chords, 2-bar phrasing
          const chords = [
            [0, 4, 7], // F (I)
            [2, 4, 9], // Am (iii-ish pentatonic)
            [0, 4, 7], // F (I)
            [4, 7, 9], // C area
            [2, 4, 7], // Dm
            [0, 4, 9], // F
            [4, 7, 9], // C
            [0, 4, 7], // F
          ];
          for (let i = 0; i < chords.length; i++) {
            const startBeat = i * 8;
            const t = b(startBeat);
            for (const deg of chords[i]) {
              const p = scaleNote(root, sc, deg);
              N(notes, p, t, t + b(7.5), 45);
            }
          }
        },
      },
      // Drums — light, waltz-ish
      {
        isDrum: true,
        fn(notes, b) {
          for (let bar = 0; bar < totalBars; bar++) {
            for (let beat = 0; beat < 4; beat++) {
              const t = b(bar * 4 + beat);
              // Ride cymbal on each beat
              N(notes, 51, t, t + b(0.12), 42);
              // Light kick on 1
              if (beat === 0) {
                N(notes, 36, t, t + b(0.12), 65);
              }
              // Ghost snare on 3
              if (beat === 2) {
                N(notes, 38, t, t + b(0.12), 45);
              }
              // Cross-stick on 2 and 4 (using snare at low velocity for brush feel)
              if (beat === 1 || beat === 3) {
                N(notes, 38, t, t + b(0.08), 30);
              }
            }
            // Kick on beat 3 every other bar for gentle pulse
            if (bar % 2 === 1) {
              N(notes, 36, b(bar * 4 + 2), b(bar * 4 + 2.12), 50);
            }
          }
        },
      },
    ],
  });
}

// --------------- Visualizer Helpers ---------------

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
    const y = parseFloat(r.getAttribute("y") || 0);
    const h = parseFloat(r.getAttribute("height") || 0);
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
  // Build NoteSequences for generated tracks (Gen I–V)
  const sequences = [buildKanto(), buildJohto(), buildHoenn(), buildSinnoh(), buildUnova()];

  // Assign NoteSequences to players/visualizers without a src attribute
  const players = document.querySelectorAll("midi-player");
  const visualizers = document.querySelectorAll("midi-visualizer");

  players.forEach((player, i) => {
    if (!player.getAttribute("src") && i < sequences.length) {
      player.noteSequence = sequences[i];
    }
  });

  visualizers.forEach((viz, i) => {
    if (!viz.getAttribute("src") && i < sequences.length) {
      viz.noteSequence = sequences[i];
    }
    observeViz(viz);
  });

  // Tab navigation
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
