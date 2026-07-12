(function () {
  "use strict";

  // --- Style definitions ------------------------------------------------
  var STYLES = {
    japandi: {
      name: "Japandi",
      match: "Your leading direction",
      desc: "A quiet marriage of Japanese restraint and Scandinavian warmth. You gravitate to low, honest silhouettes, hand-finished woods and rooms that breathe. Nothing shouts; everything is chosen. Negative space is treated as a material in its own right.",
      palette: [
        { hex: "#e9e3d8", c: "#e9e3d8" },
        { hex: "#c8b8a1", c: "#c8b8a1" },
        { hex: "#7d6b57", c: "#7d6b57" },
        { hex: "#3d352b", c: "#3d352b" },
        { hex: "#8a9a7b", c: "#8a9a7b" }
      ],
      pieces: ["Low oak platform bed", "Handmade ceramic vessels", "Paper pendant lantern", "Linen floor cushions", "A single sculptural branch"]
    },
    midcentury: {
      name: "Mid-century Modern",
      match: "Your leading direction",
      desc: "Confident lines, tapered legs and a love of walnut. You mix graphic form with easy comfort — a room that nods to the 1950s studio without feeling like a museum. Warm woods meet the occasional bold accent and plenty of organic curve.",
      palette: [
        { hex: "#f0e7d6", c: "#f0e7d6" },
        { hex: "#d99c5f", c: "#d99c5f" },
        { hex: "#8c6a4f", c: "#8c6a4f" },
        { hex: "#3a5a48", c: "#3a5a48" },
        { hex: "#2c2620", c: "#2c2620" }
      ],
      pieces: ["Tapered-leg walnut credenza", "Egg-shaped lounge chair", "Globe arc floor lamp", "Geometric wool rug", "Brass starburst mirror"]
    },
    minimal: {
      name: "Warm Minimal",
      match: "Your leading direction",
      desc: "Pared back but never cold. You edit ruthlessly, then let a few beautiful textures — bouclé, lime plaster, unlacquered brass — carry the room. Tonal, calm and generous with light, your spaces feel expensive precisely because so little is on show.",
      palette: [
        { hex: "#fbf9f5", c: "#fbf9f5" },
        { hex: "#ece4d7", c: "#ece4d7" },
        { hex: "#c2b09a", c: "#c2b09a" },
        { hex: "#8a8175", c: "#8a8175" },
        { hex: "#4a443c", c: "#4a443c" }
      ],
      pieces: ["Bouclé curved sofa", "Lime-plaster wall finish", "Monolithic stone coffee table", "Unlacquered brass sconce", "Oversized floor vase"]
    },
    organic: {
      name: "Organic Modern",
      match: "Your leading direction",
      desc: "Earthy, tactile and alive. You bring the outdoors in with raw timber, rattan, terracotta and layered greenery. Curves soften every corner and natural imperfection is the whole point — a home that feels grounded, sun-warmed and easy to live in.",
      palette: [
        { hex: "#f4ede1", c: "#f4ede1" },
        { hex: "#cb8f6a", c: "#cb8f6a" },
        { hex: "#9caf88", c: "#9caf88" },
        { hex: "#6b8f6d", c: "#6b8f6d" },
        { hex: "#5c4433", c: "#5c4433" }
      ],
      pieces: ["Live-edge dining table", "Woven rattan lounge chair", "Terracotta planter cluster", "Jute layered rug", "Trailing pothos & fig"]
    }
  };

  // Gradient helpers for option swatches
  function grad(a, b, c) {
    return "background:linear-gradient(140deg," + a + " 0%," + b + " 60%," + (c || b) + " 130%)";
  }

  // --- Questions --------------------------------------------------------
  var QUESTIONS = [
    {
      kicker: "Question 01",
      title: "Which room makes you exhale?",
      label: "Mood",
      options: [
        { label: "Serene & spare", note: "Empty floor, soft light", style: "japandi", css: grad("#e9e3d8", "#c8b8a1", "#7d6b57") },
        { label: "Bold & graphic", note: "Statement shapes", style: "midcentury", css: grad("#d99c5f", "#8c6a4f", "#3a5a48") },
        { label: "Soft & tonal", note: "Quiet luxury", style: "minimal", css: grad("#fbf9f5", "#ece4d7", "#c2b09a") },
        { label: "Lush & earthy", note: "Plants everywhere", style: "organic", css: grad("#cb8f6a", "#9caf88", "#5c4433") }
      ]
    },
    {
      kicker: "Question 02",
      title: "Pick a material to live with.",
      label: "Material",
      options: [
        { label: "Pale ash & paper", note: "Light, matte grain", style: "japandi", css: grad("#efe7d6", "#d8c7ab", "#a3906f") },
        { label: "Rich walnut", note: "Warm, glossy", style: "midcentury", css: grad("#a9724a", "#8c6a4f", "#4b3626") },
        { label: "Lime plaster", note: "Chalky, tonal", style: "minimal", css: grad("#f0e9dd", "#d9cbb6", "#b6a68f") },
        { label: "Rattan & jute", note: "Woven, tactile", style: "organic", css: grad("#d8b483", "#b98d5c", "#7d6b3f") }
      ]
    },
    {
      kicker: "Question 03",
      title: "Choose your palette.",
      label: "Palette",
      options: [
        { label: "Oat & charcoal", note: "Muted contrast", style: "japandi", css: grad("#e9e3d8", "#8a8175", "#3d352b") },
        { label: "Mustard & teal", note: "Retro warmth", style: "midcentury", css: grad("#d99c5f", "#3a5a48", "#8c6a4f") },
        { label: "Bone on bone", note: "Whisper tones", style: "minimal", css: grad("#fbf9f5", "#ece4d7", "#c2b09a") },
        { label: "Terracotta & sage", note: "Sun & garden", style: "organic", css: grad("#cb8f6a", "#9caf88", "#6b8f6d") }
      ]
    },
    {
      kicker: "Question 04",
      title: "Your ideal seat.",
      label: "Silhouette",
      options: [
        { label: "Low floor sofa", note: "Grounded, linen", style: "japandi", css: grad("#ddd2bd", "#b7a488", "#7d6b57") },
        { label: "Tapered armchair", note: "Angular legs", style: "midcentury", css: grad("#c98f5c", "#8c6a4f", "#2c2620") },
        { label: "Bouclé curve", note: "Soft monolith", style: "minimal", css: grad("#f2ece0", "#ddd0bc", "#b0a08b") },
        { label: "Woven lounger", note: "Curved rattan", style: "organic", css: grad("#d5aa78", "#9caf88", "#5c4433") }
      ]
    },
    {
      kicker: "Question 05",
      title: "One finishing touch.",
      label: "Accent",
      options: [
        { label: "Single branch", note: "In a stone vase", style: "japandi", css: grad("#e4dccb", "#a99a80", "#5c4f3e") },
        { label: "Starburst mirror", note: "Brass, radiant", style: "midcentury", css: grad("#e0b063", "#b0803f", "#4b3626") },
        { label: "Sculptural vessel", note: "Oversized, matte", style: "minimal", css: grad("#f0e9dd", "#cdbfa8", "#8a8175") },
        { label: "Trailing greenery", note: "Layered pots", style: "organic", css: grad("#9caf88", "#6b8f6d", "#3d4f34") }
      ]
    }
  ];

  // --- State ------------------------------------------------------------
  var state = { index: -1, answers: [] }; // index -1 = intro; length = result
  var TOTAL = QUESTIONS.length;

  var stage = document.getElementById("stage");
  var railFill = document.getElementById("railFill");
  var stepLabel = document.getElementById("stepLabel");
  var stepCount = document.getElementById("stepCount");
  var backBtn = document.getElementById("backBtn");
  var ctaBtn = document.getElementById("ctaBtn");
  var footHint = document.getElementById("footHint");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // --- Render -----------------------------------------------------------
  function render() {
    if (state.index === -1) return renderIntro();
    if (state.index >= TOTAL) return renderResult();
    return renderQuestion(state.index);
  }

  function updateChrome() {
    var answered = state.answers.filter(function (a) { return a != null; }).length;
    var pct;
    if (state.index === -1) pct = 0;
    else if (state.index >= TOTAL) pct = 100;
    else pct = Math.round((state.index / TOTAL) * 100);
    railFill.style.width = pct + "%";

    if (state.index === -1) { stepLabel.textContent = "Intro"; stepCount.textContent = "0 / " + TOTAL; }
    else if (state.index >= TOTAL) { stepLabel.textContent = "Result"; stepCount.textContent = TOTAL + " / " + TOTAL; }
    else { stepLabel.textContent = QUESTIONS[state.index].label; stepCount.textContent = (state.index + 1) + " / " + TOTAL; }

    backBtn.disabled = state.index <= -1;
    ctaBtn.hidden = state.index < TOTAL;
    footHint.textContent = state.index === -1
      ? "Five quick picks"
      : state.index >= TOTAL
        ? answered + " answers tallied"
        : (state.answers[state.index] != null ? "Great — pick or continue" : "Choose an image to continue");
  }

  function renderIntro() {
    stage.innerHTML =
      '<div class="slide intro">' +
        '<div class="intro__art"></div>' +
        '<h1 class="intro__title serif" id="quiz-title">Find your interior style</h1>' +
        '<p class="intro__lead">Five considered questions, one clear direction. Answer with your eye and we’ll name the aesthetic your home is quietly asking for.</p>' +
        '<div class="tagrow">' +
          '<span class="badge">Japandi</span>' +
          '<span class="badge">Mid-century</span>' +
          '<span class="badge">Warm Minimal</span>' +
          '<span class="badge">Organic Modern</span>' +
        '</div>' +
        '<button class="btn btn--start" id="startBtn" type="button">Begin the quiz</button>' +
      '</div>';
    document.getElementById("startBtn").addEventListener("click", function () {
      state.index = 0; render();
    });
    updateChrome();
  }

  function renderQuestion(i) {
    var q = QUESTIONS[i];
    var chosen = state.answers[i];
    var html = '<div class="slide">' +
      '<p class="q__kicker">' + q.kicker + '</p>' +
      '<h2 class="q__title serif" id="quiz-title">' + q.title + '</h2>' +
      '<ul class="options" role="list">';
    q.options.forEach(function (opt, oi) {
      var pressed = chosen === oi;
      html +=
        '<li>' +
          '<button class="opt" type="button" data-i="' + oi + '" aria-pressed="' + (pressed ? "true" : "false") + '">' +
            '<span class="opt__swatch" style="' + opt.css + '"></span>' +
            '<span class="opt__body">' +
              '<span><span class="opt__label">' + opt.label + '</span>' +
              '<span class="opt__note">' + opt.note + '</span></span>' +
              '<span class="opt__tick" aria-hidden="true">✓</span>' +
            '</span>' +
          '</button>' +
        '</li>';
    });
    html += '</ul></div>';
    stage.innerHTML = html;

    var buttons = stage.querySelectorAll(".opt");
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { choose(i, parseInt(b.getAttribute("data-i"), 10)); });
    });
    updateChrome();
  }

  function choose(qi, oi) {
    state.answers[qi] = oi;
    // reflect selection instantly
    stage.querySelectorAll(".opt").forEach(function (b) {
      b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-i"), 10) === oi ? "true" : "false");
    });
    updateChrome();
    // advance after a beat
    setTimeout(function () {
      state.index = qi + 1;
      render();
    }, 340);
  }

  function tally() {
    var scores = { japandi: 0, midcentury: 0, minimal: 0, organic: 0 };
    state.answers.forEach(function (oi, qi) {
      if (oi == null) return;
      var s = QUESTIONS[qi].options[oi].style;
      scores[s] += 1;
    });
    var best = "japandi", bestN = -1;
    Object.keys(scores).forEach(function (k) {
      if (scores[k] > bestN) { bestN = scores[k]; best = k; }
    });
    return best;
  }

  function renderResult() {
    var key = tally();
    var s = STYLES[key];
    var swatches = s.palette.map(function (p) {
      return '<span data-hex="' + p.hex + '" style="background:' + p.c + '"></span>';
    }).join("");
    var pieces = s.pieces.map(function (p) {
      return '<li><span class="dot" aria-hidden="true"></span>' + p + '</li>';
    }).join("");

    stage.innerHTML =
      '<div class="slide result">' +
        '<div class="result__head">' +
          '<span class="badge">Your result</span>' +
          '<span class="result__match">' + s.match + '</span>' +
        '</div>' +
        '<h2 class="result__title serif" id="quiz-title">' + s.name + '</h2>' +
        '<p class="result__desc">' + s.desc + '</p>' +
        '<div class="result__grid">' +
          '<div>' +
            '<p class="result__sub">Signature palette</p>' +
            '<div class="palette">' + swatches + '</div>' +
            '<button class="btn btn--ghost" id="retakeBtn" type="button" style="margin-top:18px">↺ Retake quiz</button>' +
          '</div>' +
          '<div>' +
            '<p class="result__sub">Pieces to look for</p>' +
            '<ul class="pieces">' + pieces + '</ul>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById("retakeBtn").addEventListener("click", reset);
    updateChrome();
    toast("Your style: " + s.name);
  }

  function reset() {
    state = { index: -1, answers: [] };
    render();
    toast("Quiz reset — start again");
  }

  // --- Footer controls --------------------------------------------------
  backBtn.addEventListener("click", function () {
    if (state.index > -1) { state.index -= 1; render(); }
  });

  ctaBtn.addEventListener("click", function () {
    var s = STYLES[tally()];
    toast("Opening " + s.name + " pieces…");
  });

  // Keyboard: number keys 1-4 select on a question
  document.addEventListener("keydown", function (e) {
    if (state.index < 0 || state.index >= TOTAL) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) {
      var btn = stage.querySelector('.opt[data-i="' + (n - 1) + '"]');
      if (btn) { e.preventDefault(); btn.focus(); choose(state.index, n - 1); }
    }
  });

  render();
})();
