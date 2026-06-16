(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var STANDARD_WPM = 225;

  function countWords(text) {
    if (!text) return 0;
    var m = text.trim().match(/[^\s]+/g);
    return m ? m.length : 0;
  }

  function readMinutes(words, wpm) {
    wpm = wpm || STANDARD_WPM;
    if (!words || words <= 0) return 0;
    return Math.max(1, Math.round(words / wpm));
  }

  function fmtInt(n) {
    return Number(n).toLocaleString("en-US");
  }

  function fmtSeconds(totalSec) {
    var s = Math.round(totalSec);
    if (s < 60) return s + "s";
    var m = Math.floor(s / 60);
    var rem = s % 60;
    return m + "m " + rem + "s";
  }

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("toast--show");
    }, 2400);
  }

  /* ---------- auto read-time on every byline block ----------
     Each [data-readtime] byline has a sibling/related copy block
     carrying [data-wordsource]; we count its words and fill the
     [data-readtime-out] span inside the byline. */
  function findWordSource(bylineEl) {
    var article = bylineEl.closest("article, section");
    if (!article) article = document;
    var sources = article.querySelectorAll("[data-wordsource]");
    var words = 0;
    sources.forEach(function (s) {
      words += countWords(s.textContent);
    });
    return words;
  }

  document.querySelectorAll("[data-readtime]").forEach(function (byline) {
    var out = byline.querySelector("[data-readtime-out]");
    if (!out) return;
    var words = findWordSource(byline);
    var mins = readMinutes(words, STANDARD_WPM);
    out.textContent = mins + " min read";
    out.setAttribute("title", fmtInt(words) + " words at " + STANDARD_WPM + " wpm");
  });

  /* ---------- bookmark / save toggle ---------- */
  document.querySelectorAll("[data-bookmark]").forEach(function (btn) {
    var label = btn.querySelector("[data-bookmark-label]");
    btn.addEventListener("click", function () {
      var saved = btn.getAttribute("aria-pressed") === "true";
      saved = !saved;
      btn.setAttribute("aria-pressed", String(saved));
      if (label) label.textContent = saved ? "Saved" : "Save";
      btn.setAttribute("aria-label", saved ? "Remove from saved" : "Save article");
      toast(saved ? "Saved to your reading list" : "Removed from reading list");
    });
  });

  /* ---------- share buttons ---------- */
  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-share");
      if (kind === "link") {
        var url = location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(
            function () { toast("Link copied to clipboard"); },
            function () { toast("Link: " + url); }
          );
        } else {
          toast("Link: " + url);
        }
      } else if (kind === "X") {
        toast("Opening share to X…");
      } else if (kind === "mail") {
        toast("Opening your email client…");
      } else {
        toast("Sharing…");
      }
    });
  });

  /* ---------- reading-time calculator ---------- */
  var wpmInput = document.getElementById("wpm");
  var wpmOut = document.getElementById("wpm-out");
  var wordsInput = document.getElementById("words");
  var copyInput = document.getElementById("copy");

  var outMin = document.getElementById("calc-min");
  var statWords = document.getElementById("stat-words");
  var statWpm = document.getElementById("stat-wpm");
  var statSecs = document.getElementById("stat-secs");
  var preview = document.getElementById("calc-preview");

  function currentWpm() {
    var v = wpmInput ? parseInt(wpmInput.value, 10) : STANDARD_WPM;
    return v > 0 ? v : STANDARD_WPM;
  }

  function currentWords() {
    // If copy is pasted, it wins and drives the number field.
    if (copyInput && copyInput.value.trim().length) {
      var w = countWords(copyInput.value);
      if (wordsInput) wordsInput.value = w;
      return w;
    }
    var n = wordsInput ? parseInt(wordsInput.value, 10) : 0;
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function renderCalc() {
    var wpm = currentWpm();
    var words = currentWords();
    var mins = readMinutes(words, wpm);
    var secs = words > 0 ? (words / wpm) * 60 : 0;

    if (wpmOut) wpmOut.textContent = wpm + " wpm";
    if (outMin) outMin.textContent = mins;
    if (statWords) statWords.textContent = fmtInt(words);
    if (statWpm) statWpm.textContent = wpm + " wpm";
    if (statSecs) statSecs.textContent = fmtSeconds(secs);
    if (preview) {
      preview.textContent = "By a Staff Writer · " + mins + " min read";
    }
  }

  if (wpmInput) wpmInput.addEventListener("input", renderCalc);
  if (wordsInput) wordsInput.addEventListener("input", renderCalc);
  if (copyInput) copyInput.addEventListener("input", renderCalc);

  renderCalc();
})();
