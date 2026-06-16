(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- download buttons ---------- */
  document.querySelectorAll(".dl[data-fmt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var fmt = btn.getAttribute("data-fmt");
      toast("Preparing " + fmt + " — download would start now");
    });
  });

  /* ---------- version dropdown ---------- */
  var verBtn = document.getElementById("verBtn");
  var verMenu = document.getElementById("verMenu");
  var verCurrent = document.getElementById("verCurrent");
  var revisedDate = document.getElementById("revisedDate");
  var crumbId = document.getElementById("crumbId");
  var verItems = Array.prototype.slice.call(verMenu.querySelectorAll("li"));

  function openMenu() {
    verMenu.hidden = false;
    verBtn.setAttribute("aria-expanded", "true");
    var sel = verMenu.querySelector('[aria-selected="true"]') || verItems[0];
    focusItem(verItems.indexOf(sel));
  }
  function closeMenu(focusBtn) {
    verMenu.hidden = true;
    verBtn.setAttribute("aria-expanded", "false");
    verItems.forEach(function (i) {
      i.classList.remove("focus");
    });
    if (focusBtn) verBtn.focus();
  }
  function focusItem(idx) {
    verItems.forEach(function (i) {
      i.classList.remove("focus");
    });
    if (idx < 0) idx = verItems.length - 1;
    if (idx >= verItems.length) idx = 0;
    verItems[idx].classList.add("focus");
    verItems[idx].focus();
  }
  function selectVersion(li) {
    verItems.forEach(function (i) {
      i.setAttribute("aria-selected", "false");
    });
    li.setAttribute("aria-selected", "true");
    var ver = li.getAttribute("data-ver");
    verCurrent.textContent = ver;
    crumbId.textContent = "arXiv:2606.01234" + ver;
    if (ver === "v1") {
      revisedDate.textContent = "—";
    } else {
      revisedDate.textContent = li.getAttribute("data-date");
    }
    toast("Now viewing version " + ver);
    closeMenu(true);
  }

  verBtn.addEventListener("click", function () {
    if (verMenu.hidden) openMenu();
    else closeMenu(true);
  });
  verBtn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  });
  verItems.forEach(function (li, idx) {
    li.addEventListener("click", function () {
      selectVersion(li);
    });
    li.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusItem(idx + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusItem(idx - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectVersion(li);
      } else if (e.key === "Escape") {
        closeMenu(true);
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (!verMenu.hidden && !e.target.closest(".ver-control")) closeMenu(false);
  });

  /* ---------- cite toggle ---------- */
  var citeBtn = document.getElementById("citeBtn");
  var citePanel = document.getElementById("citePanel");
  citeBtn.addEventListener("click", function () {
    var open = citePanel.hidden;
    citePanel.hidden = !open;
    citeBtn.setAttribute("aria-expanded", String(open));
    if (open) citePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* ---------- copy bibtex ---------- */
  var copyBtn = document.getElementById("copyBib");
  var copyLabel = document.getElementById("copyLabel");
  var bibtex = document.getElementById("bibtex");
  copyBtn.addEventListener("click", function () {
    var text = bibtex.innerText;
    var done = function () {
      copyBtn.classList.add("done");
      copyLabel.textContent = "Copied";
      toast("BibTeX copied to clipboard");
      setTimeout(function () {
        copyBtn.classList.remove("done");
        copyLabel.textContent = "Copy";
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        toast("Copy failed — select the text manually");
      }
      document.body.removeChild(ta);
    }
  });

  /* ---------- tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = {
    "tab-refs": "panel-refs",
    "tab-cited": "panel-cited",
    "tab-comments": "panel-comments",
  };
  function activate(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(panels[t.id]).hidden = !on;
    });
  }
  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () {
      activate(tab);
    });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
      if (next) {
        e.preventDefault();
        activate(next);
        next.focus();
      }
    });
  });
})();
