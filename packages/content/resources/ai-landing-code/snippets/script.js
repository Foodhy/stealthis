/* ===== Cortex landing — vanilla interactions ===== */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2600);
  }
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (el.getAttribute("href") === "#") e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- hero: typing autocomplete demo ---------- */
  var target = document.getElementById("typeTarget");
  var caret = document.getElementById("caret");
  var ghostHint = document.getElementById("ghostHint");
  // token sequence: [cssClass|null, text]; null = plain
  var tokens = [
    ["t-cmt", "// validate a checkout before charging\n"],
    ["t-key", "export function "],
    ["t-fn", "canCharge"],
    [null, "("],
    ["t-var", "cart"],
    [null, ": "],
    ["t-type", "Cart"],
    [null, ") {\n  "],
    ["t-key", "return "],
    ["t-var", "cart"],
    [null, ".items."],
    ["t-fn", "length"],
    [null, " > "],
    ["t-num", "0"],
    [null, "\n"],
    ["t-ghost", "    && cart.total > 0\n    && cart.currency != null  // ⌁ cortex"],
    [null, "\n}"]
  ];

  function typeDemo() {
    if (!target) return;
    target.innerHTML = "";
    var ti = 0;
    function nextToken() {
      if (ti >= tokens.length) {
        if (ghostHint) ghostHint.style.opacity = "1";
        if (caret) caret.style.display = "none";
        return;
      }
      var cls = tokens[ti][0];
      var text = tokens[ti][1];
      var span = document.createElement("span");
      if (cls) span.className = cls;
      target.appendChild(span);
      var ci = 0;
      var ghost = cls === "t-ghost";
      function typeChar() {
        if (ci <= text.length) {
          span.textContent = text.slice(0, ci);
          ci++;
          setTimeout(typeChar, ghost ? 14 : 26 + Math.random() * 30);
        } else {
          ti++;
          setTimeout(nextToken, ghost ? 160 : 60);
        }
      }
      typeChar();
    }
    if (ghostHint) ghostHint.style.opacity = "0";
    if (caret) caret.style.display = "inline-block";
    nextToken();
  }

  // start typing when hero editor is on screen (once)
  var editorEl = target ? target.closest(".editor") : null;
  if (editorEl && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var heroIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { typeDemo(); heroIO.disconnect(); }
      });
    }, { threshold: 0.4 });
    heroIO.observe(editorEl);
  } else if (target) {
    // reduced motion / no IO: render final state instantly
    target.innerHTML =
      '<span class="t-cmt">// validate a checkout before charging\n</span>' +
      '<span class="t-key">export function </span><span class="t-fn">canCharge</span>(' +
      '<span class="t-var">cart</span>: <span class="t-type">Cart</span>) {\n  ' +
      '<span class="t-key">return </span><span class="t-var">cart</span>.items.length > <span class="t-num">0</span>\n' +
      '<span class="t-ghost">    && cart.total > 0\n    && cart.currency != null  // ⌁ cortex</span>\n}';
    if (caret) caret.style.display = "none";
    if (ghostHint) ghostHint.style.opacity = "1";
  }

  /* ---------- demo tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== name;
        if (!p.hidden) p.classList.add("is-active"); else p.classList.remove("is-active");
      });
    });
  });

  /* ---------- copy CLI command ---------- */
  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var cmd = copyBtn.getAttribute("data-cmd");
      var done = function () {
        copyBtn.textContent = "Copied ✓";
        copyBtn.classList.add("is-done");
        toast("Install command copied to clipboard");
        setTimeout(function () { copyBtn.textContent = "Copy"; copyBtn.classList.remove("is-done"); }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(done).catch(fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = cmd; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  /* ---------- pricing toggle ---------- */
  var billToggle = document.getElementById("billToggle");
  if (billToggle) {
    var amounts = document.querySelectorAll(".amount");
    billToggle.querySelectorAll(".toggle__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var bill = btn.getAttribute("data-bill");
        billToggle.querySelectorAll(".toggle__btn").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        amounts.forEach(function (a) {
          var val = a.getAttribute("data-" + bill);
          a.textContent = val === "0" ? "$0" : "$" + val;
        });
      });
    });
  }
})();
