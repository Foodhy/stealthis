/* ============================================================
   Clausic — Chill Pieces  ·  Procedural MIDI Generator
   4 tracks: Chillwave · Lo-fi Hip Hop · Ambient · Acoustic
   ============================================================ */

/* ---------- Scale & Utility ---------- */

const SCALES = {
  phrygian:  [0, 1, 3, 5, 7, 8, 10],
  dorian:    [0, 2, 3, 5, 7, 9, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  minor:     [0, 2, 3, 5, 7, 8, 10],
  major:     [0, 2, 4, 5, 7, 9, 11]
};

const ROOTS = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };

function scaleNote(root, scale, degree) {
  const oct = Math.floor(degree / scale.length);
  const idx = ((degree % scale.length) + scale.length) % scale.length;
  return root + scale[idx] + oct * 12;
}

/* ---------- Generator ---------- */

function generate(cfg) {
  const bt = 60 / cfg.bpm;           // seconds per quarter note
  const total = cfg.bars * 4;        // total quarter-note beats
  const notes = [];

  /* --- Chords: whole-bar sustained pads --- */
  if (cfg.chords && cfg.programs.pad != null) {
    for (let bar = 0; bar < cfg.bars; bar++) {
      const chord = cfg.chords[bar % cfg.chords.length];
      const t = bar * 4 * bt;
      for (const deg of chord) {
        notes.push({
          pitch: scaleNote(cfg.root, cfg.scale, deg),
          startTime: t,
          endTime: t + 4 * bt * 0.95,
          velocity: 50 + Math.floor(Math.random() * 15),
          program: cfg.programs.pad
        });
      }
    }
  }

  /* --- Arpeggios (ambient tracks with no melody) --- */
  if (cfg.arp && cfg.programs.melody != null && !cfg.melody) {
    let ai = 0;
    for (let beat = 0; beat < total; beat++) {
      const deg = cfg.arp[ai % cfg.arp.length];
      ai++;
      if (deg != null) {
        const t = beat * bt;
        notes.push({
          pitch: scaleNote(cfg.root, cfg.scale, deg),
          startTime: t,
          endTime: t + bt * 2.5,
          velocity: 45 + Math.floor(Math.random() * 20),
          program: cfg.programs.melody
        });
      }
    }
  }

  /* --- Melody: eighth-note grid --- */
  if (cfg.melody && cfg.programs.melody != null) {
    let mi = 0;
    for (let eighth = 0; eighth < total * 2; eighth++) {
      const n = cfg.melody[mi % cfg.melody.length];
      mi++;
      if (n != null) {
        const t = eighth * bt / 2;
        const nextNull = cfg.melody[mi % cfg.melody.length] == null;
        const dur = nextNull ? bt : bt / 2;
        notes.push({
          pitch: scaleNote(cfg.root + 12, cfg.scale, n),
          startTime: t,
          endTime: t + dur * 0.85,
          velocity: 65 + Math.floor(Math.random() * 25),
          program: cfg.programs.melody
        });
      }
    }
  }

  /* --- Bass: quarter-note grid --- */
  if (cfg.bass && cfg.programs.bass != null) {
    let bi = 0;
    for (let beat = 0; beat < total; beat++) {
      const n = cfg.bass[bi % cfg.bass.length];
      bi++;
      if (n != null) {
        const t = beat * bt;
        notes.push({
          pitch: scaleNote(cfg.root - 12, cfg.scale, n),
          startTime: t,
          endTime: t + bt * 0.8,
          velocity: 75 + Math.floor(Math.random() * 15),
          program: cfg.programs.bass
        });
      }
    }
  }

  /* --- Drums: 8 eighth-note slots per bar --- */
  if (cfg.drums) {
    for (let beat = 0; beat < total; beat++) {
      for (let sub = 0; sub < 2; sub++) {
        const ei = (beat * 2 + sub) % (cfg.drums.kick ? cfg.drums.kick.length : 8);
        const t = (beat + sub * 0.5) * bt;
        if (cfg.drums.kick && cfg.drums.kick[ei])
          notes.push({ pitch: 36, startTime: t, endTime: t + 0.15, velocity: 95 + Math.floor(Math.random() * 10), isDrum: true });
        if (cfg.drums.snare && cfg.drums.snare[ei])
          notes.push({ pitch: 38, startTime: t, endTime: t + 0.1, velocity: 80 + Math.floor(Math.random() * 15), isDrum: true });
        if (cfg.drums.hat && cfg.drums.hat[ei])
          notes.push({ pitch: 42, startTime: t, endTime: t + 0.08, velocity: 50 + Math.floor(Math.random() * 15), isDrum: true });
        if (cfg.drums.openHat && cfg.drums.openHat[ei])
          notes.push({ pitch: 46, startTime: t, endTime: t + 0.2, velocity: 55 + Math.floor(Math.random() * 12), isDrum: true });
        if (cfg.drums.ride && cfg.drums.ride[ei])
          notes.push({ pitch: 51, startTime: t, endTime: t + 0.12, velocity: 45 + Math.floor(Math.random() * 15), isDrum: true });
      }
    }
  }

  return { notes, tempos: [{ time: 0, qpm: cfg.bpm }], totalTime: total * bt };
}

/* ============================================================
   TRACK DEFINITIONS
   ============================================================ */

const TRACKS = [

  /* ----------------------------------------------------------
     Track 0 — Chillwave / Synth
     A Phrygian · 76 BPM · 32 bars
     Dreamy, hazy saw-wave leads over warm pads with sparse beats.
     The Phrygian b2 (Bb) gives that signature dark-float feeling.
     ---------------------------------------------------------- */
  {
    root: ROOTS.A - 12,
    scale: SCALES.phrygian,
    bpm: 76,
    bars: 32,
    // Chord cycle: Am → Bbmaj → Dm → Cm (classic Phrygian i-bII-iv-iii)
    chords: [
      [0, 2, 4],     // Am
      [1, 3, 5],     // Bb
      [5, 7, 9],     // Dm
      [3, 5, 7],     // Cm
      [0, 2, 4],     // Am
      [1, 3, 5],     // Bb
      [3, 5, 7],     // Cm
      [5, 7, 9]      // Dm
    ],
    // 64-note melody: languid, breathy, lots of rests — dreamy Phrygian contour
    melody: [
      0, null, null, 2,   null, 4, null, null,
      3, null, 1, null,   0, null, null, null,
      5, null, null, 4,   null, 3, 2, null,
      1, null, 0, null,   -1, null, null, null,
      // bar 5-8: higher register, arching phrase
      4, null, 5, null,   7, null, null, 5,
      4, null, 3, null,   2, null, 1, null,
      0, null, null, 2,   4, null, 5, null,
      3, null, 1, null,   0, null, null, null,
      // bar 9-12: syncopated descending line
      7, null, null, 5,   null, null, 4, null,
      3, null, 2, null,   1, null, null, null,
      5, null, 4, 3,      null, 2, null, 1,
      0, null, null, null, -1, null, 0, null,
      // bar 13-16: spacious ending with the flat-2 color
      2, null, null, null, 4, null, null, null,
      1, null, null, 0,   null, null, null, null,
      3, null, 5, null,   4, null, 2, null,
      0, null, null, null, null, null, null, null
    ],
    bass: [
      0, null, 0, null,   null, 0, null, null,
      1, null, null, 1,   null, null, 1, null,
      5, null, null, 5,   null, 5, null, null,
      3, null, null, 3,   null, null, 3, null
    ],
    drums: {
      // Sparse lo-fi beat with off-kilter kick on the & of 3
      kick:    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      hat:     [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      openHat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
    },
    programs: { melody: 81, bass: 38, pad: 89 }   // SynthLeadSaw, SynthBass, PadWarm
  },

  /* ----------------------------------------------------------
     Track 1 — Lo-fi Hip Hop
     C Dorian · 85 BPM · 40 bars
     Warm, jazzy electric piano over dusty drums.
     Dorian's natural 6 (A natural) adds the jazzy brightness.
     ---------------------------------------------------------- */
  {
    root: ROOTS.C,
    scale: SCALES.dorian,
    bpm: 85,
    bars: 40,
    // Jazzy minor progression: Cm9 → Fm9 → Abmaj7 → G7(b13)
    chords: [
      [0, 2, 4, 6],   // Cm9
      [3, 5, 7, 9],   // Fm9
      [5, 7, 9, 11],  // Abmaj7
      [4, 6, 8, 10],  // G7
      [0, 2, 4, 6],   // Cm9
      [1, 3, 5, 7],   // Dm7b5
      [5, 7, 9, 11],  // Abmaj7
      [3, 5, 7, 9]    // Fm9
    ],
    // 64-note melody: lazy, behind-the-beat jazz phrasing with chromatic approach
    melody: [
      4, null, 2, 3,    null, 4, null, null,
      5, null, null, 4,  2, null, 0, null,
      null, null, 7, null, 5, 4, null, null,
      2, null, 3, null,  4, null, null, null,
      // bar 5-8: call-and-response feel
      null, null, 0, 2,  4, null, 5, null,
      7, null, 5, null,  4, null, 2, null,
      null, 0, null, -1, null, 0, 2, null,
      4, null, null, null, null, null, null, null,
      // bar 9-12: upper register blues lick
      9, null, 7, null,  5, null, 4, null,
      null, 5, null, 4,  2, null, null, null,
      0, null, 2, null,  4, 5, null, 7,
      null, 5, 4, null,  2, null, null, null,
      // bar 13-16: lazy descent with rests
      7, null, null, null, 5, null, null, 4,
      null, null, 2, null, 0, null, null, null,
      null, 2, null, 4,  null, 5, null, 4,
      2, null, 0, null,  null, null, null, null
    ],
    bass: [
      0, null, null, 0,  null, null, 0, null,
      3, null, null, 3,  null, 3, null, null,
      5, null, null, 5,  null, null, 5, null,
      4, null, null, null, 4, null, null, null
    ],
    drums: {
      // Classic boom-bap with swing: ghost snares, lazy kick
      kick:    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      hat:     [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      openHat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      ride:    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0]
    },
    programs: { melody: 4, bass: 33, pad: 89 }    // ElectricPiano, ElectricBass, PadWarm
  },

  /* ----------------------------------------------------------
     Track 2 — Ambient / Atmospheric
     E Whole Tone · 50 BPM · 24 bars
     Ethereal, floating — no drums. Vibraphone arpeggios drift
     over slow-moving whole-tone pads. The scale has no tonal
     center, creating a weightless, dreamlike suspension.
     ---------------------------------------------------------- */
  {
    root: ROOTS.E - 12,
    scale: SCALES.wholeTone,
    bpm: 50,
    bars: 24,
    // Whole-tone triads shifting by step — each one sounds equally distant
    chords: [
      [0, 2, 4],    // E aug-ish
      [1, 3, 5],    // up a whole step
      [2, 4, 0],    // inversion
      [3, 5, 1],    // floating
      [4, 0, 2],    // cycling
      [5, 1, 3]     // return
    ],
    // 48-note arpeggio: slow, wide leaps, lots of breathing room
    arp: [
      0, null, null, 4,    null, null, 2, null,
      null, null, 5, null,  null, 3, null, null,
      1, null, null, null,  4, null, null, 2,
      null, null, null, 0,  null, null, null, null,
      // second phrase: reaching higher
      5, null, null, null,  3, null, null, 1,
      null, null, 4, null,  null, null, 2, null,
      0, null, null, 3,    null, null, 5, null,
      null, 4, null, null,  null, null, null, null,
      // third phrase: descending, sinking
      4, null, null, 2,    null, null, 0, null,
      null, null, null, 5,  null, null, 3, null,
      1, null, null, null,  null, 4, null, null,
      2, null, null, null,  0, null, null, null
    ],
    bass: [
      0, null, null, null,  null, null, null, null,
      1, null, null, null,  null, null, null, null,
      2, null, null, null,  null, null, null, null,
      3, null, null, null,  null, null, null, null,
      4, null, null, null,  null, null, null, null,
      5, null, null, null,  null, null, null, null
    ],
    programs: { melody: 11, bass: 38, pad: 88 }   // Vibraphone, SynthBass, PadNewAge
    // No drums property — completely beatless
  },

  /* ----------------------------------------------------------
     Track 3 — Acoustic Chill
     G Major · 72 BPM · 32 bars
     Natural, warm fingerpicked guitar melody over gentle strings
     and soft brushed drums. Feels like a sunny afternoon.
     ---------------------------------------------------------- */
  {
    root: ROOTS.G,
    scale: SCALES.major,
    bpm: 72,
    bars: 32,
    // Folk-pop progression: G → Em → C → D → G → C → Am → D
    chords: [
      [0, 2, 4],     // G
      [6, 8, 10],    // Em (degree 6 in G major = E)
      [3, 5, 7],     // C
      [4, 6, 8],     // D
      [0, 2, 4],     // G
      [3, 5, 7],     // C
      [1, 3, 5],     // Am
      [4, 6, 8]      // D
    ],
    // 64-note melody: singable, folk-like with small intervals and natural phrasing
    melody: [
      4, null, 5, 4,    null, 2, 0, null,
      null, 2, null, 4,  null, null, 5, null,
      7, null, null, 5,  4, null, 2, null,
      0, null, null, null, null, null, null, null,
      // bar 5-8: answer phrase — rising with hope
      2, null, 4, null,  5, null, 7, null,
      null, 9, null, 7,  5, null, null, null,
      4, null, 2, null,  0, null, 2, 4,
      null, 5, null, null, null, null, null, null,
      // bar 9-12: development — wider leaps, more momentum
      7, null, 9, null,  7, null, 5, null,
      4, null, 5, 7,    null, 9, null, null,
      7, null, 5, null,  4, null, 2, null,
      0, null, null, -1,  0, null, null, null,
      // bar 13-16: gentle coda — slowing, coming home
      2, null, null, 4,  null, null, 5, null,
      null, 4, null, 2,  null, 0, null, null,
      null, null, 2, null, 4, null, null, null,
      0, null, null, null, null, null, null, null
    ],
    bass: [
      0, null, 0, null,  null, 0, null, null,
      6, null, null, 6,  null, null, 6, null,
      3, null, 3, null,  null, 3, null, null,
      4, null, null, 4,  null, null, 4, null,
      0, null, 0, null,  null, 0, null, null,
      3, null, null, 3,  null, null, 3, null,
      1, null, 1, null,  null, 1, null, null,
      4, null, null, 4,  null, null, 4, null
    ],
    drums: {
      // Brushed kit: steady hats, soft kick-snare, ride adds shimmer
      kick:    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hat:     [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0],
      ride:    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
    },
    programs: { melody: 25, bass: 33, pad: 48 }   // AcousticGuitar, ElectricBass, Strings
  }
];

/* ============================================================
   Visualizer Helpers
   ============================================================ */

function stopAllPlayers() {
  document.querySelectorAll('midi-player').forEach(p => {
    try { p.stop(); } catch (_) { /* ignore */ }
  });
}

function zoomVisualizer(viz) {
  const svg = viz.querySelector('svg');
  if (!svg) return;
  const rects = svg.querySelectorAll('rect[data-note]');
  if (!rects.length) return;
  let minY = Infinity, maxY = -Infinity;
  rects.forEach(r => {
    const y = parseFloat(r.getAttribute('y') || 0);
    const h = parseFloat(r.getAttribute('height') || 0);
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
    if (svg && svg.querySelectorAll('rect[data-note]').length > 0) {
      zoomVisualizer(viz);
      obs.disconnect();
    }
  });
  obs.observe(viz, { childList: true, subtree: true, attributes: true });
  zoomVisualizer(viz);
}

/* ============================================================
   Init — generate NoteSequences & wire up tabs
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Generate and assign NoteSequences to each player/visualizer */
  TRACKS.forEach((cfg, i) => {
    const ns = generate(cfg);
    const player = document.querySelector(`#piece-chill-${i} midi-player`);
    const viz = document.getElementById(`viz-${i}`);
    if (player) player.noteSequence = ns;
    if (viz) viz.noteSequence = ns;
    if (viz) observeViz(viz);
  });

  /* Tab switching */
  document.querySelectorAll('.tabs').forEach(nav => {
    const tabs = nav.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        stopAllPlayers();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.piece').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`piece-${tab.dataset.track}`);
        if (target) {
          target.classList.add('active');
          target.querySelectorAll('midi-visualizer').forEach(observeViz);
        }
      });
    });
  });
});
