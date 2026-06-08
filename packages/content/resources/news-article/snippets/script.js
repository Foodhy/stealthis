(function () {
  "use strict";

  /* -- Toast helper -------------------------------------------------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2400);
  }

  /* -- Reading progress bar ------------------------------------------------ */
  var bar = document.getElementById("progressBar");
  var article = document.getElementById("article");
  function updateProgress() {
    if (!bar || !article) return;
    var rect = article.getBoundingClientRect();
    var viewport = window.innerHeight || document.documentElement.clientHeight;
    var total = rect.height - viewport;
    var scrolled = -rect.top;
    var pct = total > 0 ? (scrolled / total) * 100 : 0;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    bar.style.width = pct.toFixed(2) + "%";
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateProgress();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();

  /* -- Share buttons ------------------------------------------------------- */
  var shareButtons = document.querySelectorAll("[data-share]");
  Array.prototype.forEach.call(shareButtons, function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-share");
      if (kind === "link") {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(
            function () {
              toast("Link copied to clipboard");
            },
            function () {
              toast("Couldn't copy — copy from the address bar");
            }
          );
        } else {
          toast("Link: " + url);
        }
      } else if (kind === "x") {
        toast("Shared to X (demo)");
      } else if (kind === "mail") {
        toast("Email draft opened (demo)");
      }
    });
  });

  /* -- Font-size control --------------------------------------------------- */
  var body = document.getElementById("articleBody");
  var STEP = 1;
  var MIN = 15;
  var MAX = 22;
  var DEFAULT = 17;
  var size = DEFAULT;

  function applySize() {
    if (body) body.style.fontSize = size + "px";
  }
  function setSize(next) {
    size = Math.max(MIN, Math.min(MAX, next));
    applySize();
  }

  var up = document.getElementById("fontUp");
  var down = document.getElementById("fontDown");
  var reset = document.getElementById("fontReset");

  if (up)
    up.addEventListener("click", function () {
      if (size >= MAX) {
        toast("Largest text size");
        return;
      }
      setSize(size + STEP);
      toast("Text size: " + size + "px");
    });
  if (down)
    down.addEventListener("click", function () {
      if (size <= MIN) {
        toast("Smallest text size");
        return;
      }
      setSize(size - STEP);
      toast("Text size: " + size + "px");
    });
  if (reset)
    reset.addEventListener("click", function () {
      setSize(DEFAULT);
      toast("Text size reset");
    });
})();
