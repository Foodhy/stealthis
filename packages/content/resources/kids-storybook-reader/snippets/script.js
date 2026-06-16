(function () {
  "use strict";

  /* ---------- tiny SVG scene builders (no external images) ---------- */
  // Each returns an inline SVG string. Shapes marked class="tap" wiggle on tap.

  function sky(grad) {
    return (
      '<defs>' +
      '<linearGradient id="' + grad + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#e9f8ff"/>' +
      '</linearGradient></defs>' +
      '<rect width="200" height="150" fill="url(#' + grad + ')"/>'
    );
  }

  function fox(x, y, s) {
    s = s || 1;
    return (
      '<g class="tap" transform="translate(' + x + ',' + y + ') scale(' + s + ')" role="img" aria-label="Pip the lantern fox">' +
      '<ellipse cx="0" cy="20" rx="20" ry="7" fill="#2c2350" opacity="0.12"/>' +
      '<path d="M-16 6 Q-22 -14 -10 -10 Z" fill="#ff8a3d" stroke="#2c2350" stroke-width="2"/>' +
      '<path d="M16 6 Q22 -14 10 -10 Z" fill="#ff8a3d" stroke="#2c2350" stroke-width="2"/>' +
      '<ellipse cx="0" cy="6" rx="16" ry="14" fill="#ff9d57" stroke="#2c2350" stroke-width="2"/>' +
      '<ellipse cx="0" cy="11" rx="9" ry="8" fill="#fff6ea"/>' +
      '<circle cx="-6" cy="3" r="2.4" fill="#2c2350"/>' +
      '<circle cx="6" cy="3" r="2.4" fill="#2c2350"/>' +
      '<circle cx="0" cy="9" r="2.2" fill="#2c2350"/>' +
      '<path d="M18 14 Q34 6 30 24 Q24 22 18 18 Z" fill="#ff8a3d" stroke="#2c2350" stroke-width="2"/>' +
      '</g>'
    );
  }

  function lantern(x, y, glow) {
    return (
      '<g class="tap" transform="translate(' + x + ',' + y + ')" role="img" aria-label="Glowing lantern">' +
      (glow ? '<circle cx="0" cy="6" r="22" fill="#ffd23f" opacity="0.35"/>' : '') +
      '<rect x="-7" y="-2" width="14" height="18" rx="4" fill="#ffe48a" stroke="#2c2350" stroke-width="2"/>' +
      '<rect x="-9" y="-6" width="18" height="5" rx="2" fill="#5ec5d6" stroke="#2c2350" stroke-width="2"/>' +
      '<rect x="-9" y="15" width="18" height="5" rx="2" fill="#5ec5d6" stroke="#2c2350" stroke-width="2"/>' +
      '<path d="M0 -6 v-6" stroke="#2c2350" stroke-width="2"/>' +
      '<circle cx="0" cy="7" r="4" fill="#fff3c4"/>' +
      '</g>'
    );
  }

  function tree(x, y) {
    return (
      '<g class="tap" transform="translate(' + x + ',' + y + ')" role="img" aria-label="Tree">' +
      '<rect x="-5" y="0" width="10" height="26" rx="4" fill="#a8723e" stroke="#2c2350" stroke-width="2"/>' +
      '<circle cx="0" cy="-8" r="18" fill="#7bd389" stroke="#2c2350" stroke-width="2"/>' +
      '<circle cx="-13" cy="2" r="12" fill="#7bd389" stroke="#2c2350" stroke-width="2"/>' +
      '<circle cx="13" cy="2" r="12" fill="#7bd389" stroke="#2c2350" stroke-width="2"/>' +
      '<circle cx="-5" cy="-6" r="2" fill="#ff6f9c"/>' +
      '<circle cx="7" cy="-2" r="2" fill="#ffd23f"/>' +
      '</g>'
    );
  }

  function star(x, y) {
    return (
      '<path class="tap" transform="translate(' + x + ',' + y + ')" role="img" aria-label="Star" ' +
      'd="M0 -7 2 -2 7 -2 3 2 4 7 0 4 -4 7 -3 2 -7 -2 -2 -2 Z" ' +
      'fill="#ffd23f" stroke="#2c2350" stroke-width="1.6"/>'
    );
  }

  function moon(x, y) {
    return (
      '<g class="tap" transform="translate(' + x + ',' + y + ')" role="img" aria-label="Moon">' +
      '<circle cx="0" cy="0" r="14" fill="#fff3c4" stroke="#2c2350" stroke-width="2"/>' +
      '<circle cx="5" cy="-3" r="3" fill="#ffe48a"/>' +
      '<circle cx="-3" cy="4" r="2" fill="#ffe48a"/>' +
      '</g>'
    );
  }

  function hill(color) {
    return '<path d="M0 150 Q60 110 120 130 Q170 145 200 120 V150 Z" fill="' + color + '" stroke="#2c2350" stroke-width="2"/>';
  }

  function nightSky() {
    return (
      '<defs><linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#3b3170"/><stop offset="1" stop-color="#7a6fb0"/>' +
      '</linearGradient></defs><rect width="200" height="150" fill="url(#ng)"/>'
    );
  }

  /* ---------- the 12 spreads (left scene + right story sentence) ---------- */
  var SPREADS = [
    {
      svg: sky("s0") + hill("#7bd389") + tree(48, 96) + fox(120, 110) + lantern(155, 78, false) + '<circle cx="40" cy="34" r="13" fill="#ffd23f" stroke="#2c2350" stroke-width="2"/>',
      text: "Once upon a leafy morning, a small fox named Pip found an old lantern under the wishing tree."
    },
    {
      svg: sky("s1") + hill("#9fe0a8") + fox(70, 108) + lantern(118, 96, true) + star(150, 30) + star(170, 52),
      text: "When Pip tapped the lantern twice, a warm honey-coloured light bloomed inside it."
    },
    {
      svg: nightSky() + moon(40, 36) + star(80, 24) + star(120, 40) + star(160, 22) + hill("#5b5197") + fox(96, 116) + lantern(132, 100, true),
      text: "Bravely, Pip carried the glowing lantern into the hush of the deep blue night."
    },
    {
      svg: nightSky() + star(30, 30) + star(70, 18) + tree(160, 100) + fox(60, 116) + lantern(96, 100, true) + '<path d="M120 130 q20 -14 44 0" stroke="#5ec5d6" stroke-width="3" fill="none"/>',
      text: "A sleepy river whispered, asking Pip to light the path across its smooth stone bridge."
    },
    {
      svg: nightSky() + moon(165, 34) + tree(40, 102) + tree(70, 108) + fox(120, 116) + lantern(150, 102, true),
      text: "Through the whispering forest they went, where every tree leaned close to see the light."
    },
    {
      svg: nightSky() + star(50, 26) + star(150, 30) + hill("#4d4488") + fox(60, 114) + lantern(96, 98, true) +
        '<g class="tap" transform="translate(150,108)"><ellipse cx="0" cy="6" rx="14" ry="6" fill="#2c2350" opacity="0.12"/><circle cx="0" cy="-2" r="11" fill="#c7b9f0" stroke="#2c2350" stroke-width="2"/><circle cx="-4" cy="-4" r="1.8" fill="#2c2350"/><circle cx="4" cy="-4" r="1.8" fill="#2c2350"/></g>',
      text: "A shy little owl was lost in the dark, so Pip shared the lantern's gentle gleam."
    },
    {
      svg: nightSky() + star(40, 22) + star(80, 40) + star(120, 20) + hill("#5b5197") + fox(70, 114) + lantern(106, 98, true) +
        '<g class="tap" transform="translate(150,112)"><circle cx="0" cy="0" r="9" fill="#ff9d57" stroke="#2c2350" stroke-width="2"/><circle cx="0" cy="-4" r="2" fill="#fff"/></g>',
      text: "Together they found a hedgehog curled by a rock, dreaming of a warmer, brighter glen."
    },
    {
      svg: nightSky() + moon(35, 40) + star(160, 26) + hill("#4d4488") + fox(64, 114) + lantern(100, 98, true) + tree(160, 104) + star(120, 30),
      text: "The friends climbed a hill of soft moss, the lantern swinging like a tiny golden sun."
    },
    {
      svg: nightSky() + star(30, 24) + star(70, 20) + star(110, 30) + star(150, 18) + hill("#5b5197") +
        '<path d="M70 120 L100 70 L130 120 Z" fill="#6f64aa" stroke="#2c2350" stroke-width="2"/>' + lantern(100, 92, true),
      text: "At the very top waited a quiet mountain, wrapped in stars and waiting to be warmed."
    },
    {
      svg: nightSky() + moon(160, 36) + star(40, 24) + star(90, 18) + hill("#4d4488") + fox(70, 114) + lantern(106, 96, true) +
        '<circle cx="100" cy="60" r="30" fill="#ffd23f" opacity="0.25"/>',
      text: "Pip held the lantern high, and its light spilled across the sleepy valley below."
    },
    {
      svg: '<defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#ffeede"/></linearGradient></defs>' +
        '<rect width="200" height="150" fill="url(#dawn)"/><circle cx="100" cy="120" r="34" fill="#ffd23f" stroke="#2c2350" stroke-width="2"/>' +
        hill("#7bd389") + tree(40, 100) + fox(120, 110) + lantern(154, 92, false),
      text: "When morning tiptoed in, every friend was safe and warm, and Pip's heart was full."
    },
    {
      end: true,
      text: "And so the little lantern fox curled up to sleep, ready for tomorrow's adventure."
    }
  ];

  /* ---------- elements ---------- */
  var spreadEl = document.getElementById("spread");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var pageNow = document.getElementById("pageNow");
  var pageTotal = document.getElementById("pageTotal");
  var progressFill = document.getElementById("progressFill");
  var thumbStrip = document.getElementById("thumbStrip");
  var fontToggle = document.getElementById("fontToggle");
  var restartBtn = document.getElementById("restartBtn");
  var toastEl = document.getElementById("toast");

  var total = SPREADS.length;
  var current = 0;
  var toastTimer = null;

  pageTotal.textContent = String(total);

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  function svgWrap(inner) {
    return '<svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" focusable="false">' + inner + "</svg>";
  }

  function confetti() {
    var colors = ["#ff8a3d", "#5ec5d6", "#ffd23f", "#ff6f9c", "#7bd389"];
    var box = document.createElement("div");
    box.className = "confetti";
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 26; i++) {
      var bit = document.createElement("i");
      bit.style.left = Math.random() * 100 + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.animationDuration = (1.4 + Math.random() * 1.2).toFixed(2) + "s";
      bit.style.animationDelay = (Math.random() * 0.5).toFixed(2) + "s";
      box.appendChild(bit);
    }
    return box;
  }

  function render(dir) {
    var data = SPREADS[current];
    var html;

    if (data.end) {
      html =
        '<div class="page page-left the-end-left">' +
        svgScene("end") +
        '<span class="page-num">' + (current * 2 + 1) + "</span>" +
        "</div>" +
        '<div class="page page-right">' +
        '<div class="the-end-card">' +
        "<h2>The End</h2>" +
        "<p>You finished the story! 🌟</p>" +
        '<p style="font-size:0.95rem">' + data.text + "</p>" +
        "</div>" +
        '<span class="page-num">' + (current * 2 + 2) + "</span>" +
        "</div>";
    } else {
      html =
        '<div class="page page-left">' +
        '<div class="scene">' + svgWrap(data.svg) + "</div>" +
        '<span class="page-num">' + (current * 2 + 1) + "</span>" +
        "</div>" +
        '<div class="page page-right">' +
        '<div class="scene">' + svgWrap(decorScene(current)) + "</div>" +
        '<p class="story-text">' + data.text + "</p>" +
        '<span class="page-num">' + (current * 2 + 2) + "</span>" +
        "</div>";
    }

    spreadEl.innerHTML = html;
    spreadEl.classList.toggle("the-end", !!data.end);

    if (data.end) {
      spreadEl.querySelector(".the-end-left").appendChild(confetti());
    }

    // page-turn animation
    if (dir) {
      spreadEl.classList.remove("turn-next", "turn-prev");
      void spreadEl.offsetWidth; // reflow to restart animation
      spreadEl.classList.add(dir === "next" ? "turn-next" : "turn-prev");
    }

    wireTaps();
    updateChrome();
  }

  // a small companion scene for the right page (keeps spread balanced)
  function decorScene(i) {
    var motifs = [
      sky("d" + i) + hill("#7bd389") + lantern(100, 80, true) + star(40, 30) + star(160, 26),
      nightSky() + moon(100, 50) + star(40, 30) + star(70, 60) + star(140, 28) + star(165, 60),
      nightSky() + star(30, 30) + tree(100, 100) + lantern(60, 80, true) + star(150, 30)
    ];
    return motifs[i % motifs.length];
  }

  function svgScene(kind) {
    if (kind === "end") {
      return (
        '<div class="scene">' +
        svgWrap(
          nightSky() + moon(150, 40) + star(30, 30) + star(70, 22) + star(110, 36) +
          hill("#4d4488") + fox(80, 116, 1.2) + lantern(120, 100, true)
        ) +
        "</div>"
      );
    }
    return "";
  }

  function wireTaps() {
    var taps = spreadEl.querySelectorAll(".tap");
    taps.forEach(function (el) {
      el.addEventListener("animationend", function () {
        el.classList.remove("wiggle");
      });
      el.addEventListener("click", function () {
        el.classList.remove("wiggle");
        void el.getBoundingClientRect();
        el.classList.add("wiggle");
      });
    });
  }

  function updateChrome() {
    pageNow.textContent = String(current + 1);
    var pct = ((current + 1) / total) * 100;
    progressFill.style.width = pct + "%";

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;

    var items = thumbStrip.querySelectorAll(".thumb");
    items.forEach(function (li, idx) {
      var active = idx === current;
      li.classList.toggle("is-active", active);
      var b = li.querySelector("button");
      if (b) b.setAttribute("aria-current", active ? "true" : "false");
    });

    var active = thumbStrip.querySelector(".thumb.is-active");
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }

  function go(index, dir) {
    index = Math.max(0, Math.min(total - 1, index));
    if (index === current && dir) return;
    current = index;
    render(dir);
    if (current === total - 1) {
      toast("The End — well read! 🎉");
    }
  }

  /* ---------- thumbnails ---------- */
  function buildThumbs() {
    SPREADS.forEach(function (data, i) {
      var li = document.createElement("li");
      li.className = "thumb";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Go to spread " + (i + 1) + " of " + total);

      var inner;
      if (data.end) {
        inner = nightSky() + moon(150, 40) + star(40, 30) + fox(90, 110, 1.1) + lantern(120, 96, true);
      } else {
        inner = data.svg;
      }
      btn.innerHTML = svgWrap(inner) + '<span class="thumb-no" aria-hidden="true">' + (i + 1) + "</span>";

      btn.addEventListener("click", function () {
        go(i, i > current ? "next" : i < current ? "prev" : null);
      });

      li.appendChild(btn);
      thumbStrip.appendChild(li);
    });
  }

  /* ---------- controls ---------- */
  nextBtn.addEventListener("click", function () {
    go(current + 1, "next");
  });
  prevBtn.addEventListener("click", function () {
    go(current - 1, "prev");
  });

  document.addEventListener("keydown", function (e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      go(current + 1, "next");
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      go(current - 1, "prev");
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0, "prev");
    } else if (e.key === "End") {
      e.preventDefault();
      go(total - 1, "next");
    }
  });

  fontToggle.addEventListener("click", function () {
    var on = document.body.classList.toggle("easy-read");
    fontToggle.setAttribute("aria-pressed", on ? "true" : "false");
    toast(on ? "Easy-read font on" : "Easy-read font off");
  });

  restartBtn.addEventListener("click", function () {
    go(0, "prev");
    toast("Back to the beginning 📖");
  });

  /* ---------- init ---------- */
  buildThumbs();
  render(null);
})();
