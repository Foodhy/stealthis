(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  /* ---------- Hover / focus highlight from inline refs ---------- */
  var hlTimer = null;
  function highlight(id, on) {
    var fig = document.getElementById(id);
    if (!fig) return;
    if (on) {
      fig.classList.add("is-highlight");
    } else {
      fig.classList.remove("is-highlight");
    }
  }

  var refs = document.querySelectorAll(".eqref");
  refs.forEach(function (ref) {
    var id = ref.getAttribute("data-target");

    ref.addEventListener("mouseenter", function () {
      highlight(id, true);
    });
    ref.addEventListener("mouseleave", function () {
      highlight(id, false);
    });
    ref.addEventListener("focus", function () {
      highlight(id, true);
    });
    ref.addEventListener("blur", function () {
      highlight(id, false);
    });

    // Click scrolls to the equation and pulses the highlight.
    ref.addEventListener("click", function () {
      var fig = document.getElementById(id);
      if (!fig) return;
      fig.scrollIntoView({ behavior: "smooth", block: "center" });
      highlight(id, true);
      clearTimeout(hlTimer);
      hlTimer = setTimeout(function () {
        highlight(id, false);
      }, 1600);
    });
  });

  /* ---------- Copy LaTeX + reveal source ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  var buttons = document.querySelectorAll(".copy-tex");
  buttons.forEach(function (btn) {
    var fig = btn.closest(".eq-block");
    var tex = btn.getAttribute("data-tex") || "";

    // Inject a hidden <pre> showing the source, toggled on first copy.
    var source = document.createElement("pre");
    source.className = "tex-source";
    source.textContent = tex;
    fig.appendChild(source);

    var doneTimer = null;
    btn.addEventListener("click", function () {
      copyText(tex).then(
        function () {
          fig.classList.add("show-tex");
          btn.classList.add("is-done");
          var label = btn.lastChild;
          var prev = btn.textContent;
          btn.innerHTML =
            '<span class="copy-ico" aria-hidden="true">&#10003;</span> Copied';
          toast("LaTeX copied to clipboard");
          clearTimeout(doneTimer);
          doneTimer = setTimeout(function () {
            btn.classList.remove("is-done");
            btn.innerHTML =
              '<span class="copy-ico" aria-hidden="true">&#9112;</span> Copy LaTeX';
          }, 1600);
        },
        function () {
          fig.classList.add("show-tex");
          toast("Copy failed — source revealed below");
        }
      );
    });
  });

  /* ---------- Hover an equation block highlights matching inline refs ---------- */
  var blocks = document.querySelectorAll(".eq-block");
  blocks.forEach(function (block) {
    var id = block.id;
    var matching = document.querySelectorAll('.eqref[data-target="' + id + '"]');
    block.addEventListener("mouseenter", function () {
      matching.forEach(function (m) {
        m.style.background = "var(--accent)";
        m.style.color = "#fff";
      });
    });
    block.addEventListener("mouseleave", function () {
      matching.forEach(function (m) {
        m.style.background = "";
        m.style.color = "";
      });
    });
  });
})();
