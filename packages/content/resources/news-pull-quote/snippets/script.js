(function () {
  "use strict";

  var column = document.getElementById("column");
  var hintCap = document.getElementById("hint-cap");
  var hintQuote = document.getElementById("hint-quote");

  var CAP_LABELS = {
    raised: "Raised",
    dropped: "Dropped",
    decorative: "Decorative red",
    boxed: "Boxed",
    none: "None",
  };
  var QUOTE_LABELS = {
    bracketed: "Rule-bracketed",
    border: "Left-border accent",
    hanging: "Hanging quote",
    banner: "Full-width banner",
    inset: "Inset card",
  };

  /* ---- Toast helper ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---- Segmented control logic ---- */
  function setActive(group, value) {
    var buttons = document.querySelectorAll(
      '[data-group="' + group + '"] .seg__btn'
    );
    buttons.forEach(function (btn) {
      var on = btn.getAttribute("data-" + group) === value;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function applyCap(value) {
    if (!CAP_LABELS[value]) return;
    column.setAttribute("data-cap", value);
    setActive("cap", value);
    if (hintCap) hintCap.textContent = CAP_LABELS[value];
  }

  function applyQuote(value) {
    if (!QUOTE_LABELS[value]) return;
    column.setAttribute("data-quote", value);
    setActive("quote", value);
    if (hintQuote) hintQuote.textContent = QUOTE_LABELS[value];
  }

  document.querySelectorAll('[data-group="cap"] .seg__btn').forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.getAttribute("data-cap");
      applyCap(v);
      toast("Drop cap → " + CAP_LABELS[v]);
    });
  });

  document.querySelectorAll('[data-group="quote"] .seg__btn').forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.getAttribute("data-quote");
      applyQuote(v);
      toast("Pull quote → " + QUOTE_LABELS[v]);
    });
  });

  /* ---- Keyboard arrow nav within each radiogroup ---- */
  document.querySelectorAll('[role="radiogroup"]').forEach(function (group) {
    group.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" &&
          e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      var btns = Array.prototype.slice.call(group.querySelectorAll(".seg__btn"));
      var idx = btns.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
      var next = (idx + dir + btns.length) % btns.length;
      btns[next].focus();
      btns[next].click();
    });
  });

  /* ---- CSS snippet builder ---- */
  function buildSnippet() {
    var cap = column.getAttribute("data-cap");
    var quote = column.getAttribute("data-quote");

    var capRules = {
      raised:
        ".lead::first-letter {\n  font-family: \"Playfair Display\", serif;\n  font-weight: 800;\n  font-size: 3.1em;\n  line-height: 0.8;\n  vertical-align: -0.06em;\n}",
      dropped:
        ".lead::first-letter {\n  float: left;\n  font-family: \"Playfair Display\", serif;\n  font-weight: 800;\n  font-size: 4.4em;\n  line-height: 0.74;\n  padding: 0.02em 0.08em 0 0;\n}",
      decorative:
        ".lead::first-letter {\n  float: left;\n  font-family: \"Playfair Display\", serif;\n  font-weight: 900;\n  font-style: italic;\n  font-size: 4.8em;\n  line-height: 0.7;\n  color: #b4291f;\n  text-shadow: 2px 2px 0 #f3dcd9;\n}",
      boxed:
        ".lead::first-letter {\n  float: left;\n  font-family: \"Playfair Display\", serif;\n  font-weight: 800;\n  font-size: 2.7em;\n  margin: 0.06em 0.42em 0 0;\n  padding: 0.16em 0.22em;\n  color: #f4efe4;\n  background: #16130f;\n  border-radius: 4px;\n}",
      none: ".lead::first-letter {\n  /* no special initial */\n}",
    };

    var quoteRules = {
      bracketed:
        ".pq {\n  text-align: center;\n  border-top: 2px solid #16130f;\n  border-bottom: 2px solid #16130f;\n  padding: 18px 8px;\n  max-width: 440px;\n  margin: 1.6em auto;\n}\n.pq blockquote {\n  font: italic 700 1.55em/1.22 \"Playfair Display\", serif;\n}",
      border:
        ".pq {\n  border-left: 4px solid #b4291f;\n  padding: 4px 0 4px 18px;\n  margin: 1.6em 0;\n}\n.pq blockquote {\n  font: 700 1.45em/1.26 \"Playfair Display\", serif;\n}",
      hanging:
        ".pq {\n  position: relative;\n  margin: 1.6em 0;\n}\n.pq blockquote {\n  font: italic 700 1.5em/1.24 \"Playfair Display\", serif;\n  text-indent: 0.9em;\n}\n.pq blockquote::before {\n  content: \"\\201C\";\n  position: absolute;\n  left: -0.06em;\n  top: 0.16em;\n  font: 900 3.6em/0 \"Playfair Display\", serif;\n  color: #b4291f;\n}",
      banner:
        ".pq {\n  background: #16130f;\n  color: #f4efe4;\n  border-radius: 4px;\n  padding: 26px 28px;\n  margin: 1.6em -28px;\n  text-align: center;\n}\n.pq blockquote {\n  font: 700 1.6em/1.2 \"Playfair Display\", serif;\n}",
      inset:
        ".pq {\n  background: #faf7f0;\n  border: 1px solid rgba(22,19,15,0.16);\n  border-top: 4px solid #b4291f;\n  border-radius: 4px;\n  padding: 20px 22px;\n  margin: 1.6em 0;\n}\n.pq blockquote {\n  font: 700 1.4em/1.28 \"Playfair Display\", serif;\n}",
    };

    return (
      "/* Drop cap: " + CAP_LABELS[cap] + " */\n" +
      capRules[cap] +
      "\n\n/* Pull quote: " + QUOTE_LABELS[quote] + " */\n" +
      quoteRules[quote] +
      "\n"
    );
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /* ---- Action buttons ---- */
  document.querySelectorAll("[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-action");
      if (action === "reset") {
        applyCap("raised");
        applyQuote("bracketed");
        toast("Forme reset to defaults");
      } else if (action === "copy") {
        copyText(buildSnippet()).then(
          function () {
            toast("CSS snippet copied to clipboard");
          },
          function () {
            toast("Copy failed — select the text manually");
          }
        );
      }
    });
  });
})();
