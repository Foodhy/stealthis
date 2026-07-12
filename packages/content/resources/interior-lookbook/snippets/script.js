(function () {
  "use strict";

  /* --------------------------------------------------------------
   * Plate data — derived from the figures in the DOM so the
   * lightbox, filmstrip and captions always stay in sync.
   * ------------------------------------------------------------ */
  var frames = Array.prototype.slice.call(document.querySelectorAll(".frame"));
  var plates = frames.map(function (frame) {
    var img = frame.querySelector("img");
    return {
      src: img.getAttribute("src").replace(/w=\d+/, "w=1400"),
      thumb: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      tag: frame.querySelector(".cap-tag").textContent,
      title: frame.querySelector(".cap-title").textContent,
      note: frame.querySelector(".cap-note").textContent
    };
  });

  /* --------------------------------------------------------------
   * Toast helper
   * ------------------------------------------------------------ */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-shown");
    }, 2600);
  }

  /* --------------------------------------------------------------
   * Scroll progress bar
   * ------------------------------------------------------------ */
  var progressBar = document.getElementById("progressBar");
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    progressBar.style.width = (pct * 100).toFixed(1) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* --------------------------------------------------------------
   * Chapter reveal on scroll
   * ------------------------------------------------------------ */
  var chapters = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    chapters.forEach(function (c) {
      io.observe(c);
    });
  } else {
    chapters.forEach(function (c) {
      c.classList.add("is-visible");
    });
  }

  /* --------------------------------------------------------------
   * Lightbox
   * ------------------------------------------------------------ */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbTag = document.getElementById("lbTag");
  var lbTitle = document.getElementById("lbTitle");
  var lbNote = document.getElementById("lbNote");
  var lbCount = document.getElementById("lbCount");
  var filmstrip = document.getElementById("filmstrip");
  var current = 0;
  var lastFocused = null;

  // Build filmstrip once
  plates.forEach(function (plate, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "View " + plate.title);
    var img = document.createElement("img");
    img.src = plate.thumb;
    img.alt = "";
    btn.appendChild(img);
    btn.addEventListener("click", function () {
      show(i);
    });
    filmstrip.appendChild(btn);
  });
  var stripBtns = Array.prototype.slice.call(filmstrip.children);

  function render() {
    var p = plates[current];
    lbImg.src = p.src;
    lbImg.alt = p.alt;
    lbTag.textContent = p.tag;
    lbTitle.textContent = p.title;
    lbNote.textContent = p.note;
    lbCount.textContent = "Plate " + (current + 1) + " of " + plates.length;
    stripBtns.forEach(function (b, i) {
      b.classList.toggle("is-active", i === current);
    });
    var active = stripBtns[current];
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }

  function openLightbox(index) {
    current = index;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    render();
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function show(index) {
    current = (index + plates.length) % plates.length;
    render();
  }
  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  // Wire up frame buttons
  frames.forEach(function (frame, i) {
    frame.querySelector(".frame__btn").addEventListener("click", function () {
      openLightbox(i);
    });
  });

  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbNext").addEventListener("click", next);
  document.getElementById("lbPrev").addEventListener("click", prev);

  // Backdrop click closes (but not clicks on the figure/controls)
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.classList.contains("lightbox__stage")) {
      closeLightbox();
    }
  });

  // Keyboard controls
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  /* --------------------------------------------------------------
   * Save action
   * ------------------------------------------------------------ */
  var saveBtn = document.getElementById("saveBtn");
  var saved = false;
  saveBtn.addEventListener("click", function () {
    saved = !saved;
    saveBtn.textContent = saved ? "Saved to your shelf" : "Save this lookbook";
    toast(saved ? "Lookbook № 04 saved to your shelf." : "Removed from your shelf.");
  });

  /* --------------------------------------------------------------
   * Smooth-scroll masthead nav + gentle first hint
   * ------------------------------------------------------------ */
  document.querySelectorAll(".masthead__nav a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
